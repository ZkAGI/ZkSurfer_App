"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Image from "next/image";
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// ---- CONFIG ----
const FACTORY_ADDRESS = "0x60797f6939E406859e1acf94490d191A032E428D";
const INVITE_CODE = "Roar*2025";

const FACTORY_ABI = [
  "function createToken(string name_, string symbol_, uint256 maxSupplyTokens, address recipient) external returns (address)",
  "event TokenCreated(address indexed creator, address indexed tokenAddress, string name, string symbol, uint256 maxSupplyTokens, address recipient)"
];

export default function TokenLaunchpadPage() {
  const [showInviteModal, setShowInviteModal] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

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

      {/* Main Content */}
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <TokenLaunchpad />
      </main>
    </div>
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
            Don't have an invite code? Contact support for access.
          </p>
        </div>
      </div>
    </div>
  );
}

// Token Launchpad Component
function TokenLaunchpad() {
  const { address, isConnected, chain } = useAccount();
  const [networkOk, setNetworkOk] = useState(false);

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [maxSupply, setMaxSupply] = useState("");

  const [status, setStatus] = useState("Connect wallet to begin.");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      checkNetwork();
    } else {
      setNetworkOk(false);
      setStatus("Connect wallet to begin.");
    }
  }, [isConnected, address, chain]);

  async function checkNetwork() {
    try {
      if (!window.ethereum) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId === 84532 || network.chainId === 8453) {
        setNetworkOk(true);
        const networkName = network.chainId === 84532 ? "Base Sepolia Testnet" : "Base Mainnet";
        setStatus(`Connected to ${networkName}. Ready to deploy!`);
      } else {
        setNetworkOk(false);
        setStatus(
          `Wrong network detected (chainId ${network.chainId}). Please switch to Base Sepolia testnet.`
        );
      }
    } catch (err) {
      console.error(err);
      setStatus("Error checking network.");
    }
  }

  async function switchToBaseSepolia() {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed");
        return;
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14a34' }], // 84532 in hex
      });
    } catch (switchError: any) {
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
      } else {
        console.error('Error switching network:', switchError);
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

  return (
    <div className="flex justify-center items-start">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="p-6 sm:p-8 border-b border-gray-800 bg-gradient-to-b from-[#0f172a] to-[#020617]">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              zkTerminal Token Launchpad
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Deploy a fixed-supply ERC20 on Base. 100% of the supply is minted to
              your wallet.
            </p>
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
                  placeholder="Wanderlust Token"
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
                  placeholder="WAND"
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
                      Please switch to Base Sepolia testnet. You can switch using the RainbowKit network selector or click below.
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
                      <code className="text-xs text-blue-300 break-all bg-black/30 px-2 py-1 rounded">
                        {createdToken}
                      </code>
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