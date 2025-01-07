// "use client";

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useWalletModal } from "@solana/wallet-adapter-react-ui";
// import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useConnection, useWallet } from "@solana/wallet-adapter-react";
//import { WalletReadyState } from '@solana/wallet-adapter-base';

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
//   const { publicKey, wallet, connecting } = useWallet();

//   const handleClick = () => {
//     setVisible(true);
//   };

//   useEffect(() => {
//     if (publicKey && !connecting) {
//       router.push('/');
//     }
//   }, [publicKey, connecting, router]);

//   return (
//     <div className="flex items-center justify-center relative">
//       {publicKey ? (
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
//               GET STARTED
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { toast } from "sonner";

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
  const { publicKey, wallet, connecting, wallets } = useWallet();

  const handleClick = () => {
    // Check if any wallet is installed
    const hasInstalledWallet = wallets.some((w) => w.readyState === WalletReadyState.Installed);
    if (!hasInstalledWallet) {
      // No wallet installed, show a toast prompting the user to install a wallet
      toast.error('No installed Solana wallets found. Please install a wallet to continue.', {
        action: {
          label: 'Install Phantom',
          onClick: () => window.open('https://phantom.app/', '_blank'),
        },
        cancel: {
          label: 'Install Solflare',
          onClick: () => window.open('https://solflare.com/', '_blank')
        }
      });
      return;
    }

    // If at least one wallet is installed, show the default wallet modal
    setVisible(true);
  };

  useEffect(() => {
    if (publicKey && !connecting) {
      router.push('/');
    }
  }, [publicKey, connecting, router]);

  return (
    <div className="flex items-center justify-center relative">
      {publicKey ? (
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
            <div className="transition-all ease-out duration-500 px-8 sm:px-10 text-xs sm:text-[17px] lg:px-12 py-4 text-center bg-clip-text text-transparent hover:text-white bg-gradient-to-l from-zkIndigo to-zkPurple font-bold tracking-wider">
              GET STARTED
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// "use client";

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletReadyState } from '@solana/wallet-adapter-base';
// import { toast } from "sonner";
// import { Button } from '@/components/ui/button';

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
//   const { publicKey, connecting, wallets, select } = useWallet();
//   const [showCustomModal, setShowCustomModal] = useState(false);

//   const handleClick = () => {
//     // If no wallets are provided at all (misconfiguration?), show an install toast.
//     if (wallets.length === 0) {
//       toast.error('No Solana wallets configured. Please add wallets to your WalletAdapter configuration.');
//       return;
//     }
//     setShowCustomModal(true);
//   };

//   // Redirect once connected
//   useEffect(() => {
//     if (publicKey && !connecting) {
//       router.push('/');
//     }
//   }, [publicKey, connecting, router]);

//   return (
//     <div className="flex items-center justify-center relative">
//       {publicKey ? (
//         // If the user is already connected, show a disconnect or address copy button
//         // For simplicity, let's just show a disconnect button (you can customize this)
//         <Button onClick={() => select(null)}>Disconnect</Button>
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
//               GET STARTED
//             </div>
//           </div>
//         </div>
//       )}

//       {showCustomModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-md shadow-lg">
//             <h2 className="mb-4 text-xl font-bold">Select a Wallet</h2>
//             {wallets.map((w) => (
//               <Button
//                 key={w.adapter.name}
//                 className="mb-2 w-full"
//                 onClick={() => {
//                   // Check if wallet is installed
//                   if (w.readyState === WalletReadyState.NotDetected) {
//                     toast.error(`${w.adapter.name} is not installed. Please install it to continue.`, {
//                       action: {
//                         label: `Install ${w.adapter.name}`,
//                         onClick: () => {
//                           if (w.adapter.name.toLowerCase().includes('phantom')) {
//                             window.open('https://phantom.app/', '_blank');
//                           } else if (w.adapter.name.toLowerCase().includes('solflare')) {
//                             window.open('https://solflare.com/', '_blank');
//                           } else {
//                             window.open('https://solana.com/wallets', '_blank');
//                           }
//                         }
//                       }
//                     });
//                     return;
//                   }

//                   // If installed, select the wallet
//                   select(w.adapter.name);
//                   setShowCustomModal(false);
//                 }}
//               >
//                 {w.adapter.name} {w.readyState === WalletReadyState.NotDetected && '(Not Installed)'}
//               </Button>
//             ))}
//             <Button variant="ghost" onClick={() => setShowCustomModal(false)}>
//               Cancel
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };


// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useWalletModal } from "@solana/wallet-adapter-react-ui";
// import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import { useEthereumWallet } from '../EthereumWalletProvider';

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
//   const { publicKey, wallet, connecting } = useWallet();
//   const { isActive: isEthereumActive, account: ethereumAccount, connect: connectEthereum, disconnect: disconnectEthereum } = useEthereumWallet();
//   const [walletType, setWalletType] = useState<'solana' | 'ethereum' | null>(null);

//   const handleClick = async () => {
//     if (!walletType) {
//       // If no wallet is connected, show options to connect
//       setVisible(true);
//     } else if (walletType === 'solana') {
//       // If Solana wallet is connected, use the BaseWalletMultiButton's default behavior
//     } else if (walletType === 'ethereum') {
//       // If Ethereum wallet is connected, disconnect
//       await disconnectEthereum();
//       setWalletType(null);
//     }
//   };

//   const handleEthereumConnection = async () => {
//     try {
//       await connectEthereum();
//     } catch (error) {
//       console.error('Failed to connect Ethereum wallet:', error);
//     }
//   };

//   useEffect(() => {
//     if (publicKey && !connecting) {
//       setWalletType('solana');
//       router.push('/congratulations');
//     } else if (isEthereumActive && ethereumAccount) {
//       setWalletType('ethereum');
//       router.push('/congratulations');
//     } else {
//       setWalletType(null);
//     }
//   }, [publicKey, connecting, isEthereumActive, ethereumAccount, router]);

//   const getButtonText = () => {
//     if (walletType === 'solana') {
//       return `Solana: ${publicKey?.toString().slice(0, 4)}...${publicKey?.toString().slice(-4)}`;
//     } else if (walletType === 'ethereum') {
//       return `Ethereum: ${ethereumAccount?.slice(0, 4)}...${ethereumAccount?.slice(-4)}`;
//     } else {
//       return "GET STARTED";
//     }
//   };

//   return (
//     <div className="flex items-center justify-center relative">
//       {walletType === 'solana' ? (
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
//           onClick={walletType === 'ethereum' ? handleClick : handleEthereumConnection}
//         >
//           <div
//             className="transition-all ease-out relative duration-500 active:bg-opacity-80 block w-full overflow-hidden custom-gradient hover:bg-gradient-to-r hover:from-zkPurple hover:to-zkIndigo60 active:from-zkPurple60 hover:p-[1px]"
//             style={{
//               clipPath:
//                 "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//             }}
//           >
//             <div className="transition-all ease-out duration-500 px-10 lg:px-12 py-4 text-center bg-clip-text text-transparent hover:text-white bg-gradient-to-l from-zkIndigo to-zkPurple font-bold tracking-wider">
//               {getButtonText()}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };


// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useWalletModal } from "@solana/wallet-adapter-react-ui";
// import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { useConnection, useWallet } from "@solana/wallet-adapter-react";
// import { useEthereumWallet } from '../EthereumWalletProvider';

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
//   const { publicKey, wallet, connecting } = useWallet();
//   const { isActive: isEthereumActive, account: ethereumAccount, connect: connectEthereum, disconnect: disconnectEthereum } = useEthereumWallet();
//   const [walletType, setWalletType] = useState<'solana' | 'ethereum' | null>(null);

//   const handleClick = async () => {
//     if (!walletType) {
//       // If no wallet is connected, show options to connect
//       setVisible(true);
//     } else if (walletType === 'solana') {
//       // If Solana wallet is connected, use the BaseWalletMultiButton's default behavior
//     } else if (walletType === 'ethereum') {
//       // If Ethereum wallet is connected, disconnect
//       await disconnectEthereum();
//       setWalletType(null);
//       console.log('Disconnected from Ethereum wallet (MetaMask)');
//     }
//   };

//   const handleEthereumConnection = async () => {
//     try {
//       await connectEthereum();
//     } catch (error) {
//       console.error('Failed to connect Ethereum wallet:', error);
//     }
//   };

//   useEffect(() => {
//     if (publicKey && !connecting) {
//       setWalletType('solana');
//       console.log('Connected to Solana wallet (Phantom):', publicKey.toString());
//       router.push('/congratulations');
//     } else if (isEthereumActive && ethereumAccount) {
//       setWalletType('ethereum');
//       console.log('Connected to Ethereum wallet (MetaMask):', ethereumAccount);
//       router.push('/congratulations');
//     } else if (!publicKey && !isEthereumActive) {
//       setWalletType(null);
//     }
//   }, [publicKey, connecting, isEthereumActive, ethereumAccount, router]);

//   // Log whenever the wallet type changes
//   useEffect(() => {
//     if (walletType === 'solana') {
//       console.log(`Wallet connected: Solana (Phantom) - ${publicKey?.toString()}`);
//     } else if (walletType === 'ethereum') {
//       console.log(`Wallet connected: Ethereum (MetaMask) - ${ethereumAccount}`);
//     } else {
//       console.log('No wallet connected');
//     }
//   }, [walletType, publicKey, ethereumAccount]);

//   const getButtonText = () => {
//     if (walletType === 'solana') {
//       return `Solana: ${publicKey?.toString().slice(0, 4)}...${publicKey?.toString().slice(-4)}`;
//     } else if (walletType === 'ethereum') {
//       return `Ethereum: ${ethereumAccount?.slice(0, 4)}...${ethereumAccount?.slice(-4)}`;
//     } else {
//       return "GET STARTED";
//     }
//   };

//   return (
//     <div className="flex items-center justify-center relative">
//       {walletType === 'solana' ? (
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
//           onClick={walletType === 'ethereum' ? handleClick : handleEthereumConnection}
//         >
//           <div
//             className="transition-all ease-out relative duration-500 active:bg-opacity-80 block w-full overflow-hidden custom-gradient hover:bg-gradient-to-r hover:from-zkPurple hover:to-zkIndigo60 active:from-zkPurple60 hover:p-[1px]"
//             style={{
//               clipPath:
//                 "polygon(0% 0%, calc(100% - 20px) 0%, 100% 20px, 100% 100%, 20px 100%, 0% calc(100% - 20px), 0% 100%, 0% 0%)",
//             }}
//           >
//             <div className="transition-all ease-out duration-500 px-10 lg:px-12 py-4 text-center bg-clip-text text-transparent hover:text-white bg-gradient-to-l from-zkIndigo to-zkPurple font-bold tracking-wider">
//               {getButtonText()}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };


// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useWalletModal } from '@solana/wallet-adapter-react-ui';
// import { BaseWalletMultiButton } from '@solana/wallet-adapter-react-ui';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { useEthereumWallet } from '../EthereumWalletProvider';
// import { ConnectButton } from '@rainbow-me/rainbowkit';

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
//   const { publicKey, wallet, connecting } = useWallet();
//   const { isActive: isEthereumActive, account: ethereumAccount } = useEthereumWallet();
//   const [walletType, setWalletType] = useState<'solana' | 'ethereum' | null>(null);

//   const handleClick = () => {
//     if (!walletType) {
//       setVisible(true); // Open Solana wallet modal
//     }
//   };

//   useEffect(() => {
//     if (publicKey && !connecting) {
//       setWalletType('solana');
//       router.push('/congratulations');
//     } else if (isEthereumActive && ethereumAccount) {
//       setWalletType('ethereum');
//       router.push('/congratulations');
//     } else {
//       setWalletType(null);
//     }
//   }, [publicKey, connecting, isEthereumActive, ethereumAccount, router]);

//   return (
//     <div className="flex items-center justify-center">
//       {walletType === 'solana' ? (
//         <BaseWalletMultiButton labels={LABELS} />
//       ) : (
//         <ConnectButton />
//       )}
//     </div>
//   );
// };

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAccount, useConnect, useDisconnect } from 'wagmi';
// import { ConnectButton } from '@rainbow-me/rainbowkit';

