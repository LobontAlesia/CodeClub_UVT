using API.Entities;
using API.Models;

namespace API.Mappers;

public static class PortfolioMapper
{
    public static PortfolioModel ToModel(Portfolio entity)
    {
        if (entity == null)
            throw new ArgumentNullException(nameof(entity));

        try
        {
            string GetAssetUrl(string? base64)
            {
                if (string.IsNullOrEmpty(base64)) return string.Empty;
                if (base64.StartsWith("http")) return base64;
                if (base64.StartsWith("data:")) return base64;
                return $"http://localhost:5153/portfolio/image/{entity.Id}";
            }

            return new PortfolioModel
            {
                Id = entity.Id,
                Title = entity.Title ?? string.Empty,
                Description = entity.Description ?? string.Empty,
                FileUrl = string.IsNullOrEmpty(entity.FileUrl) ? string.Empty : entity.FileUrl,
                ExternalLink = string.IsNullOrEmpty(entity.ExternalLink) ? string.Empty : entity.ExternalLink,
                ScreenshotUrl = GetAssetUrl(entity.ScreenshotUrl),
                Status = entity.Status ?? "Pending",
                Feedback = entity.Feedback ?? string.Empty,
                ExternalBadge = entity.ExternalBadge == null ? null : new ExternalBadgeModel
                {
                    Id = entity.ExternalBadge.Id,
                    Name = entity.ExternalBadge.Name ?? string.Empty,
                    Icon = entity.ExternalBadge.Icon ?? string.Empty
                },
                User = entity.User == null ? new UserModel() : UserMapper.MapUserEntityToUserModel(entity.User)
            };
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to map portfolio {entity.Id}: {ex.Message}", ex);
        }
    }
}
