using API.Repositories;
using API.Repositories.Implementation;

namespace API.SetupExtensions;

public static class AddRepositoryExtensions
{
    public static IServiceCollection AddRepositories(this IServiceCollection services) =>
        services
            .AddTransient<IRoleRepository, RoleRepository>()
            .AddTransient<IUserRepository, UserRepository>()
            .AddTransient<ILearningCourseRepository, LearningCourseRepository>()
            .AddTransient<ITagRepository, TagRepository>()
            .AddTransient<ILessonRepository, LessonRepository>()
            .AddTransient<IBadgeRepository, BadgeRepository>()
            .AddTransient<IChapterRepository, ChapterRepository>()
            .AddTransient<IChapterElementRepository, ChapterElementRepository>()
            .AddTransient<IQuizFormRepository, QuizFormRepository>(); 
}