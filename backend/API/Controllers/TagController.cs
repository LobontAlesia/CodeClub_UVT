using API.Entities;
using API.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("[controller]")]
[ApiController]
public class TagController(ITagRepository tagRepository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<string>>> GetAllTags()
    {
        var tags = await tagRepository.GetAllAsync();
        return Ok(tags.Select(t => t.Name).ToList());
    }

    [HttpPost]
    public async Task<IActionResult> CreateTag([FromBody] string tagName)
    {
        if (string.IsNullOrWhiteSpace(tagName))
        {
            return BadRequest("Tag name cannot be empty");
        }

        var existingTag = await tagRepository.GetByNameAsync(tagName);
        if (existingTag != null)
        {
            return Conflict("Tag already exists");
        }

        var tag = new Tag { Name = tagName };
        await tagRepository.CreateAsync(tag);

        return Ok();
    }
}