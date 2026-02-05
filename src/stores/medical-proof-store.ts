import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MedicalProofState {
  currentKbId: string | null;
  walletAddress: string | null;
  proofData: {
    kb_id: string;
    proof_name: string;
    asset_id?: string;
    created_at: string;
  } | null;
  isAwaitingFileUpload: boolean;
  isAwaitingDownloadConfirmation: boolean;

  // Verify flow (simplified - no more listing)
  isAwaitingProofId: boolean;       // NEW: replaces isAwaitingProofSelection
  activeSessionId: string | null;
  activeProofId: string | null;
  isChatMode: boolean;

  // Actions
  setKbId: (kbId: string) => void;
  setWalletAddress: (address: string) => void;
  setProofData: (data: { kb_id: string; proof_name: string; asset_id?: string; created_at: string } | null) => void;
  setAwaitingFileUpload: (awaiting: boolean) => void;
  setAwaitingDownloadConfirmation: (awaiting: boolean) => void;

  setAwaitingProofId: (awaiting: boolean) => void;  // NEW: replaces setAwaitingProofSelection
  setActiveSessionId: (sessionId: string | null) => void;
  setActiveProofId: (proofId: string | null) => void;
  setChatMode: (active: boolean) => void;
  exitChatMode: () => void;
  reset: () => void;
}

export const useMedicalProofStore = create<MedicalProofState>()(
  persist(
    (set) => ({
      currentKbId: null,
      walletAddress: null,
      proofData: null,
      isAwaitingFileUpload: false,
      isAwaitingDownloadConfirmation: false,

      isAwaitingProofId: false,
      activeSessionId: null,
      activeProofId: null,
      isChatMode: false,

      setKbId: (kbId) => set({ currentKbId: kbId }),
      setWalletAddress: (address) => set({ walletAddress: address }),
      setProofData: (data) => set({ proofData: data }),
      setAwaitingFileUpload: (awaiting) => set({ isAwaitingFileUpload: awaiting }),
      setAwaitingDownloadConfirmation: (awaiting) => set({ isAwaitingDownloadConfirmation: awaiting }),

      setAwaitingProofId: (awaiting) => set({ isAwaitingProofId: awaiting }),
      setActiveSessionId: (sessionId) => set({ activeSessionId: sessionId }),
      setActiveProofId: (proofId) => set({ activeProofId: proofId }),
      setChatMode: (active) => set({ isChatMode: active }),
      exitChatMode: () => set({
        activeSessionId: null,
        activeProofId: null,
        isChatMode: false,
        isAwaitingProofId: false,
      }),
      reset: () => set({
        currentKbId: null,
        proofData: null,
        isAwaitingFileUpload: false,
        isAwaitingDownloadConfirmation: false,
        isAwaitingProofId: false,
        activeSessionId: null,
        activeProofId: null,
        isChatMode: false,
      }),
    }),
    { name: 'medical-proof-storage' }
  )
);