// "use client";

// import {
//     BaseMessageSignerWalletAdapter,
//     WalletConnectionError,
//     WalletDisconnectionError,
//     WalletName,
//     WalletNotConnectedError,
//     WalletReadyState,
//     WalletSignTransactionError,
//     WalletSignMessageError
// } from '@solana/wallet-adapter-base';
// import {
//     PublicKey,
//     Transaction,
//     VersionedTransaction,
//     TransactionVersion
// } from '@solana/web3.js';
// import { Magic } from 'magic-sdk';
// import { SolanaExtension } from '@magic-ext/solana';

// // Use a simpler name to avoid potential mismatches
// export const MagicWalletName = 'Magic' as WalletName;

// // Define type for TransactionOrVersionedTransaction
// type TransactionOrVersionedTransaction<T extends TransactionVersion = TransactionVersion> =
//     | Transaction
//     | VersionedTransaction;

// export class MagicWalletAdapter extends BaseMessageSignerWalletAdapter {
//     name = MagicWalletName;
//     url = 'https://magic.link';
//     icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiByeD0iMTQuNjc2OCIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTMwLjk5MDcgMTYuMDk4MkgzOC4xODg5QzM5LjM0MTYgMTYuMDk4MiA0MC4yNzU5IDE3LjAzMjUgNDAuMjc1OSAxOC4xODUyVjQxLjM5MjFDNDAuMjc1OSA0Mi41NDQ4IDM5LjM0MTYgNDMuNDc5MSAzOC4xODg5IDQzLjQ3OTFIMjEuNzk0MkMyMC42NDE1IDQzLjQ3OTEgMTkuNzA3MSA0Mi41NDQ4IDE5LjcwNzEgNDEuMzkyMVYxOC4xODUyQzE5LjcwNzEgMTcuMDMyNSAyMC42NDE1IDE2LjA5ODIgMjEuNzk0MiAxNi4wOTgySDI5Ljk3MjFWMjYuMzU3MUwyNi44MjYxIDIzLjIxMTJDMjYuMTkyMyAyMi41Nzc0IDI1LjE3MSAyMi41Nzc0IDI0LjUzNzIgMjMuMjExMkMyMy45MDM0IDIzLjg0NTEgMjMuOTAzNCAyNC44NjY0IDI0LjUzNzIgMjUuNTAwMkwyOS45NTM0IDMwLjkxNjRMMzUuMzY5NiAyNS41MDAyQzM2LjAwMzQgMjQuODY2NCAzNi4wMDM0IDIzLjg0NTEgMzUuMzY5NiAyMy4yMTEyQzM0LjczNTggMjIuNTc3NCAzMy43MTQ1IDIyLjU3NzQgMzMuMDgwNyAyMy4yMTEyTDI5LjkzNDcgMjYuMzU3MVYxNi4wOTgySDMwLjk5MDdaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
//     private _magic: any = null; // Using 'any' to avoid type issues with Magic SDK
//     private _publicKey: PublicKey | null = null;
//     private _connecting: boolean = false;
//     private _readyState: WalletReadyState = WalletReadyState.Loadable;

//     // Add this property to fix the abstract class implementation
//     readonly supportedTransactionVersions = new Set(['legacy', 0] as TransactionVersion[]);

//     constructor(apiKey: string, rpcUrl: string) {
//         super();
//         console.log("MagicWalletAdapter constructor called with apiKey:", apiKey ? "available" : "missing");

//         // Initialize magic in the constructor to ensure it's available early
//         if (typeof window !== 'undefined') {
//             try {
//                 this._magic = new Magic(apiKey, {
//                     extensions: [
//                         new SolanaExtension({
//                             rpcUrl: rpcUrl,
//                         }),
//                     ],
//                 });

//                 console.log("Magic SDK initialized successfully");

//                 // Make Magic globally available
//                 window.magic = this._magic;
//                 window.magicAdapter = this;
//             } catch (error) {
//                 console.error("Error initializing Magic SDK:", error);
//             }
//         }
//     }

//     get publicKey(): PublicKey | null {
//         return this._publicKey;
//     }

//     get connecting(): boolean {
//         return this._connecting;
//     }

//     get readyState(): WalletReadyState {
//         return this._readyState;
//     }

//     // This function will be called by our custom code, not by wallet adapter directly
//     async connectWithEmail(email: string): Promise<void> {
//         try {
//             console.log("connectWithEmail called with email:", email);
//             if (this.connected || this.connecting) {
//                 console.log("Already connected or connecting");
//                 return;
//             }
//             if (!this._magic) {
//                 console.error("Magic SDK not initialized");
//                 throw new WalletConnectionError('Magic SDK not initialized');
//             }

//             this._connecting = true;
//             console.log("Setting connecting state to true");

//             // Authenticate with Magic
//             console.log("Authenticating with Magic...");
//             const didToken = await this._magic.auth.loginWithEmailOTP({ email });
//             console.log("Magic authentication successful, received token:", didToken ? "present" : "missing");

//             // Get user's public key after authentication
//             if (this._magic.user && typeof this._magic.user.getInfo === 'function') {
//                 console.log("Getting user info from Magic...");
//                 const userInfo = await this._magic.user.getInfo();
//                 console.log("Received user info:", userInfo);

