using API.Entities;
using API.Models;

namespace API.Services;

public interface ILearningCourseService
{
    Task<bool> CreateAsync(LearningCourseInputModel learningCourseInputModel);
    Task<bool> UpdateAsync(LearningCoursePatchModel learningCoursePatchModel);
}