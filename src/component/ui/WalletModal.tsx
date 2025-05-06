// "use client";

// import { useState, useEffect, useContext } from 'react';
// import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
// import { toast } from "sonner";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { MagicWalletName } from '../MagicWalletAdapter';
// import { MagicAdapterContext } from '../AppWalletProvider';
// import { PublicKey } from '@solana/web3.js';

// interface WalletModalProps {
//     isVisible: boolean;
//     onClose: () => void;
// }

// const LABELS = {
//     "change-wallet": "Change wallet",
//     connecting: "Connecting ...",
//     "copy-address": "Copy address",
//     copied: "Copied",
//     disconnect: "Disconnect",
//     "has-wallet": "Connect",
//     "no-wallet": "Select Wallet",
// };

// export const WalletModal = ({ isVisible, onClose }: WalletModalProps) => {
//     const [email, setEmail] = useState("");
//     const [loading, setLoading] = useState(false);
//     const { wallets, select, publicKey, connecting } = useWallet();
//     const magicAdapter = useContext(MagicAdapterContext);

//     useEffect(() => {
//         // If we connected successfully, close the modal
//         if (publicKey && !connecting) {
//             onClose();
//         }
//     }, [publicKey, connecting, onClose]);

//     const handleEmailLogin = async (e: React.FormEvent) => {
//         e.preventDefault();
        
//         if (!email.trim()) {
//             toast.error("Please enter a valid email address");
//             return;
//         }
        
//         setLoading(true);
        
//         try {
//             console.log("Starting Magic Link authentication process");

//             // First approach: Use the adapter from context if available
//             if (magicAdapter) {
//                 console.log("Using Magic adapter from context");
//                 try {
//                     await magicAdapter.connectWithEmail(email);

//                     // Force selection of the Magic wallet in the wallet adapter
//                     console.log("Selecting Magic wallet adapter");
//                     select(MagicWalletName);

//                     toast.success("Successfully connected with Magic Link");
//                     onClose();
//                     return;
//                 } catch (error) {
//                     console.error("Error connecting with Magic adapter:", error);
//                     throw error; // Re-throw to handle in the catch block below
//                 }
//             }

//             // Second approach: Find the Magic adapter in the wallet list
//             const magicAdapterFromList = wallets.find(
//                 (w) => (w as any)?.name === MagicWalletName
//             );

//             if (magicAdapterFromList) {
//                 console.log("Found Magic adapter in wallet list");
//                 try {
//                     // Connect with email using the adapter
//                     await (magicAdapterFromList as any).connectWithEmail(email);

//                     // Select the Magic wallet in the adapter
//                     select(MagicWalletName);

//                     toast.success("Successfully connected with Magic Link");
//                     onClose();
//                     return;
//                 } catch (error) {
//                     console.error("Error connecting with Magic adapter from list:", error);
//                     throw error; // Re-throw to handle in the catch block below
//                 }
//             } else {
//                 console.log("Magic adapter not found in wallet list");
//             }

//             // Fallback: Try the global Magic instance
//             const globalMagic = typeof window !== 'undefined' ? window.magic : null;
//             const globalAdapter = typeof window !== 'undefined' ? window.magicAdapter : null;

//             if (!globalMagic) {
//                 throw new Error('Magic SDK not available');
//             }

//             console.log("Using Magic SDK directly for authentication");
//             const didToken = await globalMagic.auth.loginWithEmailOTP({ email });
//             console.log("Magic auth success, token received:", !!didToken);

//             if (globalMagic.user) {
//                 const userInfo = await globalMagic.user.getInfo();
//                 console.log("User info:", userInfo);

//                 if (userInfo && userInfo.publicAddress) {
//                     // If we have a global adapter, update it
//                     if (globalAdapter && typeof globalAdapter.connectWithEmail === 'function') {
//                         await globalAdapter.connectWithEmail(email);
//                         console.log("Updated global adapter with new connection");

