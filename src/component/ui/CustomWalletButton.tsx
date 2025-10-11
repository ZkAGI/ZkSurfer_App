// "use client";

// import { useEffect, useState, useCallback, useContext, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useWalletModal } from "@solana/wallet-adapter-react-ui";
// import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import { WalletReadyState } from "@solana/wallet-adapter-base";
// import { toast } from "sonner";
// import { WalletModal } from "./WalletModal";
// import { MagicWalletName } from "../MagicWalletAdapter";
// import { PublicKey } from "@solana/web3.js";
// import { MagicAdapterContext } from "../AppWalletProvider";
// import { WalletName } from "@solana/wallet-adapter-base";
// import { useModelStore } from "@/stores/useModel-store";

// // Add TypeScript declarations for wallet browser properties
// declare global {
//   interface Window {
//     phantom?: {
//       solana?: {
//         isPhantom?: boolean;
//       };
//     };
//     magic?: any;
//     magicAdapter?: any;
//     MagicWalletName?: WalletName<"Magic">; // Must match the type from earlier declaration
//   }
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

// export const CustomWalletButton = () => {
//   const router = useRouter();
//   const { setVisible } = useWalletModal();
//   const { publicKey, wallet, connecting, disconnecting, wallets, select } =
//     useWallet();
//   const [isModalVisible, setModalVisible] = useState(false);
//   const [isFirstLoad, setIsFirstLoad] = useState(true);
//   const [storedWalletAddress, setStoredWalletAddress] = useState<string | null>(
//     null
//   );
//   const [isDisconnecting, setIsDisconnecting] = useState(false);
//   const [hasCalledAddUser, setHasCalledAddUser] = useState(false);

//   // Get Magic adapter from context
//   const magicAdapter = useContext(MagicAdapterContext);
//   const [revealing, setRevealing] = useState(false);

//   //Set credits and keys
//   const { setCredits, setApiKey, setUserEmail } = useModelStore();


//   // Debug available wallets on mount
//   useEffect(() => {
//     if (wallets && wallets.length > 0) {
//       console.log(
//         "CustomWalletButton - Available wallets:",
//         wallets.map((w) => ({
//           name: (w as any)?.name || "unnamed",
//           ready: (w as any)?.readyState,
//         }))
//       );
//     }
//   }, [wallets]);

//   // Initialization logic: check localStorage and try to connect Magic wallet if necessary
//   useEffect(() => {
//     if (!isFirstLoad) return;

//     setIsFirstLoad(false);
//     console.log("First load completed");

//     const storedAddress = localStorage.getItem("connectedWalletAddress");
//     const storedWalletName = localStorage.getItem("walletName");

//     if (storedAddress) {
//       setStoredWalletAddress(storedAddress);

//       // If no publicKey yet but we have stored address from Magic, try to connect
//       if (!publicKey && storedWalletName === MagicWalletName) {
//         console.log("Found stored Magic wallet address:", storedAddress);

//         // Try to trigger a wallet selection after a delay
//         setTimeout(() => {
//           if (
//             !publicKey &&
//             wallets.some((w) => (w as any)?.name === MagicWalletName)
//           ) {
//             console.log("Selecting Magic wallet");
//             select(MagicWalletName);
//           }
//         }, 1000);
//       }
//     }
//   }, [isFirstLoad, publicKey, wallets, select]);

//   const getEmailSimple = async () => {
//     try {
//       if (magicAdapter && (magicAdapter as any)._magic?.user) {
//         const userInfo = await (magicAdapter as any)._magic.user.getInfo();
//         console.log('📧 Magic user info:', userInfo);

//         if (userInfo?.email) {
//           console.log('✅ Email found:', userInfo.email);
//           setUserEmail(userInfo.email); // 🔥 STORE IN ZUSTAND
//           return userInfo.email;
//         }
//       }
//       return null;
//     } catch (error) {
//       console.error('Error getting email:', error);
//       return null;
//     }
//   };

//   // Update stored address when public key changes
//   useEffect(() => {
//     if (publicKey) {
//       const publicKeyString = publicKey.toString();
//       setStoredWalletAddress(publicKeyString);
//       localStorage.setItem("connectedWalletAddress", publicKeyString);
//       console.log("Public key updated:", publicKeyString);
//       if (isMagicWallet) getEmailSimple();
//     }
//   }, [publicKey]);

//   // Handle wallet disconnection without triggering a refresh
//   // useEffect(() => {
//   //   if (disconnecting || (!publicKey && !connecting && !isFirstLoad)) {
//   //     const hasWalletName = localStorage.getItem("walletName");
//   //     if (hasWalletName) {
//   //       console.log("Wallet disconnected, removing walletName");
//   //       localStorage.removeItem("walletName");
//   //       localStorage.removeItem("connectedWalletAddress");
//   //       setStoredWalletAddress(null);
//   //     }
//   //   }
//   // }, [publicKey, disconnecting, connecting, isFirstLoad]);

//   useEffect(() => {
//   if (disconnecting) {
//     console.log("User clicked disconnect → clearing storage");
//     localStorage.removeItem("walletName");
//     localStorage.removeItem("connectedWalletAddress");
//     setStoredWalletAddress(null);
//   }
// }, [disconnecting]);

//   // Check both publicKey and storedWalletAddress for display
//   const walletAddress = publicKey?.toString() || storedWalletAddress;

//   // Check connection status
//   const isConnected =
//     !!publicKey ||
//     (!!storedWalletAddress &&
//       localStorage.getItem("walletName") === MagicWalletName);

//   useEffect(() => {
//     if (
//       isConnected && // we’re connected
//       walletAddress && // we have an address
//       !hasCalledAddUser // and haven’t called yet
//     ) {
//       setHasCalledAddUser(true);

