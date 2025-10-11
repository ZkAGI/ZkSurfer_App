// "use client";

// import { useState, useEffect, useContext, FormEvent } from "react";
// import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { toast } from "sonner";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { MagicWalletName } from "../MagicWalletAdapter";
// import { MagicAdapterContext } from "../AppWalletProvider";
// import { useLogin, usePrivy } from "@privy-io/react-auth";
// import { useWallets } from "@privy-io/react-auth/solana"; // Use Solana-specific hook

// interface WalletModalProps {
//   isVisible: boolean;
//   onClose: () => void;
// }

// const LABELS = {
//   "change-wallet": "Change wallet",
//   connecting: "Connecting ...",
//   "copy-address": "Copy address",
//   copied: "Copied",
//   disconnect: "Disconnect",
//   "has-wallet": "Connect",
//   "no-wallet": "Select Wallet",
// };

// type EmailFlowMode = "picker" | "magic-email" | null;
// const PRIVY_WALLET_NAME = "Privy (Email)";

// export const WalletModal = ({ isVisible, onClose }: WalletModalProps) => {
//   const [loading, setLoading] = useState(false);
//   const [mode, setMode] = useState<EmailFlowMode>(null);
//   const [email, setEmail] = useState("");
//   const [privyConnecting, setPrivyConnecting] = useState(false);

//   // Solana adapter state
//   const { wallets: solanaAdapters, select, publicKey, connecting } = useWallet();
//   const magicAdapter = useContext(MagicAdapterContext);

//   // Privy auth hooks
//   const { ready: privyReady, authenticated, user: privyUser } = usePrivy();
//   const { login } = useLogin({
//     onComplete: ({ user, isNewUser, wasAlreadyAuthenticated, loginMethod, loginAccount }) => {
//       console.log("Privy login complete:", { 
//         user, 
//         isNewUser, 
//         wasAlreadyAuthenticated,
//         loginMethod,
//         loginAccount 
//       });
//       setPrivyConnecting(true);
//     },
//     onError: (error) => {
//       console.error("Privy login error:", error);
//       toast.error("Login failed. Please try again.");
//       setLoading(false);
//       setPrivyConnecting(false);
//     }
//   });
  
//   // Privy Solana wallets hook - Note: createWallet might not exist in this version
//   const { wallets: privySolanaWallets, ready: walletsReady } = useWallets();

//   // Close modal when wallet connects
//   useEffect(() => {
//     if (publicKey && !connecting) {
//       onClose();
//     }
//   }, [publicKey, connecting, onClose]);

//   // Reset state when modal closes
//   useEffect(() => {
//     if (!isVisible) {
//       setMode(null);
//       setEmail("");
//       setLoading(false);
//       setPrivyConnecting(false);
//     }
//   }, [isVisible]);

//   // Handle Privy Solana wallet connection
//   useEffect(() => {
//     const handlePrivyWallet = async () => {
//       if (!privyConnecting || !authenticated || !privyUser || !walletsReady) return;
      
//       console.log("Privy authenticated, checking Solana wallets...");
//       console.log("Privy Solana wallets:", privySolanaWallets);
      
//       // Find the embedded Privy wallet
//       let privyWallet = privySolanaWallets?.find(w => 
//         w.standardWallet.name === 'Privy' || 
//         (w as any).walletClientType === 'privy' ||
//         (w as any).imported === false
//       );
      
//       if (!privyWallet && privySolanaWallets.length > 0) {
//         // If no embedded wallet but other wallets exist, use the first one
//         privyWallet = privySolanaWallets[0];
//       }
      
//       if (privyWallet) {
//         console.log("Found Privy Solana wallet:", privyWallet.address);
        
//         // Update the Privy adapter
//         const privyAdapter = solanaAdapters.find((w) => (w as any)?.adapter?.name === PRIVY_WALLET_NAME);
        
//         if (privyAdapter) {
//           const adapter = (privyAdapter as any).adapter;
//           if (adapter) {
//             // Set the Solana public key
//             if (typeof adapter.setPublicKey === 'function') {
//               adapter.setPublicKey(privyWallet.address);
//             }
//             adapter._embeddedWallet = privyWallet;
//             adapter._privyWallet = privyWallet;
//           }
          
