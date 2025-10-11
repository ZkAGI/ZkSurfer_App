// "use client";

// import React, { useMemo, useEffect, useState } from "react";
// import {
//   ConnectionProvider,
//   WalletProvider,
//   useWallet,
// } from "@solana/wallet-adapter-react";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import { clusterApiUrl } from "@solana/web3.js";
// import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
// import { CustomWalletModalProvider } from "./ui/CustomWalletModalProvider";
// import { MagicWalletAdapter, MagicWalletName } from "./MagicWalletAdapter";
// import { CivicAuthProvider } from "@civic/auth-web3/react";
// import type { WalletName } from "@solana/wallet-adapter-base";
// import PrivyBridge from "./privy/PrivyBridge";                       
// import { PrivyWalletAdapter, PrivyWalletName } from "./privy/PrivyWalletAdapter";


// require("@solana/wallet-adapter-react-ui/styles.css");

// /** ---------- constants ---------- */
// const CIVIC_WALLET_NAME = "Civic";
// const isCivicName = (name?: string) => !!name && /civic/i.test(name);

// // Our namespaced keys (so extensions won’t touch them)
// const ZK_ADDR_KEY = "zk:connectedWalletAddress";
// const ZK_LAST_KEY = "zk:lastWallet"; // stores JSON: { name: string }

// /** ---------- contexts ---------- */
// export const MagicAdapterContext =
//   React.createContext<MagicWalletAdapter | null>(null);

// if (typeof window !== "undefined") {
//   (window as any).MagicWalletName = MagicWalletName;
// }

// /** ---------- helpers ---------- */
// const readZkLast = (): string | null => {
//   try {
//     const raw = localStorage.getItem(ZK_LAST_KEY);
//     if (!raw) return null;
//     const { name } = JSON.parse(raw);
//     return typeof name === "string" ? name : null;
//   } catch {
//     return null;
//   }
// };

// /** ---------- WalletInitializer ---------- */
// /** Tries to reselect Civic/Magic based on wallet-adapter’s own key OR our fallback. */
// const WalletInitializer = () => {
//   const { publicKey, select, wallets, connected, connecting } = useWallet();
//   const [retryCount, setRetryCount] = useState(0);
//   const magicAdapter = React.useContext(MagicAdapterContext);

//   useEffect(() => {
//     console.log("WalletInitializer state:", {
//       pk: publicKey?.toString(),
//       connected,
//       connecting,
//       wallets: wallets.map((w) => (w as any)?.name),
//       retryCount,
//     });
//   }, [publicKey, connected, connecting, wallets, retryCount]);

//   useEffect(() => {
//     if (publicKey) return; // already connected

//     // Primary source: wallet-adapter’s own selection (we DO NOT write this key)
//     const adapterWalletName = localStorage.getItem("walletName"); // plain string
//     // Fallback: our namespaced record
//     const zkLast = readZkLast();

//     const desired = adapterWalletName || zkLast;
//     if (!desired) return;

//     const asWalletName = (name: string) => name as unknown as WalletName;

//     const interval = setInterval(() => {
//       if (retryCount > 15) {
//         clearInterval(interval);
//         return;
//       }
//       if (publicKey) {
//         clearInterval(interval);
//         return;
//       }

//       const list = wallets.map((w) => ((w as any)?.name ?? "").toString());
//       const hasDesired = list.some((n) =>
//         desired === MagicWalletName ? n === MagicWalletName : isCivicName(desired) ? isCivicName(n) : n === desired
//       );

//       if (hasDesired) {
//         const toSelect = isCivicName(desired)
//           ? CIVIC_WALLET_NAME
//           : desired;

//         console.log(`Auto-selecting ${toSelect}`);
//       select(toSelect === MagicWalletName ? MagicWalletName : asWalletName(toSelect));


