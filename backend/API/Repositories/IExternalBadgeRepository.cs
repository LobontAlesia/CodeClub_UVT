using API.Entities;
public interface IExternalBadgeRepository
{
    Task<List<ExternalBadge>> GetAll();
    Task Create(ExternalBadge badge);
    Task Delete(Guid id);
}
