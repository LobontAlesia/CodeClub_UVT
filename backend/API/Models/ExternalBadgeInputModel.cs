using System.ComponentModel.DataAnnotations;

namespace API.Models;

public class ExternalBadgeInputModel
{
    [Required]
    [StringLength(128)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(128)]
    public string Category { get; set; } = string.Empty;

    [Required]
    public string Icon { get; set; } = string.Empty;
}