//         // If Magic, seed its public key fast (optional)
//         if (toSelect === MagicWalletName) {
//           const addr = localStorage.getItem(ZK_ADDR_KEY);
//           if (addr && magicAdapter && typeof (magicAdapter as any).setPublicKey === "function") {
//             try {
//               (magicAdapter as any).setPublicKey(addr);
//             } catch (e) {
//               console.warn("magicAdapter.setPublicKey failed:", e);
//             }
//           }
//         }
//       } else {
//         console.log(`Waiting for ${desired} to appear in wallet list...`);
//       }

//       setRetryCount((x) => x + 1);
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [publicKey, wallets, select, magicAdapter, retryCount]);

//   return null;
// };

// /** ---------- PersistentConnectionManager ---------- */
// /** Keeps our namespaced keys in sync. Never touches wallet-adapter’s 'walletName'. */
// const PersistentConnectionManager = () => {
//   const { publicKey, wallet } = useWallet();

//   useEffect(() => {
//     if (!publicKey) return;

//     const tick = setInterval(() => {
//       const pk = publicKey?.toString();
//       const name = ((wallet as any)?.adapter?.name ?? "") as string;

//       if (pk) {
//         localStorage.setItem(ZK_ADDR_KEY, pk);
//       }
//       if (name) {
//         // Store JSON so accidental JSON.parse() by other scripts never crashes
//         localStorage.setItem(ZK_LAST_KEY, JSON.stringify({ name }));
//       }
//     }, 5000);

//     return () => clearInterval(tick);
//   }, [publicKey, wallet]);

//   return null;
// };

// /** ---------- AppWalletProvider ---------- */
// export default function AppWalletProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const network = WalletAdapterNetwork.Devnet;
//   const endpoint = useMemo(() => clusterApiUrl(network), [network]);

//   const [magicAdapter, setMagicAdapter] =
//     useState<MagicWalletAdapter | null>(null);
//   const [adapterInitialized, setAdapterInitialized] = useState(false);

//   // Init Magic once
//   useEffect(() => {
//     if (adapterInitialized) return;

//     (async () => {
//       try {
//         const apiKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || "";
//         if (!apiKey) {
//           console.error("Missing Magic API key");
//           return;
//         }
//         const adapter = new MagicWalletAdapter(apiKey, endpoint);
//         setMagicAdapter(adapter);
//         setAdapterInitialized(true);
//         if (typeof window !== "undefined") {
//           (window as any).magicAdapter = adapter;
//         }

//         // Optional: seed pk if last wallet was Magic
//         const last = readZkLast();
//         const addr = localStorage.getItem(ZK_ADDR_KEY);
//         if (last === MagicWalletName && addr) {
//           (adapter as any).setPublicKey?.(addr);
//         }
//       } catch (e) {
//         console.error("Magic init failed:", e);
//       }
//     })();
//   }, [endpoint, adapterInitialized]);

//     const [privyAdapter, setPrivyAdapter] = useState<PrivyWalletAdapter | null>(null); 


//     useEffect(() => {
//     const adapter = new PrivyWalletAdapter();
//     setPrivyAdapter(adapter);
//   }, []);

//   // Wallet list (Civic is discovered via CivicAuthProvider + Wallet Standard)
//   const wallets = useMemo(() => {
//     const arr: any[] = [new PhantomWalletAdapter()];
//     if (magicAdapter) arr.push(magicAdapter);
//     if (privyAdapter) arr.push(privyAdapter);
//     return arr;
//   }, [magicAdapter,privyAdapter]);

//   return (
//     <ConnectionProvider endpoint={endpoint}>
//       {/* <PrivyBridge onReady={setPrivyAdapter} /> */}
//       <MagicAdapterContext.Provider value={magicAdapter}>
//         <WalletProvider wallets={wallets} autoConnect>
//            <PrivyBridge />
//           <WalletInitializer />
//           <PersistentConnectionManager />
//           <CustomWalletModalProvider>
//             <CivicAuthProvider
//               clientId={process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID || ""}
//             >
//               {children}
//             </CivicAuthProvider>
//           </CustomWalletModalProvider>
//         </WalletProvider>
//       </MagicAdapterContext.Provider>
//     </ConnectionProvider>
//   );
// }


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
import { CivicAuthProvider } from "@civic/auth-web3/react";
import type { WalletName } from "@solana/wallet-adapter-base";
import PrivyBridge from "./privy/PrivyBridge";                       
import { PrivyWalletAdapter, PrivyWalletName } from "./privy/PrivyWalletAdapter";


