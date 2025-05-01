using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories.Implementation;

public class ChapterElementRepository : BaseRepository<ChapterElement>, IChapterElementRepository
{
    private readonly PostgresDbContext _context;

    public ChapterElementRepository(PostgresDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<ChapterElement?> GetByIdAsync(Guid id)
    {
        return await _context.Set<ChapterElement>()
            .Include(e => e.Form)
            .FirstOrDefaultAsync(e => e.Id == id);
    }
}