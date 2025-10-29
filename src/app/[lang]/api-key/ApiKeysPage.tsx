"use client";
import { useEffect, useState } from "react";
import { RiDeleteBin5Fill, RiAddCircleFill } from "react-icons/ri";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import ButtonV1New from "@/component/ui/buttonV1";
import { toast } from 'sonner';
import { useModelStore } from "@/stores/useModel-store";

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
            console.log("initiate-payment response:", payment_url);

            // extract iid and build the embed URL
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
        <div className="pt-3 p-6 bg-[#000A19] text-white h-screen">
            {/* Back and Create Buttons */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => router.push("/")}
                    className="text-lg font-semibold text-white"
                >
                    ←
                </button>
                <ButtonV1New onClick={createApiKey}>
                    <div className="flex items-center gap-2">
                        <div>Create</div>
                        <div>
                            <RiAddCircleFill className="text-xl" />
                        </div>
                    </div>
                </ButtonV1New>
            </div>

            {/* Credits & Purchase Button */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">API Keys</h1>
                </div>
                <div className="flex gap-2 justify-end items-center mb-4">
                    <div className="text-lg font-semibold bg-gray-800 text-white px-4 py-1 rounded">
                        Credits: {globalCredits}
                    </div>
                    <ButtonV1New onClick={purchase}>
                        Purchase
                    </ButtonV1New>

                    {showPurchaseModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-[#08131f] p-6 rounded-lg w-80">
                                <h2 className="text-xl font-bold mb-4 text-white">Buy Credits</h2>
                                <input
                                    type="number"
                                    min={1}
                                    value={purchaseAmount}
                                    onChange={e => setPurchaseAmount(Number(e.target.value))}
                                    placeholder="Amount in USD"
                                    className="w-full mb-4 px-3 py-2 border rounded text-white bg-[#1f2937]"
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setShowPurchaseModal(false)}
                                        className="px-4 py-2 rounded bg-red-500 text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleBuy}
                                        className="px-4 py-2 bg-green-600 text-white rounded"
                                    >
                                        Buy
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {widgetUrl && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="relative bg-white rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setWidgetUrl(null)}
                                    className="absolute top-2 right-2 text-gray-600 hover:text-black z-10"
                                >
                                    ✕
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
            </div>

            {/* Display Current Global API Key */}
            {globalApiKey && (
                <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-300 mb-1">Current Active API Key:</h3>
                    <p className="text-sm text-white font-mono break-all">{globalApiKey}</p>
                </div>
            )}

            <p className="mb-1 text-gray-400">View and Manage your API keys.</p>
            <p className="mb-5 italic text-gray-500">
                Do not share your API key with others or expose it in the browser or other client-side code.
            </p>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-900 border-b-2 border-gray-600">
                            <th className="px-4 py-2 text-start">API Key</th>
                            <th className="px-4 py-2 text-start">Status</th>
                            <th className="px-4 py-2 text-start">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apiKeys.length > 0 ? (
                            apiKeys.map((api_key) => (
                                <tr key={api_key} className="">
                                    <td className="px-4 py-2 font-mono">{api_key}</td>
                                    <td className="px-4 py-2">
                                        {api_key === globalApiKey ? (
                                            <span className="text-green-400 text-sm">Active</span>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setGlobalApiKey(api_key);
                                                    fetchCredits(api_key);
                                                    toast.success("API Key activated!");
                                                }}
                                                className="text-blue-400 text-sm hover:text-blue-300 underline"
                                            >
                                                Activate
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <RiDeleteBin5Fill
                                            className="text-red-500 cursor-pointer hover:text-red-700"
                                            onClick={() => deleteApiKey(api_key)}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="text-center text-gray-500 py-4">
                                    No API keys found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}