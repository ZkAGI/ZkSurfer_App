// "use client";

// import { useEffect, useState, useCallback, useContext } from 'react';
// import { useRouter } from 'next/navigation';
// import { useWalletModal } from "@solana/wallet-adapter-react-ui";
// import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import { WalletReadyState } from '@solana/wallet-adapter-base';
// import { toast } from "sonner";
// import { WalletModal } from './WalletModal';
// import { MagicWalletName } from '../MagicWalletAdapter';
// import { PublicKey } from '@solana/web3.js';
// import { MagicAdapterContext } from '../AppWalletProvider';
// import { WalletName } from '@solana/wallet-adapter-base';

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
//     MagicWalletName?: WalletName<'Magic'>;  // Must match the type from earlier declaration
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
//   const { publicKey, wallet, connecting, disconnecting, wallets, select } = useWallet();
//   const [isModalVisible, setModalVisible] = useState(false);
//   const [isFirstLoad, setIsFirstLoad] = useState(true);
//   const [storedWalletAddress, setStoredWalletAddress] = useState<string | null>(null);

//   // Get Magic adapter from context
//   const magicAdapter = useContext(MagicAdapterContext);

//   // Debug available wallets on mount
//   useEffect(() => {
//     if (wallets && wallets.length > 0) {
//       console.log("CustomWalletButton - Available wallets:",
//         wallets.map(w => ({
//           name: (w as any)?.name || 'unnamed',
//           ready: (w as any)?.readyState
//         }))
//       );
//     }
//   }, [wallets]);

//   // Remove refresh logic by eliminating the overrides that trigger page reloads
//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     // Create variables to track original localStorage methods
//     const originalSetItem = localStorage.setItem.bind(localStorage);
//     const originalRemoveItem = localStorage.removeItem.bind(localStorage);

//     // Override localStorage.setItem without refresh
//     localStorage.setItem = function (key: string, value: string) {
//       // Call original function with proper arguments
//       originalSetItem(key, value);
//     };

//     // Override localStorage.removeItem without refresh
//     localStorage.removeItem = function (key: string) {
//       originalRemoveItem(key);
//     };

//     // Clean up on unmount by restoring original methods
//     return () => {
//       localStorage.setItem = originalSetItem;
//       localStorage.removeItem = originalRemoveItem;
//     };
//   }, []);

//   // Initialization logic: check localStorage and try to connect Magic wallet if necessary
//   useEffect(() => {
//     if (!isFirstLoad) return;

//     setIsFirstLoad(false);
//     console.log("First load completed");

//     const storedAddress = localStorage.getItem('connectedWalletAddress');
//     const storedWalletName = localStorage.getItem('walletName');

//     if (storedAddress) {
//       setStoredWalletAddress(storedAddress);

//       // If no publicKey yet but we have stored address from Magic, try to connect
//       if (!publicKey && storedWalletName === MagicWalletName) {
//         console.log("Found stored Magic wallet address:", storedAddress);

//         // Try to trigger a wallet selection after a delay
//         setTimeout(() => {
//           if (!publicKey && wallets.some(w => (w as any)?.name === MagicWalletName)) {
//             console.log("Selecting Magic wallet");
//             select(MagicWalletName);
//           }
//         }, 1000);
//       }
//     }
//   }, [isFirstLoad, publicKey, wallets, select]);

//   // Update stored address when public key changes
//   useEffect(() => {
//     if (publicKey) {
//       const publicKeyString = publicKey.toString();
//       setStoredWalletAddress(publicKeyString);
//       localStorage.setItem('connectedWalletAddress', publicKeyString);
//       console.log("Public key updated:", publicKeyString);
//     }
//   }, [publicKey]);

//   // Handle wallet disconnection without triggering a refresh
//   useEffect(() => {
//     if (disconnecting || (!publicKey && !connecting && !isFirstLoad)) {
//       const hasWalletName = localStorage.getItem('walletName');
//       if (hasWalletName) {
//         console.log("Wallet disconnected, removing walletName");
//         localStorage.removeItem('walletName');
//         localStorage.removeItem('connectedWalletAddress');
//         setStoredWalletAddress(null);
//       }
//     }
//   }, [publicKey, disconnecting, connecting, isFirstLoad]);

//   // Check both publicKey and storedWalletAddress for display
//   const walletAddress = publicKey?.toString() || storedWalletAddress;

