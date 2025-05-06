// "use client";

// import React, { useMemo, useEffect, useState, useCallback } from "react";
// import {
//   ConnectionProvider,
//   WalletProvider,
//   useWallet,
//   Wallet
// } from "@solana/wallet-adapter-react";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import { clusterApiUrl } from "@solana/web3.js";
// import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
// import { CustomWalletModalProvider } from "./ui/CustomWalletModalProvider";
// import { MagicWalletAdapter, MagicWalletName } from "./MagicWalletAdapter";
// import { PublicKey } from "@solana/web3.js";

// require("@solana/wallet-adapter-react-ui/styles.css");

// // Create a context to share the Magic adapter instance
// export const MagicAdapterContext = React.createContext<MagicWalletAdapter | null>(null);

// // Make MagicWalletName globally available 
// if (typeof window !== 'undefined') {
//   window.MagicWalletName = MagicWalletName;
// }

// // Helper component to handle wallet reconnection after mount
// const WalletInitializer = () => {
//   const { publicKey, wallet, select, wallets, connecting, connected } = useWallet();
//   const [attempted, setAttempted] = useState(false);

//   // Get Magic adapter from context
//   const magicAdapter = React.useContext(MagicAdapterContext);

//   // Log wallet state when it changes
//   useEffect(() => {
//     if (wallets && wallets.length > 0) {
//       console.log("Available wallets:", wallets.map(w => (w as any)?.name || 'unnamed'));
//     }

//     if (publicKey) {
//       console.log("Connected with public key:", publicKey.toString());
//     }
//   }, [wallets, publicKey]);

//   useEffect(() => {
//     if (attempted || connecting || connected || !wallets.length || !magicAdapter) return;

//     const initializeWallet = async () => {
//       const storedAddress = localStorage.getItem('connectedWalletAddress');
//       const storedWalletName = localStorage.getItem('walletName');

//       if (storedAddress && storedWalletName === MagicWalletName) {
//         try {
//           console.log("Found stored Magic wallet address, attempting to reconnect");

//           // Find the Magic adapter in the wallet list (by name)
//           const magicWalletInList = wallets.find(
//             wallet => (wallet as any)?.name === MagicWalletName
//           );

//           if (magicWalletInList) {
//             console.log("Found Magic adapter in wallet list, selecting it");
//             select(MagicWalletName);
//           } else if (magicAdapter) {
//             // Direct initialization if the adapter isn't in the wallet list yet
//             console.log("Magic adapter not in wallet list, initializing directly");

//             try {
//               // Use type assertion to access private properties for debugging
//               const isLoggedIn = await (magicAdapter as any)._magic?.user.isLoggedIn();

//               if (isLoggedIn) {
//                 console.log("User is logged in with Magic, setting public key");
//                 magicAdapter.setPublicKey(storedAddress);

//                 // Force select after a delay to ensure the adapter is ready
//                 setTimeout(() => {
//                   select(MagicWalletName);
//                 }, 500);
//               }
//             } catch (err) {
//               console.error("Error checking Magic login:", err);
//             }
//           }
//         } catch (error) {
//           console.error("Error reconnecting wallet:", error);
//         }
//       }

//       setAttempted(true);
//     };

//     initializeWallet();
//   }, [wallets, magicAdapter, select, attempted, connecting, connected]);

//   return null;
// };

// export default function AppWalletProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const network = WalletAdapterNetwork.Devnet;
//   const endpoint = useMemo(() => clusterApiUrl(network), [network]);
//   const [magicAdapter, setMagicAdapter] = useState<MagicWalletAdapter | null>(null);

//   // Initialize the Magic adapter
//   useEffect(() => {
//     const initMagic = async () => {
//       try {
//         const apiKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || '';
//         console.log("Initializing Magic adapter with API key:", apiKey ? "[PRESENT]" : "[MISSING]");

//         const adapter = new MagicWalletAdapter(apiKey, endpoint);
//         console.log("Magic adapter initialized with name:", adapter.name);

//         // Store reference to adapter
//         setMagicAdapter(adapter);

//         // Try to auto-reconnect if needed
//         const storedAddress = localStorage.getItem('connectedWalletAddress');
//         const storedWalletName = localStorage.getItem('walletName');