require("@solana/wallet-adapter-react-ui/styles.css");

/** ---------- constants ---------- */
const CIVIC_WALLET_NAME = "Civic";
const isCivicName = (name?: string) => !!name && /civic/i.test(name);

// Our namespaced keys (so extensions won’t touch them)
const ZK_ADDR_KEY = "zk:connectedWalletAddress";
const ZK_LAST_KEY = "zk:lastWallet"; // stores JSON: { name: string }

/** ---------- contexts ---------- */
export const MagicAdapterContext =
  React.createContext<MagicWalletAdapter | null>(null);

if (typeof window !== "undefined") {
  (window as any).MagicWalletName = MagicWalletName;
}

/** ---------- helpers ---------- */
const readZkLast = (): string | null => {
  try {
    const raw = localStorage.getItem(ZK_LAST_KEY);
    if (!raw) return null;
    const { name } = JSON.parse(raw);
    return typeof name === "string" ? name : null;
  } catch {
    return null;
  }
};

/** ---------- WalletInitializer ---------- */
/** Tries to reselect Civic/Magic based on wallet-adapter’s own key OR our fallback. */
const WalletInitializer = () => {
  const { publicKey, select, wallets, connected, connecting } = useWallet();
  const [retryCount, setRetryCount] = useState(0);
  const magicAdapter = React.useContext(MagicAdapterContext);

  useEffect(() => {
    console.log("WalletInitializer state:", {
      pk: publicKey?.toString(),
      connected,
      connecting,
      wallets: wallets.map((w) => (w as any)?.name),
      retryCount,
    });
  }, [publicKey, connected, connecting, wallets, retryCount]);

  useEffect(() => {
    if (publicKey) return; // already connected

    // Primary source: wallet-adapter's own selection (we DO NOT write this key)
    const adapterWalletName = localStorage.getItem("walletName"); // plain string
    // Fallback: our namespaced record
    const zkLast = readZkLast();

    const desired = adapterWalletName || zkLast;
    if (!desired) return;

    // CRITICAL FIX: NEVER auto-select email-based wallets
    const isEmailWallet = desired === MagicWalletName || desired === PrivyWalletName;
    if (isEmailWallet) {
      console.log(`[WalletInitializer] Skipping auto-select for email wallet: ${desired}`);
      // Clear it from storage so it doesn't keep trying
      localStorage.removeItem("walletName");
      try {
        const zkLastData = localStorage.getItem(ZK_LAST_KEY);
        if (zkLastData) {
          const parsed = JSON.parse(zkLastData);
          if (parsed.name === desired) {
            localStorage.removeItem(ZK_LAST_KEY);
          }
        }
      } catch {}
      return;
    }

    const asWalletName = (name: string) => name as unknown as WalletName;

    const interval = setInterval(() => {
      if (retryCount > 15) {
        clearInterval(interval);
        return;
      }
      if (publicKey) {
        clearInterval(interval);
        return;
      }

      const list = wallets.map((w) => ((w as any)?.name ?? "").toString());
      const hasDesired = list.some((n) =>
        desired === MagicWalletName ? n === MagicWalletName : isCivicName(desired) ? isCivicName(n) : n === desired
      );

      if (hasDesired) {
        const toSelect = isCivicName(desired)
          ? CIVIC_WALLET_NAME
          : desired;

        console.log(`Auto-selecting ${toSelect}`);
        select(toSelect === MagicWalletName ? MagicWalletName : asWalletName(toSelect));

        // If Magic, seed its public key fast (optional)
        if (toSelect === MagicWalletName) {
          const addr = localStorage.getItem(ZK_ADDR_KEY);
          if (addr && magicAdapter && typeof (magicAdapter as any).setPublicKey === "function") {
            try {
              (magicAdapter as any).setPublicKey(addr);
            } catch (e) {
              console.warn("magicAdapter.setPublicKey failed:", e);
            }
          }
        }
      } else {
        console.log(`Waiting for ${desired} to appear in wallet list...`);
      }

      setRetryCount((x) => x + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [publicKey, wallets, select, magicAdapter, retryCount]);

  return null;
};

/** ---------- PersistentConnectionManager ---------- */
/** Keeps our namespaced keys in sync. Never touches wallet-adapter’s 'walletName'. */
const PersistentConnectionManager = () => {
  const { publicKey, wallet } = useWallet();

  useEffect(() => {
    if (!publicKey) return;

    const tick = setInterval(() => {
      const pk = publicKey?.toString();
      const name = ((wallet as any)?.adapter?.name ?? "") as string;

      // CRITICAL: NEVER persist email-based wallets
      const isEmailWallet = 
        name === MagicWalletName || 
        name === PrivyWalletName || 
        name === "Privy (Email)";
      
      if (isEmailWallet) {
        console.log('[PersistentConnectionManager] Skipping persistence for email wallet:', name);
        return; // Don't save anything
      }
      
      if (pk) {
        localStorage.setItem(ZK_ADDR_KEY, pk);
      }
      if (name) {
        localStorage.setItem(ZK_LAST_KEY, JSON.stringify({ name }));
      }
    }, 5000);

    return () => clearInterval(tick);
  }, [publicKey, wallet]);

  return null;
};
/** ---------- AppWalletProvider ---------- */
export default function AppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const [magicAdapter, setMagicAdapter] =
    useState<MagicWalletAdapter | null>(null);
  const [adapterInitialized, setAdapterInitialized] = useState(false);

  // Init Magic once
  useEffect(() => {
    if (adapterInitialized) return;

    (async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || "";
        if (!apiKey) {
          console.error("Missing Magic API key");
          return;
        }
        const adapter = new MagicWalletAdapter(apiKey, endpoint);
        setMagicAdapter(adapter);
        setAdapterInitialized(true);
        if (typeof window !== "undefined") {
          (window as any).magicAdapter = adapter;
        }

        // Optional: seed pk if last wallet was Magic
        const last = readZkLast();
        const addr = localStorage.getItem(ZK_ADDR_KEY);
        if (last === MagicWalletName && addr) {
          (adapter as any).setPublicKey?.(addr);
        }
      } catch (e) {
        console.error("Magic init failed:", e);
      }
    })();
  }, [endpoint, adapterInitialized]);

    const [privyAdapter, setPrivyAdapter] = useState<PrivyWalletAdapter | null>(null); 


    useEffect(() => {
    const adapter = new PrivyWalletAdapter();
    setPrivyAdapter(adapter);
  }, []);

  // Wallet list (Civic is discovered via CivicAuthProvider + Wallet Standard)
  const wallets = useMemo(() => {
    const arr: any[] = [new PhantomWalletAdapter()];
    if (magicAdapter) arr.push(magicAdapter);
    if (privyAdapter) arr.push(privyAdapter);
    return arr;
  }, [magicAdapter,privyAdapter]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      {/* <PrivyBridge onReady={setPrivyAdapter} /> */}
      <MagicAdapterContext.Provider value={magicAdapter}>
        <WalletProvider wallets={wallets} autoConnect>
           <PrivyBridge />
          <WalletInitializer />
          <PersistentConnectionManager />
          <CustomWalletModalProvider>
            <CivicAuthProvider
              clientId={process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID || ""}
            >
              {children}
            </CivicAuthProvider>
          </CustomWalletModalProvider>
        </WalletProvider>
      </MagicAdapterContext.Provider>
    </ConnectionProvider>
  );
}
