using WagayaDiscord.Server.Models;

namespace WagayaDiscord.Server.Services.Interfaces;

public interface IUserService
{
    Task<UserDto> RegisterAsync(RegisterRequest request);
    Task<UserDto?> LoginAsync(LoginRequest request);
    Task<UserDto?> GetUserByIdAsync(string userId);
}
