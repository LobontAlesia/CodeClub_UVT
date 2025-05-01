using API.Entities;
using API.Models;
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
            .OrderBy(c => c.Index)
            .ToListAsync();

    public async Task<LearningCourse?> GetByIdAsync(Guid id) =>
        await _context.LearningCourses
            .Include(lc => lc.Badge)
            .Include(lc => lc.Tags)
            .Include(lc => lc.Lessons)
            .FirstOrDefaultAsync(lc => lc.Id == id);

    public async Task<bool> ExistsWithBadgeAsync(Guid badgeId)
    {
        return await _context.LearningCourses.AnyAsync(lc => lc.BadgeId == badgeId);
    }

    public async Task<bool> ExistsWithBadgeAsync(Guid badgeId, Guid excludeCourseId)
    {
        return await _context.LearningCourses.AnyAsync(lc => lc.BadgeId == badgeId && lc.Id != excludeCourseId);
    }

    public async Task<bool> ExistsWithBadgeIconAsync(string icon)
    {
        return await _context.LearningCourses
            .Include(lc => lc.Badge)
            .AnyAsync(lc => lc.Badge != null && lc.Badge.Icon == icon);
    }

    public async Task<bool> ExistsWithBadgeIconAsync(string icon, Guid excludeCourseId)
    {
        return await _context.LearningCourses
            .Include(lc => lc.Badge)
            .AnyAsync(lc => lc.Id != excludeCourseId && lc.Badge != null && lc.Badge.Icon == icon);
    }

    public async Task ReorderCoursesAsync(List<ReorderCourseDto> courses)
    {
        var existingCourses = await _context.LearningCourses.ToListAsync();

        foreach (var course in existingCourses)
        {
            var found = courses.FirstOrDefault(x => x.Id == course.Id.ToString());
            if (found != null)
            {
                course.Index = found.Index;
            }
        }

        await _context.SaveChangesAsync();
    }
}