//       fetch("https://zynapse.zkagi.ai/add-user", {
//         method: "POST",
//         headers: {
//           "api-key": "zk-123321",
//           accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           wallet_address: walletAddress,
//         }),
//       })
//         .then(async (res) => {
//           const json = await res.json();
//           console.log("add-user response:", json);

//           // Update the store with the response data
//           if (json.credit_balance !== undefined) {
//             setCredits(json.credit_balance);
//             console.log("Updated credits:", json.credit_balance);
//           }

//           if (json.api_keys && json.api_keys.length > 0) {
//             const firstApiKey = json.api_keys[0];
//             setApiKey(firstApiKey);
//             console.log("Updated API key:", firstApiKey);
//           }
//         })
//         .catch((err) => {
//           console.error("Error calling add-user:", err);
//         });
//     }
//   }, [isConnected, walletAddress, hasCalledAddUser]);

//   // Create a custom wallet button component for Magic Link wallets
//   const CustomConnectedButton = ({ address }: { address: string }) => {
//     const [menuOpen, setMenuOpen] = useState(false);
//     const [copied, setCopied] = useState(false);
//     const menuRef = useRef<HTMLUListElement>(null);

//     const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

//     useEffect(() => {
//       const listener = (event: MouseEvent | TouchEvent) => {
//         const node = menuRef.current;
//         if (!node || node.contains(event.target as Node)) return;
//         setMenuOpen(false);
//       };

//       document.addEventListener('mousedown', listener);
//       document.addEventListener('touchstart', listener);

//       return () => {
//         document.removeEventListener('mousedown', listener);
//         document.removeEventListener('touchstart', listener);
//       };
//     }, []);

//     const handleCopyAddress = async () => {
//       try {
//         await navigator.clipboard.writeText(address);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 400);
//         toast.success('Address copied to clipboard');
//       } catch (error) {
//         console.error('Failed to copy address:', error);
//         toast.error('Failed to copy address');
//       }
//     };
//     const handleRevealKey = async () => {
//       console.log('🔑 Reveal Private Key clicked', { magicAdapter: !!magicAdapter });

//       if (!magicAdapter) {
//         console.error('No magic adapter available');
//         toast.error('Magic adapter not available');
//         return;
//       }

//       setRevealing(true);
//       try {
//         await magicAdapter.revealPrivateKey();
//         toast.success('Private key revealed successfully');
//       } catch (error: any) {
//         const msg = error?.message || '';
//         const code = error?.code;

//         // These conditions might vary by adapter; adjust to match your SDK.
//         const isUserCancelled =
//           msg.toLowerCase().includes('user canceled') ||
//           msg.toLowerCase().includes('user closed') ||
//           code === 4001; // common “user rejected” code in Solana adapters

//         if (isUserCancelled) {
//           console.log('Reveal-private-key modal closed by user – no error toast shown.');
//         } else {
//           console.error('Error revealing private key:', error);
//           toast.error(`Failed to reveal private key${msg ? `: ${msg}` : ''}`);
//         }
//       } finally {
//         setRevealing(false);
//         setMenuOpen(false);
//       }
//     };

//     const handleDisconnect = async () => {
//       console.log("Disconnecting wallet...");
//       setIsDisconnecting(true);
//       setUserEmail(null);

//       try {
//         if (magicAdapter) {
//           console.log("Disconnecting using Magic adapter from context");
//           await magicAdapter.disconnect();
//           return;
//         }

//         const adapterFromList = wallets.find(
//           (w) => (w as any)?.name === MagicWalletName
//         );

//         if (adapterFromList) {
//           console.log("Disconnecting using Magic adapter from wallet list");
//           await (adapterFromList as any).disconnect();
//         } else {
//           console.log("Magic adapter not found, using localStorage fallback");
//           localStorage.removeItem("walletName");
//           localStorage.removeItem("connectedWalletAddress");
//           setStoredWalletAddress(null);
//           window.location.reload();
//         }
//       } catch (error) {
//         console.error("Error during disconnect:", error);
//         toast.error("Failed to disconnect wallet. Please try again.");
//         window.location.reload();
//       } finally {
//         setIsDisconnecting(false);
//       }
//       setMenuOpen(false);
//     };


//     const handleChangeWallet = () => {
//       setModalVisible(true);
//       setMenuOpen(false);
//     };

//     return (
//       <div className="wallet-adapter-dropdown relative">
//         <div
//           className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
//           style={{
//             clipPath:
//               "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//             backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
//             backgroundSize: "200% 200%",
//             animation: "spinGradient 3s linear infinite",
//           }}
//           onClick={() => setMenuOpen(true)}
//         >
//           <div className="flex items-center justify-center px-4 py-2 text-white">
//             <span className="font-mono">{displayAddress}</span>
//           </div>
//         </div>

//         <ul
//           ref={menuRef}
//           className={`absolute top-full left-0 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 ${menuOpen ? 'block' : 'hidden'
//             }`}
//           role="menu"
//         >
//           <li
//             className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer border-b border-gray-600"
//             onClick={handleCopyAddress}
//             role="menuitem"
//           >
//             {copied ? '✓ Copied' : '📋 Copy address'}
//           </li>

//           <li
//             className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer border-b border-gray-600"
//             onClick={handleChangeWallet}
//             role="menuitem"
//           >
//             🔄 Change wallet
//           </li>

//           <li
//             className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer border-b border-gray-600"
//             onClick={handleRevealKey}
//             role="menuitem"
//           >
//             {revealing ? '🔄 Revealing...' : '🔑 Reveal Private Key'}
//           </li>

//           <li
//             className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer"
//             onClick={handleDisconnect}
//             role="menuitem"
//           >
//             {isDisconnecting ? '⏳ Disconnecting...' : '🚪 Disconnect'}
//           </li>
//         </ul>
//       </div>
//     );
//   };

//   const handleClick = () => {
//     // Only show our custom modal
//     setModalVisible(true);

