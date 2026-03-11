"use client";
import { useEffect, useState } from "react";
import { RiDeleteBin5Fill, RiAddCircleFill } from "react-icons/ri";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from 'sonner';
import { useModelStore } from "@/stores/useModel-store";
import { Key, Plus, ArrowLeft, Wallet, Copy, Check, Trash2, Zap, X } from "lucide-react";

const API_KEYS_URL = "https://zynapse.zkagi.ai/get-api-keys-by-wallet";
const DELETE_API_KEY_URL = "https://zynapse.zkagi.ai/delete-api-key";
const BALANCE_API_URL = "https://zynapse.zkagi.ai/v1/check-balance";
const CREATE_API_KEY_URL = "https://zynapse.zkagi.ai/generate-api-key";
const API_KEY = "zk-123321";

interface ApiKeysPageProps {
    dictionary: any;
}

export default function ApiKeysPage({ dictionary }: ApiKeysPageProps) {
    const { publicKey } = useWallet();
    const router = useRouter();
    const params = useParams();
    const lang = params.lang as string || 'en';

    // Get values from store
    const globalCredits = useModelStore((s) => s.credits);
    const globalApiKey = useModelStore((s) => s.apiKey);
    const setGlobalCredits = useModelStore((s) => s.setCredits);
    const setGlobalApiKey = useModelStore((s) => s.setApiKey);

    const [apiKeys, setApiKeys] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [purchaseAmount, setPurchaseAmount] = useState<number>(0);
    const [widgetUrl, setWidgetUrl] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        if (publicKey) {
            fetchApiKeys();
        }
    }, [publicKey]);

    const fetchApiKeys = async () => {
        if (!publicKey) return;
        setLoading(true);
        try {
            const response = await fetch(API_KEYS_URL, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "Thunder Client",
                    "api-key": API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ wallet_address: publicKey.toString() }),
            });

            if (!response.ok) throw new Error("Failed to fetch API keys");

            const data = await response.json();
            const keys = data.api_keys || [];
            setApiKeys(keys);

            if (keys.length > 0) {
                setAuthToken(keys[0]);
                setGlobalApiKey(keys[0]);
                fetchCredits(keys[0]);
            }
        } catch (error) {
            console.error("Error fetching API keys:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCredits = async (token: string) => {
        try {
            const response = await fetch(BALANCE_API_URL, {
                method: "GET",
                headers: {
                    "Accept": "/",
                    "User-Agent": "Thunder Client",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Failed to fetch balance");

            const data = await response.json();
            console.log('balance', data)
            console.log('token balance', token)
            setGlobalCredits(data.credit_balance || 0);
        } catch (error) {
            console.error("Error fetching credits:", error);
            setGlobalCredits(0);
        }
    };

    const deleteApiKey = async (apiKey: string) => {
        if (!publicKey) return;

        try {
            const response = await fetch(DELETE_API_KEY_URL, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "Thunder Client",
                    "api-key": API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    wallet_address: publicKey.toString(),
                    api_key: apiKey,
                }),
            });

            if (!response.ok) throw new Error("Failed to delete API key");

            // Remove the deleted API key from state
            const updatedKeys = apiKeys.filter((key) => key !== apiKey);
            setApiKeys(updatedKeys);

            // Update authToken if the deleted key was being used
            if (apiKey === authToken) {
                setAuthToken(updatedKeys.length > 0 ? updatedKeys[0] : null);
                if (updatedKeys.length > 0) {
                    setGlobalApiKey(updatedKeys[0]);
                    fetchCredits(updatedKeys[0]);
                } else {
                    setGlobalApiKey('');
                    setGlobalCredits(0);
                }
            }

            toast.error("API Key deleted successfully!");
        } catch (error) {
            console.error("Error deleting API key:", error);
        }
    };

    const createApiKey = async () => {
        if (!publicKey) return;

        try {
            const response = await fetch(CREATE_API_KEY_URL, {
                method: "POST",
                headers: {
                    "Accept": "/",
                    "User-Agent": "Thunder Client",
                    "api-key": API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    wallet_address: publicKey.toString(),
                }),
            });

            if (!response.ok) throw new Error("Failed to create API key");

            const generateKeyData = await response.json();
            if (generateKeyData.api_key) {
                setApiKeys((prevKeys) => [...prevKeys, generateKeyData.api_key]);
                // If this is the first API key, set it as the global one
                if (apiKeys.length === 0) {
                    setGlobalApiKey(generateKeyData.api_key);
                    fetchCredits(generateKeyData.api_key);
                }
            }
            toast.success("API Key added successfully!");
        } catch (error) {
            console.error("Error creating API key:", error);
        }
    };

    const purchase = () => {
        setShowPurchaseModal(true);
    };

    const copyToClipboard = async (key: string) => {
        try {
            await navigator.clipboard.writeText(key);
            setCopiedKey(key);
            toast.success("API Key copied to clipboard!");
            setTimeout(() => setCopiedKey(null), 2000);
        } catch (err) {
            toast.error("Failed to copy");
        }
    };

    const handleBuy = async () => {
        if (!publicKey) return;
        try {
            const res = await fetch("https://zynapse.zkagi.ai/v1/initiate-payment", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "api-key": API_KEY,
                },
                body: JSON.stringify({
                    wallet_address: publicKey.toString(),
                    amount_usd: purchaseAmount,
                }),
            });
            const { payment_url } = await res.json();

            const url = new URL(payment_url);
            const iid = url.searchParams.get("iid");
            if (iid) {
                setWidgetUrl(`https://nowpayments.io/embeds/payment-widget?iid=${iid}`);
            }
        } catch (err) {
            console.error("initiate-payment error:", err);
        } finally {
            setShowPurchaseModal(false);
            setPurchaseAmount(0);
        }
    };

    return (
        <div className="min-h-screen bg-dsBg">
            {/* Header */}
            <div className="ds-topbar sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/${lang}/home`)}
                        className="w-9 h-9 rounded-lg bg-dsBorder/50 flex items-center justify-center
                                   text-dsMuted hover:text-white hover:bg-dsBorder transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-dsPurple to-dsPurple-dark
                                        flex items-center justify-center shadow-lg shadow-dsPurple/20">
                            <Key size={16} className="text-white" />
                        </div>
                        <h1 className="ds-heading-md">API Keys</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Credits Badge */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dsBgAlt border border-dsBorder">
                        <Wallet size={14} className="text-dsGreen" />
                        <span className="font-dmMono text-dsGreen font-medium">
                            {globalCredits?.toFixed(2) || "0.00"}
                        </span>
                        <span className="text-dsMuted text-sm">credits</span>
                    </div>

                    {/* Purchase Button */}
                    <button
                        onClick={purchase}
                        className="ds-btn-primary"
                    >
                        <Zap size={16} />
                        Buy Credits
                    </button>

                    {/* Create API Key Button */}
                    <button
                        onClick={createApiKey}
                        className="ds-btn-secondary"
                    >
                        <Plus size={16} />
                        Create Key
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Info Banner */}
                <div className="ds-card mb-8 border-dsPurple/20 bg-gradient-to-r from-dsPurple/5 to-transparent">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-dsPurple/15 flex items-center justify-center flex-shrink-0">
                            <Key size={18} className="text-dsPurple-light" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-1">API Key Security</h3>
                            <p className="ds-body text-sm leading-relaxed">
                                Your API keys grant access to ZkAGI services. Keep them secure and never share them publicly.
                                Treat them like passwords - if compromised, delete and regenerate immediately.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Active Key Card */}
                {globalApiKey && (
                    <div className="ds-card mb-6 border-dsGreen/20">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-dsGreen animate-pulse" />
                                <span className="text-sm font-medium text-dsGreen">Active API Key</span>
                            </div>
                            <button
                                onClick={() => copyToClipboard(globalApiKey)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dsBorder/50
                                           text-dsMuted hover:text-white hover:bg-dsBorder transition-all text-sm"
                            >
                                {copiedKey === globalApiKey ? <Check size={14} /> : <Copy size={14} />}
                                {copiedKey === globalApiKey ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <code className="block font-dmMono text-sm text-white/90 bg-dsBg/50 p-3 rounded-lg break-all border border-dsBorder/50">
                            {globalApiKey}
                        </code>
                    </div>
                )}

                {/* API Keys Table */}
                <div className="ds-card overflow-hidden p-0">
                    <div className="px-6 py-4 border-b border-dsBorder bg-dsBgAlt/50">
                        <h3 className="ds-heading-sm">All API Keys</h3>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="flex items-center gap-3 text-dsMuted">
                                <div className="w-5 h-5 border-2 border-dsPurple/30 border-t-dsPurple rounded-full animate-spin" />
                                Loading API keys...
                            </div>
                        </div>
                    ) : apiKeys.length > 0 ? (
                        <div className="divide-y divide-dsBorder/50">
                            {apiKeys.map((api_key, index) => (
                                <div
                                    key={api_key}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-dsBgAlt/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-dsBorder/50 flex items-center justify-center text-dsMuted text-sm font-dmMono">
                                            {index + 1}
                                        </div>
                                        <code className="font-dmMono text-sm text-white/80 truncate flex-1">
                                            {api_key}
                                        </code>
                                    </div>

                                    <div className="flex items-center gap-3 ml-4">
                                        {/* Status */}
                                        {api_key === globalApiKey ? (
                                            <span className="ds-badge-new">Active</span>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setGlobalApiKey(api_key);
                                                    fetchCredits(api_key);
                                                    toast.success("API Key activated!");
                                                }}
                                                className="ds-badge-popular cursor-pointer hover:bg-dsPurple/25 transition-colors"
                                            >
                                                Activate
                                            </button>
                                        )}

                                        {/* Copy Button */}
                                        <button
                                            onClick={() => copyToClipboard(api_key)}
                                            className="w-8 h-8 rounded-lg bg-dsBorder/30 flex items-center justify-center
                                                       text-dsMuted hover:text-white hover:bg-dsBorder transition-all"
                                        >
                                            {copiedKey === api_key ? <Check size={14} /> : <Copy size={14} />}
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => deleteApiKey(api_key)}
                                            className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center
                                                       text-red-400 hover:bg-red-500/20 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state py-16">
                            <div className="w-16 h-16 rounded-2xl bg-dsBorder/30 flex items-center justify-center mb-4">
                                <Key size={28} className="text-dsMuted/50" />
                            </div>
                            <h4 className="empty-state-title">No API Keys</h4>
                            <p className="empty-state-description mb-6">
                                Create your first API key to start using ZkAGI services
                            </p>
                            <button onClick={createApiKey} className="ds-btn-primary">
                                <Plus size={16} />
                                Create API Key
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Purchase Modal */}
            {showPurchaseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="ds-card w-full max-w-md mx-4 animate-slideUp">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="ds-heading-md">Buy Credits</h2>
                            <button
                                onClick={() => setShowPurchaseModal(false)}
                                className="w-8 h-8 rounded-lg bg-dsBorder/50 flex items-center justify-center
                                           text-dsMuted hover:text-white hover:bg-dsBorder transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="label">Amount (USD)</label>
                            <input
                                type="number"
                                min={1}
                                value={purchaseAmount}
                                onChange={e => setPurchaseAmount(Number(e.target.value))}
                                placeholder="Enter amount..."
                                className="ds-input"
                            />
                            <p className="text-xs text-dsMuted mt-2">
                                1 USD = 1 Credit. Credits are used for AI generations and API calls.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPurchaseModal(false)}
                                className="ds-btn-ghost flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBuy}
                                disabled={purchaseAmount <= 0}
                                className="ds-btn-primary flex-1"
                            >
                                <Zap size={16} />
                                Purchase ${purchaseAmount || 0}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Widget Modal */}
            {widgetUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
                        <button
                            onClick={() => setWidgetUrl(null)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center
                                       text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all z-10"
                        >
                            <X size={16} />
                        </button>
                        <iframe
                            src={widgetUrl}
                            width="410"
                            height="696"
                            frameBorder="0"
                            scrolling="no"
                            style={{ display: "block" }}
                            title="Payment"
                        >
                            Can&apos;t load widget
                        </iframe>
                    </div>
                </div>
            )}
        </div>
    );
}