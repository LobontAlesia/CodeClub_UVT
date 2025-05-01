using API.Mappers;
using API.Models;
using API.Repositories;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("[controller]")]
[ApiController]
[Authorize]
public class BadgeController : ControllerBase
{
    private readonly IBadgeRepository _badgeRepository;
    private readonly PostgresDbContext _context;

    public BadgeController(IBadgeRepository badgeRepository, PostgresDbContext context)
    {
        _badgeRepository = badgeRepository;
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateBadge([FromBody] BadgeInputModel badgeInputModel)
    {
        // Verifică dacă există deja un badge cu același icon
        var existingBadge = await _context.Set<Badge>().FirstOrDefaultAsync(b => b.Icon == badgeInputModel.Icon);
        if (existingBadge != null)
        {
            return BadRequest("A badge with this icon already exists.");
        }

        // Verifică dacă există deja un badge cu același BaseName și Level
        var existingBadgeWithName = await _badgeRepository.GetByBaseNameAndLevelAsync(
            badgeInputModel.BaseName.ToLower(),
            badgeInputModel.Level
        );
        if (existingBadgeWithName != null)
        {
            return BadRequest("A badge with this base name and level already exists.");
        }

        var result = await _badgeRepository.CreateAsync(
            BadgeMapper.MapBadgeInputModelToBadgeEntity(badgeInputModel)
        );

        return result != null ? Ok() : BadRequest();
    }

    [HttpGet]
    public async Task<ActionResult<List<BadgeModel>>> GetAllBadges()
    {
        var badges = await _badgeRepository.GetAllAsync();
        return Ok(badges.Select(BadgeMapper.MapBadgeEntityToBadgeModel).ToList());
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetUserBadges()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _context.Users
            .Include(u => u.Badges)
            .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

        if (user == null) return NotFound();

        var badges = (user.Badges ?? Enumerable.Empty<Badge>())
            .Select(BadgeMapper.MapBadgeEntityToBadgeModel);

        return Ok(badges);
    }
}