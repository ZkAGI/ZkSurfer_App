// import { create } from 'zustand'
// import { persist, createJSONStorage } from 'zustand/middleware'
// import Cookies from 'js-cookie'

// type WalletState = {
//   walletAddress: string | null
//   walletName: string | null
//   setWallet: (address: string, name: string) => void
//   clearWallet: () => void
// }

// // wrap js-cookie so it matches the Storage API
// const cookieStorage = {
//   getItem: (name: string): string | null => Cookies.get(name) ?? null,
//   setItem: (name: string, value: string): void => {
//     // Cookies.set returns string | undefined, 
//     // but we explicitly return void here
//     Cookies.set(name, value, { sameSite: 'lax', secure: true });
//   },
//   removeItem: (name: string): void => {
//     Cookies.remove(name);
//   },
// }

// export const useWalletStore = create<WalletState>()(
//   persist(
//     (set) => ({
//       walletAddress: null,
//       walletName: null,
//       setWallet: (address: string, name: string) =>
//         set({ walletAddress: address, walletName: name }),
//       clearWallet: () =>
//         set({ walletAddress: null, walletName: null }),
//     }),
//     {
//       name: 'wallet-storage',                         // cookie name
//       storage: createJSONStorage(() => cookieStorage), // wrap for JSON
//     }
//   )
// )

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'

type WalletState = {
  walletAddress: string | null
  walletName: string | null
  tokenMintAddress: string | null  // Added for token mint storage
  setWallet: (address: string, name: string) => void
  clearWallet: () => void
  setTokenMintAddress: (address: string) => void  // New action for token mint
}

// wrap js-cookie so it matches the Storage API
const cookieStorage = {
  getItem: (name: string): string | null => Cookies.get(name) ?? null,
  setItem: (name: string, value: string): void => {
    // Cookies.set returns string | undefined, 
    // but we explicitly return void here
    Cookies.set(name, value, { sameSite: 'lax', secure: true });
  },
  removeItem: (name: string): void => {
    Cookies.remove(name);
  },
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      walletAddress: null,
      walletName: null,
      tokenMintAddress: null,  // Initialize token mint address as null
      setWallet: (address: string, name: string) =>
        set({ walletAddress: address, walletName: name }),
      clearWallet: () =>
        set({ walletAddress: null, walletName: null }),
      setTokenMintAddress: (address: string) =>
        set({ tokenMintAddress: address }),
    }),
    {
      name: 'wallet-storage',                         // cookie name
      storage: createJSONStorage(() => cookieStorage), // wrap for JSON
    }
  )
)
