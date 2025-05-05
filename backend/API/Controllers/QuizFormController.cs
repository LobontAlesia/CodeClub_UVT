using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using API.Entities;
using API.Models;
using API.Repositories;
using API.Services;
using API.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class QuizFormController : ControllerBase
    {
        private readonly IQuizFormRepository _quizFormRepository;
        private readonly IChapterRepository _chapterRepository;
        private readonly IChapterElementRepository _chapterElementRepository;
        private readonly OpenAIService _openAiService;

        public QuizFormController(
            IQuizFormRepository quizFormRepository,
            IChapterRepository chapterRepository,
            IChapterElementRepository chapterElementRepository,
            OpenAIService openAiService)
        {
            _quizFormRepository = quizFormRepository;
            _chapterRepository = chapterRepository;
            _chapterElementRepository = chapterElementRepository;
            _openAiService = openAiService;
        }

        /// <summary>
        /// Creează un quiz pe baza întrebărilor furnizate în model.
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Guid>> CreateQuiz([FromBody] QuizFormInputModel model)
        {
            try
            {
                // Validare capitol
                var chapter = await _chapterRepository.GetByIdAsync(model.ChapterId);
                if (chapter == null)
                    return NotFound("Chapter not found");

                // Mapare manuală a întrebărilor din client
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

                // Salvare quiz
                var savedQuiz = await _quizFormRepository.CreateAsync(quizForm);
                if (savedQuiz == null)
                    return StatusCode(500, "Failed to create quiz");

                // Adăugare în capitol
                var element = new ChapterElement
                {
                    Id = Guid.NewGuid(),
                    Title = model.Title,
                    Type = ChapterElementTypes.Form,
                    Index = chapter.Elements?.Count + 1 ?? 1,
                    ChapterId = chapter.Id,
                    FormId = quizForm.Id
                };

                var savedElement = await _chapterElementRepository.CreateAsync(element);
                if (savedElement == null)
                {
                    await _quizFormRepository.DeleteAsync(quizForm);
                    return StatusCode(500, "Failed to create chapter element");
                }

                return Ok(quizForm.Id);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to create quiz: {ex.Message}");
            }
        }

        /// <summary>
        /// Creează un quiz nou automat, generând întrebările cu OpenAI.
        /// </summary>
        [HttpPost("ai")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Guid>> CreateQuizWithAI([FromBody] AiQuizRequestModel model)
        {
            try
            {
                // Validare capitol
                var chapter = await _chapterRepository.GetByIdAsync(model.ChapterId);
                if (chapter == null)
                    return NotFound("Chapter not found");

                // Obținem elementele capitolului și construim conținutul
                string chapterContent = "";
                
                if (chapter.Elements != null && chapter.Elements.Any())
                {
                    // Extragem conținutul din elementele de tip Text
                    var textElements = chapter.Elements.Where(e => e.Type == ChapterElementTypes.Text);
                    foreach (var textElement in textElements)
                    {
                        chapterContent += textElement.Content + "\n\n";
                    }
                }
                
                if (string.IsNullOrWhiteSpace(chapterContent))
                {
                    return BadRequest("No content found in chapter to generate questions");
                }

                // Folosim OpenAI pentru a genera JSON-ul cu întrebări
                var quizJson = await _openAiService.GetQuizJsonAsync(chapterContent);

                // Deserialize în modelul de input
                var generatedQuestions = JsonSerializer.Deserialize<List<QuizQuestionInputModel>>(quizJson)
                                         ?? new List<QuizQuestionInputModel>();

                // Construim entitatea QuizForm
                var quizForm = new QuizForm
                {
                    Id = Guid.NewGuid(),
                    Title = model.Title,
                    Questions = generatedQuestions.Select(q => new QuizQuestion
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

                // Salvăm quiz-ul generat
                var savedQuiz = await _quizFormRepository.CreateAsync(quizForm);
                if (savedQuiz == null)
                    return StatusCode(500, "Failed to create quiz");

                // Adăugăm elementul în capitol
                var element = new ChapterElement
                {
                    Id = Guid.NewGuid(),
                    Title = model.Title,
                    Type = ChapterElementTypes.Form,
                    Index = chapter.Elements?.Count + 1 ?? 1,
                    ChapterId = chapter.Id,
                    FormId = quizForm.Id
                };

                var savedElement = await _chapterElementRepository.CreateAsync(element);
                if (savedElement == null)
                {
                    await _quizFormRepository.DeleteAsync(quizForm);
                    return StatusCode(500, "Failed to create chapter element");
                }

                return Ok(quizForm.Id);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to create AI-generated quiz: {ex.Message}");
            }
        }

        /// <summary>
        /// Actualizează quiz-ul existent.
        /// </summary>
        [HttpPut("{formId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateQuiz([FromRoute] Guid formId, [FromBody] QuizForm updatedQuiz)
        {
            try
            {
                var existingQuiz = await _quizFormRepository.GetByIdWithQuestionsAsync(formId);
                if (existingQuiz == null)
                    return NotFound("Quiz not found");

                existingQuiz.Title = updatedQuiz.Title;

                foreach (var question in updatedQuiz.Questions)
                {
                    var existingQuestion = existingQuiz.Questions.FirstOrDefault(q => q.Id == question.Id);
                    if (existingQuestion != null)
                    {
                        existingQuestion.QuestionText = question.QuestionText;
                        existingQuestion.Answer1 = question.Answer1;
                        existingQuestion.Answer2 = question.Answer2;
                        existingQuestion.Answer3 = question.Answer3;
                        existingQuestion.Answer4 = question.Answer4;
                        existingQuestion.CorrectAnswerIndex = question.CorrectAnswerIndex;
                    }
                }

                await _quizFormRepository.UpdateAsync(existingQuiz);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to update quiz: {ex.Message}");
            }
        }

        /// <summary>
        /// Obține un quiz existent cu întrebări.
        /// </summary>
        [HttpGet("{formId}")]
        public async Task<ActionResult<QuizForm>> GetQuiz([FromRoute] Guid formId)
        {
            var quiz = await _quizFormRepository.GetByIdWithQuestionsAsync(formId);
            if (quiz == null)
                return NotFound("Quiz not found");

            return Ok(quiz);
        }
    }
}