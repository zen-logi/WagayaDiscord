import { create } from 'zustand';
import api from '../services/api';

interface User {
    id: string;
    username: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true, // Check auth on load

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        set({ user: response.data, isAuthenticated: true });
    },

    register: async (credentials) => {
        const response = await api.post('/auth/register', credentials);
        set({ user: response.data, isAuthenticated: true });
    },

    logout: async () => {
        await api.post('/auth/logout');
        set({ user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        try {
            const response = await api.get('/auth/me');
            set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
}));
