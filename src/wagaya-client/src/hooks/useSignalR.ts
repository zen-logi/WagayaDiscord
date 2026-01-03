import { useEffect, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '../stores/authStore';

const HUB_URL = '/hubs';

export const useSignalR = () => {
    const { user } = useAuthStore();
    const [chatConnection, setChatConnection] = useState<signalR.HubConnection | null>(null);
    const [voiceConnection, setVoiceConnection] = useState<signalR.HubConnection | null>(null);

    useEffect(() => {
        if (!user) return;

        const newChatConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${HUB_URL}/chat`)
            .withAutomaticReconnect()
            .build();

        const newVoiceConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${HUB_URL}/voice`)
            .withAutomaticReconnect()
            .build();

        setChatConnection(newChatConnection);
        setVoiceConnection(newVoiceConnection);

        return () => {
            newChatConnection.stop();
            newVoiceConnection.stop();
        };
    }, [user]);

    const startConnections = useCallback(async () => {
        if (chatConnection && chatConnection.state === signalR.HubConnectionState.Disconnected) {
            await chatConnection.start();
            console.log('Chat Hub Connected');
        }
        if (voiceConnection && voiceConnection.state === signalR.HubConnectionState.Disconnected) {
            await voiceConnection.start();
            console.log('Voice Hub Connected');
        }
    }, [chatConnection, voiceConnection]);

    useEffect(() => {
        startConnections();
    }, [startConnections]);

    return { chatConnection, voiceConnection };
};