//     // Check if wallets are installed
//     const hasPhantom = wallets.some(
//       (w) =>
//         (w as any)?.name === "Phantom" &&
//         ((w as any)?.readyState === WalletReadyState.Installed ||
//           (w as any)?.readyState === WalletReadyState.Loadable)
//     );

//     // If no wallets are detected, show the installation prompt
//     if (!hasPhantom) {
//       toast.error(
//         "No available Solana wallets found. Please install a wallet to continue.",
//         {
//           action: {
//             label: "Install Phantom",
//             onClick: () => window.open("https://phantom.app/", "_blank"),
//           },
//         }
//       );
//     }
//   };

//   // const adapterName = (wallet as any)?.adapter?.name;
//   const adapterName = (wallet as any)?.adapter?.name;
//   const isMagicWallet = adapterName === MagicWalletName ||
//     localStorage.getItem("walletName") === MagicWalletName;

//   return (
//     <div className="flex items-center justify-center relative wallet-button">
//       {isMagicWallet && (publicKey || walletAddress) && walletAddress ? (
//         <CustomConnectedButton address={walletAddress} />
//       ) : publicKey ? (
//         // Show standard Solana wallet button if publicKey exists
//         <BaseWalletMultiButton
//           labels={LABELS}
//           className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
//           style={{
//             clipPath:
//               "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//             backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
//             backgroundSize: "200% 200%",
//             animation: "spinGradient 3s linear infinite",
//           }}
//         />
//       )
//         // : walletAddress ? (
//         //   //&& !publicKey
//         //   // Show custom button for Magic Link wallet if we have a walletAddress but no publicKey
//         //   <CustomConnectedButton address={walletAddress} />
//         // )
//         : (
//           <div
//             className="wallet-button transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
//             style={{
//               clipPath:
//                 "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//               backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
//               backgroundSize: "200% 200%",
//               animation: "spinGradient 3s linear infinite",
//             }}
//             onClick={handleClick}
//           >
//             <div
//               className="wallet-button transition-all ease-out relative duration-500 active:bg-opacity-80 block w-full overflow-hidden custom-gradient hover:bg-gradient-to-r hover:from-zkPurple hover:to-zkIndigo60 active:from-zkPurple60 hover:p-[1px]"
//               style={{
//                 clipPath:
//                   "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//               }}
//             >
//               <div className="transition-all ease-out duration-500 px-10 lg:px-12 py-4 text-center bg-clip-text text-transparent hover:text-white bg-gradient-to-l from-zkIndigo to-zkPurple font-bold tracking-wider">
//                 Connect
//               </div>
//             </div>
//           </div>
//         )}
//       <WalletModal
//         isVisible={isModalVisible}
//         onClose={() => setModalVisible(false)}
//       />
//     </div>
//   );
// };

// "use client";

// import { useEffect, useState, useCallback, useContext, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useWalletModal } from "@solana/wallet-adapter-react-ui";
// import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import { WalletReadyState } from "@solana/wallet-adapter-base";
// import { toast } from "sonner";
// import { WalletModal } from "./WalletModal";
// import { MagicWalletName } from "../MagicWalletAdapter";
// import { PublicKey } from "@solana/web3.js";
// import { MagicAdapterContext } from "../AppWalletProvider";
// import { WalletName } from "@solana/wallet-adapter-base";
// import { useModelStore } from "@/stores/useModel-store";

// // Add TypeScript declarations for wallet browser properties
// declare global {
//   interface Window {
//     phantom?: {
//       solana?: {
//         isPhantom?: boolean;
//       };
//     };
//     magic?: any;
//     magicAdapter?: any;
//     MagicWalletName?: WalletName<"Magic">; // Must match the type from earlier declaration
//   }
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

// // Safe localStorage helper
// const safeLocalStorage = {
//   getItem: (key: string): string | null => {
//     if (typeof window === 'undefined') return null;
//     return localStorage.getItem(key);
//   },
//   setItem: (key: string, value: string): void => {
//     if (typeof window === 'undefined') return;
//     localStorage.setItem(key, value);
//   },
//   removeItem: (key: string): void => {
//     if (typeof window === 'undefined') return;
//     localStorage.removeItem(key);
//   }
// };

// export const CustomWalletButton = () => {
//   const router = useRouter();
//   const { setVisible } = useWalletModal();
//   const { publicKey, wallet, connecting, disconnecting, wallets, select } =
//     useWallet();
//   const [isModalVisible, setModalVisible] = useState(false);
//   const [isFirstLoad, setIsFirstLoad] = useState(true);
//   const [storedWalletAddress, setStoredWalletAddress] = useState<string | null>(
//     null
//   );
//   const [isDisconnecting, setIsDisconnecting] = useState(false);
//   const [hasCalledAddUser, setHasCalledAddUser] = useState(false);

//   // Get Magic adapter from context
//   const magicAdapter = useContext(MagicAdapterContext);
//   const [revealing, setRevealing] = useState(false);

//   //Set credits and keys
//   const { setCredits, setApiKey, setUserEmail } = useModelStore();

//   // Debug available wallets on mount
//   useEffect(() => {
//     if (wallets && wallets.length > 0) {
//       console.log(
//         "CustomWalletButton - Available wallets:",
//         wallets.map((w) => ({
//           name: (w as any)?.name || "unnamed",
//           ready: (w as any)?.readyState,
//         }))
//       );
//     }
//   }, [wallets]);

//   // Initialization logic: check localStorage and try to connect Magic wallet if necessary
//   useEffect(() => {
//     if (!isFirstLoad) return;

//     setIsFirstLoad(false);
//     console.log("First load completed");

//     const storedAddress = safeLocalStorage.getItem("connectedWalletAddress");
//     const storedWalletName = safeLocalStorage.getItem("walletName");