//                         // Force-select the Magic wallet
//                         select(MagicWalletName);
//                     } else {
//                         // Manual setup if adapter not available
//                         localStorage.setItem('connectedWalletAddress', userInfo.publicAddress);
//                         localStorage.setItem('walletName', MagicWalletName);
//                         console.log("Stored wallet address in localStorage");

//                         // If we're using direct Magic SDK without adapter, we need to 
//                         // refresh to pick up the connection
//                         setTimeout(() => {
//                             window.location.reload();
//                         }, 1000);
//                     }

//                     toast.success(`Magic wallet connected: ${userInfo.publicAddress.slice(0, 6)}...${userInfo.publicAddress.slice(-4)}`);
//                     onClose();
//                     return;
//                 }
//             }

//             toast.success("Successfully authenticated with Magic Link!");
//             onClose();
            
//             // Force reload after successful login to ensure consistency
//             setTimeout(() => {
//                 window.location.reload();
//             }, 1500);

//         } catch (error: any) {
//             console.error("Magic Link error:", error);
//             toast.error(error?.message || "Error with Magic Link. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!isVisible) return null;

//     return (
//         <div className="fixed inset-0 flex items-center justify-center z-50">
//             {/* Modal overlay */}
//             <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
//             {/* Modal content */}
//             <div className="bg-[#171D3D] rounded-lg p-6 z-10 w-11/12 max-w-md">
//                 {/* Header */}
//                 <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-xl font-bold">Connect or Create Wallet</h2>
//                     <button onClick={onClose} className="text-gray-600 hover:text-gray-800">X</button>
//                 </div>

//                 {/* "Have a Wallet" Section */}
//                 <div className="mb-8">
//                     <h3 className="text-lg font-semibold mb-2">Have a Wallet</h3>
//                     <p className="mb-4">Connect your existing wallet.</p>
//                     <BaseWalletMultiButton labels={LABELS} />
//                 </div>

//                 {/* "Don't Have a Wallet" Section */}
//                 <div>
//                     <h3 className="text-lg font-semibold mb-2">Don&apos;t Have a Wallet</h3>
//                     <p className="mb-4 text-xs">
//                         Enter your email address to receive a Magic link for an OTP. A new Solana wallet will be automatically created for you upon successful authentication.
//                     </p>
//                     <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
//                         <input
//                             type="email"
//                             placeholder="your-email@example.com"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             required
//                             className="border bg-[#171D3D] border-gray-300 rounded px-3 py-2"
//                         />
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
//                         >
//                             {loading ? "Sending OTP..." : "Send Magic Link"}
//                         </button>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

"use client";