//                 if (userInfo && userInfo.publicAddress) {
//                     console.log("Setting public key from address:", userInfo.publicAddress);
//                     this._publicKey = new PublicKey(userInfo.publicAddress);
//                     this.emit('connect', this._publicKey);
//                     console.log("Connect event emitted with public key");
//                 } else {
//                     console.error("No public address found in user info");
//                 }
//             } else {
//                 console.error("Magic user info not available");
//             }
//         } catch (error: any) {
//             console.error("Error in connectWithEmail:", error);
//             throw new WalletConnectionError(error?.message, error);
//         } finally {
//             this._connecting = false;
//             console.log("Setting connecting state to false");
//         }
//     }

//     // This is the standard connect method required by the adapter interface
//     async connect(): Promise<void> {
//         try {
//             console.log("Standard connect method called");
//             if (this.connected || this.connecting) {
//                 console.log("Already connected or connecting");
//                 return;
//             }
//             if (!this._magic) {
//                 console.error("Magic SDK not initialized");
//                 throw new WalletConnectionError('Magic SDK not initialized');
//             }

//             this._connecting = true;

//             // Check if user is already logged in
//             if (this._magic.user) {
//                 console.log("Checking if user is already logged in...");
//                 const isLoggedIn = await this._magic.user.isLoggedIn();
//                 console.log("User logged in status:", isLoggedIn);

//                 if (isLoggedIn) {
//                     console.log("User is already logged in, getting info...");
//                     const userInfo = await this._magic.user.getInfo();
//                     console.log("User info:", userInfo);

//                     if (userInfo && userInfo.publicAddress) {
//                         console.log("Setting public key from cached user info");
//                         this._publicKey = new PublicKey(userInfo.publicAddress);
//                         this.emit('connect', this._publicKey);
//                         console.log("Connect event emitted for cached user");
//                         return;
//                     }
//                 }
//             }

//             // If not logged in, we can't proceed with standard connect - it requires email
//             console.log("User not logged in, email authentication required");
//             throw new WalletConnectionError('Magic requires email authentication. Please use connectWithEmail instead.');
//         } catch (error: any) {
//             console.error("Error in standard connect:", error);
//             throw new WalletConnectionError(error?.message, error);
//         } finally {
//             this._connecting = false;
//         }
//     }

//     async disconnect(): Promise<void> {
//         try {
//             console.log("Disconnect method called");
//             if (this._magic && this._magic.user) {
//                 console.log("Logging out from Magic...");
//                 await this._magic.user.logout();
//                 this._publicKey = null;
//                 this.emit('disconnect');
//                 console.log("Disconnect event emitted");
//             }
//         } catch (error: any) {
//             console.error("Error in disconnect:", error);
//             throw new WalletDisconnectionError(error?.message, error);
//         }
//     }

//     // Update signTransaction to match the base class interface
//     async signTransaction<T extends TransactionOrVersionedTransaction>(transaction: T): Promise<T> {
//         try {
//             console.log("signTransaction called");
//             if (!this.connected) {
//                 console.error("Wallet not connected");
//                 throw new WalletNotConnectedError();
//             }
//             if (!this._magic || !this._magic.solana) {
//                 console.error("Magic Solana extension not available");
//                 throw new WalletSignTransactionError('Magic Solana extension not available');
//             }

//             console.log("Signing transaction with Magic...");

//             // Handle different transaction types
//             if (transaction instanceof Transaction) {
//                 const signedTransaction = await this._magic.solana.signTransaction(transaction);
//                 return signedTransaction as T;
//             } else {
//                 throw new WalletSignTransactionError('VersionedTransaction not supported by Magic');
//             }
//         } catch (error: any) {
//             console.error("Error signing transaction:", error);
//             throw new WalletSignTransactionError(error?.message, error);
//         }
//     }

//     // Update signAllTransactions to match the base class interface
//     async signAllTransactions<T extends TransactionOrVersionedTransaction>(transactions: T[]): Promise<T[]> {
//         try {
//             console.log("signAllTransactions called");
//             if (!this.connected) {
//                 console.error("Wallet not connected");
//                 throw new WalletNotConnectedError();
//             }
//             if (!this._magic || !this._magic.solana) {
//                 console.error("Magic Solana extension not available");
//                 throw new WalletSignTransactionError('Magic Solana extension not available');
//             }

//             console.log("Signing all transactions with Magic...");

//             // Process each transaction
//             const signedTransactions: T[] = [];
//             for (const transaction of transactions) {
//                 if (transaction instanceof Transaction) {
//                     const signedTransaction = await this._magic.solana.signTransaction(transaction);
//                     signedTransactions.push(signedTransaction as T);
//                 } else {
//                     throw new WalletSignTransactionError('VersionedTransaction not supported by Magic');
//                 }
//             }

//             return signedTransactions;
//         } catch (error: any) {
//             console.error("Error signing transactions:", error);
//             throw new WalletSignTransactionError(error?.message, error);
//         }
//     }

//     async signMessage(message: Uint8Array): Promise<Uint8Array> {
//         try {
//             console.log("signMessage called");
//             if (!this.connected) {
//                 console.error("Wallet not connected");
//                 throw new WalletNotConnectedError();
//             }
//             if (!this._magic || !this._magic.solana) {
//                 console.error("Magic Solana extension not available");
//                 throw new WalletSignMessageError('Magic Solana extension not available');
//             }

//             console.log("Signing message with Magic...");

