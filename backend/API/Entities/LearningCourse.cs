using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class LearningCourse
{
    public Guid Id { get; init; }

    [StringLength(128)] public string Title { get; set; } = string.Empty;
    [StringLength(1024)] public string Description { get; set; } = string.Empty;
    [StringLength(128)] public string BaseName { get; set; } = string.Empty;
    [StringLength(64)] public string Level { get; set; } = string.Empty;
    public int Duration { get; set; }
    public bool IsPublished { get; set; }

    public Guid BadgeId { get; set; }
    public Badge? Badge { get; set; }
    public List<Tag> Tags { get; set; } = [];
    public List<Lesson> Lessons { get; set; } = [];
}