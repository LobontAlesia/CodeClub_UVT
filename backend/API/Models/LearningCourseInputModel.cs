namespace API.Models;

public class LearningCourseInputModel
{
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int Duration { get; init; }
    public string BaseName { get; init; } = string.Empty;
    public string Level { get; init; } = string.Empty;
    public List<string> TagNames { get; init; } = [];
    public Guid BadgeId { get; init; }
}