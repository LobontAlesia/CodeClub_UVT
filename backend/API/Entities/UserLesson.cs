namespace API.Entities;

public class UserLesson
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid LessonId { get; set; }
    public bool Completed { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Lesson Lesson { get; set; } = null!;
}