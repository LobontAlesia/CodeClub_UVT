public static class AddCorsExtensions
{
    public static IServiceCollection AddCorsExtension(this IServiceCollection services) =>
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.WithOrigins("http://localhost:5173")  
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();  
            });
        });
}
