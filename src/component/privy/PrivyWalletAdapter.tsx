import { 
  WalletName,
  WalletReadyState,
  WalletNotReadyError,
  WalletConnectionError,
  WalletPublicKeyError,
  WalletSignTransactionError,
  WalletSendTransactionError,
  BaseWalletAdapter,
  SupportedTransactionVersions,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction, SendOptions, TransactionSignature, TransactionVersion } from '@solana/web3.js';

export const PrivyWalletName = "Privy (Email)" as WalletName<"Privy (Email)">;

// Export as a proper class that extends BaseWalletAdapter
export class PrivyWalletAdapter extends BaseWalletAdapter {
  name = PrivyWalletName;
  url = 'https://privy.io';
  icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI4IiBoZWlnaHQ9IjI4IiByeD0iOCIgZmlsbD0iIzE2MEIyNiIvPgo8cGF0aCBkPSJNMTkgOUgxNlYxMkgxOUMxOS41NSAxMiAyMCAxMi40NSAyMCAxM1YxNEMyMCAxNC41NSAxOS41NSAxNSAxOSAxNUgxNlYxOEgxOUMyMS4yMSAxOCAyMyAxNi4yMSAyMyAxNFYxM0MyMyAxMC43OSAyMS4yMSA5IDE5IDlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNOSA5SDEyVjEySDlDOC40NSAxMiA4IDEyLjQ1IDggMTNWMTRDOCAxNC41NSA4LjQ1IDE1IDkgMTVIMTJWMThIOUM2Ljc5IDE4IDUgMTYuMjEgNSAxNFYxM0M1IDEwLjc5IDYuNzkgOSA5IDlaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=';
  
  private _connecting: boolean = false;
  private _publicKey: PublicKey | null = null;
  private _readyState: WalletReadyState = WalletReadyState.Loadable;
  
  // Public properties for PrivyBridge
  _embeddedWallet: any = null;
  _privyWallet: any = null;

  // Required for BaseWalletAdapter - supports both legacy and versioned transactions
  readonly supportedTransactionVersions: SupportedTransactionVersions = new Set(['legacy', 0]);

  constructor() {
    super();
  }

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get readyState(): WalletReadyState {
    return this._readyState;
  }

  setPublicKey(address: string) {
    try {
      this._publicKey = new PublicKey(address);
      console.log('Privy adapter: Public key set to', address);
      
      // If we're in the middle of connecting and just got a public key, complete the connection
      if (this._connecting) {
        this._connecting = false;
        this.emit('connect', this._publicKey);
      }
    } catch (error) {
      console.error('Privy adapter: Invalid public key:', error);
      this._publicKey = null;
    }
  }

  async connect(): Promise<void> {
    console.log('PrivyWalletAdapter.connect() called', {
      connecting: this.connecting,
      publicKey: this.publicKey?.toString()
    });

    // If already connected, just return
    if (this.publicKey) {
      console.log('Already have public key, emitting connect event');
      this.emit('connect', this.publicKey);
      return;
    }

    // If already connecting, wait for it to complete
    if (this.connecting) {
      console.log('Already connecting, waiting...');
      return;
    }

    this._connecting = true;

    try {
      // Clear disconnect flag when connecting
      localStorage.removeItem('privy:manually_disconnected');
      localStorage.removeItem('privy:manually_disconnected:timestamp');
      
      // Store that Privy is connecting
      localStorage.setItem('walletName', PrivyWalletName);
      
      // Check if we already have a public key from PrivyBridge
      if (this._publicKey) {
        console.log('Found existing public key from bridge, connecting immediately');
        this._connecting = false;
        this.emit('connect', this._publicKey);
        return;
      }
      
      // Wait for PrivyBridge to set the public key
      let attempts = 0;
      const maxAttempts = 30;
      
      while (!this._publicKey && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
        
        // Check if public key was set while waiting
        if (this._publicKey) {
          console.log('Public key set during wait, connecting');
          this._connecting = false;
          this.emit('connect', this._publicKey);
          return;
        }
      }

      // If still no public key after waiting, throw error
      if (!this._publicKey) {
        throw new WalletConnectionError('No Privy wallet available. Please login with Privy first.');
      }
      
      // Complete the connection
      this._connecting = false;
      this.emit('connect', this._publicKey);
      
    } catch (error: any) {
      this._connecting = false;
      throw new WalletConnectionError(error?.message || 'Connection failed');
    }
  }

