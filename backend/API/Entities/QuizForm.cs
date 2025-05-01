using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class QuizForm
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public List<QuizQuestion> Questions { get; set; } = new();
}