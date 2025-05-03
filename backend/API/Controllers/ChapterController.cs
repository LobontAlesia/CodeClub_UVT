using API.Entities;
using API.Models;
using API.Repositories;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("[controller]")]
[ApiController]
public class ChapterController : ControllerBase
{
    private readonly IChapterRepository _chapterRepository;
    private readonly ILessonRepository _lessonRepository;
    private readonly IChapterService _chapterService;

    public ChapterController(
        IChapterRepository chapterRepository, 
        ILessonRepository lessonRepository,
        IChapterService chapterService)
    {
        _chapterRepository = chapterRepository;
        _lessonRepository = lessonRepository;
        _chapterService = chapterService;
    }

    [HttpGet("lesson/{lessonId}")]
    public async Task<ActionResult<List<Chapter>>> GetChaptersByLessonId([FromRoute] Guid lessonId)
    {
        var lesson = await _lessonRepository.GetByIdAsync(lessonId);
        if (lesson == null) return NotFound("Lesson not found");

        var chapters = lesson.Chapters
            .OrderBy(c => c.Index)
            .Select(c => new
            {
                id = c.Id,
                title = c.Title,
                index = c.Index,
                lessonId = c.LessonId
            })
            .ToList();

        return Ok(chapters);
    }

    [HttpGet("{chapterId}")]
    public async Task<ActionResult<Chapter>> GetChapterById([FromRoute] Guid chapterId)
    {
        var chapter = await _chapterRepository.GetByIdAsync(chapterId);
        if (chapter == null) return NotFound("Chapter not found");

        return Ok(new
        {
            id = chapter.Id,
            title = chapter.Title,
            index = chapter.Index,
            lessonId = chapter.LessonId
        });
    }

    [HttpGet("{chapterId}/elements")]
    public async Task<ActionResult> GetChapterElements([FromRoute] Guid chapterId)
    {
        var chapter = await _chapterRepository.GetByIdWithElementsAsync(chapterId);
        if (chapter == null) return NotFound("Chapter not found");

        return Ok(new
        {
            title = chapter.Title,
            elements = chapter.Elements.OrderBy(e => e.Index).Select(e => new
            {
                id = e.Id,
                title = e.Title,
                type = e.Type,
                index = e.Index,
                content = e.Content,
                image = e.Image,
                formId = e.FormId
            })
        });
    }

    [HttpGet("{chapterId}/hierarchy")]
    public async Task<ActionResult> GetChapterHierarchy([FromRoute] Guid chapterId)
    {
        var chapter = await _chapterRepository.GetByIdAsync(chapterId);
        if (chapter == null) 
            return NotFound("Chapter not found");

        var lesson = await _lessonRepository.GetByIdWithCourseAsync(chapter.LessonId);
        if (lesson == null)
            return NotFound("Lesson not found");

        return Ok(new {
            lessonId = lesson.Id,
            lessonTitle = lesson.Title,
            courseId = lesson.LearningCourse?.Id,
            courseTitle = lesson.LearningCourse?.Title
        });
    }

    [HttpPost("lesson/{lessonId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> CreateChapter([FromRoute] Guid lessonId, [FromBody] ChapterModel model)
    {
        try
        {
            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            if (lesson == null) return NotFound($"Lesson with ID {lessonId} not found");

            // Get max index from existing chapters
            var maxIndex = lesson.Chapters.Any() ? lesson.Chapters.Max(c => c.Index) : 0;

            var chapter = new Chapter
            {
                Id = Guid.NewGuid(),
                LessonId = lessonId,
                Title = model.Title,
                Index = maxIndex + 1, // Set index automatically
                Elements = new List<ChapterElement>()
            };

            await _chapterRepository.CreateAsync(chapter);

            lesson.Chapters ??= new List<Chapter>();
            lesson.Chapters.Add(chapter);
            await _lessonRepository.SaveChangesAsync();

            return Ok(chapter.Id);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Failed to create chapter: {ex.Message}");
        }
    }

    [HttpPut("{chapterId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateChapter([FromRoute] Guid chapterId, [FromBody] ChapterModel model)
    {
        var chapter = await _chapterRepository.GetByIdAsync(chapterId);
        if (chapter == null) return NotFound("Chapter not found");

        chapter.Title = model.Title;
        await _chapterRepository.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("{chapterId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteChapter([FromRoute] Guid chapterId)
    {
        var chapter = await _chapterRepository.GetByIdAsync(chapterId);
        if (chapter == null) return NotFound("Chapter not found");

        var result = await _chapterRepository.DeleteAsync(chapter);
        if (!result) return StatusCode(500, "Failed to delete the chapter");

        return Ok();
    }

    [HttpPut("lesson/{lessonId}/reorder")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ReorderChapters(Guid lessonId, [FromBody] ReorderChaptersRequest request)
    {
        try
        {
            await _chapterRepository.ReorderChaptersAsync(lessonId, request.Chapters);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error reordering chapters", error = ex.Message });
        }
    }

    [HttpPost("{chapterId}/generate-quiz")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<GeneratedQuizQuestion>>> GenerateQuiz(Guid chapterId)
    {
        try
        {
            var questions = await _chapterService.GenerateQuizWithAI(chapterId);
            return Ok(questions);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error generating quiz: {ex.Message}");
        }
    }
}
