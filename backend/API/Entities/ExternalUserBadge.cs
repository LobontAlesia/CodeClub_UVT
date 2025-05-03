using API.Entities;

public class UserExternalBadge
{
    public Guid Id { get; init; }

    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public Guid ExternalBadgeId { get; set; }
    public ExternalBadge ExternalBadge { get; set; } = default!;
}
