using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Utils;

namespace API.Controllers;

[Route("[controller]")]
[ApiController]
[Authorize]
public class QuizQuestionController : ControllerBase
{
    private readonly OpenAIHelper _openAIHelper;
    private readonly ILogger<QuizQuestionController> _logger;

    public QuizQuestionController(OpenAIHelper openAIHelper, ILogger<QuizQuestionController> logger)
    {
        _openAIHelper = openAIHelper;
        _logger = logger;
    }

    public class HintRequestModel
    {
        public string QuestionText { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new();
    }

    public class HintResponseModel
    {
        public string Hint { get; set; } = string.Empty;
    }

    [HttpPost("hint")]
    public async Task<ActionResult<HintResponseModel>> GetHint([FromBody] HintRequestModel request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.QuestionText) || request.Options.Count == 0)
            {
                return BadRequest("Question text and options are required");
            }

            _logger.LogInformation("Generating hint for question: {Question}", request.QuestionText);

            // Format the question and options for the AI
            var optionsText = string.Join("\n", request.Options.Select((option, index) => $"{index + 1}. {option}"));
              // Create a prompt for the AI
            var prompt = $@"
As an educational assistant, provide a helpful hint for the following multiple-choice question without revealing the answer directly.
The hint should guide the student toward understanding which option is correct.

QUESTION: {request.QuestionText}

OPTIONS:
{optionsText}

Give a concise, educational hint (max 2 sentences) that helps the student think about the correct answer without giving it away.
Respond ONLY with the hint text, no explanations or additional formatting.
Always respond in English, regardless of the language of the question.";

            // Call the OpenAI API to generate the hint
            var hintResponse = await _openAIHelper.GenerateResponseAsync(prompt);
            
            // Clean up the response - make sure we only get the hint
            string hint = hintResponse.Trim();
            
            // Log the result
            _logger.LogInformation("Generated hint: {Hint}", hint);

            return Ok(new HintResponseModel { Hint = hint });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating hint");
            return StatusCode(500, new { message = "Failed to generate hint", error = ex.Message });
        }
    }
}