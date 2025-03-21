'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemeStore } from '@/stores/meme-store';
import * as pdfjs from 'pdfjs-dist';
import { TokenCreator } from './tokenCreator';
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { toast } from 'sonner';
import { useTwitterAuthStore } from '@/stores/twitter-auth-store';
import { Form } from 'houseform';
import { useTickerStore } from '@/stores/ticker-store';
import { JsonViewer } from '@textea/json-viewer'
import { ApifyClient } from 'apify-client';
import { Wallet } from '@solana/wallet-adapter-react';
import ButtonV1New from '@/component/ui/buttonV1New';
import ButtonV2New from '@/component/ui/buttonV2New';
import { useSearchParams } from 'next/navigation';
import { useModelStore } from '@/stores/useModel-store';
import { z } from "zod";

interface FormDataType {
    name: string;
    ticker: string;
    description: string;
    model: string;
    trainingData: File | null;
    webpageUrl: string;
    twitter: string;
    telegram: string;
    website: string;
    imageBase64: string;
    seed: string;
    walletAddress: string;
    prompt: string;
    trainingUrls: string[];
    trainingPdfs: File[];
    trainingImages: File[];
    trade?: string;
    tradeMode?: 'automation' | 'authentication';
}

interface TickerInfo {
    description: string;
    memecoin_address: null | string;
    coin_name: string;
    image_base64: string;
    training_data: any[];
    urls: string[];
    seed: number;
    user_prompt: string;
}

interface Coin {
    image_base64: string;
    description: string;
    coin_name: string;
    ticker: string;
    memecoin_address: string | null;
}


function parseValue(value: string) {
    // If the input looks like a pure integer, parse it
    if (/^-?\d+$/.test(value)) {
        return parseInt(value, 10);
    }
    // If it's "true" or "false", parse it to a boolean
    else if (value === 'true' || value === 'false') {
        return value === 'true';
    }
    // Otherwise, return the string as-is
    return value;
}

function maskSecrets(jsonData: { settings?: { secrets?: Record<string, string> } } | null) {
    if (jsonData?.settings?.secrets) {
        const maskedSecrets = { ...jsonData.settings.secrets };
        Object.keys(maskedSecrets).forEach((key) => {
            maskedSecrets[key] = '*'.repeat(maskedSecrets[key].length);
        });
        return {
            ...jsonData,
            settings: {
                ...jsonData.settings,
                secrets: maskedSecrets,
            },
        };
    }
    return jsonData;
}

// Zod schema for Twitter credentials
const twitterSchema = z.object({
    username: z.string().nonempty({ message: "Twitter username is required" }),
    email: z.string().email({ message: "Please enter a valid Twitter email" }),
    password: z.string().nonempty({ message: "Twitter password is required" }),
    twofa: z.string().length(16, { message: "Not valid 2fa enter 16 characters 2fa" }),
});


/**
 * A recursive function to render a form for any JSON data structure.
 *
 * @param data The current JSON node (object, array, or primitive).
 * @param onChange A callback to update the parent state when this node changes.
 * @param path An array of keys to track the nested path (for debugging or labeling).
 */