//             // Magic's signMessage might have a different return format
//             try {
//                 // First, try the standard approach
//                 const signedMessage = await this._magic.solana.signMessage(message);
//                 if (signedMessage && signedMessage.signature) {
//                     return signedMessage.signature;
//                 } else {
//                     // Fallback if the signature format is different
//                     return new Uint8Array(signedMessage);
//                 }
//             } catch (err) {
//                 console.error("Error in signMessage standard approach:", err);

//                 // Alternative approach using custom Magic API if available
//                 if (this._magic.solana.signMessage) {
//                     const result = await this._magic.solana.signMessage(message);
//                     if (result && result.signature) {
//                         return result.signature;
//                     } else {
//                         return new Uint8Array(result);
//                     }
//                 }

//                 throw err;
//             }
//         } catch (error: any) {
//             console.error("Error signing message:", error);
//             throw new WalletSignMessageError(error?.message, error);
//         }
//     }
// }

// // Add Magic to the global window object
// declare global {
//     interface Window {
//         magic: any;
//         magicAdapter: any;
//         MagicWalletName: WalletName;
//     }
// }



// "use client";

// import {
//     BaseMessageSignerWalletAdapter,
//     WalletConnectionError,
//     WalletDisconnectionError,
//     WalletName,
//     WalletNotConnectedError,
//     WalletReadyState,
//     WalletSignTransactionError,
//     WalletSignMessageError,
//     WalletAdapterEvents
// } from '@solana/wallet-adapter-base';
// import {
//     PublicKey,
//     Transaction,
//     VersionedTransaction,
//     TransactionVersion
// } from '@solana/web3.js';
// import { Magic } from 'magic-sdk';
// import { SolanaExtension } from '@magic-ext/solana';

// // Use a simpler name to avoid potential mismatches
// export const MagicWalletName = 'Magic' as WalletName<'Magic'>;

// // Define type for TransactionOrVersionedTransaction
// type TransactionOrVersionedTransaction<T extends TransactionVersion = TransactionVersion> =
//     | Transaction
//     | VersionedTransaction;

// export class MagicWalletAdapter extends BaseMessageSignerWalletAdapter {
//     name = MagicWalletName;
//     url = 'https://magic.link';
//     icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiByeD0iMTQuNjc2OCIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTMwLjk5MDcgMTYuMDk4MkgzOC4xODg5QzM5LjM0MTYgMTYuMDk4MiA0MC4yNzU5IDE3LjAzMjUgNDAuMjc1OSAxOC4xODUyVjQxLjM5MjFDNDAuMjc1OSA0Mi41NDQ4IDM5LjM0MTYgNDMuNDc5MSAzOC4xODg5IDQzLjQ3OTFIMjEuNzk0MkMyMC42NDE1IDQzLjQ3OTEgMTkuNzA3MSA0Mi41NDQ4IDE5LjcwNzEgNDEuMzkyMVYxOC4xODUyQzE5LjcwNzEgMTcuMDMyNSAyMC42NDE1IDE2LjA5ODIgMjEuNzk0MiAxNi4wOTgySDI5Ljk3MjFWMjYuMzU3MUwyNi44MjYxIDIzLjIxMTJDMjYuMTkyMyAyMi41Nzc0IDI1LjE3MSAyMi41Nzc0IDI0LjUzNzIgMjMuMjExMkMyMy45MDM0IDIzLjg0NTEgMjMuOTAzNCAyNC44NjY0IDI0LjUzNzIgMjUuNTAwMkwyOS45NTM0IDMwLjkxNjRMMzUuMzY5NiAyNS41MDAyQzM2LjAwMzQgMjQuODY2NCAzNi4wMDM0IDIzLjg0NTEgMzUuMzY5NiAyMy4yMTEyQzM0LjczNTggMjIuNTc3NCAzMy43MTQ1IDIyLjU3NzQgMzMuMDgwNyAyMy4yMTEyTDI5LjkzNDcgMjYuMzU3MVYxNi4wOTgySDMwLjk5MDdaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
//     private _magic: any = null; // Using 'any' to avoid type issues with Magic SDK
//     private _publicKey: PublicKey | null = null;
//     private _connecting: boolean = false;
//     private _readyState: WalletReadyState = WalletReadyState.Loadable;

//     // Add this property to fix the abstract class implementation
//     readonly supportedTransactionVersions = new Set(['legacy', 0] as TransactionVersion[]);

//     constructor(apiKey: string, rpcUrl: string) {
//         super();
//         console.log("MagicWalletAdapter constructor called with apiKey:", apiKey ? "available" : "missing");

//         // Initialize magic in the constructor to ensure it's available early
//         if (typeof window !== 'undefined') {
//             try {
//                 this._magic = new Magic(apiKey, {
//                     extensions: [
//                         new SolanaExtension({
//                             rpcUrl: rpcUrl,
//                         }),
//                     ],
//                 });

//                 console.log("Magic SDK initialized successfully");

//                 // Make Magic globally available
//                 window.magic = this._magic;
//                 window.magicAdapter = this;
//             } catch (error) {
//                 console.error("Error initializing Magic SDK:", error);
//             }
//         }
//     }

//     get publicKey(): PublicKey | null {
//         return this._publicKey;
//     }

//     get connecting(): boolean {
//         return this._connecting;
//     }

//     get readyState(): WalletReadyState {
//         return this._readyState;
//     }

//     // Add a public method to manually set the public key
//     // This solves the TypeScript error when trying to access private _publicKey
//     public setPublicKey(publicKeyString: string): void {
//         try {
//             this._publicKey = new PublicKey(publicKeyString);

