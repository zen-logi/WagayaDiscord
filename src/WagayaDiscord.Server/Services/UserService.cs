using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using WagayaDiscord.Server.Entities;
using WagayaDiscord.Server.Models;
using WagayaDiscord.Server.Services.Interfaces;

namespace WagayaDiscord.Server.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<UserDto> RegisterAsync(RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
        {
            throw new InvalidOperationException("Username already exists.");
        }

        var user = new User
        {
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new UserDto(user.Id, user.Username, user.CreatedAt);
    }

    public async Task<UserDto?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return null;
        }

        return new UserDto(user.Id, user.Username, user.CreatedAt);
    }

    public async Task<UserDto?> GetUserByIdAsync(string userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        return new UserDto(user.Id, user.Username, user.CreatedAt);
    }
}
