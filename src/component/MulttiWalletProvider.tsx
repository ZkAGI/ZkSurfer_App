"use client";
import React from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink';
import {
  arbitrum,
  avalanche,
  base,
  berachain,
  bsc,
  mainnet,
  optimism,
  polygon,
  baseSepolia
} from 'viem/chains';
import { phantomWallet } from '@rainbow-me/rainbowkit/wallets';
import AarcProvider from './ui/AarcProvider';

// Wagmi Configuration for Ethereum Wallets
const config = getDefaultConfig({
  appName: 'ZkAGI',
  projectId: '003076b15a7ec01e7a1929b1468c23ec',
  chains: [
    baseSepolia,
    mainnet,
    base,
    arbitrum,
    optimism,
    polygon,
    berachain,
    avalanche,
    bsc,
  ],
  ssr: true,
});


// Create a query client
const queryClient = new QueryClient();

// Multi-Wallet Provider Component (without duplicating Solana providers)
const MultiWalletProvider = ({ children }: { children: React.ReactNode }) => {
  // Tron Wallet Adapters
  const tronWallets = React.useMemo(() => [
    new TronLinkAdapter(),
    // Add more Tron wallets if needed
  ], []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {/* <AarcProvider> */}
          {/* Solana providers are removed from here - they're now only in AppWalletProvider */}
          {children}
          {/* </AarcProvider> */}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default MultiWalletProvider;


