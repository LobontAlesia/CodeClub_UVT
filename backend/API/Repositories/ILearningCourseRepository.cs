using API.Entities;
using API.Models;

namespace API.Repositories;

public interface ILearningCourseRepository : IBaseRepository<LearningCourse>
{
    public Task<List<LearningCourse>> GetAllAsync();
    public Task<LearningCourse?> GetByIdAsync(Guid id);
    Task<bool> ExistsWithBadgeAsync(Guid badgeId);
    Task<bool> ExistsWithBadgeAsync(Guid badgeId, Guid excludeCourseId);
    Task<bool> ExistsWithBadgeIconAsync(string icon);
    Task<bool> ExistsWithBadgeIconAsync(string icon, Guid excludeCourseId);
    Task ReorderCoursesAsync(List<ReorderCourseDto> courses);
}