// // stores/agentFormStore.ts
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// type AgentBasics = {
//   name: string;
//   ticker: string;
//   shortDescription: string;
//   category: 'meme'|'research'|'defi'|'nft'|'social'|'other'| '';
// };

// type AgentPersona = {
//   voiceTone: 'playful'|'serious'|'degenerate'|'wholesome'|'analyst'| '';
//   bio: string;
//   coreTraits: string[]; // max 5
//   systemPrompt: string;
// };

// type AgentMedia = {
//   avatar: File | null;
//   banner: File | null;
//   avatarAlt: string;
// };

// type AgentSocials = {
//   twitter: string;
//   website: string;
//   discord: string;
//   launchType: 'create-only'|'create-then-coin'| '';
//   agreeToTerms: boolean;
// };

// export type AgentForm = AgentBasics & AgentPersona & AgentMedia & AgentSocials;

// type AgentFormStore = {
//   data: AgentForm;
//   set: (patch: Partial<AgentForm>) => void;
//   reset: () => void;
// };

// const initial: AgentForm = {
//   // basics
//   name: '',
//   ticker: '',
//   shortDescription: '',
//   category: '',
//   // persona
//   voiceTone: '',
//   bio: '',
//   coreTraits: [],
//   systemPrompt: '',
//   // media
//   avatar: null,
//   banner: null,
//   avatarAlt: '',
//   // socials/launch
//   twitter: '',
//   website: '',
//   discord: '',
//   launchType: '',
//   agreeToTerms: false,
// };

// export const useAgentFormStore = create<AgentFormStore>()(
//   persist(
//     (set, get) => ({
//       data: initial,
//       set: (patch) => set({ data: { ...get().data, ...patch } }),
//       reset: () => set({ data: initial }),
//     }),
//     { name: 'agent-form' }
//   )
// );

// stores/agentFormStore.ts
// 'use client';
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// type AgentBasics = {
//   name: string;
//   ticker: string;
//   shortDescription: string;
//   category: 'meme' | 'research' | 'defi' | 'nft' | 'social' | 'other' | '';
// };

// type AgentPersona = {
//   voiceTone: 'playful' | 'serious' | 'degenerate' | 'wholesome' | 'analyst' | '';
//   bio: string;
//   coreTraits: string[]; // max 5
//   systemPrompt: string;
// };

// type AgentMedia = {
//   avatar: File | null;
//   banner: File | null;
//   avatarAlt: string;
// };

// type AgentSocials = {
//   twitter: string;
//   website: string;
//   discord: string;
//   launchType: 'create-only' | 'create-then-coin' | '';
//   agreeToTerms: boolean;
// };

// export type AgentForm = AgentBasics & AgentPersona & AgentMedia & AgentSocials;

// type AgentFormStore = {
//   hydrated: boolean;           // ✅ hydration flag
//   data: AgentForm;

//   // actions
//   setData: (patch: Partial<AgentForm>) => void;
//   setAvatar: (file: File | null) => void;
//   setBanner: (file: File | null) => void;
//   reset: () => void;

//   // optional fine-grained helpers
//   updateBasics: (patch: Partial<AgentBasics>) => void;
//   updatePersona: (patch: Partial<AgentPersona>) => void;
//   updateSocials: (patch: Partial<AgentSocials>) => void;
//   toggleTrait: (trait: string) => void;
// };

// const trim = (v: string) => v.trim();
// const normalizePatch = (patch: Partial<AgentForm>): Partial<AgentForm> => {
//   const next = { ...patch };

//   if (typeof next.name === 'string') next.name = trim(next.name);
//   if (typeof next.ticker === 'string') {
//     // keep 1–6 uppercase A–Z/0–9 only
//     const t = trim(next.ticker).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
//     next.ticker = t;
//   }
//   if (typeof next.shortDescription === 'string') next.shortDescription = trim(next.shortDescription);
//   if (typeof next.bio === 'string') next.bio = trim(next.bio);
//   if (typeof next.systemPrompt === 'string') next.systemPrompt = next.systemPrompt;

