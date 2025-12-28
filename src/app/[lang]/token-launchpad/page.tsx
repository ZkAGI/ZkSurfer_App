"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Image from "next/image";
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ---- ZUSTAND STORE ----
interface TokenData {
  network: string;
  tokenAddress: string;
  name: string;
  symbol: string;
  maxSupplyTokens: string;
  recipient: string;
  chainId?: number;
}

interface TokenStore {
  tokenData: TokenData | null;
  setTokenData: (data: TokenData) => void;
  clearTokenData: () => void;
}

const useTokenStore = create<TokenStore>()(
  persist(
    (set) => ({
      tokenData: null,
      setTokenData: (data) => set({ tokenData: data }),
      clearTokenData: () => set({ tokenData: null }),
    }),
    {
      name: 'zkagi-token-storage',
    }
  )
);

// ---- CONFIG ----
const FACTORY_ADDRESS = "0x0f66Eb5f5E02Fd591BfE5740176Eeb0658b9B549";
const INVITE_CODE = "Roar*2025";

const FACTORY_ABI = [
  "function createToken(string name_, string symbol_, uint256 maxSupplyTokens, address recipient) external returns (address)",
  "event TokenCreated(address indexed creator, address indexed tokenAddress, string name, string symbol, uint256 maxSupplyTokens, address recipient)"
];

type TabType = 'launch' | 'verification' | 'update';

export default function TokenLaunchpadPage() {
  const [showInviteModal, setShowInviteModal] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('launch');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if user has already entered the code (using localStorage)
  useEffect(() => {
    const authorized = localStorage.getItem("zkagi_authorized");
    if (authorized === "true") {
      setIsAuthorized(true);
      setShowInviteModal(false);
    }
  }, []);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode === INVITE_CODE) {
      setIsAuthorized(true);
      setShowInviteModal(false);
      localStorage.setItem("zkagi_authorized", "true");
      setInviteError("");
    } else {
      setInviteError("Invalid invite code. Please try again.");
    }
  };

  if (!isAuthorized || showInviteModal) {
    return (
      <InviteModal
        inviteCode={inviteCode}
        setInviteCode={setInviteCode}
        inviteError={inviteError}
        handleInviteSubmit={handleInviteSubmit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <Header />

      {/* Main Content with Side Nav */}
      <div className="flex">
        {/* Side Navigation - Desktop */}
        <aside className="hidden lg:block w-64 border-r border-gray-800 min-h-[calc(100vh-64px)] bg-[#0f172a]">
          <SideNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </aside>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Side Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
            <aside 
              className="absolute left-0 top-0 w-64 h-full bg-[#0f172a] border-r border-gray-800 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <span className="text-white font-semibold">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SideNav 
                activeTab={activeTab} 
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }} 
              />
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          {activeTab === 'launch' && <TokenLaunchpad />}
          {activeTab === 'verification' && <TokenVerification />}
          {activeTab === 'update' && <TokenUpdate />}
        </main>
      </div>
    </div>
  );
}

