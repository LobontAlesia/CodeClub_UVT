using System.ComponentModel.DataAnnotations;

namespace API.Models;

public class ExternalBadgeModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
}
