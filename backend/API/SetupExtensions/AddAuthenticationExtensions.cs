using System.Text;
using API.Constants;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace API.SetupExtensions;

public static class AddAuthenticationExtensions
{
    public static IServiceCollection AddAuthenticationExtension(this IServiceCollection services)
    {
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = EnvironmentVariables.JwtIssuer,
                ValidAudience = EnvironmentVariables.JwtAudience,
                IssuerSigningKey =
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(EnvironmentVariables.JwtSecret)),
                RoleClaimType = CustomClaimTypes.Roles
            };

            options.MapInboundClaims = false;
        });

        return services;
    }
}