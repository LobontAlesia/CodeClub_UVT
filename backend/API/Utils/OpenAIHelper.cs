using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using API.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace API.Utils
{
    public class OpenAIHelper
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<OpenAIHelper> _logger;
        private readonly string _baseUrl;
        private readonly string _defaultModel;
        private readonly bool _isTestMode;
        private readonly string _apiKey;

        public OpenAIHelper(IConfiguration configuration, ILogger<OpenAIHelper> logger, HttpClient? httpClient = null)
        {
            _logger = logger;
            _httpClient = httpClient ?? new HttpClient();

            _baseUrl = configuration["OPENAI_BASE_URL"] ?? "https://api.openai.com/v1";
            _defaultModel = configuration["OPENAI_MODEL"] ?? "gpt-3.5-turbo";
            _apiKey = configuration["OPENAI_API_KEY"] ?? throw new ArgumentNullException("OPENAI_API_KEY");
            _isTestMode = configuration.GetValue<bool>("OpenAI:TestMode");

            _httpClient.Timeout = TimeSpan.FromMinutes(3);

            _logger.LogInformation("OpenAIHelper initialized with model: {DefaultModel}, TestMode: {TestMode}",
                _defaultModel, _isTestMode);
        }

        public async Task<string> GenerateResponseAsync(string prompt, string? model = null)
        {
            try
            {
                var modelToUse = string.IsNullOrEmpty(model) ? _defaultModel : model;
                var endpoint = $"{_baseUrl}/chat/completions";

                // Adăugăm header-ul de autorizare cu API key-ul
                if (_httpClient.DefaultRequestHeaders.Authorization == null)
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
                }

                var requestData = new
                {
                    model = modelToUse,
                    messages = new[]
                    {
                        new { role = "system", content = "Ești un asistent specializat în crearea de quiz-uri educaționale. Răspunde doar cu JSON structurat conform instrucțiunilor." },
                        new { role = "user", content = prompt }
                    },
                    temperature = 0.3,  // Valoare redusă pentru consistență
                    max_tokens = 2000   // Asigură suficient spațiu pentru răspuns
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(requestData),
                    Encoding.UTF8,
                    "application/json"
                );

                Console.WriteLine($"DEBUG: Sending request to OpenAI with model {modelToUse}");
                var response = await _httpClient.PostAsync(endpoint, content);
                
                // Citim răspunsul indiferent de statusul cererii pentru a-l loga
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"ERROR: OpenAI API error: Status Code: {response.StatusCode}");
                    Console.WriteLine($"ERROR: Response: {responseContent}");
                    _logger.LogError("OpenAI API error: Status Code: {StatusCode} - Response: {@Response}", 
                        response.StatusCode, responseContent);
                    throw new HttpRequestException($"OpenAI API returned status code: {response.StatusCode}. Message: {responseContent}");
                }

                Console.WriteLine($"DEBUG: Response received from OpenAI. Status: {response.StatusCode}");
                
                try 
                {
                    // BUG FIX: Returnăm direct conținutul răspunsului din choices
                    using (var doc = JsonDocument.Parse(responseContent))
                    {
                        if (doc.RootElement.TryGetProperty("choices", out var choices) && 
                            choices.GetArrayLength() > 0 &&
                            choices[0].TryGetProperty("message", out var message) &&
                            message.TryGetProperty("content", out var contentProperty))
                        {
                            var textResponse = contentProperty.GetString() ?? "";
                            
                            if (string.IsNullOrEmpty(textResponse))
                            {
                                Console.WriteLine($"DEBUG: EMPTY RESPONSE FROM OPENAI. Full response:");
                                Console.WriteLine(responseContent);
                                _logger.LogWarning("Empty content from OpenAI. Full response: {@Response}", responseContent);
                            }
                            else 
                            {
                                Console.WriteLine($"DEBUG: OpenAI generated content (length: {textResponse.Length} chars):");
                                Console.WriteLine("===== GENERATED CONTENT BEGIN =====");
                                Console.WriteLine(textResponse);
                                Console.WriteLine("===== GENERATED CONTENT END =====");
                                _logger.LogDebug("Extracted content length: {Length} chars", textResponse.Length);
                            }
                            
                            return textResponse;
                        }
                        else
                        {
                            Console.WriteLine($"ERROR: Could not extract content from OpenAI response: {responseContent}");
                            _logger.LogError("Could not extract content from OpenAI response: {Response}", responseContent);
                            return "";
                        }
                    }
                }
                catch (JsonException jsonEx)
                {
                    Console.WriteLine($"ERROR: Failed to deserialize OpenAI response: {jsonEx.Message}");
                    Console.WriteLine($"ERROR: Raw response: {responseContent}");
                    _logger.LogError(jsonEx, "Failed to deserialize OpenAI response. Raw response: {Response}", responseContent);
                    throw;
                }
            }
            catch (HttpRequestException httpEx)
            {
                Console.WriteLine($"ERROR: HTTP request error when calling OpenAI: {httpEx.Message}");
                _logger.LogError(httpEx, "HTTP request error when calling OpenAI: {Message}", httpEx.Message);
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR: Unexpected error when calling OpenAI: {ex.Message}");
                _logger.LogError(ex, "Unexpected error generating response from OpenAI: {Message}", ex.Message);
                throw;
            }
        }
        
        /// <summary>
        /// Generează întrebări de quiz pe baza conținutului capitolului
        /// </summary>
        public async Task<List<GeneratedQuizQuestion>> GenerateQuizQuestions(string chapterContent, string? model = null)
        {
            try
            {
                Console.WriteLine($"DEBUG: Generating quiz questions based on chapter content (length: {chapterContent.Length})");
                _logger.LogInformation("Generating quiz questions based on chapter content length: {Length}", 
                    chapterContent.Length);
                
                // Verificare dacă încercarea anterioară a eșuat și trebuie să folosim fallback direct
                if (_isTestMode)
                {
                    Console.WriteLine("DEBUG: Running in test mode - returning mock quiz questions");
                    _logger.LogWarning("Running in test mode - returning mock quiz questions");
                    return GenerateFallbackQuestions(chapterContent);
                }
                
                // Prompt optimizat pentru OpenAI - cerem în mod explicit în engleză pentru simplificare
                var promptPrefix = @"
Create a quiz with multiple choice questions based on the following content.
Generate between 1 and 3 questions with multiple choice answers.
Each question should have 4 answer options, with only one correct answer.

Please respond ONLY with valid JSON content, using the following structure:
[
  {
    ""question"": ""Question text"",
    ""answers"": [""Answer 1"", ""Answer 2"", ""Answer 3"", ""Answer 4""],
    ""correctAnswerIndex"": 0
  }
]

Content to evaluate:
-------------------------
";

                var promptSuffix = @"
-------------------------
Make sure to respond ONLY with valid JSON, without any explanations. Your response should start with [ and end with ].";

                // Evităm string.Format și folosim concatenare directă
                var prompt = promptPrefix + chapterContent + promptSuffix;
                
                // Trunchiază prompt-ul dacă e prea lung
                if (prompt.Length > 4000)
                {
                    prompt = prompt.Substring(0, 4000 - 5) + "...]";
                    Console.WriteLine("DEBUG: Prompt was truncated to 4000 characters");
                    _logger.LogWarning("Prompt was truncated to 4000 characters");
                }
                
                try 
                {
                    // Încercăm să obținem răspunsul de la model
                    Console.WriteLine("DEBUG: Calling GenerateResponseAsync with OpenAI...");
                    var jsonResponse = await GenerateResponseAsync(prompt, model);
                    
                    // Verificăm dacă avem un răspuns valid
                    if (string.IsNullOrWhiteSpace(jsonResponse))
                    {
                        Console.WriteLine("DEBUG: Empty response from OpenAI - using fallback questions");
                        _logger.LogWarning("Empty response. Using fallback.");
                        return GenerateFallbackQuestions(chapterContent);
                    }

                    // Logăm răspunsul pentru debugging - adăugat pentru diagnosticare
                    Console.WriteLine($"DEBUG: Raw JSON response received from OpenAI (length: {jsonResponse.Length}):");
                    Console.WriteLine(jsonResponse);
                    
                    // SOLUȚIE SIMPLIFICATĂ: Încearcă să extragă direct JSON din răspuns
                    try
                    {
                        // Găsește începutul și sfârșitul array-ului JSON
                        int startIndex = jsonResponse.IndexOf('[');
                        int endIndex = jsonResponse.LastIndexOf(']');
                        
                        if (startIndex >= 0 && endIndex > startIndex)
                        {
                            // Extrage array-ul JSON
                            string jsonArray = jsonResponse.Substring(startIndex, endIndex - startIndex + 1);
                            
                            // Curăță formatul, înlocuiește newline-uri
                            jsonArray = jsonArray.Replace("\n", " ").Replace("\r", " ");
                            while (jsonArray.Contains("  "))
                                jsonArray = jsonArray.Replace("  ", " ");
                            
                            Console.WriteLine($"DEBUG: Extracted JSON array (length: {jsonArray.Length}):");
                            Console.WriteLine(jsonArray);
                            
                            // Deserializează și creează lista de întrebări direct
                            var questions = new List<GeneratedQuizQuestion>();
                            
                            try 
                            {
                                // Încercăm să convertim fiecare obiect individual
                                var jsonDoc = JsonDocument.Parse(jsonArray);
                                Console.WriteLine($"DEBUG: Successfully parsed JSON document with {jsonDoc.RootElement.GetArrayLength()} elements");
                                
                                foreach (var element in jsonDoc.RootElement.EnumerateArray())
                                {
                                    try
                                    {
                                        string question = element.GetProperty("question").GetString() ?? "";
                                        var answers = new List<string>();
                                        
                                        var answersElement = element.GetProperty("answers");
                                        foreach (var answerElement in answersElement.EnumerateArray())
                                        {
                                            answers.Add(answerElement.GetString() ?? "");
                                        }
                                        
                                        int correctIndex = element.GetProperty("correctAnswerIndex").GetInt32();
                                        
                                        Console.WriteLine($"DEBUG: Extracted question: '{question}' with {answers.Count} answers");
                                        
                                        if (!string.IsNullOrEmpty(question) && answers.Count > 0)
                                        {
                                            questions.Add(new GeneratedQuizQuestion
                                            {
                                                Question = question,
                                                Options = answers,
                                                CorrectAnswerIndex = correctIndex
                                            });
                                        }
                                    }
                                    catch (Exception elemEx)
                                    {
                                        Console.WriteLine($"ERROR: Failed to parse individual question element: {elemEx.Message}");
                                        _logger.LogWarning(elemEx, "Failed to parse individual question element");
                                    }
                                }
                                
                                if (questions.Count > 0)
                                {
                                    Console.WriteLine($"DEBUG: Successfully extracted {questions.Count} quiz questions with JsonDocument");
                                    _logger.LogInformation("Successfully extracted {Count} quiz questions with JsonDocument", questions.Count);
                                    return questions;
                                }
                                else
                                {
                                    Console.WriteLine("DEBUG: No questions were extracted from the JSON");
                                }
                            }
                            catch (Exception jsonEx)
                            {
                                Console.WriteLine($"ERROR: Failed to parse JSON with JsonDocument: {jsonEx.Message}");
                                _logger.LogWarning(jsonEx, "Failed to parse JSON with JsonDocument, trying alternative method");
                            }
                        }
                        else
                        {
                            Console.WriteLine($"DEBUG: Could not find JSON array in response. Start index: {startIndex}, End index: {endIndex}");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"ERROR: Error parsing JSON array from OpenAI response: {ex.Message}");
                        _logger.LogWarning(ex, "Error parsing JSON array from OpenAI response");
                    }
                    
                    // Dacă prima încercare nu a funcționat, folosim metoda cu regex
                    Console.WriteLine("DEBUG: Trying regex extraction as fallback...");
                    var extractedQuestions = ExtractQuestionsUsingRegex(jsonResponse);
                    if (extractedQuestions.Count > 0)
                    {
                        Console.WriteLine($"DEBUG: Successfully extracted {extractedQuestions.Count} questions using regex extraction");
                        return extractedQuestions;
                    }
                    
                    // Ultima șansă - folosim întrebările predefinite
                    Console.WriteLine("DEBUG: All extraction methods failed. Using fallback questions.");
                    _logger.LogWarning("Could not parse JSON response - using fallback questions");
                    return GenerateFallbackQuestions(chapterContent);
                }
                catch (HttpRequestException httpEx)
                {
                    Console.WriteLine($"ERROR: HTTP error calling OpenAI API: {httpEx.Message}");
                    _logger.LogError(httpEx, "HTTP error calling OpenAI API - Status: {Status} - using fallback questions", 
                        httpEx.Message);
                    return GenerateFallbackQuestions(chapterContent);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"ERROR: Error calling OpenAI API: {ex.Message}");
                    _logger.LogError(ex, "Error calling OpenAI API - using fallback questions: {Message}", ex.Message);
                    return GenerateFallbackQuestions(chapterContent);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR: Error generating quiz questions: {ex.Message}");
                _logger.LogError(ex, "Error generating quiz questions from OpenAI: {Message}", ex.Message);
                throw new InvalidOperationException("Failed to generate quiz questions", ex);
            }
        }

        private List<GeneratedQuizQuestion> GenerateFallbackQuestions(string content)
        {
            return new List<GeneratedQuizQuestion>
            {
                new GeneratedQuizQuestion
                {
                    Question = "Ce reprezintă principiul încapsulării în OOP?",
                    Options = new List<string>
                    {
                        "Ascunderea detaliilor interne și expunerea unei interfețe publice",
                        "Moștenirea comportamentului de la o altă clasă",
                        "Polimorfismul obiectelor",
                        "Crearea unor clase abstracte"
                    },
                    CorrectAnswerIndex = 0,
                    Explanation = "Încapsularea presupune ascunderea detaliilor de implementare și expunerea doar a funcționalității necesare."
                }
            };
        }

        private List<GeneratedQuizQuestion> ExtractQuestionsUsingRegex(string jsonResponse)
        {
            var questions = new List<GeneratedQuizQuestion>();
            var regex = new Regex(@"\{""question"":""(.*?)"",""answers"":\[(.*?)\],""correctAnswerIndex"":(\d+)\}");
            var matches = regex.Matches(jsonResponse);

            foreach (Match match in matches)
            {
                var question = match.Groups[1].Value;
                var answers = match.Groups[2].Value.Split(',').Select(a => a.Trim('"')).ToList();
                var correctAnswerIndex = int.Parse(match.Groups[3].Value);

                questions.Add(new GeneratedQuizQuestion
                {
                    Question = question,
                    Options = answers,
                    CorrectAnswerIndex = correctAnswerIndex
                });
            }

            return questions;
        }
    }

    // Modele pentru OpenAI
    public class OpenAIResponseModel
    {
        public List<OpenAIChoiceModel> Choices { get; set; } = new();
    }

    public class OpenAIChoiceModel
    {
        public OpenAIMessageModel Message { get; set; } = new();
    }

    public class OpenAIMessageModel
    {
        public string Content { get; set; } = "";
    }

    public class OllamaQuizQuestion
    {
        public string Question { get; set; } = string.Empty;
        public List<string> Answers { get; set; } = new();
        public int CorrectAnswerIndex { get; set; }
    }
}