//     if (storedAddress) {
//       setStoredWalletAddress(storedAddress);

//       // If no publicKey yet but we have stored address from Magic, try to connect
//       if (!publicKey && storedWalletName === MagicWalletName) {
//         console.log("Found stored Magic wallet address:", storedAddress);

//         // Try to trigger a wallet selection after a delay
//         setTimeout(() => {
//           if (
//             !publicKey &&
//             wallets.some((w) => (w as any)?.name === MagicWalletName)
//           ) {
//             console.log("Selecting Magic wallet");
//             select(MagicWalletName);
//           }
//         }, 1000);
//       }
//     }
//   }, [isFirstLoad, publicKey, wallets, select]);

//   const getEmailSimple = async () => {
//     try {
//       if (magicAdapter && (magicAdapter as any)._magic?.user) {
//         const userInfo = await (magicAdapter as any)._magic.user.getInfo();
//         console.log('📧 Magic user info:', userInfo);

//         if (userInfo?.email) {
//           console.log('✅ Email found:', userInfo.email);
//           setUserEmail(userInfo.email); // 🔥 STORE IN ZUSTAND
//           return userInfo.email;
//         }
//       }
//       return null;
//     } catch (error) {
//       console.error('Error getting email:', error);
//       return null;
//     }
//   };

//   // Update stored address when public key changes
//   useEffect(() => {
//     if (publicKey) {
//       const publicKeyString = publicKey.toString();
//       setStoredWalletAddress(publicKeyString);
//       safeLocalStorage.setItem("connectedWalletAddress", publicKeyString);
//       console.log("Public key updated:", publicKeyString);
//       if (isMagicWallet) getEmailSimple();
//     }
//   }, [publicKey]);

//   // Handle wallet disconnection without triggering a refresh
//   // useEffect(() => {
//   //   if (disconnecting || (!publicKey && !connecting && !isFirstLoad)) {
//   //     const hasWalletName = safeLocalStorage.getItem("walletName");
//   //     if (hasWalletName) {
//   //       console.log("Wallet disconnected, removing walletName");
//   //       safeLocalStorage.removeItem("walletName");
//   //       safeLocalStorage.removeItem("connectedWalletAddress");
//   //       setStoredWalletAddress(null);
//   //     }
//   //   }
//   // }, [publicKey, disconnecting, connecting, isFirstLoad]);

//   useEffect(() => {
//     if (disconnecting) {
//       console.log("User clicked disconnect → clearing storage");
//       safeLocalStorage.removeItem("walletName");
//       safeLocalStorage.removeItem("connectedWalletAddress");
//       setStoredWalletAddress(null);
//     }
//   }, [disconnecting]);

//   // Check both publicKey and storedWalletAddress for display
//   const walletAddress = publicKey?.toString() || storedWalletAddress;

//   // Check connection status
//   const isConnected =
//     !!publicKey ||
//     (!!storedWalletAddress &&
//       safeLocalStorage.getItem("walletName") === MagicWalletName);

//   useEffect(() => {
//     if (
//       isConnected && // we're connected
//       walletAddress && // we have an address
//       !hasCalledAddUser // and haven't called yet
//     ) {
//       setHasCalledAddUser(true);

//       fetch("https://zynapse.zkagi.ai/add-user", {
//         method: "POST",
//         headers: {
//           "api-key": "zk-123321",
//           accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           wallet_address: walletAddress,
//         }),
//       })
//         .then(async (res) => {
//           const json = await res.json();
//           console.log("add-user response:", json);

//           // Update the store with the response data
//           if (json.credit_balance !== undefined) {
//             setCredits(json.credit_balance);
//             console.log("Updated credits:", json.credit_balance);
//           }

//           if (json.api_keys && json.api_keys.length > 0) {
//             const firstApiKey = json.api_keys[0];
//             setApiKey(firstApiKey);
//             console.log("Updated API key:", firstApiKey);
//           }
//         })
//         .catch((err) => {
//           console.error("Error calling add-user:", err);
//         });
//     }
//   }, [isConnected, walletAddress, hasCalledAddUser]);

//   // Create a custom wallet button component for Magic Link wallets
//   const CustomConnectedButton = ({ address }: { address: string }) => {
//     const [menuOpen, setMenuOpen] = useState(false);
//     const [copied, setCopied] = useState(false);
//     const menuRef = useRef<HTMLUListElement>(null);

//     const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

//     useEffect(() => {
//       const listener = (event: MouseEvent | TouchEvent) => {
//         const node = menuRef.current;
//         if (!node || node.contains(event.target as Node)) return;
//         setMenuOpen(false);
//       };

//       document.addEventListener('mousedown', listener);
//       document.addEventListener('touchstart', listener);

//       return () => {
//         document.removeEventListener('mousedown', listener);
//         document.removeEventListener('touchstart', listener);
//       };
//     }, []);

//     const handleCopyAddress = async () => {
//       try {
//         await navigator.clipboard.writeText(address);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 400);
//         toast.success('Address copied to clipboard');
//       } catch (error) {
//         console.error('Failed to copy address:', error);
//         toast.error('Failed to copy address');
//       }
//     };

//     const handleRevealKey = async () => {
//       console.log('🔑 Reveal Private Key clicked', { magicAdapter: !!magicAdapter });

//       if (!magicAdapter) {
//         console.error('No magic adapter available');
//         toast.error('Magic adapter not available');
//         return;
//       }

//       setRevealing(true);
//       try {
//         await magicAdapter.revealPrivateKey();
//         toast.success('Private key revealed successfully');
//       } catch (error: any) {
//         const msg = error?.message || '';
//         const code = error?.code;

//         // These conditions might vary by adapter; adjust to match your SDK.
//         const isUserCancelled =
//           msg.toLowerCase().includes('user canceled') ||
//           msg.toLowerCase().includes('user closed') ||
//           code === 4001; // common "user rejected" code in Solana adapters

