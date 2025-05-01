using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using API.Constants;
using Microsoft.IdentityModel.Tokens;
using API.Entities;

namespace API.Utils;

public static class JwtUtil
{
    public static string GenerateToken(User user)
    {
        JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();

        SymmetricSecurityKey securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(EnvironmentVariables.JwtSecret));
        SigningCredentials credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        List<Claim> claims =
        [
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.GivenName, user.FirstName),
            new Claim(JwtRegisteredClaimNames.FamilyName, user.LastName),
            new Claim(JwtRegisteredClaimNames.Email, user.Email)
        ];
        claims.AddRange(user.Roles.Select(role => new Claim(CustomClaimTypes.Roles, role.Name)));

        SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(EnvironmentVariables.JwtLifetimeMinutes),
            SigningCredentials = credentials,
            Issuer = EnvironmentVariables.JwtIssuer,
            Audience = EnvironmentVariables.JwtAudience
        };

        SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    public static string GenerateRefreshToken()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        RandomNumberGenerator randomNumberGenerator = RandomNumberGenerator.Create();
        char[] result = new char[32];
        byte[] buffer = new byte[32];

        randomNumberGenerator.GetBytes(buffer);

        for (int i = 0; i < 32; i++)
        {
            result[i] = chars[buffer[i] % chars.Length];
        }

        return new string(result);
    }
}