//         if (storedAddress && storedWalletName === MagicWalletName) {
//           try {
//             // Use type assertion to access private property safely
//             const isLoggedIn = await (adapter as any)._magic?.user.isLoggedIn();
//             if (isLoggedIn) {
//               console.log("User already logged in with Magic, setting public key");
//               adapter.setPublicKey(storedAddress);
//             }
//           } catch (err) {
//             console.error("Error checking Magic login status:", err);
//           }
//         }
//       } catch (error) {
//         console.error("Failed to initialize Magic adapter:", error);
//       }
//     };

//     initMagic();
//   }, [endpoint]);

//   // Create the wallet list with the Magic adapter
//   const wallets = useMemo(() => {
//     // Use a more generic type or Wallet interface from @solana/wallet-adapter-base
//     const adapters: any[] = [new PhantomWalletAdapter()];

//     if (magicAdapter) {
//       adapters.push(magicAdapter);
//       console.log("Added Magic adapter to wallet list:", magicAdapter.name);
//     }

//     return adapters;
//   }, [magicAdapter]);

//   // Enable autoConnect only after wallets are properly initialized
//   const [shouldAutoConnect, setShouldAutoConnect] = useState(false);

//   useEffect(() => {
//     // Short delay to ensure wallets are registered properly
//     const timer = setTimeout(() => {
//       setShouldAutoConnect(true);
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [wallets]);

//   return (
//     <ConnectionProvider endpoint={endpoint}>
//       <MagicAdapterContext.Provider value={magicAdapter}>
//         <WalletProvider wallets={wallets} autoConnect={shouldAutoConnect}>
//           <WalletInitializer />
//           <CustomWalletModalProvider>
//             {children}
//           </CustomWalletModalProvider>
//         </WalletProvider>
//       </MagicAdapterContext.Provider>
//     </ConnectionProvider>
//   );
// }

// src/component/AppWalletProvider.tsx
"use client";