  async forceConnect(publicKey: string): Promise<void> {
    try {
      this._publicKey = new PublicKey(publicKey);
      this._connecting = false;
      this.emit('connect', this._publicKey);
      console.log('PrivyWalletAdapter: Force connected with', publicKey);
    } catch (error) {
      console.error('PrivyWalletAdapter: Force connect failed:', error);
    }
  }

  async disconnect(): Promise<void> {
  console.log('PrivyWalletAdapter: Disconnecting...');
  
  // CRITICAL: Logout from Privy SDK
  try {
    // Access Privy instance if available
    const privyApp = (window as any).__PRIVY_APP__;
    if (privyApp && typeof privyApp.logout === 'function') {
      console.log('[PrivyAdapter] Logging out from Privy SDK...');
      await privyApp.logout();
    }
  } catch (err) {
    console.warn('[PrivyAdapter] Privy logout warning:', err);
  }
  
  this._publicKey = null;
  this._connecting = false;
  this._embeddedWallet = null;

  // Clear all Privy-related localStorage
  if (typeof window !== 'undefined') {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('privy:') || key === 'walletName' || key.startsWith('zk:'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => {
      console.log('Removing:', key);
      localStorage.removeItem(key);
    });
  }

  this.emit('disconnect');
}

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this._embeddedWallet && !this._privyWallet) {
      throw new WalletSignTransactionError('Wallet not connected');
    }

    try {
      const wallet = this._embeddedWallet || this._privyWallet;
      
      if (wallet.signTransaction) {
        return await wallet.signTransaction(transaction);
      }
      
      if (wallet.standardWallet?.signTransaction) {
        return await wallet.standardWallet.signTransaction(transaction);
      }
      
      throw new WalletSignTransactionError('Wallet does not support transaction signing');
    } catch (error: any) {
      throw new WalletSignTransactionError(error?.message || 'Failed to sign transaction');
    }
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (!this._embeddedWallet && !this._privyWallet) {
      throw new WalletSignTransactionError('Wallet not connected');
    }

    try {
      const wallet = this._embeddedWallet || this._privyWallet;
      
      if (wallet.signAllTransactions) {
        return await wallet.signAllTransactions(transactions);
      }
      
      if (wallet.standardWallet?.signAllTransactions) {
        return await wallet.standardWallet.signAllTransactions(transactions);
      }
      
      // Fallback: sign one by one
      const signed: Transaction[] = [];
      for (const tx of transactions) {
        signed.push(await this.signTransaction(tx));
      }
      return signed;
    } catch (error: any) {
      throw new WalletSignTransactionError(error?.message || 'Failed to sign transactions');
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this._embeddedWallet && !this._privyWallet) {
      throw new WalletSignTransactionError('Wallet not connected');
    }

    try {
      const wallet = this._embeddedWallet || this._privyWallet;
      
      if (wallet.signMessage) {
        return await wallet.signMessage(message);
      }
      
      if (wallet.standardWallet?.signMessage) {
        return await wallet.standardWallet.signMessage(message);
      }
      
      throw new WalletSignTransactionError('Wallet does not support message signing');
    } catch (error: any) {
      throw new WalletSignTransactionError(error?.message || 'Failed to sign message');
    }
  }

  async sendTransaction(
    transaction: Transaction,
    connection: any,
    options?: SendOptions
  ): Promise<TransactionSignature> {
    if (!this._embeddedWallet && !this._privyWallet) {
      throw new WalletSendTransactionError('Wallet not connected');
    }

    try {
      const wallet = this._embeddedWallet || this._privyWallet;
      
      if (wallet.sendTransaction) {
        return await wallet.sendTransaction(transaction, connection, options);
      }
      
      if (wallet.standardWallet?.sendTransaction) {
        return await wallet.standardWallet.sendTransaction(transaction, connection, options);
      }
      
      // Fallback: sign and send manually
      const signed = await this.signTransaction(transaction);
      return await connection.sendRawTransaction(signed.serialize(), options);
    } catch (error: any) {
      throw new WalletSendTransactionError(error?.message || 'Failed to send transaction');
    }
  }
}

// Default export for compatibility
export default PrivyWalletAdapter;