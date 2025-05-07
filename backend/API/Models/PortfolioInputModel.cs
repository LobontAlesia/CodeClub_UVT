public class PortfolioInputModel
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string ExternalLink { get; set; } = string.Empty;
    public string ScreenshotUrl { get; set; } = string.Empty;
    public string CertificateUrl { get; set; } = string.Empty;
    public bool IsScratchProject { get; set; } = false;
}
