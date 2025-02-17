'use client';
import { FC, useState, useEffect, useRef } from 'react';
import { BiMenuAltLeft, BiMenuAltRight } from 'react-icons/bi';
import { BsArrowReturnLeft } from 'react-icons/bs';
import { FaPen } from 'react-icons/fa';
import { HiDotsVertical } from 'react-icons/hi';
import { TbLayoutSidebarLeftCollapseFilled } from "react-icons/tb";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import Image from 'next/image';
import createNft from '../../component/MintNFT';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSession } from 'next-auth/react';
import ResultBlock from '@/component/ui/ResultBlock';
import * as pdfjs from 'pdfjs-dist';
import { useRouter } from 'next/navigation';
// import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useMemeStore } from '@/stores/meme-store';
import { ApifyClient } from 'apify-client';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { IoMdClose } from "react-icons/io";
import TweetPanel from '@/component/ui/TweetPanel';
import CommandPopup from '@/component/ui/CommandPopup';
import { ReactNode } from 'react';
import { useTickerStore } from '@/stores/ticker-store';
import TickerSelector from '@/component/ui/TickerSelector';
import React from 'react';
import { useTwitterStore } from '@/stores/twitter-store';
import TokenSetup from '@/component/ui/TokenSetup';
import GeneratedTweetsTable from '@/component/ui/GenerateTweetTable';
import TweetTable from '@/component/ui/TweetTable';
import CharacterGenForm from '@/component/ui/CharecterGen';
import { TokenCreator } from '../memelaunch/tokenCreator';
import { CustomWalletButton } from '@/component/ui/CustomWalletButton';
import { toast } from 'sonner';
import { useCharacterEditStore } from '@/stores/edit-store';
import { useConversationStore } from '@/stores/conversation-store';
import { useCharacterStore } from '@/stores/charecter-store';
import CharecterJsonEditor from '@/component/ui/CharecterJsonEditor';
import { useFormStore } from '@/stores/form-store';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { CreateAgentModal } from '@/component/ui/AgentModal';
import { useModelStore } from '@/stores/useModel-store';
import ApiKeyBlock from '@/component/ui/ApiKeyBlock';
import ConnectWalletModal from '../../component/ui/ConnectWalletModal';
import PresaleBanner from '@/component/ui/PreSaleBanner';
import { useWhitelistStore } from '@/stores/use-whitelist-store';
import { FcAudioFile } from 'react-icons/fc';


interface GeneratedTweet {
    tweet: string;
    id?: number;
}

//type Command = 'image-gen' | 'create-agent' | 'content';
type Command = 'image-gen' | 'create-agent' | 'select' | 'post' | 'tokens' | 'tweet' | 'tweets' | 'generate-tweet' | 'generate-tweet-image' | 'generate-tweet-images' | 'save' | 'saves' | 'character-gen' | 'launch' | 'train' | 'video-lipsync' | 'UGC' | 'img-to-video' | 'api';

interface TickerPopupProps {
    tickers: string[];
    onSelect: (ticker: string) => void;
}

// interface CommandPopupProps {
//     onSelect: (command: Command, option?: string) => void;
// }


interface TickerOption {
    name: string;
}

interface CommandPopupProps {
    onSelect: (command: Command) => void;
}

interface TickerInfo {
    name: string;
    info: any; // Response from contentengine_knowledgebase API
}

interface FileSystemFileHandle {
    createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
    write(data: any): Promise<void>;
    close(): Promise<void>;
}

interface ShowSaveFilePickerOptions {
    suggestedName?: string;
    types?: Array<{
        description: string;
        accept: Record<string, string[]>;
    }>;
}

interface AgentTypePopupProps {
    onSelect: (agentType: string) => void;
}

const AgentTypePopup: React.FC<AgentTypePopupProps> = ({ onSelect }) => (
    <div className="absolute bottom-full mb-2 bg-[#171D3D] rounded-lg shadow-lg z-50">
        {['Micro-Agent', 'Super-Agent', 'Secret-Agent'].map((agent, index) => (
            <button
                key={index}
                onClick={() => onSelect(agent.toLowerCase().replace(' ', '-'))}
                className="block w-full text-left px-4 py-2 hover:bg-[#24284E] text-white"
            >
                {agent}
            </button>
        ))}
    </div>
);


// Extend the window interface
declare global {
    interface Window {
        showSaveFilePicker?: (options?: ShowSaveFilePickerOptions) => Promise<FileSystemFileHandle>;
    }
}

// interface FileObject {
//     file: File;
//     preview: string;
//     isPdf: boolean;
//     isVideoOrAudio?: boolean;
// }


interface FileObject {
    file: File;
    preview: string;
    isPdf: boolean;
    isVideoOrAudio?: boolean;
}


interface Message {
    role: 'user' | 'assistant';
    content: string | ReactNode | Array<{
        type: 'text' | 'image_url';
        text?: string;
        image_url?: { url: string };
    }>;
    type?: 'text' | 'image' | 'image_url' | 'command';
    proof?: any;
    command?: string;
    seed?: string;
}



// const CommandPopup: React.FC<CommandPopupProps> = ({ onSelect }) => (
//     <div className="absolute bottom-full left-0 bg-[#171D3D] rounded-lg shadow-lg">
//         <button onClick={() => onSelect('image-gen')} className="block w-full text-left px-4 py-2 hover:bg-[#24284E]">
//             /image-gen
//         </button>
//         <button onClick={() => onSelect('meme-coin')} className="block w-full text-left px-4 py-2 hover:bg-[#24284E]">
//             /meme-coin
//         </button>
//         <button onClick={() => onSelect('content')} className="block w-full text-left px-4 py-2 hover:bg-[#24284E]">
//             /content
//         </button>
//     </div>
// );


const TickerPopup: React.FC<TickerPopupProps> = ({ tickers, onSelect }) => (
    <div className="absolute bottom-full left-0 bg-[#171D3D] rounded-lg shadow-lg">
        {tickers.map((ticker, index) => (
            <button
                key={index}
                onClick={() => onSelect(ticker)}
                className="block w-full text-left px-4 py-2 hover:bg-[#24284E]"
            >
                {ticker}
            </button>
        ))}
    </div>
);


async function fetcher(url: any, apiKey: any, walletAddress: any) {
    const res = await fetch(`${url}?wallet_address=${walletAddress}`, {
        headers: {
            'Content-Type': 'application/json',
            'api-key': apiKey
        }
    });

    if (res.status === 404) {
        return [];
    }

    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }
    return res.json();
}

const apiKey = process.env.NEXT_PUBLIC_API_KEY;
const AGENTS_API_URL = 'https://zynapse.zkagi.ai/characters/status';
const TOGGLE_API_URL = 'https://zynapse.zkagi.ai/characters/toggle-status';



