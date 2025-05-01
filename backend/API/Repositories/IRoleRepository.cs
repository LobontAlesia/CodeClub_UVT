using API.Entities;

namespace API.Repositories;

public interface IRoleRepository
{
    Task<Role?> GetByNameAsync(string roleName);
}