using Microsoft.EntityFrameworkCore;
using API.Entities;
using API.Models;
using API.Repositories;
using API.Mappers;
using System.Linq;

namespace API.Services.Implementation;

public class PortfolioService : IPortfolioService
{
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly IUserRepository _userRepository;
    private readonly PostgresDbContext _context;

    public PortfolioService(IPortfolioRepository portfolioRepository, IUserRepository userRepository, PostgresDbContext context)
    {
        _portfolioRepository = portfolioRepository;
        _userRepository = userRepository;
        _context = context;
    }

    public async Task<List<PortfolioModel>> GetUserPortfolios(Guid userId)
    {
        var portfolios = await _portfolioRepository.GetUserPortfolios(userId);
        return portfolios.Select(PortfolioMapper.ToModel).ToList();
    }

    public async Task<List<PortfolioModel>> GetAllPortfolios()
    {
        try
        {
            var portfolios = await _portfolioRepository.GetAllPortfolios();
            if (portfolios == null)
            {
                throw new InvalidOperationException("Failed to retrieve portfolios from database");
            }
            
            var result = new List<PortfolioModel>();
            foreach (var p in portfolios)
            {
                try
                {
                    var model = PortfolioMapper.ToModel(p);
                    if (model != null)
                    {
                        result.Add(model);
                    }
                }
                catch (Exception ex)
                {
                    // Log the error but continue processing other portfolios
                    Console.WriteLine($"Failed to map portfolio {p.Id}: {ex.Message}");
                }
            }
            
            return result;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to retrieve portfolios: {ex.Message}", ex);
        }
    }

    public async Task CreatePortfolio(Guid userId, PortfolioInputModel model)
    {
        // Validate user exists
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
            throw new InvalidOperationException("User not found");

        // Basic validation for required fields
        if (string.IsNullOrWhiteSpace(model.Title))
            throw new InvalidOperationException("Title is required");

        if (string.IsNullOrWhiteSpace(model.Description))
            throw new InvalidOperationException("Description is required");

        if (string.IsNullOrWhiteSpace(model.ScreenshotUrl))
            throw new InvalidOperationException("Screenshot is required");

        var portfolio = new Portfolio
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = model.Title.Trim(),
            Description = model.Description.Trim(),
            FileUrl = model.FileUrl?.Trim() ?? string.Empty,
            ExternalLink = model.ExternalLink?.Trim() ?? string.Empty,
            ScreenshotUrl = model.ScreenshotUrl.Trim(),
            Status = "Pending",
            Feedback = string.Empty,
            ExternalBadgeId = null
        };

        await _portfolioRepository.CreatePortfolio(portfolio);
    }

    public async Task UpdatePortfolioStatus(Guid portfolioId, string status, string feedback, Guid? externalBadgeId)
    {
        var portfolio = await _portfolioRepository.GetPortfolioById(portfolioId);
        if (portfolio is null)
            throw new InvalidOperationException("Portfolio not found");

        // Validate status
        if (status != "Pending" && status != "Approved" && status != "Rejected")
            throw new InvalidOperationException("Invalid status. Must be Pending, Approved, or Rejected");

        // For approved portfolios, validate badge if provided
        if (status == "Approved" && externalBadgeId.HasValue)
        {
            var portfolios = await _portfolioRepository.GetAllPortfolios();
            if (portfolios.Any(p => p.ExternalBadgeId == externalBadgeId && p.Id != portfolioId))
            {
                throw new InvalidOperationException("This external badge is already assigned to another portfolio");
            }

            // Create UserExternalBadge association when approving with a badge
            var existingAssociation = await _context.UserExternalBadges
                .FirstOrDefaultAsync(ueb => ueb.UserId == portfolio.UserId && ueb.ExternalBadgeId == externalBadgeId.Value);

            if (existingAssociation == null)
            {
                var userExternalBadge = new UserExternalBadge
                {
                    Id = Guid.NewGuid(),
                    UserId = portfolio.UserId,
                    ExternalBadgeId = externalBadgeId.Value
                };
                _context.UserExternalBadges.Add(userExternalBadge);
            }
        }

        portfolio.Status = status;
        portfolio.Feedback = feedback?.Trim() ?? string.Empty;
        portfolio.ExternalBadgeId = status == "Approved" ? externalBadgeId : null;

        await _portfolioRepository.UpdatePortfolio(portfolio);
        await _context.SaveChangesAsync();
    }

    public async Task<PortfolioModel?> GetPortfolioById(Guid id)
    {
        var portfolio = await _portfolioRepository.GetPortfolioById(id);
        return portfolio == null ? null : PortfolioMapper.ToModel(portfolio);
    }

    public async Task UpdatePortfolio(Guid portfolioId, PortfolioInputModel model)
    {
        var portfolio = await _portfolioRepository.GetPortfolioById(portfolioId);
        if (portfolio == null)
            throw new InvalidOperationException("Portfolio not found");

        // Basic validation for required fields
        if (string.IsNullOrWhiteSpace(model.Title))
            throw new InvalidOperationException("Title is required");

        if (string.IsNullOrWhiteSpace(model.Description))
            throw new InvalidOperationException("Description is required");

        if (string.IsNullOrWhiteSpace(model.ScreenshotUrl))
            throw new InvalidOperationException("Screenshot is required");

        portfolio.Title = model.Title.Trim();
        portfolio.Description = model.Description.Trim();
        portfolio.FileUrl = model.FileUrl?.Trim() ?? portfolio.FileUrl;
        portfolio.ExternalLink = model.ExternalLink?.Trim() ?? portfolio.ExternalLink;
        portfolio.ScreenshotUrl = model.ScreenshotUrl.Trim();
        
        // Reset the portfolio status, feedback and badge when updated
        portfolio.Status = "Pending";
        portfolio.Feedback = string.Empty;
        portfolio.ExternalBadgeId = null;
        portfolio.ExternalBadge = null;

        await _portfolioRepository.UpdatePortfolio(portfolio);
    }

    public async Task DeletePortfolio(Guid portfolioId)
    {
        var portfolio = await _portfolioRepository.GetPortfolioById(portfolioId);
        if (portfolio == null)
            throw new InvalidOperationException("Portfolio not found");

        await _portfolioRepository.DeletePortfolio(portfolio);
    }
}
