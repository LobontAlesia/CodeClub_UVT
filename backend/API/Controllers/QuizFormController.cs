using API.Entities;
using API.Models;
using API.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Constants;

namespace API.Controllers;

[Route("[controller]")]
[ApiController]
public class QuizFormController(
    IQuizFormRepository quizFormRepository,
    IChapterRepository chapterRepository,
    IChapterElementRepository chapterElementRepository
) : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Guid>> CreateQuiz([FromBody] QuizFormInputModel model)
    {
        try
        {
            // Caută capitolul după ID
            var chapter = await chapterRepository.GetByIdAsync(model.ChapterId);
            if (chapter == null)
            {
                return NotFound("Chapter not found");
            }

            // Creăm quiz-ul și mapăm manual întrebările
            var quizForm = new QuizForm
            {
                Id = Guid.NewGuid(),
                Title = model.Title,
                Questions = model.Questions.Select(q => new QuizQuestion
                {
                    Id = Guid.NewGuid(),
                    QuestionText = q.QuestionText,
                    Answer1 = q.Answer1,
                    Answer2 = q.Answer2,
                    Answer3 = q.Answer3,
                    Answer4 = q.Answer4,
                    CorrectAnswerIndex = q.CorrectAnswerIndex
                }).ToList()
            };

            // Salvăm quiz-ul
            var savedQuiz = await quizFormRepository.CreateAsync(quizForm);
            if (savedQuiz == null)
            {
                return StatusCode(500, "Failed to create quiz");
            }

            // Creăm un ChapterElement care conține acest Quiz
            var element = new ChapterElement
            {
                Id = Guid.NewGuid(),
                Title = model.Title,
                Type = ChapterElementTypes.Form,
                Index = chapter.Elements?.Count + 1 ?? 1,
                ChapterId = chapter.Id,
                FormId = quizForm.Id
            };

            var savedElement = await chapterElementRepository.CreateAsync(element);
            if (savedElement == null)
            {
                // Cleanup - ștergem quiz-ul dacă elementul nu poate fi creat
                await quizFormRepository.DeleteAsync(quizForm);
                return StatusCode(500, "Failed to create chapter element");
            }

            return Ok(quizForm.Id);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Failed to create quiz: {ex.Message}");
        }
    }
    
    [HttpPut("{formId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateQuiz([FromRoute] Guid formId, [FromBody] QuizForm updatedQuiz)
    {
        try
        {
            var existingQuiz = await quizFormRepository.GetByIdWithQuestionsAsync(formId);
            if (existingQuiz == null)
            {
                return NotFound("Quiz not found");
            }

            // Update the title
            existingQuiz.Title = updatedQuiz.Title;

            // Update questions - need to map them properly to maintain IDs
            foreach (var question in updatedQuiz.Questions)
            {
                var existingQuestion = existingQuiz.Questions.FirstOrDefault(q => q.Id == question.Id);
                if (existingQuestion != null)
                {
                    // Update existing question
                    existingQuestion.QuestionText = question.QuestionText;
                    existingQuestion.Answer1 = question.Answer1;
                    existingQuestion.Answer2 = question.Answer2;
                    existingQuestion.Answer3 = question.Answer3;
                    existingQuestion.Answer4 = question.Answer4;
                    existingQuestion.CorrectAnswerIndex = question.CorrectAnswerIndex;
                }
            }

            await quizFormRepository.UpdateAsync(existingQuiz);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Failed to update quiz: {ex.Message}");
        }
    }

    [HttpGet("{formId}")]
    public async Task<ActionResult<QuizForm>> GetQuiz([FromRoute] Guid formId)
    {
        var quiz = await quizFormRepository.GetByIdWithQuestionsAsync(formId);
        if (quiz == null)
        {
            return NotFound("Quiz not found");
        }
        return Ok(quiz);
    }
}
