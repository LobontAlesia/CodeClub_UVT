using API.Entities;
using API.Models;
using API.Repositories;
using API.Utils;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace API.Services.Implementation;

public class ChapterService : IChapterService
{
    private readonly IChapterRepository _chapterRepository;
    private readonly PostgresDbContext _context;
    private readonly OpenAIHelper _openAIHelper;

    public ChapterService(
        IChapterRepository chapterRepository, 
        PostgresDbContext context,
        OpenAIHelper openAIHelper)
    {
        _chapterRepository = chapterRepository;
        _context = context;
        _openAIHelper = openAIHelper;
    }

    public async Task<List<GeneratedQuizQuestion>> GenerateQuizWithAI(Guid chapterId)
    {
        var chapter = await _chapterRepository.GetByIdWithElementsAsync(chapterId);

        if (chapter == null)
            throw new KeyNotFoundException("Chapter not found.");

        var contentBuilder = new StringBuilder();
        bool hasContent = false;

        Console.WriteLine($"DEBUG: Found {chapter.Elements.Count} elements in chapter '{chapter.Title}'");

        foreach (var element in chapter.Elements.OrderBy(e => e.Index))
        {
            Console.WriteLine($"DEBUG: Element '{element.Title}' | Type: {element.Type} | Content length: {(element.Content != null ? element.Content.Length : 0)}");

            // Filtrăm doar tipurile relevante
            if ((element.Type == "Text" || element.Type == "Header" || element.Type == "CodeFragment")
                && !string.IsNullOrWhiteSpace(element.Content))
            {
                contentBuilder.AppendLine(element.Content);
                hasContent = true;
            }
        }

        var chapterContent = contentBuilder.ToString().Trim();

        Console.WriteLine($"DEBUG: Total chapter content length: {chapterContent.Length} characters");

        if (!hasContent || chapterContent.Length < 100)
            throw new InvalidOperationException("No sufficient content found in chapter to generate quiz.");

        try
        {
            // Utilizăm OpenAIHelper (acum conectat la Ollama) pentru generarea quiz-urilor
            var questions = await _openAIHelper.GenerateQuizQuestions(chapterContent);
            
            // Adaptăm răspunsul dacă este necesar
            // Acest cod se asigură că răspunsul respectă formatul GeneratedQuizQuestion
            foreach (var question in questions)
            {
                // În cazul în care modelul Ollama returnează "answers" în loc de "options" 
                // (aceasta ar fi deja gestionată în OpenAIHelper, dar adăugăm o verificare suplimentară)
                if (question.Options == null || !question.Options.Any())
                {
                    question.Options = new List<string>{"Opțiune lipsă"};
                    question.CorrectAnswerIndex = 0;
                }
                
                // Asigură-te că indexul corect este valid
                if (question.CorrectAnswerIndex < 0 || question.CorrectAnswerIndex >= question.Options.Count)
                {
                    question.CorrectAnswerIndex = 0;
                }
            }

            Console.WriteLine($"DEBUG: Generated {questions.Count} quiz questions using Ollama.");

            return questions;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERROR: Failed to generate quiz questions: {ex.Message}");
            throw new InvalidOperationException("Failed to generate quiz questions", ex);
        }
    }
}