//   // Check connection status
//   const isConnected = !!publicKey || (!!storedWalletAddress && localStorage.getItem('walletName') === MagicWalletName);

//   // Create a custom wallet button component for Magic Link wallets
//   const CustomConnectedButton = ({ address }: { address: string }) => {
//     // Format address for display
//     const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

//     const handleDisconnect = () => {
//       console.log("Disconnecting wallet...");

//       // Try to find the Magic adapter
//       if (magicAdapter) {
//         console.log("Disconnecting using Magic adapter from context");
//         magicAdapter.disconnect().catch(console.error);
//         return;
//       }

//       // Find the Magic adapter in wallet list
//       const adapterFromList = wallets.find(w =>
//         (w as any)?.name === MagicWalletName
//       );

//       if (adapterFromList) {
//         // Disconnect using the adapter - use type assertion for disconnect method
//         console.log("Disconnecting using Magic adapter from wallet list");
//         (adapterFromList as any).disconnect().catch(console.error);
//       } else {
//         // Fallback to localStorage removal
//         console.log("Magic adapter not found, using localStorage fallback");
//         localStorage.removeItem('walletName');
//         localStorage.removeItem('connectedWalletAddress');
//         setStoredWalletAddress(null);

//         // Force reload to clear the wallet state completely
//         window.location.reload();
//       }
//     };

//     return (
//       <div
//         className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
//         style={{
//           clipPath:
//             "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//           backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
//           backgroundSize: "200% 200%",
//           animation: "spinGradient 3s linear infinite",
//         }}
//       >
//         <div className="flex items-center justify-between px-4 py-2 text-white">
//           <span className="font-mono">{displayAddress}</span>
//           <button
//             onClick={handleDisconnect}
//             className="ml-4 text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
//           >
//             Disconnect
//           </button>
//         </div>
//       </div>
//     );
//   };

//   const handleClick = () => {
//     // Only show our custom modal
//     setModalVisible(true);

//     // Check if wallets are installed 
//     const hasPhantom = wallets.some(
//       (w) =>
//         (w as any)?.name === 'Phantom' &&
//         ((w as any)?.readyState === WalletReadyState.Installed || (w as any)?.readyState === WalletReadyState.Loadable)
//     );

//     // If no wallets are detected, show the installation prompt
//     if (!hasPhantom) {
//       toast.error('No available Solana wallets found. Please install a wallet to continue.', {
//         action: {
//           label: 'Install Phantom',
//           onClick: () => window.open('https://phantom.app/', '_blank'),
//         },
//       });
//     }
//   };

//   return (
//     <div className="flex items-center justify-center relative">
//       {publicKey ? (
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
//       ) : walletAddress && !publicKey ? (
//         // Show custom button for Magic Link wallet if we have a walletAddress but no publicKey
//         <CustomConnectedButton address={walletAddress} />
//       ) : (
//         <div
//           className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
//           style={{
//             clipPath:
//               "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//             backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
//             backgroundSize: "200% 200%",
//             animation: "spinGradient 3s linear infinite",
//           }}
//           onClick={handleClick}
//         >
//           <div
//             className="transition-all ease-out relative duration-500 active:bg-opacity-80 block w-full overflow-hidden custom-gradient hover:bg-gradient-to-r hover:from-zkPurple hover:to-zkIndigo60 active:from-zkPurple60 hover:p-[1px]"
//             style={{
//               clipPath:
//                 "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//             }}
//           >
//             <div className="transition-all ease-out duration-500 px-10 lg:px-12 py-4 text-center bg-clip-text text-transparent hover:text-white bg-gradient-to-l from-zkIndigo to-zkPurple font-bold tracking-wider">
//               Connect Wallet
//             </div>
//           </div>
//         </div>
//       )}
//       <WalletModal
//         isVisible={isModalVisible}
//         onClose={() => setModalVisible(false)}
//       />
//     </div>
//   );
// };

"use client";

import { useEffect, useState, useCallback, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { toast } from "sonner";
import { WalletModal } from './WalletModal';
import { MagicWalletName } from '../MagicWalletAdapter';
import { PublicKey } from '@solana/web3.js';
import { MagicAdapterContext } from '../AppWalletProvider';
import { WalletName } from '@solana/wallet-adapter-base';
import { useWalletStore } from '@/stores/wallet-store';

// Add TypeScript declarations for wallet browser properties
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
      };
    };
    magic?: any;
    magicAdapter?: any;
    MagicWalletName?: WalletName<'Magic'>;  // Must match the type from earlier declaration
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

