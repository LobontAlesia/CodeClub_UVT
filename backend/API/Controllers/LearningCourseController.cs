using API.Mappers;
using API.Models;
using API.Repositories;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("[controller]")]
[ApiController]
public class LearningCourseController(
    ILearningCourseService learningCourseService,
    ILearningCourseRepository learningCourseRepository
    ) : ControllerBase
{
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateLearningCourse([FromBody] LearningCourseInputModel learningCourseInputModel)
    {
        try
        {
            bool success = await learningCourseService.CreateAsync(learningCourseInputModel);
            return success ? Ok() : BadRequest("Course creation failed");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    
    [HttpGet]
    public async Task<ActionResult<List<LearningCourseModel>>> GetAllLearningCourses() =>
        Ok((await learningCourseRepository.GetAllAsync())
            .Select(LearningCourseMapper.MapLearningCourseEntityToLearningCourseModel)
            .ToList());
    
    [HttpGet("{id}")]
    public async Task<ActionResult<LearningCourseModel>> GetLearningCourseById([FromRoute] Guid id)
    {
        var course = await learningCourseRepository.GetByIdAsync(id);
        if (course == null)
        {
            return NotFound();
        }
        return Ok(LearningCourseMapper.MapLearningCourseEntityToLearningCourseModel(course));
    }
    
    [Authorize(Roles = "Admin")]
    [HttpPatch("{learningCourseId}")]
    public async Task<IActionResult> UpdateLearningCourse(
        [FromRoute] Guid learningCourseId,
        [FromBody] LearningCoursePatchModel learningCoursePatchModel)
    {
        if (learningCourseId != learningCoursePatchModel.Id)
        {
            return BadRequest();
        }

        return await learningCourseService.UpdateAsync(learningCoursePatchModel) ? Ok() : BadRequest();
    }
    
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLearningCourse([FromRoute] Guid id)
    {
        var course = await learningCourseRepository.GetByIdAsync(id);
        if (course == null)
        {
            return NotFound();
        }

        await learningCourseRepository.DeleteAsync(course);
        return Ok();
    }

    [HttpPut("reorder")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ReorderCourses([FromBody] ReorderCoursesRequest request)
    {
        try
        {
            await learningCourseRepository.ReorderCoursesAsync(request.Courses);
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error reordering courses", error = ex.Message });
        }
    }
}
