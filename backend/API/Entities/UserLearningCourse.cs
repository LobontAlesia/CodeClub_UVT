namespace API.Entities;

public class UserLearningCourse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }  // Changed from LearningCourseId
    public bool Completed { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public LearningCourse LearningCourse { get; set; } = null!;
}