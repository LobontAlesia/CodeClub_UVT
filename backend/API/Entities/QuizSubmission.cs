using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class QuizSubmission
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid UserId { get; set; }
    
    [Required]
    public Guid QuizId { get; set; }

    [Required]
    public int Score { get; set; }

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public virtual User User { get; set; } = null!;
    public virtual QuizForm Quiz { get; set; } = null!;
}