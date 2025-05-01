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

        var badges = (user.Badges ?? Enumerable.Empty<Badge>()).Select(b => new
        {
            name = b.Name,
            baseName = b.BaseName,
            level = b.Level,
            icon = b.Icon
        });

        return Ok(badges);
    }
}