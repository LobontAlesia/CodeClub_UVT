using API.Services;
using API.Services.Implementation;
using API.Utils;

namespace API.SetupExtensions;

public static class AddServiceExtensions
{
    public static IServiceCollection AddServices(this IServiceCollection services) =>
        services
            .AddTransient<IAuthService, AuthService>()
            .AddTransient<IUserService, UserService>()
            .AddTransient<ILearningCourseService, LearningCourseService>()
            .AddTransient<IExternalBadgeService, ExternalBadgeService>()
            .AddTransient<IPortfolioService, PortfolioService>()
            .AddTransient<IChapterService, ChapterService>()
            .AddSingleton<OpenAIHelper>(); 
}