import React, { useMemo, useEffect, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { CustomWalletModalProvider } from "./ui/CustomWalletModalProvider";
import { MagicWalletAdapter, MagicWalletName } from "./MagicWalletAdapter";
import { useWalletStore } from "@/stores/wallet-store";
import { PublicKey } from "@solana/web3.js";

require("@solana/wallet-adapter-react-ui/styles.css");

// Create a context to share the Magic adapter instance
export const MagicAdapterContext = React.createContext<MagicWalletAdapter | null>(null);

// Make MagicWalletName globally available
if (typeof window !== 'undefined') {
  window.MagicWalletName = MagicWalletName;
}

// Helper component to handle wallet reconnection after mount
const WalletInitializer = () => {
  const { publicKey, select, wallets } = useWallet();
  const { walletAddress: storedAddress, walletName: storedWalletName, setWallet } = useWalletStore();
  const [retryCount, setRetryCount] = useState(0);
  const magicAdapter = React.useContext(MagicAdapterContext);

  // Use an interval to persistently check connection
  useEffect(() => {
    if (publicKey) {
      return; // Already connected
    }

    if (!storedAddress || storedWalletName !== MagicWalletName) {
      return;
    }

    const interval = setInterval(() => {
      if (retryCount > 15) {
        clearInterval(interval);
        return;
      }

      if (publicKey) {
        clearInterval(interval);
        return;
      }

      const hasMagic = wallets.some(w => (w as any)?.name === MagicWalletName);
      if (hasMagic) {
        select(MagicWalletName);
        if (magicAdapter && typeof magicAdapter.setPublicKey === 'function') {
          magicAdapter.setPublicKey(storedAddress);
          setWallet(storedAddress, MagicWalletName);
        }
        setRetryCount(c => c + 1);
      } else {
        setRetryCount(c => c + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [publicKey, wallets, select, magicAdapter, retryCount, storedAddress, storedWalletName, setWallet]);

  return null;
};

// Ensures the wallet state stays persisted
const PersistentConnectionManager = () => {
  const { publicKey } = useWallet();
  const { walletAddress: storedAddress, walletName: storedWalletName, setWallet } = useWalletStore();
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    if (!publicKey) {
      return;
    }

    const interval = setInterval(() => {
      const pk = publicKey.toString();
      if (storedAddress !== pk) {
        setWallet(pk, MagicWalletName);
      }
      setCheckCount(c => c + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [publicKey, storedAddress, setWallet]);

  return null;
};

export default function AppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const { walletAddress: storedAddress, walletName: storedWalletName, setWallet } = useWalletStore();
  const [magicAdapter, setMagicAdapter] = useState<MagicWalletAdapter | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize the Magic adapter
  useEffect(() => {
    if (initialized) return;
    (async () => {
      const apiKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || '';
      if (!apiKey) {
        console.error("Missing Magic API key");
        return;
      }
      const adapter = new MagicWalletAdapter(apiKey, endpoint);
      setMagicAdapter(adapter);
      setInitialized(true);

      // hydrate from store
      if (storedAddress && storedWalletName === MagicWalletName) {
        try {
          adapter.setPublicKey(storedAddress);
          setWallet(storedAddress, MagicWalletName);
        } catch (err) {
          console.error(err);
        }
      }

      if (typeof window !== 'undefined') {
        window.magicAdapter = adapter;
      }
    })();
  }, [endpoint, initialized, storedAddress, storedWalletName, setWallet]);

  // Prepare wallet list
  const wallets = useMemo(() => {
    const list: any[] = [new PhantomWalletAdapter()];
    if (magicAdapter) {
      list.push(magicAdapter);
    }
    return list;
  }, [magicAdapter]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <MagicAdapterContext.Provider value={magicAdapter}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletInitializer />
          <PersistentConnectionManager />
          <CustomWalletModalProvider>
            {children}
          </CustomWalletModalProvider>
        </WalletProvider>
      </MagicAdapterContext.Provider>
    </ConnectionProvider>
  );
}

// "use client";

// import React, { useMemo, useEffect, useState, useCallback } from "react";
// import {
//   ConnectionProvider,
//   WalletProvider,
//   useWallet,
//   Wallet
// } from "@solana/wallet-adapter-react";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import { clusterApiUrl } from "@solana/web3.js";
// import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
// import { CustomWalletModalProvider } from "./ui/CustomWalletModalProvider";
// import { MagicWalletAdapter, MagicWalletName } from "./MagicWalletAdapter";
// import { PublicKey } from "@solana/web3.js";

// require("@solana/wallet-adapter-react-ui/styles.css");

// // Create a context to share the Magic adapter instance
// export const MagicAdapterContext = React.createContext<MagicWalletAdapter | null>(null);

// // Make MagicWalletName globally available 
// if (typeof window !== 'undefined') {
//   window.MagicWalletName = MagicWalletName;
// }

// // Helper component to handle wallet reconnection after mount
// const WalletInitializer = () => {
//   const { publicKey, wallet, select, wallets, connecting, connected } = useWallet();
//   const [retryCount, setRetryCount] = useState(0);
//   const [initialized, setInitialized] = useState(false);
//   const magicAdapter = React.useContext(MagicAdapterContext);

//   // Log wallet state when it changes
//   useEffect(() => {
//     console.log("WalletInitializer - Wallet state:", {
//       publicKey: publicKey?.toString(),
//       connected,
//       connecting,
//       walletCount: wallets.length,
//       walletNames: wallets.map(w => (w as any)?.name || 'unnamed'),
//       retryCount
//     });
//   }, [wallets, publicKey, connected, connecting, retryCount]);

//   // Use an interval to persistently check connection
//   useEffect(() => {
//     if (publicKey) {
//       console.log("Already connected with public key:", publicKey.toString());
//       setInitialized(true);
//       return; // Already connected, no need to do anything
//     }

//     const storedAddress = localStorage.getItem('connectedWalletAddress');
//     const storedWalletName = localStorage.getItem('walletName');

//     // Only proceed if we have stored credentials
//     if (!storedAddress || storedWalletName !== MagicWalletName) {
//       setInitialized(true);
//       return;
//     }

//     // If not connected yet but should be, set up an interval to keep trying
//     console.log("Setting up persistent reconnection check for Magic wallet");

//     const reconnectionInterval = setInterval(() => {
//       // Stop after too many retries
//       if (retryCount > 15) {
//         console.log("Max retry count reached, stopping reconnection attempts");
//         clearInterval(reconnectionInterval);
//         return;
//       }

//       // If already connected, stop interval
//       if (publicKey) {
//         console.log("Connection established, stopping reconnection interval");
//         clearInterval(reconnectionInterval);
//         setInitialized(true);
//         return;
//       }

//       // Find Magic adapter in wallet list
//       const hasMagicWallet = wallets.some(w => (w as any)?.name === MagicWalletName);

//       if (hasMagicWallet) {
//         console.log(`Retry ${retryCount}: Selecting Magic wallet adapter`);
//         select(MagicWalletName);

//         // If we have the context adapter and it has a setPublicKey method, use it
//         if (magicAdapter && typeof magicAdapter.setPublicKey === 'function') {
//           console.log("Using magicAdapter.setPublicKey to force reconnection");
//           magicAdapter.setPublicKey(storedAddress);
//         }

//         setRetryCount(prev => prev + 1);
//       } else {
//         console.log(`Retry ${retryCount}: Magic wallet not found in wallet list yet`);
//         setRetryCount(prev => prev + 1);
//       }
//     }, 1000); // Try every second

//     return () => clearInterval(reconnectionInterval);
//   }, [publicKey, wallets, select, magicAdapter, retryCount]);

//   return null;
// };

// // This component ensures the wallet remains connected even after many refreshes
// const PersistentConnectionManager = () => {
//   const { publicKey, connecting, connected } = useWallet();
//   const [checkCount, setCheckCount] = useState(0);

//   // Periodically verify connection state even after initial connection
//   useEffect(() => {
//     // If we're connected, schedule periodic checks to ensure connection persists
//     if (publicKey) {
//       console.log("Setting up periodic connection verification");

//       const verificationInterval = setInterval(() => {
//         const storedAddress = localStorage.getItem('connectedWalletAddress');
//         const storedWalletName = localStorage.getItem('walletName');

//         if (publicKey) {
//           console.log(`Connection verification #${checkCount}: Connection still active`);

//           // Update localStorage just to be safe
//           if (storedAddress !== publicKey.toString()) {
//             console.log("Updating localStorage with current public key");
//             localStorage.setItem('connectedWalletAddress', publicKey.toString());
//             localStorage.setItem('walletName', MagicWalletName);
//           }
//         } else if (storedAddress && storedWalletName === MagicWalletName) {
//           console.log(`Connection verification #${checkCount}: Connection lost but credentials exist`);
//           // We would trigger re-connection here, but the WalletInitializer will handle this
//         }

//         setCheckCount(prev => prev + 1);
//       }, 5000); // Check every 5 seconds

//       return () => clearInterval(verificationInterval);
//     }
//   }, [publicKey, checkCount]);

//   return null;
// };

// export default function AppWalletProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const network = WalletAdapterNetwork.Devnet;
//   const endpoint = useMemo(() => clusterApiUrl(network), [network]);
//   const [magicAdapter, setMagicAdapter] = useState<MagicWalletAdapter | null>(null);
//   const [adapterInitialized, setAdapterInitialized] = useState(false);

//   // Initialize the Magic adapter
//   useEffect(() => {
//     if (adapterInitialized) return;

//     const initMagic = async () => {
//       try {
//         const apiKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || '';
//         console.log("Initializing Magic adapter with API key:", apiKey ? "[PRESENT]" : "[MISSING]");

//         if (!apiKey) {
//           console.error("Missing Magic API key. Please check your environment variables.");
//           return;
//         }

//         const adapter = new MagicWalletAdapter(apiKey, endpoint);
//         console.log("Magic adapter initialized with name:", adapter.name);

//         // Store reference to adapter
//         setMagicAdapter(adapter);
//         setAdapterInitialized(true);

//         // Make adapter globally available
//         if (typeof window !== 'undefined') {
//           window.magicAdapter = adapter;
//         }

//         // Check if we need to reconnect immediately
//         const storedAddress = localStorage.getItem('connectedWalletAddress');
//         const storedWalletName = localStorage.getItem('walletName');

//         if (storedAddress && storedWalletName === MagicWalletName) {
//           console.log("Found stored Magic wallet, setting public key:", storedAddress);
//           try {
//             adapter.setPublicKey(storedAddress);
//           } catch (err) {
//             console.error("Failed to set public key during initialization:", err);
//           }
//         }
//       } catch (error) {
//         console.error("Failed to initialize Magic adapter:", error);
//       }
//     };

//     initMagic();
//   }, [endpoint, adapterInitialized]);

//   // Create the wallet list with the Magic adapter
//   const wallets = useMemo(() => {
//     const adapters: any[] = [new PhantomWalletAdapter()];

//     if (magicAdapter) {
//       adapters.push(magicAdapter);
//       console.log("Added Magic adapter to wallet list");
//     }

//     return adapters;
//   }, [magicAdapter]);

//   return (
//     <ConnectionProvider endpoint={endpoint}>
//       <MagicAdapterContext.Provider value={magicAdapter}>
//         <WalletProvider wallets={wallets} autoConnect={true}>
//           <WalletInitializer />
//           <PersistentConnectionManager />
//           <CustomWalletModalProvider>
//             {children}
//           </CustomWalletModalProvider>
//         </WalletProvider>
//       </MagicAdapterContext.Provider>
//     </ConnectionProvider>
//   );
// }