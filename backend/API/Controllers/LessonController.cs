using API.Entities;
using API.Mappers;
using API.Models;
using API.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("[controller]")]
[ApiController]
public class LessonController(ILessonRepository lessonRepository) : ControllerBase
{
    [HttpGet("by-course/{courseId}")]
    public async Task<ActionResult<List<LessonModel>>> GetLessonsByCourseId([FromRoute] Guid courseId)
    {
        var lessons = await lessonRepository.GetAllByCourseIdAsync(courseId);
        return Ok(lessons
            .Select(LessonMapper.MapLessonEntityToLessonModel)
            .OrderBy(l => l.Index)
            .ToList());
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<LessonModel>> GetLessonById([FromRoute] Guid id)
    {
        var lesson = await lessonRepository.GetByIdWithCourseAsync(id);
        if (lesson == null)
            return NotFound();

        return Ok(new {
            id = lesson.Id,
            title = lesson.Title,
            index = lesson.Index,
            duration = lesson.Duration,
            learningCourseId = lesson.LearningCourseId,
            courseTitle = lesson.LearningCourse?.Title ?? "Unknown Course"
        });
    }
    
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Guid>> CreateLesson([FromBody] LessonModel model)
    {
        // Get max index from existing lessons for this course
        var existingLessons = await lessonRepository.GetAllByCourseIdAsync(model.LearningCourseId);
        var maxIndex = existingLessons.Any() ? existingLessons.Max(l => l.Index) : 0;

        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            Title = model.Title,
            Index = maxIndex + 1, // Set index automatically
            Duration = model.Duration,
            LearningCourseId = model.LearningCourseId,
        };

        await lessonRepository.AddAsync(lesson);
        await lessonRepository.SaveChangesAsync();

        return Ok(lesson.Id);  
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateLesson([FromRoute] Guid id, [FromBody] LessonModel model)
    {
        var lesson = await lessonRepository.GetByIdAsync(id);
        if (lesson == null)
            return NotFound("Lesson not found");

        lesson.Title = model.Title;
        lesson.Duration = model.Duration;

        await lessonRepository.UpdateAsync(lesson);
        return Ok();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteLesson([FromRoute] Guid id)
    {
        var lesson = await lessonRepository.GetByIdAsync(id);
        if (lesson == null)
            return NotFound("Lesson not found");

        await lessonRepository.DeleteAsync(lesson);
        return Ok();
    }

    [HttpPut("course/{courseId}/reorder")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ReorderLessons(Guid courseId, [FromBody] ReorderLessonsRequest request)
    {
        try
        {
            await lessonRepository.ReorderLessonsAsync(courseId, request.Lessons);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error reordering lessons", error = ex.Message });
        }
    }
}