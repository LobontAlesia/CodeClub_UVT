namespace API.Models;

public class ChapterModel
{
    public string Title { get; set; } = string.Empty;
    public int Index { get; set; }
    public string? Image { get; set; }
    public Guid? FormId { get; set; }

}