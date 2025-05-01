using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class User
{
    public Guid Id { get; init; }  // Changed from UserId to Id to match database schema

    [StringLength(128)] public string Username { get; set; } = string.Empty;
    [StringLength(128)] public string FirstName { get; set; } = string.Empty;
    [StringLength(128)] public string LastName { get; set; } = string.Empty;
    [StringLength(128)] public string Email { get; set; } = string.Empty;
    [StringLength(256)] public string PasswordHash { get; set; } = string.Empty;

    [StringLength(128)] public string RefreshToken { get; set; } = string.Empty;
    public DateTime RefreshTokenExpiryTime { get; set; }

    public bool IsActive { get; set; }
    public bool IsLocked { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public List<Role> Roles { get; set; } = new();
    public List<Badge> Badges { get; set; } = new();
}