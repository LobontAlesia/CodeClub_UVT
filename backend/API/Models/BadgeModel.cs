namespace API.Models;

public class BadgeModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BaseName { get; set; } = string.Empty; 
    public string Level { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
}