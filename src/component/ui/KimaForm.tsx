"use client";

import React, { useState, useEffect, useRef } from "react";
import { Connection, PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    createApproveInstruction,
    TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { BrowserProvider, Contract } from "ethers";
import TronWeb from "tronweb";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { toast } from "sonner";
import CircularCountdown from "./CircularCountdown";

interface UserData {
    originChain: string;
    targetAddress: string;
    targetChain: string;
    symbol: string;
    amount: string;
    deductFee: boolean;
}

interface Fees {
    totalFee: number;
    totalFeeUsd: number;
    allowanceAmount: number;
    decimals: number;
    deductFee: boolean;
    submitAmount: number;
}

interface Chain {
    id: string;
    name: string;
    symbol: string;
    tokens: Array<{ id: string; symbol: string; address: string }>;
    disabled: boolean;
    isEvm: boolean;
}

const CHAIN_NAMES = {
    Ethereum: "ETH",
    Polygon: "POL",
    "Avalanche-C": "AVX",
    Arbitrum: "ARB",
    Avalanche: "AVAX",
    Base: "BASE",
    "Binance Smart Chain": "BSC",
    Optimism: "OPT",
    Solana: "SOL",
    Tron: "TRX",
} as const;

interface KimaTransferAgentProps {
    onTransferSuccess?: () => void; // optional callback
}

const KimaTransferAgent: React.FC<KimaTransferAgentProps> = ({ onTransferSuccess }) => {
    const [userData, setUserData] = useState<UserData>({
        originChain: "Ethereum",
        targetAddress: "",
        targetChain: "Solana",
        symbol: "",
        amount: "",
        deductFee: false,
    });
    const [status, setStatus] = useState<string>("");
    const [fees, setFees] = useState<Fees>({
        totalFee: 0,
        totalFeeUsd: 0,
        allowanceAmount: 0,
        decimals: 18,
        deductFee: false,
        submitAmount: 0,
    });
    const [chains, setChains] = useState<Chain[]>([]);
    const [userBalance, setUserBalance] = useState<string | null>(null);
    const [showWalletPopup, setShowWalletPopup] = useState<boolean>(false);
    // Transfer progress state
    const [transferLoading, setTransferLoading] = useState<boolean>(false);
    const [transferStatus, setTransferStatus] = useState<{ pullhash: string; txstatus: string } | null>(null);
    // Countdown timer state (15 minutes = 900 seconds)
    const [countdown, setCountdown] = useState<number>(15 * 60);
    const totalTime = 15 * 60;
    // A ref to store the new tab window if we open one
    const newTabRef = useRef<Window | null>(null);
    // Ref to ensure the timer is started only once per transfer
    const timerStartedRef = useRef<boolean>(false);

    // const [kimaPools, setKimaPools] = useState<Record<string, string>>({});

    // pull in your CHAIN_NAMES values as a type
    type PoolKey = typeof CHAIN_NAMES[keyof typeof CHAIN_NAMES];
    // PoolKey is now the union "ETH"|"POL"|"AVX"|…|"SOL"|"TRX"

    // rename the state var to KIMA_POOLS so you can dot-access
    const [KIMA_POOLS, setKimaPools] = useState<Record<PoolKey, string>>(
        {} as Record<PoolKey, string>
    );

    const CHAIN_ID: Record<string, string> = {
        Ethereum: "0x1",      // 1
        Polygon: "0x89",     // 137
        Arbitrum: "0xa4b1",   // 42161
        Optimism: "0xa",      // 10
        Base: "0x2105",   // 8453
        "Binance Smart Chain": "0x38",     // 56
        Avalanche: "0xa86a",   // 43114
        // …add more if you support them
    }


    async function ensureCorrectNetwork(chainName: string) {
        const ethereum = (window as any).ethereum
        if (!ethereum) {
            throw new Error("No EVM wallet found on window.ethereum")
        }
        const chainId = CHAIN_ID[chainName]
        if (!chainId) {
            throw new Error(`I don’t know the chainId for "${chainName}"`)
        }

        try {
            // ask the wallet to switch
            await ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId }]
            })
        } catch (switchError: any) {
            // if the chain isn’t added at all, you need to add it:
            if (switchError.code === 4902) {
                await ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId,
                            chainName,
                            rpcUrls: ["https://…rpc.url.for." + chainName.toLowerCase()],
                            nativeCurrency: { name: chainName, symbol: chainName.slice(0, 3), decimals: 18 },
                            blockExplorerUrls: ["https://explorer." + chainName.toLowerCase() + ".io"]
                        }
                    ]
                })
            } else {
                throw switchError
            }
        }
    }

    useEffect(() => {
        async function loadPools() {
            try {
                const res = await fetch("http://103.231.86.182:3001/chains/pool", {
                    headers: { accept: "application/json" },
                });
                const pools: Array<{ chainName: string; poolAddress: string }> = await res.json();
                // reduce into { [chainName]: poolAddress }
                const map = pools.reduce((acc, { chainName, poolAddress }) => {
                    acc[chainName] = poolAddress;
                    return acc;
                }, {} as Record<string, string>);
                setKimaPools(map);
            } catch (err) {
                console.error("Failed to fetch pool addresses", err);
            }
        }
        loadPools();
    }, []);

    // Remove transferStatus from dependency so that the timer is not reset by polling updates
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;
        if (transferLoading && !timerStartedRef.current) {
            timerStartedRef.current = true; // mark timer as started
            setCountdown(totalTime); // initialize countdown
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        if (timer) clearInterval(timer);
                        // Timer has reached 0; if the transfer is not complete, open a new tab
                        if (!transferStatus || transferStatus.txstatus.toLowerCase() !== "completed") {
                            // newTabRef.current = window.open(window.location.origin + "/", "_blank");
                            toast.info("We will notify you once transaction is complete, it's taking a bit longer than expected.");
                            setTransferLoading(false); // close the modal in the current tab
                            // disconnect();
                            if (onTransferSuccess) onTransferSuccess();
                        }
                        // Reset timer ref for future transfers
                        timerStartedRef.current = false;
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [transferLoading]); // note: transferStatus removed from dependencies

    // Disconnect wallet via wagmi
    const { disconnect } = useDisconnect();
    const { address } = useAccount();

    // const KIMA_POOLS = {
    //     EVM: "0x948627f5c0352f320b284a2a9dbb92933866995d",
    //     Solana: "E1ARyS9m5ZWSxhQbmrdVg2oycktRSHqzDRKkZZgrfr9A",
    //     Tron: "TQ3qmAgUgMwrY9prMiHLZmF43G4Jk8bxNF",
    // };

    // Address validation functions
    const isValidEthereumAddress = (address: string): boolean =>
        /^0x[a-fA-F0-9]{40}$/.test(address);

    const isValidSolanaAddress = (address: string): boolean => {
        try {
            new PublicKey(address);
            return true;
        } catch {
            return false;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        if (name === "targetAddress" && value) {
            if (userData.targetChain === "Solana" && !isValidSolanaAddress(value)) {
                setStatus("Error: Target address must be a valid Solana address.");
                return;
            }
            if (
                ["Ethereum", "Polygon", "Avalanche-C", "Tron"].includes(userData.targetChain) &&
                !isValidEthereumAddress(value)
            ) {
                setStatus("Error: Target address must be a valid Ethereum/Tron address (0x...).");
                return;
            }
        }
        setUserData((prev) => ({ ...prev, [name]: newValue }));
        setStatus("");
    };

    // Fetch chains from API
    useEffect(() => {
        const fetchChains = async () => {
            try {
                const response = await fetch('http://103.231.86.182:3001/chains/chain', {
                    headers: { accept: "application/json" },
                });
                const data = await response.json();
                console.log('data chains', data)
                if (data.Chain && Array.isArray(data.Chain)) {
                    // Update chains: disable Berachain, Tron, and Solana
                    const updatedChains = data.Chain.map((chain: Chain) => {
                        if (["Berachain", "Tron"].includes(chain.name)) {
                            //Solana
                            return { ...chain, disabled: true };
                        }
                        return chain;
                    });
                    setChains(updatedChains);
                    const defaultChain = updatedChains.find(
                        (chain: any) => chain.name === userData.originChain
                    );
                    if (defaultChain && defaultChain.tokens.length > 0) {
                        setUserData((prev) => ({
                            ...prev,
                            symbol: defaultChain.tokens[0].symbol,
                        }));
                    }
                } else {
                    throw new Error("Invalid chain data from API.");
                }
                // if (data.Chain && Array.isArray(data.Chain)) {
                //     setChains(data.Chain);
                //     const defaultChain = data.Chain.find(
                //         (chain: any) => chain.name === userData.originChain
                //     );
                //     if (defaultChain && defaultChain.tokens.length > 0) {
                //         setUserData((prev) => ({
                //             ...prev,
                //             symbol: defaultChain.tokens[0].symbol,
                //         }));
                //     }
                // } else {
                //     throw new Error("Invalid chain data from API.");
                // }
            } catch (error) {
                console.error("Error fetching chains:", error);
                setStatus("Error fetching chains. Using defaults.");
                // setChains([
                //     {
                //         id: "1",
                //         name: "Ethereum",
                //         symbol: "ETH",
                //         tokens: [
                //             {
                //                 id: "1",
                //                 symbol: "USDK",
                //                 address: "0x5FF59Bf2277A1e6bA9bB8A38Ea3F9ABfd3d9345a",
                //             },
                //             {
                //                 id: "2",
                //                 symbol: "WBTC",
                //                 address: "0x5703992Cd91cAB655f2BF3EcbD4cD22e3c75832D",
                //             },
                //         ],
                //         disabled: false,
                //         isEvm: true,
                //     },
                //     {
                //         id: "2",
                //         name: "Arbitrum",
                //         symbol: "ARB",
                //         tokens: [
                //             {
                //                 id: "0",
                //                 symbol: "USDK",
                //                 address: "YOUR_ARBITRUM_TOKEN_ADDRESS",
                //             },
                //         ],
                //         disabled: false,
                //         isEvm: true,
                //     },
                //     {
                //         id: "3",
                //         name: "Avalanche",
                //         symbol: "AVAX",
                //         tokens: [
                //             {
                //                 id: "0",
                //                 symbol: "USDK",
                //                 address: "YOUR_AVALANCHE_TOKEN_ADDRESS",
                //             },
                //         ],
                //         disabled: false,
                //         isEvm: true,
                //     },
                //     {
                //         id: "4",
                //         name: "Base",
                //         symbol: "BASE",
                //         tokens: [
                //             {
                //                 id: "0",
                //                 symbol: "USDK",
                //                 address: "YOUR_BASE_TOKEN_ADDRESS",
                //             },
                //         ],
                //         disabled: false,
                //         isEvm: true,
                //     },
                //     {
                //         id: "5",
                //         name: "Binance Smart Chain",
                //         symbol: "BSC",
                //         tokens: [
                //             {
                //                 id: "0",
                //                 symbol: "USDK",
                //                 address: "YOUR_BSC_TOKEN_ADDRESS",
                //             },
                //         ],
                //         disabled: false,
                //         isEvm: true,
                //     },
                //     {
                //         id: "6",
                //         name: "Optimism",
                //         symbol: "OPT",
                //         tokens: [
                //             {
                //                 id: "0",
                //                 symbol: "USDK",
                //                 address: "YOUR_OPTIMISM_TOKEN_ADDRESS",
                //             },
                //         ],
                //         disabled: false,
                //         isEvm: true,
                //     },
                //     {
                //         id: "7",
                //         name: "Polygon",
                //         symbol: "POL",
                //         tokens: [
                //             {
                //                 id: "0",
                //                 symbol: "USDK",
                //                 address: "YOUR_POLYGON_TOKEN_ADDRESS",
                //             },
                //         ],
                //         disabled: false,
                //         isEvm: true,
                //     },
                //     // Disabled chains:
                //     {
                //         id: "8",
                //         name: "Solana",
                //         symbol: "SOL",
                //         tokens: [
                //             {
                //                 id: "0",
                //                 symbol: "USDK",
                //                 address: "9YSFWfU9Ram6mAo2QP9zsTnA8yFkkkFGEs3kGgjtQKvp",
                //             },
                //         ],
                //         disabled: true,
                //         isEvm: false,
                //     },
                //     {
                //         id: "9",
                //         name: "Tron",
                //         symbol: "TRX",
                //         tokens: [
                //             {
                //                 id: "0",
                //                 symbol: "USDK",
                //                 address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
                //             },
                //         ],
                //         disabled: true,
                //         isEvm: false,
                //     },
                //     {
                //         id: "10",
                //         name: "Berachain",
                //         symbol: "BERA",
                //         tokens: [
                //             {
                //                 id: "0",
                //                 symbol: "USDK",
                //                 address: "YOUR_BERACHAIN_TOKEN_ADDRESS",
                //             },
                //         ],
                //         disabled: true,
                //         isEvm: true,
                //     },
                // ]);
            }
        };
        fetchChains();
    }, []);

    // Helper to get token address from selected chain and symbol
    const getTokenAddress = () => {
        const selectedChain = chains.find((chain) => chain.name === userData.originChain);
        console.log('selectedchaincheck', selectedChain)
        if (!selectedChain) return null;
        const token = selectedChain.tokens.find((t) => t.symbol === userData.symbol);
        return token ? token.address : null;
    };

    // Fetch balance (for demonstration, only the EVM branch is fully shown)
    const fetchBalance = async () => {
        try {
            if (!userData.originChain || !userData.symbol) {
                setUserBalance(null);
                return;
            }
            const tokenAddress = getTokenAddress();
            if (!tokenAddress) {
                setUserBalance(null);
                return;
            }
            const selectedChain = chains.find((chain) => chain.name === userData.originChain);
            if (!selectedChain) return;

            if (selectedChain.isEvm) {
                if (!(window as any).ethereum) {
                    setStatus("MetaMask is not installed!");
                    return;
                }
                const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
                // console.log('accounts', accounts)
                // const userAddress = accounts[0];
                const userAddress = address;
                // const provider = new BrowserProvider((window as any).ethereum);
                await ensureCorrectNetwork(userData.originChain)

                // now all calls talk to the right chain:
                const ethereum = (window as any).ethereum
                const provider = new BrowserProvider(ethereum)
                const signer = await provider.getSigner();
                const tokenContract = new Contract(
                    tokenAddress,
                    [
                        "function balanceOf(address) view returns (uint256)",
                        "function decimals() view returns (uint8)",
                    ],
                    signer
                );
                const balance = await tokenContract.balanceOf(userAddress);
                const decimals = await tokenContract.decimals();
                setUserBalance((Number(balance) / 10 ** Number(decimals)).toString());
            }
            // Additional logic for Solana and Tron would go here…
        } catch (error: any) {
            console.error("Error fetching balance:", error);
            setStatus(`Error fetching balance: ${error.message}`);
            setUserBalance(null);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, [userData.originChain, userData.symbol, chains]);

    // Fetch fee details from API
    const fetchFees = async () => {
        try {
            const url = `/api/kima/submit/fees?amount=${userData.amount}&originChain=${CHAIN_NAMES[userData.originChain as keyof typeof CHAIN_NAMES]
                }&originSymbol=${userData.symbol}&targetChain=${CHAIN_NAMES[userData.targetChain as keyof typeof CHAIN_NAMES]
                }&deductFee=${userData.deductFee}`;
            const response = await fetch(url, { headers: { accept: "application/json" } });
            const data = await response.json();
            setFees(data);
        } catch (error) {
            console.error("Error fetching fees:", error);
            setStatus("Error fetching fees. Please try again.");
        }
    };

    useEffect(() => {
        if (userData.amount && userData.originChain && userData.targetChain && userData.symbol) {
            fetchFees();
        }
    }, [userData.amount, userData.originChain, userData.targetChain, userData.symbol, userData.deductFee]);

    // Approval/transfer functions for each chain
    const handleEthereumTransfer = async (): Promise<any> => {
        if (!window.ethereum) throw new Error("MetaMask is not installed!");
        // const provider = new BrowserProvider(window.ethereum);
        await ensureCorrectNetwork(userData.originChain)

        // now all calls talk to the right chain:
        const ethereum = (window as any).ethereum
        const provider = new BrowserProvider(ethereum)
        const signer = await provider.getSigner();
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const userAddress = accounts[0];
        const tokenAddress = getTokenAddress();
        if (!tokenAddress) throw new Error("Token address not found for selected chain and symbol.");

        const tokenAbi = [
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function allowance(address owner, address spender) public view returns (uint256)",
        ];
        const tokenContract = new Contract(tokenAddress, tokenAbi, signer);
        const allowance = await tokenContract.allowance(userAddress, KIMA_POOLS.ETH);
        console.log('KIMA', KIMA_POOLS.ETH)
        console.log('userAddress', userAddress)
        console.log('token', tokenAddress)
        //const amountWei = BigInt(Math.floor(Number(userData.amount+3) * 10 ** fees.decimals));
        const amountWei = BigInt(Math.floor(fees.allowanceAmount));
        //BigInt(Math.floor(fees.allowanceAmount));
        //  const amountWei = BigInt(Math.floor(Number(userData.amount) * 10 ** fees.decimals));
        console.log('amountWei', amountWei)

        // if (BigInt(allowance.toString()) < amountWei) {
        console.log('entry')
        const tx = await tokenContract.approve(KIMA_POOLS.ETH, amountWei);
        const receipt = await tx.wait();
        console.log('receipt', receipt)
        // Assume the response includes a msgResponses field containing the txId:
        return receipt;
        // }

        return { transactionHash: "Allowance sufficient", msgResponses: [] };
    };

    const handleSolanaTransfer = async (): Promise<any> => {
        if (!window.solana) throw new Error("Solana wallet not detected!");
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const publicKey = window.solana.publicKey;
        const tokenAddress = getTokenAddress();
        if (!tokenAddress) throw new Error("Token address not found for selected chain and symbol.");
        const mintPublicKey = new PublicKey(tokenAddress);
        const delegatePublicKey = new PublicKey(KIMA_POOLS.SOL);
        const tokenAccountAddress = await getAssociatedTokenAddress(mintPublicKey, publicKey);
        const amount = Math.floor(Number(userData.amount) * 10 ** fees.decimals);

        const transaction = new Transaction();
        const tokenAccountInfo = await connection.getAccountInfo(tokenAccountAddress);
        if (!tokenAccountInfo) {
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    publicKey,
                    tokenAccountAddress,
                    publicKey,
                    mintPublicKey
                )
            );
        }
        transaction.add(
            createApproveInstruction(
                tokenAccountAddress,
                delegatePublicKey,
                publicKey,
                amount,
                [],
                TOKEN_PROGRAM_ID
            )
        );
        transaction.feePayer = publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        const { signature } = await window.solana.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature, "finalized");
        // For consistency, return an object similar to Ethereum’s response
        return { transactionHash: signature, msgResponses: [] };
    };

    const handleTronTransfer = async (): Promise<any> => {
        if (!window.tronWeb) throw new Error("TronLink not available!");
        const tronWeb = window.tronWeb;
        const userAddress = tronWeb.defaultAddress.base58;
        if (!userAddress) throw new Error("Tron wallet not connected!");
        const tokenAddress = getTokenAddress();
        if (!tokenAddress) throw new Error("Token address not found for selected chain and symbol.");
        const contract = await tronWeb.contract().at(tokenAddress);
        const amount = Math.floor(Number(userData.amount) * 10 ** fees.decimals);
        const tx = await contract.approve(KIMA_POOLS.TRX, amount).send({
            from: userAddress,
        });
        // Return a similar object with a transactionHash and a msgResponses array containing the txId
        return { transactionHash: tx, msgResponses: [] };
    };


    // Polling function for transaction status
    const pollTransactionStatus = async (txId: string) => {
        console.log("txId", txId);
        try {
            const response = await fetch(`/api/kima/tx/${txId}/status`, {
                headers: { accept: "application/json" },
            });
            const data = await response.json();
            if (data && data.data && data.data.transaction_data) {
                const { pullhash, txstatus } = data.data.transaction_data;
                setTransferStatus({ pullhash, txstatus });
                if (txstatus.toLowerCase() !== "completed") {
                    // Continue polling every 15 seconds
                    setTimeout(() => pollTransactionStatus(txId), 15000);
                } else {
                    toast.success("Transfer successful");
                    // If a new tab was opened, close it and open a new one with the '/' route
                    if (newTabRef.current && !newTabRef.current.closed) {
                        newTabRef.current.close();
                    }
                    // window.open(window.location.origin + "/", "_blank");
                    setTransferLoading(false);
                    disconnect();
                    if (onTransferSuccess) onTransferSuccess();
                }
            }
        } catch (error) {
            console.error("Error polling transaction status:", error);
        }
    };

    // Modified handleSubmit to start the transfer process and initiate polling
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address) {
            setStatus("Please connect your wallet first.");
            return;
        }
        if (!userData.targetAddress) {
            setStatus("Please enter a target address.");
            return;
        }
        if (!userData.amount || Number(userData.amount) <= 0) {
            setStatus("Please enter a valid amount.");
            return;
        }
        try {
            // Start transfer and lock the timer
            setTransferLoading(true);
            setStatus("");

            let approvalResponse: any;
            if (userData.originChain === "Ethereum") {
                approvalResponse = await handleEthereumTransfer();
            } else if (userData.originChain === "Solana") {
                approvalResponse = await handleSolanaTransfer();
            } else if (userData.originChain === "Tron") {
                approvalResponse = await handleTronTransfer();
            } else {
                throw new Error("Unsupported origin chain.");
            }
            // Prepare and send the submit request (same as before)
            const tokenAddress = getTokenAddress();
            if (!tokenAddress) throw new Error("Token address not found.");
            const submitBody = {
                originAddress: address,
                originChain: CHAIN_NAMES[userData.originChain as keyof typeof CHAIN_NAMES],
                targetAddress: userData.targetAddress,
                targetChain: CHAIN_NAMES[userData.targetChain as keyof typeof CHAIN_NAMES],
                symbol: userData.symbol,
                amount: fees.submitAmount,
                fee: fees.totalFee,
                txHash: approvalResponse.transactionHash || approvalResponse,
                originSymbol: userData.symbol,
                targetSymbol: userData.symbol,
                decimals: fees.decimals,
            };
            const submitResponse = await fetch("/api/kima/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submitBody),
            });
            if (!submitResponse.ok) throw new Error("Failed to submit transfer.");
            const submitResult = await submitResponse.json();
            let txId: string | undefined;
            if (submitResult && Array.isArray(submitResult.events)) {
                for (const event of submitResult.events) {
                    if (event.attributes && Array.isArray(event.attributes)) {
                        for (const attr of event.attributes) {
                            if (attr.key === "txId") {
                                txId = attr.value;
                                break;
                            }
                        }
                    }
                    if (txId) break;
                }
            }
            if (!txId) throw new Error("Transaction ID not found in submit result.");
            // Begin polling transaction status
            pollTransactionStatus(txId);
        } catch (error: any) {
            setStatus(`Error: ${error.message}`);
            toast.error("Transfer error");
            setTransferLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold text-center mb-4">Kima Transfer Agent</h1>

            {/* Connected Wallet Section */}
            <div className="mb-4">
                <ConnectButton.Custom>
                    {({ account, chain, openConnectModal, mounted }) => {
                        if (mounted && account && chain) {
                            return (
                                <div className="flex items-center justify-between bg-gray-800 p-4 rounded">
                                    <div className="text-white">
                                        <div>
                                            <span className="font-medium">Address:</span> {account.address}
                                        </div>
                                        <div>
                                            <span className="font-medium">Chain:</span> {chain.name}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowWalletPopup(true)}
                                        className="border border-white bg-transparent text-white px-4 py-2 rounded"
                                    >
                                        Manage Wallet
                                    </button>
                                </div>
                            );
                        }
                        return (
                            <button
                                onClick={openConnectModal}
                                className="border border-white bg-transparent text-white px-4 py-2 rounded"
                            >
                                Connect Wallet
                            </button>
                        );
                    }}
                </ConnectButton.Custom>
            </div>

            {/* Transfer Form */}
            <form className="bg-[#171D3D] border shadow-md rounded px-8 pt-6 pb-8 mb-4">
                {/* Origin Chain */}
                <div className="mb-4">
                    <label htmlFor="originChain" className="block text-white font-bold mb-2">
                        Origin Chain
                    </label>
                    <select
                        id="originChain"
                        name="originChain"
                        value={userData.originChain}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded bg-[#343B4F]"
                    >
                        {chains.map((chain) => (
                            <option key={chain.id} value={chain.name} disabled={chain.disabled}>
                                {chain.name}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Connected Wallet (read-only) */}
                <div className="mb-4">
                    <label className="block text-white font-bold mb-2">Connected Wallet</label>
                    <div className="w-full px-3 py-2 border rounded bg-[#343B4F]">
                        <ConnectButton.Custom>
                            {({ account, openConnectModal, mounted }) =>
                                mounted && account ? (
                                    account.address
                                ) : (
                                    <button onClick={openConnectModal} className="text-blue-500 underline">
                                        Connect Wallet
                                    </button>
                                )
                            }
                        </ConnectButton.Custom>
                    </div>
                </div>
                {/* Target Address */}
                <div className="mb-4">
                    <label htmlFor="targetAddress" className="block text-white font-bold mb-2">
                        Target Address (Recipient)
                    </label>
                    <input
                        id="targetAddress"
                        name="targetAddress"
                        type="text"
                        value={userData.targetAddress}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded bg-[#343B4F]"
                    />
                </div>
                {/* Target Chain */}
                <div className="mb-4">
                    <label htmlFor="targetChain" className="block text-white font-bold mb-2">
                        Target Chain
                    </label>
                    <select
                        id="targetChain"
                        name="targetChain"
                        value={userData.targetChain}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded bg-[#343B4F]"
                    >
                        {chains.map((chain) => (
                            <option key={chain.id} value={chain.name} disabled={chain.disabled}>
                                {chain.name}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Token Symbol */}
                <div className="mb-4">
                    <label htmlFor="symbol" className="block text-white font-bold mb-2">
                        Token Symbol
                    </label>
                    <select
                        id="symbol"
                        name="symbol"
                        value={userData.symbol}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded bg-[#343B4F]"
                    >
                        <option value="">Select Token</option>
                        {chains
                            .find((chain) => chain.name === userData.originChain)
                            ?.tokens.map((token) => (
                                <option key={token.id} value={token.symbol}>
                                    {token.symbol}
                                </option>
                            ))}
                    </select>
                </div>
                {/* Amount */}
                <div className="mb-4">
                    <label htmlFor="amount" className="block text-white font-bold mb-2">
                        Amount
                    </label>
                    <input
                        id="amount"
                        name="amount"
                        type="number"
                        value={userData.amount}
                        onChange={handleChange}
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border rounded bg-[#343B4F]"
                    />
                </div>
                {/* Deduct Fee */}
                <div className="mb-4 flex items-center">
                    <input
                        id="deductFee"
                        name="deductFee"
                        type="checkbox"
                        checked={userData.deductFee}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    <label htmlFor="deductFee" className="text-white font-bold">
                        Deduct Fee
                    </label>
                </div>
                <button type="button" onClick={handleSubmit} className="w-full bg-blue-500 text-white py-2 rounded">
                    Start Transfer
                </button>
            </form>

            {/* Display User Balance */}
            <div className="mb-4 p-4 bg-green-300 rounded">
                {userBalance !== null ? (
                    <p>
                        Your balance: {userBalance} {userData.symbol}
                    </p>
                ) : (
                    <p>Balance not available. Please connect your wallet and select a token.</p>
                )}
            </div>

            {/* Status messages */}
            {status && (
                <div className="mb-4 p-4 bg-red-300 rounded whitespace-pre-wrap">
                    {status}
                </div>
            )}

            {/* Fee Details */}
            <div className="mb-4 p-4 bg-green-300 rounded">
                <h3 className="font-bold">Fee Details:</h3>
                <p>Total Fee: {fees.totalFeeUsd} USD</p>
                <p>Total Fee in Token: {fees.totalFee}</p>
                <p>Allowance Amount: {fees.allowanceAmount}</p>
                <p>Decimals: {fees.decimals}</p>
                <p>Submit Amount: {fees.submitAmount}</p>
            </div>

            {/* Wallet Disconnect Popup */}
            {showWalletPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div
                        className="absolute inset-0 bg-black opacity-50"
                        onClick={() => setShowWalletPopup(false)}
                    ></div>
                    <div className="p-6 rounded shadow-lg z-10 w-80 bg-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">Wallet Connected</h2>
                            <button onClick={() => setShowWalletPopup(false)} className="text-white text-2xl leading-none">
                                &times;
                            </button>
                        </div>
                        <ConnectButton.Custom>
                            {({ account, chain, openConnectModal, mounted }) => {
                                if (mounted && account && chain) {
                                    return (
                                        <div className="space-y-2">
                                            <div className="text-white">
                                                <span className="font-medium">Address:</span> {account.address}
                                            </div>
                                            <div className="text-white">
                                                <span className="font-medium">Chain:</span> {chain.name}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    disconnect();
                                                    setShowWalletPopup(false);
                                                }}
                                                className="mt-4 border border-white bg-transparent text-white px-4 py-2 rounded transition-colors w-full"
                                            >
                                                Disconnect
                                            </button>
                                        </div>
                                    );
                                }
                                return (
                                    <button
                                        onClick={openConnectModal}
                                        className="border border-white bg-transparent text-white px-4 py-2 rounded transition-colors w-full"
                                    >
                                        Connect Wallet
                                    </button>
                                );
                            }}
                        </ConnectButton.Custom>
                    </div>
                </div>
            )}

            {/* Transfer Progress Modal */}
            {transferLoading && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
                    <div className="p-6 bg-gray-800 rounded text-center relative">
                        <p className="text-white text-lg mb-4">Transferring...</p>
                        {transferStatus && (
                            <>
                                <p className="text-white">Pull Hash: {transferStatus.pullhash}</p>
                                <p className="text-white">Transaction Status: {transferStatus.txstatus}</p>
                            </>
                        )}
                        <div className="mt-4 flex flex-col items-center">
                            <CircularCountdown countdown={countdown} totalTime={totalTime} />
                            <p className="text-white mt-2">
                                The transfer will take approx. 15 minutes to complete.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KimaTransferAgent;
