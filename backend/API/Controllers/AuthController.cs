using Microsoft.AspNetCore.Mvc;
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
{
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