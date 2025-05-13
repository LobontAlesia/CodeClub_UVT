using API.Entities;

namespace API.Repositories;

public interface IUserRepository : IBaseRepository<User>
{
    Task<bool> CheckIfUsernameExistsAsync(string username);
    Task<bool> CheckIfEmailExistsAsync(string email);
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByRefreshTokenAsync(string refreshToken);
    Task<User?> GetByIdAsync(Guid userId);
}