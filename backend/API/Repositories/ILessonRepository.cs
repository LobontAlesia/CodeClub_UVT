using API.Entities;
using API.Models;

namespace API.Repositories;

public interface ILessonRepository : IBaseRepository<Lesson>
{
    Task<List<Lesson>> GetAllByCourseIdAsync(Guid courseId);
    Task<Lesson?> GetByTitleAsync(string lessonTitle);
    Task<Lesson?> GetByIdWithCourseAsync(Guid lessonId);
    Task<Lesson?> GetByIdAsync(Guid lessonId); 
    Task AddAsync(Lesson lesson);
    Task SaveChangesAsync();
    Task ReorderLessonsAsync(Guid courseId, List<ReorderLessonDto> lessons);
}