using Microsoft.EntityFrameworkCore;
using API.Entities;
using API.Models;
using API.Mappers;
using API.Repositories;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace API.Services.Implementation;

public class ExternalBadgeService : IExternalBadgeService
{
    private readonly IExternalBadgeRepository _repository;
    private readonly PostgresDbContext _context;

    public ExternalBadgeService(IExternalBadgeRepository repository, PostgresDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    public async Task<List<ExternalBadgeModel>> GetAllExternalBadges()
    {
        var badges = await _repository.GetAll();
        return badges.Select(ExternalBadgeMapper.ToModel).ToList();
    }

    public async Task CreateExternalBadge(ExternalBadgeInputModel model)
    {
        // Validate unique name
        if (await _context.ExternalBadges.AnyAsync(b => b.Name.ToLower() == model.Name.ToLower().Trim()))
        {
            throw new InvalidOperationException("An external badge with this name already exists");
        }

        // Validate unique icon
        if (await _context.ExternalBadges.AnyAsync(b => b.Icon == model.Icon))
        {
            throw new InvalidOperationException("An external badge with this icon already exists");
        }

        var badge = ExternalBadgeMapper.ToEntity(model);
        await _repository.Create(badge);
    }

    public async Task DeleteExternalBadge(Guid id)
    {
        // Check if badge is used in any portfolios
        var usedInPortfolio = await _context.Portfolios.AnyAsync(p => p.ExternalBadgeId == id);
        if (usedInPortfolio)
        {
            throw new InvalidOperationException("Cannot delete this badge as it is assigned to one or more portfolios");
        }

        await _repository.Delete(id);
    }
}