//         if (isUserCancelled) {
//           console.log('Reveal-private-key modal closed by user – no error toast shown.');
//         } else {
//           console.error('Error revealing private key:', error);
//           toast.error(`Failed to reveal private key${msg ? `: ${msg}` : ''}`);
//         }
//       } finally {
//         setRevealing(false);
//         setMenuOpen(false);
//       }
//     };

//     const handleDisconnect = async () => {
//       console.log("Disconnecting wallet...");
//       setIsDisconnecting(true);
//       setUserEmail(null);

//       try {
//         if (magicAdapter) {
//           console.log("Disconnecting using Magic adapter from context");
//           await magicAdapter.disconnect();
//           return;
//         }

//         const adapterFromList = wallets.find(
//           (w) => (w as any)?.name === MagicWalletName
//         );

//         if (adapterFromList) {
//           console.log("Disconnecting using Magic adapter from wallet list");
//           await (adapterFromList as any).disconnect();
//         } else {
//           console.log("Magic adapter not found, using localStorage fallback");
//           safeLocalStorage.removeItem("walletName");
//           safeLocalStorage.removeItem("connectedWalletAddress");
//           setStoredWalletAddress(null);
//           window.location.reload();
//         }
//       } catch (error) {
//         console.error("Error during disconnect:", error);
//         toast.error("Failed to disconnect wallet. Please try again.");
//         window.location.reload();
//       } finally {
//         setIsDisconnecting(false);
//       }
//       setMenuOpen(false);
//     };

//     const handleChangeWallet = () => {
//       setModalVisible(true);
//       setMenuOpen(false);
//     };

//     return (
//       <div className="wallet-adapter-dropdown relative">
//         <div
//           className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
//           style={{
//             clipPath:
//               "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//             backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
//             backgroundSize: "200% 200%",
//             animation: "spinGradient 3s linear infinite",
//           }}
//           onClick={() => setMenuOpen(true)}
//         >
//           <div className="flex items-center justify-center px-4 py-2 text-white">
//             <span className="font-mono">{displayAddress}</span>
//           </div>
//         </div>

//         <ul
//           ref={menuRef}
//           className={`absolute top-full left-0 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 ${menuOpen ? 'block' : 'hidden'
//             }`}
//           role="menu"
//         >
//           <li
//             className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer border-b border-gray-600"
//             onClick={handleCopyAddress}
//             role="menuitem"
//           >
//             {copied ? '✓ Copied' : '📋 Copy address'}
//           </li>

//           <li
//             className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer border-b border-gray-600"
//             onClick={handleChangeWallet}
//             role="menuitem"
//           >
//             🔄 Change wallet
//           </li>

//           <li
//             className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer border-b border-gray-600"
//             onClick={handleRevealKey}
//             role="menuitem"
//           >
//             {revealing ? '🔄 Revealing...' : '🔑 Reveal Private Key'}
//           </li>

//           <li
//             className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer"
//             onClick={handleDisconnect}
//             role="menuitem"
//           >
//             {isDisconnecting ? '⏳ Disconnecting...' : '🚪 Disconnect'}
//           </li>
//         </ul>
//       </div>
//     );
//   };

//   const handleClick = () => {
//     // Only show our custom modal
//     setModalVisible(true);

//     // Check if wallets are installed
//     const hasPhantom = wallets.some(
//       (w) =>
//         (w as any)?.name === "Phantom" &&
//         ((w as any)?.readyState === WalletReadyState.Installed ||
//           (w as any)?.readyState === WalletReadyState.Loadable)
//     );

//     // If no wallets are detected, show the installation prompt
//     if (!hasPhantom) {
//       toast.error(
//         "No available Solana wallets found. Please install a wallet to continue.",
//         {
//           action: {
//             label: "Install Phantom",
//             onClick: () => window.open("https://phantom.app/", "_blank"),
//           },
//         }
//       );
//     }
//   };

//   // Fixed line 407-408 with safe localStorage check
//   const adapterName = (wallet as any)?.adapter?.name;
//   const isMagicWallet = adapterName === MagicWalletName ||
//     safeLocalStorage.getItem("walletName") === MagicWalletName;

//   return (
//     <div className="flex items-center justify-center relative wallet-button">
//       {isMagicWallet && (publicKey || walletAddress) && walletAddress ? (
//         <CustomConnectedButton address={walletAddress} />
//       ) : publicKey ? (
//         // Show standard Solana wallet button if publicKey exists
//         <BaseWalletMultiButton
//           labels={LABELS}
//           className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
//           style={{
//             clipPath:
//               "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//             backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
//             backgroundSize: "200% 200%",
//             animation: "spinGradient 3s linear infinite",
//           }}
//         />
//       )
//         // : walletAddress ? (
//         //   //&& !publicKey
//         //   // Show custom button for Magic Link wallet if we have a walletAddress but no publicKey
//         //   <CustomConnectedButton address={walletAddress} />
//         // )
//         : (
//           <div
//             className="wallet-button transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
//             style={{
//               clipPath:
//                 "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//               backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
//               backgroundSize: "200% 200%",
//               animation: "spinGradient 3s linear infinite",
//             }}
//             onClick={handleClick}
//           >
//             <div
//               className="wallet-button transition-all ease-out relative duration-500 active:bg-opacity-80 block w-full overflow-hidden custom-gradient hover:bg-gradient-to-r hover:from-zkPurple hover:to-zkIndigo60 active:from-zkPurple60 hover:p-[1px]"
//               style={{
//                 clipPath:
//                   "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//               }}
//             >
//               <div className="transition-all ease-out duration-500 px-10 lg:px-12 py-4 text-center bg-clip-text text-transparent hover:text-white bg-gradient-to-l from-zkIndigo to-zkPurple font-bold tracking-wider">
//                 Connect
//               </div>
//             </div>
//           </div>
//         )}
//       <WalletModal
//         isVisible={isModalVisible}
//         onClose={() => setModalVisible(false)}
//       />
//     </div>
//   );
// };

