using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories.Implementation;

public class QuizFormRepository : BaseRepository<QuizForm>, IQuizFormRepository
{
    private readonly PostgresDbContext _context;

    public QuizFormRepository(PostgresDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<QuizForm?> GetByIdWithQuestionsAsync(Guid id)
    {
        return await _context.Set<QuizForm>()
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == id);
    }
    
    public new async Task UpdateAsync(QuizForm quizForm)
    {
        _context.Set<QuizForm>().Update(quizForm);
        await _context.SaveChangesAsync();
    }


}