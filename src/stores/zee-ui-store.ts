'use client';
import { create } from 'zustand';

type ZeeUIState = {
  showFlowGate: boolean;
  showAgentPicker: boolean;
  showCreateAgentForm: boolean;
  openFromCTA: () => void;        // opens the FlowGate
  openAgentPicker: () => void;    // after choosing Enterprise
  openCreateAgentForm: () => void;// after “Add to Cart” / proceed
  closeAll: () => void;
};

export const useZeeUiStore = create<ZeeUIState>((set) => ({
  showFlowGate: false,
  showAgentPicker: false,
  showCreateAgentForm: false,
  openFromCTA: () => set({ showFlowGate: true, showAgentPicker: false, showCreateAgentForm: false }),
  openAgentPicker: () => set({ showFlowGate: false, showAgentPicker: true, showCreateAgentForm: false }),
  openCreateAgentForm: () => set({ showFlowGate: false, showAgentPicker: false, showCreateAgentForm: true }),
  closeAll: () => set({ showFlowGate: false, showAgentPicker: false, showCreateAgentForm: false }),
}));
