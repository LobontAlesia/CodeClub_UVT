using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
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

        public OpenAIHelper(IConfiguration configuration, ILogger<OpenAIHelper> logger, HttpClient httpClient = null)
        {
            _logger = logger;
            _httpClient = httpClient ?? new HttpClient();

            // Folosim Ollama local — nu e nevoie de apiKey
            _baseUrl = configuration["OpenAI:BaseUrl"] ?? "http://localhost:11434/v1";
            _defaultModel = configuration["OpenAI:DefaultModel"] ?? "phi3:mini";
            
            // Verifică dacă suntem în modul de test
            _isTestMode = configuration.GetValue<bool>("OpenAI:TestMode");
            
            // Mărim timeout-ul pentru a evita timeout-uri cu modele mari
            _httpClient.Timeout = TimeSpan.FromMinutes(3); // 3 minute

            _logger.LogInformation("OpenAIHelper initialized for Ollama with default model: {DefaultModel}, TestMode: {TestMode}", 
                _defaultModel, _isTestMode);
        }

        public async Task<string> GenerateResponseAsync(string prompt, string model = null)
        {
            try
            {
                var modelToUse = string.IsNullOrEmpty(model) ? _defaultModel : model;
                var endpoint = $"{_baseUrl}/chat/completions";

                var requestData = new
                {
                    model = modelToUse,
                    messages = new[]
                    {
                        new { role = "user", content = prompt }
                    },
                    temperature = 0.7
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(requestData),
                    Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.PostAsync(endpoint, content);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseObject = JsonSerializer.Deserialize<OpenAIResponseModel>(responseContent);

                return responseObject?.Choices?.FirstOrDefault()?.Message?.Content ?? "";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating response from Ollama");
                throw;
            }
        }
        
        /// <summary>
        /// Generează întrebări de quiz pe baza conținutului capitolului
        /// </summary>
        /// <param name="chapterContent">Conținutul capitolului</param>
        /// <param name="model">Modelul Ollama de folosit (opțional)</param>
        /// <returns>Lista de întrebări generate</returns>
        public async Task<List<GeneratedQuizQuestion>> GenerateQuizQuestions(string chapterContent, string model = null)
        {
            try
            {
                _logger.LogInformation("Generating quiz questions based on chapter content of length: {Length}", 
                    chapterContent.Length);
                
                // Verificare dacă încercarea anterioară a eșuat și trebuie să folosim fallback direct
                if (_isTestMode)
                {
                    _logger.LogWarning("Running in test mode - returning mock quiz questions");
                    return GenerateFallbackQuestions(chapterContent);
                }
                
                // Înlocuim formatul anterior care folosea string.Format cu concatenare simplă
                // pentru a evita eroarea de format cu textul din chapterContent
                var promptPrefix = @"
Creează un quiz cu O SINGURĂ întrebare cu variante multiple pe baza următorului conținut. 
Întrebarea trebuie să aibă 4 variante de răspuns, din care doar una corectă.
Răspunsul trebuie să fie în format JSON, cu următoarea structură:
[
  {
    ""question"": ""Textul întrebării"",
    ""answers"": [""Răspuns 1"", ""Răspuns 2"", ""Răspuns 3"", ""Răspuns 4""],
    ""correctAnswerIndex"": 0
  }
]
Conținutul:
---
";

                var promptSuffix = @"
---
Răspunde doar cu JSON-ul, fără alte explicații.";

                // Evităm string.Format și folosim concatenare directă
                var prompt = promptPrefix + chapterContent + promptSuffix;
                
                // Trunchiază prompt-ul dacă e prea lung (peste 4000 caractere)
                if (prompt.Length > 4000)
                {
                    prompt = prompt.Substring(0, 4000 - 5) + "...]";
                    _logger.LogWarning("Prompt was truncated to 4000 characters");
                }
                
                try 
                {
                    // Încercăm să obținem răspunsul de la model
                    var jsonResponse = await GenerateResponseAsync(prompt, model);
                    
                    // Verificăm dacă avem un răspuns valid
                    if (string.IsNullOrWhiteSpace(jsonResponse))
                    {
                        _logger.LogWarning("Empty response from Ollama - using fallback questions");
                        return GenerateFallbackQuestions(chapterContent);
                    }
                    
                    try
                    {
                        // Definim un adaptor local pentru a gestiona diferența între fields
                        var options = new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        };
                        
                        // Clasa adaptoare pentru conversia JSON-ului din Ollama
                        var jsonQuestions = JsonSerializer.Deserialize<List<OllamaQuizQuestion>>(jsonResponse, options);
                        
                        // Convertim în modelul nostru
                        var questions = jsonQuestions?.Select(q => new GeneratedQuizQuestion
                        {
                            Question = q.Question,
                            Options = q.Answers ?? new List<string>(),
                            CorrectAnswerIndex = q.CorrectAnswerIndex
                        }).ToList() ?? new List<GeneratedQuizQuestion>();
                        
                        if (questions.Count > 0)
                        {
                            _logger.LogInformation("Successfully generated {Count} quiz questions", questions.Count);
                            return questions;
                        }
                        
                        throw new JsonException("Invalid response format");
                    }
                    catch (JsonException ex)
                    {
                        _logger.LogWarning(ex, "Error parsing JSON response. Attempting to extract JSON from the text response.");
                        
                        // Încercăm să extragem JSON-ul din răspuns
                        var startIndex = jsonResponse.IndexOf('[');
                        var endIndex = jsonResponse.LastIndexOf(']');
                        
                        if (startIndex >= 0 && endIndex > startIndex)
                        {
                            var jsonPart = jsonResponse.Substring(startIndex, endIndex - startIndex + 1);
                            
                            try
                            {
                                var options = new JsonSerializerOptions
                                {
                                    PropertyNameCaseInsensitive = true
                                };
                                
                                var jsonQuestions = JsonSerializer.Deserialize<List<OllamaQuizQuestion>>(jsonPart, options);
                                
                                var questions = jsonQuestions?.Select(q => new GeneratedQuizQuestion
                                {
                                    Question = q.Question,
                                    Options = q.Answers ?? new List<string>(),
                                    CorrectAnswerIndex = q.CorrectAnswerIndex
                                }).ToList() ?? new List<GeneratedQuizQuestion>();
                                
                                if (questions.Count > 0)
                                {
                                    _logger.LogInformation("Successfully extracted and parsed {Count} quiz questions", questions.Count);
                                    return questions;
                                }
                            }
                            catch (Exception innerEx)
                            {
                                _logger.LogError(innerEx, "Failed to parse extracted JSON");
                            }
                        }
                        
                        _logger.LogWarning("Could not parse JSON response - using fallback questions");
                        return GenerateFallbackQuestions(chapterContent);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error calling Ollama API - using fallback questions");
                    return GenerateFallbackQuestions(chapterContent);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating quiz questions from Ollama");
                throw new InvalidOperationException("Failed to generate quiz questions", ex);
            }
        }

        /// <summary>
        /// Generează întrebări predefinite când Ollama nu funcționează corect
        /// </summary>
        private List<GeneratedQuizQuestion> GenerateFallbackQuestions(string content)
        {
            // Extrage câteva cuvinte cheie din conținut pentru a personaliza întrebările
            var keywords = ExtractKeywords(content);
            
            // Creează o întrebare de quiz bazată pe conținut și cuvinte cheie
            var question = CreateBasicQuestion(content, keywords);
            
            _logger.LogInformation("Generated fallback quiz question");
            return new List<GeneratedQuizQuestion> { question };
        }

        /// <summary>
        /// Extrage cuvinte cheie din conținut pentru a personaliza întrebările
        /// </summary>
        private List<string> ExtractKeywords(string content)
        {
            // Simplificăm extragerea cuvintelor cheie - căutăm cuvinte din titluri sau paragrafe
            var keywords = new List<string>();
            
            // Împărțim conținutul în linii și căutăm titluri sau termeni importanți
            var lines = content.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
            
            foreach (var line in lines)
            {
                var trimmedLine = line.Trim();
                
                // Adăugăm liniile scurte care pot fi titluri
                if (trimmedLine.Length > 0 && trimmedLine.Length < 50 && !trimmedLine.StartsWith("```") && !trimmedLine.EndsWith("```"))
                {
                    keywords.Add(trimmedLine);
                }
                
                // Extrage termeni din cod pentru întrebări despre programare
                if (trimmedLine.Contains("def ") && trimmedLine.Contains("(") && trimmedLine.Contains(")"))
                {
                    keywords.Add(trimmedLine.Trim());
                }
            }
            
            // Limităm numărul de cuvinte cheie
            return keywords.Take(5).ToList();
        }

        /// <summary>
        /// Creează o întrebare de bază despre conținut folosind cuvinte cheie
        /// </summary>
        private GeneratedQuizQuestion CreateBasicQuestion(string content, List<string> keywords)
        {
            // Verificăm conținutul pentru a determina tipul de întrebare
            var isPython = content.Contains("def ") || content.Contains("import ") || content.Contains("print(");
            
            // Generam o întrebare în funcție de conținut
            if (isPython)
            {
                // Întrebare despre Python
                return new GeneratedQuizQuestion
                {
                    Question = "Care este scopul principal al funcțiilor în Python?",
                    Options = new List<string>
                    {
                        "Organizarea și reutilizarea codului",
                        "Creșterea vitezei de execuție a programului",
                        "Reducerea dimensiunii fișierelor Python",
                        "Ascunderea codului de alți utilizatori"
                    },
                    CorrectAnswerIndex = 0,
                    Explanation = "Funcțiile în Python permit organizarea codului în blocuri reutilizabile care pot fi apelate ori de câte ori este nevoie."
                };
            }
            
            // Întrebare generică de fallback
            return new GeneratedQuizQuestion
            {
                Question = "Ce reprezintă o funcție în programare?",
                Options = new List<string>
                {
                    "Un bloc de cod reutilizabil care execută o operație specifică",
                    "O variabilă care stochează valori multiple",
                    "O metodă de a comenta codul",
                    "Un tip special de buclă"
                },
                CorrectAnswerIndex = 0,
                Explanation = "Funcțiile sunt blocuri de cod reutilizabile care pot fi apelate pentru a executa operații specifice ori de câte ori este nevoie."
            };
        }
    }

    // MODELE DE RĂSPUNS (compatibile OpenAI/Ollama)
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
    
    // Clasă auxiliară pentru deserializarea răspunsului de la Ollama
    public class OllamaQuizQuestion
    {
        public string Question { get; set; } = string.Empty;
        public List<string> Answers { get; set; } = new();
        public int CorrectAnswerIndex { get; set; }
    }
    
}
