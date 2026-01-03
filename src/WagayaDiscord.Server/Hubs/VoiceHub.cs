using Microsoft.AspNetCore.SignalR;
using WagayaDiscord.Server.Services.Interfaces;

namespace WagayaDiscord.Server.Hubs;

public class VoiceHub : Hub
{
    private readonly IVoiceProcessingService _voiceProcessing;

    public VoiceHub(IVoiceProcessingService voiceProcessing)
    {
        _voiceProcessing = voiceProcessing;
    }

    public async Task JoinVoice(string channelId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, channelId);
    }

    public async Task LeaveVoice(string channelId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, channelId);
    }

    // クライアントから音声データを受信
    public async Task SendAudio(string channelId, byte[] pcmData)
    {
        // ノイズキャンセル処理
        var processedData = _voiceProcessing.ProcessAudio(pcmData);

        // 同じチャンネルの他のユーザーにブロードキャスト (自分以外)
        await Clients.OthersInGroup(channelId).SendAsync("ReceiveAudio", Context.ConnectionId, processedData);
    }
}
