namespace API.SetupExtensions;

public static class AddRequestContextExtensions
{
    public static IServiceCollection AddRequestContextExtension(this IServiceCollection services) =>
        services
            .AddHttpContextAccessor()
            .AddScoped<RequestContext>();
}