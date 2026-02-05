import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProofItem {
  proof_id: string;
  proof_name: string;
  filename: string;
  kb_id: string;
  created_at: string;
  has_proof: boolean;
  visibility: string;
}

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

  // Verify flow
  proofsList: ProofItem[];
  isAwaitingProofSelection: boolean;
  activeSessionId: string | null;
  activeProofId: string | null;
  isChatMode: boolean;

  // Actions
  setKbId: (kbId: string) => void;
  setWalletAddress: (address: string) => void;
  setProofData: (data: { kb_id: string; proof_name: string; asset_id?: string; created_at: string } | null) => void;
  setAwaitingFileUpload: (awaiting: boolean) => void;
  setAwaitingDownloadConfirmation: (awaiting: boolean) => void;

  setProofsList: (proofs: ProofItem[]) => void;
  setAwaitingProofSelection: (awaiting: boolean) => void;
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

      proofsList: [],
      isAwaitingProofSelection: false,
      activeSessionId: null,
      activeProofId: null,
      isChatMode: false,

      setKbId: (kbId) => set({ currentKbId: kbId }),
      setWalletAddress: (address) => set({ walletAddress: address }),
      setProofData: (data) => set({ proofData: data }),
      setAwaitingFileUpload: (awaiting) => set({ isAwaitingFileUpload: awaiting }),
      setAwaitingDownloadConfirmation: (awaiting) => set({ isAwaitingDownloadConfirmation: awaiting }),

      setProofsList: (proofs) => set({ proofsList: proofs }),
      setAwaitingProofSelection: (awaiting) => set({ isAwaitingProofSelection: awaiting }),
      setActiveSessionId: (sessionId) => set({ activeSessionId: sessionId }),
      setActiveProofId: (proofId) => set({ activeProofId: proofId }),
      setChatMode: (active) => set({ isChatMode: active }),
      exitChatMode: () => set({
        activeSessionId: null,
        activeProofId: null,
        isChatMode: false,
        proofsList: [],
        isAwaitingProofSelection: false,
      }),
      reset: () => set({
        currentKbId: null,
        proofData: null,
        isAwaitingFileUpload: false,
        isAwaitingDownloadConfirmation: false,
        proofsList: [],
        isAwaitingProofSelection: false,
        activeSessionId: null,
        activeProofId: null,
        isChatMode: false,
      }),
    }),
    { name: 'medical-proof-storage' }
  )
);