using WagayaDiscord.Server.Entities;

namespace WagayaDiscord.Server.Models;

public record ChannelDto(
    string Id,
    string Name,
    ChannelType Type
);

public record CreateChannelRequest(
    string Name,
    ChannelType Type
);

public record MessageDto(
    string Id,
    string ChannelId,
    UserDto User,
    string Content,
    DateTime CreatedAt
);

public record SendMessageRequest(
    string Content
);
