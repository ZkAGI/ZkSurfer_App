// "use client";
// import React from 'react';
// import { WagmiProvider } from 'wagmi';
// import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
// import '@rainbow-me/rainbowkit/styles.css';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink';
// import {
//   arbitrum,
//   avalanche,
//   base,
//   berachain,
//   bsc,
//   mainnet,
//   optimism,
//   polygon
// } from 'viem/chains';

// // Wagmi Configuration for Ethereum Wallets
// const config = getDefaultConfig({
//   appName: 'ZkAGI',
//   projectId: '003076b15a7ec01e7a1929b1468c23ec',
//   chains: [
//     mainnet,
//     base,
//     arbitrum,
//     optimism,
//     polygon,
//     berachain,
//     avalanche,
//     bsc
//   ],
//   ssr: true,
// });

// // Create a query client
// const queryClient = new QueryClient();

// // Multi-Wallet Provider Component (without duplicating Solana providers)
// const MultiWalletProvider = ({ children }: { children: React.ReactNode }) => {
//   // Tron Wallet Adapters
//   const tronWallets = React.useMemo(() => [
//     new TronLinkAdapter(),
//     // Add more Tron wallets if needed
//   ], []);

//   return (
//     <WagmiProvider config={config}>
//       <QueryClientProvider client={queryClient}>
//         <RainbowKitProvider>
//           {/* Solana providers are removed from here - they're now only in AppWalletProvider */}
//           {children}
//         </RainbowKitProvider>
//       </QueryClientProvider>
//     </WagmiProvider>
//   );
// };

// export default MultiWalletProvider;

"use client";
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

// Create the query client outside the component
const queryClient = new QueryClient();

// Import the storage patch wrapper with no-SSR
const SafeWalletProvider = dynamic(
  () => import('./SafeWalletProvider'),
  { 
    ssr: false, // Critical to prevent any server-side rendering
  }
);

// Import the wallet provider wrapper with no-SSR
const ClientSideWalletProvider = dynamic(
  () => import('./ClientSideWalletProvider'),
  { 
    ssr: false, // Critical to prevent any server-side rendering
  }
);

/**
 * MultiWalletProvider that safely handles all wallet connections
 * by patching localStorage/sessionStorage before initializing wallet adapters
 */
const MultiWalletProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* First patch storage APIs */}
      <SafeWalletProvider>
        {/* Then initialize wallet providers */}
        <ClientSideWalletProvider>
          {children}
        </ClientSideWalletProvider>
      </SafeWalletProvider>
    </QueryClientProvider>
  );
};

export default MultiWalletProvider;

// "use client";
// import React, { useState, useEffect } from 'react';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import dynamic from 'next/dynamic';

// // Create the client outside of the component to avoid re-creation on re-renders
// const queryClient = new QueryClient();

// // Create a dynamic component that only loads on the client side
// const ClientSideWalletProviders = dynamic(
//   () => import('./ClientSideWalletProvider'),
//   {
//     ssr: false, // Very important - this prevents any server-side rendering
//     loading: () => <></>, // Optional loading component
//   }
// );

// /**
//  * MultiWalletProvider component that safely handles wallet connection
//  * by only loading wallet-related components on the client side
//  */
// const MultiWalletProvider = ({ children }: { children: React.ReactNode }) => {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <ClientSideWalletProviders>
//         {children}
//       </ClientSideWalletProviders>
//     </QueryClientProvider>
//   );
// };

// export default MultiWalletProvider;