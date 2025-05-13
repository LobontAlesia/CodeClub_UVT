using API.Models.Auth;
using API.Entities;
using API.Mappers;
using API.Repositories;
using API.Utils;

namespace API.Services.Implementation;

public class AuthService(IUserRepository userRepository) : IAuthService
{
    public async Task<bool> RegisterAsync(RegisterModel registerModel)
    {
        User user = UserMapper.MapRegisterModelToUserEntity(registerModel);

        user.Roles =
        [
            new Role
            {
                Name = "User",
            }
        ];

        await userRepository.CreateAsync(user);

        return true;
    }

    public async Task<AuthResponseModel?> LoginAsync(LoginModel loginModel)
    {
        try 
        {
            User? user;
            if (loginModel.Username != null)
            {
                user = await userRepository.GetByUsernameAsync(loginModel.Username);
            }
            else if (loginModel.Email != null)
            {
                user = await userRepository.GetByEmailAsync(loginModel.Email);
            }
            else
            {
                Console.WriteLine("Login failed: Both username and email are null");
                return null;
            }

            if (user == null)
            {
                Console.WriteLine($"Login failed: User not found for username: {loginModel.Username} or email: {loginModel.Email}");
                return null;
            }

            if (!BCrypt.Net.BCrypt.EnhancedVerify(loginModel.Password, user.PasswordHash))
            {
                Console.WriteLine("Login failed: Invalid password");
                return null;
            }

            return new AuthResponseModel
            {
                Token = JwtUtil.GenerateToken(user),
                RefreshToken = user.RefreshToken
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Exception during login: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            throw; // Re-throw to maintain the 500 status code
        }
    }    public async Task<AuthResponseModel?> RefreshTokenAsync(string refreshToken)
    {
        User? user = await userRepository.GetByRefreshTokenAsync(refreshToken);
        if (user == null)
        {
            return null;
        }

        if (user.RefreshTokenExpiryTime < DateTime.UtcNow)
        {
            return new AuthResponseModel
            {
                Token = JwtUtil.GenerateToken(user),
                RefreshToken = JwtUtil.GenerateRefreshToken()
            };
        }

        return new AuthResponseModel
        {
            Token = JwtUtil.GenerateToken(user),
            RefreshToken = user.RefreshToken
        };
    }    public Task<bool> VerifyPasswordAsync(User user, string password)
    {
        return Task.FromResult(BCrypt.Net.BCrypt.EnhancedVerify(password, user.PasswordHash));
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.EnhancedHashPassword(password);
    }
}