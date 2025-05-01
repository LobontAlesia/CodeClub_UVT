namespace API.Entities;

public class Chapter
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Index { get; set; }
    public Guid LessonId { get; set; }

    // Navigation properties
    public Lesson Lesson { get; set; } = null!;
    public ICollection<ChapterElement> Elements { get; set; } = new List<ChapterElement>();
    public ICollection<UserChapter> UserChapters { get; set; } = new List<UserChapter>();
}