//           // Select the Privy wallet
//           setTimeout(() => {
//             select(PRIVY_WALLET_NAME as any);
//             toast.success(`Connected: ${privyWallet.address.slice(0, 4)}...${privyWallet.address.slice(-4)}`);
//             setPrivyConnecting(false);
//             setLoading(false);
            
//             // Store in localStorage
//             localStorage.setItem('walletName', PRIVY_WALLET_NAME);
//             localStorage.setItem('zk:lastWallet', JSON.stringify({ name: PRIVY_WALLET_NAME }));
//             localStorage.setItem('zk:connectedWalletAddress', privyWallet.address);
            
//             // Store globally
//             if (typeof window !== 'undefined') {
//               (window as any).__privySolanaAddress = privyWallet.address;
//               (window as any).__privySolanaWallet = privyWallet;
//             }
            
//             onClose();
//           }, 500);
//         } else {
//           console.error("Privy adapter not found in wallet list");
//           toast.error("Privy adapter not configured");
//           setPrivyConnecting(false);
//           setLoading(false);
//         }
//       } else {
//         console.log("No Privy Solana wallet found");
        
//         // With embeddedWallets.createOnLogin: 'all-users' in Privy config,
//         // a wallet should be created automatically. If not, we just wait for it.
//         // The createWallet method doesn't exist in this version of the API
        
//         setTimeout(() => {
//           setPrivyConnecting(false);
//           setLoading(false);
//           toast.error("Solana wallet creation pending. Please try again.");
//         }, 3000);
//       }
//     };
    
//     handlePrivyWallet();
//   }, [privyConnecting, authenticated, privyUser, privySolanaWallets, walletsReady, solanaAdapters, select, onClose]);

//   const startEmailConnect = () => setMode("picker");

//   const handlePrivyEmail = async () => {
//     try {
//       if (!privyReady) {
//         toast.message("Privy is still initializing... please wait.");
//         return;
//       }
      
//       setLoading(true);
//       console.log("Opening Privy login modal...");
      
//       // This opens Privy's built-in modal
//       await login();
      
//       // The onComplete callback will set privyConnecting to true
//     } catch (err) {
//       console.error("Privy email login error:", err);
//       toast.error("Failed to open Privy login. Please try again.");
//       setLoading(false);
//       setPrivyConnecting(false);
//     }
//   };

//   const chooseMagicEmail = () => setMode("magic-email");

//   const handleMagicEmailSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!email.trim()) {
//       toast.error("Please enter a valid email address");
//       return;
//     }
//     setLoading(true);
//     try {
//       if (magicAdapter && typeof (magicAdapter as any).connectWithEmail === "function") {
//         await (magicAdapter as any).connectWithEmail(email);
//         select(MagicWalletName);
//         toast.success("Connected with Magic Link");
//         onClose();
//         return;
//       }
//       const magicFromList = solanaAdapters.find((w) => (w as any)?.name === MagicWalletName);
//       if (magicFromList && typeof (magicFromList as any).connectWithEmail === "function") {
//         await (magicFromList as any).connectWithEmail(email);
//         select(MagicWalletName);
//         toast.success("Connected with Magic Link");
//         onClose();
//         return;
//       }
//       const globalMagic = typeof window !== "undefined" ? (window as any).magic : null;
//       const globalAdapter = typeof window !== "undefined" ? (window as any).magicAdapter : null;
//       if (!globalMagic) throw new Error("Magic SDK not available");
//       await globalMagic.auth.loginWithEmailOTP({ email });
//       if (globalAdapter && typeof globalAdapter.connectWithEmail === "function") {
//         await globalAdapter.connectWithEmail(email);
//         select(MagicWalletName);
//       } else {
//         const info = await globalMagic.user.getInfo();
//         if (info?.publicAddress) {
//           localStorage.setItem("zk:connectedWalletAddress", info.publicAddress);
//           localStorage.setItem("walletName", MagicWalletName);
//           localStorage.setItem("zk:lastWallet", JSON.stringify({ name: MagicWalletName }));
//         }
//       }
//       toast.success("Magic wallet connected");
//       onClose();
//     } catch (err) {
//       console.error("Magic Link error:", err);
//       toast.error("Error with Magic Link. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Debug button to check wallet status
//   const debugWallets = () => {
//     console.log("=== PRIVY SOLANA DEBUG ===");
//     console.log("Auth state:", { authenticated, privyUser });
//     console.log("Solana wallets from useWallets:", privySolanaWallets);
//     console.log("Wallets ready:", walletsReady);
//     console.log("==========================");
//   };

