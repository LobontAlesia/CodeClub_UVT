using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Entities;
using System.Transactions;

namespace API.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class QuizSubmissionController : ControllerBase
{
    private readonly PostgresDbContext _dbContext;

    public QuizSubmissionController(PostgresDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    private string? GetUserId() => User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;

    public class QuizSubmissionDto
    {
        public Guid QuizId { get; set; }
        public List<int> Answers { get; set; } = new();
    }

    [HttpPost]
    public async Task<ActionResult> SubmitQuiz([FromBody] QuizSubmissionDto dto)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var userIdGuid = Guid.Parse(userId);

        using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            // Get quiz with questions
            var quiz = await _dbContext.QuizForms
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.Id == dto.QuizId);

            if (quiz == null) 
                return NotFound("Quiz not found");

            if (dto.Answers.Count != quiz.Questions.Count)
                return BadRequest("Number of answers doesn't match number of questions");

            // Calculate score
            int correctAnswers = 0;
            for (int i = 0; i < quiz.Questions.Count; i++)
            {
                if (i < dto.Answers.Count && dto.Answers[i] == quiz.Questions[i].CorrectAnswerIndex)
                    correctAnswers++;
            }

            // Get chapter element and chapter info
            var chapterElement = await _dbContext.ChapterElements
                .Include(ce => ce.Chapter)
                    .ThenInclude(c => c.Lesson)
                        .ThenInclude(l => l.LearningCourse)
                            .ThenInclude(lc => lc != null ? lc.Badge : null)
                .FirstOrDefaultAsync(ce => ce.FormId == dto.QuizId);

            if (chapterElement == null)
                return NotFound("Chapter element not found");

            double scorePercentage = (double)correctAnswers / quiz.Questions.Count * 100;
            bool passed = scorePercentage >= 70; // Threshold for passing

            if (passed)
            {
                // Mark chapter as completed
                var userChapter = await _dbContext.UserChapters
                    .FirstOrDefaultAsync(uc => uc.UserId == userIdGuid && uc.ChapterId == chapterElement.ChapterId);

                if (userChapter == null)
                {
                    userChapter = new UserChapter
                    {
                        Id = Guid.NewGuid(),
                        UserId = userIdGuid,
                        ChapterId = chapterElement.ChapterId,
                        Completed = true,
                        CreatedAt = DateTime.UtcNow,
                        CompletedAt = DateTime.UtcNow
                    };
                    _dbContext.UserChapters.Add(userChapter);
                }
                else if (!userChapter.Completed)
                {
                    userChapter.Completed = true;
                    userChapter.CompletedAt = DateTime.UtcNow;
                }

                await _dbContext.SaveChangesAsync();

                // Check if all chapters in lesson are completed
                if (chapterElement.Chapter?.Lesson != null)
                {
                    var allChapters = await _dbContext.Chapters
                        .Where(c => c.LessonId == chapterElement.Chapter.Lesson.Id)
                        .Select(c => c.Id)
                        .ToListAsync();

                    var completedChapters = await _dbContext.UserChapters
                        .Where(uc => uc.UserId == userIdGuid && allChapters.Contains(uc.ChapterId) && uc.Completed)
                        .Select(uc => uc.ChapterId)
                        .ToListAsync();

                    if (completedChapters.Count == allChapters.Count)
                    {
                        // Complete the lesson
                        var userLesson = await _dbContext.UserLessons
                            .FirstOrDefaultAsync(ul => ul.UserId == userIdGuid && ul.LessonId == chapterElement.Chapter.Lesson.Id);

                        if (userLesson == null)
                        {
                            userLesson = new UserLesson
                            {
                                Id = Guid.NewGuid(),
                                UserId = userIdGuid,
                                LessonId = chapterElement.Chapter.Lesson.Id,
                                Completed = true
                            };
                            _dbContext.UserLessons.Add(userLesson);
                        }
                        else
                        {
                            userLesson.Completed = true;
                        }

                        await _dbContext.SaveChangesAsync();

                        // Check if all lessons in course are completed
                        var course = chapterElement.Chapter?.Lesson?.LearningCourse;
                        if (course != null)
                        {
                            var allLessons = await _dbContext.Lessons
                                .Where(l => l.LearningCourseId == course.Id)
                                .Select(l => l.Id)
                                .ToListAsync();

                            var completedLessons = await _dbContext.UserLessons
                                .Where(ul => ul.UserId == userIdGuid && allLessons.Contains(ul.LessonId) && ul.Completed)
                                .Select(ul => ul.LessonId)
                                .ToListAsync();

                            if (completedLessons.Count == allLessons.Count)
                            {
                                // Complete course and award badge
                                var userCourse = await _dbContext.UserLearningCourses
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
                                    _dbContext.UserLearningCourses.Add(userCourse);
                                }
                                else
                                {
                                    userCourse.Completed = true;
                                }

                                // Award badge if course is completed
                                if (course.Badge != null)
                                {
                                    var user = await _dbContext.Users
                                        .Include(u => u.Badges)
                                        .FirstOrDefaultAsync(u => u.Id == userIdGuid);

                                    if (user != null)
                                    {
                                        user.Badges ??= new List<Badge>();
                                        if (!user.Badges.Any(b => b.Id == course.Badge.Id))
                                        {
                                            user.Badges.Add(course.Badge);
                                        }
                                    }
                                }

                                await _dbContext.SaveChangesAsync();
                            }
                        }
                    }
                }
            }

            await transaction.CommitAsync();

            return Ok(new
            {
                score = correctAnswers,
                total = quiz.Questions.Count,
                percentage = scorePercentage,
                passed = passed,
                message = passed ? "Quiz completed successfully!" : "Quiz completed, but score was too low to progress. Try again!"
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Error submitting quiz", error = ex.Message });
        }
    }
}
