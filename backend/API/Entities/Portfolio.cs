using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class Portfolio
{
    public Guid Id { get; init; } // PK

    public Guid UserId { get; set; } 
    public User User { get; set; } = default!;

    [StringLength(128)] 
    public string Title { get; set; } = string.Empty;

    [StringLength(256)] 
    public string Description { get; set; } = string.Empty;

    public string FileUrl { get; set; } = string.Empty;
    public string ExternalLink { get; set; } = string.Empty;
    public string ScreenshotUrl { get; set; } = string.Empty;

    [StringLength(32)] 
    public string Status { get; set; } = "Pending"; // Pending / Approved / Rejected

    public string Feedback { get; set; } = string.Empty;

    public Guid? ExternalBadgeId { get; set; } // dacă primește un badge la aprobare
    public ExternalBadge? ExternalBadge { get; set; }
}
