using Microsoft.EntityFrameworkCore;
using API.Entities;
using API.Repositories;
using System.Collections.Generic;

namespace API.Repositories.Implementation;

public class ExternalBadgeRepository : IExternalBadgeRepository
{
    private readonly PostgresDbContext _context;

    public ExternalBadgeRepository(PostgresDbContext context)
    {
        _context = context;
    }

    public async Task<List<ExternalBadge>> GetAll()
    {
        return await _context.ExternalBadges
            .Include(b => b.Users)
                .ThenInclude(ub => ub.User)
            .ToListAsync();
    }

    public async Task Create(ExternalBadge badge)
    {
        try
        {
            _context.ExternalBadges.Add(badge);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            throw new Exception($"Failed to create external badge: {ex.InnerException?.Message ?? ex.Message}");
        }
    }

    public async Task Delete(Guid id)
    {
        try
        {
            var badge = await _context.ExternalBadges
                .Include(b => b.Users)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (badge != null)
            {
                _context.ExternalBadges.Remove(badge);
                await _context.SaveChangesAsync();
            }
        }
        catch (DbUpdateException ex)
        {
            throw new Exception($"Failed to delete external badge: {ex.InnerException?.Message ?? ex.Message}");
        }
    }
}
