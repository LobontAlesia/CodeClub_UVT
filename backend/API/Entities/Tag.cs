using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class Tag
{
    public Guid Id { get; init; }

    [StringLength(128)] public string Name { get; set; } = string.Empty;

    public List<LearningCourse> LearningCourses { get; set; } = new();
}