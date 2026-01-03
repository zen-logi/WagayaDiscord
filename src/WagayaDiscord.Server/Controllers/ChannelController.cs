using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WagayaDiscord.Server.Models;
using WagayaDiscord.Server.Services.Interfaces;

namespace WagayaDiscord.Server.Controllers;

[Authorize]
[ApiController]
[Route("api/channels")]
public class ChannelController : ControllerBase
{
    private readonly IChannelService _channelService;

    public ChannelController(IChannelService channelService)
    {
        _channelService = channelService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ChannelDto>>> GetChannels()
    {
        var channels = await _channelService.GetChannelsAsync();
        return Ok(channels);
    }

    [HttpPost]
    public async Task<ActionResult<ChannelDto>> CreateChannel(CreateChannelRequest request)
    {
        var channel = await _channelService.CreateChannelAsync(request);
        return CreatedAtAction(nameof(GetChannels), new { id = channel.Id }, channel);
    }

    [HttpGet("{channelId}/messages")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessages(string channelId)
    {
        var messages = await _channelService.GetMessagesAsync(channelId);
        return Ok(messages);
    }

    [HttpPost("{channelId}/messages")]
    public async Task<ActionResult<MessageDto>> SendMessage(string channelId, [FromBody] SendMessageRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var message = await _channelService.CreateMessageAsync(channelId, userId, request.Content);
        return Ok(message);
    }
}
