namespace API.Models;

public class LearningCoursePatchModel
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublished { get; set; } = false;
    public List<string> TagNames { get; set; } = [];
    public List<string> LessonTitles { get; set; } = [];
    public string Level { get; set; } = string.Empty;
    public int Duration { get; set; }
    public string BaseName { get; set; } = string.Empty;
    public Guid? BadgeId { get; set; }
}