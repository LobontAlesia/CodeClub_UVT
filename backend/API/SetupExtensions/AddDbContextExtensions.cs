using API.Constants;
using Microsoft.EntityFrameworkCore;

namespace API.SetupExtensions;

public static class AddDbContextExtensions
{
    public static IServiceCollection AddDbContextExtension(this IServiceCollection services) =>
        services.AddDbContext<PostgresDbContext>(options =>
        {
            options.UseNpgsql(EnvironmentVariables.ConnectionString);
        });
}