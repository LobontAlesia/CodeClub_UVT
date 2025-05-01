using API.Entities;
using API.Models;

namespace API.Mappers;

public static class BadgeMapper
{
    public static Badge MapBadgeInputModelToBadgeEntity(BadgeInputModel badgeInputModel) =>
        new Badge()
        {
            Name = badgeInputModel.Name,
            BaseName = badgeInputModel.BaseName.ToLower(),
            Level = badgeInputModel.Level,
            Icon = badgeInputModel.Icon
        };

    public static BadgeModel MapBadgeEntityToBadgeModel(Badge badge) =>
        new BadgeModel()
        {
            Name = badge.Name,
            BaseName = badge.BaseName,
            Level = badge.Level,
            Icon = IsBase64String(badge.Icon)
                ? System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(badge.Icon))
                : badge.Icon
        };

    private static bool IsBase64String(string? base64)
    {
        if (string.IsNullOrWhiteSpace(base64))
            return false;

        Span<byte> buffer = new Span<byte>(new byte[base64.Length]);
        return Convert.TryFromBase64String(base64, buffer, out _);
    }
}