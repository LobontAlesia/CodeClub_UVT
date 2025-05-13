using Microsoft.EntityFrameworkCore;
using API.Entities;
using System.Web;

namespace API.Repositories.Implementation;

public class UserRepository : BaseRepository<User>, IUserRepository
{
    private readonly PostgresDbContext _context;

    public UserRepository(PostgresDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<bool> CheckIfUsernameExistsAsync(string username)
    {
        return await _context.Users.AnyAsync(u => u.Username == username);
    }

    public async Task<bool> CheckIfEmailExistsAsync(string email)
    {
        return await _context.Users.AnyAsync(u => u.Email == email);
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Email == email);
    }    public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
    {
        return await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.RefreshToken == HttpUtility.UrlDecode(refreshToken));
    }

    public async Task<User?> GetByIdAsync(Guid userId)
    {
        return await _context.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Id == userId);
    }
}