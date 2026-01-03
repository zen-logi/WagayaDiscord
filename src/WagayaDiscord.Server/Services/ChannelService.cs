using Microsoft.EntityFrameworkCore;
using WagayaDiscord.Server.Entities;
using WagayaDiscord.Server.Models;
using WagayaDiscord.Server.Services.Interfaces;

namespace WagayaDiscord.Server.Services;

public class ChannelService : IChannelService
{
    private readonly AppDbContext _context;

    public ChannelService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ChannelDto>> GetChannelsAsync()
    {
        return await _context.Channels
            .Select(c => new ChannelDto(c.Id, c.Name, c.Type))
            .ToListAsync();
    }

    public async Task<ChannelDto> CreateChannelAsync(CreateChannelRequest request)
    {
        var channel = new Channel
        {
            Name = request.Name,
            Type = request.Type
        };

        _context.Channels.Add(channel);
        await _context.SaveChangesAsync();

        return new ChannelDto(channel.Id, channel.Name, channel.Type);
    }

    public async Task<IEnumerable<MessageDto>> GetMessagesAsync(string channelId)
    {
        return await _context.Messages
            .Where(m => m.ChannelId == channelId)
            .Include(m => m.User)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new MessageDto(
                m.Id,
                m.ChannelId,
                new UserDto(m.User!.Id, m.User.Username, m.User.CreatedAt),
                m.Content,
                m.CreatedAt))
            .ToListAsync();
    }

    public async Task<MessageDto> CreateMessageAsync(string channelId, string userId, string content)
    {
        var message = new Message
        {
            ChannelId = channelId,
            UserId = userId,
            Content = content
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        // Include user info for return
        await _context.Entry(message).Reference(m => m.User).LoadAsync();

        return new MessageDto(
            message.Id,
            message.ChannelId,
            new UserDto(message.User!.Id, message.User.Username, message.User.CreatedAt),
            message.Content,
            message.CreatedAt);
    }
}
