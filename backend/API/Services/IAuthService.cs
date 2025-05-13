using API.Models.Auth;
using API.Entities;

namespace API.Services;

public interface IAuthService
{
    Task<bool> RegisterAsync(RegisterModel registerModel);
    Task<AuthResponseModel?> LoginAsync(LoginModel loginModel);
    Task<AuthResponseModel?> RefreshTokenAsync(string refreshToken);
    Task<bool> VerifyPasswordAsync(User user, string password);
    string HashPassword(string password);
}