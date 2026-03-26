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
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { MagicWalletName } from "../MagicWalletAdapter";
import { MagicAdapterContext } from "../AppWalletProvider";
import { WalletName } from "@solana/wallet-adapter-base";

interface WalletModalProps {
  isVisible: boolean;
  onClose: () => void;
  onWalletSelect?: (walletName: WalletName) => void;
  isConnecting?: boolean;
}

type EmailFlowMode = "picker" | "magic-email" | null;

export const WalletModal = ({ isVisible, onClose, onWalletSelect, isConnecting = false }: WalletModalProps) => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<EmailFlowMode>(null);
  const [email, setEmail] = useState("");

  const { wallets: solanaAdapters, select, publicKey, connecting } = useWallet();
  const magicAdapter = useContext(MagicAdapterContext);

  useEffect(() => {
    if (!isVisible) {
      setMode(null);
      setEmail("");
      setLoading(false);
    }
  }, [isVisible]);

  const startEmailConnect = () => setMode("magic-email");

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
    if (isConnecting || loading) {
      console.log('[Modal] Cannot close during connection');
      toast.info('Please wait for connection to complete');
      return;
    }
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isConnecting || loading) {
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
  }, [isVisible, isConnecting, loading, onClose]);

  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  if (!isVisible || !portalTarget) return null;

  const isBusy = isConnecting || loading;

  // Separate installed vs loadable wallets, filter email wallets
  const filteredWallets = solanaAdapters.filter(w => {
    const walletName = (w as any)?.adapter?.name || (w as any)?.name || '';
    const isEmailWallet =
      walletName === MagicWalletName ||
      walletName === "Magic" ||
      walletName.toLowerCase().includes('magic');
    if (isEmailWallet) return false;
    return w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable;
  });

  const installedWallets = filteredWallets.filter(w => w.readyState === WalletReadyState.Installed);
  const otherWallets = filteredWallets.filter(w => w.readyState !== WalletReadyState.Installed);

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ animation: 'overlayFadeIn 0.3s ease-out forwards' }}
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-[92vw] max-w-[420px] rounded-2xl border border-[rgba(124,106,247,0.15)] overflow-hidden font-dmSans"
        style={{
          background: 'linear-gradient(168deg, #0d1120 0%, #070a14 50%, #0b0e1a 100%)',
          boxShadow: '0 0 80px rgba(124,106,247,0.08), 0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
          animation: 'walletModalIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        {/* Top gradient line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#7c6af7] to-transparent opacity-60" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[rgba(124,106,247,0.12)] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
                <path d="M16 14h2" />
              </svg>
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-white tracking-tight">Connect Wallet</h2>
              <p className="text-[11px] text-[#6b7280] mt-0.5">Choose your preferred wallet</p>
            </div>
          </div>
          <button
            onClick={handleBackdropClick}
            disabled={isBusy}
            className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] flex items-center justify-center transition-colors disabled:opacity-40"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="#6b7280">
              <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z" />
            </svg>
          </button>
        </div>

        {/* Connecting indicator */}
        {isBusy && (
          <div className="mx-6 mb-4 px-4 py-3 rounded-xl bg-[rgba(124,106,247,0.08)] border border-[rgba(124,106,247,0.15)]">
            <div className="flex items-center gap-3">
              <div className="relative w-5 h-5">
                <div className="absolute inset-0 rounded-full border-2 border-[rgba(124,106,247,0.2)] border-t-[#a78bfa] animate-spin" />
              </div>
              <span className="text-[13px] text-[#a78bfa]">Connecting wallet...</span>
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto wallet-modal-scroll">
          {/* Installed wallets - Prominent */}
          {installedWallets.length > 0 && (
            <div className="mb-5" style={{ animation: 'walletSectionIn 0.4s ease-out 0.1s both' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
                <span className="text-[11px] font-medium text-[#34d399] uppercase tracking-widest">Detected</span>
              </div>
              <div className="space-y-2">
                {installedWallets.map((wallet, idx) => {
                  const walletName = (wallet as any)?.adapter?.name || (wallet as any)?.name || 'Unknown';
                  const icon = (wallet as any)?.adapter?.icon || (wallet as any)?.icon;
                  const isPhantom = walletName.toLowerCase().includes('phantom');

                  return (
                    <button
                      key={walletName}
                      onClick={() => handleStandardWalletClick(walletName)}
                      disabled={isBusy}
                      className="group w-full flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                      style={{
                        background: isPhantom
                          ? 'linear-gradient(135deg, rgba(171,87,255,0.12) 0%, rgba(124,106,247,0.06) 100%)'
                          : 'rgba(255,255,255,0.03)',
                        border: isPhantom
                          ? '1px solid rgba(171,87,255,0.25)'
                          : '1px solid rgba(255,255,255,0.06)',
                        animation: `walletItemIn 0.3s ease-out ${0.15 + idx * 0.06}s both`,
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
                        {icon ? (
                          <img src={icon} alt={walletName} className="w-7 h-7 object-contain" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-[rgba(124,106,247,0.2)]" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-[14px] font-medium text-white">{walletName}</span>
                        {isPhantom && (
                          <span className="ml-2 text-[10px] font-medium text-[#ab57ff] bg-[rgba(171,87,255,0.15)] px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <svg className="w-4 h-4 text-[#6b7280] group-hover:text-[#a78bfa] transition-colors" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M6 4l4 4-4 4" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Other available wallets */}
          {otherWallets.length > 0 && (
            <div className="mb-5" style={{ animation: 'walletSectionIn 0.4s ease-out 0.2s both' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6b7280]" />
                <span className="text-[11px] font-medium text-[#6b7280] uppercase tracking-widest">Available</span>
              </div>
              <div className="space-y-2">
                {otherWallets.map((wallet, idx) => {
                  const walletName = (wallet as any)?.adapter?.name || (wallet as any)?.name || 'Unknown';
                  const icon = (wallet as any)?.adapter?.icon || (wallet as any)?.icon;

                  return (
                    <button
                      key={walletName}
                      onClick={() => handleStandardWalletClick(walletName)}
                      disabled={isBusy}
                      className="group w-full flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(124,106,247,0.15)] disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ animation: `walletItemIn 0.3s ease-out ${0.25 + idx * 0.06}s both` }}
                    >
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[rgba(255,255,255,0.04)] flex items-center justify-center">
                        {icon ? (
                          <img src={icon} alt={walletName} className="w-6 h-6 object-contain" />
                        ) : (
                          <div className="w-6 h-6 rounded bg-[rgba(124,106,247,0.15)]" />
                        )}
                      </div>
                      <span className="flex-1 text-left text-[13px] text-[#9ca3af]">{walletName}</span>
                      <svg className="w-4 h-4 text-[#4b5563] group-hover:text-[#6b7280] transition-colors" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M6 4l4 4-4 4" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No wallets state */}
          {filteredWallets.length === 0 && (
            <div className="text-center py-8" style={{ animation: 'walletSectionIn 0.4s ease-out 0.15s both' }}>
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[rgba(124,106,247,0.08)] border border-[rgba(124,106,247,0.12)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                  <path d="M16 14h2" />
                </svg>
              </div>
              <p className="text-[13px] text-[#6b7280] mb-1">No wallets detected</p>
              <p className="text-[11px] text-[#4b5563]">Install a Solana wallet like Phantom to continue</p>
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-[rgba(171,87,255,0.1)] border border-[rgba(171,87,255,0.2)] text-[12px] text-[#ab57ff] font-medium hover:bg-[rgba(171,87,255,0.15)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Get Phantom
              </a>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[rgba(255,255,255,0.06)]" />
            <span className="text-[10px] text-[#4b5563] uppercase tracking-widest">or</span>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[rgba(255,255,255,0.06)]" />
          </div>

          {/* Email wallet section */}
          <div style={{ animation: 'walletSectionIn 0.4s ease-out 0.3s both' }}>
            <div className="flex items-center gap-2 mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span className="text-[11px] font-medium text-[#6b7280] uppercase tracking-widest">Email Wallet</span>
            </div>

            {mode === null && (
              <button
                className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onClick={startEmailConnect}
                disabled={isBusy}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span className="text-[#9ca3af]">Continue with Email</span>
              </button>
            )}

            {mode === "magic-email" && (
              <form onSubmit={handleMagicEmailSubmit} className="space-y-3">
                <p className="text-[11px] text-[#6b7280]">
                  Enter your email to receive a Magic OTP.
                </p>
                <input
                  type="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-xl px-4 py-3 text-[13px] text-white placeholder-[#4b5563] disabled:opacity-40 outline-none transition-colors focus:border-[rgba(124,106,247,0.4)]"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-xl px-4 py-3 text-[13px] font-medium text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
                    style={{
                      background: 'linear-gradient(135deg, #7c6af7 0%, #6c5ce7 100%)',
                      boxShadow: '0 4px 12px rgba(124,106,247,0.25)',
                    }}
                  >
                    {loading ? "Sending OTP..." : "Send Magic Link"}
                  </button>
                  <button
                    type="button"
                    className="px-4 rounded-xl text-[12px] text-[#6b7280] hover:text-[#9ca3af] transition-colors border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)]"
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

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-center">
          <span className="text-[10px] text-[#4b5563]">Powered by ZkTerminal</span>
        </div>
      </div>
    </div>,
    portalTarget
  );
};
