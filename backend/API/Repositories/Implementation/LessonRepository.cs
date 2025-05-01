using API.Entities;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories.Implementation;

public class LessonRepository : BaseRepository<Lesson>, ILessonRepository
{
    private readonly PostgresDbContext _context;

    public LessonRepository(PostgresDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<List<Lesson>> GetAllByCourseIdAsync(Guid courseId) =>
        await _context.Set<Lesson>().Where(l => l.LearningCourseId == courseId).Include(l => l.Chapters).ToListAsync();

    public async Task<Lesson?> GetByTitleAsync(string lessonTitle)
    {
        return await _context.Set<Lesson>().FirstOrDefaultAsync(x => x.Title.ToLower().Equals(lessonTitle.ToLower()));
    }
    
    public async Task AddAsync(Lesson lesson)
    {
        await _context.Set<Lesson>().AddAsync(lesson);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
    
    public async Task<Lesson?> GetByIdAsync(Guid lessonId)
    {
        return await _context.Set<Lesson>()
            .Include(l => l.Chapters)
            .FirstOrDefaultAsync(l => l.Id == lessonId);
    }

    public async Task<Lesson?> GetByIdWithCourseAsync(Guid lessonId)
    {
        return await _context.Set<Lesson>()
            .Include(l => l.LearningCourse)
            .FirstOrDefaultAsync(l => l.Id == lessonId);
    }

    public async Task ReorderLessonsAsync(Guid courseId, List<ReorderLessonDto> lessons)
    {
        var existing = await _context.Lessons
            .Where(l => l.LearningCourseId == courseId)
            .ToListAsync();

        foreach (var l in existing)
        {
            var found = lessons.FirstOrDefault(x => x.Id == l.Id.ToString());
            if (found != null)
            {
                l.Index = found.Index;
            }
        }

        await _context.SaveChangesAsync();
    }
}