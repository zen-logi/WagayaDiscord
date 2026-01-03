using System.ComponentModel.DataAnnotations;

namespace WagayaDiscord.Server.Models;

public record LoginRequest(
    [Required] string Username,
    [Required] string Password
);

public record RegisterRequest(
    [Required] string Username,
    [Required] string Password
);

public record UserDto(
    string Id,
    string Username,
    DateTime CreatedAt
);
