"use client";
import React, { useState, useEffect } from 'react';

// Create a component that safely loads wallet providers
const SafeWalletProvider = ({ children }) => {
  // State to track if component is mounted
  const [isMounted, setIsMounted] = useState(false);
  
  // Patch window APIs and load providers only on client side
  useEffect(() => {
    // Set mounted flag first
    setIsMounted(true);
    
    // Dynamically import and run the storage patcher
    async function safePatchAndLoad() {
      try {
        // Import and run the storage patcher before anything else
        const { patchStorageAPIs } = await import('./StoragePatcher');
        patchStorageAPIs();
        
        // Now it's safe to initialize other components
        console.log("Storage APIs successfully patched for wallet adapters");
      } catch (error) {
        console.error("Failed to patch storage APIs:", error);
      }
    }
    
    safePatchAndLoad();
    
    // Cleanup function to handle component unmounting
    return () => {
      // Any cleanup needed
    };
  }, []);
  
  // Return children - we're just patching APIs, not wrapping in providers here
  return <>{children}</>;
};

export default SafeWalletProvider;