// export const CustomWalletButton = () => {
//   const router = useRouter();
//   const { isConnected } = useAccount();
//   const { connect, connectors } = useConnect();
//   const { disconnect } = useDisconnect();

//   useEffect(() => {
//     if (isConnected) {
//       router.push('/congratulations');
//     }
//   }, [isConnected, router]);

//   return (
//     <div className="flex items-center justify-center">
//       <ConnectButton.Custom>
//         {({
//           account,
//           chain,
//           openAccountModal,
//           openChainModal,
//           openConnectModal,
//           mounted,
//         }) => {
//           const ready = mounted;
//           const connected = ready && account && chain;

//           return (
//             <div
//               {...(!ready && {
//                 'aria-hidden': true,
//                 style: {
//                   opacity: 0,
//                   pointerEvents: 'none',
//                   userSelect: 'none',
//                 },
//               })}
//             >
//               {(() => {
//                 if (!connected) {
//                   return (
//                     <button onClick={openConnectModal} type="button" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
//                       Connect Wallet
//                     </button>
//                   );
//                 }

//                 if (chain.unsupported) {
//                   return (
//                     <button onClick={openChainModal} type="button" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
//                       Wrong network
//                     </button>
//                   );
//                 }

//                 return (
//                   <div style={{ display: 'flex', gap: 12 }}>
//                     <button
//                       onClick={openChainModal}
//                       style={{ display: 'flex', alignItems: 'center' }}
//                       type="button"
//                       className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
//                     >
//                       {chain.hasIcon && (
//                         <div
//                           style={{
//                             background: chain.iconBackground,
//                             width: 12,
//                             height: 12,
//                             borderRadius: 999,
//                             overflow: 'hidden',
//                             marginRight: 4,
//                           }}
//                         >
//                           {chain.iconUrl && (
//                             <img
//                               alt={chain.name ?? 'Chain icon'}
//                               src={chain.iconUrl}
//                               style={{ width: 12, height: 12 }}
//                             />
//                           )}
//                         </div>
//                       )}
//                       {chain.name}
//                     </button>

//                     <button onClick={openAccountModal} type="button" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
//                       {account.displayName}
//                       {account.displayBalance
//                         ? ` (${account.displayBalance})`
//                         : ''}
//                     </button>
//                   </div>
//                 );
//               })()}
//             </div>
//           );
//         }}
//       </ConnectButton.Custom>
//     </div>
//   );
// };