using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories.Implementation;

public class LearningCourseRepository : BaseRepository<LearningCourse>, ILearningCourseRepository
{
    private readonly PostgresDbContext _context;

    public LearningCourseRepository(PostgresDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<List<LearningCourse>> GetAllAsync() =>
        await _context.LearningCourses
            .Include(lr => lr.Tags)
            .ToListAsync();

    public async Task<LearningCourse?> GetByIdAsync(Guid id) =>
        await _context.LearningCourses
            .Include(lc => lc.Badge)
            .Include(lc => lc.Tags)
            .Include(lc => lc.Lessons)
            .FirstOrDefaultAsync(lc => lc.Id == id);

    public async Task<bool> ExistsWithBadgeAsync(Guid badgeId)
    {
        return await _context.LearningCourses
            .Include(c => c.Badge)
            .AnyAsync(c => c.Badge != null && c.Badge.Id == badgeId);
    }

    public async Task<bool> ExistsWithBadgeAsync(Guid badgeId, Guid excludeCourseId)
    {
        return await _context.LearningCourses
            .Include(c => c.Badge)
            .AnyAsync(c => c.Badge != null && c.Badge.Id == badgeId && c.Id != excludeCourseId);
    }
}