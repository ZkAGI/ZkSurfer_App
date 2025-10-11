"use client";

import { useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth/solana';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

const PRIVY_WALLET_NAME = "Privy (Email)";

export default function PrivyBridge() {
  const { ready, user, authenticated, logout } = usePrivy();
  const { wallets: privySolanaWallets, ready: walletsReady } = useWallets();
  const { wallets: solanaAdapters, select, connected, publicKey, disconnect } = useWallet();
  const hasProcessed = useRef(false);
  const lastAddress = useRef<string | null>(null);

  useEffect(() => {
    const handleSolanaWallet = async () => {
      // Only run if all conditions are met
      if (!ready || !authenticated || !user || !walletsReady) {
        hasProcessed.current = false;
        lastAddress.current = null;
        return;
      }
      
      // Find Privy Solana wallet
      const privyWallet = privySolanaWallets?.find(w => 
        w.standardWallet.name === 'Privy' || 
        (w as any).walletClientType === 'privy' ||
        !(w as any).imported
      ) || privySolanaWallets?.[0];
      
      if (!privyWallet) {
        console.log('PrivyBridge: No Solana wallet found');
        return;
      }
      
      // Check if already processed this wallet
      if (hasProcessed.current && lastAddress.current === privyWallet.address) {
        return; // Already processed this wallet
      }
      
      // Check if already connected to this wallet
      if (connected && publicKey?.toString() === privyWallet.address) {
        console.log('PrivyBridge: Already connected to', privyWallet.address);
        hasProcessed.current = true;
        lastAddress.current = privyWallet.address;
        return;
      }
      
      console.log('PrivyBridge: Processing Solana wallet:', privyWallet.address);
      
      // If connected to a different wallet, disconnect first
      if (connected && publicKey?.toString() !== privyWallet.address) {
        console.log('PrivyBridge: Disconnecting from different wallet');
        await disconnect();
        // Wait a bit for disconnect to complete
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Find the Privy adapter
      const privyAdapter = solanaAdapters.find(
        (w) => (w as any)?.adapter?.name === PRIVY_WALLET_NAME
      );

      if (!privyAdapter) {
        console.log('PrivyBridge: Adapter not found');
        return;
      }

      const adapter = (privyAdapter as any).adapter;
      
      // Update the adapter with wallet data and public key
      if (adapter) {
        // Set the wallet references first
        adapter._embeddedWallet = privyWallet;
        adapter._privyWallet = privyWallet;
        
        // Set the public key (this will trigger connection if adapter is connecting)
        if (typeof adapter.setPublicKey === 'function') {
          adapter.setPublicKey(privyWallet.address);
        } else {
          try {
            adapter._publicKey = new PublicKey(privyWallet.address);
          } catch (e) {
            console.error('Invalid address:', e);
            return;
          }
        }
        
        // Force connect if the adapter has a forceConnect method
        if (typeof adapter.forceConnect === 'function') {
          console.log('PrivyBridge: Force connecting adapter');
          await adapter.forceConnect(privyWallet.address);
        } else if (adapter.publicKey && !adapter.connecting) {
          // If adapter has public key but not connecting, emit connect event
          console.log('PrivyBridge: Manually emitting connect event');
          adapter.emit('connect', adapter.publicKey);
        }
      }

      // Store in localStorage first
      localStorage.setItem('walletName', PRIVY_WALLET_NAME);
      localStorage.setItem('zk:lastWallet', JSON.stringify({ name: PRIVY_WALLET_NAME }));
      localStorage.setItem('zk:connectedWalletAddress', privyWallet.address);

      // Wait a moment for adapter state to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now select the wallet
      console.log('PrivyBridge: Selecting Privy adapter');
      try {
        await select(PRIVY_WALLET_NAME as any);
        hasProcessed.current = true;
        lastAddress.current = privyWallet.address;
        console.log('PrivyBridge: Successfully selected Privy adapter');
      } catch (error) {
        console.error('PrivyBridge: Error selecting adapter:', error);
        
        // Try force connecting again if selection failed
        if (adapter && typeof adapter.forceConnect === 'function') {
          console.log('PrivyBridge: Retrying with force connect');
          await adapter.forceConnect(privyWallet.address);
        }
      }

      // Store globally for debugging
      if (typeof window !== 'undefined') {
        (window as any).__privyUser = user;
        (window as any).__privySolanaWallets = privySolanaWallets;
        (window as any).__privySolanaAddress = privyWallet.address;
        (window as any).__privySolanaWallet = privyWallet;
        (window as any).__privyAdapter = adapter;
      }
    };
    
    handleSolanaWallet();
  }, [ready, authenticated, user, privySolanaWallets, walletsReady, solanaAdapters, select, connected, publicKey, disconnect]);

  useEffect(() => {
  if (ready && user) {
    // Expose Privy instance globally for logout
    if (typeof window !== 'undefined') {
      (window as any).__PRIVY_APP__ = { logout };
    }
  }
}, [ready, user, logout]);

  // Clean up on logout
  useEffect(() => {
    if (!authenticated) {
      hasProcessed.current = false;
      lastAddress.current = null;
      
      // Only clean up if it was Privy
      const lastWallet = localStorage.getItem('walletName');
      if (lastWallet === PRIVY_WALLET_NAME) {
        localStorage.removeItem('walletName');
        localStorage.removeItem('zk:lastWallet');
        localStorage.removeItem('zk:connectedWalletAddress');
      }
      
      if (typeof window !== 'undefined') {
        delete (window as any).__privyUser;
        delete (window as any).__privySolanaWallets;
        delete (window as any).__privySolanaAddress;
        delete (window as any).__privySolanaWallet;
        delete (window as any).__privyAdapter;
      }
    }
  }, [authenticated]);

  return null;
}