//             // Store in localStorage for persistence
//             localStorage.setItem('connectedWalletAddress', publicKeyString);
//             localStorage.setItem('walletName', MagicWalletName);

//             // Emit connect event to update wallet adapter state
//             this.emit('connect', this._publicKey);
//             console.log("Public key set manually:", publicKeyString);
//         } catch (error) {
//             console.error("Error setting public key:", error);
//         }
//     }

//     // DO NOT override on() and off() methods - they are inherited from the EventEmitter base class
//     // and have specific signatures that should not be changed

//     // Update this method to properly emit connect event to Solana wallet adapter
//     async connectWithEmail(email: string): Promise<void> {
//         try {
//             console.log("connectWithEmail called with email:", email);
//             if (this.connected || this.connecting) {
//                 console.log("Already connected or connecting");
//                 return;
//             }
//             if (!this._magic) {
//                 console.error("Magic SDK not initialized");
//                 throw new WalletConnectionError('Magic SDK not initialized');
//             }

//             this._connecting = true;
//             console.log("Setting connecting state to true");

//             // Authenticate with Magic
//             console.log("Authenticating with Magic...");
//             const didToken = await this._magic.auth.loginWithEmailOTP({ email });
//             console.log("Magic authentication successful, received token:", didToken ? "present" : "missing");

//             // Get user's public key after authentication
//             if (this._magic.user && typeof this._magic.user.getInfo === 'function') {
//                 console.log("Getting user info from Magic...");
//                 const userInfo = await this._magic.user.getInfo();
//                 console.log("Received user info:", userInfo);

//                 if (userInfo && userInfo.publicAddress) {
//                     console.log("Setting public key from address:", userInfo.publicAddress);
//                     // Use our public method instead of directly setting private property
//                     this.setPublicKey(userInfo.publicAddress);
//                 } else {
//                     console.error("No public address found in user info");
//                 }
//             } else {
//                 console.error("Magic user info not available");
//             }
//         } catch (error: any) {
//             console.error("Error in connectWithEmail:", error);
//             throw new WalletConnectionError(error?.message, error);
//         } finally {
//             this._connecting = false;
//             console.log("Setting connecting state to false");
//         }
//     }

//     // This is the standard connect method required by the adapter interface
//     // This is the standard connect method required by the adapter interface
// async connect(): Promise<void> {
//     try {
//       console.log("Standard connect method called");
      
//       // Always check localStorage first
//       const storedAddress = localStorage.getItem('connectedWalletAddress');
//       const storedWalletName = localStorage.getItem('walletName');
      
//       // If we have stored credentials for Magic, try that path first
//       if (storedAddress && storedWalletName === MagicWalletName) {
//         console.log("Found stored Magic credentials, attempting reconnection");
        
//         if (!this._magic) {
//           console.error("Magic SDK not initialized");
//           throw new WalletConnectionError('Magic SDK not initialized');
//         }
        
//         this._connecting = true;
        
//         // Always set the public key from storage first - this ensures UI updates immediately
//         this._publicKey = new PublicKey(storedAddress);
//         // Emit connect event immediately to update UI state
//         this.emit('connect', this._publicKey);
        
//         // Then verify with Magic in the background
//         try {
//           const isLoggedIn = await this._magic.user.isLoggedIn();
//           console.log("User login status:", isLoggedIn);
          
//           if (isLoggedIn) {
//             // Get fresh info from Magic
//             const userInfo = await this._magic.user.getInfo();
            
//             if (userInfo && userInfo.publicAddress) {
//               // Update if address changed
//               if (userInfo.publicAddress !== storedAddress) {
//                 this._publicKey = new PublicKey(userInfo.publicAddress);
//                 localStorage.setItem('connectedWalletAddress', userInfo.publicAddress);
//                 this.emit('connect', this._publicKey);
//               }
//             }
            
//             // Successfully reconnected
//             this._connecting = false;
//             return;
//           }
//         } catch (error) {
//           console.error("Error checking Magic session:", error);
//           // Continue with connect flow
//         }
//       }
  
//       // If we're here, either we have no stored credentials or they're invalid
//       // Check if user is already logged in
//       if (this._magic?.user) {
//         console.log("Checking if user is already logged in...");
//         try {
//           const isLoggedIn = await this._magic.user.isLoggedIn();
//           console.log("User logged in status:", isLoggedIn);
  
//           if (isLoggedIn) {
//             console.log("User is already logged in, getting info...");
//             const userInfo = await this._magic.user.getInfo();
//             console.log("User info:", userInfo);
  
//             if (userInfo && userInfo.publicAddress) {
//               console.log("Setting public key from cached user info");
//               // Use our public method instead of directly setting private property
//               this.setPublicKey(userInfo.publicAddress);
//               this._connecting = false;
//               return;
//             }
//           }
//         } catch (error) {
//           console.error("Error checking Magic login status:", error);
//         }
//       }
  
//       // If we reach here, standard connect can't proceed
//       console.log("User not logged in, email authentication required");
//       throw new WalletConnectionError('Magic requires email authentication. Please use connectWithEmail instead.');
//     } catch (error: any) {
//       console.error("Error in standard connect:", error);
//       throw new WalletConnectionError(error?.message, error);
//     } finally {
//       this._connecting = false;
//     }
//   }

