using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories.Implementation;

public class BadgeRepository : BaseRepository<Badge>, IBadgeRepository
{
    private readonly PostgresDbContext _context;

    public BadgeRepository(PostgresDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<List<Badge>> GetAllAsync() =>
        await _context.Set<Badge>().ToListAsync();

    public async Task<Badge?> GetByBaseNameAndLevelAsync(string baseName, string level) =>
        await _context.Set<Badge>().FirstOrDefaultAsync(b => b.BaseName.Equals(baseName.ToLower()) && b.Level.Equals(level));
}