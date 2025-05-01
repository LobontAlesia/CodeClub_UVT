using API.Models;
using API.Models.Auth;

namespace API.Services;

public interface IUserService
{
    Task<bool> UpdateRefreshTokenAsync(string oldRefreshToke, string newRefreshToken);
}