//     async disconnect(): Promise<void> {
//         try {
//             console.log("Disconnect method called");
//             if (this._magic && this._magic.user) {
//                 console.log("Logging out from Magic...");
//                 await this._magic.user.logout();
//                 this._publicKey = null;

//                 // Remove from localStorage
//                 localStorage.removeItem('connectedWalletAddress');
//                 localStorage.removeItem('walletName');

//                 this.emit('disconnect');
//                 console.log("Disconnect event emitted");
//             }
//         } catch (error: any) {
//             console.error("Error in disconnect:", error);
//             throw new WalletDisconnectionError(error?.message, error);
//         }
//     }

//     // Update signTransaction to match the base class interface
//     async signTransaction<T extends TransactionOrVersionedTransaction>(transaction: T): Promise<T> {
//         try {
//             console.log("signTransaction called");
//             if (!this.connected) {
//                 console.error("Wallet not connected");
//                 throw new WalletNotConnectedError();
//             }
//             if (!this._magic || !this._magic.solana) {
//                 console.error("Magic Solana extension not available");
//                 throw new WalletSignTransactionError('Magic Solana extension not available');
//             }

//             console.log("Signing transaction with Magic...");

//             // Handle different transaction types
//             if (transaction instanceof Transaction) {
//                 const signedTransaction = await this._magic.solana.signTransaction(transaction);
//                 return signedTransaction as T;
//             } else {
//                 throw new WalletSignTransactionError('VersionedTransaction not supported by Magic');
//             }
//         } catch (error: any) {
//             console.error("Error signing transaction:", error);
//             throw new WalletSignTransactionError(error?.message, error);
//         }
//     }

//     // Update signAllTransactions to match the base class interface
//     async signAllTransactions<T extends TransactionOrVersionedTransaction>(transactions: T[]): Promise<T[]> {
//         try {
//             console.log("signAllTransactions called");
//             if (!this.connected) {
//                 console.error("Wallet not connected");
//                 throw new WalletNotConnectedError();
//             }
//             if (!this._magic || !this._magic.solana) {
//                 console.error("Magic Solana extension not available");
//                 throw new WalletSignTransactionError('Magic Solana extension not available');
//             }

//             console.log("Signing all transactions with Magic...");

//             // Process each transaction
//             const signedTransactions: T[] = [];
//             for (const transaction of transactions) {
//                 if (transaction instanceof Transaction) {
//                     const signedTransaction = await this._magic.solana.signTransaction(transaction);
//                     signedTransactions.push(signedTransaction as T);
//                 } else {
//                     throw new WalletSignTransactionError('VersionedTransaction not supported by Magic');
//                 }
//             }

//             return signedTransactions;
//         } catch (error: any) {
//             console.error("Error signing transactions:", error);
//             throw new WalletSignTransactionError(error?.message, error);
//         }
//     }

//     async signMessage(message: Uint8Array): Promise<Uint8Array> {
//         try {
//             console.log("signMessage called");
//             if (!this.connected) {
//                 console.error("Wallet not connected");
//                 throw new WalletNotConnectedError();
//             }
//             if (!this._magic || !this._magic.solana) {
//                 console.error("Magic Solana extension not available");
//                 throw new WalletSignMessageError('Magic Solana extension not available');
//             }

//             console.log("Signing message with Magic...");

//             // Magic's signMessage might have a different return format
//             try {
//                 // First, try the standard approach
//                 const signedMessage = await this._magic.solana.signMessage(message);
//                 if (signedMessage && signedMessage.signature) {
//                     return signedMessage.signature;
//                 } else {
//                     // Fallback if the signature format is different
//                     return new Uint8Array(signedMessage);
//                 }
//             } catch (err) {
//                 console.error("Error in signMessage standard approach:", err);

//                 // Alternative approach using custom Magic API if available
//                 if (this._magic.solana.signMessage) {
//                     const result = await this._magic.solana.signMessage(message);
//                     if (result && result.signature) {
//                         return result.signature;
//                     } else {
//                         return new Uint8Array(result);
//                     }
//                 }

//                 throw err;
//             }
//         } catch (error: any) {
//             console.error("Error signing message:", error);
//             throw new WalletSignMessageError(error?.message, error);
//         }
//     }
// }

// // Add Magic to the global window object
// declare global {
//     interface Window {
//         magic?: any;
//         magicAdapter?: any;
//         MagicWalletName?: WalletName<'Magic'>;
//     }
// }

"use client";

import {
    BaseMessageSignerWalletAdapter,
    WalletConnectionError,
    WalletDisconnectionError,
    WalletName,
    WalletNotConnectedError,
    WalletReadyState,
    WalletSignTransactionError,
    WalletSignMessageError
} from '@solana/wallet-adapter-base';
import {
    PublicKey,
    Transaction,
    VersionedTransaction,
    TransactionVersion
} from '@solana/web3.js';
import { Magic } from 'magic-sdk';
import { SolanaExtension } from '@magic-ext/solana';
import { useWalletStore } from '@/stores/wallet-store';


// Use a simpler name to avoid potential mismatches
export const MagicWalletName = 'Magic' as WalletName<'Magic'>;

// Define type for TransactionOrVersionedTransaction
type TransactionOrVersionedTransaction<T extends TransactionVersion = TransactionVersion> =
    | Transaction
    | VersionedTransaction;

