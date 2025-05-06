"use client";
import React, { useState, useEffect } from 'react';
// Import CSS statically since it doesn't cause localStorage issues
import '@rainbow-me/rainbowkit/styles.css';

// Create a non-SSR component for wallet functionality
const ClientSideWalletProvider = ({ children }: { children: React.ReactNode }) => {
  // States to store our dynamically loaded components and configuration
  const [components, setComponents] = useState<{
    WagmiProvider: any;
    RainbowKitProvider: any;
    config: any;
  } | null>(null);
  
  // State to track if component is mounted
  const [isMounted, setIsMounted] = useState(false);
  
  // Setup everything ONLY after the component mounts
  useEffect(() => {
    async function setupWalletProviders() {
      try {
        // Dynamically import all modules needed
        const { WagmiProvider } = await import('wagmi');
        const { RainbowKitProvider, getDefaultConfig } = await import('@rainbow-me/rainbowkit');
        const { 
          arbitrum, avalanche, base, berachain, 
          bsc, mainnet, optimism, polygon 
        } = await import('viem/chains');
        
        // Now it's safe to create the config
        const config = getDefaultConfig({
          appName: 'ZkAGI',
          projectId: '003076b15a7ec01e7a1929b1468c23ec',
          chains: [
            mainnet,
            base,
            arbitrum,
            optimism,
            polygon,
            berachain, 
            avalanche,
            bsc
          ],
          ssr: false, // Explicitly disable SSR for this config
        });
        
        // Save everything we need in state
        setComponents({
          WagmiProvider,
          RainbowKitProvider,
          config
        });
        
      } catch (error) {
        console.error("Failed to initialize wallet providers:", error);
      }
    }
    
    // Mark as mounted first
    setIsMounted(true);
    // Then set up the wallet providers
    setupWalletProviders();
  }, []);
  
  // Don't render wallet providers until everything is ready
  if (!isMounted || !components) {
    return <>{children}</>;
  }
  
  // Destructure the components we loaded
  const { WagmiProvider, RainbowKitProvider, config } = components;
  
  // Render the providers with our dynamically loaded components
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
};

export default ClientSideWalletProvider;