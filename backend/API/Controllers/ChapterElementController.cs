using API.Entities;
using API.Models;
using API.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Constants;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;

namespace API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ChapterElementController(
        IChapterRepository chapterRepository,
        IChapterElementRepository chapterElementRepository,
        IQuizFormRepository quizFormRepository,
        PostgresDbContext dbContext
    ) : ControllerBase
    {
        private static readonly ConcurrentDictionary<string, List<string>> _imageChunks = new();

        [HttpPost("chapter/{chapterId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CreateElement([FromRoute] Guid chapterId, [FromBody] ChapterElementModel model)
        {
            try
            {
                var chapter = await chapterRepository.GetByIdWithElementsAsync(chapterId);
                if (chapter == null)
                    return NotFound("Chapter not found");

                var maxIndex = chapter.Elements.Any() ? chapter.Elements.Max(e => e.Index) : 0;

                var element = new ChapterElement
                {
                    Id = Guid.NewGuid(),
                    Index = maxIndex + 1,
                    Title = model.Title,
                    Type = model.Type,
                    Content = model.Content,
                    Image = model.Image,
                    FormId = model.FormId,
                    ChapterId = chapterId
                };

                var savedElement = await chapterElementRepository.CreateAsync(element);
                if (savedElement == null)
                {
                    return StatusCode(500, "Failed to create element");
                }

                return Ok(element.Id);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating element: {ex.Message}");
            }
        }

        [HttpPost("chapter/{chapterId}/chunk")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> CreateElementChunk([FromRoute] Guid chapterId, [FromBody] ChapterElementChunkModel model)
        {
            try
            {
                if (!model.IsChunk || model.ChunkIndex >= model.TotalChunks)
                    return BadRequest("Invalid chunk data");

                if (string.IsNullOrEmpty(model.Image))
                    return BadRequest("Image chunk cannot be null or empty");

                var chunkKey = $"{chapterId}_{model.Title}_{DateTime.UtcNow:yyyyMMdd}";
                var chunks = _imageChunks.GetOrAdd(chunkKey, _ => new List<string>());

                // Add this chunk
                chunks.Add(model.Image);

                // If we have all chunks, create the element
                if (chunks.Count == model.TotalChunks)
                {
                    var completeImage = string.Concat(chunks);
                    var element = new ChapterElement
                    {
                        Id = Guid.NewGuid(),
                        Index = model.Index,
                        Title = model.Title,
                        Type = model.Type,
                        Image = completeImage,
                        ChapterId = chapterId
                    };

                    var savedElement = await chapterElementRepository.CreateAsync(element);
                    if (savedElement == null)
                    {
                        return StatusCode(500, "Failed to create element");
                    }

                    // Clean up chunks
                    _imageChunks.TryRemove(chunkKey, out _);

                    return Ok(element.Id);
                }

                return Ok(new { message = $"Chunk {model.ChunkIndex + 1} of {model.TotalChunks} received" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error processing chunk: {ex.Message}");
            }
        }

        [HttpGet("{elementId}")]
        public async Task<ActionResult<ChapterElement>> GetById([FromRoute] Guid elementId)
        {
            var element = await chapterElementRepository.GetByIdAsync(elementId);
            if (element == null)
                return NotFound("Element not found");
            return Ok(element);
        }

        [HttpPut("{elementId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateElement([FromRoute] Guid elementId, [FromBody] ChapterElementModel model)
        {
            var element = await chapterElementRepository.GetByIdAsync(elementId);
            if (element == null)
                return NotFound("Element not found");

            element.Title = model.Title;
            element.Type = model.Type;
            element.Content = model.Content;
            element.Image = model.Image;
            element.FormId = model.FormId;
            element.Index = model.Index;

            await chapterElementRepository.UpdateAsync(element);
            return Ok();
        }

        [HttpPut("{elementId}/chunk")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> UpdateElementChunk([FromRoute] Guid elementId, [FromBody] ChapterElementChunkModel model)
        {
            try
            {
                if (!model.IsChunk || model.ChunkIndex >= model.TotalChunks)
                    return BadRequest("Invalid chunk data");

                if (string.IsNullOrEmpty(model.Image))
                    return BadRequest("Image chunk cannot be null or empty");

                var chunkKey = $"{elementId}_{model.Title}_{DateTime.UtcNow:yyyyMMdd}";
                var chunks = _imageChunks.GetOrAdd(chunkKey, _ => new List<string>());

                // Add this chunk
                chunks.Add(model.Image);

                // If we have all chunks, update the element
                if (chunks.Count == model.TotalChunks)
                {
                    var element = await chapterElementRepository.GetByIdAsync(elementId);
                    if (element == null)
                        return NotFound("Element not found");

                    var completeImage = string.Concat(chunks);
                    element.Title = model.Title;
                    element.Type = model.Type;
                    element.Image = completeImage;
                    element.Index = model.Index;
                    element.FormId = model.FormId;

                    await chapterElementRepository.UpdateAsync(element);

                    // Clean up chunks
                    _imageChunks.TryRemove(chunkKey, out _);

                    return Ok();
                }

                return Ok(new { message = $"Chunk {model.ChunkIndex + 1} of {model.TotalChunks} received" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error processing chunk: {ex.Message}");
            }
        }

        [HttpDelete("{elementId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteElement([FromRoute] Guid elementId)
        {
            try 
            {
                var element = await chapterElementRepository.GetByIdAsync(elementId);
                if (element == null)
                    return NotFound("Element not found");

                if (element.Type == ChapterElementTypes.Form && element.FormId.HasValue)
                {
                    var quizForm = await quizFormRepository.GetByIdWithQuestionsAsync(element.FormId.Value);
                    if (quizForm != null)
                    {
                        await quizFormRepository.DeleteAsync(quizForm);
                    }
                }

                await chapterElementRepository.DeleteAsync(element);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting element: {ex.Message}");
            }
        }

        [HttpPut("/chapter/{chapterId}/reorder-elements")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReorderElements([FromRoute] Guid chapterId, [FromBody] ReorderElementsRequest request)
        {
            try
            {
                foreach (var element in request.Elements)
                {
                    var chapterElement = await chapterElementRepository.GetByIdAsync(Guid.Parse(element.Id));
                    if (chapterElement != null && chapterElement.ChapterId == chapterId)
                    {
                        chapterElement.Index = element.Index;
                        await chapterElementRepository.UpdateAsync(chapterElement);
                    }
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error reordering elements", error = ex.Message });
            }
        }

        [HttpGet("by-form/{formId}")]
        public async Task<ActionResult> GetChapterByFormId([FromRoute] Guid formId)
        {
            var element = await dbContext.ChapterElements
                .FirstOrDefaultAsync(ce => ce.FormId == formId);

            if (element == null)
                return NotFound();

            return Ok(new { chapterId = element.ChapterId });
        }
    }

    public class ReorderElementsRequest
    {
        public required List<ReorderElement> Elements { get; set; }
    }

    public class ReorderElement
    {
        public required string Id { get; set; }
        public required int Index { get; set; }
    }
}