const HomeContent: FC = () => {
    const wallet = useWallet();
    const { connected } = useWallet();
    const { data: session, status } = useSession();
    const [files, setFiles] = useState<FileObject[]>([]);
    const [fileInput, setFileInput] = useState<File | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    // const [proofData, setProofData] = useState(null);
    const [proofData, setProofData] = useState<string | null>(null);
    const [resultType, setResultType] = useState('');
    const [pdfContent, setPdfContent] = useState<string | null>(null);
    const [currentPdfName, setCurrentPdfName] = useState<string | null>(null);
    const [showCommandPopup, setShowCommandPopup] = useState(false);
    const [commandPart, setCommandPart] = useState('');
    const [normalPart, setNormalPart] = useState('');
    // const inputRef = useRef<HTMLInputElement>(null);
    const [mergedVideoUrl, setMergedVideoUrl] = useState<string | null>(null);
    const [imageResultType, setImageResultType] = useState<string | null>(null);

    const [thoughtsMap, setThoughtsMap] = useState<Record<number, string | null>>({});

    const [showCreateAgentModal, setShowCreateAgentModal] = useState(false);

    // const [showAgentTypePopup, setShowAgentTypePopup] = useState(false);
    const [selectedAgentType, setSelectedAgentType] = useState<string | null>(null);

    const { editMode, setEditMode } = useCharacterEditStore();
    const { messages, addMessage, setMessages } = useConversationStore.getState();
    const { setCharacterJson } = useCharacterStore();

    const router = useRouter();
    const [currentCommand, setCurrentCommand] = useState<'image-gen' | 'create-agent' | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(true);
    const [activeNavbarTicker, setActiveNavbarTicker] = useState<string | null>(null);
    const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);

    const inputRef = useRef<HTMLTextAreaElement>(null);

    const [launchMode, setLaunchMode] = useState<boolean>(false);
    const [processingCommand, setProcessingCommand] = useState<boolean>(false);
    const [launchCoins, setLaunchCoins] = useState<any[]>([]);

    const [isInitialView, setIsInitialView] = useState(true);
    const [isToggleAllowed, setIsToggleAllowed] = useState(true);

    const { checkWhitelist, isWhitelisted } = useWhitelistStore();

    // const [showTickerTable, setShowTickerTable] = useState(false);
    const { setAvailableTickers, setSelectedMemeTicker, availableTickers } = useTickerStore();

    const [openThoughtsMap, setOpenThoughtsMap] = useState<Record<number, boolean>>({});

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // const [tickerInfoMap, setTickerInfoMap] = useState<Map<string, any>>(new Map());
    // const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

    const [showTweetPanel, setShowTweetPanel] = useState(false);
    // const [generatedTweets, setGeneratedTweets] = useState<{ tweet: any }[]>([]);
    const [generatedTweets, setGeneratedTweets] = useState<GeneratedTweet[]>([]);
    const [lastSavedCommand, setLastSavedCommand] = useState<string>('');

    // const { address } = useAccount();
    // const { data: walletClient } = useWalletClient();
    // const publicClient = usePublicClient();

    const { selectedModel, setSelectedModel } = useModelStore();
    const [isOpen, setIsOpen] = useState(false);

    const [displayMessages, setDisplayMessages] = useState<Message[]>([]); // Array for messages to be displayed
    const [apiMessages, setApiMessages] = useState<Message[]>([]);

    const [currentSeed, setCurrentSeed] = useState<string | null>(null);
    const [tickerOptions, setTickerOptions] = useState<TickerOption[]>([]);
    const [showTickerPicker, setShowTickerPicker] = useState(false);
    const [showTickerPopup, setShowTickerPopup] = useState(false);
    const [tickers, setTickers] = useState<string[]>([]);
    const [showConnectModal, setShowConnectModal] = useState(false);

    const [tweets, setTweets] = useState([]);
    const [filteredCoins, setFilteredCoins] = useState([]);

    const [videoLipsyncOption, setVideoLipsyncOption] = useState<string | null>(null);
    const [showVideoLipsyncOption, setShowVideoLipsyncOption] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const walletAddress = wallet.publicKey ? wallet.publicKey.toString() : '';
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [displayMessages, isLoading]);


    const { data: tickersData } = useSWR(
        walletAddress ? [AGENTS_API_URL, apiKey, walletAddress] : null,
        ([url, key, addr]) => fetcher(url, key, addr),
        {
            refreshInterval: 15000,
        }
    );

    let content;

    useEffect(() => {
        if (!wallet.connected) {
            setShowConnectModal(true);
        } else {
            setShowConnectModal(false);
        }
    }, [wallet.connected]);

    if (!tickersData) {
        content = <div>Loading...</div>;
    } else {
        content = (
            <div>
                {tickersData.map((item: any, index: number) => (
                    <div
                        key={index}
                        className="cursor-pointer hover:bg-gray-700 p-2 rounded flex items-center space-x-2"
                        onClick={() => toggleTickerStatus(item.ticker, item.status)}
                    >
                        <span
                            className={`inline-block w-3 h-3 rounded-full ${item.status ? 'bg-green-500' : 'bg-red-500'
                                }`}
                        ></span>
                        <span>{item.ticker}</span>
                    </div>
                ))}
            </div>
        );
    }

    let mergedTickers: any[] = [];

    if (walletAddress) {
        mergedTickers = tickers.map((ticker) => {
            const tickerData = (tickersData || []).find((item: any) => item.ticker === ticker);
            return {
                ticker,
                status: tickerData ? tickerData.status === 'true' : null, // `null` if no character
            };
        });
    }

    useEffect(() => {
        if (wallet.connected && walletAddress) {
            checkWhitelist(walletAddress);
        }
    }, [wallet.connected, walletAddress, checkWhitelist]);


    async function toggleTickerStatus(ticker: string | number | bigint | boolean | React.ReactPortal | Promise<React.AwaitedReactNode> | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined, currentStatus: any) {
        if (!apiKey) {
            toast.error('API key is missing')
            return;
        }
        try {
            const newStatus = !currentStatus;

            const response = await fetch(TOGGLE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey
                },
                body: JSON.stringify({
                    ticker: ticker,
                    status: newStatus.toString(),
                    wallet_address: walletAddress
                })
            });

            if (!response.ok) {
                throw new Error('Failed to toggle ticker status');
            }

            if (newStatus) {
                toast.success(`${ticker} Agent turned on`);
            } else {
                toast.error(`${ticker} Agent turned off`);
            }

            if (newStatus) {
                toast.success(`${ticker} Agent turned on`);
            } else {
                toast.error(`${ticker} Agent turned off`);
            }

            setIsToggleAllowed(false);

            await new Promise((resolve) => setTimeout(resolve, 1000));

            toast('You can toggle again after 60 seconds.');

            // Clear previous timer if it exists to avoid multiple messages
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Set a new 60-second timer to re-enable toggling
            timeoutRef.current = setTimeout(() => {
                setIsToggleAllowed(true);
                toast('You can now toggle agents again.');
            }, 60000);

            // After toggling the status, re-fetch data to update UI
            mutate([AGENTS_API_URL, apiKey, walletAddress]);
        } catch (err) {
            console.error(err);
        }
    }

    const sampleCommands = [
        { label: 'Create Agent', command: '/create-agent: ' },
        // { label: 'Join Pre-Sale', command: 'pre-sale' },
        { label: 'Mint NFT', command: '/image-gen of ' },
    ];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [displayMessages, isLoading]);

    useEffect(() => {
        // Ensure initial view is shown on every page load
        setIsInitialView(true);
    }, []);

    const handleCommandBoxClick = (command: string) => {
        if (command === 'pre-sale') {
            // Redirect to the pre-sale page when the middle box is clicked.
            router.push('/pre-sale');
        } else {
            setInputMessage(command); // Populate the input field with the selected command
            inputRef.current?.focus();
        }
    };

    const commandPopupRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                commandPopupRef.current &&
                !commandPopupRef.current.contains(event.target as Node)
            ) {
                setShowCommandPopup(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const [memeGenerationData, setMemeGenerationData] = useState<{
        name: string;
        description: string;
        prompt: string;
        base64Image: string;
        seed: number;
    } | null>(null);

    // useEffect(() => {
    //     const fetchTickerOptions = async () => {
    //         if (wallet.publicKey) {
    //             try {
    //                 const response = await fetch(`https://zynapse.zkagi.ai/getTickersByWallet/${wallet.publicKey.toString()}`, {
    //                     headers: {
    //                         'api-key': 'zk-123321'
    //                     }
    //                 });
    //                 if (!response.ok) throw new Error('Failed to fetch tickers');
    //                 const data = await response.json();
    //                 setTickers(data.tickers); // Only set the tickers array
    //             } catch (error) {
    //                 console.error('Error fetching tickers:', error);
    //             }
    //         }
    //     };

    //     fetchTickerOptions();
    // }, [wallet.publicKey]);

    useEffect(() => {
        const fetchTickersAndInfo = async () => {
            if (wallet.publicKey) {
                try {
                    // 1. Fetch tickers
                    const response = await fetch(
                        `https://zynapse.zkagi.ai/getTickersByWallet/${wallet.publicKey.toString()}`,
                        {
                            headers: {
                                'api-key': 'zk-123321'
                            }
                        }
                    );
                    if (!response.ok) throw new Error('Failed to fetch tickers');
                    const data = await response.json();
                    console.log('data', data)
                    setTickers(data.tickers);
                    setAvailableTickers(data.tickers);
                    console.log('Updated availableTickers:', useTickerStore.getState().availableTickers);

                    // 2. Fetch info for each ticker
                    // const infoMap = new Map();
                    // for (const ticker of data.tickers) {
                    //     const infoResponse = await fetch(
                    //         `https://zynapse.zkagi.ai/contentengine_knowledgebase/${ticker}`,
                    //         {
                    //             headers: {
                    //                 'api-key': 'zk-123321'
                    //             }
                    //         }
                    //     );
                    //     if (infoResponse.ok) {
                    //         const tickerInfo = await infoResponse.json();
                    //         infoMap.set(ticker, tickerInfo);
                    //     }
                    // }
                    // setTickerInfoMap(infoMap);
                } catch (error) {
                    console.error('Error fetching tickers and info:', error);
                }
            }
        };

        fetchTickersAndInfo();
    }, [wallet.publicKey, setTickers, setAvailableTickers]);

    const compressImage = async (base64String: string, targetSizeKB: number = 450): Promise<string> => {
        // Create an image element
        const img = new window.Image();
        await new Promise((resolve) => {
            img.onload = resolve;
            img.src = base64String;
        });

        const canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let quality = 1.0;
        let compressed = base64String;

        // Start with original dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Function to get file size in KB
        const getFileSizeKB = (base64String: string): number => {
            const base64Length = base64String.split(',')[1].length;
            const fileSizeBytes = (base64Length * 3) / 4;
            return fileSizeBytes / 1024;
        };

        // Compress until size is under target
        while (getFileSizeKB(compressed) > targetSizeKB && quality > 0.1) {
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                compressed = canvas.toDataURL('image/jpeg', quality);
            }
            quality -= 0.1;
        }

        // If still too large, reduce dimensions
        if (getFileSizeKB(compressed) > targetSizeKB) {
            let scale = 0.9;
            while (getFileSizeKB(compressed) > targetSizeKB && scale > 0.1) {
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    compressed = canvas.toDataURL('image/jpeg', quality);
                }
                scale -= 0.1;
            }
        }

        return compressed;
    };


    const processTwitterData = async (twitterUrl: string) => {
        const client = new ApifyClient({
            token: 'apify_api_mdt6tlhZErHAe9WPbgUGhYGfeFugLd17oXzO',
        });

        try {
            const input = {
                handles: [twitterUrl],
                tweetsDesired: 10,
                proxyConfig: { useApifyProxy: true },
            };

            // Start the actor run
            const run = await client.actor("quacker/twitter-scraper").call(input);

            // Wait for the run to finish
            await client.run(run.id).waitForFinish();

            // Get the output from the dataset
            const { items } = await client.dataset(run.defaultDatasetId).listItems();

            // Extract only the full_text from each tweet item
            const tweetTexts = items.map(item => item.full_text);

            return tweetTexts;
        } catch (error) {
            console.error('Error fetching tweets:', error);
            return null;
        }
    };




    // Function to format base64 image properly
    const formatBase64Image = (base64String: string): string => {
        if (!base64String.startsWith('data:image/')) {
            return `data:image/png;base64,${base64String}`;
        }
        return base64String;
    };

    const availableUGCOptions = [
        { name: 'LandWolf', apiUrl: process.env.NEXT_PUBLIC_LANDWOLF! },
        { name: 'Ponke', apiUrl: process.env.NEXT_PUBLIC_LANDWOLF! },
    ];

    const handleMemeImageGeneration = async (imageData: string, prompt: string) => {
        console.log('pig')
        try {
            // Format the image into a data URL if it isn't already.
            let formattedImage = imageData;
            if (!imageData.startsWith('data:image/')) {
                formattedImage = `data:image/png;base64,${imageData}`;
            }
            // Compress the image as needed.
            const compressedImage = await compressImage(formattedImage);

            // Send the image and prompt to your /api/chat endpoint.
            const imageUploadResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedModel: "Mistral",
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text:
                                        'Analyze the given image and suggest a creative name and description that fit the theme and appearance of the image. Ensure the output is always in the format: {"name":<generated_name>, "description":<generated_description>}. Return only a JSON response in the following format: {"name":<generated_name>, "description":<generated_description>}.'
                                },
                                {
                                    type: 'image_url',
                                    image_url: { url: compressedImage }
                                }
                            ]
                        }
                    ]
                })
            });

            if (!imageUploadResponse.ok) {
                throw new Error('Failed to process image');
            }

            // Ensure that the response body is a readable stream.
            if (!imageUploadResponse.body) {
                throw new Error("Readable stream not supported in this environment");
            }

            // Read from the streaming response.
            const reader = imageUploadResponse.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let done = false;
            let accumulatedContent = '';

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    // Decode the current chunk and add it to the accumulator.
                    const chunk = decoder.decode(value, { stream: true });
                    accumulatedContent += chunk;
                }
            }

            console.log("Accumulated streaming content:", accumulatedContent);

            // Extract the JSON object wrapped in triple backticks.
            // Adjust the regex if your formatting is different.
            const jsonMatch = accumulatedContent.match(/```json\s*\n?({[\s\S]*?})\n?```/);
            if (jsonMatch && jsonMatch[1]) {
                const parsedData = JSON.parse(jsonMatch[1]);
                console.log('Parsed data from streaming response:', parsedData);

                // Update your state with the analysis result.
                setMemeGenerationData({
                    ...parsedData,
                    prompt,
                    base64Image: compressedImage,
                    seed: parsedData.proof?.seed || -1
                });
            } else {
                throw new Error('No JSON object found in streaming response');
            }
        } catch (error) {
            console.error('Error in agent image generation:', error);
        }
    };


    useEffect(() => {
        const handleMarketClick = () => {
            router.push('/marketplace');
        };

        // Attach the handler to your marketplace button
        const marketplaceButton = document.querySelector('[data-marketplace-button]');
        if (marketplaceButton) {
            marketplaceButton.addEventListener('click', handleMarketClick);
        }

        return () => {
            if (marketplaceButton) {
                marketplaceButton.removeEventListener('click', handleMarketClick);
            }
        };
    }, [router]);

    // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const value = e.target.value;
    //     setInputMessage(value);

    //     if (value === '/') {
    //         setShowCommandPopup(true);
    //         setShowTickerPopup(false);
    //     } else if (!value) {
    //         setShowCommandPopup(false);
    //         setShowTickerPopup(false);
    //     }
    // };

    // const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    //     if (e.key === 'Escape') {
    //         setShowCommandPopup(false);
    //     }
    // };

    // const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    //     const value = e.target.value;
    //     setInputMessage(value);

    //     if (value === '/') {
    //         setShowCommandPopup(true);
    //         setShowTickerPopup(false);
    //     } else if (!value) {
    //         setShowCommandPopup(false);
    //         setShowTickerPopup(false);
    //     }
    // };

    const handleAgentTypeSelect = (agentType: string) => {
        setSelectedAgentType(agentType);
        handleLaunchMemeCoin(agentType);
        // setInputMessage(`/create-agent ${agentType} `);
        // inputRef.current?.focus();
        // setShowAgentTypePopup(false);
    };

    const handleLaunchAgent = () => {
        if (selectedAgentType) {
            router.push(`/memelaunch?agentType=${selectedAgentType}`);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInputMessage(value);


        if (value.startsWith('/video-lipsync ') && !videoLipsyncOption) {
            setShowVideoLipsyncOption(true);
        } else {
            // Optionally, hide the popup if the command is removed.
            setShowVideoLipsyncOption(false);
        }

        // Show AgentTypePopup if "/create-agent" is detected
        if (value === '/create-agent') {
            // setShowAgentTypePopup(true);
            setShowCommandPopup(false);
            setShowTickerPopup(false);
            return;
        }
        //  else {
        //     setShowAgentTypePopup(false);
        // }


        // Show CommandPopup if "/" is typed alone
        if (value === '/') {
            console.log('Detected "/", showing CommandPopup');
            setShowCommandPopup(true);
            setShowTickerPopup(false);
        }
        // Close CommandPopup if anything is typed after "/"
        else if (value.startsWith('/')) {
            console.log(`Detected command input: ${value.split(' ')[0]}`);
            setShowCommandPopup(false);
        } else {
            setShowCommandPopup(false);
        }
    };


    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Escape') {
            setShowCommandPopup(false);
        }
    };



    const getStyledInputContent = () => {
        const parts = inputMessage.split(' ');
        if (parts[0].startsWith('/')) {
            return (
                <>
                    <span className="text-blue-400 font-bold">{parts[0]}</span>
                    <span>{' ' + parts.slice(1).join(' ')}</span>
                </>
            );
        }
        return inputMessage;
    };

    // const handleCommandSelect = (command: Command) => {
    //     if (command === 'content') {
    //         setInputMessage('/content ');
    //         setShowCommandPopup(false);
    //         setShowTickerPopup(true);
    //     } else {
    //         setInputMessage(`/${command} `);
    //         setShowCommandPopup(false);
    //     }
    //     inputRef.current?.focus();
    // };


    // In your HomeContent component:
    // const handleCommandSelect = (command: Command) => {
    //     setInputMessage(`/${command} `);
    //     setShowCommandPopup(false);
    //     inputRef.current?.focus();
    // };

    // const handleCommandSelect = (command: Command) => {
    //     if (command === 'select') {
    //         setShowTickerTable(true);
    //         setInputMessage(`/${command} `);
    //     } else {
    //         setInputMessage(`/${command} `);
    //     }
    //     setShowCommandPopup(false);
    //     inputRef.current?.focus();
    // };

    // const handleUGCSelection = async (option: { name: string; apiUrl: string }) => {
    //     const userPrompt = inputMessage.replace('/ugc', '').trim();

    //     if (!userPrompt) {
    //         const errorMessage: Message = {
    //             role: 'assistant',
    //             content: 'Please provide a prompt after the command. Format: /ugc [Option] [Prompt]',
    //             type: 'text',
    //         };
    //         setDisplayMessages((prev) => [...prev, errorMessage]);
    //         return;
    //     }

    //     try {
    //         const payload = {
    //             prompt: userPrompt,
    //             width: 512,
    //             height: 512,
    //             num_steps: 24,
    //             guidance: 3.5,
    //             seed: 1,
    //             strength: 1,
    //         };

    //         const response = await fetch(option.apiUrl, {
    //             method: 'POST',
    //             headers: {
    //                 Accept: 'application/json',
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(payload),
    //         });

    //         if (!response.ok) {
    //             throw new Error(`Failed to generate content for ${option.name}`);
    //         }

    //         const result = await response.json();
    //         const successMessage: Message = {
    //             role: 'assistant',
    //             content: (
    //                 <div>
    //                     <p>Generated {option.name} Content:</p>
    //                     <img
    //                         src={`data:image/png;base64,${result.image}`}
    //                         alt={`${option.name} generated content`}
    //                         className="w-full rounded-lg"
    //                     />
    //                 </div>
    //             ),
    //         };
    //         setInputMessage((prev) => `${prev.trim()} ${option.name} `);
    //         const selectionMessage: Message = {
    //             role: 'assistant',
    //             content: `Selected: ${option.name}`,
    //             type: 'text',
    //         };
    //         setDisplayMessages((prev) => [...prev, selectionMessage]);
    //         inputRef.current?.focus();
    //     } catch (error) {
    //         const errorMessage: Message = {
    //             role: 'assistant',
    //             content: `Error generating ${option.name} content: ${error}`,
    //             type: 'text',
    //         };
    //         setDisplayMessages((prev) => [...prev, errorMessage]);
    //     }
    // };

    const handleUGCSelection = (option: { name: string; apiUrl: string }) => {
        // Update the input with the selected option
        setInputMessage((prev) => {
            const trimmedPrev = prev.trim();
            return trimmedPrev.endsWith('/ugc') ? `${trimmedPrev} ${option.name} ` : `${trimmedPrev} ${option.name}`;
        });

        inputRef.current?.focus(); // Refocus on the input field
    };




    const handleCommandSelect = (command: Command) => {

        if (command === 'video-lipsync') {
            // Set the input field and trigger the popup regardless of how the command was set.
            setInputMessage('/video-lipsync ');
            setShowCommandPopup(false);
            setShowVideoLipsyncOption(true);
        } else if (command === 'UGC') {
            setInputMessage(`/ugc `); // Add `/ugc` to the input field
            const displayMessage: Message = {
                role: 'assistant',
                content: (
                    <div className="flex flex-col">
                        {availableUGCOptions.map((option) => (
                            <button
                                key={option.name}
                                className="p-2 bg-blue-500 text-white rounded-lg mb-2"
                                onClick={() => handleUGCSelection(option)}
                            >
                                {option.name}
                            </button>
                        ))}
                    </div>
                ),
            };
            setDisplayMessages((prev) => [...prev, displayMessage]);
            setShowCommandPopup(false);
        } else if (command === 'select') {
            setInputMessage(`/${command} `);
            const displayMessage: Message = {
                role: 'assistant',
                content: <TickerSelector /> as ReactNode,
            };
            setDisplayMessages((prev) => [...prev, displayMessage]);
            setShowCommandPopup(false);
        } else {
            setInputMessage(`/${command} `);
            setShowCommandPopup(false);
        }
        // if (command === 'create-agent') {
        //     setShowAgentTypePopup(true);
        // } else {
        //     setShowAgentTypePopup(false);
        // }
        inputRef.current?.focus(); // Focus back on the input field
    };


    //prev
    // const handleCommandSelect = (command: Command) => {
    //     if (command === 'select') {
    //         setInputMessage(`/${command} `)
    //         const displayMessage: Message = {
    //             role: 'assistant',
    //             content: <TickerSelector /> as ReactNode,
    //         };
    //         setDisplayMessages(prev => [...prev, displayMessage]);
    //         setShowCommandPopup(false);
    //     } else {
    //         setInputMessage(`/${command} `);
    //         setShowCommandPopup(false);
    //     }
    //     inputRef.current?.focus();
    // };

    const handleTickerClick = (ticker: string) => {
        setActiveNavbarTicker(prevTicker => prevTicker === ticker ? null : ticker);
    };

    // const handleCommandSelect = (command: Command) => {
    //     if (command === 'select' || command === 'launch') {
    //         setInputMessage(`/${command} `)
    //         const displayMessage: Message = {
    //             role: 'assistant',
    //             content: <TickerSelector /> as ReactNode,
    //         };
    //         setDisplayMessages(prev => [...prev, displayMessage]);
    //         setShowCommandPopup(false);
    //     } else {
    //         setInputMessage(`/${command} `);
    //         setShowCommandPopup(false);
    //     }
    //     inputRef.current?.focus();
    // };



    // const handleTickerSelect = (ticker: string) => {
    //     setSelectedTicker(ticker);
    //     setInputMessage(`/content ${ticker}`);
    //     setShowTickerPopup(false);
    //     inputRef.current?.focus();
    // };

    const handleTickerSelect = async (ticker: string) => {
        // Set the active navbar ticker when selecting from dropdown
        setSelectedMemeTicker(ticker);
        setActiveNavbarTicker(ticker);

        const currentTickerInfo = useTickerStore.getState().tickerInfo[ticker];
        if (!currentTickerInfo) {
            try {
                const infoResponse = await fetch(
                    `https://zynapse.zkagi.ai/contentengine_knowledgebase/${ticker}`,
                    {
                        headers: {
                            'api-key': 'zk-123321'
                        }
                    }
                );

                if (infoResponse.ok) {
                    const tickerInfo = await infoResponse.json();
                    useTickerStore.getState().setTickerInfo(ticker, tickerInfo);
                } else {
                    console.error('Failed to fetch ticker info:', ticker);
                }
            } catch (error) {
                console.error('Error fetching ticker info:', error);
            }
        }

        // Only set the input message if it's a direct /content command
        if (inputMessage.startsWith('/content')) {
            setInputMessage(`/content ${ticker}`);
        }
        setShowTickerPopup(false);
        inputRef.current?.focus();
    };



    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (session && session.user) {
            setUserEmail('User');
        }
    }, [session]);

    useEffect(() => {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);


    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error('Failed to convert file to base64'));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const openCreateAgentModal = () => {
        setShowCreateAgentModal(true);
    };

    const extractTextFromPdf = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        const textPromises = Array.from({ length: pdf.numPages }, async (_, i) => {
            const page = await pdf.getPage(i + 1);
            const content = await page.getTextContent();
            return content.items.map((item: any) => item.str).join(' ');
        });

        const texts = await Promise.all(textPromises);
        return texts.join('\n');
    };


    // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (e.target.files) {
    //         const selectedFiles = Array.from(e.target.files);

    //         if (files.length + selectedFiles.length <= 4) {
    //             const newFiles = await Promise.all(
    //                 selectedFiles.map(async (file) => {
    //                     if (file.type === 'application/pdf') {
    //                         const pdfText = await extractTextFromPdf(file);
    //                         console.log('pdfText length:', pdfText.toString().length);

    //                         // Check if the PDF text exceeds the character limit
    //                         if (pdfText.toString().length > 125000) {
    //                             toast.error('File too big to process'); // Sonner toast notification
    //                             return null; // Skip this file
    //                         }

    //                         setPdfContent(pdfText);
    //                         setCurrentPdfName(file.name);
    //                         return {
    //                             file,
    //                             preview: URL.createObjectURL(file),
    //                             isPdf: true,
    //                         };
    //                     } else {
    //                         return {
    //                             file,
    //                             preview: await fileToBase64(file),
    //                             isPdf: false,
    //                         };
    //                     }
    //                 })
    //             );

    //             // Filter out null values from skipped files
    //             const validFiles = newFiles.filter(file => file !== null);
    //             setFiles([...files, ...validFiles]);
    //         } else {
    //             toast.error('You can only upload up to 4 files'); // Sonner toast notification
    //         }
    //     }
    // };


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);

            // if (files.length > 0 || selectedFiles.length > 1) {
            //     toast.error('Only one image can be uploaded at a time.');
            //     return;
            // }

            const newFilesOrNull: (FileObject | null)[] = await Promise.all(
                selectedFiles.map(async (file) => {
                    if (file.type === 'application/pdf') {
                        // Handle PDFs
                        return {
                            file,
                            preview: URL.createObjectURL(file),
                            isPdf: true,
                            isVideoOrAudio: false, // Explicitly false
                        };
                    } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
                        // Handle video and audio files
                        return {
                            file,
                            preview: URL.createObjectURL(file),
                            isPdf: false, // Explicitly false
                            isVideoOrAudio: true,
                        };
                    } else if (file.type.startsWith('image/')) {
                        // Handle images
                        return {
                            file,
                            preview: await fileToBase64(file),
                            isPdf: false, // Explicitly false
                            isVideoOrAudio: false, // Explicitly false
                        };
                    } else {
                        // Unsupported file types
                        return null;
                    }
                })
            );

            // Filter out null values
            const validFiles = newFilesOrNull.filter((file): file is FileObject => file !== null);

            // Update state with valid files
            setFiles((prevFiles) => [...prevFiles, ...validFiles]);
        }
    };


    // const uploadFilesToMergeMedia = async (video: File, audio: File): Promise<string | null> => {
    //     const formData = new FormData();
    //     formData.append('videoFile', video);
    //     formData.append('audioFile', audio);

    //     try {
    //         const response = await fetch('/api/merge-media', {
    //             method: 'POST',
    //             body: formData,
    //         });

    //         if (!response.ok) {
    //             throw new Error(`Failed to process files: ${response.statusText}`);
    //         }

    //         const blob = await response.blob();
    //         const videoUrl = URL.createObjectURL(blob); // Create a URL for the returned blob
    //         return videoUrl;
    //     } catch (error) {
    //         console.error('Error uploading files:', error);
    //         return null;
    //     }
    // };

    // const uploadFilesToMergeMedia = async (
    //     video: File,
    //     audio: File
    // ): Promise<string | null> => {
    //     try {
    //         const videoBinary = await fileToBinaryString(video);
    //         const audioBinary = await fileToBinaryString(audio);
    //         console.log('videoBinary', videoBinary)
    //         console.log('audioBinary', audioBinary)

    //         // const response = await fetch("http://27.222.23.19:8000/generate/", {
    //         //     method: "POST",
    //         //     headers: {
    //         //         "Content-Type": "application/json",
    //         //     },
    //         //     body: JSON.stringify({
    //         //         videoBinary,
    //         //         audioBinary,
    //         //         bbox_shift: 0
    //         //     }),
    //         // });
    //         const response = await fetch("https://zynapse.zkagi.ai/generate-lipsync", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({
    //                 videoBinary,
    //                 audioBinary,
    //             }),
    //         });

    //         if (!response.ok) {
    //             throw new Error(`Failed to process files: ${response.statusText}`);
    //         }

    //         const result = await response.json();
    //         return result.videoUrl; // Return the generated video URL
    //     } catch (error) {
    //         console.error("Error uploading files:", error);
    //         return null;
    //     }
    // };

    const uploadFilesToMergeMedia = async (
        video: File,
        audio: File
    ): Promise<string | null> => {
        try {
            const formData = new FormData();

            // Append video and audio files directly to FormData
            formData.append('video', video, video.name);
            formData.append('audio', audio, audio.name);

            const endpoint = process.env.NEXT_PUBLIC_LIP_SYNC || " "

            // const response = await fetch(endpoint, {
            //     method: "POST",
            //     body: formData,
            // });

            const response = await fetch("/api/lipsync", {
                method: "POST",
                body: formData,
            });

            console.log('response', response)

            if (!response.ok) {
                throw new Error(`Failed to process files: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            return url
        } catch (error) {
            console.error("Error uploading files:", error);
            return null;
        }
    };


    const validateMediaDuration = async (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const mediaElement = document.createElement(
                file.type.startsWith("video/") ? "video" : "audio"
            );
            mediaElement.preload = "metadata";

            mediaElement.onloadedmetadata = () => {
                URL.revokeObjectURL(mediaElement.src);
                resolve(mediaElement.duration <= 15);
            };

            mediaElement.onerror = () => {
                resolve(false); // If metadata can't be loaded, consider invalid.
            };

            mediaElement.src = URL.createObjectURL(file);
        });
    };

    const removeFile = (index: number) => {
        const newFiles = [...files];
        URL.revokeObjectURL(newFiles[index].preview);
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    function getByteSize(str: any) {
        return new TextEncoder().encode(str).length;
    }

    const handleTweetCommand = async (message: string) => {
        const { selectedTicker } = useTickerStore.getState();

        if (!selectedTicker) {
            const errorMessage: Message = {
                role: 'assistant',
                content: 'No agent selected. Please use /select command first to choose an agent.',
                type: 'text'
            };
            setDisplayMessages(prev => [...prev, errorMessage]);
            return;
        }

        try {
            // Fetch saved tweets for the selected ticker
            const response = await fetch(`https://zynapse.zkagi.ai/contentengine_gettweets/${selectedTicker}`, {
                headers: {
                    'Accept': '/',
                    'api-key': 'zk-123321'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch tweets');
            const data = await response.json();

            // If it's a single tweet command
            if (message.startsWith('/tweet ')) {
                const tweetId = parseInt(message.replace('/tweet ', '').trim());
                const selectedTweet = data.tweets.find((t: any, index: number) => index + 1 === tweetId);

                if (!selectedTweet) {
                    throw new Error(`Tweet with ID ${tweetId} not found`);
                }

                await postTweet(selectedTweet.tweet_text);

                const successMessage: Message = {
                    role: 'assistant',
                    content: `Successfully posted tweet #${tweetId}`,
                    type: 'text'
                };
                setDisplayMessages(prev => [...prev, successMessage]);
            }
            // If it's a multiple tweets command
            else if (message.startsWith('/tweets ')) {
                const tweetIds = message
                    .replace('/tweets ', '')
                    .trim()
                    .split(',')
                    .map(id => parseInt(id.trim()));

                const selectedTweets = tweetIds.map(id => {
                    const tweet = data.tweets[id - 1];
                    if (!tweet) throw new Error(`Tweet with ID ${id} not found`);
                    return tweet.tweet_text;
                });

                for (const tweetText of selectedTweets) {
                    await postTweet(tweetText);
                }

                const successMessage: Message = {
                    role: 'assistant',
                    content: `Successfully posted tweets: ${tweetIds.join(', ')}`,
                    type: 'text'
                };
                setDisplayMessages(prev => [...prev, successMessage]);
            }
            // Display available tweets
            else {
                const tweetList = data.tweets.map((tweet: any, index: number) =>
                    `${index + 1}. ${tweet.tweet_text}`
                ).join('\n');

                // const displayMessage: Message = {
                //     role: 'assistant',
                //     content: `Available tweets for ${selectedTicker}:\n\n${tweetList}\n\nUse /tweet [id] to post a single tweet or /tweets [id1,id2,id3] to post multiple tweets.`,
                //     type: 'text'
                // };
                const tweets = data.tweets.map((tweet: any, index: number) => ({
                    id: index + 1,
                    tweet_text: tweet.tweet_text
                }));

                const displayMessage: Message = {
                    role: 'assistant',
                    content: <TweetTable tweets={tweets} ticker={selectedTicker} />,
                    type: 'text'
                };

                setDisplayMessages(prev => [...prev, displayMessage]);
            }
        } catch (error) {
            const errorMessage: Message = {
                role: 'assistant',
                content: `Error: ${error instanceof Error ? error.message : 'Failed to process tweet command'}`,
                type: 'text'
            };
            setDisplayMessages(prev => [...prev, errorMessage]);
        }
    };

    // Add this to your postTweet function
    const postTweet = async (text: string) => {
        const apiKey = 'BGwmxuKTPgFsTocz01bHeuMtP';
        const apiSecretKey = 'QX2uE79GiP4qKsmoRHh3pWuEtjmsHRoUIpPl6lM14P0sM8vVNE';
        const { accessToken, accessSecret } = useTwitterStore.getState();

        if (!accessToken || !accessSecret) {
            throw new Error('Twitter credentials not set. Please use /token command first.');
        }

        const url = `http://65.20.68.31:4040/tweet/?api_key=${apiKey}&api_secret_key=${apiSecretKey}&access_token=${accessToken}&access_token_secret=${accessSecret}&text=${encodeURIComponent(text)}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error posting tweet: ${response.statusText}`);
        }

        return await response.json();
    };

    const processVideoLipsync = async () => {
        // Look for an image file (jpg/jpeg/png) and an audio file in your uploaded files.
        const imageFile = files.find((file) => file.file.type.startsWith('image/'));
        const audioFile = files.find((file) => file.file.type.startsWith('audio/'));

        if (!imageFile || !audioFile) {
            toast.error("Please upload one image file and one audio file.");
            return;
        }

        // Validate the audio file's duration.
        const isAudioValid = await validateMediaDuration(audioFile.file);
        if (!isAudioValid) {
            toast.error("Audio file must be 15 seconds or shorter.");
            return;
        }

        const formData = new FormData();
        formData.append('reference_image', imageFile.file);
        formData.append('input_audio', audioFile.file);
        formData.append('animation_mode', videoLipsyncOption!.toLowerCase());

        // Ensure these values match what your API expects (they could come from state or constants)
        formData.append('driving_multiplier', '1.0'); // or your dynamic value
        formData.append('scale', '2.3'); // or your dynamic value

        try {
            const response = await fetch('http://47.80.4.197:30902/generate-video/', {
                method: 'POST',
                body: formData,
            });

            console.log('response', response);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            // Create a URL from the returned video blob.
            const blob = await response.blob();
            const videoUrl = URL.createObjectURL(blob);

            const successMessage: Message = {
                role: 'assistant',
                content: (
                    <div>
                        <video src={videoUrl} controls className="w-full h-auto rounded-md" />
                        <a href={videoUrl} download="merged-video.mp4" className="text-blue-500 underline">
                            Download Merged Video
                        </a>
                    </div>
                ),
                type: 'text',
            };
            setDisplayMessages((prev) => [...prev, successMessage]);
        } catch (error: any) {
            const errorMessage: Message = {
                role: 'assistant',
                content: `Error processing your video and audio. Please try again. Error: ${error.message}`,
                type: 'text',
            };
            setDisplayMessages((prev) => [...prev, errorMessage]);
        }

        // Clear the uploaded files and reset the input.
        setFiles([]);
        setInputMessage('');
        if (inputRef.current) {
            inputRef.current.style.height = '2.5rem';
        }
        // Reset the option for future submissions.
        setVideoLipsyncOption(null);
        setShowVideoLipsyncOption(false);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isInitialView) {
            setIsInitialView(false); // Remove the initial boxes on first submit
        }

        // const trimmedMsg = inputMessage.trim();
        // if (!trimmedMsg) return;

        // Check for /create-agent command
        // if (trimmedMsg.startsWith("/create-agent")) {
        //     // Instead of sending a fetch or showing a ResultBlock:
        //     setShowCreateAgentModal(true);
        //     setInputMessage(""); // Clear input
        //     return; // Skip the rest
        // }

        const getImageResultType = () => {
            if (inputMessage.startsWith('/image-gen')) {
                return "image-gen";
            } else if (inputMessage.startsWith('/create-agent')) {
                return "create-agent";
            }
            return "default"; // Fallback if neither matches
        };

        const resultType = getImageResultType();
        setImageResultType(resultType);

        const fullMessage = inputMessage.trim();

        if (fullMessage.startsWith('/img-to-video')) {
            const userInput = fullMessage.replace('/img-to-video', '').trim();
            if (files.length !== 1) {
                toast.error('Please upload exactly one image before using /img-to-video.');
                return;
            }
            if (!userInput) {
                toast.error('Please provide a prompt after the /img-to-video command.');
                return;
            }
            const file = files[0].file;
            const formData = new FormData();
            formData.append('image', file);
            formData.append('prompt', userInput);
            formData.append('seed', '-1');
            formData.append('fps', '24');
            formData.append('w', '720');
            formData.append('h', '720');
            formData.append('video_length', '120');
            formData.append('img_edge_ratio', '1');

            try {
                const response = await fetch('/api/imgToVideo', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    // 4. Get the video blob
                    const blob = await response.blob();
                    const videoUrl = window.URL.createObjectURL(blob);

                    const successMessage: Message = {
                        role: 'assistant',
                        content: (
                            <div>
                                <video src={videoUrl} controls className="w-full rounded-lg" />
                                <a
                                    href={videoUrl}
                                    download="output_video.mp4"
                                    className="text-blue-500 underline"
                                >
                                    Download Video
                                </a>
                            </div>
                        ),
                        type: 'text',
                    };

                    setDisplayMessages((prev) => [...prev, successMessage]);
                } else {
                    const errorResponse = await response.json();
                    toast.error(
                        errorResponse.error || 'Failed to generate video. Please check your input.'
                    );
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error('An error occurred while generating the video.');
            }

            setInputMessage('');
            if (inputRef.current) {
                inputRef.current.style.height = '2.5rem';
            }
            setFiles([]);
            return;
        }

        if (fullMessage.startsWith('/ugc')) {
            const parts = fullMessage.replace('/ugc', '').trim().split(' ');
            const selectedOption = parts[0]; // First word after `/ugc`
            const userPrompt = parts.slice(1).join(' ').trim(); // Rest of the message

            if (!selectedOption || !userPrompt) {
                const errorMessage: Message = {
                    role: 'assistant',
                    content: 'Please select an option and provide a prompt. Format: /ugc [Option] [Prompt]',
                    type: 'text',
                };
                setDisplayMessages((prev) => [...prev, errorMessage]);
                return;
            }

            const formattedPrompt = `${selectedOption.toUpperCase()} ${userPrompt}`;

            // Add user's message to chat
            const userMessage: Message = {
                role: 'user',
                content: fullMessage,
                type: 'text',
            };
            setDisplayMessages((prev) => [...prev, userMessage]);
            setInputMessage(''); // Clear input field
            setIsLoading(true); // Show loader

            // Find the selected UGC option (optional: if you still want to validate client-side)
            const option = availableUGCOptions.find((opt) => opt.name === selectedOption);
            if (!option) {
                const errorMessage: Message = {
                    role: 'assistant',
                    content: `Unknown option: ${selectedOption}. Available options: ${availableUGCOptions.map((opt) => opt.name).join(', ')}`,
                    type: 'text',
                };
                setDisplayMessages((prev) => [...prev, errorMessage]);
                setIsLoading(false); // Disable loader
                return;
            }

            // Prepare the payload for the /generate endpoint
            const payload = {
                selectedOption,
                "width": 512,
                "height": 512,
                "num_steps": 20,
                "guidance": 4,
                userPrompt: formattedPrompt
            };

            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer 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'
                    },
                    body: JSON.stringify(payload),
                });

                console.log('response', response);

                if (!response.ok) {
                    throw new Error(`Failed to generate content for ${selectedOption}`);
                }

                // Handle response content type
                const contentType = response.headers.get('Content-Type');

                if (contentType?.includes('image/')) {
                    // If the response is an image (e.g., JPEG or PNG)
                    const blob = await response.blob();
                    const imageUrl = URL.createObjectURL(blob);

                    const successMessage: Message = {
                        role: 'assistant',
                        content: (
                            <div>
                                <p>Generated {selectedOption} Content:</p>
                                <img
                                    src={imageUrl}
                                    alt={`${selectedOption} generated content`}
                                    className="w-full rounded-lg"
                                />
                            </div>
                        ),
                    };
                    setDisplayMessages((prev) => [...prev, successMessage]);
                } else if (contentType?.includes('application/json')) {
                    // If the response is JSON
                    const result = await response.json();
                    const successMessage: Message = {
                        role: 'assistant',
                        content: (
                            <div>
                                <p>Generated {selectedOption} Content:</p>
                                <img
                                    src={`data:image/png;base64,${result.image}`}
                                    alt={`${selectedOption} generated content`}
                                    className="w-full rounded-lg"
                                />
                            </div>
                        ),
                    };
                    setDisplayMessages((prev) => [...prev, successMessage]);
                } else {
                    throw new Error('Unsupported response type');
                }
            } catch (error) {
                const errorMessage: Message = {
                    role: 'assistant',
                    content: `Error generating ${selectedOption} content: ${error}`,
                    type: 'text',
                };
                setDisplayMessages((prev) => [...prev, errorMessage]);
            } finally {
                setIsLoading(false); // Disable loader
            }

            return;
        }

        if (fullMessage.startsWith('/select')) {
            const numberStr = fullMessage.replace('/select', '').trim();
            const selectedIndex = parseInt(numberStr) - 1;

            if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < tickers.length) {
                const selectedTicker = tickers[selectedIndex];

                try {
                    // Fetch ticker info
                    const infoResponse = await fetch(
                        `https://zynapse.zkagi.ai/contentengine_knowledgebase/${selectedTicker}`,
                        {
                            headers: {
                                'api-key': 'zk-123321'
                            }
                        }
                    );

                    if (infoResponse.ok) {
                        const tickerInfo = await infoResponse.json();
                        useTickerStore.getState().setTickerInfo(selectedTicker, tickerInfo);
                    }

                    // Update selected ticker in store
                    setSelectedMemeTicker(selectedTicker);
                    setActiveNavbarTicker(selectedTicker);
                    setInputMessage('');
                    if (inputRef.current) {
                        inputRef.current.style.height = '2.5rem';
                    }

                    // Add a system message to show the selection
                    const systemMessage: Message = {
                        role: 'assistant',
                        content: `Selected ticker: ${selectedTicker}`,
                        type: 'text'
                    };
                    setDisplayMessages(prev => [...prev, systemMessage]);
                } catch (error) {
                    console.error('Error fetching ticker info:', error);
                    const errorMessage: Message = {
                        role: 'assistant',
                        content: 'Error fetching ticker information. Please try again.',
                        type: 'text'
                    };
                    setDisplayMessages(prev => [...prev, errorMessage]);
                }
            } else {
                // Show error message for invalid selection
                const errorMessage: Message = {
                    role: 'assistant',
                    content: 'Invalid ticker selection. Please choose a valid number.',
                    type: 'text'
                };
                setDisplayMessages(prev => [...prev, errorMessage]);
            }
            return;
        }

        // if (fullMessage.startsWith('/video-lipsync')) {
        //     const videoFile = files.find((file) => file.file.type.startsWith('video/'));
        //     const audioFile = files.find((file) => file.file.type.startsWith('audio/'));

        //     if (!videoFile || !audioFile) {
        //         toast.error("Please upload one video file and one audio file.");
        //         return;
        //     }

        //     const isVideoValid = await validateMediaDuration(videoFile.file);
        //     const isAudioValid = await validateMediaDuration(audioFile.file);

        //     if (!isVideoValid || !isAudioValid) {
        //         toast.error("Video and audio files must be 15 seconds or shorter.");
        //         return;
        //     }

        //     if (videoFile && audioFile) {
        //         // Call the API to process video and audio files
        //         const videoUrl = await uploadFilesToMergeMedia(videoFile.file, audioFile.file);
        //         console.log('videoUrl', videoUrl)

        //         if (videoUrl) {
        //             const successMessage: Message = {
        //                 role: 'assistant',
        //                 content: (
        //                     <div>
        //                         <video src={videoUrl} controls className="w-full h-auto rounded-md" />
        //                         <a href={videoUrl} download="merged-video.mp4" className="text-blue-500 underline">
        //                             Download Merged Video
        //                         </a>
        //                     </div>
        //                 ),
        //                 type: 'text',
        //             };
        //             setDisplayMessages((prev) => [...prev, successMessage]);
        //         } else {
        //             const errorMessage: Message = {
        //                 role: 'assistant',
        //                 content: 'Error processing your video and audio. Please try again.',
        //                 type: 'text',
        //             };
        //             setDisplayMessages((prev) => [...prev, errorMessage]);
        //         }

        //         // Clear the uploaded files
        //         setFiles([]);
        //     } else {
        //         const errorMessage: Message = {
        //             role: 'assistant',
        //             content: 'Please upload one video file and one audio file.',
        //             type: 'text',
        //         };
        //         setDisplayMessages((prev) => [...prev, errorMessage]);
        //     }

        //     setInputMessage('');
        //     if (inputRef.current) {
        //         inputRef.current.style.height = '2.5rem'; 
        //       }
        //     return;
        // }


        if (fullMessage.startsWith('/video-lipsync')) {
            // If no option is chosen, do nothing (the popup should be visible).
            if (!videoLipsyncOption) {
                return;
            }

            const imageFile = files.find((file) => file.file.type.startsWith('image/'));
            const audioFile = files.find((file) => file.file.type.startsWith('audio/'));

            // Build an array for the user prompt content.
            const userContent: (string | React.ReactNode)[] = [fullMessage];

            if (imageFile) {
                // Render a small preview of the uploaded image.
                userContent.push(
                    <img
                        key="img"
                        src={imageFile.preview}
                        alt="Uploaded Image"
                        className="w-16 h-16 object-cover rounded-md ml-2"
                    />
                );
            }

            if (audioFile) {
                // Render the FcAudioFile icon for the uploaded audio file.
                userContent.push(
                    <FcAudioFile key="audio" size={32} className="ml-2" />
                );
            }
            // Add a user message showing what was sent.
            const userMessage: Message = {
                role: 'user',
                content: fullMessage,
                type: 'text',
            };
            setDisplayMessages((prev) => [...prev, userMessage]);
            setInputMessage('');
            setFiles([]);
            setIsLoading(true);


            // Process the command.
            await processVideoLipsync();

            setIsLoading(false);
            return;
        }



        // Command handling for /token
        if (fullMessage.startsWith('/token')) {
            const tokenMessage: Message = {
                role: 'assistant',
                content: <TokenSetup /> as ReactNode,
                type: 'command'
            };
            setDisplayMessages(prev => [...prev, tokenMessage]);
            setInputMessage('');
            if (inputRef.current) {
                inputRef.current.style.height = '2.5rem';
            }
            return;
        }

        // Command handling for /post
        if (fullMessage.startsWith('/post')) {
            const { selectedTicker } = useTickerStore.getState();
            const { accessToken, accessSecret } = useTwitterStore.getState();

            if (!selectedTicker) {
                const errorMessage: Message = {
                    role: 'assistant',
                    content: 'No agent selected. Please use /select command first to choose an agent.',
                    type: 'text'
                };
                setDisplayMessages(prev => [...prev, errorMessage]);
                return;
            }

            if (!accessToken || !accessSecret) {
                const errorMessage: Message = {
                    role: 'assistant',
                    content: 'Twitter credentials not set. Please use /token command first to set up your Twitter access.',
                    type: 'text'
                };
                setDisplayMessages(prev => [...prev, errorMessage]);
                return;
            }

            await handleTweetCommand(fullMessage);

            setInputMessage('');
            if (inputRef.current) {
                inputRef.current.style.height = '2.5rem';
            }
            return;
        }

        if (fullMessage.startsWith('/tweet ') || fullMessage.startsWith('/tweets ')) {
            await handleTweetCommand(fullMessage);
            setInputMessage('');
            if (inputRef.current) {
                inputRef.current.style.height = '2.5rem';
            }
            return;
        }

        // Inside handleSubmit function, add this before the other command handling:

        if (fullMessage.startsWith('/character-gen')) {
            const { selectedTicker } = useTickerStore.getState();

            if (!selectedTicker) {
                const errorMessage: Message = {
                    role: 'assistant',
                    content: 'No agent selected. Please use /select command first to choose an agent.',
                    type: 'text'
                };
                setDisplayMessages(prev => [...prev, errorMessage]);
                return;
            }

            const characterMessage: Message = {
                role: 'assistant',
                content: <CharacterGenForm /> as ReactNode,
                type: 'command'
            };
            setDisplayMessages(prev => [...prev, characterMessage]);
            setInputMessage('');
            if (inputRef.current) {
                inputRef.current.style.height = '2.5rem';
            }
            return;
        }

        if (fullMessage.startsWith('/train')) {
            // Check if an agent (ticker) is selected
            const { selectedTicker } = useTickerStore.getState();

            if (!selectedTicker) {
                const errorMessage: Message = {
                    role: 'assistant',
                    content: 'No agent selected. Please use /select command first to choose an agent.',
                    type: 'text',
                };
                setDisplayMessages((prev) => [...prev, errorMessage]);
                setInputMessage('');
                if (inputRef.current) {
                    inputRef.current.style.height = '2.5rem';
                }
                return;
            }

            if (files.length === 0) {
                // No files uploaded, show an error message
                const errorMessage: Message = {
                    role: 'assistant',
                    content: 'No files uploaded. Please upload PDF or image files to train with.',
                    type: 'text',
                };
                setDisplayMessages((prev) => [...prev, errorMessage]);
                setInputMessage('');
                if (inputRef.current) {
                    inputRef.current.style.height = '2.5rem';
                }
                return;
            }

            // Prepare the training data
            const trainingPdfs: string[] = [];
            const trainingImages: string[] = [];

            for (const fileObj of files) {
                if (fileObj.isPdf) {
                    if (pdfContent && fileObj.file.name === currentPdfName) {
                        trainingPdfs.push(pdfContent);
                    }
                } else {
                    // Images: Include the base64 data
                    trainingImages.push(fileObj.preview);
                }
            }

            // Create display message content
            const displayMessageContent: any[] = [];

            if (inputMessage.trim()) {
                displayMessageContent.push({
                    type: 'text',
                    text: inputMessage.trim(),
                });
            }

            // Add file information to the display message
            for (const fileObj of files) {
                if (fileObj.isPdf) {
                    displayMessageContent.push({
                        type: 'text',
                        text: `[PDF: ${fileObj.file.name}]`,
                    });
                } else {
                    const imageContent = {
                        type: 'image_url',
                        image_url: {
                            url: fileObj.preview,
                        },
                    };
                    displayMessageContent.push(imageContent);
                }
            }

            // Create the display message
            const displayMessage: Message = {
                role: 'user',
                content: displayMessageContent,
            };

            setDisplayMessages((prev) => [...prev, displayMessage]);
            setInputMessage('');
            if (inputRef.current) {
                inputRef.current.style.height = '2.5rem';
            }
            setFiles([]);
            setPdfContent(null);
            setCurrentPdfName(null);
            setIsLoading(true);

            try {
                // Prepare the API payload with only necessary fields
                const apiPayload = {
                    ticker: selectedTicker,
                    training_data: {
                        pdfs: trainingPdfs,
                        images: trainingImages,
                        training_urls: [],
                    },
                };

                // Send the API request to update the training data
                const response = await fetch('https://zynapse.zkagi.ai/api/train', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'api-key': 'zk-123321' },
                    body: JSON.stringify(apiPayload),
                });

                if (!response.ok) throw new Error('Failed to update training data');

                const data = await response.json();

                // Handle the response
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: 'Training data has been successfully updated.',
                    type: 'text',
                };

                setDisplayMessages((prev) => [...prev, assistantMessage]);

            } catch (error) {
                console.error('Error in /train command:', error);
                const errorMessage: Message = {
                    role: 'assistant',
                    content: 'Error during training. Please try again.',
                    type: 'text',
                };
                setDisplayMessages((prev) => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }

            return;
        }

        if (fullMessage.startsWith('/api')) {

            const displayMessage: Message = {
                role: 'user',
                content: `Generate an API key for using Zynapse API`
            };

            setDisplayMessages(prev => [...prev, displayMessage]);

            try {
                // Retrieve the user's Solana wallet address
                const walletAddress = wallet.publicKey?.toString() ?? "";

                let headersList = {
                    "Accept": "/",
                    "User-Agent": "Thunder Client (https://www.thunderclient.com)",
                    "api-key": "zk-123321",
                    "Content-Type": "application/json"
                };

                let bodyContent = JSON.stringify({ "wallet_address": walletAddress });

                // Step 1: Call add-user API
                let addUserResponse = await fetch("https://zynapse.zkagi.ai/add-user", {
                    method: "POST",
                    body: bodyContent,
                    headers: headersList
                });

                let addUserData = await addUserResponse.json();

                console.log('addUserData.detail', addUserData.detail)

                if (addUserResponse.status === 200) {
                    console.log('hi')

                    if (addUserData.api_keys && addUserData.api_keys.length > 0) {
                        const apiKey = addUserData.api_keys[0];

                        const assistantMessage: Message = {
                            role: 'assistant',
                            content: <ApiKeyBlock apiKey={apiKey} />,
                        };

                        setDisplayMessages(prev => [...prev, assistantMessage]);
                        return;
                    }
                } else if (addUserResponse.status === 400 && addUserData.detail === "User already exists") {
                    // Step 3: If user already exists, directly call generate-api-key
                    let generateKeyResponse = await fetch("https://zynapse.zkagi.ai/generate-api-key", {
                        method: "POST",
                        body: bodyContent,
                        headers: headersList
                    });

                    let generateKeyData = await generateKeyResponse.json();

                    if (generateKeyData.api_key && generateKeyData.api_key.length > 0) {
                        const apiKey = generateKeyData.api_key;

                        const assistantMessage: Message = {
                            role: 'assistant',
                            content: <ApiKeyBlock apiKey={apiKey} />,
                        };

                        setDisplayMessages(prev => [...prev, assistantMessage]);
                        return;
                    }
                }

            } catch (error) {
                console.error('Error generating API key:', error);
                const errorMessage: Message = {
                    role: 'assistant',
                    content: 'Error generating API key. Please try again.',
                    type: 'text'
                };
                setDisplayMessages(prev => [...prev, errorMessage]);
            }
        }



        if (fullMessage.startsWith('/launch')) {
            const { selectedTicker } = useTickerStore.getState();

            if (!selectedTicker) {
                const errorMessage: Message = {
                    role: 'assistant',
                    content: 'No agent selected. Please use /select command first to choose an agent.',
                    type: 'text',
                };
                setDisplayMessages((prev) => [...prev, errorMessage]);
                return;
            }

            const parts = fullMessage.trim().split(/\s+/);

            if (parts.length === 1) {
                // If just "/launch", show the table
                await showCoinsTable();
            } else if (parts.length === 2) {
                // If "/launch [number]", map the number to the coin's _id
                const coinIndexStr = parts[1];
                const coinIndex = parseInt(coinIndexStr, 10) - 1; // Adjust for zero-based index

                // Validate the index
                if (isNaN(coinIndex) || coinIndex < 0 || coinIndex >= filteredCoins.length) {
                    const errorMessage: Message = {
                        role: 'assistant',
                        content: 'Invalid coin number. Please enter a valid number from the list.',
                        type: 'text',
                    };
                    setDisplayMessages((prev) => [...prev, errorMessage]);
                    return;
                }

                const selectedCoin = filteredCoins[coinIndex] as { _id: string };
                const coinId = selectedCoin._id;

                // Pass the actual _id to handleLaunchCoin
                await handleLaunchCoin(coinId);
            }
            return;
        }


        // Check if message starts with a command
        const isImageGen = fullMessage.startsWith('/image-gen');
        const isMemeGen = fullMessage.startsWith('/create-agent');
        const isContent = fullMessage.startsWith('/content');

        if (isImageGen || isMemeGen || isContent) {

            if (isImageGen) {
                setProcessingCommand(true);
            }

            const commandType = isImageGen ? 'image-gen' : 'create-agent';
            setCurrentCommand(commandType);
            // Extract the prompt part after the command
            const promptText = fullMessage.replace(isImageGen ? '/image-gen' : '/create-agent', '').trim();


            // Create message objects
            const displayMessage: Message = {
                role: 'user',
                content: fullMessage
            };
            const apiMessage: Message = {
                role: 'user',
                content: fullMessage,
                // type: 'command',
                // command: isMemeGen ? 'create-agent' : 'image-gen'
            };

            setDisplayMessages(prev => [...prev, displayMessage]);
            setApiMessages(prev => [...prev, apiMessage]);
            setInputMessage('');
            if (inputRef.current) {
                inputRef.current.style.height = '2.5rem';
            }
            setIsLoading(true);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120000);

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        selectedModel: 'Mistral',
                        messages: [...apiMessages, apiMessage],
                        directCommand: {
                            type: commandType,
                            prompt: promptText
                        }
                    }),
                    signal: controller.signal,
                });

                if (!response.ok) throw new Error('Failed to get response');
                if (!response.body) throw new Error("Readable stream not supported in this environment");

                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let done = false;
                let finalEvent = null;
                let buffer = ''; // buffer for incomplete data

                // Read the stream chunk by chunk.
                while (!done) {
                    const { value, done: doneReading } = await reader.read();
                    done = doneReading;
                    if (value) {
                        // Decode and add the chunk to the buffer.
                        buffer += decoder.decode(value, { stream: true });

                        // Split the buffer into lines.
                        let lines = buffer.split('\n');
                        // Keep the last element in the buffer if it is incomplete.
                        buffer = lines.pop() || '';

                        // Process each complete line.
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const jsonStr = line.slice('data: '.length).trim();
                                if (!jsonStr) continue;
                                try {
                                    const event = JSON.parse(jsonStr);
                                    // For example, if this event carries image data:
                                    if (event.content && event.type === 'img') {
                                        if (event.seed) setCurrentSeed(event.seed);
                                        if (event.proof) setProofData(event.proof);
                                        // Save this final event for further processing.
                                        finalEvent = event;
                                    }
                                } catch (err) {
                                    console.error("Error parsing SSE event:", err);
                                }
                            }
                        }
                    }
                }

                // Optionally process any remaining data in the buffer after the loop ends.
                if (buffer) {
                    const line = buffer.trim();
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.slice('data: '.length).trim();
                        if (jsonStr) {
                            try {
                                const event = JSON.parse(jsonStr);
                                if (event.content && event.type === 'img') {
                                    if (event.seed) setCurrentSeed(event.seed);
                                    if (event.proof) setProofData(event.proof);
                                    finalEvent = event;
                                }
                            } catch (err) {
                                console.error("Error parsing SSE event in final buffer:", err);
                            }
                        }
                    }
                }

                // Once streaming is complete, process the final event.
                if (finalEvent) {
                    if (isMemeGen) {
                        const assistantMessage = {
                            role: 'assistant',
                            content: finalEvent.content,
                            type: 'image',
                            command: isMemeGen ? 'create-agent' : 'image-gen'
                        } as Message;
                        setDisplayMessages(prev => [...prev, assistantMessage]);
                        await handleMemeImageGeneration(finalEvent.content, promptText);
                        setProcessingCommand(true);
                        setShowCreateAgentModal(true);
                        setApiMessages(prev => [
                            ...prev,
                            { role: 'assistant', content: finalEvent.prompt || finalEvent.content }
                        ]);
                    } else {
                        const assistantMessage = {
                            role: 'assistant',
                            content: finalEvent.content,
                            type: 'image',
                            command: isMemeGen ? 'create-agent' : 'image-gen'
                        } as Message;
                        setDisplayMessages(prev => [...prev, assistantMessage]);
                        setApiMessages(prev => [
                            ...prev,
                            { role: 'assistant', content: finalEvent.prompt || finalEvent.content }
                        ]);
                    }
                } else {
                    console.warn("No final event received from the stream.");
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
                setProcessingCommand(false)
            }

        }
        else {
            let displayMessageContent: any[] = [];
            let apiMessageContent: any[] = [];

            if (files.length > 0) {
                // Handle case when files are present
                if (inputMessage.trim()) {
                    displayMessageContent.push({
                        type: "text",
                        text: inputMessage.trim()
                    });
                    apiMessageContent.push({
                        type: "text",
                        text: inputMessage.trim()
                    });
                }

                for (const fileObj of files) {
                    if (fileObj.isPdf) {
                        // For display message: only add filename
                        displayMessageContent.push({
                            type: "text",
                            text: `[PDF: ${fileObj.file.name}]`
                        });

                        // For API message: add extracted text if available
                        if (pdfContent && fileObj.file.name === currentPdfName) {
                            apiMessageContent.push({
                                type: "text",
                                text: pdfContent
                            });
                        }
                    } else {
                        // For images, add to both display and API messages
                        const imageContent = {
                            type: "image_url",
                            image_url: {
                                url: fileObj.preview
                            }
                        };
                        displayMessageContent.push(imageContent);
                        apiMessageContent.push(imageContent);
                    }
                }
                const displayMessage: Message = {
                    role: 'user',
                    content: displayMessageContent
                };

                const apiMessage: Message = {
                    role: 'user',
                    content: apiMessageContent
                };

                setDisplayMessages(prev => [...prev, displayMessage]);
                setApiMessages(prev => [...prev, apiMessage]);

                setInputMessage('');
                if (inputRef.current) {
                    inputRef.current.style.height = '2.5rem';
                }
                setFiles([]);
                setPdfContent(null);
                setCurrentPdfName(null);
                setIsLoading(true);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 120000);

                try {
                    // Create temporary message for streaming response
                    const tempAssistantMessage: Message = {
                        role: 'assistant',
                        content: ''
                    };

                    // Add temporary message to display
                    setDisplayMessages(prev => [...prev, tempAssistantMessage]);

                    // Initiate the streaming request
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: [...apiMessages, apiMessage],
                            selectedModel: 'Mistral',
                        }),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) throw new Error('Failed to get response');

                    // Get the response reader
                    const reader = response.body?.getReader();
                    if (!reader) throw new Error('No reader available');

                    let accumulatedContent = '';

                    // Read the stream
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        // Convert the chunk to text
                        const chunk = new TextDecoder().decode(value);

                        // Handle special messages (proof and errors)
                        if (chunk.startsWith('data: [PROOF]')) {
                            const proof = chunk.replace('data: [PROOF]', '').trim();
                            setProofData(proof);
                            continue;
                        }

                        if (chunk.startsWith('data: [ERROR]')) {
                            console.error('Stream error:', chunk);
                            continue;
                        }

                        // Accumulate the content
                        accumulatedContent += chunk;

                        // Update the temporary message with accumulated content
                        setDisplayMessages(prev => {
                            const newMessages = [...prev];
                            newMessages[newMessages.length - 1] = {
                                role: 'assistant',
                                content: accumulatedContent
                            };
                            return newMessages;
                        });
                    }

                    // After streaming is complete, update API messages
                    setApiMessages(prev => [...prev, {
                        role: 'assistant',
                        content: accumulatedContent
                    }]);

                } catch (error) {
                    console.error('Error:', error);
                } finally {
                    setIsLoading(false);
                    setCurrentCommand(null);
                }

            } else {
                // Existing text-only handling
                // Add the user message to display and API messages.
                const userMessage: Message = { role: 'user', content: inputMessage };
                setDisplayMessages((prev: Message[]) => [...prev, userMessage]);
                setApiMessages((prev: Message[]) => [...prev, userMessage]);

                setInputMessage('');
                if (inputRef.current) {
                    inputRef.current.style.height = '2.5rem';
                }
                setIsLoading(true);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 120000);

                // Helper function to extract a <think> block (if any) from a message.
                const extractThought = (message: string) => {
                    const thinkMatch = message.match(/<think>([\s\S]*?)<\/think>/);
                    if (thinkMatch) {
                        return {
                            thought: thinkMatch[1].trim(),
                            content: message.replace(thinkMatch[0], '').trim(),
                        };
                    }
                    return { thought: null, content: message };
                };

                try {
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: [...apiMessages, { role: 'user', content: inputMessage } as Message],
                            selectedModel,
                        }),
                        signal: controller.signal,
                    });
                    clearTimeout(timeoutId);

                    if (!response.ok) throw new Error('Failed to get response');

                    // Create a placeholder assistant message (with empty content) that will be updated as chunks arrive.
                    const placeholderAssistantMessage: Message = { role: 'assistant', content: '' };
                    setDisplayMessages((prev: Message[]) => [...prev, placeholderAssistantMessage]);
                    setApiMessages((prev: Message[]) => [...prev, placeholderAssistantMessage]);

                    // Ensure that response.body is available.
                    if (!response.body) throw new Error("Readable stream not supported in this environment");
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder('utf-8');

                    let done = false;
                    let accumulatedContent = '';
                    let buffer = ''; // holds incomplete word from previous chunk

                    while (!done) {
                        const { value, done: doneReading } = await reader.read();
                        done = doneReading;
                        if (value) {
                            // Decode the chunk.
                            let chunk = decoder.decode(value, { stream: true });
                            // Optionally remove unwanted parts from the chunk.
                            chunk = chunk.replace(/data:/g, '');
                            chunk = chunk.replace(/\[PROOF\]\s*\[object Object\]/g, '');

                            // Prepend any leftover text from the previous chunk.
                            let combined = buffer + chunk;
                            let newlineIndex: number;

                            // Process complete lines (separated by newline).
                            while ((newlineIndex = combined.indexOf('\n')) !== -1) {
                                const fullLine = combined.slice(0, newlineIndex);
                                accumulatedContent += fullLine + '\n' + '\n';


                                // Update the assistant's message so the UI shows the streamed text.
                                setDisplayMessages((prevMessages) => {
                                    const messagesCopy = [...prevMessages];
                                    messagesCopy[messagesCopy.length - 1] = {
                                        ...messagesCopy[messagesCopy.length - 1],
                                        content: accumulatedContent,
                                    };
                                    return messagesCopy;
                                });

                                // Remove the processed line and its newline from the combined text.
                                combined = combined.slice(newlineIndex + 1);
                            }

                            // Save any incomplete part for the next chunk.
                            buffer = combined;
                        }
                    }

                    // Flush any remaining text if it didn’t end with a newline.
                    if (buffer.length > 0) {
                        accumulatedContent += buffer;
                        setDisplayMessages((prevMessages) => {
                            const messagesCopy = [...prevMessages];
                            messagesCopy[messagesCopy.length - 1] = {
                                ...messagesCopy[messagesCopy.length - 1],
                                content: accumulatedContent,
                            };
                            return messagesCopy;
                        });
                    }


                    // Flush any remaining text in the buffer (if any) after streaming completes.
                    // if (buffer) {
                    //     accumulatedContent += buffer;
                    // }

                    // Optionally extract thought if present.
                    const { thought, content } = extractThought(accumulatedContent);
                    const rawFinalContent = thought ? JSON.stringify({ thought, content }) : accumulatedContent;

                    // Update the assistant's message with the final formatted content.
                    setDisplayMessages((prevMessages: Message[]) => {
                        const messagesCopy = [...prevMessages];
                        messagesCopy[messagesCopy.length - 1] = {
                            ...messagesCopy[messagesCopy.length - 1],
                            content: rawFinalContent,
                        };
                        return messagesCopy;
                    });
                    setApiMessages((prevMessages: Message[]) => {
                        const messagesCopy = [...prevMessages];
                        messagesCopy[messagesCopy.length - 1] = {
                            ...messagesCopy[messagesCopy.length - 1],
                            content: rawFinalContent,
                        };
                        return messagesCopy;
                    });

                    // Optionally update proof data if it's sent along.
                    // setProofData(data.proof);

                } catch (error) {
                    console.error('Error:', error);
                    toast.error('Due to unexpected capacity contraints ZkTerminal is unable to process this prompt. Please try again later or open a new chat window and retry.')
                } finally {
                    setIsLoading(false);
                }
            }
        }
        setCommandPart('');
        setNormalPart('');
    };

    const showCoinsTable = async () => {
        const { selectedTicker } = useTickerStore.getState();
        try {
            const response = await fetch('https://zynapse.zkagi.ai/api/coins', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': 'zk-123321',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch coin info.');
            }

            const coins = await response.json();
            const filteredCoins = coins.data.filter(
                (coin: { ticker: string; memcoin_address: any; }) =>
                    coin.ticker === selectedTicker && !coin.memcoin_address
            );
            setFilteredCoins(filteredCoins);

            const coinOptionsMessage: Message = {
                role: 'assistant',
                content: (
                    <div className="w-full max-w-2xl bg-[#171D3D] rounded-lg p-4 shadow-lg">
                        <div className="mb-4 text-white font-semibold">Available Agents:</div>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-left text-gray-400">
                                    <th className="p-2">#</th>
                                    <th className="p-2">Coin Name</th>
                                    <th className="p-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCoins.length > 0 ? (
                                    filteredCoins.map((coin: { _id: string; coin_name: string }, index: number) => (
                                        <tr
                                            key={coin._id}
                                            className="border-t border-gray-700 hover:bg-[#24284E] cursor-pointer"
                                        >
                                            <td className="p-2 text-gray-400">{index + 1}</td>
                                            <td className="p-2 text-white">{coin.coin_name}</td>
                                            <td className="p-2">
                                                <button
                                                    className="text-blue-500 underline hover:text-blue-700"
                                                    onClick={() => handleLaunchCoin(coin._id)}
                                                >
                                                    Launch
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="p-2 text-center text-gray-400">
                                            No coins available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="mt-4 text-gray-400 text-sm">
                            Enter /launch [id] to launch a specific coin
                        </div>
                    </div>
                ),
                type: 'text',
            };

            setDisplayMessages((prev) => [...prev, coinOptionsMessage]);
        } catch (error) {
            const errorMessage: Message = {
                role: 'assistant',
                content: `Error: ${error}`,
                type: 'text',
            };
            setDisplayMessages((prev) => [...prev, errorMessage]);
        }
    };


    const handleLaunchCoin = async (coinId: string) => {
        const { selectedTicker } = useTickerStore.getState();

        if (!selectedTicker) {
            console.error('Agent not selected.');
            return;
        }

        try {
            // Get the coin details for the selected coin ID
            const response = await fetch('https://zynapse.zkagi.ai/api/coins', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': 'zk-123321',
                },
            });

            const coin = await response.json();
            const coins = coin.data;
            // const selectedCoin = coins.find((coin: { _id: string; }) => coin._id === coinId);

            const selectedCoin = coins.find((coin: { _id: any; }) => {
                return coin._id === coinId;
            });


            let memecoinAddress = '';
            if (wallet) {
                const tokenResult = await TokenCreator({
                    name: selectedCoin.coin_name,
                    symbol: selectedCoin.ticker,
                    description: selectedCoin.description,
                    imageBase64: 'data:image/png;base64,' + selectedCoin.image_base64,
                    wallet
                });

                console.log('Token created successfully:', tokenResult.signature);
                memecoinAddress = tokenResult.mintAddress;
            }
            else {
                throw new Error('Wallet not connected');
            }

            if (!selectedCoin) {
                throw new Error('Coin not found.');
            }

            // Perform the POST request to the `pmpCoinLaunch` API
            const launchResponse = await fetch('https://zynapse.zkagi.ai/api/pmpCoinLaunch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': 'zk-123321',
                },
                body: JSON.stringify({
                    ticker: selectedTicker,
                    memecoin_address: selectedCoin.address,
                }),
            });

            if (!launchResponse.ok) {
                throw new Error('Failed to launch coin.');
            }

            // Notify the user about the success
            const successMessage: Message = {
                role: 'assistant',
                content: `Successfully launched memecoin for ticker: ${selectedTicker}`,
                type: 'text',
            };
            setDisplayMessages((prev) => [...prev, successMessage]);
        } catch (error) {
            const errorMessage: Message = {
                role: 'assistant',
                content: `Error: ${error}`,
                type: 'text',
            };
            setDisplayMessages((prev) => [...prev, errorMessage]);
        }
    };


    const setMemeData = useMemeStore((state) => state.setMemeData);
    const { publicKey } = useWallet();
    const { selectedTicker } = useTickerStore.getState();
    const { formData, setFormData, error, setError, success, setSuccess } = useFormStore();

    const handleConfirmCharacter = async (finalJson: any) => {
        try {
            const saveResponse = await fetch('https://zynapse.zkagi.ai/characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': 'zk-123321'
                },
                body: JSON.stringify({
                    wallet_address: publicKey,
                    ticker: selectedTicker,
                    characteristics: finalJson,
                    status: null
                })
            });

            if (!saveResponse.ok) {
                throw new Error('Failed to save character data');
            }

            // Reset form data, show success, etc.
            setFormData({
                email: '',
                password: '',
                username: ''
            });
            setSuccess(true);
            console.log('success', useFormStore.getState().success);

            setCharacterJson(null);
        } catch (err) {
            setError('Failed to save character. Please try again.');
            console.error('Character save error:', err);
        }
    }

    const handleLaunchMemeCoin = (agentType: string) => {

        if (memeGenerationData && currentSeed && wallet && agentType) {
            setMemeData({
                name: memeGenerationData.name,
                description: memeGenerationData.description,
                prompt: memeGenerationData.prompt,
                base64Image: memeGenerationData.base64Image,
                seed: currentSeed,
                wallet: wallet.publicKey ? wallet.publicKey.toString() : ''
            });
            router.push(`/memelaunch?agentType=${agentType}`);
        } else {
            console.error('No meme generation data available');
            router.push('/memelaunch');
        }
    };

    const [loading, setLoading] = useState(false);

    const handleMintNFT = async (base64Image: string) => {
        setLoading(true);
        try {
            // const { txSignature, result } = await createNft(base64Image, 'NFT', wallet);

            // console.log('signature', txSignature)
            // console.log('result', result)
            const response = await createNft(base64Image, 'NFT', wallet);

            console.log(response);
            // const metaplexUrl = `https://core.metaplex.com/explorer/${assetPublicKey}?env=devnet`;
            // window.open(metaplexUrl, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error("Failed to mint NFT:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!proofData) {
            console.log('No proof data to download');
            return;
        }

        const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: 'application/json' });

        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: 'proof.json',
                    types: [{
                        description: 'JSON File',
                        accept: { 'application/json': ['.json'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
            } catch (err) {
                console.error('Failed to save file:', err);
                // Fall back to the alternative method
                fallbackDownload(blob);
            }
        } else {
            fallbackDownload(blob);
        }
    };

    const fallbackDownload = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'proof.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const touchX = e.touches[0].clientX;
        // Only start tracking if the touch is near the left edge (say within 50px)
        if (touchX < 50) {
            setTouchStartX(touchX);
        }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartX !== null) {
            const currentX = e.touches[0].clientX;
            const diff = currentX - touchStartX;
            // If the swipe distance is greater than a threshold (e.g., 100px), open the menu.
            if (diff > 100) {
                toggleMenu();
                // Reset so that the menu does not toggle repeatedly during the swipe
                setTouchStartX(null);
            }
        }
    };

    const handleTouchEnd = () => {
        // Reset the starting point when the touch ends.
        setTouchStartX(null);
    };

    const renderMessageContent = (message: Message) => {
        // Handle React elements
        if (React.isValidElement(message.content)) {
            return message.content;
        }

        // Handle array content (existing logic)
        if (Array.isArray(message.content)) {
            return (
                <div className="flex flex-col space-y-2">
                    {message.content.map((content, index) => {
                        if (content.type === 'text') {
                            if (content.text?.startsWith('[PDF:')) {
                                const pdfName = content.text.match(/\[PDF: (.*?)\]/)?.[1] || 'Unnamed PDF';
                                return (
                                    <div key={index} className="flex items-center space-x-2 bg-[#24284E] rounded-lg p-2 border border-[#BDA0FF]">
                                        <Image src="/images/pdf.svg" alt="PDF icon" width={20} height={20} />
                                        <span className="text-[#BDA0FF] text-xs">{pdfName}</span>
                                    </div>
                                );
                            }
                            return <div key={index} className="text-white">{renderTextContent(content.text || '')}</div>;
                        }
                        return null;
                    })}
                    {/* Image block */}
                    <div className="flex flex-row space-x-2">
                        {message.content
                            .filter(content => content.type === 'image_url')
                            .map((content, index) => (
                                <Image
                                    key={index}
                                    src={content.image_url?.url || ''}
                                    alt="Uploaded content"
                                    width={80}
                                    height={80}
                                    className="object-cover rounded-lg"
                                    layout="fixed"
                                    quality={75}
                                />
                            ))}
                    </div>
                </div>
            );
        }

        // Handle string content (user commands & assistant messages)
        if (typeof message.content === 'string') {
            console.log('testing success')
            // User commands processing
            if (message.role === 'user') {
                let displayedContent = message.content;

                if (displayedContent.startsWith('/image-gen')) {
                    const prompt = displayedContent.replace('/image-gen', '').trim();
                    displayedContent = `Generate image of: ${prompt}`;
                } else if (displayedContent.startsWith('/create-agent')) {
                    const prompt = displayedContent.replace('/create-agent', '').trim();
                    displayedContent = `Generate an agent for ${prompt}`;
                }

                return <div className="text-white">{displayedContent}</div>;
            }

            // Assistant responses (image type)
            if (message.role === 'assistant' && message.type === 'image') {
                return (
                    <ResultBlock
                        content={message.content}
                        type="image"
                        onMintNFT={handleMintNFT}
                        onDownloadProof={handleDownload}
                        loading={loading}
                    />
                );
            }

            // Assistant responses (text-based, including thoughts)
            if (message.role === 'assistant' && message.type !== 'image') {
                let parsedContent;
                try {
                    parsedContent = JSON.parse(message.content); // Attempt to parse JSON
                } catch (error) {
                    console.error("Error parsing message content:", error);
                    parsedContent = { content: message.content, thought: null }; // Fallback in case of invalid JSON
                }

                const { content, thought } = parsedContent;

                return (
                    <div>
                        {/* Render Thought Below Message (Only for Assistant) */}
                        {thought && (
                            <div className="mt-2 p-3 border-l-4 border-indigo-500  dark:bg-indigo-900 rounded-lg mb-1">
                                {/* <button
                                    onClick={(e) => e.currentTarget.nextSibling.classList.toggle("hidden")}
                                    className="text-indigo-600 dark:text-indigo-300 font-semibold flex items-center"
                                >
                                    ▼ Hide Thought
                                </button> */}
                                <button
                                    onClick={(e) => {
                                        const nextElement = e.currentTarget.nextSibling as HTMLElement | null;
                                        if (nextElement) {
                                            nextElement.classList.toggle("hidden");
                                        }
                                    }}
                                    className="text-indigo-600 dark:text-indigo-300 font-semibold flex items-center"
                                >
                                    ▼ Hide Thought
                                </button>

                                <div className="mt-2 text-gray-300 text-sm hidden">
                                    <strong className="text-white">Thought:</strong> {thought}
                                </div>
                            </div>
                        )}
                        {/* Render Message Content */}
                        {renderTextContent(content)}
                    </div>
                );
            }

            return renderTextContent(message.content);
        }

        return null;
    };

    // const renderTextContent = (content: string) => {
    //     console.log('text content')
    //     const parts = content.split('```');
    //     return parts.map((part, index) => {
    //         if (index % 2 === 0) {
    //             const formattedPart = part.replace(/\n/g, '\n\n');
    //             // This is regular text - pass the current part, not the whole content
    //             return <ReactMarkdown key={index}>{formattedPart}</ReactMarkdown>;
    //         } else {
    //             // This is a code block
    //             return (
    //                 <ResultBlock
    //                     key={index}
    //                     content={part.trim().split('\n').slice(1).join('\n')}
    //                     language={part.trim().split('\n')[0]}
    //                     type="code"
    //                     onDownloadProof={handleDownload}
    //                 />
    //             );
    //         }
    //     });
    // };

    const renderTextContent = (content?: string) => {
        if (!content) {
            return null; // or return an empty fragment: <></>
        }
        console.log('text content');
        const parts = content.split('```');
        return parts.map((part, index) => {
            if (index % 2 === 0) {
                const formattedPart = part.replace(/\n/g, '\n\n');
                return <ReactMarkdown key={index}>{formattedPart}</ReactMarkdown>;
            } else {
                const lines = part.trim().split('\n');
                return (
                    <ResultBlock
                        key={index}
                        content={lines.slice(1).join('\n')}
                        language={lines[0]}
                        type="code"
                        onDownloadProof={handleDownload}
                    />
                );
            }
        });
    };


    // Helper: Extract image URL from message.content
    const getImageUrlFromMessageContent = (
        content: Message['content']
    ): string | undefined => {
        // If it's a string, assume it's the image URL.
        if (typeof content === 'string') {
            return content;
        }
        // If it's an array, try to find an object of type 'image_url'
        if (Array.isArray(content)) {
            for (const item of content) {
                // Ensure the item is an object and has a 'type' property
                if (
                    typeof item === 'object' &&
                    item !== null &&
                    'type' in item &&
                    item.type === 'image_url' &&
                    item.image_url &&
                    item.image_url.url
                ) {
                    return item.image_url.url;
                }
            }
        }
        return undefined;
    };



    // Helper: Convert a data URL to a Blob
    function dataURLtoBlob(dataurl: string): Blob {
        const arr = dataurl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) {
            throw new Error("Invalid data URL");
        }
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    // Updated download function
    const downloadImage = (imageData: string) => {
        try {
            // Convert the data URL to a Blob
            const blob = dataURLtoBlob(imageData);
            // Create a blob URL
            const blobUrl = URL.createObjectURL(blob);
            // Create a temporary anchor element and trigger the download
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'zkdownloaded-image.png'; // Change the filename/extension if needed
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            // Clean up the blob URL after a short delay
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        } catch (error) {
            console.error("Error downloading image:", error);
        }
    };


    const [hasHydrated, setHasHydrated] = useState(false);

    useEffect(() => {
        setHasHydrated(true);
    }, []);

    // If we're not hydrated yet, return nothing or a skeleton
    // so there is no mismatch between SSR and client.
    if (!hasHydrated) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-[#000000] overflow-hidden text-white">

            {showConnectModal && <ConnectWalletModal onClose={() => setShowConnectModal(false)} />}

            {/* <PresaleBanner walletConnected={connected} walletAddress={walletAddress} /> */}

            {/* Main content */}
            <div className={`flex-1 flex flex-col bg-[#08121f] `}>
                {/* pt-16 md:pt-10 */}
                {/* Header code remains the same */}

                {/* <header className="w-full py-4 bg-[#08121f] flex justify-between items-center px-4">
                    {isMobile && (
                        <button onClick={toggleMenu} className="text-white">
                            <BiMenuAltLeft size={28} />
                        </button>
                    )}
                    <div className="text-lg font-semibold flex-1 flex justify-center items-center gap-2">
                        <div><Image
                            src="images/tiger.svg"
                            alt="logo"
                            width={30}
                            height={30}
                        /></div>
                        <div className='font-ttfirs text-xl'>ZkSurfer</div>
                    </div>
                    <div className="flex space-x-4">

                        <button className="text-black bg-white p-1 rounded-lg"><FaPen /></button>
                        <button className="text-white"><HiDotsVertical /></button>
                    </div>
                </header> */}

                {isMobile ? (
                    // Mobile header: two groups—left and right
                    <div
                        className="w-full bg-[#08121f] px-4 py-2"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className="flex items-center justify-between">
                            {/* Left group: menu button and logo */}
                            <div className="flex items-center">
                                <button onClick={toggleMenu} className="text-white">
                                    <BiMenuAltLeft size={28} />
                                </button>
                                <div className="px-2">
                                    <Image
                                        src="/images/tiger.svg"
                                        alt="Logo"
                                        width={30}
                                        height={30}
                                    />
                                </div>
                            </div>
                            {/* Right group: wallet connect and dropdown */}
                            <div className="flex items-center gap-2">
                                <CustomWalletButton />
                                <div className="relative">
                                    <button
                                        onClick={() => setIsOpen(!isOpen)}
                                        className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                                    >
                                        {selectedModel} ▼
                                    </button>
                                    {isOpen && (
                                        <div className="absolute right-0 mt-2 w-full bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50">
                                            <button
                                                className="w-full px-4 py-2 hover:bg-gray-700 text-white text-left"
                                                onClick={() => {
                                                    setSelectedModel("DeepSeek");
                                                    setIsOpen(false);
                                                }}
                                            >
                                                DeepSeek
                                            </button>
                                            <button
                                                className="w-full px-4 py-2 hover:bg-gray-700 text-white text-left"
                                                onClick={() => {
                                                    setSelectedModel("Mistral");
                                                    setIsOpen(false);
                                                }}
                                            >
                                                Mistral
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Desktop header: your original one (or adjusted as needed)
                    <header className="w-full py-4 bg-[#08121f] flex justify-between items-center px-4">
                        <div className="text-lg font-semibold flex-1 flex justify-start items-center gap-2">
                            <div>
                                <Image
                                    src="/images/tiger.svg"
                                    alt="logo"
                                    width={30}
                                    height={30}
                                />
                            </div>
                            <div className="font-ttfirs text-xl">ZkTerminal</div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <CustomWalletButton />
                            <div className="relative">
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                                >
                                    {selectedModel} ▼
                                </button>
                                {isOpen && (
                                    <div className="absolute left-0 mt-2 w-full bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50">
                                        <button
                                            className="w-full px-4 py-2 hover:bg-gray-700 text-white text-left"
                                            onClick={() => {
                                                setSelectedModel("DeepSeek");
                                                setIsOpen(false);
                                            }}
                                        >
                                            DeepSeek
                                        </button>
                                        <button
                                            className="w-full px-4 py-2 hover:bg-gray-700 text-white text-left"
                                            onClick={() => {
                                                setSelectedModel("Mistral");
                                                setIsOpen(false);
                                            }}
                                        >
                                            Mistral
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>
                )}



                {/* content post header */}
                <div className="flex h-full gap-5 ">
                    <div
                        className={`
                    ${isMobile ? (isMenuOpen ? 'block' : 'hidden') : 'block'} 
                    ${isMobile ? 'w-3/4' : 'w-64'} 
                    bg-[#08121f] border left-0 h-full rounded-lg ml-3
                   `}
                    >
                        <div className="flex flex-col h-full">
                            {/* Search Input and Header */}
                            {/* <div className="p-4 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="relative bg-gradient-to-tr from-[#000D33] via-[#9A9A9A] to-[#000D33] p-0.5 rounded-lg w-full mr-4">
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="w-full bg-[#08121f] text-white p-2 rounded-lg"
                                />
                            </div>
                            {isMobile && (
                                <button onClick={toggleMenu} className="text-white flex justify-center items-center font-sourceCode">
                                    <BiMenuAltRight size={32} />
                                </button>
                            )}
                        </div>
                       </div> */}

                            {/* Main Content */}
                            <div className="flex-grow overflow-y-auto p-4">
                                <div className="flex flex-col">
                                    <div className="flex justify-between">
                                        <button className="text-white w-full">
                                            <TbLayoutSidebarLeftCollapseFilled />
                                        </button>
                                        <button className="text-white">
                                            <HiOutlinePencilSquare />
                                        </button>
                                    </div>

                                    <Image
                                        src="images/Line.svg"
                                        alt="Welcome Line"
                                        width={550}
                                        height={50}
                                        className="mt-2 mb-4 w-full"
                                    />

                                    <div
                                        className="mb-4 flex flex-col"
                                        data-marketplace-button
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <Link href="/" passHref >
                                            <div className="mb-1 flex flex-row items-center justify-start gap-2 cursor-pointer">
                                                <Image
                                                    src="images/tiger.svg"
                                                    alt="logo"
                                                    width={15}
                                                    height={15}
                                                />
                                                ZkTerminal
                                            </div>
                                        </Link>
                                        <Link href="/marketplace" passHref >
                                            <div className="mb-1 flex flex-row items-center justify-start gap-2 cursor-pointer">
                                                <Image
                                                    src="images/marketplace.svg"
                                                    alt="explore marketplace"
                                                    width={15}
                                                    height={15}
                                                    className="my-2"
                                                />
                                                AI Coin Marketplace
                                            </div>
                                        </Link>
                                        <Link href="/explore" passHref >
                                            <div className="mb-1 flex flex-row items-center justify-start gap-2 cursor-pointer">
                                                <Image
                                                    src="images/marketplace.svg"
                                                    alt="explore marketplace"
                                                    width={15}
                                                    height={15}
                                                    className="my-2"
                                                />
                                                Explore AI Agents
                                            </div>
                                        </Link>
                                        <Link href="/api-key" passHref >
                                            <div className="mb-1 flex flex-row items-center justify-start gap-2 cursor-pointer">
                                                <Image
                                                    src="images/lock.svg"
                                                    alt="explore marketplace"
                                                    width={15}
                                                    height={15}
                                                    className="my-2"
                                                />
                                                API Keys
                                            </div>
                                        </Link>

                                    </div>
                                    <div className="mb-4">
                                        <h3
                                            className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
                                            onClick={toggleDropdown}
                                        >
                                            Agents
                                            {isDropdownOpen ? <FaChevronDown /> : <FaChevronUp />}
                                        </h3>
                                        {isDropdownOpen && (
                                            <div
                                                className="space-y-2 overflow-y-auto"
                                                style={{ maxHeight: '20rem' }}
                                            >
                                                {mergedTickers.length > 0 ? (
                                                    mergedTickers.map(({ ticker, status }) => (
                                                        <div
                                                            key={ticker}
                                                            className={`cursor-pointer hover:bg-gray-700 p-2 rounded flex items-center space-x-2 ${status === null ? 'cursor-not-allowed' : ''
                                                                }`}
                                                            onClick={() => toggleTickerStatus(ticker, status)}
                                                        >
                                                            <span
                                                                className={`inline-block w-3 h-3 rounded-full ${status === null ? 'bg-gray-500' : status ? 'bg-green-500' : 'bg-red-500'
                                                                    }`}
                                                            ></span>
                                                            <span>{ticker}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-gray-500 text-sm text-center p-4 italic">No agents created yet</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {/* <div className="mb-4">
                                <h3
                                    className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
                                    onClick={toggleDropdown}
                                >
                                    Agents
                                    {isDropdownOpen ? <FaChevronDown /> : <FaChevronUp />}
                                </h3>
                                {isDropdownOpen && (
                                    <div
                                        className="space-y-2 overflow-y-auto"
                                        style={{ maxHeight: '20rem' }}
                                    >
                                        {tickersData.map((item: { ticker: string; status: boolean }, index: number) => (
                                            <div
                                                key={index}
                                                className="cursor-pointer hover:bg-gray-700 p-2 rounded flex items-center space-x-2"
                                                onClick={() => toggleTickerStatus(item.ticker, item.status)}
                                            >
                                                <span
                                                    className={`inline-block w-3 h-3 rounded-full ${item.status ? 'bg-green-500' : 'bg-red-500'
                                                        }`}
                                                ></span>
                                                <span>{item.ticker}</span>
                                            </div>
                                        ))}

                                    </div>
                                )}
                            </div> */}
                                </div>
                            </div>

                            <a
                                href="https://app.gitbook.com/o/rmFFGxpNLUTqMbbTMW3k/s/cD3hqS7a0U5cMxQQhMo6/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                            >
                                <div className="p-3 flex-shrink-0 mb-2">
                                    <div className="flex flex-row gap-2 p-[1px] rounded-lg bg-gradient-to-r from-[#FFFFFF] via-[#6AD7FF] via-35% to-[#FFFFFF]">
                                        <div className="flex flex-row gap-5 bg-[#08131f] p-3 rounded-lg w-full">
                                            <div>
                                                <Image
                                                    src="images/Group.svg"
                                                    alt="Docs"
                                                    width={30}
                                                    height={30}
                                                />
                                            </div>
                                            <div>
                                                <div className="font-ttfirs bg-gradient-to-b from-[#2AF698] to-[#5BBFCD] text-transparent bg-clip-text text-sm">
                                                    Need Help?
                                                </div>
                                                <div className="text-xs font-ttfirs">Check our docs</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </a>


                        </div>
                    </div>

                    {/* Chat messages */}
                    <div className=' flex flex-col justify-between w-full'>
                        <div className="flex-grow overflow-x-auto px-4 py-8 max-h-[650px] ">
                            {isInitialView ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl">
                                        {sampleCommands.map((cmd, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-col justify-center items-center bg-gray-800 text-white p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition duration-300"
                                                onClick={() => handleCommandBoxClick(cmd.command)}
                                            >
                                                <h3 className="text-xl font-bold mb-2">{cmd.label}</h3>
                                                <p className="text-sm text-gray-300 text-center">
                                                    {cmd.command === 'pre-sale'
                                                        ? 'Click to join pre sale'
                                                        : `Click to use the ${cmd.command} command. You need to enter your custom instruction and press enter or click submit to send your input prompt for execution.`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {/* Render chat messages */}
                                    {displayMessages.map((message, index) => {
                                        const thought = thoughtsMap?.[index];
                                        const isOpen = openThoughtsMap[index] ?? true;
                                        return (
                                            <div key={index} className="mb-4 flex justify-start w-full">
                                                <div key={index} className="mb-4 flex justify-start w-full">
                                                    <div className="flex-shrink-0 mr-3">
                                                        <div className="w-10 h-10 rounded-full bg-[#171D3D] border flex items-center justify-center">
                                                            {message.role === 'user' ? (
                                                                <span>U</span>
                                                            ) : (
                                                                <Image
                                                                    src="images/tiger.svg"
                                                                    alt="logo"
                                                                    width={40}
                                                                    height={40}
                                                                    className='p-2'
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-start">
                                                        <div className="flex items-center justify-between w-full mt-2">

                                                            <span
                                                                className={`flex justify-between items-center text-md text-gray-400 font-sourceCode ${message.role !== 'user' &&
                                                                    'bg-gradient-to-br from-zkIndigo via-zkLightPurple to-zkPurple bg-clip-text text-transparent'
                                                                    } ${!isMobile ? `mt-0.5` : ``}`}
                                                            >
                                                                {message.role === 'user' ? 'User' : 'ZkTerminal'}

                                                            </span>
                                                            {/* {message.role !== 'user' && (
                                                                <div className="flex space-x-2">
                                                                    <button className="text-white rounded-lg" onClick={() => {
                                                                        const imageContent = message.content;
                                                                        // If it's not a complete data URL, add the header.
                                                                        let base64Image: string;
                                                                        if (typeof imageContent === 'string') {
                                                                            // Check if the string already starts with the proper header.
                                                                            if (!imageContent.startsWith('data:image/')) {
                                                                                base64Image = `data:image/jpeg;base64,${imageContent}`;
                                                                            } else {
                                                                                base64Image = imageContent;
                                                                            }
                                                                            downloadImage(base64Image);
                                                                        } else {
                                                                            console.error('Unexpected image content format');
                                                                        }
                                                                    }}>
                                                                        <Image
                                                                            src="images/Download.svg"
                                                                            alt="logo"
                                                                            width={20}
                                                                            height={20}
                                                                        />
                                                                    </button>
                                                                    <button className="text-white rounded-lg">
                                                                        <Image
                                                                            src="images/share.svg"
                                                                            alt="logo"
                                                                            width={20}
                                                                            height={20}
                                                                        />
                                                                    </button>
                                                                </div>
                                                            )} */}

                                                            {message.role !== 'user' && (
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        className="text-white rounded-lg"
                                                                        onClick={() => {
                                                                            if (typeof message.content === 'string') {
                                                                                // Check if the content is a data URL for an image.
                                                                                if (message.content.startsWith('data:image/')) {
                                                                                    // Download as an image.
                                                                                    downloadImage(message.content);
                                                                                } else {
                                                                                    // Otherwise, treat the content as text.
                                                                                    // Create a Blob from the text content.
                                                                                    const blob = new Blob([message.content], { type: 'text/plain' });
                                                                                    const url = URL.createObjectURL(blob);
                                                                                    // Create a temporary anchor element and trigger the download.
                                                                                    const a = document.createElement('a');
                                                                                    a.href = url;
                                                                                    a.download = 'generated.txt';
                                                                                    document.body.appendChild(a);
                                                                                    a.click();
                                                                                    document.body.removeChild(a);
                                                                                    URL.revokeObjectURL(url);
                                                                                }
                                                                            } else {
                                                                                console.error('Unexpected content format');
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Image
                                                                            src="images/Download.svg"
                                                                            alt="Download"
                                                                            width={20}
                                                                            height={20}
                                                                        />
                                                                    </button>
                                                                    <button className="text-white rounded-lg">
                                                                        <Image
                                                                            src="images/share.svg"
                                                                            alt="Share"
                                                                            width={20}
                                                                            height={20}
                                                                        />
                                                                    </button>
                                                                </div>
                                                            )}


                                                        </div>
                                                        {message.role === 'assistant' &&

                                                            (typeof message.content === 'string' && message.content.startsWith('/')) ? (
                                                            <ResultBlock
                                                                content={message.content}
                                                                type="image"
                                                                onMintNFT={handleMintNFT}
                                                                onDownloadProof={handleDownload}
                                                                imageResultType={message.command}
                                                                // onLaunchMemeCoin={message.command === 'meme-coin' ? () => router.push('/memelaunch') : undefined}
                                                                // onLaunchMemeCoin={message.command === 'create-agent' ? handleLaunchMemeCoin : undefined}
                                                                onLaunchMemeCoin={
                                                                    message.command === "create-agent"
                                                                        ? () => setShowCreateAgentModal(true)
                                                                        : undefined
                                                                }

                                                                // onLaunchMemeCoin={
                                                                //     message.command === 'create-agent'
                                                                //         ? () => {
                                                                //             handleLaunchMemeCoin();
                                                                //             handleLaunchAgent();
                                                                //         }
                                                                //         : undefined
                                                                // }
                                                                loading={loading}
                                                            //   loading={message.command === "create-agent" ? loading : loading}
                                                            />
                                                        ) : (
                                                            <div className="inline-block p-1 rounded-lg text-white">
                                                                {renderMessageContent(message)}
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    )}
                                    <div ref={messagesEndRef} />

                                    {isLoading && (
                                        processingCommand ? (
                                            // Custom loader for /create-agent and /image-gen
                                            <ResultBlock type="image" processing={true}
                                                onDownloadProof={handleDownload} imageResultType={imageResultType} onMintNFT={handleMintNFT} onLaunchMemeCoin={openCreateAgentModal} />
                                        ) : (
                                            // Default loader
                                            <div className="text-center">
                                                <span className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></span>
                                                <p>Processing your query. This may take up to 2 minutes...</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        <footer className="w-full py-6 flex justify-center px-2">
                            <div className={`bg-gradient-to-tr from-[#000D33] via-[#9A9A9A] to-[#000D33] p-0.5 rounded-lg ${!isMobile ? 'w-2/5' : 'w-full'} w-3/4`}>
                                <form onSubmit={handleSubmit} className="w-full flex flex-col bg-[#08121f] rounded-lg">
                                    {files.length > 0 && (
                                        // <div className="flex flex-wrap gap-2 p-2">
                                        //     {files.map((file, index) => (
                                        //         <div key={index} className="relative w-20 h-20">
                                        //             {file.isPdf ? (
                                        //                 <div className="w-full h-full flex items-center justify-center bg-[#24284E] rounded-lg text-xs text-[#BDA0FF] text-center overflow-hidden p-1 border border-[#BDA0FF]">
                                        //                     {file.file.name}
                                        //                 </div>
                                        //             ) : (
                                        //                 <Image
                                        //                     src={file.preview}
                                        //                     alt={`Preview ${index}`}
                                        //                     width={500}
                                        //                     height={500}
                                        //                     className="w-full h-full object-cover rounded-lg"
                                        //                     layout="responsive"
                                        //                 />
                                        //             )}
                                        //             <button
                                        //                 onClick={() => removeFile(index)}
                                        //                 className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                                        //                 type="button"
                                        //             >
                                        //                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        //                     <line x1="18" y1="6" x2="6" y2="18"></line>
                                        //                     <line x1="6" y1="6" x2="18" y2="18"></line>
                                        //                 </svg>
                                        //             </button>
                                        //         </div>
                                        //     ))}
                                        // </div>
                                        <div className="flex flex-wrap gap-2 p-2">
                                            {files.map((file, index) => (
                                                <div key={index} className="relative w-20 h-20">
                                                    {file.isPdf ? (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-xs text-white rounded-lg">
                                                            {file.file.name}
                                                        </div>
                                                    ) : file.isVideoOrAudio ? (
                                                        <div className="w-full h-full">
                                                            {file.file.type.startsWith('video/') ? (
                                                                <video
                                                                    src={file.preview}
                                                                    controls
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                            ) : (
                                                                <audio
                                                                    src={file.preview}
                                                                    controls
                                                                    className="w-full object-cover rounded-lg"
                                                                />
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <img
                                                            src={file.preview}
                                                            alt={`Preview ${index}`}
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    )}
                                                    <button
                                                        onClick={() => removeFile(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                                                        type="button"
                                                    >
                                                        ✖
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                    )}


                                    <div className="flex items-center">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            //accept="image/*,.pdf"
                                            accept="image/*,.pdf,video/*,audio/*"
                                            className="hidden"
                                            id="fileInput"
                                            multiple
                                            disabled={!wallet.connected}
                                        />
                                        <label
                                            htmlFor="fileInput"
                                            className={`flex items-center justify-center bg-[#08121f] text-white rounded-lg px-3 py-2 ${!wallet.connected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                                }`}
                                            style={{
                                                height: '2.5rem', // Match the initial height of the textarea
                                            }}
                                        >
                                            <Image
                                                src="/images/Attach.svg"
                                                alt="Attach file"
                                                width={20}
                                                height={20}
                                            />
                                        </label>

                                        {/* Textarea for input */}
                                        <div className="relative w-full flex items-center bg-transparent py-1 mt-2 px-4 rounded-l-full">
                                            <textarea
                                                ref={inputRef}
                                                value={inputMessage}
                                                onChange={handleInputChange}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault(); // Prevent default new line
                                                        handleSubmit(e); // Pass the event to handleSubmit
                                                    }
                                                }}
                                                placeholder="Message ZkTerminal"
                                                className="w-full resize-none overflow-y-auto bg-[#08121f] text-white rounded-lg placeholder-[#A0AEC0] focus:outline-none"
                                                style={{
                                                    lineHeight: '1.5',
                                                    height: '2.5rem', // Same initial height as the label
                                                    maxHeight: '10rem', // Limit height to 10rem
                                                    boxSizing: 'border-box',
                                                }}
                                                onInput={(e) => {
                                                    const target = e.target as HTMLTextAreaElement;
                                                    target.style.height = '2.5rem'; // Reset to the default height
                                                    target.style.height = `${Math.min(target.scrollHeight, 160)}px`; // Adjust height dynamically
                                                }}
                                                disabled={!wallet.connected}
                                            />
                                            {/* {showAgentTypePopup && <AgentTypePopup onSelect={handleAgentTypeSelect} />} */}

                                            {showCommandPopup && (
                                                <div ref={commandPopupRef}>
                                                    <CommandPopup onSelect={handleCommandSelect} />
                                                </div>
                                            )}
                                            {showTickerPopup && (
                                                <TickerPopup tickers={tickers} onSelect={handleTickerSelect} />
                                            )}

                                            {showVideoLipsyncOption && (
                                                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-[#171D3D] rounded-lg shadow-lg z-50 p-2">
                                                    <p className="mb-2 text-sm text-white">Select animation type:</p>
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            className="px-4 py-2 bg-blue-500 text-white rounded"
                                                            onClick={() => {
                                                                // Set option and update the input field.
                                                                setVideoLipsyncOption('Animal');
                                                                setInputMessage('/video-lipsync animation mode animal');
                                                                setShowVideoLipsyncOption(false);
                                                            }}
                                                        >
                                                            Animal
                                                        </button>
                                                        <button
                                                            className="px-4 py-2 bg-blue-500 text-white rounded"
                                                            onClick={() => {
                                                                setVideoLipsyncOption('Human');
                                                                setInputMessage('/video-lipsync animation mode human');
                                                                setShowVideoLipsyncOption(false);
                                                            }}
                                                        >
                                                            Human
                                                        </button>
                                                    </div>
                                                </div>
                                            )}


                                        </div>

                                        {/* Submit button */}
                                        <button
                                            type="submit"
                                            className="bg-white text-black p-1 m-1 rounded-md font-bold"
                                            style={{
                                                height: '1.5rem', // Same height as the textarea
                                            }}
                                            disabled={isLoading || !wallet.connected}
                                        >
                                            <BsArrowReturnLeft />
                                        </button>
                                    </div>


                                </form>
                            </div>
                        </footer>
                    </div >
                </div >
            </div >

            <CreateAgentModal
                visible={showCreateAgentModal}
                onClose={() => setShowCreateAgentModal(false)}
                onAgentTypeSelect={handleAgentTypeSelect}
            />

            {/* <div className="h-screen right-0 top-0">
                <TweetPanel
                    tweets={generatedTweets}
                    wallet={wallet.publicKey?.toString()}
                    ticker={activeNavbarTicker}
                    onClose={() => setShowTweetPanel(false)}
                    generatedTweet={tweets}
                />
            </div> */}


        </div >
    );
};

export default HomeContent;