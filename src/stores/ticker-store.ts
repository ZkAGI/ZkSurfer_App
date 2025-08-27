import { create } from 'zustand';

interface TickerInfo {
    description: string;
    memecoin_address: null;
    coin_name: string;
    image_base64: string; // generated image stored here
    training_data: any[];
    urls: string[];
    seed: number;
    user_prompt: string;
}

interface TickerState {
    selectedTicker: string | null;
    availableTickers: string[];
    tickerInfo: Record<string, TickerInfo>;
    setSelectedMemeTicker: (ticker: string | null) => void;
    setAvailableTickers: (tickers: string[]) => void;
    setTickerInfo: (ticker: string, info: TickerInfo) => void;
}

export const useTickerStore = create<TickerState>((set) => ({
    selectedTicker: null,
    availableTickers: [],
    tickerInfo: {},
    setSelectedMemeTicker: (ticker) => set({ selectedTicker: ticker }),
    setAvailableTickers: (tickers) => set({ availableTickers: tickers }),
    setTickerInfo: (ticker, info) =>
        set((state) => ({
            tickerInfo: {
                ...state.tickerInfo,
                [ticker]: info
            }
        }))
}));