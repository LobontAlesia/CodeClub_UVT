using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class ChapterElement
{
    [Key]
    public Guid Id { get; set; }

    public int Index { get; set; }

    [StringLength(128)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Type { get; set; } = string.Empty;

    public string? Content { get; set; }

    public QuizForm? Form { get; set; }
    public string? Image { get; set; }
    public Guid? FormId { get; set; }

    public Guid ChapterId { get; set; }
    public Chapter Chapter { get; set; } = null!;
}