"use client";

import { useEffect, useState, useCallback, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { toast } from "sonner";
import { WalletModal } from "./WalletModal";
import { MagicWalletName } from "../MagicWalletAdapter";
import { PublicKey } from "@solana/web3.js";
import { MagicAdapterContext } from "../AppWalletProvider";
import { WalletName } from "@solana/wallet-adapter-base";
import { useModelStore } from "@/stores/useModel-store";

declare global {
  interface Window {
    phantom?: { solana?: { isPhantom?: boolean } };
    magic?: any;
    magicAdapter?: any;
    MagicWalletName?: WalletName<"Magic">;
  }
}

const LABELS = {
  "change-wallet": "Change wallet",
  connecting: "Connecting ...",
  "copy-address": "Copy address",
  copied: "Copied",
  disconnect: "Disconnect",
  "has-wallet": "Connect",
  "no-wallet": "Select Wallet",
};

// Enhanced safe localStorage with validation
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('localStorage.getItem error:', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('localStorage.setItem error:', e);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('localStorage.removeItem error:', e);
    }
  },
  clearWalletData: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem("walletName");
      localStorage.removeItem("connectedWalletAddress");
      localStorage.removeItem("zk:lastWallet");
      localStorage.removeItem("zk:connectedWalletAddress");
    } catch (e) {
      console.error('localStorage.clearWalletData error:', e);
    }
  }
};

// State machine for connection lifecycle
type ConnectionState = 'idle' | 'selecting' | 'connecting' | 'connected' | 'error' | 'disconnecting';

class ConnectionStateMachine {
  private static instance: ConnectionStateMachine;
  private state: ConnectionState = 'idle';
  private listeners: Set<(state: ConnectionState) => void> = new Set();
  private connectionTimeout: NodeJS.Timeout | null = null;
  private lastError: string | null = null;

  static getInstance(): ConnectionStateMachine {
    if (!ConnectionStateMachine.instance) {
      ConnectionStateMachine.instance = new ConnectionStateMachine();
    }
    return ConnectionStateMachine.instance;
  }

  getState(): ConnectionState {
    return this.state;
  }

  getLastError(): string | null {
    return this.lastError;
  }

  setState(newState: ConnectionState, error?: string) {
    console.log(`[ConnectionStateMachine] ${this.state} -> ${newState}`);
    this.state = newState;
    if (error) this.lastError = error;
    else if (newState !== 'error') this.lastError = null;
    
    this.listeners.forEach(listener => listener(newState));
    
    // Clear timeout if we reach terminal state
    if (newState === 'connected' || newState === 'idle' || newState === 'error') {
      this.clearTimeout();
    }
  }

