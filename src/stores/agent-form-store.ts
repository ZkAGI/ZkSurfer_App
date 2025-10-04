

// "use client";
// import { create } from "zustand";

// export type ZeeForm = {
//   // Jurisdiction
//   jurisdictionType?: "business" | "individual";
//   country?: string;

//   // Contact
//   email?: string;
//   telegram?: string;
//   website?: string;

//   // Knowledge
//   knowledgeFiles?: File[];          // normalized array
//   websiteUrls?: string[];           // URLs
//   newsFilters?: string[];

//   // Character
//   masterPrompt?: string;
//   twitterAccounts?: string;

//   // Visual
//   spokespersonType?: "upload" | "preset";
//   spokespersonUpload?: File | null;
//   presetAvatar?: string;

//   // Voice
//   voiceType?: "preset" | "upload";  // "upload" will be mapped to "custom" at proxy
//   presetVoice?: string;
//   voiceSample?: File | null;        // file the backend expects

//   // Agents
//   tradingModel?: "foundational" | "custom";
//   predictionMarkets?: string[];
//   selectedAgents?: string[];

//   // Review
//   agreeToTerms?: boolean;
// };

// type AgentFormState = {
//   data: Partial<ZeeForm>;
//   setData: (patch: Partial<ZeeForm>) => void;
//   reset: () => void;
// };

// export const useAgentFormStore = create<AgentFormState>((set) => ({
//   data: {},
//   setData: (patch) => set((state) => ({ data: { ...state.data, ...patch } })),
//   reset: () => set({ data: {} }),
// }));

"use client";
import { create } from "zustand";

export type ZeeForm = {
  // Jurisdiction
  jurisdictionType?: "business" | "individual";
  country?: string;

  // Contact
  email?: string;
  telegram?: string;
  website?: string;

  // Knowledge
  knowledgeFiles?: File[];          // normalized array
  websiteUrls?: string[];           // URLs
  newsFilters?: string[];

  // Character
  masterPrompt?: string;
  twitterAccounts?: string;

  // Visual
  spokespersonType?: "upload" | "preset";
  spokespersonUpload?: File | null;
  presetAvatar?: string;

  // Voice
  voiceType?: "preset" | "upload";  // "upload" will be mapped to "custom" at backend
  presetVoice?: string;
  voiceSample?: File | null;        // file for upload option

  // Agents
  tradingModel?: "foundational" | "custom";
  predictionMarkets?: string[];
  selectedAgents?: string[];

  // Review
  agreeToTerms?: boolean;
};

type AgentFormState = {
  data: Partial<ZeeForm>;
  setData: (patch: Partial<ZeeForm>) => void;
  reset: () => void;
};

export const useAgentFormStore = create<AgentFormState>((set) => ({
  data: {},
  setData: (patch) => set((state) => ({ data: { ...state.data, ...patch } })),
  reset: () => set({ data: {} }),
}));