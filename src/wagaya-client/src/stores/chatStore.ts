import { create } from 'zustand';
import api from '../services/api';

export interface Channel {
    id: string;
    name: string;
    type: 0 | 1; // 0: Text, 1: Voice
}

export interface Message {
    id: string;
    channelId: string;
    user: { id: string; username: string };
    content: string;
    createdAt: string;
}

interface ChatState {
    channels: Channel[];
    currentChannelId: string | null;
    messages: Message[];
    fetchChannels: () => Promise<void>;
    createChannel: (name: string, type: 0 | 1) => Promise<void>;
    selectChannel: (channelId: string) => void;
    fetchMessages: (channelId: string) => Promise<void>;
    addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    channels: [],
    currentChannelId: null,
    messages: [],

    fetchChannels: async () => {
        const response = await api.get('/channels');
        set({ channels: response.data });
    },

    createChannel: async (name, type) => {
        const response = await api.post('/channels', { name, type });
        set((state) => ({ channels: [...state.channels, response.data] }));
    },

    selectChannel: (channelId) => {
        set({ currentChannelId: channelId });
        get().fetchMessages(channelId);
    },

    fetchMessages: async (channelId) => {
        const response = await api.get(`/channels/${channelId}/messages`);
        set({ messages: response.data });
    },

    addMessage: (message) => {
        set((state) => {
            // Current channel only
            if (message.channelId === state.currentChannelId) {
                return { messages: [...state.messages, message] };
            }
            return state;
        });
    },
}));
