using API.Models;

public interface IExternalBadgeService
{
    Task<List<ExternalBadgeModel>> GetAllExternalBadges();
    Task CreateExternalBadge(ExternalBadgeInputModel model);
    Task DeleteExternalBadge(Guid id);
    Task UpdateBadgeIcon(Guid id, string icon);
}
