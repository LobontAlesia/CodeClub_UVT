namespace API.Models;

public class PortfolioModel
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string ExternalLink { get; set; } = string.Empty;
    public string ScreenshotUrl { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public string Feedback { get; set; } = string.Empty;
    public ExternalBadgeModel? ExternalBadge { get; set; }
    public UserModel User { get; set; } = null!;
}
