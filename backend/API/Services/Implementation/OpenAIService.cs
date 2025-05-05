using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using API.Constants;
using Microsoft.Extensions.Configuration;

namespace API.Services
{
    public class OpenAIService
    {
        private readonly string _apiKey;
        private readonly string _model;
        private readonly string _baseUrl;

        public OpenAIService(IConfiguration configuration)
        {
            _baseUrl = configuration["OPENAI_BASE_URL"] ?? "https://api.openai.com/v1";
            _model = configuration["OPENAI_MODEL"] ?? "gpt-3.5-turbo";
            _apiKey = configuration["OPENAI_API_KEY"] ?? throw new ArgumentNullException("OPENAI_API_KEY");
        }

        /// <summary>
        /// Trimite un prompt către OpenAI pentru a genera un quiz în format JSON.
        /// </summary>
        /// <param name="content">Textul / conținutul pe baza căruia se generează quiz-ul.</param>
        /// <returns>JSON-ul cu întrebările și opțiunile.</returns>
        public async Task<string> GetQuizJsonAsync(string content)
        {
            using var httpClient = new HttpClient();
            
            httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _apiKey);

            // Construim prompt-ul
            var prompt = @$"
Te rog să generezi un quiz pe baza următorului conținut:
{content}

Formatul răspunsului să fie exact JSON cu următoarea structură:
[
    {{
        ""question"": ""string"",
        ""options"": [""optiune1"", ""optiune2"", ""optiune3"", ""optiune4""],
        ""correctAnswerIndex"": 0,
        ""explanation"": ""string (explicație de ce răspunsul corect este corect)""
    }},
    …
]

Generează 3-5 întrebări. Fiecare întrebare trebuie să aibă 4 opțiuni.
";

            // Pregătim corpul cererii
            var requestBody = new
            {
                model = _model,
                messages = new[]
                {
                    new { role = "user", content = prompt }
                },
                temperature = 0.3
            };

            var json = JsonSerializer.Serialize(requestBody);
            using var contentData = new StringContent(json, Encoding.UTF8, "application/json");

            // Construim endpoint-ul complet
            var endpoint = $"{_baseUrl}/chat/completions";

            // Trimitem cererea
            var response = await httpClient.PostAsync(endpoint, contentData);
            response.EnsureSuccessStatusCode();

            // Citim răspunsul
            var responseString = await response.Content.ReadAsStringAsync();

            // Extragem conținutul efectiv al mesajului Chat
            using JsonDocument doc = JsonDocument.Parse(responseString);
            var reply = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            if (string.IsNullOrWhiteSpace(reply))
                throw new Exception("OpenAI a răspuns cu un conținut gol.");

            return reply;
        }
    }
}