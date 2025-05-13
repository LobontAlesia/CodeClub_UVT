using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using API.Models.Auth;
using API.Repositories;
using API.Services;

namespace API.Controllers;

[Route("[controller]")]
[ApiController]
public class AuthController(
    IAuthService authService,
    IUserService userService,
    IUserRepository userRepository
    ) : ControllerBase
{    [Authorize]
    [HttpGet("profile/{userId}")]
    public async Task<ActionResult<UserProfileModel>> GetUserProfile([FromRoute] string userId)
    {
        // Get the current user's ID from the claims
        var currentUserIdClaim = User.FindFirst("sub")?.Value;
        
        // Check if the user is trying to access their own profile
        if (currentUserIdClaim != userId && !User.IsInRole("Admin"))
        {
            return Forbid();
        }
        
        var user = await userRepository.GetByIdAsync(Guid.Parse(userId));
        if (user == null)
        {
            return NotFound();
        }
          return Ok(new UserProfileModel
        {
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Avatar = user.Avatar
        });    }
      [Authorize]
    [HttpPut("profile/{userId}")]
    public async Task<ActionResult<bool>> UpdateUserProfile([FromRoute] string userId, [FromBody] UpdateProfileModel model)
    {
        // Get the current user's ID from the claims
        var currentUserIdClaim = User.FindFirst("sub")?.Value;
        
        // Check if the user is trying to update their own profile
        if (currentUserIdClaim != userId && !User.IsInRole("Admin"))
        {
            return Forbid();
        }
        
        var user = await userRepository.GetByIdAsync(Guid.Parse(userId));
        if (user == null)
        {
            return NotFound();
        }

        // If changing password
        if (!string.IsNullOrEmpty(model.CurrentPassword) && !string.IsNullOrEmpty(model.NewPassword))
        {
            bool isPasswordValid = await authService.VerifyPasswordAsync(user, model.CurrentPassword);
            if (!isPasswordValid)
            {
                return BadRequest("Current password is incorrect");
            }
            
            user.PasswordHash = authService.HashPassword(model.NewPassword);
        }

        // Check if username already exists (if changed)
        if (user.Username != model.Username && await userRepository.CheckIfUsernameExistsAsync(model.Username))
        {
            return BadRequest("Username already exists");
        }

        // Check if email already exists (if changed)
        if (user.Email != model.Email && await userRepository.CheckIfEmailExistsAsync(model.Email))
        {
            return BadRequest("Email already exists");
        }        // Update user data
        user.Username = model.Username;
        user.Email = model.Email;
        user.FirstName = model.FirstName;
        user.LastName = model.LastName;
        user.Avatar = model.Avatar;
        user.UpdatedAt = DateTime.UtcNow;

        var updatedUser = await userRepository.UpdateAsync(user);
        return Ok(updatedUser != null);
    }
    
    [HttpGet("username/{username}")]
    public async Task<ActionResult<bool>> CheckUsername([FromRoute] string username) =>
        Ok(await userRepository.CheckIfUsernameExistsAsync(username));

    [HttpGet("email/{email}")]
    public async Task<ActionResult<bool>> CheckEmail([FromRoute] string email) =>
        Ok(await userRepository.CheckIfEmailExistsAsync(email));


    [HttpPost("register")]
    public async Task<ActionResult<bool>> Register([FromBody] RegisterModel registerModel) =>
        Ok(await authService.RegisterAsync(registerModel));

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseModel>> Login([FromBody] LoginModel loginModel)
    {
        AuthResponseModel? authResponse = await authService.LoginAsync(loginModel);

        return authResponse == null ? BadRequest() : Ok(authResponse);
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthResponseModel>> RefreshToken([FromBody] RefreshTokenModel refreshTokenModel)
    {
        AuthResponseModel? authResponse = await authService.RefreshTokenAsync(refreshTokenModel.RefreshToken);

        if (authResponse == null)
        {
            return BadRequest();
        }

        if (authResponse.RefreshToken != refreshTokenModel.RefreshToken)
        {
            bool isUserUpdated = await userService.UpdateRefreshTokenAsync(refreshTokenModel.RefreshToken, authResponse.RefreshToken);
            if (!isUserUpdated)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        return Ok(authResponse);
    }
}