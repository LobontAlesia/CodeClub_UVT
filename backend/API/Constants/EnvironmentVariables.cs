namespace API.Constants;

public static class EnvironmentVariables
{
    public static void SetEnvironmentVariables(IConfiguration configuration)
    {
        CorsOrigin = configuration["CORS_ORIGIN"] ?? throw new NullReferenceException("CORS_ORIGIN");
        ConnectionString = configuration["CONNECTION_STRING"] ?? throw new NullReferenceException("CONNECTION_STRING");
        JwtIssuer = configuration["JWT_ISSUER"] ?? throw new NullReferenceException("JWT_ISSUER");
        JwtAudience = configuration["JWT_AUDIENCE"] ?? throw new NullReferenceException("JWT_AUDIENCE");
        JwtSecret = configuration["JWT_SECRET"] ?? throw new NullReferenceException("JWT_SECRET");
        JwtLifetimeMinutes = int.Parse(configuration["JWT_LIFETIME_MINUTES"]  ?? throw new NullReferenceException("JWT_LIFETIME_MINUTES"));
        RefreshTokenLifetimeMinutes =  int.Parse(configuration["REFRESH_TOKEN_LIFETIME_MINUTES"] ?? throw new NullReferenceException("REFRESH_TOKEN_LIFETIME_MINUTES"));
    }

    public static string CorsOrigin { get; private set; } = string.Empty;
    public static string ConnectionString { get; private set; } = string.Empty;
    public static string JwtIssuer { get; private set; } = string.Empty;
    public static string JwtAudience { get; private set; } = string.Empty;
    public static string JwtSecret { get; private set; } = string.Empty;
    public static int JwtLifetimeMinutes { get; private set; } = 5;
    public static int RefreshTokenLifetimeMinutes { get; private set; } = 60;
}