using API.Entities;
using API.Models;

namespace API.Repositories;

public interface IChapterRepository : IBaseRepository<Chapter>
{
    Task<Chapter?> GetByIdAsync(Guid chapterId);
    Task<Chapter?> GetByIdWithElementsAsync(Guid id);
    Task ReorderChaptersAsync(Guid lessonId, List<ReorderChapterDto> chapters);
    Task SaveChangesAsync();
}
