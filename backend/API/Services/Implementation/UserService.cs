using API.Constants;
using API.Entities;
using API.Repositories;

namespace API.Services.Implementation;

public class UserService(
    IUserRepository userRepository
    ) : IUserService
{
    public async Task<bool> UpdateRefreshTokenAsync(string oldRefreshToken, string newRefreshToken)
    {
        User? user = await userRepository.GetByRefreshTokenAsync(oldRefreshToken);
        if (user == null)
        {
            return false;
        }

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(EnvironmentVariables.RefreshTokenLifetimeMinutes);
        user.UpdatedAt = DateTime.UtcNow;

        User? updatedUser = await userRepository.UpdateAsync(user);

        return updatedUser != null;
    }
}