export class MagicWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = MagicWalletName;
    url = 'https://magic.link';
    icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiByeD0iMTQuNjc2OCIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTMwLjk5MDcgMTYuMDk4MkgzOC4xODg5QzM5LjM0MTYgMTYuMDk4MiA0MC4yNzU5IDE3LjAzMjUgNDAuMjc1OSAxOC4xODUyVjQxLjM5MjFDNDAuMjc1OSA0Mi41NDQ4IDM5LjM0MTYgNDMuNDc5MSAzOC4xODg5IDQzLjQ3OTFIMjEuNzk0MkMyMC42NDE1IDQzLjQ3OTEgMTkuNzA3MSA0Mi41NDQ4IDE5LjcwNzEgNDEuMzkyMVYxOC4xODUyQzE5LjcwNzEgMTcuMDMyNSAyMC42NDE1IDE2LjA5ODIgMjEuNzk0MiAxNi4wOTgySDI5Ljk3MjFWMjYuMzU3MUwyNi44MjYxIDIzLjIxMTJDMjYuMTkyMyAyMi41Nzc0IDI1LjE3MSAyMi41Nzc0IDI0LjUzNzIgMjMuMjExMkMyMy45MDM0IDIzLjg0NTEgMjMuOTAzNCAyNC44NjY0IDI0LjUzNzIgMjUuNTAwMkwyOS45NTM0IDMwLjkxNjRMMzUuMzY5NiAyNS41MDAyQzM2LjAwMzQgMjQuODY2NCAzNi4wMDM0IDIzLjg0NTEgMzUuMzY5NiAyMy4yMTEyQzM0LjczNTggMjIuNTc3NCAzMy43MTQ1IDIyLjU3NzQgMzMuMDgwNyAyMy4yMTEyTDI5LjkzNDcgMjYuMzU3MVYxNi4wOTgySDMwLjk5MDdaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
    private _magic: any = null; // Using 'any' to avoid type issues with Magic SDK
    private _publicKey: PublicKey | null = null;
    private _connecting: boolean = false;
    private _readyState: WalletReadyState = WalletReadyState.Loadable;
    private _connected: boolean = false; // Track connected state internally
    private _connectionCheckInterval: any = null; // For persistent connection checking

    // Add this property to fix the abstract class implementation
    readonly supportedTransactionVersions = new Set(['legacy', 0] as TransactionVersion[]);

    constructor(apiKey: string, rpcUrl: string) {
        super();
        console.log("MagicWalletAdapter constructor called with apiKey:", apiKey ? "available" : "missing");

        // Initialize magic in the constructor to ensure it's available early
        if (typeof window !== 'undefined') {
            try {
                this._magic = new Magic(apiKey, {
                    extensions: [
                        new SolanaExtension({
                            rpcUrl: rpcUrl,
                        }),
                    ],
                });

                console.log("Magic SDK initialized successfully");

                // Make Magic globally available
                window.magic = this._magic;
                window.magicAdapter = this;
                
                // Try to restore connection immediately
                this._checkStoredConnection();
                
                // Set up persistent connection checking
                this._startConnectionCheck();
            } catch (error) {
                console.error("Error initializing Magic SDK:", error);
            }
        }
    }

    // Start persistent connection checking
    private _startConnectionCheck() {
        // Clear any existing interval
        if (this._connectionCheckInterval) {
            clearInterval(this._connectionCheckInterval);
        }
        
        // Set up new interval to check connection regularly
        this._connectionCheckInterval = setInterval(() => {
            this._checkStoredConnection();
        }, 3000); // Check every 3 seconds
        
        console.log("Started persistent connection checking");
    }
    
    // Stop connection checking
    private _stopConnectionCheck() {
        if (this._connectionCheckInterval) {
            clearInterval(this._connectionCheckInterval);
            this._connectionCheckInterval = null;
            console.log("Stopped persistent connection checking");
        }
    }

    // Check stored connection and restore if needed
    private async _checkStoredConnection(): Promise<void> {
        // Skip if already connected
        if (this._publicKey && this._connected) {
            return;
        }
        
        try {
            const storedAddress = localStorage.getItem('connectedWalletAddress');
            const storedWalletName = localStorage.getItem('walletName');
            
            if (storedAddress && storedWalletName === MagicWalletName && this._magic) {
                console.log("Found stored Magic credentials, checking session");
                
                // Always set public key from storage immediately - even if session validation fails
                // This ensures the UI remains in a connected state
                this._publicKey = new PublicKey(storedAddress);
                this._connected = true;
                
                // Emit connect event to update wallet adapter state
                this.emit('connect', this._publicKey);
                
                // Verify session in background
                try {
                    const isLoggedIn = await this._magic.user.isLoggedIn();
                    console.log("Magic session active:", isLoggedIn);
                    
                    if (!isLoggedIn) {
                        // Session expired but we'll keep the UI in connected state
                        // The user will need to disconnect and reconnect if they want to use wallet functions
                        console.log("Magic session expired but maintaining UI connection state");
                    }
                } catch (err) {
                    console.error("Error checking Magic session:", err);
                }
            }
        } catch (error) {
            console.error("Error in _checkStoredConnection:", error);
        }
    }
    
    // Clear stored connection data
    // private _clearStoredConnection(): void {
    //     localStorage.removeItem('connectedWalletAddress');
    //     localStorage.removeItem('walletName');
    //     this._connected = false;
    //     this._publicKey = null;
    // }
    
    private _clearStoredConnection(): void {
                // wipe both address & name in the zustand store
                useWalletStore.getState().clearWallet();
                this._connected = false;
                this._publicKey = null;
            }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get connecting(): boolean {
        return this._connecting;
    }
    
    // Override the connected getter
    get connected(): boolean {
        return this._connected && this._publicKey !== null;
    }

    get readyState(): WalletReadyState {
        return this._readyState;
    }

    // Public method to manually set the public key
    public setPublicKey(publicKeyString: string): void {
        try {
            this._publicKey = new PublicKey(publicKeyString);
            this._connected = true;

            // Store in localStorage for persistence
            localStorage.setItem('connectedWalletAddress', publicKeyString);
            localStorage.setItem('walletName', MagicWalletName);

            // Emit connect event to update wallet adapter state
            this.emit('connect', this._publicKey);
            console.log("Public key set manually:", publicKeyString);
        } catch (error) {
            console.error("Error setting public key:", error);
        }
    }

    async connectWithEmail(email: string): Promise<void> {
        try {
            console.log("connectWithEmail called with email:", email);
            if (this.connected || this.connecting) {
                console.log("Already connected or connecting");
                return;
            }
            if (!this._magic) {
                console.error("Magic SDK not initialized");
                throw new WalletConnectionError('Magic SDK not initialized');
            }

            this._connecting = true;
            console.log("Setting connecting state to true");

            // Authenticate with Magic
            console.log("Authenticating with Magic...");
            const didToken = await this._magic.auth.loginWithEmailOTP({ email });
            console.log("Magic authentication successful, received token:", didToken ? "present" : "missing");

            // Get user's public key after authentication
            if (this._magic.user && typeof this._magic.user.getInfo === 'function') {
                console.log("Getting user info from Magic...");
                const userInfo = await this._magic.user.getInfo();
                console.log("Received user info:", userInfo);

                if (userInfo && userInfo.publicAddress) {
                    console.log("Setting public key from address:", userInfo.publicAddress);
                    this.setPublicKey(userInfo.publicAddress);
                } else {
                    console.error("No public address found in user info");
                }
            } else {
                console.error("Magic user info not available");
            }
        } catch (error: any) {
            console.error("Error in connectWithEmail:", error);
            throw new WalletConnectionError(error?.message, error);
        } finally {
            this._connecting = false;
            console.log("Setting connecting state to false");
        }
    }

    // Standard connect method required by the adapter interface
    async connect(): Promise<void> {
        try {
            console.log("Standard connect method called");
            
            // Always check localStorage first
            const storedAddress = localStorage.getItem('connectedWalletAddress');
            const storedWalletName = localStorage.getItem('walletName');
            
            // If we have stored credentials for Magic, try that path first
            if (storedAddress && storedWalletName === MagicWalletName) {
                console.log("Found stored Magic credentials, attempting reconnection");
                
                if (!this._magic) {
                    console.error("Magic SDK not initialized");
                    throw new WalletConnectionError('Magic SDK not initialized');
                }
                
                this._connecting = true;
                
                // Always set the public key from storage first - this ensures UI updates immediately
                this._publicKey = new PublicKey(storedAddress);
                this._connected = true;
                
                // Emit connect event immediately to update UI state
                this.emit('connect', this._publicKey);
                
                // Then verify with Magic in the background
                try {
                    const isLoggedIn = await this._magic.user.isLoggedIn();
                    console.log("User login status:", isLoggedIn);
                    
                    if (isLoggedIn) {
                        // Get fresh info from Magic
                        const userInfo = await this._magic.user.getInfo();
                        
                        if (userInfo && userInfo.publicAddress) {
                            // Update if address changed
                            if (userInfo.publicAddress !== storedAddress) {
                                this._publicKey = new PublicKey(userInfo.publicAddress);
                                localStorage.setItem('connectedWalletAddress', userInfo.publicAddress);
                                this.emit('connect', this._publicKey);
                            }
                        }
                        
                        // Successfully reconnected
                        this._connecting = false;
                        return;
                    } else {
                        // Session expired, but we'll keep the UI connected
                        console.log("Session expired but maintaining UI connection state");
                    }
                } catch (error) {
                    console.error("Error checking Magic session:", error);
                    // Continue with connect flow but keep UI in connected state
                }
            }
        
            // If we're here, either we have no stored credentials or they're invalid
            // Check if user is already logged in
            if (this._magic?.user) {
                console.log("Checking if user is already logged in...");
                try {
                    const isLoggedIn = await this._magic.user.isLoggedIn();
                    console.log("User logged in status:", isLoggedIn);
            
                    if (isLoggedIn) {
                        console.log("User is already logged in, getting info...");
                        const userInfo = await this._magic.user.getInfo();
                        console.log("User info:", userInfo);
            
                        if (userInfo && userInfo.publicAddress) {
                            console.log("Setting public key from cached user info");
                            this.setPublicKey(userInfo.publicAddress);
                            this._connecting = false;
                            return;
                        }
                    }
                } catch (error) {
                    console.error("Error checking Magic login status:", error);
                }
            }
        
            // If we reach here, standard connect can't proceed
            console.log("User not logged in, email authentication required");
            throw new WalletConnectionError('Magic requires email authentication. Please use connectWithEmail instead.');
        } catch (error: any) {
            console.error("Error in standard connect:", error);
            throw new WalletConnectionError(error?.message, error);
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        try {
            console.log("Disconnect method called");
            
            // Stop connection checking
            this._stopConnectionCheck();
            
            // Clear local state first
            const hadPublicKey = this._publicKey !== null;
            this._publicKey = null;
            this._connected = false;
            
            // Remove from localStorage
            localStorage.removeItem('connectedWalletAddress');
            localStorage.removeItem('walletName');
            
            // Then try to logout from Magic
            if (this._magic && this._magic.user) {
                console.log("Logging out from Magic...");
                try {
                    await this._magic.user.logout();
                    console.log("Magic logout successful");
                } catch (error) {
                    console.error("Error logging out from Magic:", error);
                    // We still want to disconnect locally even if Magic logout fails
                }
            }
            
            // Only emit disconnect event if we were connected
            if (hadPublicKey) {
                this.emit('disconnect');
                console.log("Disconnect event emitted");
            }
            
            // Force reload the page to clear all state
            if (typeof window !== 'undefined') {
                console.log("Reloading page after disconnect");
                window.location.reload();
            }
        } catch (error: any) {
            console.error("Error in disconnect:", error);
            throw new WalletDisconnectionError(error?.message, error);
        }
    }

    // Update signTransaction to match the base class interface
    async signTransaction<T extends TransactionOrVersionedTransaction>(transaction: T): Promise<T> {
        try {
            console.log("signTransaction called");
            if (!this.connected) {
                console.error("Wallet not connected");
                throw new WalletNotConnectedError();
            }
            if (!this._magic || !this._magic.solana) {
                console.error("Magic Solana extension not available");
                throw new WalletSignTransactionError('Magic Solana extension not available');
            }

            console.log("Signing transaction with Magic...");

            // Verify connection before signing
            try {
                const isLoggedIn = await this._magic.user.isLoggedIn();
                if (!isLoggedIn) {
                    // If session expired, try to reconnect using stored credentials
                    await this.connect();
                }
            } catch (err) {
                console.error("Error checking session before signing:", err);
            }

            // Handle different transaction types
            if (transaction instanceof Transaction) {
                const signedTransaction = await this._magic.solana.signTransaction(transaction);
                return signedTransaction as T;
            } else {
                throw new WalletSignTransactionError('VersionedTransaction not supported by Magic');
            }
        } catch (error: any) {
            console.error("Error signing transaction:", error);
            throw new WalletSignTransactionError(error?.message, error);
        }
    }

    // Update signAllTransactions to match the base class interface
    async signAllTransactions<T extends TransactionOrVersionedTransaction>(transactions: T[]): Promise<T[]> {
        try {
            console.log("signAllTransactions called");
            if (!this.connected) {
                console.error("Wallet not connected");
                throw new WalletNotConnectedError();
            }
            if (!this._magic || !this._magic.solana) {
                console.error("Magic Solana extension not available");
                throw new WalletSignTransactionError('Magic Solana extension not available');
            }

            console.log("Signing all transactions with Magic...");

            // Verify connection before signing
            try {
                const isLoggedIn = await this._magic.user.isLoggedIn();
                if (!isLoggedIn) {
                    // If session expired, try to reconnect using stored credentials
                    await this.connect();
                }
            } catch (err) {
                console.error("Error checking session before signing multiple:", err);
            }

            // Process each transaction
            const signedTransactions: T[] = [];
            for (const transaction of transactions) {
                if (transaction instanceof Transaction) {
                    const signedTransaction = await this._magic.solana.signTransaction(transaction);
                    signedTransactions.push(signedTransaction as T);
                } else {
                    throw new WalletSignTransactionError('VersionedTransaction not supported by Magic');
                }
            }

            return signedTransactions;
        } catch (error: any) {
            console.error("Error signing transactions:", error);
            throw new WalletSignTransactionError(error?.message, error);
        }
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            console.log("signMessage called");
            if (!this.connected) {
                console.error("Wallet not connected");
                throw new WalletNotConnectedError();
            }
            if (!this._magic || !this._magic.solana) {
                console.error("Magic Solana extension not available");
                throw new WalletSignMessageError('Magic Solana extension not available');
            }

            // Verify connection before signing
            try {
                const isLoggedIn = await this._magic.user.isLoggedIn();
                if (!isLoggedIn) {
                    // If session expired, try to reconnect using stored credentials
                    await this.connect();
                }
            } catch (err) {
                console.error("Error checking session before signing message:", err);
            }

            console.log("Signing message with Magic...");

            // Magic's signMessage might have a different return format
            try {
                // First, try the standard approach
                const signedMessage = await this._magic.solana.signMessage(message);
                if (signedMessage && signedMessage.signature) {
                    return signedMessage.signature;
                } else {
                    // Fallback if the signature format is different
                    return new Uint8Array(signedMessage);
                }
            } catch (err) {
                console.error("Error in signMessage standard approach:", err);

                // Alternative approach using custom Magic API if available
                if (this._magic.solana.signMessage) {
                    const result = await this._magic.solana.signMessage(message);
                    if (result && result.signature) {
                        return result.signature;
                    } else {
                        return new Uint8Array(result);
                    }
                }

                throw err;
            }
        } catch (error: any) {
            console.error("Error signing message:", error);
            throw new WalletSignMessageError(error?.message, error);
        }
    }
}

// Add Magic to the global window object
declare global {
    interface Window {
        magic?: any;
        magicAdapter?: any;
        MagicWalletName?: WalletName<'Magic'>;
    }
}