function renderJsonForm(
    data: any,
    onChange: (updatedData: any) => void,
    path: string[] = []
): JSX.Element {
    if (typeof data !== "object" || data === null) {
        // Render primitive data as an input field
        return (
            <input
                type="text"
                className="block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                value={String(data)}
                onChange={(e) => {
                    const newValue = parseValue(e.target.value);
                    onChange(newValue);
                }}
            />
        );
    }

    // Render arrays
    if (Array.isArray(data)) {
        return (
            <div className="space-y-2">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded border border-gray-700 bg-gray-900"
                    >
                        <div className="flex-1">
                            {renderJsonForm(
                                item,
                                (updatedItem) => {
                                    const newArray = [...data];
                                    newArray[index] = updatedItem;
                                    onChange(newArray);
                                },
                                [...path, String(index)]
                            )}
                        </div>
                        {/* Remove button */}
                        <button
                            type="button"
                            className="px-2 py-1 text-red-400 hover:text-red-500 border border-red-500 rounded"
                            onClick={() => {
                                const newArray = data.filter((_, i) => i !== index);
                                onChange(newArray);
                            }}
                        >
                            -
                        </button>
                    </div>
                ))}
            </div>
        );
    }

    // Render objects
    return (
        <div className="space-y-4">
            {Object.keys(data).map((key) => {

                const isUneditableField = ["name", "modelProvider", "settings"].includes(key);
                const isStyleKey = key === "style";
                const isMessageExampleKey = key === "messageExamples";
                const getModelProvider = (value?: string): string =>
                    value && value.trim() ? value : "en_US-male-medium";


                // Uneditable fields
                // if (isUneditableField) {
                //     return (
                //         <div
                //             key={key}
                //             className="p-3 rounded border border-gray-700 bg-gray-800 space-y-2"
                //         >
                //             <div className="block text-sm font-semibold text-gray-200">
                //                 {key} (Non-editable)
                //             </div>
                //             <div className="text-gray-500 break-words whitespace-normal overflow-hidden">{JSON.stringify(data[key])}</div>
                //         </div>
                //     );
                // }
                if (isUneditableField) {
                    let displayValue = data[key];
                    // If the field is modelProvider, apply our default logic.
                    if (key === "modelProvider") {
                        displayValue = getModelProvider(data[key]);
                    }
                    return (
                        <div key={key} className="p-3 rounded border border-gray-700 bg-gray-800 space-y-2">
                            <div className="block text-sm font-semibold text-gray-200">
                                {key} (Non-editable)
                            </div>
                            <div className="text-gray-500 break-words whitespace-normal overflow-hidden">
                                {JSON.stringify(displayValue)}
                            </div>
                        </div>
                    );
                }

                // Message examples
                if (isMessageExampleKey) {
                    return (
                        <div
                            key={key}
                            className="p-3 rounded border border-gray-700 bg-gray-800 space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <div className="block text-sm font-semibold text-gray-200">{key}</div>
                                {/* Add a new block for user and content */}
                                <button
                                    type="button"
                                    className="px-2 py-1 text-green-300 hover:text-green-400 border border-green-500 rounded bg-gray-900"
                                    onClick={() => {
                                        const newExample = {
                                            user: "",
                                            content: { text: "" },
                                        };
                                        const newArray = Array.isArray(data[key])
                                            ? [newExample, ...data[key]]
                                            : [newExample];
                                        onChange({ ...data, [key]: newArray });
                                    }}
                                >
                                    +
                                </button>
                            </div>

                            <div className="space-y-2">
                                {data[key].map((example: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="p-3 flex items-center gap-4 rounded border border-gray-700 bg-gray-800"
                                    >
                                        <div className="flex-1 space-y-2">
                                            <div>
                                                <label className="block mb-2 text-sm">User</label>
                                                <input
                                                    type="text"
                                                    className="block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                                                    value={example.user || ""}
                                                    onChange={(e) => {
                                                        const updatedExample = {
                                                            ...example,
                                                            user: e.target.value,
                                                        };
                                                        const newArray = [...data[key]];
                                                        newArray[idx] = updatedExample;
                                                        onChange({ ...data, [key]: newArray });
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-2 text-sm">Content Text</label>
                                                <input
                                                    type="text"
                                                    className="block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                                                    value={example.content?.text || ""}
                                                    onChange={(e) => {
                                                        const updatedExample = {
                                                            ...example,
                                                            content: { text: e.target.value },
                                                        };
                                                        const newArray = [...data[key]];
                                                        newArray[idx] = updatedExample;
                                                        onChange({ ...data, [key]: newArray });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        {/* Remove the whole example */}
                                        <button
                                            type="button"
                                            className="px-2 py-1 text-red-400 hover:text-red-500 border border-red-500 rounded"
                                            onClick={() => {
                                                const newArray = data[key].filter(
                                                    (_: any, i: number) => i !== idx
                                                );
                                                onChange({ ...data, [key]: newArray });
                                            }}
                                        >
                                            -
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }

                // if (isMessageExampleKey) {
                //     return (
                //         <div
                //             key={key}
                //             className="p-3 rounded border border-gray-700 bg-gray-800 space-y-2"
                //         >
                //             <div className="flex items-center justify-between">
                //                 <div className="block text-sm font-semibold text-gray-200">{key}</div>
                //                 {/* Add a new block for user and content */}
                //                 <button
                //                     type="button"
                //                     className="px-2 py-1 text-green-300 hover:text-green-400 border border-green-500 rounded bg-gray-900"
                //                     onClick={() => {
                //                         const newExample = {
                //                             user: "",
                //                             content: { text: "" },
                //                         };
                //                         const newArray = Array.isArray(data[key])
                //                             ? [newExample, ...data[key]]
                //                             : [newExample];
                //                         onChange({ ...data, [key]: newArray });
                //                     }}
                //                 >
                //                     +
                //                 </button>
                //             </div>

                //             <div className="space-y-2">
                //                 {data[key].map((example: any, idx: number) => (
                //                     <div
                //                         key={idx}
                //                         className="p-3 rounded border border-gray-700 bg-gray-800 space-y-2"
                //                     >
                //                         <div>
                //                             <label className="block mb-2 text-sm">User</label>
                //                             <input
                //                                 type="text"
                //                                 className="block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                //                                 value={example.user || ""}
                //                                 onChange={(e) => {
                //                                     const updatedExample = {
                //                                         ...example,
                //                                         user: e.target.value,
                //                                     };
                //                                     const newArray = [...data[key]];
                //                                     newArray[idx] = updatedExample;
                //                                     onChange({ ...data, [key]: newArray });
                //                                 }}
                //                             />
                //                         </div>
                //                         <div>
                //                             <label className="block mb-2 text-sm">Content Text</label>
                //                             <input
                //                                 type="text"
                //                                 className="block w-full p-2 rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
                //                                 value={example.content.text || ""}
                //                                 onChange={(e) => {
                //                                     const updatedExample = {
                //                                         ...example,
                //                                         content: { text: e.target.value },
                //                                     };
                //                                     const newArray = [...data[key]];
                //                                     newArray[idx] = updatedExample;
                //                                     onChange({ ...data, [key]: newArray });
                //                                 }}
                //                             />
                //                         </div>
                //                         {/* Remove example */}
                //                         <button
                //                             type="button"
                //                             className="text-red-400 hover:text-red-500"
                //                             onClick={() => {
                //                                 const newArray = data[key].filter(
                //                                     (_: any, i: number) => i !== idx
                //                                 );
                //                                 onChange({ ...data, [key]: newArray });
                //                             }}
                //                         >
                //                             ✕
                //                         </button>
                //                     </div>
                //                 ))}
                //             </div>
                //         </div>
                //     );
                // }

                // Style keys

                const isSecretsField = path.includes("settings") && path.includes("secrets");

                // Mask secrets values
                if (isSecretsField) {
                    return (
                        <div
                            key={key}
                            className="p-3 rounded border border-gray-700 bg-gray-800 space-y-2"
                        >
                            <div className="block text-sm font-semibold text-gray-200">
                                {key} (Masked)
                            </div>
                            {/* <input
                                type="text"
                                className="block w-full p-2 rounded border border-gray-600 bg-gray-700 text-gray-500 focus:outline-none"
                                value={"*".repeat(String(data[key]).length)} // Masked value
                                readOnly
                            /> */}
                            <textarea
                                className="block w-full p-2 rounded border border-gray-600 bg-gray-700 text-gray-500 focus:outline-none overflow-hidden"
                                style={{
                                    overflowWrap: "break-word",
                                    wordWrap: "break-word",
                                    whiteSpace: "pre-wrap",
                                }}
                                value={"*".repeat(String(data[key]).length)} // Masked value
                                readOnly
                            />
                        </div>
                    );
                }

                // Default object rendering
                return (
                    <div
                        key={key}
                        className="p-3 rounded border border-gray-700 bg-gray-800 space-y-2"
                    >
                        <div className="flex items-center justify-between">
                            <div className="block text-sm font-semibold text-gray-200">{key}</div>
                            {/* Add button beside editable keys */}
                            <button
                                type="button"
                                className="px-2 py-1 text-green-300 hover:text-green-400 border border-green-500 rounded bg-gray-900"
                                onClick={() => {
                                    const newArray = Array.isArray(data[key])
                                        ? [...data[key], ""]
                                        : { ...data[key], newKey: "" };
                                    const updatedData = { ...data, [key]: newArray };
                                    onChange(updatedData);
                                }}
                            >
                                +
                            </button>
                        </div>

                        {renderJsonForm(
                            data[key],
                            (updatedValue) => {
                                const updatedData = { ...data, [key]: updatedValue };
                                onChange(updatedData);
                            },
                            [...path, key]
                        )}
                    </div>
                );
            })}
        </div>
    );
}

const SearchParamsWrapper = ({ children }: { children: (searchParams: URLSearchParams) => JSX.Element }) => {
    const searchParams = useSearchParams();
    return children(searchParams);
};


const MemeLaunchPageContent = ({ searchParams }: { searchParams: URLSearchParams }) => {
    const router = useRouter();
    const MAX_FILE_SIZE_MB = 5;
    const wallet = useAnchorWallet();
    const { memeData, resetMemeData } = useMemeStore();
    const { username, email, password, twofa, setTwitterCredentials } = useTwitterAuthStore();
    const [showTrainingOptions, setShowTrainingOptions] = useState(false);
    const { selectedTicker, tickerInfo, setSelectedMemeTicker } = useTickerStore();
    //const searchParams = useSearchParams();
    const agentType = searchParams.get('agentType');
    const [tradeMode, setTradeMode] = useState<'automation' | 'authentication'>('automation');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { selectedModel, setSelectedModel } = useModelStore();

    const [isRefreshing, setIsRefreshing] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [showPdfUpload, setShowPdfUpload] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<FormDataType>({
        name: '',
        ticker: '',
        description: '',
        model: 'Pixtral-12b-2409',
        trainingData: null,
        webpageUrl: '',
        twitter: '',
        telegram: '',
        website: '',
        imageBase64: '',
        seed: '',
        walletAddress: '',
        prompt: '',
        trainingUrls: [],
        trainingPdfs: [],
        trainingImages: [],
        ...(agentType === 'super-agent' && { trade: '' }),
        ...(agentType === 'micro-agent' && { tradeMode: 'automation' })
    });
    const [characterJson, setCharacterJson] = useState(null);
    const [editableJson, setEditableJson] = useState<any>(null);

    const handleTradeModeChange = (mode: 'automation' | 'authentication') => {
        setTradeMode(mode); // This is your local state for the toggle
        setFormData((prev) => ({ ...prev, tradeMode: mode })); // Store the toggle option in formData
    };


    // const renderAgentSpecificFields = () => {
    //     if (agentType !== 'super-agent') return null;

    //     return (
    //         <div>
    //             <label className="block mb-2 text-lg">Trade</label>
    //             {/* <input
    //                 type="text"
    //                 name="trade"
    //                 value={formData.trade || ''}
    //                 onChange={(e) => handleChange(e)}
    //                 className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
    //                 placeholder="Enter trade details"
    //                 required
    //             /> */}

    //             <div className="mt-4">
    //                 <label className="block mb-2 text-sm">Setup Wallet via Telegram</label>
    //                 <button
    //                     type="button"
    //                     onClick={() =>
    //                         window.open('https://t.me/mpcsolanawalletbot', '_blank')
    //                     }
    //                     className="bg-blue-500 text-white px-4 py-2 rounded"
    //                 >
    //                     Open Telegram Bot
    //                 </button>
    //             </div>

    //             <div className="mt-4">
    //                 <label className="block mb-2 text-sm">Telegram ID</label>
    //                 <input
    //                     type="text"
    //                     name="trade"
    //                     value={formData.trade || ''}
    //                     onChange={handleChange}
    //                     className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
    //                     placeholder="Enter Telegram ID"
    //                     required
    //                 />
    //             </div>
    //         </div>
    //     );
    // };

    const renderAgentSpecificFields = () => {
        // Return null if neither micro nor super agent
        if (agentType !== 'micro-agent' && agentType !== 'super-agent') return null;

        if (agentType === 'micro-agent') {
            return (
                <div className="mt-2 border border-[#B9B9B9] bg-[#09090B] p-4 rounded-lg">
                    <div className="flex flex-row mb-2 justify-between">
                        <div className="flex flex-col">
                            <div className="text-[#7E7CCF] font-ttfirs text-lg">
                                AiFi: Trading
                            </div>
                            <div className="text-xs text-[#B9B9B9] font-ttfirs italic">Authenticate your telegram to enable trading</div>
                        </div>

                        {/* Toggle Switch */}
                        <div className="flex items-center justify-end space-x-2 border p-1 rounded-lg">
                            <button
                                onClick={() => handleTradeModeChange('automation')}
                                className={`px-2 py-1 rounded-md transition-colors text-xs ${tradeMode === 'automation'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-700 text-gray-300'
                                    }`}
                            >
                                Autonomous
                            </button>
                            <button
                                onClick={() => handleTradeModeChange('authentication')}
                                className={`px-2 py-1 rounded-md transition-colors text-xs ${tradeMode === 'authentication'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-700 text-gray-300'
                                    }`}
                            >
                                Self Signed
                            </button>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block mb-2 text-sm">Setup Wallet via Telegram</label>
                        <button
                            type="button"
                            onClick={() =>
                                window.open(
                                    tradeMode === 'automation'
                                        ? 'https://t.me/mpcsolanawalletbot'
                                        : 'https://t.me/microagentzkagibot',
                                    '_blank'
                                )
                            }
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            Open Telegram Bot
                        </button>
                    </div>

                    <div className="mt-4">
                        <label className="block mb-2 text-sm">
                            Telegram ID{" "}
                            <span className="text-xs text-gray-400 italic">
                                (Click{" "}
                                <a
                                    href="https://t.me/UserBotInfoBot?start=anything"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline text-blue-500"
                                >
                                    here
                                </a>
                                , open the bot, type <code>/start</code>, and you&apos;ll receive your Telegram ID. Paste it in the input below.)
                            </span>
                        </label>
                        <input
                            type="text"
                            name="trade"
                            value={formData.trade || ''}
                            onChange={handleChange}
                            className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                            placeholder="Enter Telegram ID"
                            required
                        />
                    </div>

                </div>
            );
        }

        // Super agent section (unchanged)
        return (
            <div className="mt-2 border border-[#B9B9B9] bg-[#09090B] p-4 rounded-lg">
                <div className="text-[#7E7CCF] font-ttfirs text-lg italic">
                    AiFi: Trading
                </div>
                <div className="text-xs text-[#B9B9B9] font-ttfirs">Authenticate your telegram to enable trading</div>


                <div className="mt-4">
                    <label className="block mb-2 text-sm">Setup Wallet via Telegram</label>
                    <button
                        type="button"
                        onClick={() =>
                            window.open('https://t.me/mpcsolanawalletbot', '_blank')
                        }
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Open Telegram Bot
                    </button>
                </div>

                <div className="mt-4">
                    <label className="block mb-2 text-sm">
                        Telegram ID{" "}
                        <span className="text-xs text-gray-400 italic">
                            (Click{" "}
                            <a
                                href="https://t.me/UserBotInfoBot?start=anything"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-blue-500 "
                            >
                                here
                            </a>
                            , open the bot, type <code>/start</code>, and you&apos;ll receive your Telegram ID. Paste it in the input below.)
                        </span>
                    </label>
                    <input
                        type="text"
                        name="trade"
                        value={formData.trade || ''}
                        onChange={handleChange}
                        className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                        placeholder="Enter Telegram ID"
                        required
                    />
                </div>
            </div>
        );
    };



    const models = [
        { name: 'Pixtral-12b-2409', enabled: false },
        { name: 'Llama3.1', enabled: false },
        { name: 'Qwen2.5', enabled: false },
        { name: 'Gemma 2', enabled: false },
        { name: 'Nemotron-4', enabled: false }
    ];

    useEffect(() => {
        if (memeData) {
            setIsLoading(false);
            setFormData({
                ...formData,
                name: memeData.name,
                description: memeData.description,
                imageBase64: memeData.base64Image,
                seed: memeData.seed,
                walletAddress: memeData.wallet,
                prompt: memeData.prompt
            });
        } else {
            const timer = setTimeout(() => {
                if (!memeData) {
                    router.push('/home');
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [memeData, router]);

    const handleTwitterCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Validate the field using the corresponding schema
        try {
            if (name === "username") {
                twitterSchema.shape.username.parse(value);
            } else if (name === "email") {
                twitterSchema.shape.email.parse(value);
            } else if (name === "password") {
                twitterSchema.shape.password.parse(value);
            } else if (name === "twofa") {
                twitterSchema.shape.twofa.parse(value);
            }
        } catch (error: any) {
            toast.error(error.message);
        }

        // Update the Twitter credentials in state as before
        setTwitterCredentials({ [name]: value });
    };



    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const removeTrainingFile = (type: 'pdf' | 'image', index: number) => {
        setFormData((prev) => ({
            ...prev,
            [type === 'pdf' ? 'trainingPdfs' : 'trainingImages']: prev[
                type === 'pdf' ? 'trainingPdfs' : 'trainingImages'
            ].filter((_, i) => i !== index)
        }));
    };

    const removeTrainingUrl = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            trainingUrls: prev.trainingUrls.filter((_, i) => i !== index)
        }));
    };

    const handleAddTrainingData = (type: 'pdf' | 'image' | 'twitter') => {
        if (type === 'twitter') {
            setFormData((prev) => ({
                ...prev,
                trainingUrls: [...prev.trainingUrls, '']
            }));
        } else if (type === 'pdf') {
            setShowPdfUpload(true);
        } else if (type === 'image') {
            setShowImageUpload(true);
        }
        setShowTrainingOptions(false);
    };


    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTwitterUrlChange = (index: number, url: string) => {
        setFormData((prev) => {
            const updatedUrls = [...prev.trainingUrls];
            updatedUrls[index] = url;
            return { ...prev, trainingUrls: updatedUrls };
        });
    };

    const calculateTotalFileSize = (files: File[]) => {
        return files.reduce((total, file) => total + file.size, 0) / (1024 * 1024); // Convert bytes to MB
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFile = files[0];
            const existingFiles = type === 'pdf' ? formData.trainingPdfs : formData.trainingImages;

            const totalSize = calculateTotalFileSize([...existingFiles, newFile]);
            if (totalSize > MAX_FILE_SIZE_MB) {
                toast.error('Total uploaded file size exceeds 5 MB.');
                return;
            }

            setFormData((prev) => ({
                ...prev,
                [type === 'pdf' ? 'trainingPdfs' : 'trainingImages']: [
                    ...prev[type === 'pdf' ? 'trainingPdfs' : 'trainingImages'],
                    newFile
                ]
            }));
        }
    };

    // const processTwitterData = async (twitterUrl: string) => {
    //     const client = new ApifyClient({
    //         token: 'apify_api_mdt6tlhZErHAe9WPbgUGhYGfeFugLd17oXzO',
    //     });

    //     try {
    //         const input = {
    //             handles: [twitterUrl],
    //             tweetsDesired: 10,
    //             proxyConfig: { useApifyProxy: true },
    //         };

    //         // Start the actor run
    //         const run = await client.actor("quacker/twitter-scraper").call(input);
    //         // Wait for the run to finish
    //         await client.run(run.id).waitForFinish();

    //         // Get the output from the dataset
    //         const { items } = await client.dataset(run.defaultDatasetId).listItems();

    //         // Extract only the full_text from each tweet item
    //         const tweetTexts = items.map(item => item.full_text);

    //         return tweetTexts;
    //     } catch (error) {
    //         console.error('Error fetching tweets:', error);
    //         return null;
    //     }
    // };

    const processTwitterData = async (twitterUrls: string[]) => {
        const client = new ApifyClient({
            token: 'apify_api_mdt6tlhZErHAe9WPbgUGhYGfeFugLd17oXzO',
        });

        const results = [];

        for (const twitterUrl of twitterUrls) {
            try {
                // Ensure the URL has a valid protocol
                let finalUrl = twitterUrl;
                if (!twitterUrl.startsWith('http://') && !twitterUrl.startsWith('https://')) {
                    finalUrl = `https://${twitterUrl}`;
                }

                // Extract the username from the URL
                const urlObj = new URL(finalUrl);
                const pathname = urlObj.pathname;
                const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
                const username = pathSegments[0]; // Assume the first segment is the username

                if (!username) {
                    console.warn(`Invalid username extracted from URL: ${twitterUrl}`);
                    continue;
                }

                console.log(`Processing tweets for username: ${username}`);

                const input = {
                    handles: [username],
                    tweetsDesired: 10,
                    proxyConfig: { useApifyProxy: true },
                };

                // Start the actor run
                const run = await client.actor("quacker/twitter-scraper").call(input);
                await client.run(run.id).waitForFinish();

                // Get the output from the dataset
                const { items } = await client.dataset(run.defaultDatasetId).listItems();
                const tweetTexts = items.map(item => item.full_text);

                // Store the result for this URL
                results.push({ username, tweets: tweetTexts });
            } catch (error) {
                console.error(`Error fetching tweets for URL: ${twitterUrl}`, error);
                results.push({ username: null, tweets: [] });
            }
        }

        return results;
    };

    const downloadJson = () => {
        if (!characterJson) return;
        const fileData = JSON.stringify(characterJson, null, 2);
        const blob = new Blob([fileData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        // Use the agent ticker if available or default to 'character'
        link.download = `${formData.ticker || "character"}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // const processTwitterData = async (twitterUrls: string[]) => {
    //     const client = new ApifyClient({
    //         token: 'apify_api_mdt6tlhZErHAe9WPbgUGhYGfeFugLd17oXzO',
    //     });

    //     const results = [];

    //     for (const twitterUrl of twitterUrls) {
    //         try {
    //             // Extract the username from the URL
    //             const urlObj = new URL(twitterUrl);
    //             const pathname = urlObj.pathname;
    //             const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
    //             const username = pathSegments[0]; // Assume the first segment is the username

    //             if (!username) {
    //                 console.warn(`Invalid username extracted from URL: ${twitterUrl}`);
    //                 continue;
    //             }

    //             console.log(`Processing tweets for username: ${username}`);

    //             const input = {
    //                 handles: [username],
    //                 tweetsDesired: 10,
    //                 proxyConfig: { useApifyProxy: true },
    //             };

    //             // Start the actor run
    //             const run = await client.actor("quacker/twitter-scraper").call(input);
    //             await client.run(run.id).waitForFinish();

    //             // Get the output from the dataset
    //             const { items } = await client.dataset(run.defaultDatasetId).listItems();
    //             const tweetTexts = items.map(item => item.full_text);

    //             // Store the result for this URL
    //             results.push({ username, tweets: tweetTexts });
    //         } catch (error) {
    //             console.error(`Error fetching tweets for URL: ${twitterUrl}`, error);
    //             results.push({ username: null, tweets: [] });
    //         }
    //     }

    //     return results;
    // };

    const { publicKey } = useWallet();

    const handleConfirmCharacter = async (finalJson: any, shouldRedirect = true) => {
        setError('');
        setSuccess(false);

        const updatedJson = {
            ...finalJson,
            plugins: [],
        };


        try {
            const saveResponse = await fetch('https://zynapse.zkagi.ai/characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': 'zk-123321'
                },
                body: JSON.stringify({
                    wallet_address: publicKey,
                    ticker: formData.ticker,
                    characteristics: updatedJson
                })
            });

            if (!saveResponse.ok) {
                throw new Error('Failed to save character data');
            }

            setSuccess(true);
            // If you want to reset the JSON so user sees "character confirmed"
            setCharacterJson(null);

            if (shouldRedirect) {
                router.push('/');
            }

        } catch (err) {
            console.error('Character save error:', err);
            setError('Failed to save character. Please try again.');
        }
    };

    // const handleLaunch = async () => {
    //     try {
    //         const { selectedTicker } = useTickerStore.getState();

    //         if (!selectedTicker) {
    //             throw new Error('No agent selected. Please use /select command first to choose an agent.');
    //         }

    //         // Fetch the list of all coins
    //         const coinsResponse = await fetch('https://zynapse.zkagi.ai/api/coins', {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'api-key': 'zk-123321',
    //             },
    //         });

    //         if (!coinsResponse.ok) {
    //             throw new Error('Failed to fetch coins list.');
    //         }

    //         const coinsData = await coinsResponse.json();
    //         const coins = coinsData.data;

    //         // Find the coin matching the selected ticker
    //         const selectedCoin = coins.find((coin: { ticker: string }) => coin.ticker === selectedTicker);

    //         if (!selectedCoin) {
    //             throw new Error(`No coin found for the ticker: ${selectedTicker}`);
    //         }

    //         // Use the `memecoin_address` from the selected coin
    //         const memecoinAddress = selectedCoin.memecoin_address;

    //         if (!memecoinAddress) {
    //             throw new Error(`No memecoin address found for the selected coin: ${selectedTicker}`);
    //         }

    //         // Perform the POST request to the `pmpCoinLaunch` API
    //         const launchResponse = await fetch('https://zynapse.zkagi.ai/api/pmpCoinLaunch', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 ticker: selectedTicker,
    //                 memecoin_address: memecoinAddress,
    //             }),
    //         });

    //         if (!launchResponse.ok) {
    //             throw new Error('Failed to launch coin.');
    //         }

    //         // Notify the user about the success
    //         toast.success(`Successfully launched memecoin for ticker: ${selectedTicker}`);
    //         router.push('/'); // Redirect to homepage
    //     } catch (error) {
    //         console.error('Error in handleLaunch:', error);
    //         toast.error(`Failed to launch coin. ${error}`);
    //     }
    // };

    //here
    const handleLaunch = async () => {
        const MAX_RETRIES = 5; // Maximum number of retries
        const RETRY_DELAY = 3000; // Delay between retries (in ms)

        try {
            const { selectedTicker } = useTickerStore.getState();

            if (!selectedTicker) {
                throw new Error('No agent selected. Please use /select command first to choose an agent.');
            }

            const coinsResponse = await fetch('https://zynapse.zkagi.ai/api/coins', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': 'zk-123321',
                },
            });

            if (!coinsResponse.ok) {
                throw new Error('Failed to fetch coins list.');
            }

            const coinsData: { data: Coin[] } = await coinsResponse.json();
            console.log('coinsData', coinsData)
            const coins = coinsData.data;

            const coinMap = new Map<string, Coin>(coins.map((coin) => [coin.ticker, coin]));
            const selectedCoin = coinMap.get(selectedTicker);

            if (!selectedCoin) {
                throw new Error(`No coin found for the ticker: ${selectedTicker}`);
            }

            let memecoinAddress = selectedCoin.memecoin_address;

            if (!memecoinAddress) {
                if (!wallet) {
                    throw new Error('Wallet not connected. Please connect your wallet and try again.');
                }

                const tokenResult = await TokenCreator({
                    name: selectedCoin.coin_name,
                    symbol: selectedCoin.ticker,
                    description: selectedCoin.description,
                    imageBase64: 'data:image/png;base64,' + selectedCoin.image_base64,
                    wallet,
                });

                console.log('Token created successfully:', tokenResult.signature);
                memecoinAddress = tokenResult.mintAddress;
            }

            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    const launchResponse = await fetch('https://zynapse.zkagi.ai/api/pmpCoinLaunch', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'api-key': 'zk-123321',
                        },
                        body: JSON.stringify({
                            ticker: selectedTicker,
                            memecoin_address: memecoinAddress,
                        }),
                    });

                    if (launchResponse.ok) {
                        toast.success(`Successfully launched memecoin for ticker: ${selectedTicker}`);
                        return true;
                    }

                    const errorMsg = `Attempt ${attempt} failed: ${launchResponse.statusText}`;
                    console.warn(errorMsg);

                    if (attempt === MAX_RETRIES) {
                        throw new Error('Maximum retry attempts reached.');
                    }

                    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
                } catch (innerError) {
                    if (attempt === MAX_RETRIES) {
                        throw new Error('Failed to launch coin after multiple attempts.');
                    }

                    console.warn(`Retrying... Attempt ${attempt} of ${MAX_RETRIES}`);
                    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
                }
            }
        } catch (error) {
            console.error('Error in handleLaunch:', error);
            toast.error(`Failed to launch coin: ${error}`);
            return false;
        }
    };

    const handleLaunchButtonClick = async () => {
        try {
            setIsSubmitting(true);
            console.log('Starting character confirmation process...');

            // Call handleConfirmCharacter but handle its success based on the response
            const confirmationResponse = await new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (characterJson === null) {
                        clearInterval(interval);
                        resolve({ success: true });
                    }
                }, 200);

                // Timeout logic
                setTimeout(() => {
                    clearInterval(interval);
                    resolve({ success: false });
                }, 60000);

                // Trigger the character confirmation logic
                handleConfirmCharacter(editableJson, false)
                    .then(() => {
                        console.log('handleConfirmCharacter successfully executed');
                        clearInterval(interval); // Ensure the interval is cleared when successful
                        resolve({ success: true });
                    })
                    .catch((error) => {
                        console.error('Error during character confirmation:', error);
                        clearInterval(interval); // Ensure the interval is cleared on failure
                        resolve({ success: false });
                    });
            });

            console.log('Character confirmation successful! Proceeding to launch...');

            // Proceed to coin launch only if character confirmation succeeds
            const launchSuccessful = await handleLaunch();

            if (launchSuccessful) {
                // Redirect to home page only if launch is successful
                router.push('/');
            } else {
                toast.error('Launch failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during launch:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };


    // const handleLaunchButtonClick = async () => {
    //     try {
    //         setIsSubmitting(true);

    //         console.log('Starting character confirmation process...');

    //         // Track confirmation success
    //         const isConfirmed = await new Promise<boolean>((resolve) => {
    //             const originalCharacterJson = characterJson; // Capture the current state
    //             const interval = setInterval(() => {
    //                 console.log('Checking characterJson state...', characterJson);

    //                 if (characterJson === null && originalCharacterJson !== null) {
    //                     console.log('Character confirmation successful!');
    //                     clearInterval(interval);
    //                     resolve(true);
    //                 }
    //             }, 100);

    //             // Timeout to prevent indefinite hanging
    //             setTimeout(() => {
    //                 console.log('Character confirmation timed out.');
    //                 clearInterval(interval);
    //                 resolve(false);
    //             }, 30000); // Increased timeout to 30 seconds

    //             // Call the confirm character logic
    //             handleConfirmCharacter(editableJson);
    //         });

    //         if (isConfirmed) {
    //             console.log('Launching...');
    //             await handleLaunch();
    //             router.push('/'); // Redirect to the home page
    //         } else {
    //             toast.error('Character confirmation failed. Launch operation aborted.');
    //         }
    //     } catch (error) {
    //         console.error('Error during launch:', error);
    //         toast.error('An error occurred. Please try again.');
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    const handleSubmit = async (e: React.FormEvent) => {
        setIsSubmitting(true);
        let twitterData: any[] | null = [];

        try {
            // First part remains the same until the character generation request
            const pdfTexts = await Promise.all(
                formData.trainingPdfs.map(async (file) => {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                    const textPromises = Array.from({ length: pdf.numPages }, async (_, i) => {
                        const page = await pdf.getPage(i + 1);
                        const content = await page.getTextContent();
                        return content.items.map((item: any) => item.str).join(' ');
                    });
                    const texts = await Promise.all(textPromises);
                    return texts.join('\n');
                })
            );

            const apiPayload = {
                coin_name: formData.name,
                memecoin_address: null,
                ticker: formData.ticker,
                description: formData.description,
                urls: formData.trainingUrls,
                training_data: {
                    pdfs: pdfTexts,
                    images: formData.trainingImages.map((file) => URL.createObjectURL(file)),
                    training_urls: formData.trainingUrls.filter(url => url.trim() !== '')
                },
                wallet_address: formData.walletAddress,
                image_base64: formData.imageBase64.replace(/^data:image\/\w+;base64,/, ''),
                seed: formData.seed,
                user_prompt: formData.prompt,
            };

            // Initial API call remains the same
            const response = await fetch('https://zynapse.zkagi.ai/api/coinLaunch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'api-key': 'zk-123321' },
                body: JSON.stringify(apiPayload)
            });

            if (!response.ok) throw new Error(`API call failed: ${response.statusText}`);

            const result = await response.json();
            toast.success(`Coin "${formData.name}" data has been successfully added!`);

            // Handle Telegram setup if needed (remains the same)
            if (agentType === 'super-agent' && formData.trade) {
                const telegramResponse = await fetch(
                    'http://34.67.134.209/swap',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': 'swap123',
                        },
                        body: JSON.stringify({
                            telegramId: formData.trade,
                            outputMint: 'cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij',
                        }),
                    }
                );

                if (!telegramResponse.ok) {
                    throw new Error(`Failed to complete Telegram wallet setup: ${telegramResponse.statusText}`);
                }
                toast.success('Telegram wallet setup successful!');
            }


            if (agentType === 'micro-agent') {
                if (formData.trade && formData.trade.trim() !== '') {
                    if (formData.tradeMode === 'automation') {
                        const telegramResponse = await fetch('http://34.67.134.209:3000/swap', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                telegramId: formData.trade,
                                outputMint: 'cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij',
                            }),
                        });
                        if (!telegramResponse.ok) {
                            throw new Error(`Failed to complete Telegram wallet setup: ${telegramResponse.statusText}`);
                        }
                        toast.success('Telegram wallet setup successful!');
                    } else if (formData.tradeMode === 'authentication') {
                        const telegramResponse = await fetch('http://34.67.134.209/swap', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                telegramId: formData.trade,
                                outputMint: 'cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij',
                            }),
                        });
                        if (!telegramResponse.ok) {
                            throw new Error(`Failed to complete Telegram wallet setup: ${telegramResponse.statusText}`);
                        }
                        toast.success('Telegram wallet setup successful!');
                    }
                } else {
                    console.log('No Telegram ID provided; skipping swap call.');
                }
            }


            // Store ticker info
            const tickerObject = {
                description: formData.description,
                memecoin_address: null,
                coin_name: formData.name,
                image_base64: formData.imageBase64,
                training_data: [
                    { type: 'pdfs', content: pdfTexts },
                    { type: 'images', content: formData.trainingImages.map((file) => URL.createObjectURL(file)) },
                    { type: 'urls', content: formData.trainingUrls.filter(url => url.trim() !== '') }
                ],
                urls: formData.trainingUrls,
                seed: parseInt(formData.seed) || 0,
                user_prompt: formData.prompt
            };
            useTickerStore.getState().setTickerInfo(formData.ticker, tickerObject);
            setSelectedMemeTicker(formData.ticker);

            const currentTicker = formData.ticker;

            // secondhalf 
            if (!currentTicker) {
                throw new Error('Selected ticker is null. Please set a valid ticker.');
            }
            // Prepare training data and twitter data
            const trainingData =
                useTickerStore.getState().tickerInfo[currentTicker]?.training_data || [];
            console.log('trainingData', trainingData)
            const twitterUrls =
                useTickerStore.getState().tickerInfo[currentTicker]?.urls || [];



            const twitterUrl = twitterUrls.find((url: string) =>
                url.includes('twitter.com') || url.includes('x.com')
            ) || '';

            // let finalUrl = twitterUrl;

            // if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            //     finalUrl = `https://${finalUrl}`;
            // }

            // if (finalUrl) {
            //     try {
            //         // Convert to URL object so we can parse the pathname
            //         const urlObj = new URL(finalUrl);
            //         const pathname = urlObj.pathname;  // e.g., /elonmusk/

            //         // Split on "/" and remove empty segments
            //         const pathSegments = pathname.split('/').filter(segment => segment.length > 0);

            //         // Assume the first segment is the username
            //         const username = pathSegments[0] || '';
            //         console.log('username', username)

            //         if (username) {
            //             // Now pass just the username instead of the whole URL
            //             twitterData = await processTwitterData(username);
            //             console.log('twitterData', twitterData)

            //             // Use twitterData as needed...
            //         }
            //     } catch (error) {
            //         console.error('Invalid Twitter/X URL:', error);
            //     }
            // }


            // Process Twitter data
            const twitterResults = await processTwitterData(formData.trainingUrls);

            // Modified character generation request with streaming
            const characterGenResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedModel,
                    messages: [
                        {
                            role: "system",
                            content: `You are an AI assistant tasked with generating a character.json file based on user-provided data. The file should include the following sections:

 Name: The character's name.

 Clients: A list of clients (if any).

 Plugins: [],

 ModelProvider: The model provider (e.g., "zkagi").

 Settings:

 Secrets: Any secrets related to the character.

 Voice: Voice settings, including the model (e.g., "en_US-male-medium").

 Bio: Key points about the character's background, achievements, and beliefs.

 Lore: Additional backstory about the character.

 Knowledge: Specific knowledge or insights the character has.

 MessageExamples: Examples of messages the character might send, including user interactions.

 PostExamples: Examples of posts the character might make.

 Topics: Key topics the character is associated with.

 Style:

 All: General stylistic elements.

 Chat: Stylistic elements specific to chat interactions.

 Post: Stylistic elements specific to posts.

 Adjectives: A list of adjectives commonly used by the character.

 Instructions:

 Extract Information: Read the user-provided data and extract relevant information for each section.

 Organize Data: Organize the extracted information into the appropriate sections.

 Format JSON: Ensure the final output is in valid JSON format.

 Avoid Example Data: Do not use any example data from the prompt. Only use the user-provided data to populate the fields.`
                        },
                        {
                            role: "user",
                            content: `Generate a character.json file using the following user-provided data:

 Character Name: Set the character's name to ${formData.ticker}.

 Twitter Data: Use the given tweets ${JSON.stringify(twitterResults)} to understand the voice tone, style, and topics associated with the character.

 Training Data: Use the training data ${JSON.stringify(trainingData)} to generate the rest of the data for the character, including bio, lore, knowledge, message examples, post examples, topics, style, and adjectives.

 Ensure the following:

 All fields in the character.json file are populated using the provided user data.

 Do not use any example data from the system prompt.

 The output should be in valid JSON format.

 Example Output Structure:
 {
   "name": "${formData.ticker}",
   "clients": [],  Populate using user data
   "plugins":[],
   "modelProvider": "",  Populate using user data
   "settings": {
     "secrets": {},  Populate using user data
     "voice": {
       "model": ""  Populate using user data
     }
   },
   "bio": [],  Populate using user data
   "lore": [],  Populate using user data
   "knowledge": [],  Populate using user data
   "messageExamples": [
   [
     {
       "user": "{{user1}}",
       "content": {
         "text": ""  Populate using user data
       }
     },
     {
       "user": "${formData.ticker}",
       "content": {
         "text": ""  Populate using user data
       }
     }
                        ],
                          [
     {
       "user": "{{user1}}",
       "content": {
         "text": ""  Populate using user data
       }
     },
     {
       "user": "${formData.ticker}",
       "content": {
         "text": ""  Populate using user data
       }
     }
                        ]
   ],
   "postExamples": [],  Populate using user data
   "topics": [],  Populate using user data
   "style": {
     "all": [],  Populate using user data
     "chat": [],  Populate using user data
     "post": []  Populate using user data
   },
   "adjectives": []  Populate using user data
 }`
                        }
                    ]
                })
            });

            if (!characterGenResponse.ok) throw new Error('Failed to generate character profile.');

            // Handle streaming response
            const reader = characterGenResponse.body?.getReader();
            if (!reader) throw new Error('No reader available');

            let accumulatedResponse = '';

            // Create a text decoder for the streaming data
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Decode the chunk and add it to accumulated response
                const chunk = decoder.decode(value);
                accumulatedResponse += chunk;

                // Check if we have a complete JSON structure
                if (accumulatedResponse.includes('```json') && accumulatedResponse.includes('```')) {
                    const jsonMatch = accumulatedResponse.match(/```json\n([\s\S]*?)\n```/);
                    if (jsonMatch && jsonMatch[1]) {
                        try {
                            const parsedJson = JSON.parse(jsonMatch[1]);
                            parsedJson.clients = ["twitter"];
                            parsedJson.modelProvider = "zkagi";
                            parsedJson.plugins = [];
                            parsedJson.settings.voice.model = "en_US-hfc_male-medium";
                            parsedJson.settings.secrets = {
                                TWITTER_USERNAME: username,
                                TWITTER_PASSWORD: password,
                                TWITTER_EMAIL: email,
                                TWITTER_2FA_SECRET: twofa,
                            };
                            setCharacterJson(parsedJson);
                            setEditableJson(parsedJson);
                        } catch (error) {
                            console.error('Error parsing JSON:', error);
                        }
                    }
                }

                // Check for proof in the stream
                if (chunk.includes('[PROOF]')) {
                    const proofMatch = chunk.match(/\[PROOF\] (.*)/);
                    if (proofMatch) {
                        console.log('Received proof:', proofMatch[1]);
                        // Handle the proof as needed
                    }
                }

                // Check for any error messages
                if (chunk.includes('[ERROR]')) {
                    const errorMatch = chunk.match(/\[ERROR\] (.*)/);
                    if (errorMatch) {
                        throw new Error(errorMatch[1]);
                    }
                }
            }

        } catch (error) {
            console.error('Error in submission process:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    const maskedJsonData = maskSecrets(editableJson);

    const handleRefresh = async () => {
        setIsRefreshing(true);

        const currentTicker = formData.ticker;

        if (!currentTicker) {
            throw new Error('Selected ticker is null. Please set a valid ticker.');
        }

        const trainingData =
            useTickerStore.getState().tickerInfo[currentTicker]?.training_data || [];

        const twitterResults = await processTwitterData(formData.trainingUrls);

        try {
            // Create a temporary state to hold streaming content
            let accumulatedContent = '';

            // Initialize response state
            setCharacterJson(null);

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedModel,
                    messages: [
                        {
                            role: "system",
                            content: `You are an AI assistant tasked with generating a character.json file based on user-provided data. The file should include the following sections:

Name: The character's name.

Clients: A list of clients (if any).

Plugins: []

ModelProvider: The model provider (e.g., "zkagi").

Settings:

Secrets: Any secrets related to the character.

Voice: Voice settings, including the model (e.g., "en_US-male-medium").

Bio: Key points about the character's background, achievements, and beliefs.

Lore: Additional backstory about the character.

Knowledge: Specific knowledge or insights the character has.

MessageExamples: Examples of messages the character might send, including user interactions.

PostExamples: Examples of posts the character might make.

Topics: Key topics the character is associated with.

Style:

All: General stylistic elements.

Chat: Stylistic elements specific to chat interactions.

Post: Stylistic elements specific to posts.

Adjectives: A list of adjectives commonly used by the character.

Instructions:

Extract Information: Read the user-provided data and extract relevant information for each section.

Organize Data: Organize the extracted information into the appropriate sections.

Format JSON: Ensure the final output is in valid JSON format.

Avoid Example Data: Do not use any example data from the prompt. Only use the user-provided data to populate the fields.`
                            // Your existing system message
                        },
                        {
                            role: "user",
                            content: `Generate a character.json file using the following user-provided data:

Character Name: Set the character's name to ${formData.ticker}.

Twitter Data: Use the given tweets ${JSON.stringify(twitterResults)} to understand the voice tone, style, and topics associated with the character.

Training Data: Use the training data ${JSON.stringify(trainingData)} to generate the rest of the data for the character, including bio, lore, knowledge, message examples, post examples, topics, style, and adjectives.

Ensure the following:

All fields in the character.json file are populated using the provided user data.

Do not use any example data from the system prompt.

The output should be in valid JSON format.

Example Output Structure:
{
  "name": "${formData.ticker}",
  "clients": [], // Populate using user data
  "plugins":[],
  "modelProvider": "", // Populate using user data
  "settings": {
    "secrets": {}, // Populate using user data
    "voice": {
      "model": "" // Populate using user data
    }
  },
  "bio": [], // Populate using user data
  "lore": [], // Populate using user data
  "knowledge": [], // Populate using user data
  "messageExamples": [
    {
      "user": "{{user1}}",
      "content": {
        "text": "" // Populate using user data
      }
    },
    {
      "user": "${formData.ticker}",
      "content": {
        "text": "" // Populate using user data
      }
    }
  ],
  "postExamples": [], // Populate using user data
  "topics": [], // Populate using user data
  "style": {
    "all": [], // Populate using user data
    "chat": [], // Populate using user data
    "post": [] // Populate using user data
  },
  "adjectives": [] // Populate using user data
}`
                        },
                    ],
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to regenerate character JSON.");
            }

            // Get the response reader
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            // Create a temporary div for accumulating JSON content
            let jsonContent = '';
            let foundJsonStart = false;

            // Read the stream
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Convert the chunk to text
                const chunk = new TextDecoder().decode(value);

                // Handle special messages (proof and errors)
                if (chunk.startsWith('data: [PROOF]')) {
                    // Handle proof if needed
                    continue;
                }

                if (chunk.startsWith('data: [ERROR]')) {
                    console.error('Stream error:', chunk);
                    continue;
                }

                // Accumulate the content
                accumulatedContent += chunk;

                // Look for JSON content
                if (!foundJsonStart && accumulatedContent.includes('```json')) {
                    foundJsonStart = true;
                    jsonContent = accumulatedContent.split('```json\n')[1];
                } else if (foundJsonStart) {
                    jsonContent += chunk;
                }

                // Try to parse JSON as it comes in
                if (foundJsonStart && jsonContent.includes('```')) {
                    const cleanJson = jsonContent.split('```')[0].trim();
                    try {
                        const parsedJson = JSON.parse(cleanJson);

                        // Preserve existing secrets and clients
                        const currentSecrets = editableJson?.settings?.secrets || {};
                        const currentClients = editableJson?.clients || [];

                        parsedJson.settings = {
                            ...parsedJson.settings,
                            secrets: currentSecrets,
                        };
                        parsedJson.clients = currentClients;

                        parsedJson.modelProvider = "zkagi";
                        parsedJson.plugins = [];
                        parsedJson.settings.voice.model = "en_US-hfc_male-medium";

                        // Update the UI with the parsed JSON
                        setCharacterJson(parsedJson);
                        setEditableJson(parsedJson);
                    } catch (e) {
                        // If JSON parsing fails, continue accumulating content
                        console.debug('Partial JSON not yet valid, continuing to accumulate');
                    }
                }

                // Optional: Update a progress indicator or streaming status
                // setStreamingProgress(accumulatedContent.length);
            }

            // Final validation of the complete response
            const jsonMatch = accumulatedContent.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                const parsedJson = JSON.parse(jsonMatch[1]);

                const currentSecrets = editableJson?.settings?.secrets || {};
                const currentClients = editableJson?.clients || [];

                parsedJson.settings = {
                    ...parsedJson.settings,
                    secrets: currentSecrets,
                };
                parsedJson.clients = currentClients;

                setCharacterJson(parsedJson);
                setEditableJson(parsedJson);
                toast.success("Character JSON refreshed successfully!");
            } else {
                throw new Error("Failed to parse the regenerated character JSON.");
            }

        } catch (error) {
            console.error("Error refreshing character JSON:", error);
            toast.error("Failed to refresh character JSON. Please try again.");
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="relative">
            {isRefreshing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 w-full h-full">
                    <div className="p-4 rounded shadow">
                        <p className="text-white text-xl text-center">
                            Refreshing... This may take up to 2 minutes.
                        </p>
                    </div>
                </div>
            )}
            <div className="min-h-screen bg-[#08121f] text-white p-4">
                <div className="max-w-full mx-auto">
                    <div className="mb-6 flex justify-between items-center">
                        <ArrowLeft
                            className="w-6 h-6 mr-4 cursor-pointer"
                            onClick={() => router.back()}
                        />
                        {characterJson && (
                            <ButtonV1New
                                onClick={handleRefresh} width="w-1/6"
                            >
                                {isRefreshing ? "Refreshing..." : "Refresh"}
                            </ButtonV1New>
                        )}
                    </div>

                    {!characterJson ? (
                        <div className="space-y-5 max-w-full mx-auto items-center">

                            <Form onSubmit={handleSubmit}>
                                {({ submit }) => (
                                    <div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="mx-4 space-y-5 border-2 border-[#B9B9B9] rounded-lg bg-[#343B4F] p-4">
                                                <div className="text-[#7E7CCF] font-ttfirs text-xl">
                                                    AGENT INFORMATION
                                                </div>
                                                <div className="bg-[#09090B] border border-[#B9B9B9] p-4 rounded-lg">
                                                    <label className="block text-sm">Agent Name</label>
                                                    <p className="text-xs text-[#B9B9B9] font-ttfirs italic mb-2">Name your agent and make it unique to your brand</p>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                                                        placeholder="Cool Tiger"
                                                        required
                                                    />
                                                </div>

                                                <div className="bg-[#09090B] border border-[#B9B9B9] p-4 rounded-lg">
                                                    <label className="block text-sm">Ticker</label>
                                                    <p className="text-xs text-[#B9B9B9] font-ttfirs italic mb-2">Add a unqiue ticker name for your agent, this will be used as your token in future</p>
                                                    <input
                                                        type="text"
                                                        name="ticker"
                                                        value={formData.ticker}
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                                                        placeholder="Enter Ticker Name"
                                                        required
                                                    />
                                                </div>

                                                <div className="bg-[#09090B] border border-[#B9B9B9] p-4 rounded-lg">
                                                    <label className="block text-sm">Description</label>
                                                    <p className="text-xs text-[#B9B9B9] font-ttfirs italic mb-2">Describe your AI agent, this information will be used for display purposes wherever your agent is listed</p>
                                                    <textarea
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700 h-32"
                                                        placeholder="Get ready to roar with style!"
                                                        required
                                                    />
                                                </div>

                                                <div className="bg-[#09090B] border border-[#B9B9B9] p-4 rounded-lg">
                                                    <label className="block  text-sm">Choose Model</label>
                                                    <p className="text-xs text-[#B9B9B9] font-ttfirs italic mb-2">Choose a model for your AI agents text-gen</p>
                                                    <select
                                                        name="model"
                                                        value={formData.model}
                                                        onChange={handleSelectChange}
                                                        className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                                                    >
                                                        {models.map((model) => (
                                                            <option
                                                                key={model.name}
                                                                value={model.name}
                                                                disabled={!model.enabled}
                                                            >
                                                                {model.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="bg-[#09090B] border border-[#B9B9B9] p-4 rounded-lg">
                                                    <label className="block text-sm">Agent&apos;s Twitter Handle</label>
                                                    <p className="text-xs text-[#B9B9B9] font-ttfirs italic mb-2">Add your agent&apos;s twitter profile(if any), this will not be used for training purposes</p>
                                                    <input
                                                        type="text"
                                                        name="twitter"
                                                        value={formData.twitter}
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                                                        placeholder="(optional)"
                                                    />
                                                </div>

                                                <div className="bg-[#09090B] border border-[#B9B9B9] p-4 rounded-lg">
                                                    <label className="block  text-sm">Agent&apos;s Telegram Handle</label>
                                                    <p className="text-xs text-[#B9B9B9] font-ttfirs italic mb-2">Add your agent&apos;s telegram profile(if any),  this will not be used for training purposes</p>
                                                    <input
                                                        type="text"
                                                        name="telegram"
                                                        value={formData.telegram}
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                                                        placeholder="(optional)"
                                                    />
                                                </div>

                                                <div className="bg-[#09090B] border border-[#B9B9B9] p-4 rounded-lg">
                                                    <label className="block  text-sm">Agent&apos;s Website</label>
                                                    <p className="text-xs text-[#B9B9B9] font-ttfirs italic mb-2">Add your agent&apos;s website (if any),  this will not be used for training purposes </p>
                                                    <input
                                                        type="url"
                                                        name="website"
                                                        value={formData.website}
                                                        onChange={handleChange}
                                                        className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                                                        placeholder="(optional)"
                                                    />
                                                </div>

                                            </div>

                                            <div className="mr-4 space-y-5">

                                                <div className="border-2 border-[#B9B9B9] rounded-lg bg-[#343B4F] p-4">
                                                    <div className="mb-4">
                                                        <div className="text-[#7E7CCF] font-ttfirs text-xl">
                                                            TRAIN YOUR AGENT
                                                        </div>
                                                        <div className="text-xs text-[#B9B9B9] font-ttfirs">Upload data or links to customize your agent&apos;sresponses.</div>
                                                    </div>
                                                    <label className="block mb-2 text-sm">Training Data <span className="text-xs text-gray-400 mt-2">
                                                        Maximum total upload size: 5 MB (including PDFs and images).
                                                    </span></label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowTrainingOptions(true)}
                                                        className="bg-blue-500 text-white px-4 py-2 rounded"
                                                    >
                                                        + Add Training Data
                                                    </button>
                                                    {showTrainingOptions && (
                                                        <div className="mt-2 space-y-2">
                                                            <button
                                                                onClick={() => handleAddTrainingData('pdf')}
                                                                className="block w-full bg-gray-700 text-white px-4 py-2 rounded"
                                                            >
                                                                Add PDF
                                                            </button>
                                                            <button
                                                                onClick={() => handleAddTrainingData('image')}
                                                                className="block w-full bg-gray-700 text-white px-4 py-2 rounded"
                                                            >
                                                                Add Image
                                                            </button>
                                                            <button
                                                                onClick={() => handleAddTrainingData('twitter')}
                                                                className="block w-full bg-gray-700 text-white px-4 py-2 rounded"
                                                            >
                                                                Add Twitter URL
                                                            </button>
                                                        </div>
                                                    )}

                                                    {showPdfUpload && (
                                                        <div className="relative mt-5">
                                                            <button
                                                                type="button"
                                                                className="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-600"
                                                                onClick={() => document.getElementById('fileInput')?.click()}
                                                            >
                                                                Upload PDF type Training Data
                                                            </button>
                                                            <input
                                                                type="file"
                                                                id="fileInput"
                                                                accept=".pdf"
                                                                onChange={(e) => handleFileUpload(e, 'pdf')}
                                                                className="hidden"
                                                            />
                                                        </div>
                                                    )}

                                                    {showImageUpload && (
                                                        <div className="relative mt-4">
                                                            <button
                                                                type="button"
                                                                className="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-600"
                                                                onClick={() => document.getElementById('imageInput')?.click()}
                                                            >
                                                                Upload Image type Training Data
                                                            </button>
                                                            <input
                                                                type="file"
                                                                id="imageInput"
                                                                accept="image/*"
                                                                onChange={(e) => handleFileUpload(e, 'image')}
                                                                className="hidden"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Display uploaded files */}
                                                    {/* {formData.trainingPdfs.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium">Uploaded Training PDFs:</p>
                                <ul className="list-disc pl-5">
                                    {formData.trainingPdfs.map((file, index) => (
                                        <li key={index} className="text-sm">{file.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )} */}

                                                    {formData.trainingPdfs.length > 0 && (
                                                        <div className="mt-4">
                                                            <p className="text-sm font-medium">Uploaded Training PDFs:</p>
                                                            <ul className="list-disc pl-5">
                                                                {formData.trainingPdfs.map((file, index) => (
                                                                    <li key={index} className="flex items-center text-sm">
                                                                        {file.name}
                                                                        <button
                                                                            onClick={() => removeTrainingFile('pdf', index)}
                                                                            className="ml-2 text-red-500 hover:text-red-700"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {/* 
                        {formData.trainingImages.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium">Uploaded Training Images:</p>
                                <ul className="list-disc pl-5">
                                    {formData.trainingImages.map((file, index) => (
                                        <li key={index} className="text-sm">{file.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}*/}
                                                </div>
                                                {formData.trainingImages.length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="text-sm font-medium">Uploaded Training Images:</p>
                                                        <ul className="list-disc pl-5">
                                                            {formData.trainingImages.map((file, index) => (
                                                                <li key={index} className="flex items-center text-sm">
                                                                    {file.name}
                                                                    <button
                                                                        onClick={() => removeTrainingFile('image', index)}
                                                                        className="ml-2 text-red-500 hover:text-red-700"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* {formData.trainingUrls.map((url, index) => (
                        <div key={index} className="mt-2">
                            <label className="block mb-2 text-sm">Twitter URL {index + 1} for training data</label>
                            <input
                                type="text"
                                name="twitter"
                                value={url}
                                onChange={(e) => handleTwitterUrlChange(index, e.target.value)}
                                className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                            />
                        </div>
                    ))} */}
                                                {formData.trainingUrls.map((url, index) => (
                                                    <div key={index} className="flex items-center mt-2">
                                                        <label className="block mb-2 text-sm">Upload Twitter URL {index + 1} for training data:</label>
                                                        <input
                                                            type="text"
                                                            name="twitter"
                                                            value={url}
                                                            onChange={(e) => handleTwitterUrlChange(index, e.target.value)}
                                                            className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                                                        />
                                                        <button
                                                            onClick={() => removeTrainingUrl(index)}
                                                            className="ml-2 text-red-500 hover:text-red-700"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                                {/* <div>
                        <label className="block mb-2 text-sm">Webpage URL</label>
                        <input
                            type="url"
                            name="webpageUrl"
                            value={formData.webpageUrl}
                            onChange={handleChange}
                            className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                            placeholder="(upload Link)"
                        />
                    </div> */}
                                                <div className='border-2 border-[#B9B9B9] rounded-lg bg-[#343B4F] p-4'>
                                                    <div className="mb-4">
                                                        <div className="text-[#7E7CCF] font-ttfirs text-xl">
                                                            ENHANCE YOUR AGENT&apos;s CAPABILITIES
                                                        </div>
                                                        <div className="text-xs text-[#B9B9B9] font-ttfirs">Choose optional features to supercharge your agent</div>
                                                    </div>

                                                    <div className='border border-[#B9B9B9] bg-[#09090B] p-4 rounded-lg'>
                                                        <div className="mb-4">
                                                            <div className="text-[#7E7CCF] font-ttfirs text-lg">
                                                                SOCIAL CONTENT ENGINE
                                                            </div>
                                                            <div className="text-xs text-[#B9B9B9] font-ttfirs italic">Upon providing your credentials of your twitter handle your provided training data will be utilized to regulalry post content</div>
                                                        </div>
                                                        <div className="bg-yellow-200 text-yellow-900 p-4 rounded mb-6">
                                                            <p className="mb-2">
                                                                ⚠️ <strong>Ensure the following before proceeding:</strong>
                                                            </p>
                                                            <ul className="list-disc list-inside">
                                                                <li>Disable <strong>Google/Social Sign-In</strong> if enabled. Use your email and password for login.</li>
                                                            </ul>
                                                        </div>

                                                        <div className="mb-1">
                                                            <label className="block mb-2 text-sm">Twitter Username</label>
                                                            <input
                                                                type="text"
                                                                name="username"
                                                                onChange={handleTwitterCredentialsChange}
                                                                className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                                                                placeholder="Enter Twitter Username"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="mb-1">
                                                            <label className="block mb-2 text-sm">Twitter Email</label>
                                                            <input
                                                                type="email"
                                                                name="email"
                                                                onChange={handleTwitterCredentialsChange}
                                                                className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                                                                placeholder="Enter Twitter Email"
                                                                required
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block mb-2 text-sm">Twitter Password</label>
                                                            <input
                                                                type="password"
                                                                name="password"
                                                                onChange={handleTwitterCredentialsChange}
                                                                className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                                                                placeholder="Enter Twitter Password"
                                                                required
                                                            />
                                                        </div>

                                                        <div>
                                                            <h1 className="text-xs border my-2 p-2 bg-yellow-200 text-yellow-900 rounded-lg ">
                                                                <strong className="italic font-bold text-xs">HOW TO ACCESS 2FA SECRET </strong>
                                                                Log into your twitter handle &gt; Go to settings and account access &gt; Security &gt;
                                                                <strong>2-Factor Authentication</strong> &gt; Check the Authentication App Checkbox &gt;
                                                                Click get started &gt; Click can&apos;t scan code &gt; COPY and Paste the code in 2FA section.
                                                            </h1>

                                                            <label className="block mb-2 text-sm">Twitter 2FA Secret</label>
                                                            <input
                                                                type="twofa"
                                                                name="twofa"
                                                                onChange={handleTwitterCredentialsChange}
                                                                className="w-full bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                                                                placeholder="Enter Twitter Password"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    {renderAgentSpecificFields()}
                                                </div>

                                            </div>
                                        </div>


                                        {/* <button
                                        type="button"
                                        onClick={submit}
                                        disabled={isSubmitting}
                                        className="w-full bg-white text-black font-bold py-4 rounded-lg mt-6 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'PROCESSING...' : 'NEXT'}
                                    </button> */}
                                        {isSubmitting && !isRefreshing && (
                                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                                                <div className="p-4 rounded shadow">
                                                    <p className="text-white text-2xl text-center">
                                                        Generating character json...
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex flex-col items-center justify-center mt-4">
                                            <div className="text-xs text-center text-gray-400 mb-4">
                                                TIP : Agent Ticker & Image cannot be changed after creation.
                                            </div>
                                            <div className="w-1/2">
                                                <ButtonV2New isSubmitting={isSubmitting} onClick={submit} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Form>
                        </div>
                    ) : (
                        // <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        //     <h2 className="text-xl font-semibold mb-6 text-white">Character JSON</h2>
                        //     <div className="overflow-x-auto bg-gray-800 p-6 rounded-lg text-sm">
                        //         <JsonViewer
                        //             value={characterJson}
                        //             theme="dark"
                        //         />
                        //     </div>
                        //     <div className="flex gap-4">
                        //         <button
                        //             onClick={() => handleConfirmCharacter(characterJson)}
                        //             className="bg-green-500 px-4 py-2 rounded text-white font-semibold"
                        //         >
                        //             Confirm Character
                        //         </button>
                        //         <button
                        //             onClick={handleLaunch}
                        //             className="bg-blue-500 px-4 py-2 rounded text-white font-semibold"
                        //         >
                        //             Launch
                        //         </button>
                        //     </div>
                        // </div>

                        //                 <div className="flex flex-col md:flex-row gap-4 ">
                        //                     {/* JSON Editor / Viewer */}
                        //                     <div className="md:w-1/2 w-full overflow-x-auto bg-gray-800 p-6 rounded-lg text-sm">
                        //                         <h2 className="text-xl font-semibold mb-4">Character JSON Viewer</h2>
                        //                         <JsonViewer
                        //                             value={maskedJsonData}
                        //                             theme="dark"
                        //                         />
                        //                     </div>

                        //                     {/* JSON Form */}
                        //                     <div className="md:w-1/2 w-full bg-gray-900 p-6 rounded-lg text-sm">
                        //                         <h2 className="text-xl font-semibold mb-4">Edit Character JSON</h2>
                        //                         {/* 
                        //     We'll create a separate function or inline code for 
                        //     rendering a form that can traverse the JSON structure 
                        //   */}
                        //                         {renderJsonForm(maskedJsonData, setEditableJson)}


                        //                     </div> 
                        //                 </div>

                        <div>
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* JSON Editor / Viewer */}
                                <div className="md:w-1/2 w-full overflow-x-auto bg-gray-800 p-6 rounded-lg text-sm">
                                    <div className="flex flex-row justify-between">
                                        <h2 className="text-xl font-semibold mb-4">Character JSON Viewer</h2>
                                        <button
                                            onClick={downloadJson}
                                            className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mb-2"
                                        >
                                            Export JSON
                                        </button>
                                    </div>
                                    <JsonViewer value={maskedJsonData} theme="dark" />
                                </div>


                                {/* JSON Form */}
                                <div className="md:w-1/2 w-full bg-gray-900 p-6 rounded-lg text-sm">
                                    <h2 className="text-xl font-semibold mb-4">Edit Character JSON</h2>
                                    {renderJsonForm(maskedJsonData, setEditableJson)}
                                </div>
                            </div>


                            <div className="flex justify-center gap-4 mt-4">
                                <ButtonV1New
                                    onClick={() => handleConfirmCharacter(editableJson, true)}
                                >
                                    Create Agent
                                </ButtonV1New>
                                {/* <ButtonV1New
                                onClick={handleLaunchButtonClick}
                            >
                                Launch
                            </ButtonV1New> */}
                            </div>
                        </div>

                    )}

                </div>
            </div>
        </div>
    );
};

const MemeLaunchPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchParamsWrapper>
                {(searchParams) => <MemeLaunchPageContent searchParams={searchParams} />}
            </SearchParamsWrapper>
        </Suspense>
    );
};

export default MemeLaunchPage;
