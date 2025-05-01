using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class Role
{
    public Guid Id { get; init; }

    [StringLength(128)] public string Name { get; set; } = string.Empty;

    public List<User> Users { get; set; } = new();
}