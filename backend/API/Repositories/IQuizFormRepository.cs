using API.Entities;

namespace API.Repositories;

public interface IQuizFormRepository : IBaseRepository<QuizForm>
{
    Task<QuizForm?> GetByIdWithQuestionsAsync(Guid id);
}