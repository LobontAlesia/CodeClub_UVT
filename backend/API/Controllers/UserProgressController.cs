using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class UserProgressController : ControllerBase
{
    private readonly PostgresDbContext dbContext;

    public UserProgressController(PostgresDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    private string? GetUserId() => User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;

    [HttpGet("chapter/{chapterId}")]
    public async Task<ActionResult> GetChapterProgress([FromRoute] Guid chapterId)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var userChapter = await dbContext.UserChapters
            .FirstOrDefaultAsync(uc => uc.UserId == Guid.Parse(userId) && uc.ChapterId == chapterId);

        return Ok(new { isCompleted = userChapter?.Completed ?? false });
    }

    [HttpPost("chapter/{chapterId}/complete")]
    public async Task<ActionResult> CompleteChapter([FromRoute] Guid chapterId)
    {
        try
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var userIdGuid = Guid.Parse(userId);

            using var transaction = await dbContext.Database.BeginTransactionAsync();
            try
            {
                var chapter = await dbContext.Chapters
                    .Include(c => c.Lesson)
                        .ThenInclude(l => l.LearningCourse)
                            .ThenInclude(lc => lc!.Badge)
                    .FirstOrDefaultAsync(c => c.Id == chapterId);

                if (chapter == null)
                    return NotFound("Chapter not found");

                var userChapter = await dbContext.UserChapters
                    .FirstOrDefaultAsync(uc => uc.UserId == userIdGuid && uc.ChapterId == chapterId);

                if (userChapter == null)
                {
                    userChapter = new UserChapter
                    {
                        Id = Guid.NewGuid(),
                        UserId = userIdGuid,
                        ChapterId = chapterId,
                        Completed = true,
                        CreatedAt = DateTime.UtcNow,
                        CompletedAt = DateTime.UtcNow
                    };
                    dbContext.UserChapters.Add(userChapter);
                }
                else
                {
                    userChapter.Completed = true;
                    userChapter.CompletedAt = DateTime.UtcNow;
                }

                await dbContext.SaveChangesAsync();

                if (chapter.Lesson != null)
                {
                    // Check if all chapters in lesson are completed
                    var allChapters = await dbContext.Chapters
                        .Where(c => c.LessonId == chapter.Lesson.Id)
                        .Select(c => c.Id)
                        .ToListAsync();

                    var completedChapters = await dbContext.UserChapters
                        .Where(uc => uc.UserId == userIdGuid && allChapters.Contains(uc.ChapterId) && uc.Completed)
                        .Select(uc => uc.ChapterId)
                        .ToListAsync();

                    if (completedChapters.Count == allChapters.Count)
                    {
                        // Complete the lesson
                        var userLesson = await dbContext.UserLessons
                            .FirstOrDefaultAsync(ul => ul.UserId == userIdGuid && ul.LessonId == chapter.Lesson.Id);

                        if (userLesson == null)
                        {
                            userLesson = new UserLesson
                            {
                                Id = Guid.NewGuid(),
                                UserId = userIdGuid,
                                LessonId = chapter.Lesson.Id,
                                Completed = true
                            };
                            dbContext.UserLessons.Add(userLesson);
                        }
                        else
                        {
                            userLesson.Completed = true;
                        }

                        await dbContext.SaveChangesAsync();

                        var course = chapter.Lesson.LearningCourse;
                        if (course != null)
                        {
                            // Check if all lessons in course are completed
                            var allLessons = await dbContext.Lessons
                                .Where(l => l.LearningCourseId == course.Id)
                                .Select(l => l.Id)
                                .ToListAsync();

                            var completedLessons = await dbContext.UserLessons
                                .Where(ul => ul.UserId == userIdGuid && allLessons.Contains(ul.LessonId) && ul.Completed)
                                .Select(ul => ul.LessonId)
                                .ToListAsync();

                            if (completedLessons.Count == allLessons.Count)
                            {
                                // Complete the course and award badge
                                var userCourse = await dbContext.UserLearningCourses
                                    .FirstOrDefaultAsync(uc => uc.UserId == userIdGuid && uc.CourseId == course.Id);

                                if (userCourse == null)
                                {
                                    userCourse = new UserLearningCourse
                                    {
                                        Id = Guid.NewGuid(),
                                        UserId = userIdGuid,
                                        CourseId = course.Id,
                                        Completed = true
                                    };
                                    dbContext.UserLearningCourses.Add(userCourse);
                                }
                                else
                                {
                                    userCourse.Completed = true;
                                }

                                // Award badge
                                var user = await dbContext.Users
                                    .Include(u => u.Badges)
                                    .FirstOrDefaultAsync(u => u.Id == userIdGuid);

                                if (user != null && course.Badge != null)
                                {
                                    user.Badges ??= new List<Badge>();
                                    if (!user.Badges.Any(b => b.Id == course.Badge.Id))
                                    {
                                        user.Badges.Add(course.Badge);
                                    }
                                }

                                await dbContext.SaveChangesAsync();
                            }
                        }
                    }
                }

                await transaction.CommitAsync();
                return Ok(new { message = "Progress updated successfully", badgeAwarded = chapter.Lesson?.LearningCourse?.Badge != null });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Internal error while completing the chapter",
                error = ex.Message,
                stackTrace = ex.StackTrace
            });
        }
    }

    [HttpGet("course/{courseId}")]
    public async Task<ActionResult> GetCourseProgress([FromRoute] Guid courseId)
    {
        try
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var userIdGuid = Guid.Parse(userId);

            var lessons = await dbContext.Lessons
                .Where(l => l.LearningCourseId == courseId)
                .Select(l => l.Id)
                .ToListAsync();

            if (lessons.Count == 0)
            {
                return Ok(new
                {
                    totalLessons = 0,
                    completedLessons = 0,
                    progressPercentage = 0,
                    isCompleted = false
                });
            }

            var completed = await dbContext.UserLessons
                .Where(ul => ul.UserId == userIdGuid && lessons.Contains(ul.LessonId) && ul.Completed)
                .Select(ul => ul.LessonId)
                .ToListAsync();

            var userCourse = await dbContext.UserLearningCourses
                .FirstOrDefaultAsync(uc => uc.UserId == userIdGuid && uc.CourseId == courseId);

            double progress = (double)completed.Count / lessons.Count * 100;

            return Ok(new
            {
                totalLessons = lessons.Count,
                completedLessons = completed.Count,
                progressPercentage = Math.Round(progress, 2),
                isCompleted = userCourse?.Completed ?? false
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Internal server error in GetCourseProgress",
                error = ex.Message,
                stackTrace = ex.StackTrace
            });
        }
    }

    [HttpGet("lesson/{lessonId}")]
    public async Task<ActionResult> GetLessonProgress([FromRoute] Guid lessonId)
    {
        try
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var userIdGuid = Guid.Parse(userId);

            var chapters = await dbContext.Chapters
                .Where(c => c.LessonId == lessonId)
                .Select(c => c.Id)
                .ToListAsync();

            if (chapters.Count == 0)
            {
                return Ok(new
                {
                    totalChapters = 0,
                    completedChapters = 0,
                    progressPercentage = 0
                });
            }

            var completedChapters = await dbContext.UserChapters
                .Where(uc => uc.UserId == userIdGuid && chapters.Contains(uc.ChapterId) && uc.Completed)
                .Select(uc => uc.ChapterId)
                .ToListAsync();

            double progress = (double)completedChapters.Count / chapters.Count * 100;

            return Ok(new
            {
                totalChapters = chapters.Count,
                completedChapters = completedChapters.Count,
                progressPercentage = Math.Round(progress, 2)
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Internal server error in GetLessonProgress",
                error = ex.Message,
                stackTrace = ex.StackTrace
            });
        }
    }

    [HttpGet("last-activity")]
    public async Task<ActionResult> GetLastActivity()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var userIdGuid = Guid.Parse(userId);

        var lastCompletedChapter = await dbContext.UserChapters
            .Include(uc => uc.Chapter)
                .ThenInclude(c => c.Lesson)
                    .ThenInclude(l => l.LearningCourse)
            .Where(uc => uc.UserId == userIdGuid && uc.Completed)
            .OrderByDescending(uc => uc.CompletedAt)
            .FirstOrDefaultAsync();

        if (lastCompletedChapter?.Chapter?.Lesson?.LearningCourse == null)
            return Ok(new { });

        return Ok(new
        {
            date = lastCompletedChapter.CompletedAt,
            name = $"{lastCompletedChapter.Chapter.Lesson.LearningCourse.Title} - {lastCompletedChapter.Chapter.Title}"
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetUserProgress()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var userIdGuid = Guid.Parse(userId);

        // Get all published courses
        var courses = await dbContext.LearningCourses
            .Include(c => c.Badge)
            .Include(c => c.Lessons)
            .Where(c => c.IsPublished)
            .Select(c => new
            {
                id = c.Id,
                title = c.Title,
                description = c.Description,
                level = c.Level,
                duration = c.Duration,
                isPublished = c.IsPublished,
                badge = c.Badge != null ? new
                {
                    name = c.Badge.Name,
                    baseName = c.Badge.BaseName,
                    level = c.Badge.Level,
                    icon = c.Badge.Icon
                } : null,
                completed = dbContext.UserLearningCourses
                    .Any(ulc => ulc.UserId == userIdGuid && ulc.CourseId == c.Id && ulc.Completed)
            })
            .ToListAsync();

        return Ok(courses);
    }
}
