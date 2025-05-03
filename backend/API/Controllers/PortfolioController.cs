using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using API.Services;
using API.Models;
using API;
using System.IO;

[ApiController]
[Route("[controller]")]
[Authorize] // Add base authorization
public class PortfolioController : ControllerBase
{
    private readonly IPortfolioService _portfolioService;
    private readonly RequestContext _requestContext;

    public PortfolioController(IPortfolioService portfolioService, RequestContext requestContext)
    {
        _portfolioService = portfolioService;
        _requestContext = requestContext;
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetUserPortfolios()
    {
        var portfolios = await _portfolioService.GetUserPortfolios(_requestContext.UserId);
        return Ok(portfolios);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePortfolio([FromBody] PortfolioInputModel model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            await _portfolioService.CreatePortfolio(_requestContext.UserId, model);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Failed to create portfolio: {ex.Message}");
        }
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")] // Add admin-only access
    public async Task<IActionResult> GetAllPortfolios()
    {
        try 
        {
            if (!User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var portfolios = await _portfolioService.GetAllPortfolios();
            return Ok(portfolios);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            // Log the exception here
            Console.WriteLine($"Error in GetAllPortfolios: {ex}");
            return StatusCode(500, "An unexpected error occurred while retrieving portfolios.");
        }
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")] // Add admin-only access
    public async Task<IActionResult> UpdatePortfolioStatus(Guid id, [FromQuery] string status, [FromQuery] string feedback, [FromQuery] Guid? externalBadgeId)
    {
        try 
        {
            await _portfolioService.UpdatePortfolioStatus(id, status, feedback, externalBadgeId);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Failed to update portfolio status: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePortfolio(Guid id, [FromBody] PortfolioInputModel model)
    {
        try
        {
            var portfolio = await _portfolioService.GetPortfolioById(id);
            if (portfolio == null)
                return NotFound("Portfolio not found");

            if (portfolio.User.Id != _requestContext.UserId)
                return Forbid();

            await _portfolioService.UpdatePortfolio(id, model);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Failed to update portfolio: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePortfolio(Guid id)
    {
        try
        {
            var portfolio = await _portfolioService.GetPortfolioById(id);
            if (portfolio == null)
                return NotFound("Portfolio not found");

            if (portfolio.User.Id != _requestContext.UserId)
                return Forbid();

            await _portfolioService.DeletePortfolio(id);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Failed to delete portfolio: {ex.Message}");
        }
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadFile(Guid id)
    {
        try
        {
            var portfolio = await _portfolioService.GetPortfolioById(id);
            if (portfolio == null)
                return NotFound("Portfolio not found");

            if (string.IsNullOrEmpty(portfolio.FileUrl))
                return NotFound("No file available for this portfolio");

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", portfolio.FileUrl);
            if (!System.IO.File.Exists(filePath))
                return NotFound("File not found");

            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            var fileName = Path.GetFileName(portfolio.FileUrl);
            return File(memory, "application/octet-stream", fileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Failed to download file: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPortfolio(Guid id)
    {
        var portfolio = await _portfolioService.GetPortfolioById(id);
        if (portfolio == null)
            return NotFound();
            
        return Ok(portfolio);
    }

    [HttpGet("image/{id}")]
    public async Task<IActionResult> GetImage(Guid id)
    {
        var portfolio = await _portfolioService.GetPortfolioById(id);
        if (portfolio == null || string.IsNullOrEmpty(portfolio.ScreenshotUrl))
            return NotFound();

        // Convert base64 to bytes
        var base64Data = portfolio.ScreenshotUrl.Split(',').Last();
        var imageBytes = Convert.FromBase64String(base64Data);
        
        // Determine content type from the base64 header
        var contentType = portfolio.ScreenshotUrl.Contains("data:image/png") ? "image/png" : "image/jpeg";
        
        return File(imageBytes, contentType);
    }
}
