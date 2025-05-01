using API.Entities;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories.Implementation;

public class ChapterRepository : BaseRepository<Chapter>, IChapterRepository
{
    private readonly PostgresDbContext _context;

    public ChapterRepository(PostgresDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<Chapter?> GetByIdAsync(Guid chapterId)
    {
        return await _context.Set<Chapter>()
            .Include(c => c.Elements.OrderBy(e => e.Index))
                .ThenInclude(e => e.Form)
                    .ThenInclude(f => f != null ? f.Questions : null)
            .FirstOrDefaultAsync(c => c.Id == chapterId);
    }

    public async Task<Chapter?> GetByIdWithElementsAsync(Guid id)
    {
        return await _context.Set<Chapter>()
            .Include(c => c.Elements)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task ReorderChaptersAsync(Guid lessonId, List<ReorderChapterDto> chapters)
    {
        var existing = await _context.Chapters
            .Where(c => c.LessonId == lessonId)
            .ToListAsync();

        foreach (var c in existing)
        {
            var found = chapters.FirstOrDefault(x => x.Id == c.Id.ToString());
            if (found != null)
            {
                c.Index = found.Index;
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public new async Task<bool> DeleteAsync(Chapter chapter)
    {
        try
        {
            _context.Set<Chapter>().Remove(chapter);
            await SaveChangesAsync();
            return true;
        }
        catch
        {
            return false;
        }
    }
}