//   if (!isVisible) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50">
//       <div className="absolute inset-0 bg-black/50" onClick={onClose} />
//       <div className="relative bg-[#171D3D] rounded-lg p-6 z-10 w-11/12 max-w-md">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold">Connect or Create Wallet</h2>
//           <button onClick={onClose} className="text-gray-300 hover:text-white">×</button>
//         </div>

//         {/* Debug button - remove in production */}
//         {authenticated && (
//           <button 
//             onClick={debugWallets}
//             className="mb-4 text-xs bg-gray-700 px-2 py-1 rounded"
//           >
//             Debug Solana Wallets (check console)
//           </button>
//         )}

//         <div className="mb-8">
//           <h3 className="text-lg font-semibold mb-2">Have a Wallet</h3>
//           <p className="mb-4">Connect your existing wallet.</p>
//           <BaseWalletMultiButton labels={LABELS} />
//         </div>

//         <div className="space-y-3">
//           <h3 className="text-lg font-semibold">Don&apos;t Have a Wallet</h3>

//           {mode === null && (
//             <>
//               <p className="text-xs mb-2">Use your email to create a wallet. Choose a provider to continue.</p>
//               <button
//                 className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
//                 onClick={startEmailConnect}
//               >
//                 Connect with Email
//               </button>
//             </>
//           )}

//           {mode === "picker" && (
//             <div className="mt-2 space-y-2">
//               <button
//                 className="w-full bg-emerald-500 text-white py-2 rounded hover:bg-emerald-600 transition disabled:opacity-60"
//                 onClick={handlePrivyEmail}
//                 disabled={loading || !privyReady}
//               >
//                 {loading && privyConnecting ? 
//                   "Connecting Privy Solana wallet..." : 
//                  !privyReady ? "Initializing Privy..." : 
//                  "Continue with Privy (Solana)"}
//               </button>
//               <button
//                 className="w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 transition disabled:opacity-60"
//                 onClick={chooseMagicEmail}
//                 disabled={loading}
//               >
//                 Continue with Magic (Solana)
//               </button>
//               <button
//                 className="w-full bg-transparent border border-white/20 text-white py-2 rounded hover:bg-white/5 transition"
//                 onClick={() => setMode(null)}
//               >
//                 Back
//               </button>
//             </div>
//           )}

//           {mode === "magic-email" && (
//             <form onSubmit={handleMagicEmailSubmit} className="flex flex-col gap-3 mt-2">
//               <p className="text-xs">
//                 Enter your email to receive a Magic OTP. A Solana wallet will be created on success.
//               </p>
//               <input
//                 type="email"
//                 placeholder="your-email@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="border bg-[#171D3D] border-gray-300 rounded px-3 py-2"
//               />
//               <div className="flex gap-2">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="flex-1 bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 transition disabled:opacity-60"
//                 >
//                   {loading ? "Sending OTP…" : "Send Magic Link"}
//                 </button>
//                 <button
//                   type="button"
//                   className="px-3 rounded border border-white/20 hover:bg-white/5 transition"
//                   onClick={() => setMode("picker")}
//                 >
//                   Back
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

"use client";

import { useState, useEffect, useContext, FormEvent } from "react";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { MagicWalletName } from "../MagicWalletAdapter";
import { MagicAdapterContext } from "../AppWalletProvider";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { WalletName } from "@solana/wallet-adapter-base";

interface WalletModalProps {
  isVisible: boolean;
  onClose: () => void;
  onWalletSelect?: (walletName: WalletName) => void;
  isConnecting?: boolean;
}

