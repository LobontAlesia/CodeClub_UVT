using API.Entities;
using API.Models;

namespace API.Mappers;

public static class ExternalBadgeMapper
{
    public static ExternalBadge ToEntity(ExternalBadgeInputModel model)
    {
        return new ExternalBadge
        {
            Id = Guid.NewGuid(),
            Name = model.Name.Trim(),
            Category = model.Category.Trim(),
            Icon = model.Icon
        };
    }

    public static ExternalBadgeModel ToModel(ExternalBadge entity)
    {
        return new ExternalBadgeModel
        {
            Id = entity.Id,
            Name = entity.Name,
            Category = entity.Category,
            Icon = entity.Icon
        };
    }
}