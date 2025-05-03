using API.Constants;
using API.Entities;
using API.Models;
using API.Models.Auth;
using API.Utils;

namespace API.Mappers;

public static class UserMapper
{
    public static UserModel MapUserEntityToUserModel(User user) =>
        new UserModel()
        {
            Id = user.Id,
            Username = user.Username,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email
        };

    public static User MapRegisterModelToUserEntity(RegisterModel registerModel) =>
        new User()
        {
            Username = registerModel.Username,
            FirstName = registerModel.FirstName,
            LastName = registerModel.LastName,
            Email = registerModel.Email,
            PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword(registerModel.Password, 13),
            RefreshToken = JwtUtil.GenerateRefreshToken(),
            RefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(EnvironmentVariables.RefreshTokenLifetimeMinutes),
            IsActive = true,
            IsLocked = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
}