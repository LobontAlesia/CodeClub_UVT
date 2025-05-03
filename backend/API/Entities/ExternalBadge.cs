using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class ExternalBadge
{
    public Guid Id { get; init; }

    [StringLength(128)] 
    public string Name { get; set; } = string.Empty;

    [StringLength(128)] 
    public string Category { get; set; } = string.Empty; 
    // Exemplu: Scratch, Python, Web sau „General”
    
    public string Icon { get; set; } = string.Empty;

    public List<UserExternalBadge> Users { get; set; } = new();
}
