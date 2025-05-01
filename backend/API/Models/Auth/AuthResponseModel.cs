namespace API.Models.Auth;

public class AuthResponseModel
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;
}