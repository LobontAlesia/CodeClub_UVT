namespace API.Repositories;

public interface IBaseRepository<T> where T : class
{
    Task<T?> CreateAsync(T entity);
    Task<T?> UpdateAsync(T entity);
    Task<bool> DeleteAsync(T entity);
}