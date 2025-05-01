using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using API.Constants;

namespace API;

public class RequestContext
{
    public Guid UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = [];

    public RequestContext(IHttpContextAccessor httpContextAccessor)
    {
        ClaimsPrincipal? user = httpContextAccessor.HttpContext?.User;

        if (user?.Identity?.IsAuthenticated == true)
        {
            UserId = Guid.Parse(user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? throw new InvalidOperationException());
            FirstName = user.FindFirst(JwtRegisteredClaimNames.GivenName)?.Value ?? throw new InvalidOperationException();
            LastName = user.FindFirst(JwtRegisteredClaimNames.FamilyName)?.Value ?? throw new InvalidOperationException();
            Email = user.FindFirst(JwtRegisteredClaimNames.Email)?.Value ?? throw new InvalidOperationException();
            Roles = user.FindAll(CustomClaimTypes.Roles).Select(c => c.Value).ToList();
        }
    }
}