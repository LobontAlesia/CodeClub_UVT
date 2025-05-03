using API.Models;

namespace API.Services;

public interface IChapterService
{
    Task<List<GeneratedQuizQuestion>> GenerateQuizWithAI(Guid chapterId);
}