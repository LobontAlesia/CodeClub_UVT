using API.Entities;

namespace API.Repositories;

public interface IBadgeRepository : IBaseRepository<Badge>
{
    Task<List<Badge>> GetAllAsync();
    Task<Badge?> GetByBaseNameAndLevelAsync(string baseName, string level);
}