//   if (Array.isArray(next.coreTraits)) {
//     // cap to 5, remove blanks/dupes
//     const cleaned = Array.from(
//       new Set(next.coreTraits.map(t => trim(t)).filter(Boolean))
//     ).slice(0, 5);
//     next.coreTraits = cleaned;
//   }

//   return next;
// };

// const initial: AgentForm = {
//   // basics
//   name: '',
//   ticker: '',
//   shortDescription: '',
//   category: '',
//   // persona
//   voiceTone: '',
//   bio: '',
//   coreTraits: [],
//   systemPrompt: '',
//   // media
//   avatar: null,
//   banner: null,
//   avatarAlt: '',
//   // socials/launch
//   twitter: '',
//   website: '',
//   discord: '',
//   launchType: '',
//   agreeToTerms: false,
// };

// export const useAgentFormStore = create<AgentFormStore>()(
//   persist(
//     (set, get) => ({
//       hydrated: false,
//       data: initial,

//       // ✅ Safe, normalized, shallow-diffed setter
//       setData: (patch) =>
//         set((state) => {
//           if (patch === state.data) return {};
//           const norm = normalizePatch(patch);
//           const keys = Object.keys(norm) as (keyof AgentForm)[];
//           if (keys.length === 0) return {};

//           const next: AgentForm = { ...state.data, ...norm };

//           // Only consider patched keys; bail if all identical by reference/value
//           let changed = false;
//           for (const k of keys) {
//             if (!Object.is(state.data[k], next[k])) {
//               changed = true;
//               break;
//             }
//           }
//           return changed ? { data: next } : {};
//         }),

//       setAvatar: (file) =>
//         set((state) => (state.data.avatar === file ? {} : { data: { ...state.data, avatar: file } })),

//       setBanner: (file) =>
//         set((state) => (state.data.banner === file ? {} : { data: { ...state.data, banner: file } })),

//       reset: () =>
//         set((state) => {
//           // no-op if already initial
//           const curr = state.data;
//           let same = true;
//           for (const k in initial) {
//             // @ts-expect-error index
//             if (!Object.is(curr[k], initial[k])) { same = false; break; }
//           }
//           return same ? {} : { data: initial };
//         }),

//       // ---------- Optional, granular helpers ----------
//       updateBasics: (patch) => get().setData(patch),
//       updatePersona: (patch) => get().setData(patch),
//       updateSocials: (patch) => get().setData(patch),

//       toggleTrait: (trait) =>
//         set((state) => {
//           const t = trim(trait);
//           if (!t) return {};
//           const exists = state.data.coreTraits.includes(t);
//           let nextTraits = exists
//             ? state.data.coreTraits.filter(x => x !== t)
//             : state.data.coreTraits.length >= 5
//               ? state.data.coreTraits // ignore add beyond 5
//               : [...state.data.coreTraits, t];

//           if (nextTraits === state.data.coreTraits) return {};
//           return { data: { ...state.data, coreTraits: nextTraits } };
//         }),
//     }),
//     {
//       name: 'agent-form',
//       version: 1, // ✅ set a version
//       migrate: (persisted, version) => {
//         // future-safe: add migrations per version
//         return persisted as any;
//       },
//       partialize: (state) => ({
//         hydrated: state.hydrated,
//         data: {
//           ...state.data,
//           avatar: null,
//           banner: null,
//         },
//       }),
//       onRehydrateStorage: () => (state) => {
//         // ✅ mark hydration done so components can gate effects
//         state?.setState({ hydrated: true });
//       },
//     }
//   )
// );


// stores/agent-form-store.ts
import { create } from 'zustand';
import { ZeeForm } from '@/schema/agent-schemas';

type AgentFormState = {
  data: Partial<ZeeForm>;
  setData: (patch: Partial<ZeeForm>) => void;
  reset: () => void;
};

export const useAgentFormStore = create<AgentFormState>((set) => ({
  data: {},
  setData: (patch) =>
    set((state) => ({
      data: { ...state.data, ...patch },
    })),
  reset: () => set({ data: {} }),
}));

export type { ZeeForm as AgentForm };