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
            Icon = badge.Icon // The icon is already in the correct format
        };
}