using System.ComponentModel.DataAnnotations;

namespace API.Models;

public class AiQuizRequestModel
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public Guid ChapterId { get; set; }
}