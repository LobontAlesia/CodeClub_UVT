using System.ComponentModel.DataAnnotations;

namespace API.Models;

public class QuizFormInputModel
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public List<QuizQuestionInputModel> Questions { get; set; } = [];

    [Required]
    public Guid ChapterId { get; set; }
}

public class QuizQuestionInputModel
{
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
    [Range(0, 3)]
    public int CorrectAnswerIndex { get; set; }
}