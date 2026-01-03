import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { useSignalR } from '../hooks/useSignalR';
import { useVoice } from '../hooks/useVoice';
import { LogOut, Hash, Mic, MicOff, Send, PhoneOff } from 'lucide-react';

export default function ChatPage() {
    const { user, logout } = useAuthStore();
    const { channels, fetchChannels, createChannel, currentChannelId, selectChannel, messages, fetchMessages } = useChatStore();
    const { chatConnection } = useSignalR();
    const { joinVoice, leaveVoice, isJoined, currentVoiceChannelId } = useVoice();
    const [newMessage, setNewMessage] = useState('');

    // Initial fetch
    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    // SignalR Listeners
    useEffect(() => {
        if (!chatConnection) return;

        chatConnection.on('ReceiveMessage', (_username: string, _content: string) => {
            // This is a simplified handler. Ideally we receive the full message object or fetch it.
            // For now, let's refetch messages if we are in the channel.
            // Or better, let's just wait for real implementation via events.
            // But since we implemented addMessage in store, let's try to simulate or fetch.
            // In real app, SignalR should send full MessageDto.
            // Assuming Backend sends MessageDto now? Wait, backend ChatHub sends (user, content).
            // Let's rely on REST API return for own messages and polling or detailed SignalR implementation for others.
            // For this MVP, let's just re-fetch messages for simplicity when event received.
            if (currentChannelId) {
                fetchMessages(currentChannelId);
            }
        });

        return () => {
            chatConnection.off('ReceiveMessage');
        };
    }, [chatConnection, currentChannelId, fetchMessages]);

    // Send message handler
    const onSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentChannelId || !newMessage.trim()) return;

        // Use the API client directly for now or add to store
        const { default: api } = await import('../services/api');
        await api.post(`/channels/${currentChannelId}/messages`, { content: newMessage });

        // SignalR will trigger refresh or we add manually
        setNewMessage('');
        fetchMessages(currentChannelId); // optimistic update or refetch

        // Notify others via Hub
        if (chatConnection) {
            await chatConnection.invoke('SendMessage', currentChannelId, newMessage);
        }
    };

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar */}
            <div className="flex w-64 flex-col border-r bg-card">
                <div className="flex items-center justify-between p-4 border-b">
                    <h1 className="font-bold">WagayaDiscord</h1>
                    <button onClick={logout} className="p-2 hover:bg-accent rounded"><LogOut size={16} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-4">
                        <h2 className="mb-2 text-xs font-semibold text-muted-foreground uppercase">Text Channels</h2>
                        <div className="space-y-1">
                            {channels.filter(c => c.type === 0).map(channel => (
                                <button
                                    key={channel.id}
                                    onClick={() => selectChannel(channel.id)}
                                    className={`flex w-full items-center gap-2 rounded px-2 py-1 text-sm ${currentChannelId === channel.id ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
                                >
                                    <Hash size={16} />
                                    {channel.name}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => createChannel(`channel-${channels.length + 1}`, 0)}
                            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                            + Create Channel
                        </button>
                    </div>

                    <div>
                        <h2 className="mb-2 text-xs font-semibold text-muted-foreground uppercase">Voice Channels</h2>
                        <div className="space-y-1">
                            {channels.filter(c => c.type === 1).map(channel => (
                                <button
                                    key={channel.id}
                                    onClick={() => {
                                        if (isJoined && currentVoiceChannelId === channel.id) {
                                            leaveVoice();
                                        } else {
                                            joinVoice(channel.id);
                                        }
                                    }}
                                    className={`flex w-full items-center justify-between rounded px-2 py-1 text-sm ${currentVoiceChannelId === channel.id ? 'bg-green-500/20 text-green-500' : 'hover:bg-accent/50'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        {currentVoiceChannelId === channel.id ? <Mic size={16} /> : <MicOff size={16} />}
                                        {channel.name}
                                    </div>
                                    {currentVoiceChannelId === channel.id && <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
                                </button>
                            ))}
                            <button
                                onClick={() => createChannel(`voice-${channels.length + 1}`, 1)}
                                className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                                + Create Voice
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-card">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/20" />
                            <div className="text-sm font-medium">{user?.username}</div>
                        </div>
                        {isJoined && (
                            <button onClick={leaveVoice} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full" title="Disconnect Voice">
                                <PhoneOff size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {currentChannelId ? (
                    <>
                        <div className="flex items-center border-b p-4 shadow-sm">
                            <Hash size={20} className="mr-2 text-muted-foreground" />
                            <h2 className="font-bold">{channels.find(c => c.id === currentChannelId)?.name}</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className="group flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-secondary mt-1 shrink-0" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{msg.user.username}</span>
                                            <span className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t">
                            <form onSubmit={onSend} className="relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={`Message #${channels.find(c => c.id === currentChannelId)?.name}`}
                                    className="w-full rounded-md border bg-input px-4 py-3 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button type="submit" className="absolute right-3 top-3 text-muted-foreground hover:text-primary">
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Select a channel to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
