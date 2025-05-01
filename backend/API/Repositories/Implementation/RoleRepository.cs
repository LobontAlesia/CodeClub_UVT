using Microsoft.EntityFrameworkCore;
using API.Entities;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace API.Repositories.Implementation;

public class RoleRepository(PostgresDbContext context) : IRoleRepository
{
    public async Task<Role?> GetByNameAsync(string roleName)
    {
        return await context.Roles.FirstOrDefaultAsync(r => r.Name.ToLower().Equals(roleName.ToLower()));
    }
}