using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class QuizQuestion
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public string QuestionText { get; set; } = string.Empty;

    [Required]
    public string Answer1 { get; set; } = string.Empty;

    [Required]
    public string Answer2 { get; set; } = string.Empty;

    [Required]
    public string Answer3 { get; set; } = string.Empty;

    [Required]
    public string Answer4 { get; set; } = string.Empty;

    [Required]
    public int CorrectAnswerIndex { get; set; }
}