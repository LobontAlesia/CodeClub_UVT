using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using API.Services;
using API.Models;
using API.Mappers;
using API;

[ApiController]
[Route("[controller]")]
[Authorize] 
public class ExternalBadgeController : ControllerBase
{
    private readonly IExternalBadgeService _externalBadgeService;
    private readonly PostgresDbContext _context;

    public ExternalBadgeController(IExternalBadgeService externalBadgeService, PostgresDbContext context)
    {
        _externalBadgeService = externalBadgeService;
        _context = context;
    }

    // Admin: Creare badge extern
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateExternalBadge([FromBody] ExternalBadgeInputModel model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
            
        try 
        {
            await _externalBadgeService.CreateExternalBadge(model);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // Toți: Listare badge-uri externe
    [HttpGet]
    public async Task<IActionResult> GetAllExternalBadges()
    {
        var badges = await _externalBadgeService.GetAllExternalBadges();
        return Ok(badges);
    }

    // User: Listare badge-uri externe ale utilizatorului
    [HttpGet("user")]
    public async Task<IActionResult> GetUserExternalBadges()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _context.Users
            .Include(u => u.ExternalBadges)
                .ThenInclude(ub => ub.ExternalBadge)
            .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

        if (user == null) return NotFound();

        var badges = user.ExternalBadges
            .Select(ub => ExternalBadgeMapper.ToModel(ub.ExternalBadge));

        return Ok(badges);
    }

    // Admin: Ștergere badge extern
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteExternalBadge(Guid id)
    {
        try
        {
            await _externalBadgeService.DeleteExternalBadge(id);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while deleting the badge");
        }
    }    // Admin: Update badge image
    [HttpPut("{id}/icon")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateExternalBadgeIcon([FromRoute] Guid id, [FromBody] BadgeIconUpdateModel model)
    {
        try
        {
            await _externalBadgeService.UpdateBadgeIcon(id, model.Icon);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Failed to update badge icon: {ex.Message}");
        }
    }
}
