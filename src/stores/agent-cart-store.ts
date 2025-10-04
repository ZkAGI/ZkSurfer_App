// // stores/agentCartStore.ts
// import { create } from 'zustand';

// export type CubType =
//   | 'BD'
//   | 'Content'
//   | 'Support'
//   | 'Trading'
//   | 'Prediction'
//   | 'Treasury';

// export type CubItem = {
//   id: CubType;
//   label: string;
//   tagline: string;
//   icon: string; // /public/images/cubs/*.svg or .png
// };

// type CartState = {
//   items: CubItem[];
//   isPickerOpen: boolean;
//   isFlowGateOpen: boolean; // Enterprise vs Coin Launch
//   isFormOpen: boolean;     // MultiStepAgentForm modal
//   setPickerOpen: (v: boolean) => void;
//   setFlowGateOpen: (v: boolean) => void;
//   setFormOpen: (v: boolean) => void;
//   add: (item: CubItem) => void;
//   remove: (id: CubType) => void;
//   clear: () => void;
// };

// export const useAgentCart = create<CartState>((set, get) => ({
//   items: [],
//   isPickerOpen: false,
//   isFlowGateOpen: false,
//   isFormOpen: false,
//   setPickerOpen: (v) => set({ isPickerOpen: v }),
//   setFlowGateOpen: (v) => set({ isFlowGateOpen: v }),
//   setFormOpen: (v) => set({ isFormOpen: v }),
//   add: (item) => {
//     const exists = get().items.some((i) => i.id === item.id);
//     if (!exists) set({ items: [...get().items, item] });
//   },
//   remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
//   clear: () => set({ items: [] }),
// }));


'use client';
import { create } from 'zustand';

export type CubItem = {
  id: 'BD' | 'Content' | 'Support' | 'Trading' | 'Prediction' | 'Treasury';
  label: string;
  tagline: string;
  icon: string;
};

type AgentCartState = {
  // UI
  flowGateOpen: boolean;
  pickerOpen: boolean;
  formOpen: boolean;

  // cart
  items: CubItem[];

  // actions
  setFlowGateOpen: (v: boolean) => void;
  setPickerOpen: (v: boolean) => void;
  setFormOpen: (v: boolean) => void;
  add: (item: CubItem) => void;
  remove: (id: CubItem['id']) => void;
  clear: () => void;
};

export const useAgentCart = create<AgentCartState>((set, get) => ({
  flowGateOpen: false,
  pickerOpen: false,
  formOpen: false,

  items: [],

  setFlowGateOpen: (v) => set({ flowGateOpen: v }),
  setPickerOpen: (v) => set({ pickerOpen: v }),
  setFormOpen: (v) => set({ formOpen: v }),

  add: (item) => {
    const exists = get().items.some(i => i.id === item.id);
    if (!exists) set({ items: [...get().items, item] });
  },
  remove: (id) => set({ items: get().items.filter(i => i.id !== id) }),
  clear: () => set({ items: [] }),
}));
