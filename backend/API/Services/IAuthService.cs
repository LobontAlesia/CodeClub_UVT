using API.Models.Auth;

namespace API.Services;

public interface IAuthService
{
    Task<bool> RegisterAsync(RegisterModel registerModel);
    Task<AuthResponseModel?> LoginAsync(LoginModel loginModel);
    Task<AuthResponseModel?> RefreshTokenAsync(string refreshToken);
}