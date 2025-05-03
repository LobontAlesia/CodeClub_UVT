using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using API.Models;

namespace API.Services
{
    public class OpenAIService
    {
        private readonly string _apiKey;
        private readonly string _model;

        public OpenAIService(IConfiguration configuration)
        {
            _apiKey = configuration["OpenAI:ApiKey"] ?? throw new ArgumentNullException("OpenAI ApiKey missing");
            _model = configuration["OpenAI:Model"] ?? "gpt-4";
        }

        public async Task<string> GetQuizJsonAsync(string content)
        {
            using var httpClient = new HttpClient();

            httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _apiKey);

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
    ...
]

Generează 3-5 întrebări. Fiecare întrebare trebuie să aibă 4 opțiuni.
";

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
            var contentData = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync("https://api.openai.com/v1/chat/completions", contentData);
            response.EnsureSuccessStatusCode();

            var responseString = await response.Content.ReadAsStringAsync();

            using JsonDocument doc = JsonDocument.Parse(responseString);
            var reply = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return reply ?? throw new Exception("Nu am primit răspuns de la OpenAI");
        }
    }
}