export const CustomWalletButton = () => {
  const router = useRouter();
  const { setVisible } = useWalletModal();
  // const { publicKey, wallet, connecting, disconnecting, wallets, select } = useWallet();
  // const { walletAddress, walletName, setWallet, clearWallet } = useWalletStore()
  // const [storedWalletAddress, setStoredWalletAddress] = useState<string | null>(null);
  const { publicKey, wallet, connecting, disconnecting, wallets, select } = useWallet();
  // alias the store's walletAddress so it doesn’t collide
  const {
    walletAddress: storedAddress,
    walletName,
    setWallet,
    clearWallet
  } = useWalletStore();
  const [isModalVisible, setModalVisible] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Get Magic adapter from context
  const magicAdapter = useContext(MagicAdapterContext);

  // Debug available wallets on mount
  useEffect(() => {
    if (wallets && wallets.length > 0) {
      console.log("CustomWalletButton - Available wallets:",
        wallets.map(w => ({
          name: (w as any)?.name || 'unnamed',
          ready: (w as any)?.readyState
        }))
      );
    }
  }, [wallets]);

  // Initialization logic: check localStorage and try to connect Magic wallet if necessary
  // useEffect(() => {
  //   if (!isFirstLoad) return;

  //   setIsFirstLoad(false);
  //   console.log("First load completed");

  //   const storedAddress = localStorage.getItem('connectedWalletAddress');
  //   const storedWalletName = localStorage.getItem('walletName');

  //   if (storedAddress) {
  //     setStoredWalletAddress(storedAddress);

  //     // If no publicKey yet but we have stored address from Magic, try to connect
  //     if (!publicKey && storedWalletName === MagicWalletName) {
  //       console.log("Found stored Magic wallet address:", storedAddress);

  //       // Try to trigger a wallet selection after a delay
  //       setTimeout(() => {
  //         if (!publicKey && wallets.some(w => (w as any)?.name === MagicWalletName)) {
  //           console.log("Selecting Magic wallet");
  //           select(MagicWalletName);
  //         }
  //       }, 1000);
  //     }
  //   }
  // }, [isFirstLoad, publicKey, wallets, select]);
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false)

      if (storedAddress && walletName === MagicWalletName) {
        // try to select Magic again…
        select(MagicWalletName)
      }
    }
  }, [isFirstLoad, select, storedAddress, walletName])

  // Update stored address when public key changes
  // useEffect(() => {
  //   if (publicKey) {
  //     const publicKeyString = publicKey.toString();
  //     setStoredWalletAddress(publicKeyString);
  //     localStorage.setItem('connectedWalletAddress', publicKeyString);
  //     console.log("Public key updated:", publicKeyString);
  //   }
  // }, [publicKey]);
  useEffect(() => {
    if (publicKey) {
      setWallet(publicKey.toString(), MagicWalletName);
    }
  }, [publicKey, setWallet]);


  // Handle wallet disconnection without triggering a refresh
  // useEffect(() => {
  //   if (disconnecting || (!publicKey && !connecting && !isFirstLoad)) {
  //     const hasWalletName = localStorage.getItem('walletName');
  //     if (hasWalletName) {
  //       console.log("Wallet disconnected, removing walletName");
  //       localStorage.removeItem('walletName');
  //       localStorage.removeItem('connectedWalletAddress');
  //       setStoredWalletAddress(null);
  //     }
  //   }
  // }, [publicKey, disconnecting, connecting, isFirstLoad]);

  useEffect(() => {
    if (disconnecting || (!publicKey && !connecting && !isFirstLoad)) {
      clearWallet()
    }
  }, [publicKey, connecting, disconnecting, isFirstLoad, clearWallet])

  // Check both publicKey and storedWalletAddress for display
  // const walletAddress = publicKey?.toString() || storedWalletAddress;
  const displayAddress = publicKey?.toString() || storedAddress;

  // Check connection status
  // const isConnected = !!publicKey || (!!storedWalletAddress && localStorage.getItem('walletName') === MagicWalletName);
  const isConnected = !!publicKey || (storedAddress !== null && walletName === MagicWalletName);

  // Create a custom wallet button component for Magic Link wallets
  const CustomConnectedButton = ({ address }: { address: string }) => {
    // Format address for display
    const displayAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

    const handleDisconnect = async () => {
      console.log("Disconnecting wallet...");
      setIsDisconnecting(true);

      try {
        // Try to find the Magic adapter
        if (magicAdapter) {
          console.log("Disconnecting using Magic adapter from context");
          await magicAdapter.disconnect();
          return; // This will trigger a page reload in the adapter
        }

        // Find the Magic adapter in wallet list
        const adapterFromList = wallets.find(w =>
          (w as any)?.name === MagicWalletName
        );

        if (adapterFromList) {
          // Disconnect using the adapter - use type assertion for disconnect method
          console.log("Disconnecting using Magic adapter from wallet list");
          await (adapterFromList as any).disconnect();
        } else {
          // Fallback to localStorage removal
          // console.log("Magic adapter not found, using localStorage fallback");
          // localStorage.removeItem('walletName');
          // localStorage.removeItem('connectedWalletAddress');
          // setStoredWalletAddress(null);
          console.log("Magic adapter not found, clearing wallet store");
          +      clearWallet();

          // Force reload to clear the wallet state completely
          window.location.reload();
        }
      } catch (error) {
        console.error("Error during disconnect:", error);
        toast.error("Failed to disconnect wallet. Please try again.");

        // Force reload as last resort
        window.location.reload();
      } finally {
        setIsDisconnecting(false);
      }
    };

    return (
      <div
        className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
        style={{
          clipPath:
            "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
          backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
          backgroundSize: "200% 200%",
          animation: "spinGradient 3s linear infinite",
        }}
      >
        <div className="flex items-center justify-between px-4 py-2 text-white">
          <span className="font-mono">{displayAddress}</span>
          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="ml-4 text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
          >
            {isDisconnecting ? "Disconnecting..." : "Disconnect"}
          </button>
        </div>
      </div>
    );
  };

  const handleClick = () => {
    // Only show our custom modal
    setModalVisible(true);

    // Check if wallets are installed 
    const hasPhantom = wallets.some(
      (w) =>
        (w as any)?.name === 'Phantom' &&
        ((w as any)?.readyState === WalletReadyState.Installed || (w as any)?.readyState === WalletReadyState.Loadable)
    );

    // If no wallets are detected, show the installation prompt
    if (!hasPhantom) {
      toast.error('No available Solana wallets found. Please install a wallet to continue.', {
        action: {
          label: 'Install Phantom',
          onClick: () => window.open('https://phantom.app/', '_blank'),
        },
      });
    }
  };

  return (
    <div className="flex items-center justify-center relative">
      {publicKey ? (
        // Show standard Solana wallet button if publicKey exists
        <BaseWalletMultiButton
          labels={LABELS}
          className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
          style={{
            clipPath:
              "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
            backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
            backgroundSize: "200% 200%",
            animation: "spinGradient 3s linear infinite",
          }}
        />
        // ) : walletAddress && !publicKey ? (
        //   // Show custom button for Magic Link wallet if we have a walletAddress but no publicKey
        //   <CustomConnectedButton address={walletAddress} />
      ) : displayAddress && !publicKey ? (
        // Show custom button for Magic Link wallet
        <CustomConnectedButton address={displayAddress} />
      ) : (
        <div
          className="transition-all ease-out duration-500 relative cursor-pointer group block w-full overflow-hidden border-transparent bg-gradient-to-br from-zkLightPurple via-zkLightPurple to-zkIndigo p-[1px] hover:p-0"
          style={{
            clipPath:
              "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
            backgroundImage: "linear-gradient(to right, #A4C8FF, #643ADE)",
            backgroundSize: "200% 200%",
            animation: "spinGradient 3s linear infinite",
          }}
          onClick={handleClick}
        >
          <div
            className="transition-all ease-out relative duration-500 active:bg-opacity-80 block w-full overflow-hidden custom-gradient hover:bg-gradient-to-r hover:from-zkPurple hover:to-zkIndigo60 active:from-zkPurple60 hover:p-[1px]"
            style={{
              clipPath:
                "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
            }}
          >
            <div className="transition-all ease-out duration-500 px-10 lg:px-12 py-4 text-center bg-clip-text text-transparent hover:text-white bg-gradient-to-l from-zkIndigo to-zkPurple font-bold tracking-wider">
              Connect Wallet
            </div>
          </div>
        </div>
      )}
      <WalletModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};