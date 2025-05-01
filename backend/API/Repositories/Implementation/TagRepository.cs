using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories.Implementation;

public class TagRepository : BaseRepository<Tag>, ITagRepository
{
    private readonly PostgresDbContext _context;

    public TagRepository(PostgresDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<Tag?> GetByNameAsync(string tagName)
    {
        return await _context.Set<Tag>().FirstOrDefaultAsync(x => x.Name.ToLower().Equals(tagName.ToLower()));
    }

    public async Task<List<Tag>> GetAllAsync()
    {
        return await _context.Set<Tag>().ToListAsync();
    }
}