  subscribe(listener: (state: ConnectionState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  startTimeout(duration: number = 15000) {
    this.clearTimeout();
    this.connectionTimeout = setTimeout(() => {
      if (this.state === 'selecting' || this.state === 'connecting') {
        console.error('[ConnectionStateMachine] Connection timeout');
        this.setState('error', 'Connection timeout');
      }
    }, duration);
  }

  clearTimeout() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  reset() {
    this.clearTimeout();
    this.state = 'idle';
    this.lastError = null;
  }
}

export const CustomWalletButton = () => {
  const router = useRouter();
  const { publicKey, wallet, connecting, disconnecting, wallets, select, disconnect } = useWallet();
  
  // ONLY use custom modal, ignore useWalletModal
  const [isModalVisible, setModalVisible] = useState(false);
  const [storedWalletAddress, setStoredWalletAddress] = useState<string | null>(null);
  const [hasCalledAddUser, setHasCalledAddUser] = useState(false);
  const [revealing, setRevealing] = useState(false);
  
  const magicAdapter = useContext(MagicAdapterContext);
  const { setCredits, setApiKey, setUserEmail } = useModelStore();
  
  const stateMachine = useRef(ConnectionStateMachine.getInstance());
  const mountedRef = useRef(true);
  const reconnectAttempted = useRef(false);
  const walletEventCleanup = useRef<(() => void) | null>(null);

  // Subscribe to state machine
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  
  useEffect(() => {
    const unsubscribe = stateMachine.current.subscribe(setConnectionState);
    return unsubscribe;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stateMachine.current.reset();
      if (walletEventCleanup.current) {
        walletEventCleanup.current();
      }
    };
  }, []);

  // Validate stored wallet state
  const validateStoredWallet = useCallback((): boolean => {
    const storedAddress = safeLocalStorage.getItem("connectedWalletAddress");
    const storedWalletName = safeLocalStorage.getItem("walletName");
    
    if (!storedAddress || !storedWalletName) return false;
    
    if (storedWalletName === MagicWalletName) {
      try {
        new PublicKey(storedAddress);
        return true;
      } catch {
        console.error('Invalid stored Magic wallet address');
        safeLocalStorage.clearWalletData();
        return false;
      }
    }
    
    return true;
  }, []);

  // Event-driven wallet connection with proper awaiting
  const connectWallet = useCallback(async (walletName: WalletName) => {
    if (stateMachine.current.getState() !== 'idle') {
      console.log('[connectWallet] Already in progress, ignoring');
      return;
    }

    stateMachine.current.setState('selecting');
    stateMachine.current.startTimeout();

    try {
      console.log(`[connectWallet] Starting connection to ${walletName}`);
      
      // Find the wallet adapter
      const targetWallet = wallets.find(w => (w as any)?.name === walletName);
      if (!targetWallet) {
        throw new Error(`Wallet ${walletName} not found`);
      }

      const adapter = (targetWallet as any).adapter;
      
      // Set up event listeners BEFORE selecting
      const cleanupPromise = new Promise<void>((resolve, reject) => {
        const onConnect = () => {
          console.log('[connectWallet] Wallet connected event');
          stateMachine.current.setState('connected');
          cleanup();
          resolve();
        };

        const onError = (error: any) => {
          console.error('[connectWallet] Wallet error event:', error);
          stateMachine.current.setState('error', error.message || 'Connection failed');
          cleanup();
          reject(error);
        };

        const onDisconnect = () => {
          console.log('[connectWallet] Wallet disconnected event during connection');
          stateMachine.current.setState('error', 'Disconnected during connection');
          cleanup();
          reject(new Error('Disconnected'));
        };

        const cleanup = () => {
          adapter.removeListener('connect', onConnect);
          adapter.removeListener('error', onError);
          adapter.removeListener('disconnect', onDisconnect);
        };

        adapter.on('connect', onConnect);
        adapter.on('error', onError);
        adapter.on('disconnect', onDisconnect);

        // Store cleanup for later
        walletEventCleanup.current = cleanup;
      });

      // Now select the wallet
      stateMachine.current.setState('connecting');
      select(walletName);

      // Wait for connection with timeout
      await Promise.race([
        cleanupPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 15000)
        )
      ]);

      console.log('[connectWallet] Successfully connected');
      
    } catch (error: any) {
      console.error('[connectWallet] Failed:', error);
      stateMachine.current.setState('error', error.message || 'Connection failed');
      
      // Don't show toast for user cancellations
      const isCancelled = error.message?.toLowerCase().includes('user') || 
                         error.code === 4001;
      if (!isCancelled) {
        toast.error(`Failed to connect: ${error.message || 'Unknown error'}`);
      }
    }
  }, [wallets, select]);

  // Auto-reconnect on mount (only once)
  useEffect(() => {
    if (reconnectAttempted.current || publicKey || connectionState !== 'idle') return;

    const storedWalletName = safeLocalStorage.getItem("walletName");
    const storedAddress = safeLocalStorage.getItem("connectedWalletAddress");

    if (storedWalletName === MagicWalletName && storedAddress && validateStoredWallet()) {
      reconnectAttempted.current = true;
      setStoredWalletAddress(storedAddress);

      console.log('[Auto-reconnect] Attempting to reconnect Magic wallet');
      
      // Use a small delay to ensure wallets are ready
      setTimeout(() => {
        if (mountedRef.current && !publicKey) {
          connectWallet(MagicWalletName as WalletName);
        }
      }, 500);
    }
  }, [publicKey, connectionState, connectWallet, validateStoredWallet]);

  // Get email for Magic wallet
  const getEmailSimple = useCallback(async () => {
    try {
      if (magicAdapter && (magicAdapter as any)._magic?.user) {
        const userInfo = await (magicAdapter as any)._magic.user.getInfo();
        if (userInfo?.email) {
          setUserEmail(userInfo.email);
          return userInfo.email;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting email:', error);
      return null;
    }
  }, [magicAdapter, setUserEmail]);

  // Update stored address when public key changes
  useEffect(() => {
    if (publicKey && mountedRef.current) {
      const publicKeyString = publicKey.toString();
      setStoredWalletAddress(publicKeyString);
      safeLocalStorage.setItem("connectedWalletAddress", publicKeyString);
      
      const isMagic = (wallet as any)?.adapter?.name === MagicWalletName ||
        safeLocalStorage.getItem("walletName") === MagicWalletName;
      
      if (isMagic) {
        getEmailSimple();
      }
      
      // Update state machine
      if (connectionState !== 'connected') {
        stateMachine.current.setState('connected');
      }
    }
  }, [publicKey, wallet, getEmailSimple, connectionState]);

  // Handle disconnection
  useEffect(() => {
    if (disconnecting && mountedRef.current) {
      console.log("[Disconnect] Clearing storage");
      stateMachine.current.setState('disconnecting');
      safeLocalStorage.clearWalletData();
      setStoredWalletAddress(null);
      setHasCalledAddUser(false);
      reconnectAttempted.current = false;
    }
  }, [disconnecting]);

  // Reset state machine when disconnected
  useEffect(() => {
    if (!publicKey && !disconnecting && !connecting && connectionState === 'connected') {
      console.log('[State] Wallet disconnected, resetting state machine');
      stateMachine.current.reset();
    }
  }, [publicKey, disconnecting, connecting, connectionState]);

  // Call add-user API
  useEffect(() => {
    const walletAddress = publicKey?.toString() || storedWalletAddress;
    const isConnected = !!publicKey;

    if (isConnected && walletAddress && !hasCalledAddUser && mountedRef.current) {
      setHasCalledAddUser(true);

      fetch("https://zynapse.zkagi.ai/add-user", {
        method: "POST",
        headers: {
          "api-key": "zk-123321",
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wallet_address: walletAddress }),
      })
        .then(async (res) => {
          const json = await res.json();
          if (mountedRef.current) {
            if (json.credit_balance !== undefined) {
              setCredits(json.credit_balance);
            }
            if (json.api_keys && json.api_keys.length > 0) {
              setApiKey(json.api_keys[0]);
            }
          }
        })
        .catch((err) => console.error("Error calling add-user:", err));
    }
  }, [publicKey, storedWalletAddress, hasCalledAddUser, setCredits, setApiKey]);

  // Custom connected button component
  const CustomConnectedButton = ({ address }: { address: string }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef<HTMLUListElement>(null);

    const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

    useEffect(() => {
      const listener = (event: MouseEvent | TouchEvent) => {
        const node = menuRef.current;
        if (!node || node.contains(event.target as Node)) return;
        setMenuOpen(false);
      };

      if (menuOpen) {
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
      }

      return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    }, [menuOpen]);

    const handleCopyAddress = async () => {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 400);
        toast.success('Address copied to clipboard');
      } catch (error) {
        console.error('Failed to copy address:', error);
        toast.error('Failed to copy address');
      }
    };

    const handleRevealKey = async () => {
      if (!magicAdapter) {
        toast.error('Magic adapter not available');
        return;
      }

      setRevealing(true);
      try {
        await magicAdapter.revealPrivateKey();
        toast.success('Private key revealed successfully');
      } catch (error: any) {
        const msg = error?.message || '';
        const isUserCancelled = 
          msg.toLowerCase().includes('user canceled') ||
          msg.toLowerCase().includes('user closed') ||
          error?.code === 4001;

        if (!isUserCancelled) {
          console.error('Error revealing private key:', error);
          toast.error(`Failed to reveal private key${msg ? `: ${msg}` : ''}`);
        }
      } finally {
        setRevealing(false);
        setMenuOpen(false);
      }
    };

    const handleDisconnect = async () => {
      setMenuOpen(false);
      stateMachine.current.setState('disconnecting');
      setUserEmail(null);

      try {
        // Graceful disconnect without page reload
        if (disconnect) {
          await disconnect();
        }
        
        // Clear storage
        safeLocalStorage.clearWalletData();
        setStoredWalletAddress(null);
        setHasCalledAddUser(false);
        reconnectAttempted.current = false;
        stateMachine.current.reset();
        
        toast.success('Wallet disconnected');
      } catch (error: any) {
        console.error("Error during disconnect:", error);
        
        // Force cleanup but DON'T reload unless absolutely necessary
        safeLocalStorage.clearWalletData();
        setStoredWalletAddress(null);
        setHasCalledAddUser(false);
        stateMachine.current.reset();
        
        // Only reload if adapter is truly stuck
        const isStuck = error.message?.includes('adapter') || 
                       error.message?.includes('stuck');
        
        if (isStuck) {
          toast.error('Wallet adapter stuck, reloading...');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast.info('Disconnected with cleanup');
        }
      }
    };

    const handleChangeWallet = () => {
      setModalVisible(true);
      setMenuOpen(false);
    };

    return (
      <div className="wallet-adapter-dropdown relative">
        <div
          className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
          style={{
            clipPath: "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
            backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
            backgroundSize: "200% 200%",
            animation: "spinGradient 3s linear infinite",
          }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="flex items-center justify-center px-4 py-2 text-white">
            <span className="font-mono">{displayAddress}</span>
          </div>
        </div>

        <ul
          ref={menuRef}
          className={`absolute top-full left-0 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 ${menuOpen ? 'block' : 'hidden'}`}
          role="menu"
        >
          <li className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer border-b border-gray-600" onClick={handleCopyAddress} role="menuitem">
            {copied ? '✓ Copied' : '📋 Copy address'}
          </li>
          <li className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer border-b border-gray-600" onClick={handleChangeWallet} role="menuitem">
            🔄 Change wallet
          </li>
          <li className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer border-b border-gray-600" onClick={handleRevealKey} role="menuitem">
            {revealing ? '🔄 Revealing...' : '🔑 Reveal Private Key'}
          </li>
          <li 
            className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer" 
            onClick={handleDisconnect} 
            role="menuitem"
          >
            {connectionState === 'disconnecting' ? '⏳ Disconnecting...' : '🚪 Disconnect'}
          </li>
        </ul>
      </div>
    );
  };

  const handleClick = () => {
    // Only allow opening modal if not in middle of connection
    if (connectionState === 'connecting' || connectionState === 'selecting') {
      console.log('[handleClick] Connection in progress, ignoring click');
      return;
    }
    
    setModalVisible(true);
  };

  // Close modal when successfully connected
  useEffect(() => {
    if (connectionState === 'connected' && isModalVisible) {
      console.log('[Modal] Auto-closing on successful connection');
      setModalVisible(false);
    }
  }, [connectionState, isModalVisible]);

  const walletAddress = publicKey?.toString() || storedWalletAddress;
  const adapterName = (wallet as any)?.adapter?.name;
  const isMagicWallet = adapterName === MagicWalletName ||
    safeLocalStorage.getItem("walletName") === MagicWalletName;

  // Show connecting state
  const isConnectingState = connectionState === 'selecting' || connectionState === 'connecting' || connecting;

  return (
    <div className="flex items-center justify-center relative wallet-button">
      {isMagicWallet && walletAddress ? (
        <CustomConnectedButton address={walletAddress} />
      ) : publicKey ? (
        <BaseWalletMultiButton
          labels={LABELS}
          className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
          style={{
            clipPath: "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
            backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
            backgroundSize: "200% 200%",
            animation: "spinGradient 3s linear infinite",
          }}
        />
      ) : (
        <div
          className="wallet-button transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
          style={{
            clipPath: "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
            backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
            backgroundSize: "200% 200%",
            animation: "spinGradient 3s linear infinite",
          }}
          onClick={handleClick}
        >
          <div
            className="wallet-button transition-all ease-out relative duration-500 active:bg-opacity-80 block w-full overflow-hidden custom-gradient hover:bg-gradient-to-r hover:from-zkPurple hover:to-zkIndigo60 active:from-zkPurple60 hover:p-[1px]"
            style={{
              clipPath: "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
            }}
          >
            <div className="transition-all ease-out duration-500 px-10 lg:px-12 py-4 text-center bg-clip-text text-transparent hover:text-white bg-gradient-to-l from-zkIndigo to-zkPurple font-bold tracking-wider">
              {isConnectingState ? 'Connecting...' : 'Connect'}
            </div>
          </div>
        </div>
      )}
      <WalletModal 
        isVisible={isModalVisible} 
        onClose={() => setModalVisible(false)}
        onWalletSelect={(walletName) => {
          setModalVisible(false);
          connectWallet(walletName);
        }}
      />
    </div>
  );
};