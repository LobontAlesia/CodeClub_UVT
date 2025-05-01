using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class Lesson
{
    public Guid Id { get; init; }

    public int Index { get; set; }
    [StringLength(128)] public string Title { get; set; } = string.Empty;
    [StringLength(1024)] public string? Description { get; set; }
    public int? Duration { get; set; }

    public Guid LearningCourseId { get; set; }
    public LearningCourse? LearningCourse { get; set; }
    public List<Chapter> Chapters { get; set; } = [];
}