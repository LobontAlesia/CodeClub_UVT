using Microsoft.EntityFrameworkCore;
using API.Entities;
using API.Repositories;

namespace API.Repositories.Implementation;

public class PortfolioRepository : IPortfolioRepository
{
    private readonly PostgresDbContext _context;

    public PortfolioRepository(PostgresDbContext context)
    {
        _context = context;
    }

    public async Task<List<Portfolio>> GetUserPortfolios(Guid userId)
    {
        try
        {
            return await _context.Portfolios
                .Where(p => p.UserId == userId)
                .Include(p => p.ExternalBadge)
                .OrderByDescending(p => p.Id)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to get user portfolios: {ex.Message}", ex);
        }
    }

    public async Task<List<Portfolio>> GetAllPortfolios()
    {
        try
        {
            return await _context.Portfolios
                .Include(p => p.ExternalBadge)
                .Include(p => p.User)
                .OrderByDescending(p => p.Id)
                .AsNoTracking()  // Add this for better performance since we're only reading
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to get all portfolios: {ex.Message}", ex);
        }
    }

    public async Task<Portfolio?> GetPortfolioById(Guid id)
    {
        try
        {
            return await _context.Portfolios
                .Include(p => p.ExternalBadge)
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to get portfolio by ID: {ex.Message}", ex);
        }
    }

    public async Task CreatePortfolio(Portfolio portfolio)
    {
        try
        {
            _context.Portfolios.Add(portfolio);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            throw new Exception($"Failed to create portfolio: {ex.InnerException?.Message ?? ex.Message}");
        }
    }

    public async Task UpdatePortfolio(Portfolio portfolio)
    {
        try
        {
            _context.Portfolios.Update(portfolio);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            throw new Exception($"Failed to update portfolio: {ex.InnerException?.Message ?? ex.Message}");
        }
    }

    public async Task DeletePortfolio(Portfolio portfolio)
    {
        try
        {
            _context.Portfolios.Remove(portfolio);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            throw new Exception($"Failed to delete portfolio: {ex.InnerException?.Message ?? ex.Message}");
        }
    }
}
