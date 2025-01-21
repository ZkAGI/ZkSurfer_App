import { create } from 'zustand';

interface TwitterAuthState {
    username: string;
    email: string;
    password: string;
    setTwitterCredentials: (credentials: Partial<Omit<TwitterAuthState, 'setTwitterCredentials'>>) => void;
}

export const useTwitterAuthStore = create<TwitterAuthState>((set) => ({
    username: '',
    email: '',
    password: '',
    setTwitterCredentials: (credentials) =>
        set((state) => ({
            ...state,
            ...credentials,
        })),
}));