import { useState, useEffect, useContext } from 'react';
import { BaseWalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { MagicWalletName } from '../MagicWalletAdapter';
import { MagicAdapterContext } from '../AppWalletProvider';
import { useWalletStore } from '@/stores/wallet-store';

interface WalletModalProps {
    isVisible: boolean;
    onClose: () => void;
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

export const WalletModal = ({ isVisible, onClose }: WalletModalProps) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { wallets, select, publicKey, connecting } = useWallet();
    const magicAdapter = useContext(MagicAdapterContext);
    
    // Use our existing wallet store from the app
    const { setWallet } = useWalletStore();

    useEffect(() => {
        // If we connected successfully, close the modal
        if (publicKey && !connecting) {
            onClose();
        }
    }, [publicKey, connecting, onClose]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email.trim()) {
            toast.error("Please enter a valid email address");
            return;
        }
        
        setLoading(true);
        
        try {
            console.log("Starting Magic Link authentication process");

            // First approach: Use the adapter from context if available
            if (magicAdapter) {
                console.log("Using Magic adapter from context");
                try {
                    await magicAdapter.connectWithEmail(email);

                    // Force selection of the Magic wallet in the wallet adapter
                    console.log("Selecting Magic wallet adapter");
                    select(MagicWalletName);

                    // Store wallet information in the zustand store if we have a public key
                    if (publicKey) {
                        setWallet(publicKey.toString(), MagicWalletName);
                    }

                    toast.success("Successfully connected with Magic Link");
                    onClose();
                    return;
                } catch (error) {
                    console.error("Error connecting with Magic adapter:", error);
                    throw error; // Re-throw to handle in the catch block below
                }
            }

            // Second approach: Find the Magic adapter in the wallet list
            const magicAdapterFromList = wallets.find(
                (w) => (w as any)?.name === MagicWalletName
            );

            if (magicAdapterFromList) {
                console.log("Found Magic adapter in wallet list");
                try {
                    // Connect with email using the adapter
                    await (magicAdapterFromList as any).connectWithEmail(email);

                    // Select the Magic wallet in the adapter
                    select(MagicWalletName);
                    
                    // Store in zustand store if public key is available
                    if (publicKey) {
                        setWallet(publicKey.toString(), MagicWalletName);
                    }

                    toast.success("Successfully connected with Magic Link");
                    onClose();
                    return;
                } catch (error) {
                    console.error("Error connecting with Magic adapter from list:", error);
                    throw error; // Re-throw to handle in the catch block below
                }
            } else {
                console.log("Magic adapter not found in wallet list");
            }

            // Fallback: Try the global Magic instance
            const globalMagic = typeof window !== 'undefined' ? window.magic : null;
            const globalAdapter = typeof window !== 'undefined' ? window.magicAdapter : null;

            if (!globalMagic) {
                throw new Error('Magic SDK not available');
            }

            console.log("Using Magic SDK directly for authentication");
            const didToken = await globalMagic.auth.loginWithEmailOTP({ email });
            console.log("Magic auth success, token received:", !!didToken);

            if (globalMagic.user) {
                const userInfo = await globalMagic.user.getInfo();
                console.log("User info:", userInfo);

                if (userInfo && userInfo.publicAddress) {
                    // If we have a global adapter, update it
                    if (globalAdapter && typeof globalAdapter.connectWithEmail === 'function') {
                        await globalAdapter.connectWithEmail(email);
                        console.log("Updated global adapter with new connection");

                        // Force-select the Magic wallet
                        select(MagicWalletName);
                    } else {
                        // Store wallet data in Zustand store instead of localStorage
                        setWallet(userInfo.publicAddress, MagicWalletName);
                        console.log("Stored wallet address in Zustand store");

                        // If we're using direct Magic SDK without adapter, we need to 
                        // refresh to pick up the connection
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    }

                    toast.success(`Magic wallet connected: ${userInfo.publicAddress.slice(0, 6)}...${userInfo.publicAddress.slice(-4)}`);
                    onClose();
                    return;
                }
            }

            toast.success("Successfully authenticated with Magic Link!");
            onClose();
            
            // Force reload after successful login to ensure consistency
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error: any) {
            console.error("Magic Link error:", error);
            toast.error(error?.message || "Error with Magic Link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Modal overlay */}
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
            {/* Modal content */}
            <div className="bg-[#171D3D] rounded-lg p-6 z-10 w-11/12 max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Connect or Create Wallet</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800">X</button>
                </div>

                {/* "Have a Wallet" Section */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">Have a Wallet</h3>
                    <p className="mb-4">Connect your existing wallet.</p>
                    <BaseWalletMultiButton labels={LABELS} />
                </div>

                {/* "Don't Have a Wallet" Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">Don&apos;t Have a Wallet</h3>
                    <p className="mb-4 text-xs">
                        Enter your email address to receive a Magic link for an OTP. A new Solana wallet will be automatically created for you upon successful authentication.
                    </p>
                    <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="your-email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="border bg-[#171D3D] border-gray-300 rounded px-3 py-2"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                        >
                            {loading ? "Sending OTP..." : "Send Magic Link"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};