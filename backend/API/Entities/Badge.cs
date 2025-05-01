using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class Badge
{
    public Guid Id { get; init; }

    [StringLength(128)] public string Name { get; set; } = string.Empty;
    [StringLength(128)] public string BaseName { get; set; } = string.Empty;
    [StringLength(64)] public string Level { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public List<User> Users { get; set; } = new();

}