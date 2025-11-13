import { create } from "zustand";

type ModelName = "DeepSeek" | "Mistral";

interface ModelState {
  selectedModel: ModelName;
  credits: number;
  apiKey: string;
  userEmail: string | null;
  setSelectedModel: (model: ModelName) => void;
  setCredits: (credits: number) => void;
  setApiKey: (apiKey: string) => void;
  setUserEmail: (email: string | null) => void;
}

export const useModelStore = create<ModelState>((set) => ({
  // keep your default model
  selectedModel: "DeepSeek",

  // new defaults
  credits: 0,
  apiKey: "",
  userEmail: null,

  // existing setter
  setSelectedModel: (model) => set({ selectedModel: model }),

  // new setters
  setCredits: (credits) => set({ credits }),
  setApiKey: (apiKey) => set({ apiKey }),
  setUserEmail: (userEmail) => set({ userEmail }),
}));