type EmailFlowMode = "picker" | "magic-email" | null;
const PRIVY_WALLET_NAME = "Privy (Email)";

export const WalletModal = ({ isVisible, onClose, onWalletSelect, isConnecting = false }: WalletModalProps) => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<EmailFlowMode>(null);
  const [email, setEmail] = useState("");
  const [privyConnecting, setPrivyConnecting] = useState(false);

  const { wallets: solanaAdapters, select, publicKey, connecting } = useWallet();
  const magicAdapter = useContext(MagicAdapterContext);

  const { ready: privyReady, authenticated, user: privyUser } = usePrivy();
  const { login } = useLogin({
    onComplete: ({ user, isNewUser, wasAlreadyAuthenticated, loginMethod, loginAccount }) => {
      console.log("Privy login complete:", { 
        user, 
        isNewUser, 
        wasAlreadyAuthenticated,
        loginMethod,
        loginAccount 
      });
      setPrivyConnecting(true);
    },
    onError: (error) => {
      console.error("Privy login error:", error);
      toast.error("Login failed. Please try again.");
      setLoading(false);
      setPrivyConnecting(false);
    }
  });
  
  const { wallets: privySolanaWallets, ready: walletsReady } = useWallets();

  useEffect(() => {
    if (!isVisible) {
      setMode(null);
      setEmail("");
      setLoading(false);
      setPrivyConnecting(false);
    }
  }, [isVisible]);

  useEffect(() => {
    const handlePrivyWallet = async () => {
      if (!privyConnecting || !authenticated || !privyUser || !walletsReady) return;
      
      console.log("Privy authenticated, checking Solana wallets...");
      
      let privyWallet = privySolanaWallets?.find(w => 
        w.standardWallet.name === 'Privy' || 
        (w as any).walletClientType === 'privy' ||
        (w as any).imported === false
      );
      
      if (!privyWallet && privySolanaWallets.length > 0) {
        privyWallet = privySolanaWallets[0];
      }
      
      if (privyWallet) {
        console.log("Found Privy Solana wallet:", privyWallet.address);
        
        const privyAdapter = solanaAdapters.find((w) => (w as any)?.adapter?.name === PRIVY_WALLET_NAME);
        
        if (privyAdapter) {
          const adapter = (privyAdapter as any).adapter;
          if (adapter) {
            if (typeof adapter.setPublicKey === 'function') {
              adapter.setPublicKey(privyWallet.address);
            }
            adapter._embeddedWallet = privyWallet;
            adapter._privyWallet = privyWallet;
          }
          
          setTimeout(() => {
            if (onWalletSelect) {
              onWalletSelect(PRIVY_WALLET_NAME as WalletName);
            } else {
              select(PRIVY_WALLET_NAME as any);
            }
            
            toast.success(`Connected: ${privyWallet.address.slice(0, 4)}...${privyWallet.address.slice(-4)}`);
            setPrivyConnecting(false);
            setLoading(false);
            
            localStorage.setItem('walletName', PRIVY_WALLET_NAME);
            localStorage.setItem('connectedWalletAddress', privyWallet.address);
            
            if (typeof window !== 'undefined') {
              (window as any).__privySolanaAddress = privyWallet.address;
              (window as any).__privySolanaWallet = privyWallet;
            }
            
            if (!onWalletSelect) {
              onClose();
            }
          }, 500);
        } else {
          console.error("Privy adapter not found in wallet list");
          toast.error("Privy adapter not configured");
          setPrivyConnecting(false);
          setLoading(false);
        }
      } else {
        setTimeout(() => {
          setPrivyConnecting(false);
          setLoading(false);
          toast.error("Solana wallet creation pending. Please try again.");
        }, 3000);
      }
    };
    
    handlePrivyWallet();
  }, [privyConnecting, authenticated, privyUser, privySolanaWallets, walletsReady, solanaAdapters, select, onClose, onWalletSelect]);

  const startEmailConnect = () => setMode("picker");

  const handlePrivyEmail = async () => {
  try {
    if (!privyReady) {
      toast.message("Privy is still initializing... please wait.");
      return;
    }
    
    setLoading(true);
    
    // CRITICAL FIX: Check if already authenticated
    if (authenticated && privyUser) {
      console.log('[Privy] User already authenticated, checking for wallet...');
      setPrivyConnecting(true); // This will trigger the wallet handler
      return;
    }
    
    console.log("Opening Privy login modal...");
    await login();
  } catch (err) {
    console.error("Privy email login error:", err);
    toast.error("Failed to open Privy login. Please try again.");
    setLoading(false);
    setPrivyConnecting(false);
  }
};

  const chooseMagicEmail = () => setMode("magic-email");

  const handleMagicEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    
    try {
      if (magicAdapter && typeof (magicAdapter as any).connectWithEmail === "function") {
        await (magicAdapter as any).connectWithEmail(email);
        
        if (onWalletSelect) {
          onWalletSelect(MagicWalletName as WalletName);
        } else {
          select(MagicWalletName);
          onClose();
        }
        
        toast.success("Connected with Magic Link");
        return;
      }

      const magicFromList = solanaAdapters.find((w) => (w as any)?.name === MagicWalletName);
      if (magicFromList && typeof (magicFromList as any).connectWithEmail === "function") {
        await (magicFromList as any).connectWithEmail(email);
        
        if (onWalletSelect) {
          onWalletSelect(MagicWalletName as WalletName);
        } else {
          select(MagicWalletName);
          onClose();
        }
        
        toast.success("Connected with Magic Link");
        return;
      }

      const globalMagic = typeof window !== "undefined" ? (window as any).magic : null;
      const globalAdapter = typeof window !== "undefined" ? (window as any).magicAdapter : null;
      
      if (!globalMagic) throw new Error("Magic SDK not available");
      
      await globalMagic.auth.loginWithEmailOTP({ email });
      
      if (globalAdapter && typeof globalAdapter.connectWithEmail === "function") {
        await globalAdapter.connectWithEmail(email);
        
        if (onWalletSelect) {
          onWalletSelect(MagicWalletName as WalletName);
        } else {
          select(MagicWalletName);
        }
      } else {
        const info = await globalMagic.user.getInfo();
        if (info?.publicAddress) {
          localStorage.setItem("connectedWalletAddress", info.publicAddress);
          localStorage.setItem("walletName", MagicWalletName);
        }
      }
      
      toast.success("Magic wallet connected");
      
      if (!onWalletSelect) {
        onClose();
      }
      
    } catch (err: any) {
      console.error("Magic Link error:", err);
      
      const isCancelled = err.message?.toLowerCase().includes('user') || err.code === 4001;
      if (!isCancelled) {
        toast.error("Error with Magic Link. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStandardWalletClick = async (walletName: string) => {
    console.log(`[WalletModal] Standard wallet selected: ${walletName}`);
    
    if (onWalletSelect) {
      try {
        onWalletSelect(walletName as WalletName);
      } catch (error) {
        console.error('[WalletModal] Error in onWalletSelect:', error);
      }
    } else {
      select(walletName as WalletName);
    }
  };

  const handleBackdropClick = () => {
    if (isConnecting || loading || privyConnecting) {
      console.log('[Modal] Cannot close during connection');
      toast.info('Please wait for connection to complete');
      return;
    }
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isConnecting || loading || privyConnecting) {
          console.log('[Modal] Cannot close during connection (Escape pressed)');
          toast.info('Please wait for connection to complete');
          return;
        }
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible, isConnecting, loading, privyConnecting, onClose]);

  if (!isVisible) return null;

  const isBusy = isConnecting || loading || privyConnecting;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={handleBackdropClick}
      />
      
      <div className="relative bg-[#171D3D] rounded-lg p-6 z-10 w-11/12 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Connect or Create Wallet</h2>
          <button 
            onClick={handleBackdropClick} 
            className={`text-gray-300 hover:text-white text-2xl leading-none ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isBusy}
          >
            ×
          </button>
        </div>

        {isBusy && (
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              <span>Connecting wallet, please wait...</span>
            </div>
          </div>
        )}

       <div className="mb-8">
  <h3 className="text-lg font-semibold mb-2">Have a Wallet</h3>
  <p className="mb-4 text-sm text-gray-400">Connect your existing wallet.</p>
  
  <div className="space-y-2">
    {solanaAdapters
      .filter(w => {
        // CRITICAL: Check wallet name FIRST before readyState
        const walletName = (w as any)?.adapter?.name || (w as any)?.name || '';
        
        // Block ALL email-based wallets (even if they report as "Loadable")
        const isEmailWallet = 
          walletName === MagicWalletName || 
          walletName === PRIVY_WALLET_NAME ||
          walletName === "Magic" ||
          walletName === "Privy (Email)" ||
          walletName.toLowerCase().includes('magic') ||
          walletName.toLowerCase().includes('privy');
        
        if (isEmailWallet) {
          console.log('[WalletModal] Filtering out email wallet:', walletName);
          return false; // Block it
        }
        
        // NOW check if it's ready
        const isReady = w.readyState === WalletReadyState.Installed || 
                        w.readyState === WalletReadyState.Loadable;
        
        return isReady;
      })
      .map(wallet => {
        const walletName = (wallet as any)?.adapter?.name || (wallet as any)?.name || 'Unknown';
        const icon = (wallet as any)?.adapter?.icon || (wallet as any)?.icon;
        
        return (
          <button
            key={walletName}
            onClick={() => handleStandardWalletClick(walletName)}
            disabled={isBusy}
            className="w-full flex items-center gap-3 bg-gray-700/50 hover:bg-gray-700 text-white py-3 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {icon && <img src={icon} alt={walletName} className="w-6 h-6" />}
            <span>{walletName}</span>
          </button>
        );
      })}
    
    {solanaAdapters.filter(w => {
      const walletName = (w as any)?.adapter?.name || (w as any)?.name || '';
      const isEmailWallet = 
        walletName === MagicWalletName || 
        walletName === PRIVY_WALLET_NAME ||
        walletName === "Magic" ||
        walletName === "Privy (Email)" ||
        walletName.toLowerCase().includes('magic') ||
        walletName.toLowerCase().includes('privy');
      
      if (isEmailWallet) return false;
      
      const isReady = w.readyState === WalletReadyState.Installed || 
                      w.readyState === WalletReadyState.Loadable;
      return isReady;
    }).length === 0 && (
      <p className="text-gray-400 text-sm">No wallets detected. Please install a Solana wallet.</p>
    )}
  </div>
</div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Don&apos;t Have a Wallet</h3>

          {mode === null && (
            <>
              <p className="text-xs mb-2 text-gray-400">Use your email to create a wallet. Choose a provider to continue.</p>
              <button
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={startEmailConnect}
                disabled={isBusy}
              >
                Connect with Email
              </button>
            </>
          )}

          {mode === "picker" && (
            <div className="mt-2 space-y-2">
              <button
                className="w-full bg-emerald-500 text-white py-2 rounded hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePrivyEmail}
                disabled={loading || !privyReady}
              >
                {loading && privyConnecting ? 
                  "Connecting Privy Solana wallet..." : 
                 !privyReady ? "Initializing Privy..." : 
                 "Continue with Privy (Solana)"}
              </button>
              <button
                className="w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={chooseMagicEmail}
                disabled={loading}
              >
                Continue with Magic (Solana)
              </button>
              <button
                className="w-full bg-transparent border border-white/20 text-white py-2 rounded hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setMode(null)}
                disabled={loading}
              >
                Back
              </button>
            </div>
          )}

          {mode === "magic-email" && (
            <form onSubmit={handleMagicEmailSubmit} className="flex flex-col gap-3 mt-2">
              <p className="text-xs text-gray-400">
                Enter your email to receive a Magic OTP. A Solana wallet will be created on success.
              </p>
              <input
                type="email"
                placeholder="your-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="border bg-[#171D3D] border-gray-300 rounded px-3 py-2 text-white disabled:opacity-50"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending OTP…" : "Send Magic Link"}
                </button>
                <button
                  type="button"
                  className="px-3 rounded border border-white/20 hover:bg-white/5 transition text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setMode("picker")}
                  disabled={loading}
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
