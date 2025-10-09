"use client";
import { create } from "zustand";

/** Disclosure row for a file (Yes = private, No = public) */
export type KnowledgeDisclosure = {
  key: string;        // file key (name::size::lastModified)
  name: string;       // original file name
  disclose: boolean;  // true = YES (private), false = NO (public)
};

export type KBAsset = {
  name: string;
  type: "file" | "url";
  asset_id: string;
};

export type ZeeForm = {
  // Jurisdiction
  jurisdictionType?: "business" | "individual";
  country?: string;

  // Identity
  name?: string; // swarm name

  // Contact
  email?: string;
  telegram?: string;
  website?: string;

  // Knowledge (client-side UI state)
  knowledgeFiles?: File[];
  knowledgeDisclosures?: KnowledgeDisclosure[];
  websiteUrls?: string[];
  newsFilters?: string[];

  // KB API metadata
  kbId?: string;                 // returned from /kb/create
  kbName?: string;               // "<swarm>-kb"
  isKbPublic?: boolean;          // Yes/No choice at modal top
  kbUserId?: string;             // "<wallet>:<swarm>"
  kbReady?: boolean;             // modal finished create+uploads

  // Assets + quick lookup maps
  kbPublicAssetMap?: Record<string, string>;   // filename/url -> asset_id
  kbPrivateAssetMap?: Record<string, string>;  // filename/url -> asset_id
  kbPublicUrls?: string[];
  kbPrivateUrls?: string[];
  kbPublicAssets?: KBAsset[];
  kbPrivateAssets?: KBAsset[];

  // Proofs (asset_id -> proof JSON)
  kbAssetProofs?: Record<string, any>;

  // Character
  masterPrompt?: string;
  twitterAccounts?: string;

  // Visual
  spokespersonType?: "upload" | "preset";
  spokespersonUpload?: File | null;
  presetAvatar?: string;

  // Voice
  voiceType?: "preset" | "upload";  // you normalize "upload" -> "custom" in API
  presetVoice?: string;
  voiceSample?: File | null;

  // Agents
  tradingModel?: "foundational" | "custom";
  predictionMarkets?: string[];
  selectedAgents?: string[];

  // Review
  agreeToTerms?: boolean;
};

type AgentFormState = {
  data: Partial<ZeeForm>;

  // generic setter (merge patch)
  setData: (patch: Partial<ZeeForm>) => void;

  // KB helpers
  setKbMeta: (meta: {
    kbId: string;
    kbName: string;
    isKbPublic: boolean;
    kbUserId: string;
  }) => void;

  setKbReady: (ready: boolean) => void;

  setKbAssets: (payload: {
    publicFiles?: Record<string, string>;
    publicUrls?: Record<string, string>;
    privateFiles?: Record<string, string>;
    privateUrls?: Record<string, string>;
    publicList?: KBAsset[];
    privateList?: KBAsset[];
  }) => void;

  addKbProof: (assetId: string, proof: any) => void;
  addManyKbProofs: (proofs: Record<string, any>) => void;

  clearKb: () => void;
  reset: () => void;
};

export const useAgentFormStore = create<AgentFormState>((set, get) => ({
  data: {},

  setData: (patch) =>
    set((state) => ({ data: { ...state.data, ...patch } })),

  setKbMeta: ({ kbId, kbName, isKbPublic, kbUserId }) =>
    set((state) => ({
      data: {
        ...state.data,
        kbId,
        kbName,
        isKbPublic,
        kbUserId,
      },
    })),

  setKbReady: (ready) =>
    set((state) => ({
      data: { ...state.data, kbReady: ready },
    })),

  setKbAssets: ({
    publicFiles,
    publicUrls,
    privateFiles,
    privateUrls,
    publicList,
    privateList,
  }) =>
    set((state) => {
      const prev = state.data;

      const newPublicMap: Record<string, string> = {
        ...(prev.kbPublicAssetMap || {}),
        ...(publicFiles || {}),
        ...(publicUrls || {}),
      };

      const newPrivateMap: Record<string, string> = {
        ...(prev.kbPrivateAssetMap || {}),
        ...(privateFiles || {}),
        ...(privateUrls || {}),
      };

      const newPublicUrls = [
        ...(prev.kbPublicUrls || []),
        ...Object.keys(publicUrls || {}),
      ];

      const newPrivateUrls = [
        ...(prev.kbPrivateUrls || []),
        ...Object.keys(privateUrls || {}),
      ];

      return {
        data: {
          ...prev,
          kbPublicAssetMap: newPublicMap,
          kbPrivateAssetMap: newPrivateMap,
          kbPublicUrls: newPublicUrls,
          kbPrivateUrls: newPrivateUrls,
          kbPublicAssets: publicList ?? prev.kbPublicAssets,
          kbPrivateAssets: privateList ?? prev.kbPrivateAssets,
        },
      };
    }),

  addKbProof: (assetId, proof) =>
    set((state) => ({
      data: {
        ...state.data,
        kbAssetProofs: {
          ...(state.data.kbAssetProofs || {}),
          [assetId]: proof,
        },
      },
    })),

  addManyKbProofs: (proofs) =>
    set((state) => ({
      data: {
        ...state.data,
        kbAssetProofs: {
          ...(state.data.kbAssetProofs || {}),
          ...proofs,
        },
      },
    })),

  clearKb: () =>
    set((state) => ({
      data: {
        ...state.data,
        kbId: undefined,
        kbName: undefined,
        isKbPublic: undefined,
        kbUserId: undefined,
        kbReady: undefined,
        kbPublicAssetMap: undefined,
        kbPrivateAssetMap: undefined,
        kbPublicUrls: undefined,
        kbPrivateUrls: undefined,
        kbPublicAssets: undefined,
        kbPrivateAssets: undefined,
        kbAssetProofs: undefined,
        knowledgeFiles: undefined,
        knowledgeDisclosures: undefined,
        websiteUrls: undefined,
      },
    })),

  reset: () => set({ data: {} }),
}));
