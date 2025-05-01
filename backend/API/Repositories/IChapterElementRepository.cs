using API.Entities;

namespace API.Repositories;

public interface IChapterElementRepository : IBaseRepository<ChapterElement>
{
    Task<ChapterElement?> GetByIdAsync(Guid id);
}