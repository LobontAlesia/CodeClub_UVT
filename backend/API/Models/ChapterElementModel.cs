namespace API.Models;

public class ChapterElementModel
{
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int Index { get; set; }
    public string? Content { get; set; }
    public string? Image { get; set; }
    public Guid? FormId { get; set; }
}