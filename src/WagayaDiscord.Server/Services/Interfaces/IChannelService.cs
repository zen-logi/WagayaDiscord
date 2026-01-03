using WagayaDiscord.Server.Models;

namespace WagayaDiscord.Server.Services.Interfaces;

public interface IChannelService
{
    Task<IEnumerable<ChannelDto>> GetChannelsAsync();
    Task<ChannelDto> CreateChannelAsync(CreateChannelRequest request);
    Task<IEnumerable<MessageDto>> GetMessagesAsync(string channelId);
    Task<MessageDto> CreateMessageAsync(string channelId, string userId, string content);
}
