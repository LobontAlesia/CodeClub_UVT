namespace API.Models;

public class LearningCourseModel
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public int Duration { get; set; }
    public bool IsPublished { get; set; }
    public List<string> TagNames { get; set; } = [];
}