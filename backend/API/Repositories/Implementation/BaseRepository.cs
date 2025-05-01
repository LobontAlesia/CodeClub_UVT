using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace API.Repositories.Implementation;

public class BaseRepository<T>(PostgresDbContext context) : IBaseRepository<T> where T : class
{
    public async Task<T?> CreateAsync(T entity)
    {
        try
        {
            EntityEntry<T> entry = await context.Set<T>().AddAsync(entity);
            await context.SaveChangesAsync();
            return entry.Entity;
        }
        catch (DbUpdateException ex)
        {
            // Log the error or handle specific database update exceptions
            throw new Exception($"Failed to create entity: {ex.InnerException?.Message ?? ex.Message}");
        }
    }

    public async Task<T?> UpdateAsync(T entity)
    {
        try
        {
            EntityEntry<T> entry = context.Set<T>().Update(entity);
            await context.SaveChangesAsync();
            return entry.Entity;
        }
        catch (DbUpdateException ex)
        {
            throw new Exception($"Failed to update entity: {ex.InnerException?.Message ?? ex.Message}");
        }
    }

    public async Task<bool> DeleteAsync(T entity)
    {
        try
        {
            context.Set<T>().Remove(entity);
            return await context.SaveChangesAsync() > 0;
        }
        catch (DbUpdateException ex)
        {
            throw new Exception($"Failed to delete entity: {ex.InnerException?.Message ?? ex.Message}");
        }
    }
}