// Side Navigation Component
function SideNav({ activeTab, setActiveTab }: { activeTab: TabType; setActiveTab: (tab: TabType) => void }) {
  const navItems: { id: TabType; label: string; icon: JSX.Element }[] = [
    {
      id: 'launch',
      label: 'Token Launch',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 'verification',
      label: 'Token Verification',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'update',
      label: 'Token Update',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="p-4 space-y-2">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
            activeTab === item.id
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          {item.icon}
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// Header Component
function Header() {
  const { chain } = useAccount();

  return (
    <header className="border-b border-gray-800 bg-[#020617]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/images/logo.svg"
                alt="ZkAGI Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">
              ZkAGI
            </span>
          </div>

          {/* Network Indicator + Wallet Connect */}
          <div className="flex items-center gap-3">
            {/* Network Indicator Badge */}
            {chain && (
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                chain.id === 84532 
                  ? 'bg-green-900/30 text-green-400 border border-green-700/50' 
                  : chain.id === 8453
                  ? 'bg-blue-900/30 text-blue-400 border border-blue-700/50'
                  : 'bg-red-900/30 text-red-400 border border-red-700/50'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  chain.id === 84532 ? 'bg-green-400' : chain.id === 8453 ? 'bg-blue-400' : 'bg-red-400'
                }`} />
                {chain.id === 84532 ? 'Base Sepolia' : chain.id === 8453 ? 'Base' : chain.name}
              </div>
            )}

            {/* RainbowKit Connect Button */}
            <ConnectButton
              accountStatus="address"
              chainStatus="icon"
              showBalance={false}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

// Invite Code Modal Component
function InviteModal({
  inviteCode,
  setInviteCode,
  inviteError,
  handleInviteSubmit,
}: {
  inviteCode: string;
  setInviteCode: (code: string) => void;
  inviteError: string;
  handleInviteSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-16 h-16 mb-4">
            <Image
              src="/images/logo.svg"
              alt="ZkAGI Logo"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to ZkAGI</h2>
          <p className="text-gray-400 text-sm text-center">
            Enter your invite code to access the Token Launchpad
          </p>
        </div>

        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="inviteCode"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Invite Code
            </label>
            <input
              type="text"
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter your invite code"
              className={`w-full px-4 py-3 bg-[#020617] border ${
                inviteError ? "border-red-500" : "border-gray-700"
              } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              autoFocus
            />
            {inviteError && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {inviteError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0f172a]"
          >
            Continue
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            Don&apos;t have an invite code? Contact support for access.
          </p>
        </div>
      </div>
    </div>
  );
}

// Token Launchpad Component
function TokenLaunchpad() {
  const { address, isConnected, chain } = useAccount();
  const { setTokenData } = useTokenStore();
  const [networkOk, setNetworkOk] = useState(false);

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [maxSupply, setMaxSupply] = useState("");

  const [status, setStatus] = useState("Connect wallet to begin.");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // Check network automatically when chain changes
  useEffect(() => {
    if (isConnected && address && chain) {
      // Use chain object from wagmi directly
      if (chain.id === 84532 || chain.id === 8453) {
        setNetworkOk(true);
        const networkName = chain.id === 84532 ? "Base Sepolia Testnet" : "Base Mainnet";
        setStatus(`Connected to ${networkName}. Ready to deploy!`);
      } else {
        setNetworkOk(false);
        setStatus(
          `Wrong network detected (${chain.name}, chainId ${chain.id}). Please switch to Base Sepolia testnet.`
        );
      }
    } else if (isConnected && address && !chain) {
      setNetworkOk(false);
      setStatus("Network not detected. Please connect your wallet.");
    } else {
      setNetworkOk(false);
      setStatus("Connect wallet to begin.");
    }
  }, [isConnected, address, chain]);

  async function switchToBaseSepolia() {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed");
        return;
      }

      // Try to switch to Base Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14a34' }], // 84532 in hex
      });
      
      // Give it a moment to update
      setTimeout(() => {
        if (chain?.id === 84532) {
          setNetworkOk(true);
          setStatus("Successfully switched to Base Sepolia Testnet. Ready to deploy!");
        }
      }, 1000);
    } catch (switchError: any) {
      // If the chain hasn't been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x14a34',
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          alert('Failed to add Base Sepolia network');
        }
      } else if (switchError.code === 4001) {
        // User rejected the request
        console.log('User rejected network switch');
      } else {
        console.error('Error switching network:', switchError);
        alert('Failed to switch network. Please try using the RainbowKit network selector.');
      }
    }
  }

  async function handleCreateToken(e: React.FormEvent) {
    e.preventDefault();
    if (!isConnected || !address) {
      alert("Connect wallet first.");
      return;
    }
    if (!networkOk) {
      alert("Please switch to Base Sepolia or Base network.");
      return;
    }
    if (!name || !symbol || !maxSupply) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Preparing transaction...");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const factory = new ethers.Contract(
        FACTORY_ADDRESS,
        FACTORY_ABI,
        signer
      );

      const maxSupplyNumber = ethers.BigNumber.from(maxSupply);

      const tx = await factory.createToken(name, symbol, maxSupplyNumber, address);

      setStatus(`Tx sent: ${tx.hash}. Waiting for confirmation...`);

      const receipt = await tx.wait();

      let newTokenAddress: string | null = null;
      if (receipt.logs && receipt.logs.length > 0) {
        for (const log of receipt.logs) {
          try {
            const parsed = factory.interface.parseLog(log);
            if (parsed.name === "TokenCreated") {
              newTokenAddress = parsed.args.tokenAddress;
              break;
            }
          } catch {
            // ignore logs that don't match
          }
        }
      }

      if (!newTokenAddress) {
        setStatus(
          "Token deployed but TokenCreated event not parsed. Check tx on BaseScan."
        );
      } else {
        setStatus(`Token created at address: ${newTokenAddress}`);
        setCreatedToken(newTokenAddress);

        // Save to Zustand store
        const networkName = chain?.id === 84532 ? "baseSepolia" : "base";
        setTokenData({
          network: networkName,
          tokenAddress: newTokenAddress,
          name: name,
          symbol: symbol,
          maxSupplyTokens: maxSupply,
          recipient: address,
          chainId: chain?.id,
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatus(
        "Error creating token: " + (err.data?.message || err.message || err)
      );
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex justify-center items-start">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="p-6 sm:p-8 border-b border-gray-800 bg-gradient-to-b from-[#0f172a] to-[#020617]">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Token Minter
            </h1>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleCreateToken} className="space-y-5">
              {/* Token Name */}
              <div>
                <label
                  htmlFor="tokenName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Token Name
                </label>
                <input
                  type="text"
                  id="tokenName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Test Token"
                  className="w-full px-4 py-3 bg-[#020617] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Symbol */}
              <div>
                <label
                  htmlFor="symbol"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Symbol
                </label>
                <input
                  type="text"
                  id="symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="TEST"
                  className="w-full px-4 py-3 bg-[#020617] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                />
              </div>

              {/* Max Supply */}
              <div>
                <label
                  htmlFor="maxSupply"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Max Supply (whole tokens)
                </label>
                <input
                  type="number"
                  id="maxSupply"
                  min="1"
                  value={maxSupply}
                  onChange={(e) => setMaxSupply(e.target.value)}
                  placeholder="1000000"
                  className="w-full px-4 py-3 bg-[#020617] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="mt-2 text-xs text-gray-500">
                  On-chain supply = this × 10¹⁸ (18 decimals)
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isConnected || !networkOk}
                className={`w-full py-3.5 px-6 rounded-lg font-semibold text-base transition-all duration-200 ${
                  loading || !isConnected || !networkOk
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-500/25"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Token...
                  </span>
                ) : (
                  "Create Token"
                )}
              </button>
            </form>

            {/* Network Warning Banner */}
            {isConnected && !networkOk && (
              <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-200 mb-2">
                      Wrong Network Detected
                    </p>
                    <p className="text-xs text-yellow-300/80 mb-3">
                      {chain?.name ? `You are on ${chain.name}. ` : ''}
                      Switch to Base Sepolia testnet using the network selector in the top-right corner (click the network badge) or use the button below.
                    </p>
                    <button
                      onClick={switchToBaseSepolia}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Switch to Base Sepolia
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Status Message */}
            <div className="mt-6 p-4 bg-[#020617] border border-gray-800 rounded-lg">
              <p className="text-sm text-gray-400">{status}</p>
            </div>

            {/* Created Token Info */}
            {createdToken && (
              <div className="mt-6 p-5 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-2">
                      Token Successfully Created!
                    </p>
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">Token Address:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-blue-300 break-all bg-black/30 px-2 py-1 rounded overflow-wrap-anywhere max-w-full">
                          {createdToken}
                        </code>
                        <button
                          onClick={() => copyToClipboard(createdToken)}
                          className="flex-shrink-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          title="Copy address"
                        >
                          {showCopySuccess ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Important Notice */}
                    <div className="mb-3 p-3 bg-orange-900/20 border border-orange-700/50 rounded">
                      <div className="flex gap-2">
                        <svg className="w-5 h-5 text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-xs font-medium text-orange-200 mb-1">Important!</p>
                          <p className="text-xs text-orange-300/80">
                            Save this token address securely. You&apos;ll need it for token verification in the next step.
                          </p>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`https://${chain?.id === 84532 ? 'sepolia.' : ''}basescan.org/token/${createdToken}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View on BaseScan
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Token Verification Component
function TokenVerification() {
  const { address, isConnected, chain } = useAccount();
  const { tokenData } = useTokenStore();

  const [network, setNetwork] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [maxSupplyTokens, setMaxSupplyTokens] = useState("");
  const [recipient, setRecipient] = useState("");

  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);

  // Pre-fill form with data from Zustand store
  useEffect(() => {
    if (tokenData) {
      setNetwork(tokenData.network);
      setTokenAddress(tokenData.tokenAddress);
      setName(tokenData.name);
      setSymbol(tokenData.symbol);
      setMaxSupplyTokens(tokenData.maxSupplyTokens);
      setRecipient(tokenData.recipient);
    } else if (address) {
      setRecipient(address);
    }
  }, [tokenData, address]);

  // Update network based on connected chain
  useEffect(() => {
    if (chain) {
      const networkName = chain.id === 84532 ? "baseSepolia" : chain.id === 8453 ? "base" : "";
      if (networkName && !network) {
        setNetwork(networkName);
      }
    }
  }, [chain, network]);

  // Update recipient when wallet connects
  useEffect(() => {
    if (address && !recipient) {
      setRecipient(address);
    }
  }, [address, recipient]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!network || !tokenAddress || !name || !symbol || !maxSupplyTokens || !recipient) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      setVerificationResult(null);

      const response = await fetch('https://zynapse.zkagi.ai/v1/verify/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          network,
          tokenAddress,
          name,
          symbol,
          maxSupplyTokens: parseInt(maxSupplyTokens),
          recipient,
        }),
      });

      const data = await response.json();
      setVerificationResult(data);

      if (data.status === 'ok') {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      }
    } catch (err: any) {
      console.error(err);
      setVerificationResult({
        status: 'error',
        message: err.message || 'Failed to verify token',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start">
      <div className="w-full max-w-2xl">
        {/* Success Toast */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">Congratulations!</p>
              <p className="text-sm">Your token verification is complete.</p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="p-6 sm:p-8 border-b border-gray-800 bg-gradient-to-b from-[#0f172a] to-[#020617]">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Token Verification
            </h1>
            <p className="text-gray-400 text-sm">
              Verify your token contract on the blockchain explorer
            </p>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleVerify} className="space-y-5">
              {/* Network */}
              <div>
                <label htmlFor="network" className="block text-sm font-medium text-gray-300 mb-2">
                  Network
                </label>
                <select
                  id="network"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full px-4 py-3 bg-[#020617] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Network</option>
                  <option value="baseSepolia">Base Sepolia</option>
                  <option value="base">Base Mainnet</option>
                </select>
              </div>

              {/* Token Address */}
              <div>
                <label htmlFor="tokenAddress" className="block text-sm font-medium text-gray-300 mb-2">
                  Token Address
                </label>
                <input
                  type="text"
                  id="tokenAddress"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-[#020617] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm break-all"
                />
              </div>

              {/* Token Name */}
              <div>
                <label htmlFor="verifyName" className="block text-sm font-medium text-gray-300 mb-2">
                  Token Name
                </label>
                <input
                  type="text"
                  id="verifyName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Test Token"
                  className="w-full px-4 py-3 bg-[#020617] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Symbol */}
              <div>
                <label htmlFor="verifySymbol" className="block text-sm font-medium text-gray-300 mb-2">
                  Symbol
                </label>
                <input
                  type="text"
                  id="verifySymbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="TEST"
                  className="w-full px-4 py-3 bg-[#020617] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                />
              </div>

              {/* Max Supply */}
              <div>
                <label htmlFor="verifyMaxSupply" className="block text-sm font-medium text-gray-300 mb-2">
                  Max Supply (whole tokens)
                </label>
                <input
                  type="number"
                  id="verifyMaxSupply"
                  min="1"
                  value={maxSupplyTokens}
                  onChange={(e) => setMaxSupplyTokens(e.target.value)}
                  placeholder="1000000"
                  className="w-full px-4 py-3 bg-[#020617] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Recipient */}
              <div>
                <label htmlFor="recipient" className="block text-sm font-medium text-gray-300 mb-2">
                  Recipient (Wallet Address)
                </label>
                <input
                  type="text"
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-[#020617] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm break-all"
                />
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || !isConnected}
                className={`w-full py-3.5 px-6 rounded-lg font-semibold text-base transition-all duration-200 ${
                  loading || !isConnected
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify Token"
                )}
              </button>
            </form>

            {/* Verification Result */}
            {verificationResult && (
              <div className={`mt-6 p-5 rounded-lg border ${
                verificationResult.status === 'ok' 
                  ? 'bg-green-900/20 border-green-700/50' 
                  : 'bg-red-900/20 border-red-700/50'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {verificationResult.status === 'ok' ? (
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium mb-2 ${
                      verificationResult.status === 'ok' ? 'text-green-200' : 'text-red-200'
                    }`}>
                      {verificationResult.status === 'ok' ? 'Verification Successful!' : 'Verification Failed'}
                    </p>
                    <p className={`text-xs mb-3 ${
                      verificationResult.status === 'ok' ? 'text-green-300/80' : 'text-red-300/80'
                    }`}>
                      {verificationResult.message}
                    </p>
                    {verificationResult.stdout && (
                      <div className="bg-black/30 p-3 rounded">
                        <p className="text-xs text-gray-300 whitespace-pre-wrap break-words font-mono overflow-wrap-anywhere">
                          {verificationResult.stdout}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            {!verificationResult && (
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-xs text-blue-300">
                      {tokenData 
                        ? "Your token data has been pre-filled from the previous step. Verify the information and click Verify Token."
                        : "Fill in all the token details to verify your contract on the blockchain explorer."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Token Update Component (Documentation with 6 images)
function TokenUpdate() {
  const { chain } = useAccount();
  const { tokenData } = useTokenStore();

  const getBaseScanUrl = () => {
    const baseUrl = chain?.id === 84532 ? 'https://sepolia.basescan.org' : 'https://basescan.org';
    if (tokenData?.tokenAddress) {
      return `${baseUrl}/token/${tokenData.tokenAddress}`;
    }
    return baseUrl;
  };

  return (
    <div className="flex justify-center items-start">
      <div className="w-full max-w-5xl">
        {/* Main Card */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="p-6 sm:p-8 border-b border-gray-800 bg-gradient-to-b from-[#0f172a] to-[#020617]">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Token Update Guide
            </h1>
            <p className="text-gray-400 text-sm">
              Complete step-by-step guide to update your token information on BaseScan
            </p>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Prerequisites Section */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-blue-200 mb-2">Important Prerequisites</h3>
                  <ul className="space-y-2 text-sm text-blue-300/90">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Your token must be <strong>verified on BaseScan</strong> (green checkmark visible)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Complete the <strong>Token Verification</strong> step before proceeding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Have your token contract address ready</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Updates can only be submitted <strong>once verification is complete</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Access Button */}
            {tokenData?.tokenAddress && (
              <div className="flex justify-center">
                <a
                  href={getBaseScanUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Your Token on BaseScan
                </a>
              </div>
            )}

            {/* Step-by-Step Guide */}
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="border-l-4 border-blue-600 pl-6 py-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-white">Navigate to Your Token Page</h3>
                </div>
                <div className="space-y-3 text-gray-300">
                  <p className="text-sm">
                    Go to your token&quot;s page on BaseScan by following this URL structure:
                  </p>
                  <div className="bg-[#020617] border border-gray-700 rounded-lg p-4">
                    <code className="text-sm text-blue-300 break-all">
                      {chain?.id === 84532 ? 'https://sepolia.basescan.org' : 'https://basescan.org'}/token/[YOUR_TOKEN_ADDRESS]
                    </code>
                  </div>
                  <p className="text-sm">
                    Once on your token page, verify that your contract shows a <strong className="text-green-400">green checkmark (✓)</strong> indicating successful verification.
                  </p>
                  {/* Image 1 */}
                  <div className="border border-gray-700 rounded-lg overflow-hidden shadow-lg">
                    <img
                      src="/images/token-update/Doc1.png"
                      alt="BaseScan Token Page"
                      className="w-full h-auto"
                    />
                    <div className="bg-gray-800/50 p-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400 text-center">
                        Step 1: Your token page on BaseScan showing verified contract
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="border-l-4 border-blue-600 pl-6 py-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-white">Access Verified Addresses</h3>
                </div>
                <div className="space-y-3 text-gray-300">
                  <p className="text-sm">
                    Click on your profile/account menu in the top-right corner of BaseScan, then select <strong>&quot;Verified Address&quot;</strong> from the dropdown menu.
                  </p>
                  <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-orange-300">
                        <strong>Note:</strong> You need to be logged into your BaseScan account. If you don&quot;t have an account, create one first.
                      </p>
                    </div>
                  </div>
                  {/* Images 2 & 3 - Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-700 rounded-lg overflow-hidden shadow-lg">
                      <img
                        src="/images/token-update/Doc2.png"
                        alt="Verified Addresses Menu"
                        className="w-full h-auto"
                      />
                      <div className="bg-gray-800/50 p-3 border-t border-gray-700">
                        <p className="text-xs text-gray-400 text-center">
                          Step 2a: Access Verified Address from menu
                        </p>
                      </div>
                    </div>
                    <div className="border border-gray-700 rounded-lg overflow-hidden shadow-lg">
                      <img
                        src="/images/token-update/Doc3.png"
                        alt="Verified Addresses Page"
                        className="w-full h-auto"
                      />
                      <div className="bg-gray-800/50 p-3 border-t border-gray-700">
                        <p className="text-xs text-gray-400 text-center">
                          Step 2b: Verified Addresses page
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border-l-4 border-blue-600 pl-6 py-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-white">Verify Address Ownership</h3>
                </div>
                <div className="space-y-3 text-gray-300">
                  <p className="text-sm">
                    Click the <strong>&quot;Add Address&quot;</strong> or <strong>&quot;Verify Address&quot;</strong> button, then enter your token contract address in the form that appears.
                  </p>
                  <div className="bg-[#020617] border border-gray-700 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-medium text-gray-400">Your Token Address:</p>
                    {tokenData?.tokenAddress ? (
                      <code className="text-sm text-blue-300 break-all block bg-black/30 p-2 rounded overflow-wrap-anywhere max-w-full">
                        {tokenData.tokenAddress}
                      </code>
                    ) : (
                      <p className="text-xs text-gray-500 italic">Complete token creation first to see your address here</p>
                    )}
                  </div>
                  <p className="text-sm">
                    Click <strong>&quot;Continue&quot;</strong> to proceed with the verification process.
                  </p>
                  {/* Image 4 */}
                  <div className="border border-gray-700 rounded-lg overflow-hidden shadow-lg">
                    <img
                      src="/images/token-update/Doc4.png"
                      alt="Verify Ownership Form"
                      className="w-full h-auto"
                    />
                    <div className="bg-gray-800/50 p-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400 text-center">
                        Step 3: Enter your token contract address
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="border-l-4 border-green-600 pl-6 py-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full font-bold text-sm">
                    4
                  </div>
                  <h3 className="text-xl font-semibold text-white">Update Token Information</h3>
                </div>
                <div className="space-y-3 text-gray-300">
                  <p className="text-sm">
                    After successful verification, you&quot;ll see a confirmation message with several options. Click on <strong>&quot;Update Token Information&quot;</strong>.
                  </p>
                  <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-green-300">
                        <strong>Success!</strong> Once verified, you&quot;ll also see options to &quot;Add Name Tag&quot; and &quot;Add Project Label(s)&quot;.
                      </p>
                    </div>
                  </div>
                  {/* Image 5 */}
                  <div className="border border-gray-700 rounded-lg overflow-hidden shadow-lg">
                    <img
                      src="/images/token-update/Doc5.png"
                      alt="Verification Success"
                      className="w-full h-auto"
                    />
                    <div className="bg-gray-800/50 p-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400 text-center">
                        Step 4: Click &quot;Update Token Information&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="border-l-4 border-green-600 pl-6 py-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full font-bold text-sm">
                    5
                  </div>
                  <h3 className="text-xl font-semibold text-white">Fill Out the Application Form</h3>
                </div>
                <div className="space-y-3 text-gray-300">
                  <p className="text-sm">
                    Complete the <strong>Token Update Application Form</strong> with all relevant information about your token:
                  </p>
                  <div className="bg-[#020617] border border-gray-700 rounded-lg p-5 space-y-3">
                    <h4 className="font-semibold text-white text-sm mb-3">Required Information:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">✓</span>
                        <div>
                          <strong className="text-gray-200">Request Type:</strong>
                          <p className="text-gray-400 text-xs mt-0.5">Select &quot;New/First Time Token Update&quot;</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">✓</span>
                        <div>
                          <strong className="text-gray-200">Comment/Message:</strong>
                          <p className="text-gray-400 text-xs mt-0.5">Describe your token and update request</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">✓</span>
                        <div>
                          <strong className="text-gray-200">Token Contract Address:</strong>
                          <p className="text-gray-400 text-xs mt-0.5">Your verified token address</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">✓</span>
                        <div>
                          <strong className="text-gray-200">Requester Name:</strong>
                          <p className="text-gray-400 text-xs mt-0.5">Your name or organization name</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">✓</span>
                        <div>
                          <strong className="text-gray-200">Requester Email Address:</strong>
                          <p className="text-gray-400 text-xs mt-0.5">Official project email (preferably from your domain)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-yellow-300">
                        <strong>Important:</strong> Make sure all links you provide are working and safe. Use an official email from your project&quot;s domain for better verification.
                      </p>
                    </div>
                  </div>
                  {/* Image 6 */}
                  <div className="border border-gray-700 rounded-lg overflow-hidden shadow-lg">
                    <img
                      src="/images/token-update/Doc6.png"
                      alt="Application Form"
                      className="w-full h-auto"
                    />
                    <div className="bg-gray-800/50 p-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400 text-center">
                        Step 5: Complete the Token Update Application Form
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">
                    After completing the form, submit your application. BaseScan will review your request and update your token information accordingly.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Tips Section */}
            <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-purple-200 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Pro Tips
              </h3>
              <ul className="space-y-2 text-sm text-purple-300/90">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">💡</span>
                  <span>Complete token verification before attempting to update information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">💡</span>
                  <span>Use official project email addresses for faster approval</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">💡</span>
                  <span>Ensure all provided links (website, social media) are active and secure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">💡</span>
                  <span>Save your token address from the Token Launch section for easy reference</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">💡</span>
                  <span>Updates typically take 1-3 business days to be reviewed and approved</span>
                </li>
              </ul>
            </div>

            {/* Support Section */}
            <div className="border-t border-gray-800 pt-6">
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-400">
                  Need help? Check out BaseScan&quot;s documentation or contact their support team.
                </p>
                <div className="flex justify-center gap-4">
                  <a
                    href="https://docs.basescan.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Documentation
                  </a>
                  <a
                    href="https://basescan.org/contactus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}