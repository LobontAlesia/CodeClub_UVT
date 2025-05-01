namespace API.Models;

public class LessonModel
{
    public Guid Id { get; set; }
    public int Index { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Duration { get; set; }
    public Guid LearningCourseId { get; set; }
    public List<string> ChapterTitles { get; set; } = new();
}