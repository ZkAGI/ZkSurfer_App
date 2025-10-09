"use client";
import { create } from "zustand";

type AssetMap = {
  files: Record<string, string>; // filename -> asset_id
  urls:  Record<string, string>; // url -> asset_id
};

type KbState = {
  kbId?: string;
  kbName?: string;
  isPublic?: boolean;
  userId?: string;
  // upload results
  privateAssets: AssetMap;
  publicAssets: AssetMap;
  setKbMeta: (p: { kbId: string; kbName: string; isPublic: boolean; userId: string }) => void;
  setPrivateAssets: (p: Partial<AssetMap>) => void;
  setPublicAssets: (p: Partial<AssetMap>) => void;
  resetKb: () => void;
};

export const useKbStore = create<KbState>((set) => ({
  kbId: undefined,
  kbName: undefined,
  isPublic: undefined,
  userId: undefined,
  privateAssets: { files: {}, urls: {} },
  publicAssets:  { files: {}, urls: {} },
  setKbMeta: ({ kbId, kbName, isPublic, userId }) =>
    set(() => ({ kbId, kbName, isPublic, userId })),
  setPrivateAssets: (p) =>
    set((s) => ({ privateAssets: { ...s.privateAssets, ...p } })),
  setPublicAssets: (p) =>
    set((s) => ({ publicAssets: { ...s.publicAssets, ...p } })),
  resetKb: () =>
    set({
      kbId: undefined,
      kbName: undefined,
      isPublic: undefined,
      userId: undefined,
      privateAssets: { files: {}, urls: {} },
      publicAssets:  { files: {}, urls: {} },
    }),
}));
