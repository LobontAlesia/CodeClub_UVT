namespace API.Entities;

public class UserChapter
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ChapterId { get; set; }
    public bool Completed { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public Chapter Chapter { get; set; } = null!;
}