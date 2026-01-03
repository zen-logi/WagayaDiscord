using Microsoft.AspNetCore.SignalR;

namespace WagayaDiscord.Server.Hubs;

public class ChatHub : Hub
{
    public async Task JoinChannel(string channelId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, channelId);
    }

    public async Task LeaveChannel(string channelId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, channelId);
    }

    public async Task SendMessage(string channelId, string content)
    {
        // 実際にはService経由でDB保存後に送信するが、ここでは簡易実装
        // 受信クライアント側で "ReceiveMessage" をハンドリングする
        await Clients.Group(channelId).SendAsync("ReceiveMessage", Context.User?.Identity?.Name, content);
    }
}
