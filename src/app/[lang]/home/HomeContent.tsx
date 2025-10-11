'use client';
import { FC, useState, useEffect, useRef } from 'react';
import { BiMenuAltLeft, BiMenuAltRight } from 'react-icons/bi';
import { BsArrowReturnLeft } from 'react-icons/bs';
import { FaCreditCard, FaPen } from 'react-icons/fa';
import { HiDotsVertical } from 'react-icons/hi';
import { TbLayoutSidebarLeftCollapseFilled } from "react-icons/tb";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import Image from 'next/image';
import CreateNft from '@/component/MintNFT';
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
// import { CreateAgentModal } from '@/component/ui/AgentModal';
import { useModelStore } from '@/stores/useModel-store';
import ApiKeyBlock from '@/component/ui/ApiKeyBlock';
import ConnectWalletModal from '@/component/ui/ConnectWalletModal';
import PresaleBanner from '@/component/ui/PreSaleBanner';
import { useWhitelistStore } from '@/stores/use-whitelist-store';
import { FcAudioFile } from 'react-icons/fc';
import { Dictionary } from '@/app/i18n/types';
import { useDictionary } from '@/app/i18n/context';
import { useParams } from 'next/navigation';
import compressImageMint from '../../../lib/compressImage';
import { FaMusic } from 'react-icons/fa';
import WalletConnectPopup from '@/component/ui/ConnectWalletPopup';
import DownloadButton from '@/component/ui/DownloadButton';
import ImageSelectionModal from '@/component/ui/ImageSelectionModal';
import NewsSidebar from '@/component/NewsSidebar';
import ReportSidebar from '@/component/ui/ReportSidebar';
import Leaderboard from '@/component/ui/Leaderboard';
// import { ReportData } from '@/types/types';
import { FullReportData, CryptoNewsItem, MacroNewsItem, HourlyForecast } from '@/types/types';
import { dummyReportData } from '@/data/dummyReportData';
import PastPredictions from '@/component/ui/PastPredictions';
import TransakWidget from '@/component/ui/TransakWidgit';
import DynamicSubscriptionWidgit from '@/component/ui/DynamicSubscriptionWidgit';
import SubscriptionModal from '@/component/ui/SubscriptionModal';
import ReportPaymentModal from '@/component/ui/ReportPaymentModal';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { OnboardingTour } from '@/component/ui/OnBoardingTour';

import { useAgentCart } from '@/stores/agent-cart-store';
import AgentPicker from '@/component/zee/AgentPicker';
import FlowGate from '@/component/zee/FlowGate';
import CreateAgentModal from '@/component/agent/CreateAgentModal';
import { useZeeUiStore } from '@/stores/zee-ui-store';
import JsonPreviewModal from '@/component/ui/JsonPreviewModal';


interface GeneratedTweet {
    tweet: string;
    id?: number;
}

interface PastPredictionData { fetched_date: string; crypto_news: Array<{ news_id: string; title: string; link: string; analysis: string; sentimentScore?: number; sentimentTag?: 'bearish' | 'neutral' | 'bullish'; advice?: 'Buy' | 'Hold' | 'Sell'; reason?: string; rationale?: string; }>; macro_news: Array<{ news_id: string; title: string; link: string; description?: string; analysis: string; sentimentScore?: number; sentimentTag?: 'bearish' | 'neutral' | 'bullish'; advice?: 'Buy' | 'Hold' | 'Sell'; reason?: string; rationale?: string; }>; }

export interface HomeContentProps {
    dictionary?: Dictionary;
}

//type Command = 'image-gen' | 'create-agent' | 'content';
type Command = 'image-gen' | 'create-agent' | 'tokens' | 'tweet' | 'tweets' | 'generate-tweet' | 'generate-tweet-image' | 'generate-tweet-images' | 'save' | 'saves' | 'character-gen'  | 'api' | 'generate-voice-clone' | 'video-gen' | 'privacy-ai' |'generate-private';
//| 'bridge' | | 'video-lipsync' | 'UGC' | 'img-to-video';
// |'train' |'post' |'select'|'launch'

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

interface VideoEditModalProps {
    videoUrl: string;
    onClose(): void;
    onSaveTrimmed(trimmedBlob: Blob): void;
    onSaveCaption(caption: string): void;
}

const VideoEditModal: FC<VideoEditModalProps> = ({
    videoUrl, onClose, onSaveTrimmed, onSaveCaption
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [duration, setDuration] = useState(0);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);
    const [caption, setCaption] = useState('');

    useEffect(() => {
        const v = videoRef.current!;
        v.addEventListener('loadedmetadata', () => {
            setDuration(v.duration);
            setEnd(v.duration);
        });
    }, [videoUrl]);

    // simple trim function using MediaSource Extensions + slicing
    async function trim() {
        const response = await fetch(videoUrl);
        const buf = await response.arrayBuffer();
        // here you’d ideally use ffmpeg.wasm or server-side trim
        // for demo, we just slice the array:
        const slice = buf.slice(
            (start / duration) * buf.byteLength,
            (end / duration) * buf.byteLength
        );
        const blob = new Blob([slice], { type: 'video/mp4' });
        onSaveTrimmed(blob);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#171D3D] p-6 rounded-lg w-11/12 max-w-xl">
                <button
                    className="absolute top-3 right-3 text-white text-xl"
                    onClick={onClose}
                >×</button>
                <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full mb-4 rounded"
                />

                <div className="mb-4">
                    <label className="text-white block mb-1">Trim Range:</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            value={start.toFixed(1)}
                            onChange={e => setStart(Math.min(+e.target.value, end))}
                            className="w-16 px-2 py-1 rounded bg-gray-700 text-white"
                        />
                        <span className="text-white">→</span>
                        <input
                            type="number"
                            value={end.toFixed(1)}
                            onChange={e => setEnd(Math.max(+e.target.value, start))}
                            className="w-16 px-2 py-1 rounded bg-gray-700 text-white"
                        />
                        <button
                            onClick={trim}
                            className="ml-auto px-3 py-1 bg-green-600 rounded text-white"
                        >✔ Trim</button>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={duration}
                        step={0.1}
                        value={start}
                        onChange={e => setStart(+e.target.value)}
                        className="w-full mt-2"
                    />
                    <input
                        type="range"
                        min={0}
                        max={duration}
                        step={0.1}
                        value={end}
                        onChange={e => setEnd(+e.target.value)}
                        className="w-full mt-1"
                    />
                </div>

                <div>
                    <label className="text-white block mb-1">Caption:</label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            placeholder="Enter caption…"
                            className="flex-1 px-2 py-1 rounded bg-gray-700 text-white"
                        />
                        <button
                            onClick={() => { onSaveCaption(caption); onClose(); }}
                            className="px-3 py-1 bg-blue-600 rounded text-white"
                        >Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
};



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

async function agentsFetcher(url: string) {
    const res = await fetch(url);
    if (res.status === 404) {
        return { items: [], count: 0 };
    }
    if (!res.ok) {
        throw new Error('Failed to fetch agents');
    }
    return res.json();
}

const apiKey = process.env.NEXT_PUBLIC_API_KEY;
const AGENTS_API_URL = 'https://zynapse.zkagi.ai/characters/status';
const TOGGLE_API_URL = 'https://zynapse.zkagi.ai/characters/toggle-status';

// async function fetcher(url: any, apiKey: any, walletAddress: any) {
//     const res = await fetch(`${url}?wallet_address=${walletAddress}`, {
//         headers: {
//             'Content-Type': 'application/json',
//             'api-key': apiKey
//         }
//     });

//     if (res.status === 404) {
//         return [];
//     }

//     if (!res.ok) {
//         throw new Error('Failed to fetch data');
//     }
//     return res.json();
// }

// const apiKey = process.env.NEXT_PUBLIC_API_KEY;
// const AGENTS_API_URL = 'https://zynapse.zkagi.ai/characters/status';
// const TOGGLE_API_URL = 'https://zynapse.zkagi.ai/characters/toggle-status';



const HomeContent: FC<HomeContentProps> = ({ dictionary }) => {
    const params = useParams();
    const lang = params.lang;
    const wallet = useWallet();
    const { connected } = useWallet();
    const rawPubkey = useWallet().publicKey;
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

    const [showAgentOptions, setShowAgentOptions] = useState<string | null>(null);

    const [thoughtsMap, setThoughtsMap] = useState<Record<number, string | null>>({});

    const [showCreateAgentModal, setShowCreateAgentModal] = useState(false);
    const [showBridgePopup, setShowBridgePopup] = useState(false);

    const [convertProgress, setConvertProgress] = useState(0);
    const [showImageSelectModal, setShowImageSelectModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);


    // const [showAgentTypePopup, setShowAgentTypePopup] = useState(false);
    const [selectedAgentType, setSelectedAgentType] = useState<string | null>(null);
    const {
  flowGateOpen, pickerOpen, formOpen,
  setFlowGateOpen, setPickerOpen, setFormOpen
} = useAgentCart();


    const { editMode, setEditMode } = useCharacterEditStore();
    const { messages, addMessage, setMessages } = useConversationStore.getState();
    const { setCharacterJson } = useCharacterStore();

    const router = useRouter();
    const [currentCommand, setCurrentCommand] = useState<'image-gen' | 'create-agent' | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(true);
    const [activeNavbarTicker, setActiveNavbarTicker] = useState<string | null>(null);
    const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);

    const popUpRef = useRef<HTMLDivElement | null>(null);
    const [activeMobileTab, setActiveMobileTab] = useState('zkterminal');

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

    const [showTour, setShowTour] = useState(false)

    // const [tickerInfoMap, setTickerInfoMap] = useState<Map<string, any>>(new Map());
    // const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

    const [showTweetPanel, setShowTweetPanel] = useState(false);
    // const [generatedTweets, setGeneratedTweets] = useState<{ tweet: any }[]>([]);
    const [generatedTweets, setGeneratedTweets] = useState<GeneratedTweet[]>([]);
    const [lastSavedCommand, setLastSavedCommand] = useState<string>('');

    // const { address } = useAccount();
    // const { data: walletClient } = useWalletClient();
    // const publicClient = usePublicClient();

    const { selectedModel, setSelectedModel, credits, apiKey, setCredits } = useModelStore();
    const [isOpen, setIsOpen] = useState(false);

    const [displayMessages, setDisplayMessages] = useState<Message[]>([]); // Array for messages to be displayed
    const [apiMessages, setApiMessages] = useState<Message[]>([]);

    const [currentSeed, setCurrentSeed] = useState<string | null>(null);
    const [tickerOptions, setTickerOptions] = useState<TickerOption[]>([]);
    const [showTickerPicker, setShowTickerPicker] = useState(false);
    const [showTickerPopup, setShowTickerPopup] = useState(false);
    const [tickers, setTickers] = useState<string[]>([]);
    const [showConnectModal, setShowConnectModal] = useState(false);

    const [showVideoEditModal, setShowVideoEditModal] = useState(false);
    const [videoToEdit, setVideoToEdit] = useState<string | null>(null);
    const [videoCaptions, setVideoCaptions] = useState<Record<string, string>>({});

    const [tweets, setTweets] = useState([]);
    const [filteredCoins, setFilteredCoins] = useState([]);

    // const [videoLipsyncOption, setVideoLipsyncOption] = useState<string | null>(null);
    // const [showVideoLipsyncOption, setShowVideoLipsyncOption] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [showImgToVideoPopup, setShowImgToVideoPopup] = useState(false);
    const [wan2Choice, setWan2Choice] = useState<'with' | 'without' | null>(null);

    const [showVideoLengthModal, setShowVideoLengthModal] = useState(false);
    const [videoLength, setVideoLength] = useState('120'); // default or user-chosen

    // For storing the returned WebP URL (with Wan2.0).
    const [generatedWebpUrl, setGeneratedWebpUrl] = useState<string | null>(null);

    // For controlling the conversion to MP4 on download:
    const [ffmpeg, setFfmpeg] = useState<any>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [convertedVideoUrl, setConvertedVideoUrl] = useState<string | null>(null);

    const walletAddress = wallet.publicKey ? wallet.publicKey.toString() : '';
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reportData, setReportData] = useState<FullReportData | PastPredictionData | null>(null);

    // const [activeMobileTab, setActiveMobileTab] = useState<'terminal' | 'prediction'>('terminal');

    // const { showFlowGate, showAgentPicker, showCreateAgentForm, openFromCTA, openAgentPicker, openCreateAgentForm, closeAll } = useZeeUiStore();


    const [privacyProofFile, setPrivacyProofFile] = useState<File | null>(null);
const [privacyProofJson, setPrivacyProofJson] = useState<any | null>(null);
const [showJsonPreview, setShowJsonPreview] = useState(false);
const [privacyKbId, setPrivacyKbId] = useState<string>('default');
const [privacyProofName, setPrivacyProofName] = useState<string>(''); 

const privacyActive = inputMessage.trim().startsWith('/privacy-ai');
const privacyQuery = inputMessage.replace(/^\/privacy-ai\s*/,'').trim();
type GenPrivateFile = { file: File; name: string; preview?: string; isPdf: boolean };
//const [genPrivateFiles, setGenPrivateFiles] = useState<GenPrivateFile[]>([]);
const [privateDocs, setPrivateDocs] = useState<File[]>([]);
const [privateProofBlobUrl, setPrivateProofBlobUrl] = useState<string | null>(null);

const isPrivacy = inputMessage.trim().startsWith('/privacy-ai');
const isGenPrivate = inputMessage.trim().startsWith('/generate-private');

    const generateUUID = (): string => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    //chaingpt integration
    const [chainGptMode, setChainGptMode] = useState(false);
    const [chainGptHistory, setChainGptHistory] = useState(true);
    // const [chainGptUniqueId, setChainGptUniqueId] = useState<string>('');
    const [chainGptUniqueId, setChainGptUniqueId] = useState<string>(() => {
        return generateUUID(); // Generates proper UUID on mount
    });
    const [showChainGptPopup, setShowChainGptPopup] = useState(false);
    const [showPluginsPopup, setShowPluginsPopup] = useState(false);

    // ZEE modal state
const [showFlowGate, setShowFlowGate] = useState(false);
const [showAgentPicker, setShowAgentPicker] = useState(false);
const [showCreateAgentForm, setShowCreateAgentForm] = useState(false);

const closeAll = () => {
  setShowFlowGate(false);
  setShowAgentPicker(false);
  setShowCreateAgentForm(false);
};

const openFlowGate = () => {
  setShowFlowGate(true);
  setShowAgentPicker(false);
  setShowCreateAgentForm(false);
};

const openAgentPicker = () => {
  setShowFlowGate(false);
  setShowAgentPicker(true);
};

const openCreateAgentForm = () => {
  setShowFlowGate(false);
  setShowAgentPicker(false);
  setShowCreateAgentForm(true);
};

  

    const normalizeSentiment = (score: number): 'bearish' | 'neutral' | 'bullish' => {
        if (score <= 1.6) return 'bearish';
        if (score <= 3.3) return 'neutral';
        return 'bullish';
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [displayMessages, isLoading]);

    const {
        isSubscribed,
        checkSubscription,
    } = useSubscriptionStore()

    useEffect(() => {
        if (walletAddress) {
            checkSubscription(walletAddress);
        }
    }, [walletAddress, checkSubscription]);

    // const openReport = async () => {
    //     setShowSubscriptionModal(true);
    // };

    
    const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => setHasHydrated(true), []);


    const openReport = async () => {
        console.log('openReport called on mobile:', isMobile);
        console.log('isSubscribed', isSubscribed);

        if (!isSubscribed) {
            setShowSubscriptionModal(true);
            return;
        }

        const raw = await fetch("/api/today-prediction", {
            method: "GET",
            cache: "no-store",
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
            },
        }).then(r => r.json());

        const today = Array.isArray(raw.todays_news) && raw.todays_news.length > 0
            ? raw.todays_news[0]
            : { crypto_news: [], macro_news: [] };

        const mapCryptoNews = (arr: any[]): CryptoNewsItem[] =>
            arr.map(n => {
                const match = n.analysis.match(/```json\s*([\s\S]*?)```/);
                let parsed: any;
                if (match) {
                    try {
                        parsed = JSON.parse(match[1]);
                    } catch (e) {
                        console.warn('Invalid JSON for', n.news_id, e);
                    }
                }
                parsed = parsed || {
                    sentiment_score: 0,
                    investment: { advice: 'Hold', reason: 'No details available' },
                    rationale: ''
                };
                const symbolMatch = n.title.match(/\b(BTC|ETH|SOL|XRP|ADA)\b/);
                return {
                    news_id: n.news_id,
                    title: n.title,
                    link: n.link,
                    analysis: n.analysis,
                    symbol: symbolMatch?.[1] ?? '—',
                    sentimentScore: parsed.sentiment_score,
                    sentimentTag: normalizeSentiment(parsed.sentiment_score),
                    advice: parsed.investment.advice as 'Buy' | 'Hold' | 'Sell',
                    reason: parsed.investment.reason,
                    rationale: parsed.rationale,
                };
            });

        const mapMacroNews = (arr: any[]): MacroNewsItem[] =>
            arr.map(n => {
                const match = n.analysis.match(/```json\s*([\s\S]*?)```/);
                let parsed: any;
                if (match) {
                    try {
                        parsed = JSON.parse(match[1]);
                    } catch (e) {
                        console.warn('Invalid JSON for', n.news_id, e);
                    }
                }
                parsed = parsed || {
                    sentiment_score: 0,
                    investment: { advice: 'Hold', reason: 'No details available' },
                    rationale: ''
                };
                return {
                    news_id: n.news_id,
                    title: n.title,
                    link: n.link,
                    description: n.description || '',
                    analysis: n.analysis,
                    sentimentScore: parsed.sentiment_score,
                    sentimentTag: normalizeSentiment(parsed.sentiment_score),
                    advice: parsed.investment.advice as 'Buy' | 'Hold' | 'Sell',
                    reason: parsed.investment.reason,
                    rationale: parsed.rationale,
                };
            });

        const mapHourly = (arr: any[] = []): HourlyForecast[] =>
            arr.map(h => ({
                time: h.time,
                signal: h.signal,
                entry_price: h.entry_price,
                stop_loss: h.stop_loss,
                take_profit: h.take_profit,
                forecast_price: h.forecast_price,
                current_price: h.current_price,
                deviation_percent: h.deviation_percent,
                accuracy_percent: h.accuracy_percent,
                risk_reward_ratio: h.risk_reward_ratio,
                sentiment_score: h.sentiment_score,
                confidence_50: h.confidence_50,
                confidence_80: h.confidence_80,
                confidence_90: h.confidence_90,
            }));

                const mapHourlyForAsset = (arr: any[] = []): HourlyForecast[] =>
        arr.map(h => ({
            time: h.time,
            signal: h.signal,
            entry_price: h.entry_price,
            stop_loss: h.stop_loss,
            take_profit: h.take_profit,
            forecast_price: h.forecast_price,
            current_price: h.current_price,
            deviation_percent: h.deviation_percent,
            accuracy_percent: h.accuracy_percent,
            risk_reward_ratio: h.risk_reward_ratio,
            sentiment_score: h.sentiment_score,
            confidence_50: h.confidence_50,
            confidence_80: h.confidence_80,
            confidence_90: h.confidence_90,
        }));


            const forecastTodayHourly = {
        BTC: mapHourlyForAsset(raw.forecast_today_hourly?.BTC || []),
        ETH: mapHourlyForAsset(raw.forecast_today_hourly?.ETH || []),
        SOL: mapHourlyForAsset(raw.forecast_today_hourly?.SOL || [])
    };

        const report: FullReportData = {
            predictionAccuracy: dummyReportData.predictionAccuracy,
            predictionSeries: dummyReportData.predictionSeries,
            priceStats: dummyReportData.priceStats,
            marketSentiment: dummyReportData.marketSentiment,
            avoidTokens: dummyReportData.avoidTokens,
            newsImpact: dummyReportData.newsImpact,
            volatility: dummyReportData.volatility,
            liquidity: dummyReportData.liquidity,
            trendingNews: dummyReportData.trendingNews,
            whatsNew: dummyReportData.whatsNew,
            recommendations: dummyReportData.recommendations,

            todaysNews: {
                crypto: mapCryptoNews(today.crypto_news),
                macro: mapMacroNews(today.macro_news),
            },

            forecastTodayHourly: forecastTodayHourly,
        };

        setReportData(report);
        setIsReportOpen(true);
    };


    // const openReport = async () => {
    //     // const raw = await fetch(process.env.NEXT_PUBLIC_PREDICTION_API!)
    //     //     .then(r => r.json());
    //     console.log('openReport called on mobile:', isMobile);

    //     console.log('isSubscribed', isSubscribed)
    //     if (isSubscribed) {
    //         const raw = await fetch("/api/today-prediction", {
    //             method: "GET",

    //             cache: "no-store",

    //             headers: {
    //                 "Cache-Control": "no-cache, no-store, must-revalidate",
    //                 Pragma: "no-cache",
    //                 Expires: "0",
    //             },
    //         })
    //             .then(r => {
    //                 // if (!r.ok) throw new Error(`HTTP ${r.status}`);
    //                 return r.json();
    //             });

    //         // const today = raw.todays_news[0];
    //         const today = (Array.isArray(raw.todays_news) && raw.todays_news.length > 0)
    //             ? raw.todays_news[0]
    //             : { crypto_news: [], macro_news: [] };

    //         // Create separate mapping functions for crypto and macro news
    //         const mapCryptoNews = (arr: any[]): CryptoNewsItem[] =>
    //             arr.map(n => {
    //                 // 1️⃣ Pull out the JSON between the ```json … ``` fences
    //                 const match = n.analysis.match(/```json\s*([\s\S]*?)```/);
    //                 let parsed: any;

    //                 if (match) {
    //                     try {
    //                         parsed = JSON.parse(match[1]);
    //                     } catch (e) {
    //                         console.warn('Invalid JSON for', n.news_id, e);
    //                     }
    //                 }
    //                 // 2️⃣ Fallback defaults if JSON didn't parse
    //                 parsed = parsed || {
    //                     sentiment_score: 0,
    //                     investment: { advice: 'Hold', reason: 'No details available' },
    //                     rationale: ''
    //                 };

    //                 // 3️⃣ Naïve symbol extraction from title
    //                 const symbolMatch = n.title.match(/\b(BTC|ETH|SOL|XRP|ADA)\b/);

    //                 return {
    //                     news_id: n.news_id,
    //                     title: n.title,
    //                     link: n.link,
    //                     analysis: n.analysis, // Include the original analysis string
    //                     symbol: symbolMatch?.[1] ?? '—',
    //                     sentimentScore: parsed.sentiment_score,
    //                     sentimentTag: normalizeSentiment(parsed.sentiment_score),
    //                     advice: parsed.investment.advice as 'Buy' | 'Hold' | 'Sell',
    //                     reason: parsed.investment.reason,
    //                     rationale: parsed.rationale,
    //                 };
    //             });

    //         const mapMacroNews = (arr: any[]): MacroNewsItem[] =>
    //             arr.map(n => {
    //                 // 1️⃣ Pull out the JSON between the ```json … ``` fences
    //                 const match = n.analysis.match(/```json\s*([\s\S]*?)```/);
    //                 let parsed: any;

    //                 if (match) {
    //                     try {
    //                         parsed = JSON.parse(match[1]);
    //                     } catch (e) {
    //                         console.warn('Invalid JSON for', n.news_id, e);
    //                     }
    //                 }
    //                 // 2️⃣ Fallback defaults if JSON didn't parse
    //                 parsed = parsed || {
    //                     sentiment_score: 0,
    //                     investment: { advice: 'Hold', reason: 'No details available' },
    //                     rationale: ''
    //                 };

    //                 return {
    //                     news_id: n.news_id,
    //                     title: n.title,
    //                     link: n.link,
    //                     description: n.description || '', // Include description for macro news
    //                     analysis: n.analysis, // Include the original analysis string
    //                     sentimentScore: parsed.sentiment_score,
    //                     sentimentTag: normalizeSentiment(parsed.sentiment_score),
    //                     advice: parsed.investment.advice as 'Buy' | 'Hold' | 'Sell',
    //                     reason: parsed.investment.reason,
    //                     rationale: parsed.rationale,
    //                 };
    //             });

    //         const firstFc = raw.forecast_next_3_days[0] || { overall_accuracy_percent: 0 };
    //         const accRaw = firstFc.overall_accuracy_percent;
    //         const accNum = typeof accRaw === 'string' ? parseFloat(accRaw) : accRaw;

    //         const report: FullReportData = {
    //             // --- YOUR EXISTING ReportData FIELDS ---
    //             predictionAccuracy: Number.isNaN(accNum) ? 0 : accNum,
    //             predictionSeries: dummyReportData.predictionSeries,
    //             priceStats: dummyReportData.priceStats,
    //             marketSentiment: dummyReportData.marketSentiment,
    //             avoidTokens: dummyReportData.avoidTokens,
    //             newsImpact: dummyReportData.newsImpact,
    //             volatility: dummyReportData.volatility,
    //             liquidity: dummyReportData.liquidity,
    //             trendingNews: dummyReportData.trendingNews,
    //             whatsNew: dummyReportData.whatsNew,
    //             recommendations: dummyReportData.recommendations,
    //             // --- NEW SECTIONS FROM API ---
    //             todaysNews: {
    //                 crypto: mapCryptoNews(today.crypto_news),
    //                 macro: mapMacroNews(today.macro_news),
    //             },
    //             forecastNext3Days: raw.forecast_next_3_days,
    //             priceHistoryLast7Days: raw.price_history_last_7_days,
    //         };

    //         setReportData(report);
    //         setIsReportOpen(true);
    //     }
    //     else {
    //         // 🚫 not subscribed — kick off the payment flow
    //         setShowSubscriptionModal(true);
    //     }
    // };


    // Load ffmpeg dynamically on the client side
    // useEffect(() => {
    //     (async () => {
    //         try {
    //             const ffmpegModule = await import('@ffmpeg/ffmpeg');
    //             const { createFFmpeg } = ffmpegModule;
    //             const ffmpegInstance = createFFmpeg({ log: true });
    //             await ffmpegInstance.load();
    //             setFfmpeg(ffmpegInstance);
    //         } catch (err) {
    //             console.error('Failed to load ffmpeg:', err);
    //         }
    //     })();
    // }, []);

    useEffect(() => {
        (async () => {
            try {
                const { FFmpeg } = await import('@ffmpeg/ffmpeg');
                const ffmpegInstance = new FFmpeg();
                await ffmpegInstance.load();
                setFfmpeg(ffmpegInstance);
            } catch (err) {
                console.error('Failed to load ffmpeg:', err);
            }
        })();
    }, []);


    function openVideoEditor(url: string) {
        setVideoToEdit(url);
        setShowVideoEditModal(true);
    }

    const TREASURY_WALLET = "8jgNmNZ5ig9jPyYw1acGj8MsGbAFvPR8RqunPdNByoqm"; // Replace with your actual Solana wallet

    //ChainGPT api itnegration function
    const processChainGptMessage = async (message: string): Promise<void> => {
        try {
            // Generate unique ID if not exists (wallet-based)
            if (!chainGptUniqueId && wallet.publicKey) {
                setChainGptUniqueId(`${wallet.publicKey.toString()}-${Date.now()}`);
            }

            // Prepare ChainGPT API payload according to their documentation
            const chainGptPayload = {
                model: "general_assistant",
                question: message,
                chatHistory: chainGptHistory ? "on" : "off",
                sdkUniqueId: chainGptUniqueId || "default-user",
                useCustomContext: true,
                contextInjection: {
                    companyName: "ZkTerminal",
                    companyDescription: "Web3 AI platform for crypto analysis and DeFi insights",
                    aiTone: "PRE_SET_TONE",
                    selectedTone: "FRIENDLY"
                }
            };

            // Call ChainGPT API
            const response = await fetch('https://api.chaingpt.org/chat/stream', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CHAINGPT_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(chainGptPayload)
            });

            if (!response.ok) {
                throw new Error(`ChainGPT API error: ${response.status} ${response.statusText}`);
            }

            // Create temporary message for streaming response
            const tempAssistantMessage: Message = {
                role: 'assistant',
                content: ''
            };

            setDisplayMessages(prev => [...prev, tempAssistantMessage]);

            // Handle ChainGPT response (can be streaming or single response)
            if (response.body) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let accumulatedContent = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);

                    try {
                        // Try to parse as JSON (single response)
                        const parsed = JSON.parse(chunk);
                        if (parsed.status && parsed.data && parsed.data.bot) {
                            accumulatedContent = parsed.data.bot;
                            break;
                        }
                    } catch {
                        // If not JSON, treat as streaming text
                        accumulatedContent += chunk;
                    }

                    // Update the message with accumulated content
                    setDisplayMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1] = {
                            role: 'assistant',
                            content: accumulatedContent || 'ChainGPT is thinking...'
                        };
                        return newMessages;
                    });
                }

                // Final update
                setDisplayMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                        role: 'assistant',
                        content: accumulatedContent || 'No response received from ChainGPT'
                    };
                    return newMessages;
                });

                // Update API messages for context
                setApiMessages(prev => [...prev, {
                    role: 'assistant',
                    content: accumulatedContent
                }]);
            }

        } catch (error) {
            console.error('ChainGPT Error:', error);

            setDisplayMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                    role: 'assistant',
                    content: `🚫 Error connecting to Web3 AI: ${error instanceof Error ? error.message : 'Network error'}. Switching back to regular AI.`,
                    type: 'text'
                };
                return newMessages;
            });

            // Auto-disable ChainGPT mode on error
            setChainGptMode(false);
        }
    };

    const PluginsPopup: React.FC<{
        onClose: () => void;
    }> = ({ onClose }) => {
        const popupRef = useRef<HTMLDivElement>(null);

        // Close popup when clicking outside
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                    onClose();
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, [onClose]);

        return (
            <div
                ref={popupRef}
                className="absolute bottom-full left-0 mb-2 bg-[#171D3D] rounded-lg shadow-lg border border-gray-600 p-4 w-80 z-50"
            >
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">🔌 Plugins</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* Web3 AI Plugin */}
                <div className="space-y-3">
                    <div className="border border-gray-600 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                                <span className="mr-2">🚀</span>
                                <span className="text-white font-medium">Web3 AI Assistant</span>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${chainGptMode ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                        </div>

                        <p className="text-xs text-gray-300 mb-3">
                            Powered by ChainGPT - Specialized in crypto, DeFi, NFTs, and blockchain analysis
                        </p>

                        <div className="space-y-2">
                            {/* Mode Toggle */}
                            <div className="flex items-center justify-between">
                                <span className="text-white text-sm">Status</span>
                                <button
                                    onClick={() => {
                                        setChainGptMode(!chainGptMode);
                                        if (!chainGptMode) {
                                            // Show activation message
                                            const activationMessage: Message = {
                                                role: 'assistant',
                                                content: (
                                                    <div className="flex items-center space-x-2 bg-green-900 border border-green-500 rounded-lg p-3">
                                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                        <span className="text-green-300">
                                                            🚀 Web3 AI Plugin Activated - Now using ChainGPT for Web3 insights
                                                        </span>
                                                    </div>
                                                ),
                                                type: 'text'
                                            };
                                            setDisplayMessages(prev => [...prev, activationMessage]);
                                        }
                                    }}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${chainGptMode
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                        }`}
                                >
                                    {chainGptMode ? 'ON' : 'OFF'}
                                </button>
                            </div>

                            {/* History Toggle */}
                            <div className="flex items-center justify-between">
                                <span className="text-white text-sm">Memory</span>
                                <button
                                    onClick={() => setChainGptHistory(!chainGptHistory)}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${chainGptHistory
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                        }`}
                                    disabled={!chainGptMode}
                                >
                                    {chainGptHistory ? 'ON' : 'OFF'}
                                </button>
                            </div>
                        </div>

                        {/* Specializations */}
                        <div className="mt-3">
                            <div className="text-xs text-gray-400 mb-1">Specializes in:</div>
                            <div className="flex flex-wrap gap-1">
                                {['DeFi', 'Trading', 'NFTs', 'Blockchain', 'Crypto News'].map(tag => (
                                    <span key={tag} className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Future plugins can be added here */}
                    <div className="border border-gray-600 rounded-lg p-3 opacity-50">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                                <span className="mr-2">🎨</span>
                                <span className="text-white font-medium">AI Art Generator</span>
                            </div>
                            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        </div>
                        <p className="text-xs text-gray-400">Coming Soon</p>
                    </div>
                </div>
            </div>
        );
    };


    //chaingpt popupcomponent
    const ChainGptToolsPopup: React.FC<{
        onClose: () => void;
        onToggleMode: () => void;
        isActive: boolean;
        historyEnabled: boolean;
        onToggleHistory: () => void;
    }> = ({ onClose, onToggleMode, isActive, historyEnabled, onToggleHistory }) => {

        const popupRef = useRef<HTMLDivElement>(null);

        // Close popup when clicking outside
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                    onClose();
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, [onClose]);

        return (
            <div
                ref={popupRef}
                className="absolute bottom-full left-0 mb-2 bg-[#171D3D] rounded-lg shadow-lg border border-gray-600 p-4 w-80 z-50"
            >
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold flex items-center">
                        <span className="mr-2">🚀</span>
                        Web3 AI Assistant
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <div className="text-sm text-gray-300 mb-4">
                    Powered by ChainGPT - Specialized in crypto, DeFi, NFTs, and blockchain analysis
                </div>

                <div className="space-y-3">
                    {/* Mode Toggle */}
                    <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                        <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                            <span className="text-white text-sm">Web3 AI Mode</span>
                        </div>
                        <button
                            onClick={onToggleMode}
                            className={`px-3 py-1 rounded text-sm font-medium ${isActive
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                }`}
                        >
                            {isActive ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    {/* History Toggle */}
                    <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                        <span className="text-white text-sm">Conversation Memory</span>
                        <button
                            onClick={onToggleHistory}
                            className={`px-3 py-1 rounded text-sm font-medium ${historyEnabled
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                }`}
                            disabled={!isActive}
                        >
                            {historyEnabled ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    {/* Specializations */}
                    <div className="text-xs text-gray-400">
                        <div className="font-medium mb-1">Specializes in:</div>
                        <div className="flex flex-wrap gap-1">
                            {['DeFi', 'Trading', 'NFTs', 'Blockchain', 'Crypto News'].map(tag => (
                                <span key={tag} className="bg-blue-900 text-blue-300 px-2 py-1 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };



    const [payments, setPayments] = useState<any[]>([]);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

    const handlePrivacyProofChange = async (f: File | null) => {
  if (!f) { setPrivacyProofFile(null); setPrivacyProofJson(null); return; }
  if (f.type !== 'application/json' && !f.name.toLowerCase().endsWith('.json')) {
    toast.error('Only JSON files are allowed for /privacy-ai.');
    return;
  }
  try {
    const text = await f.text();
    const parsed = JSON.parse(text);
    setPrivacyProofFile(f);
    setPrivacyProofJson(parsed);
  } catch {
    toast.error('Invalid JSON file.');
    setPrivacyProofFile(null);
    setPrivacyProofJson(null);
  }
};


    const handleSubscriptionSuccess = (planId: string, orderData: any, usdAmount: number) => {
        console.log('Subscription successful:', { planId, orderData, usdAmount });

        // Here you can:
        // - Update user's subscription status in your database
        // - Show success message
        // - Redirect to dashboard
        // - Update local state

        // Example API call to your backend:
        // await fetch('/api/subscription/activate', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ planId, orderData, usdAmount })
        // });

        // Close modal and show success
        setShowSubscriptionModal(false);
        alert(`Successfully subscribed to ${planId} plan for $${usdAmount}`);
    };

    // Handler for successful single report purchases
    const handleSingleReportSuccess = (orderData: any, usdAmount: number) => {
        console.log('Single report purchase successful:', { orderData, usdAmount });

        // Here you can:
        // - Grant 24-hour access to premium reports
        // - Update user's access status
        // - Show report access UI

        // Example API call:
        // await fetch('/api/reports/grant-access', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ orderData, usdAmount, duration: '24h' })
        // });

        setShowSubscriptionModal(false);
        alert(`Successfully purchased single report access for $${usdAmount}`);
    };

    function handleSaveTrimmed(blob: Blob) {
        const url = URL.createObjectURL(blob);
        // replace the old video in your messages with the trimmed one:
        setDisplayMessages(msgs =>
            msgs.map(m =>
                (typeof m.content === 'string' && m.content === videoToEdit)
                    ? { ...m, content: url }
                    : m
            )
        );
    }
    function handleSaveCaption(caption: string) {
        setVideoCaptions(vc => ({ ...vc, [videoToEdit!]: caption }));
    }

    // Returns the target language code if the browser language is one of the supported ones.
    // function getUserTargetLanguage() {
    //     const lang = navigator.language?.toLowerCase();
    //     if (lang.startsWith('ko')) return 'ko';
    //     if (lang.startsWith('zh')) return 'zh';
    //     if (lang.startsWith('vi')) return 'vi';
    //     if (lang.startsWith('tr')) return 'tr';
    //     if (lang.startsWith('ru')) return 'ru';
    //     return null; // No translation needed (default: English)
    // }

    // useEffect(() => {
    //     const lang = getUserTargetLanguage();
    // }, []);

    // Calls the translation API endpoint to translate text into the target language.
    // async function translateText(text: any, targetLang: any) {
    //     try {
    //         const response = await fetch('/api/translate', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ text, targetLang }),
    //         });
    //         if (response.ok) {
    //             const data = await response.json();
    //             return data.translation; // Expected to return the translated text.
    //         } else {
    //             console.error('Translation API returned an error.');
    //             return text; // Fallback: return original text.
    //         }
    //     } catch (error) {
    //         console.error('Translation error:', error);
    //         return text;
    //     }
    // }


    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                popUpRef.current &&
                !popUpRef.current.contains(event.target as Node)
            ) {
                // If we click outside the popup, close it
                setShowAgentOptions(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleEditAgent = (ticker: string) => {
        // Example: push to dynamic route: /agents/edit/[ticker]
        // You can change this to whichever path you prefer.
        router.push(`/agents/edit/${ticker}`);
    };


    // const { data: tickersData } = useSWR(
    //     walletAddress ? [AGENTS_API_URL, apiKey, walletAddress] : null,
    //     ([url, key, addr]) => fetcher(url, key, addr),
    //     {
    //         refreshInterval: 15000,
    //     }
    // );
    const { data: agentsData } = useSWR(
    walletAddress ? `/api/agents?walletAddress=${walletAddress}` : null,
    agentsFetcher,
    {
        refreshInterval: 15000,
    }
);

    let content;

    useEffect(() => {
        if (!wallet.connected) {
            setShowConnectModal(true);
            // setShowTour(true)    
        } else {
            setShowConnectModal(false);
        }
    }, [wallet.connected]);

    // if (!agentsData) {
    //     content = <div>Loading...</div>;
    // } else {
    //     content = (
    //         <div>
    //             {agentsData.map((item: any, index: number) => (
    //                 <div
    //                     key={index}
    //                     className="cursor-pointer hover:bg-gray-700 p-2 rounded flex items-center space-x-2"
    //                     onClick={() => toggleTickerStatus(item.ticker, item.status)}
    //                 >
    //                     <span
    //                         className={`inline-block w-3 h-3 rounded-full ${item.status ? 'bg-green-500' : 'bg-red-500'
    //                             }`}
    //                     ></span>
    //                     <span>{item.ticker}</span>
    //                 </div>
    //             ))}
    //         </div>
    //     );
    // }

    let mergedTickers: any[] = [];

    // if (walletAddress) {
    //     mergedTickers = tickers.map((ticker) => {
    //         const tickerData = (agentsData || []).find((item: any) => item.ticker === ticker);
    //         return {
    //             ticker,
    //             status: tickerData?.status,
    //         };
    //     });
    // }

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

  const startCreateAgentFlow = () => {
  setFlowGateOpen(true);
  setPickerOpen(false);
  setFormOpen(false);
};

    const handleCommandBoxClick = (command: string) => {

if (command === '/create-agent') {
    startCreateAgentFlow();  
    return;
  }
  
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
                    setTickers(data.tickers);
                    setAvailableTickers(data.tickers);

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


    const availableUGCOptions = [
        { name: 'LandWolf', apiUrl: process.env.NEXT_PUBLIC_LANDWOLF! },
        { name: 'Ponke', apiUrl: process.env.NEXT_PUBLIC_LANDWOLF! },
    ];

    const handleMemeImageGeneration = async (imageData: string, prompt: string) => {
        try {
            // Format the image into a data URL if it isn't already.
            let formattedImage = imageData;
            // if (!imageData.startsWith('data:image/')) {
            //     formattedImage = `data:image/png;base64,${imageData}`;
            // }
            // Compress the image as needed.
            const compressedImage = await compressImage(formattedImage);

            // Send the image and prompt to your /api/chat endpoint.
            const imageUploadResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedModel: "Mistral",
                    credits,
                    apiKey,
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

          if (value.trim().startsWith('/create-agent')) {
   startCreateAgentFlow
  }

        // if (value.startsWith('/video-lipsync ') && !videoLipsyncOption) {
        //     setShowVideoLipsyncOption(true);
        // } else {
        //     // Optionally, hide the popup if the command is removed.
        //     setShowVideoLipsyncOption(false);
        // }

        // if (value.startsWith('/img-to-video ') && !wan2Choice) {
        //     setShowImgToVideoPopup(true);
        // } else {
        //     setShowImgToVideoPopup(false);
        // }

        // Show AgentTypePopup if "/create-agent" is detected
        // if (value === '/create-agent') {
        //     // setShowAgentTypePopup(true);
        //     setShowCommandPopup(false);
        //     setShowTickerPopup(false);
        //     return;
        // }
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

    // const handleUGCSelection = (option: { name: string; apiUrl: string }) => {
    //     // Update the input with the selected option
    //     setInputMessage((prev) => {
    //         const trimmedPrev = prev.trim();
    //         return trimmedPrev.endsWith('/ugc') ? `${trimmedPrev} ${option.name} ` : `${trimmedPrev} ${option.name}`;
    //     });

    //     inputRef.current?.focus(); // Refocus on the input field
    // };


const handleCommandSelect = (command: Command) => {
  if (command === 'video-gen') {
    setInputMessage('/video-gen ');
    setShowCommandPopup(false);
  } else if (command === 'privacy-ai') {
    setInputMessage('/privacy-ai ');
    setShowCommandPopup(false);
  } else {
    setInputMessage(`/${command} `);
    setShowCommandPopup(false);
  }
  inputRef.current?.focus();
};


   // const handleCommandSelect = (command: Command) => {

        // if (command === 'video-lipsync') {
        //     // Set the input field and trigger the popup regardless of how the command was set.
        //     setInputMessage('/video-lipsync ');
        //     setShowCommandPopup(false);
        //     setShowVideoLipsyncOption(true);
        // } else if (command === 'img-to-video') {
        //     // Set the input field and trigger the popup regardless of how the command was set.
        //     setInputMessage('/img-to-video ');
        //     setShowCommandPopup(false);
        //     setShowImgToVideoPopup(true);
        // }
        // else if (command === 'UGC') {
        //     setInputMessage(`/ugc `); // Add `/ugc` to the input field
        //     const displayMessage: Message = {
        //         role: 'assistant',
        //         content: (
        //             <div className="flex flex-col">
        //                 {availableUGCOptions.map((option) => (
        //                     <button
        //                         key={option.name}
        //                         className="p-2 bg-blue-500 text-white rounded-lg mb-2"
        //                         onClick={() => handleUGCSelection(option)}
        //                     >
        //                         {option.name}
        //                     </button>
        //                 ))}
        //             </div>
        //         ),
        //     };
        //     setDisplayMessages((prev) => [...prev, displayMessage]);
        //     setShowCommandPopup(false);
        // }
        // else if (command === 'bridge') {
        //     // When the "bridge" command is selected, show the popup
        //     setShowBridgePopup(true);
        //     setInputMessage('');
        //     return;
        // }
        // else if (command === 'select') {
        //     setInputMessage(`/${command} `);
        //     const displayMessage: Message = {
        //         role: 'assistant',
        //         content: <TickerSelector /> as ReactNode,
        //     };
        //     setDisplayMessages((prev) => [...prev, displayMessage]);
        //     setShowCommandPopup(false);
        // }
        // if (command === 'video-gen') {
        //     setInputMessage('/video-gen ');
        //     setShowCommandPopup(false);
        // }
        // else {
        //     setInputMessage(`/${command} `);
        //     setShowCommandPopup(false);
        // }
        // if (command === 'create-agent') {
        //     setShowAgentTypePopup(true);
        // } else {
        //     setShowAgentTypePopup(false);
        // }
      //  inputRef.current?.focus(); // Focus back on the input field
  //  };


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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files) return;

  const selectedFiles = Array.from(e.target.files);
  const isPrivacyAi = inputMessage.trim().startsWith('/privacy-ai');
  const isGeneratePrivate = inputMessage.trim().startsWith('/generate-private');

  // /privacy-ai : only a single JSON file, parsed into memory, no chips in media tray
  if (isPrivacyAi) {
    const jsonFile = selectedFiles[0];
    if (!jsonFile || jsonFile.type !== 'application/json') {
      toast.error('Please upload a valid .json zkProof file.');
      return;
    }
    try {
      const text = await jsonFile.text();
      const parsed = JSON.parse(text);
      setPrivacyProofJson(parsed);
      setPrivacyProofName(jsonFile.name);
    } catch {
      toast.error('Invalid JSON file.');
      setPrivacyProofJson(null);
      setPrivacyProofName('');
    }
    return; // do not add to media tray
  }

  // /generate-private : accept Doc/PDF/TXT; store in privateDocs only
  if (isGeneratePrivate) {
    const allowed = selectedFiles.filter(f =>
      ['application/pdf', 'text/plain', 'application/msword',
       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ].includes(f.type)
      || /\.(pdf|txt|doc|docx)$/i.test(f.name)
    );

    if (allowed.length === 0) {
      toast.error('Please upload PDF, DOC, DOCX, or TXT files.');
      return;
    }
    setPrivateDocs(prev => [...prev, ...allowed]);
    return; // do not add to media tray
  }

  // Default (your original logic)
  const newFilesOrNull: (FileObject | null)[] = await Promise.all(
    selectedFiles.map(async (file) => {
      if (file.type === 'application/pdf') {
        return { file, preview: URL.createObjectURL(file), isPdf: true, isVideoOrAudio: false };
      } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        return { file, preview: URL.createObjectURL(file), isPdf: false, isVideoOrAudio: true };
      } else if (file.type.startsWith('image/')) {
        return { file, preview: await fileToBase64(file), isPdf: false, isVideoOrAudio: false };
      }
      return null;
    })
  );

  const validFiles = newFilesOrNull.filter((f): f is FileObject => f !== null);
  setFiles(prev => [...prev, ...validFiles]);
};

// const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//   const fileList = e.target.files;
//   if (!fileList || fileList.length === 0) return;

//   // ── PRIVACY-AI MODE: only JSON, parse & store, don't push into files[] ──
//   if (privacyActive) {
//     const file = fileList[0];

//     const isJson =
//       file.type === 'application/json' ||
//       file.name.toLowerCase().endsWith('.json');

//     if (!isJson) {
//       toast.error('Please upload a .json proof file.');
//       e.target.value = ''; // reset the input
//       return;
//     }

//     try {
//       const text = await file.text();
//       const parsed = JSON.parse(text);
//       setPrivacyProofJson(parsed);
//       setPrivacyProofName(file.name);
//       toast.success('Proof JSON loaded.');
//     } catch (err) {
//       console.error('Invalid JSON:', err);
//       toast.error('Invalid JSON file.');
//       setPrivacyProofJson(null);
//       setPrivacyProofName('');
//     }

//     // Important: do not add to your media files list
//     e.target.value = ''; // allow re-uploading same file later
//     return;
//   }

//   // ── NORMAL MODE: your existing media handling ──
//   const selectedFiles = Array.from(fileList);

//   const newFilesOrNull: (FileObject | null)[] = await Promise.all(
//     selectedFiles.map(async (file) => {
//       if (file.type === 'application/pdf') {
//         return {
//           file,
//           preview: URL.createObjectURL(file),
//           isPdf: true,
//           isVideoOrAudio: false,
//         };
//       } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
//         return {
//           file,
//           preview: URL.createObjectURL(file),
//           isPdf: false,
//           isVideoOrAudio: true,
//         };
//       } else if (file.type.startsWith('image/')) {
//         return {
//           file,
//           preview: await fileToBase64(file),
//           isPdf: false,
//           isVideoOrAudio: false,
//         };
//       } else {
//         // Unsupported type (silently ignore or toast)
//         return null;
//       }
//     })
//   );

//   const validFiles = newFilesOrNull.filter(
//     (f): f is FileObject => f !== null
//   );

//   setFiles((prev) => [...prev, ...validFiles]);
//   e.target.value = ''; // allow selecting the same file again next time
// };


    // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (e.target.files) {
    //         const selectedFiles = Array.from(e.target.files);

    //         // if (files.length > 0 || selectedFiles.length > 1) {
    //         //     toast.error('Only one image can be uploaded at a time.');
    //         //     return;
    //         // }

    //         const newFilesOrNull: (FileObject | null)[] = await Promise.all(
    //             selectedFiles.map(async (file) => {
    //                 if (file.type === 'application/pdf') {
    //                     // Handle PDFs
    //                     return {
    //                         file,
    //                         preview: URL.createObjectURL(file),
    //                         isPdf: true,
    //                         isVideoOrAudio: false, // Explicitly false
    //                     };
    //                 } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
    //                     // Handle video and audio files
    //                     return {
    //                         file,
    //                         preview: URL.createObjectURL(file),
    //                         isPdf: false, // Explicitly false
    //                         isVideoOrAudio: true,
    //                     };
    //                 } else if (file.type.startsWith('image/')) {
    //                     // Handle images
    //                     return {
    //                         file,
    //                         preview: await fileToBase64(file),
    //                         isPdf: false, // Explicitly false
    //                         isVideoOrAudio: false, // Explicitly false
    //                     };
    //                 } else {
    //                     // Unsupported file types
    //                     return null;
    //                 }
    //             })
    //         );

    //         // Filter out null values
    //         const validFiles = newFilesOrNull.filter((file): file is FileObject => file !== null);

    //         // Update state with valid files
    //         setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    //     }
    // };


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
                resolve(mediaElement.duration <= 50);
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

    const compressImageFile = (
        file: File,
        quality = 0.7,
        maxWidth = 800,
        maxHeight = 800
    ): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            // Use window.Image to avoid conflict with Next.js's Image component.
            const img = new window.Image();
            const reader = new FileReader();

            reader.onload = (event) => {
                if (event.target && event.target.result) {
                    img.src = event.target.result as string;
                } else {
                    reject(new Error("Failed to load the file."));
                }
            };

            reader.onerror = (error) => reject(error);

            img.onload = () => {
                let { width, height } = img;
                // Calculate new dimensions while maintaining aspect ratio.
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    return reject(new Error("Canvas not supported."));
                }
                ctx.drawImage(img, 0, 0, width, height);
                // Convert canvas back to Blob with specified quality.
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Image compression failed."));
                        }
                    },
                    file.type,
                    quality
                );
            };

            reader.readAsDataURL(file);
        });
    };

    const compressAudioFile = async (
        file: File,
        maxSizeInBytes: number = 3.2 * 1024 * 1024 // 3 MB
    ): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            console.log(`Original audio file size: ${file.size} bytes`);

            // If file is already under 3 MB, return as-is
            if (file.size <= maxSizeInBytes) {
                console.log('Audio file is already under 3 MB. No compression needed.');
                return resolve(file);
            }

            // Create an audio context for processing
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    // Decode audio data
                    const arrayBuffer = e.target?.result as ArrayBuffer;
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                    console.log('Audio decoding completed');
                    console.log(`Original audio duration: ${audioBuffer.duration} seconds`);

                    // Settings for WAV encoding
                    const bitDepth = 16; // bits per sample
                    const channels = audioBuffer.numberOfChannels;
                    const duration = audioBuffer.duration;

                    // Calculate target sample rate to achieve the desired file size:
                    // targetSampleRate = (maxSizeInBytes * 8) / (duration * channels * bitDepth)
                    let targetSampleRate = Math.floor((maxSizeInBytes * 8) / (duration * channels * bitDepth));
                    console.log(`Calculated target sample rate: ${targetSampleRate} Hz`);

                    // Ensure the sample rate is not higher than the original and not below a reasonable minimum (e.g., 8000 Hz)
                    const newSampleRate = Math.max(8000, Math.min(audioBuffer.sampleRate, targetSampleRate));
                    console.log(`Using new sample rate: ${newSampleRate} Hz`);

                    // Create an OfflineAudioContext with the new sample rate
                    const offlineCtx = new OfflineAudioContext(
                        channels,
                        Math.ceil(duration * newSampleRate),
                        newSampleRate
                    );

                    const source = offlineCtx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(offlineCtx.destination);
                    source.start();

                    // Render the audio at the new sample rate
                    const renderedBuffer = await offlineCtx.startRendering();

                    // Convert the rendered buffer to WAV using a helper function
                    const wavBlob = bufferToWave(renderedBuffer, renderedBuffer.length);

                    console.log(`Compressed audio file size: ${wavBlob.size} bytes`);

                    if (wavBlob.size >= maxSizeInBytes) {
                        console.warn('Compression did not reduce file size sufficiently');
                        reject(new Error('Could not compress audio to required size'));
                        toast.error('Kindly upload a different audio file, we were unable to compress your file to the desired 4MB limit.')
                    } else {
                        resolve(wavBlob);
                    }
                } catch (error) {
                    console.error('Audio compression error:', error);
                    reject(error);
                }
            };

            reader.onerror = (error) => {
                console.error('File reading error:', error);
                reject(error);
            };

            reader.readAsArrayBuffer(file);
        });
    };



    // Utility function to convert AudioBuffer to WAV Blob
    function bufferToWave(abuffer: AudioBuffer, len: number): Blob {
        const numOfChan = abuffer.numberOfChannels;
        const length = len * numOfChan * 2 + 44;
        const buffer = new ArrayBuffer(length);
        const view = new DataView(buffer);
        const channels = [];
        let sample: number;
        let offset = 0;
        let pos = 0;

        // Write WAV header
        setUint32(0x46464952);                         // "RIFF"
        setUint32(length - 8);                         // file length - 8
        setUint32(0x45564157);                         // "WAVE"

        setUint32(0x20746d66);                         // "fmt " chunk
        setUint32(16);                                 // length = 16
        setUint16(1);                                  // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(abuffer.sampleRate);
        setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        setUint16(numOfChan * 2);                      // block-align
        setUint16(16);                                 // 16-bit (hardcoded)

        setUint32(0x61746164);                         // "data" - chunk
        setUint32(length - pos - 4);                   // chunk length

        // Write interleaved data
        for (let i = 0; i < abuffer.numberOfChannels; i++)
            channels.push(abuffer.getChannelData(i));

        while (pos < length) {
            for (let i = 0; i < numOfChan; i++) {
                sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
                view.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }

        // Create the Blob
        return new Blob([buffer], { type: "audio/wav" });

        // Utility sub-function to write big-endian values
        function setUint16(data: number) {
            view.setUint16(pos, data, true);
            pos += 2;
        }

        function setUint32(data: number) {
            view.setUint32(pos, data, true);
            pos += 4;
        }
    }


    const processVideoGen = async (prompt: string) => {
        try {
            const response = await fetch('/api/video-gen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "x-api-key": apiKey,
                    "x-current-credits": credits.toString(),
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Video-gen API failed');
            }

            // Check content type BEFORE trying to parse as JSON
            const contentType = response.headers.get('content-type');

            if (contentType?.includes('video/mp4')) {
                // Handle MP4 binary response
                const videoBlob = await response.blob();
                const videoUrl = URL.createObjectURL(videoBlob);

                const assistantMessage: Message = {
                    role: 'assistant',
                    content: (
                        <div>
                            <video
                                src={videoUrl}
                                controls
                                className="w-full h-auto rounded-md mb-2"
                            />
                            <a>
                                Download Video
                            </a>
                        </div>
                    ),
                    type: 'text',
                };
                setDisplayMessages((prev) => [...prev, assistantMessage]);
            }
        } catch (err: any) {
            console.error('processVideoGen error:', err);
            const errorMessage: Message = {
                role: 'assistant',
                content: `Error generating video: ${err.message}`,
                type: 'text',
            };
            setDisplayMessages((prev) => [...prev, errorMessage]);
        }
    };

    // const processVideoGen = async (prompt: string) => {
    //     try {
    //         // 1. Send { prompt } to our newly created /api/video-gen route
    //         const response = await fetch('/api/video-gen', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json', "x-api-key": apiKey,
    //                 "x-current-credits": credits.toString(),
    //             },
    //             body: JSON.stringify({ prompt }),
    //         });

    //         if (!response.ok) {
    //             const errorText = await response.text();
    //             throw new Error(errorText || 'Video-gen API failed');
    //         }

    //         // 2. We assume the external returned JSON like { video_url: string }
    //         const data = await response.json();

    //         // 3. If data.video_url is present, show a <video> and download link:
    //         if (data.video_url) {
    //             const videoUrl = data.video_url as string;

    //             const assistantMessage: Message = {
    //                 role: 'assistant',
    //                 content: (
    //                     <div>
    //                         <video
    //                             src={videoUrl}
    //                             controls
    //                             crossOrigin="anonymous"
    //                             className="w-full h-auto rounded-md mb-2"
    //                         />
    //                         <a
    //                             href={videoUrl}
    //                             download="generated-video.mp4"
    //                             className="text-blue-500 underline"
    //                         >
    //                             Download Video
    //                         </a>
    //                     </div>
    //                 ),
    //                 type: 'text',
    //             };
    //             setDisplayMessages((prev) => [...prev, assistantMessage]);
    //         } else {
    //             // If the external returned something else (e.g. a base64 blob), adjust accordingly:
    //             const assistantMessage: Message = {
    //                 role: 'assistant',
    //                 content: 'Unexpected response from video-gen API.',
    //                 type: 'text',
    //             };
    //             setDisplayMessages((prev) => [...prev, assistantMessage]);
    //         }
    //     } catch (err: any) {
    //         console.error('processVideoGen error:', err);
    //         const errorMessage: Message = {
    //             role: 'assistant',
    //             content: `Error generating video: ${err.message}`,
    //             type: 'text',
    //         };
    //         setDisplayMessages((prev) => [...prev, errorMessage]);
    //     }
    // };


    // const processVideoLipsync = async () => {
    //     // Look for an image file (jpg/jpeg/png) and an audio file in your uploaded files.
    //     const imageFile = files.find((file) => file.file.type.startsWith('image/'));
    //     const audioFile = files.find((file) => file.file.type.startsWith('audio/'));

    //     if (!imageFile || !audioFile) {
    //         toast.error("Please upload one image file and one audio file.");
    //         return;
    //     }

    //     // Validate the audio file's duration.
    //     const isAudioValid = await validateMediaDuration(audioFile.file);
    //     if (!isAudioValid) {
    //         toast.error("Audio file must be 15 seconds or shorter.");
    //         return;
    //     }

    //     try {
    //         // Compress the image file before uploading
    //         const compressedImageBlob = await compressImageFile(imageFile.file);

    //         const compressedAudioBlob = await compressAudioFile(audioFile.file);
    //         console.log('compressedAudioBlob', compressedAudioBlob)

    //         // Optionally, if you need to compress audio, integrate a similar approach or use ffmpeg.js

    //         const formData = new FormData();
    //         // Use the compressed image blob rather than the original file
    //         formData.append('reference_image', compressedImageBlob, imageFile.file.name);
    //         // formData.append('input_audio', audioFile.file);
    //         formData.append('input_audio', compressedAudioBlob, audioFile.file.name);
    //         formData.append('animation_mode', videoLipsyncOption!.toLowerCase());

    //         // Append extra parameters as required.
    //         formData.append('driving_multiplier', '1.0'); // or your dynamic value
    //         formData.append('scale', '2.3'); // or your dynamic value
    //         formData.append('flag_relative_motion', 'false');

    //         // Use the Next.js API route rather than directly calling the external URL.
    //         const apiUrlSync = '/api/video-lipsync';

    //         const response = await fetch(apiUrlSync, {
    //             method: 'POST',
    //             headers: {
    //                 'x-api-key': apiKey,           // Send from Zustand
    //                 'x-current-credits': credits.toString(), // Send from Zustand
    //                 'Content-Type': 'application/json',
    //             },
    //             body: formData,
    //         });

    //         console.log('response', response);

    //         if (!response.ok) {
    //             const errorText = await response.text();
    //             throw new Error(errorText);
    //         }

    //         // Create a URL from the returned video blob.
    //         const blob = await response.blob();
    //         const videoUrl = URL.createObjectURL(blob);

    //         const successMessage: Message = {
    //             role: 'assistant',
    //             content: (
    //                 <div>
    //                     <video src={videoUrl} controls className="w-full h-auto rounded-md" />
    //                     {/* <button
    //                         className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
    //                         onClick={() => openVideoEditor(videoUrl)}
    //                     >
    //                         <div className="text-white bg-black bg-opacity-50 p-1 rounded" >Edit video</div>
    //                     </button> */}
    //                     <a href={videoUrl} download="merged-video.mp4" className="text-blue-500 underline">
    //                         Download Merged Video
    //                     </a>
    //                 </div>
    //             ),
    //             type: 'text',
    //         };
    //         setDisplayMessages((prev) => [...prev, successMessage]);
    //     } catch (error: any) {
    //         const errorMessage: Message = {
    //             role: 'assistant',
    //             content: `Error processing your video and audio. Please try again. Error: ${error.message}`,
    //             type: 'text',
    //         };
    //         setDisplayMessages((prev) => [...prev, errorMessage]);
    //     }

    //     // Clear the uploaded files and reset the input.
    //     setFiles([]);
    //     setInputMessage('');
    //     if (inputRef.current) {
    //         inputRef.current.style.height = '2.5rem';
    //     }
    //     // Reset the option for future submissions.
    //     setVideoLipsyncOption(null);
    //     setShowVideoLipsyncOption(false);
    // };



    // const processVideoLipsync = async () => {
    //     // Look for an image file (jpg/jpeg/png) and an audio file in your uploaded files.
    //     const imageFile = files.find((file) => file.file.type.startsWith('image/'));
    //     const audioFile = files.find((file) => file.file.type.startsWith('audio/'));

    //     if (!imageFile || !audioFile) {
    //         toast.error("Please upload one image file and one audio file.");
    //         return;
    //     }

    //     // Validate the audio file's duration.
    //     const isAudioValid = await validateMediaDuration(audioFile.file);
    //     if (!isAudioValid) {
    //         toast.error("Audio file must be 15 seconds or shorter.");
    //         return;
    //     }

    //     const formData = new FormData();
    //     formData.append('reference_image', imageFile.file);
    //     formData.append('input_audio', audioFile.file);
    //     formData.append('animation_mode', videoLipsyncOption!.toLowerCase());

    //     // Append extra parameters as required.
    //     formData.append('driving_multiplier', '1.0'); // or your dynamic value
    //     formData.append('scale', '2.3'); // or your dynamic value
    //     formData.append('flag_relative_motion', 'false');

    //     // Use the Next.js API route rather than directly calling the external URL.
    //     const apiUrlSync = '/api/video-lipsync';

    //     try {
    //         const response = await fetch(apiUrlSync, {
    //             method: 'POST',
    //             body: formData,
    //         });

    //         console.log('response', response);

    //         if (!response.ok) {
    //             const errorText = await response.text();
    //             throw new Error(errorText);
    //         }

    //         // Create a URL from the returned video blob.
    //         const blob = await response.blob();
    //         const videoUrl = URL.createObjectURL(blob);

    //         const successMessage: Message = {
    //             role: 'assistant',
    //             content: (
    //                 <div>
    //                     <video src={videoUrl} controls className="w-full h-auto rounded-md" />
    //                     <a href={videoUrl} download="merged-video.mp4" className="text-blue-500 underline">
    //                         Download Merged Video
    //                     </a>
    //                 </div>
    //             ),
    //             type: 'text',
    //         };
    //         setDisplayMessages((prev) => [...prev, successMessage]);
    //     } catch (error: any) {
    //         const errorMessage: Message = {
    //             role: 'assistant',
    //             content: `Error processing your video and audio. Please try again. Error: ${error.message}`,
    //             type: 'text',
    //         };
    //         setDisplayMessages((prev) => [...prev, errorMessage]);
    //     }

    //     // Clear the uploaded files and reset the input.
    //     setFiles([]);
    //     setInputMessage('');
    //     if (inputRef.current) {
    //         inputRef.current.style.height = '2.5rem';
    //     }
    //     // Reset the option for future submissions.
    //     setVideoLipsyncOption(null);
    //     setShowVideoLipsyncOption(false);
    // };



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

        if (!wallet.connected || !inputMessage.trim()) {
            return;
        }

        // if (inputMessage.trim() === '/bridge') {
        //     setShowBridgePopup(true);
        //     setInputMessage(''); // Clear the input field
        //     return; // Exit early to disable further processing
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

        if (chainGptMode && !fullMessage.startsWith('/')) {
            // Add user message
            const userMessage: Message = {
                role: 'user',
                content: fullMessage
            };
            setDisplayMessages(prev => [...prev, userMessage]);
            setApiMessages(prev => [...prev, userMessage]);

            setInputMessage('');
            if (inputRef.current) {
                inputRef.current.style.height = '2.5rem';
            }
            setIsLoading(true);

            // Process with ChainGPT
            await processChainGptMessage(fullMessage);
            setIsLoading(false);
            return;
        }

        if (fullMessage.startsWith('/create-agent')) {
  useZeeUiStore.getState().openFromCTA();   // open FlowGate
  setInputMessage('');
  if (inputRef.current) inputRef.current.style.height = '2.5rem';
  return;
}

// Complete /generate-private command handler

if (inputMessage.trim().startsWith('/generate-private')) {
  e.preventDefault();

  // 1️⃣ Validations
  if (privateDocs.length === 0) {
    toast.error('Please upload at least one PDF/DOC/TXT.');
    return;
  }

  if (!publicKey) {
    toast.error('Please connect your wallet first.');
    return;
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const oversized = privateDocs.filter(f => f.size > MAX_FILE_SIZE);
  if (oversized.length > 0) {
    toast.error(`Some files exceed 10MB limit: ${oversized.map(f => f.name).join(', ')}`);
    return;
  }

  // 2️⃣ Add user message
  const userMessage: Message = {
    role: 'user',
    content: (
      <div className="space-y-2">
        <div className="text-white">Generate private proof from documents</div>
        <div className="text-sm text-gray-400">
          Files: {privateDocs.map(f => f.name).join(', ')}
        </div>
      </div>
    ) as any,
    type: 'text',
  };
  setDisplayMessages(prev => [...prev, userMessage]);

  // 3️⃣ Clear input & show loading
  setInputMessage('');
  if (inputRef.current) inputRef.current.style.height = '2.5rem';
  setIsLoading(true);

  try {
    // 4️⃣ Create KB with correct payload
    const kbSuffix = Math.floor(10000000 + Math.random() * 90000000).toString();
    const walletAddr = publicKey.toString();
    
    console.log('📝 Creating KB...');
    const createRes = await fetch('/api/kb/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: walletAddr,
        kb_name: kbSuffix,
        is_public: true
      }),
    });
    
    if (!createRes.ok) {
      const errorText = await createRes.text();
      throw new Error(`Failed to create KB: ${errorText}`);
    }
    const { kb_id } = await createRes.json();
    console.log('✅ KB created:', kb_id);

    // 5️⃣ Upload files with user_id
    const form = new FormData();
    form.append('user_id', walletAddr);
    form.append('kb_id', kb_id);
    
    privateDocs.forEach(f => {
      form.append('files', f, f.name);
      console.log('📎 Adding file:', f.name, `(${(f.size / 1024).toFixed(1)} KB)`);
    });

    console.log('📤 Uploading files...');
    const upRes = await fetch('/api/kb/upload/private', { 
      method: 'POST', 
      body: form 
    });
    
    if (!upRes.ok) {
      const errorText = await upRes.text();
      console.error('❌ Upload failed:', errorText);
      throw new Error(`Failed to upload: ${errorText}`);
    }
    const uploadResult = await upRes.json();
    console.log('✅ Upload successful:', uploadResult);

    // Extract asset_id from upload response
    if (!uploadResult.created_assets || uploadResult.created_assets.length === 0) {
      throw new Error('No assets were created during upload');
    }
    const asset_id = uploadResult.created_assets[0];
    console.log('📦 Asset ID:', asset_id);

    // 6️⃣ Generate proofs with BOTH kb_id AND asset_id
    console.log('🔐 Generating proofs...');
    const genRes = await fetch('/api/kb/proofs/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        kb_id: kb_id,
        asset_id: asset_id
      }),
    });
    
    if (!genRes.ok) {
      const errorText = await genRes.text();
      throw new Error(`Proof generation failed: ${errorText}`);
    }

    // Get JSON response with download_url
    const proofResponse = await genRes.json();
    console.log('✅ Proof generated:', proofResponse);

    if (!proofResponse.download_url) {
      throw new Error('No download URL in response');
    }

    const downloadUrl = proofResponse.download_url;
    console.log('📥 Download URL:', downloadUrl);

    // 7️⃣ Download the actual proof file from download_url
    const downloadRes = await fetch(
  `/api/kb/proofs/download?kb_id=${encodeURIComponent(kb_id)}&asset_id=${encodeURIComponent(asset_id)}`
);
    if (!downloadRes.ok) {
      throw new Error('Failed to download proof file');
    }

    const proofBlob = await downloadRes.blob();
    const blobUrl = URL.createObjectURL(proofBlob);
    setPrivateProofBlobUrl(blobUrl);
    console.log('✅ Proof file downloaded successfully');

    // 8️⃣ Auto download
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `proof_${asset_id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    // 9️⃣ Show success message
    setDisplayMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: (
          <div className="space-y-3">
            <div className="text-green-400">
              ✅ Proof generated successfully!
            </div>
            <div className="text-sm text-gray-400">
              Processed {privateDocs.length} document{privateDocs.length !== 1 ? 's' : ''}. The proof file has been downloaded automatically.
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
              onClick={() => {
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `proof_${asset_id}.json`;
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
            >
              📥 Download Proof Again
            </button>
          </div>
        ),
      } as Message,
    ]);

    toast.success(`Proof generated for ${privateDocs.length} document(s)!`);

  } catch (err: any) {
    console.error('❌ Error:', err);
    toast.error(err.message || 'Something went wrong');
    
    // Show simple error message
    setDisplayMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: (
          <div className="text-red-400">
            ❌ Failed to generate proof: {err.message || 'Unknown error'}
          </div>
        ),
        type: 'text',
      } as Message,
    ]);
  } finally {
    setIsLoading(false);
    setPrivateDocs([]);
  }
  return;
}


        // if (fullMessage.startsWith('/generate-voice-clone')) {
        //     // Find an audio file among the uploaded files.
        //     const audioFile = files.find((file) => file.file.type.startsWith('audio/'));
        //     if (!audioFile) {
        //         toast.error("Please upload an audio file for voice cloning.");
        //         return;
        //     }
        //     // Extract the text after removing the command prefix.
        //     const genText = fullMessage.replace('/generate-voice-clone', '').trim();
        //     if (!genText) {
        //         toast.error("Please provide text for voice cloning after the command.");
        //         return;
        //     }

        //     // Display the user message with command text and a music icon.
        //     const userDisplayMessage: Message = {
        //         role: 'user',
        //         content: (
        //             <div className="flex flex-col items-center space-x-2">
        //                 <span>Generate a voice clone with following text: {genText}</span>
        //                 {/* <FaMusic size={20} className="text-white" /> */}
        //             </div>
        //         ),
        //         type: 'text',
        //     };
        //     setDisplayMessages((prev) => [...prev, userDisplayMessage]);
        //     setInputMessage('');
        //     setFiles([]);
        //     setIsLoading(true)


        //     // Build FormData with the required payload parameters.
        //     const formData = new FormData();
        //     formData.append('ref_audio', audioFile.file); // Pass the audio file as binary.
        //     formData.append('ref_text', '');             // Send empty value.
        //     formData.append('gen_text', genText);         // The text for the voice clone.
        //     formData.append('model', 'F5-TTS');           // Set model (or leave empty if desired).
        //     formData.append('remove_silence', 'false');   // Boolean value as string.
        //     formData.append('cross_fade_duration', '0.15'); // Number as string.
        //     formData.append('nfe_step', '32');            // Integer as string.
        //     formData.append('speed', '1');                // Number as string.

        //     try {
        //         // Trigger the API call.
        //         const response = await fetch('/api/voice-clone', {
        //             method: 'POST',
        //             body: formData,
        //         });

        //         if (!response.ok) {
        //             throw new Error('Failed to generate voice clone.');
        //         }

        //         // Read the returned audio as a blob.
        //         const blob = await response.blob();
        //         const audioUrl = URL.createObjectURL(blob);

        //         // Build a success message that shows an audio player and download link.
        //         const successMessage: Message = {
        //             role: 'assistant',
        //             content: (
        //                 <div>
        //                     <audio controls src={audioUrl} className="w-full" />
        //                     <a
        //                         href={audioUrl}
        //                         download="voice_clone.wav"
        //                         className="text-blue-500 underline block mt-2"
        //                     >
        //                         Download Voice Clone
        //                     </a>
        //                 </div>
        //             ),
        //             type: 'text',
        //         };
        //         setDisplayMessages((prev) => [...prev, successMessage]);
        //         setIsLoading(false)
        //     } catch (error: any) {
        //         console.error("Error in generate-voice-clone:", error);
        //         toast.error("Error generating voice clone. Please try again.");
        //     }

        //     return;
        // }
        

if (fullMessage.startsWith('/privacy-ai')) {
  const query = fullMessage.replace('/privacy-ai', '').trim();

  if (!privacyProofJson) {
    toast.error('Please upload a zkProof JSON first.');
    return;
  }
  if (!query) {
    toast.error('Please type your question after /privacy-ai.');
    return;
  }

  // Show the user message (question + a small “JSON” chip)
  const userMessage: Message = {
    role: 'user',
    content: (
      <div>
        <div className="mb-2">{query}</div>
        <div className="inline-flex items-center gap-2 bg-[#171D3D] border border-[#2B2F5B] px-2 py-1 rounded-md">
          <span className="text-xs text-blue-300">{privacyProofName || 'proof.json'}</span>
          <button
            type="button"
            className="text-xs text-gray-300 hover:text-white underline"
            onClick={() => setShowJsonPreview(true)}
          >
            Preview
          </button>
        </div>
      </div>
    ) as any,
    type: 'text',
  };
  setDisplayMessages(prev => [...prev, userMessage]);

  // loader on
  setIsLoading(true);

  try {
    const payload = {
      kb_id: selectedTicker || '',     // or whatever KB you want
      query,
      proof_json: privacyProofJson,
      proof_path: '',                  // if you later support uploading to storage
      top_k: 5,
      model: '',
    };

    const res = await fetch('/api/privacy-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Privacy AI request failed');

    const data: { answers: string[]; sources: any[] } = await res.json();

    const assistantMessage: Message = {
      role: 'assistant',
      type: 'text',
      content: `

${data?.answers?.[0] ?? '—'}`
    };
    setDisplayMessages(prev => [...prev, assistantMessage]);
  } catch (err) {
    console.error(err);
    toast.error('Error processing privacy query.');
  } finally {
    setIsLoading(false);
    setInputMessage('');             // clear text area
    setPrivacyProofJson(null);       // clear JSON state
    setPrivacyProofName(''); 
    // keep JSON loaded for follow-up questions; remove if you want to reset:
    // setPrivacyProofJson(null); setPrivacyProofName('');
  }
  return;
}


        if (fullMessage.startsWith('/generate-voice-clone')) {
            // Check credits first
            if (credits <= 0) {
                toast.error("Insufficient credits. Please add more credits to continue.");
                return;
            }

            // Check API key
            if (!apiKey) {
                toast.error("API key is required. Please set your API key in settings.");
                return;
            }

            // Find an audio file among the uploaded files.
            const audioFile = files.find((file) => file.file.type.startsWith('audio/'));
            if (!audioFile) {
                toast.error("Please upload an audio file for voice cloning.");
                return;
            }

            // Extract the text after removing the command prefix.
            const genText = fullMessage.replace('/generate-voice-clone', '').trim();
            if (!genText) {
                toast.error("Please provide text for voice cloning after the command.");
                return;
            }

            // Display the user message with command text and credits info.
            const userDisplayMessage: Message = {
                role: 'user',
                content: (
                    <div className="flex flex-col items-center space-x-2">
                        <span>Generate a voice clone with following text: {genText}</span>
                        <span className="text-sm text-gray-500">Credits remaining: {credits}</span>
                    </div>
                ),
                type: 'text',
            };
            setDisplayMessages((prev) => [...prev, userDisplayMessage]);
            setInputMessage('');
            setFiles([]);
            setIsLoading(true);

            // Build FormData with the required payload parameters.
            const formData = new FormData();
            formData.append('ref_audio', audioFile.file); // Pass the audio file as binary.
            formData.append('ref_text', '');             // Send empty value.
            formData.append('gen_text', genText);         // The text for the voice clone.
            formData.append('model', 'F5-TTS_v1');           // Set model (or leave empty if desired).
            formData.append('remove_silence', 'false');   // Boolean value as string.
            formData.append('cross_fade_duration', '0.15'); // Number as string.
            formData.append('nfe_step', '32');            // Integer as string.
            formData.append('speed', '1');                // Number as string.
            formData.append('seed', '1'); 

            try {
                // Trigger the API call with headers for credit management.
                const response = await fetch('/api/voice-clone', {
                    method: 'POST',
                    headers: {
                        'X-API-Key': apiKey,
                        'X-Current-Credits': credits.toString(),
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    throw new Error(errorData.error || 'Failed to generate voice clone.');
                }

                // Check if credits should be deducted
                const shouldDeductCredits = response.headers.get('X-Deduct-Credits');
                const remainingCredits = response.headers.get('X-Remaining-Credits');

                if (shouldDeductCredits && remainingCredits) {
                    // Update the store with new credit count
                    const newCredits = parseInt(remainingCredits);
                    setCredits(newCredits);

                    // Show credit deduction message
                    toast.success(`Voice clone generated! ${shouldDeductCredits} credit(s) deducted. ${newCredits} credits remaining.`);
                }

                // Read the returned audio as a blob.
                const blob = await response.blob();
                const audioUrl = URL.createObjectURL(blob);

                // Build a success message that shows an audio player and download link.
                const successMessage: Message = {
                    role: 'assistant',
                    content: (
                        <div>
                            <div className="mb-2">
                                <span className="text-sm text-green-600">
                                    Voice clone generated successfully! Credits remaining: {credits - 1}
                                </span>
                            </div>
                            <audio controls src={audioUrl} className="w-full" />
                            <a
                                href={audioUrl}
                                download="voice_clone.wav"
                                className="text-blue-500 underline block mt-2"
                            >
                                Download Voice Clone
                            </a>
                        </div>
                    ),
                    type: 'text',
                };
                setDisplayMessages((prev) => [...prev, successMessage]);
                setIsLoading(false);

            } catch (error: any) {
                console.error("Error in generate-voice-clone:", error);
                setIsLoading(false);

                // Handle specific error cases
                if (error.message.includes('Insufficient credits')) {
                    toast.error("Insufficient credits. Please add more credits to continue.");
                } else if (error.message.includes('API key')) {
                    toast.error("Invalid API key. Please check your API key in settings.");
                } else {
                    toast.error(`Error generating voice clone: ${error.message}`);
                }
            }

            return;
        }

        // if (fullMessage.startsWith('/img-to-video')) {
        //     if (wan2Choice === 'without') {
        //         // Existing logic for "without Wan2.0"
        //         const userInput = fullMessage.replace('/img-to-video', '').trim();
        //         if (files.length !== 1) {
        //             toast.error('Please upload exactly one image before using /img-to-video.');
        //             return;
        //         }
        //         if (!userInput) {
        //             toast.error('Please provide a prompt after the /img-to-video command.');
        //             return;
        //         }
        //         const file = files[0].file;
        //         const formData = new FormData();
        //         formData.append('image', file);
        //         formData.append('prompt', userInput);
        //         formData.append('seed', '-1');
        //         formData.append('fps', '24');
        //         formData.append('w', '720');
        //         formData.append('h', '720');
        //         formData.append('video_length', '120');
        //         formData.append('img_edge_ratio', '1');

        //         try {
        //             const response = await fetch('/api/imgToVideo', {
        //                 method: 'POST',
        //                 body: formData,
        //             });

        //             if (response.ok) {
        //                 const blob = await response.blob();
        //                 const videoUrl = window.URL.createObjectURL(blob);

        //                 const successMessage: Message = {
        //                     role: 'assistant',
        //                     content: (
        //                         <div>
        //                             <video src={videoUrl} controls className="w-full rounded-lg" />
        //                             {/* <button
        //                                 className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
        //                                 onClick={() => openVideoEditor(videoUrl)}
        //                             >
        //                                 <div className="text-white bg-black bg-opacity-50 p-1 rounded" >Edit video</div>
        //                             </button> */}
        //                             <a
        //                                 href={videoUrl}
        //                                 download="output_video.mp4"
        //                                 className="text-blue-500 underline"
        //                             >
        //                                 Download Video
        //                             </a>
        //                         </div>
        //                     ),
        //                     type: 'text',
        //                 };

        //                 setDisplayMessages((prev) => [...prev, successMessage]);
        //             } else {
        //                 const errorResponse = await response.json();
        //                 toast.error(
        //                     errorResponse.error || 'Failed to generate video. Please check your input.'
        //                 );
        //             }
        //         } catch (error) {
        //             console.error('Error:', error);
        //             toast.error('An error occurred while generating the video.');
        //         }

        //         setInputMessage('');
        //         if (inputRef.current) {
        //             inputRef.current.style.height = '2.5rem';
        //         }
        //         setFiles([]);
        //         return;
        //     } else if (wan2Choice === 'with') {
        //         // Instead of executing the API call now, show the modal for additional input.
        //         setShowVideoLengthModal(true);
        //         return;
        //     } else {
        //         // Optionally handle the case when wan2Choice is not set.
        //         toast.error('Please select a Wan2.0 mode before proceeding.');
        //         return;
        //     }
        // }



        // if (fullMessage.startsWith('/img-to-video')) {
        //     const userInput = fullMessage.replace('/img-to-video', '').trim();
        //     if (files.length !== 1) {
        //         toast.error('Please upload exactly one image before using /img-to-video.');
        //         return;
        //     }
        //     if (!userInput) {
        //         toast.error('Please provide a prompt after the /img-to-video command.');
        //         return;
        //     }
        //     const file = files[0].file;
        //     const formData = new FormData();
        //     formData.append('image', file);
        //     formData.append('prompt', userInput);
        //     formData.append('seed', '-1');
        //     formData.append('fps', '24');
        //     formData.append('w', '720');
        //     formData.append('h', '720');
        //     formData.append('video_length', '120');
        //     formData.append('img_edge_ratio', '1');

        //     try {
        //         const response = await fetch('/api/imgToVideo', {
        //             method: 'POST',
        //             body: formData,
        //         });

        //         if (response.ok) {
        //             // 4. Get the video blob
        //             const blob = await response.blob();
        //             const videoUrl = window.URL.createObjectURL(blob);

        //             const successMessage: Message = {
        //                 role: 'assistant',
        //                 content: (
        //                     <div>
        //                         <video src={videoUrl} controls className="w-full rounded-lg" />
        //                         <a
        //                             href={videoUrl}
        //                             download="output_video.mp4"
        //                             className="text-blue-500 underline"
        //                         >
        //                             Download Video
        //                         </a>
        //                     </div>
        //                 ),
        //                 type: 'text',
        //             };

        //             setDisplayMessages((prev) => [...prev, successMessage]);
        //         } else {
        //             const errorResponse = await response.json();
        //             toast.error(
        //                 errorResponse.error || 'Failed to generate video. Please check your input.'
        //             );
        //         }
        //     } catch (error) {
        //         console.error('Error:', error);
        //         toast.error('An error occurred while generating the video.');
        //     }

        //     setInputMessage('');
        //     if (inputRef.current) {
        //         inputRef.current.style.height = '2.5rem';
        //     }
        //     setFiles([]);
        //     return;
        // }

        // if (fullMessage.startsWith('/ugc')) {
        //     const parts = fullMessage.replace('/ugc', '').trim().split(' ');
        //     const selectedOption = parts[0]; // First word after `/ugc`
        //     const userPrompt = parts.slice(1).join(' ').trim(); // Rest of the message

        //     if (!selectedOption || !userPrompt) {
        //         const errorMessage: Message = {
        //             role: 'assistant',
        //             content: 'Please select an option and provide a prompt. Format: /ugc [Option] [Prompt]',
        //             type: 'text',
        //         };
        //         setDisplayMessages((prev) => [...prev, errorMessage]);
        //         return;
        //     }

        //     const formattedPrompt = `${selectedOption.toUpperCase()} ${userPrompt}`;

        //     // Add user's message to chat
        //     const userMessage: Message = {
        //         role: 'user',
        //         content: fullMessage,
        //         type: 'text',
        //     };
        //     setDisplayMessages((prev) => [...prev, userMessage]);
        //     setInputMessage(''); // Clear input field
        //     setIsLoading(true); // Show loader

        //     // Find the selected UGC option (optional: if you still want to validate client-side)
        //     const option = availableUGCOptions.find((opt) => opt.name === selectedOption);
        //     if (!option) {
        //         const errorMessage: Message = {
        //             role: 'assistant',
        //             content: `Unknown option: ${selectedOption}. Available options: ${availableUGCOptions.map((opt) => opt.name).join(', ')}`,
        //             type: 'text',
        //         };
        //         setDisplayMessages((prev) => [...prev, errorMessage]);
        //         setIsLoading(false); // Disable loader
        //         return;
        //     }

        //     // Prepare the payload for the /generate endpoint
        //     const payload = {
        //         selectedOption,
        //         "width": 512,
        //         "height": 512,
        //         "num_steps": 20,
        //         "guidance": 4,
        //         userPrompt: formattedPrompt
        //     };

        //     try {
        //         const response = await fetch('/api/generate', {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 'Authorization': 'Bearer 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'
        //             },
        //             body: JSON.stringify(payload),
        //         });

        //         console.log('response', response);

        //         if (!response.ok) {
        //             throw new Error(`Failed to generate content for ${selectedOption}`);
        //         }

        //         // Handle response content type
        //         const contentType = response.headers.get('Content-Type');

        //         if (contentType?.includes('image/')) {
        //             // If the response is an image (e.g., JPEG or PNG)
        //             const blob = await response.blob();
        //             const imageUrl = URL.createObjectURL(blob);
        //             console.log('blib image url', imageUrl)

        //             const successMessage: Message = {
        //                 role: 'assistant',
        //                 content: (
        //                     <div>
        //                         <p>Generated {selectedOption} Content:</p>
        //                         <img
        //                             src={imageUrl}
        //                             alt={`${selectedOption} generated content`}
        //                             className="w-full rounded-lg"
        //                         />
        //                     </div>
        //                 ),
        //             };
        //             setDisplayMessages((prev) => [...prev, successMessage]);
        //         } else if (contentType?.includes('application/json')) {
        //             // If the response is JSON
        //             const result = await response.json();
        //             const successMessage: Message = {
        //                 role: 'assistant',
        //                 content: (
        //                     <div>
        //                         <p>Generated {selectedOption} Content:</p>
        //                         <img
        //                             // src={`data:image/png;base64,${result.image}`}
        //                             src={`${result.image}`}
        //                             alt={`${selectedOption} generated content`}
        //                             className="w-full rounded-lg"
        //                         />
        //                     </div>
        //                 ),
        //             };
        //             setDisplayMessages((prev) => [...prev, successMessage]);
        //         } else {
        //             throw new Error('Unsupported response type');
        //         }
        //     } catch (error) {
        //         const errorMessage: Message = {
        //             role: 'assistant',
        //             content: `Error generating ${selectedOption} content: ${error}`,
        //             type: 'text',
        //         };
        //         setDisplayMessages((prev) => [...prev, errorMessage]);
        //     } finally {
        //         setIsLoading(false); // Disable loader
        //     }

        //     return;
        // }

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


        if (fullMessage.startsWith('/video-gen')) {
            // 1. Extract the prompt after the command
            const promptText = fullMessage.replace('/video-gen', '').trim();
            if (!promptText) {
                toast.error('Please provide a prompt after /video-gen.');
                return;
            }

            // 2. Show the user’s own message in the chat window
            const userMessage: Message = {
                role: 'user',
                content: fullMessage,
                type: 'text',
            };
            setDisplayMessages((prev) => [...prev, userMessage]);

            // 3. Clear the input & set loading state
            setInputMessage('');
            setIsLoading(true);

            // 4. Call our helper to actually hit /api/video-gen
            await processVideoGen(promptText);

            setIsLoading(false);
            return;
        }

        // if (fullMessage.startsWith('/video-lipsync')) {
        //     // If no option is chosen, do nothing (the popup should be visible).
        //     if (!videoLipsyncOption) {
        //         return;
        //     }

        //     const imageFile = files.find((file) => file.file.type.startsWith('image/'));
        //     const audioFile = files.find((file) => file.file.type.startsWith('audio/'));

        //     // Build an array for the user prompt content.
        //     const userContent: (string | React.ReactNode)[] = [fullMessage];

        //     if (imageFile) {
        //         // Render a small preview of the uploaded image.
        //         userContent.push(
        //             <img
        //                 key="img"
        //                 src={imageFile.preview}
        //                 alt="Uploaded Image"
        //                 className="w-16 h-16 object-cover rounded-md ml-2"
        //             />
        //         );
        //     }

        //     if (audioFile) {
        //         // Render the FcAudioFile icon for the uploaded audio file.
        //         userContent.push(
        //             <FcAudioFile key="audio" size={32} className="ml-2" />
        //         );
        //     }
        //     // Add a user message showing what was sent.
        //     const userMessage: Message = {
        //         role: 'user',
        //         content: fullMessage,
        //         type: 'text',
        //     };
        //     setDisplayMessages((prev) => [...prev, userMessage]);
        //     setInputMessage('');
        //     setFiles([]);
        //     setIsLoading(true);


        //     // Process the command.
        //     await processVideoLipsync();

        //     setIsLoading(false);
        //     return;
        // }



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

        // if (fullMessage.startsWith('/character-gen')) {
        //     const { selectedTicker } = useTickerStore.getState();

        //     if (!selectedTicker) {
        //         const errorMessage: Message = {
        //             role: 'assistant',
        //             content: 'No agent selected. Please use /select command first to choose an agent.',
        //             type: 'text'
        //         };
        //         setDisplayMessages(prev => [...prev, errorMessage]);
        //         return;
        //     }

        //     const characterMessage: Message = {
        //         role: 'assistant',
        //         content: <CharacterGenForm /> as ReactNode,
        //         type: 'command'
        //     };
        //     setDisplayMessages(prev => [...prev, characterMessage]);
        //     setInputMessage('');
        //     if (inputRef.current) {
        //         inputRef.current.style.height = '2.5rem';
        //     }
        //     return;
        // }
        

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

        const isCreateAgent = fullMessage.startsWith('/create-agent');
        // ZEE: open cub picker instead of streaming
if (isCreateAgent) {
  useAgentCart.getState().setPickerOpen(true);
  // (Optional) also show the user's command in chat window, if you like:
  const displayMessage: Message = { role: 'user', content: fullMessage };
  setDisplayMessages(prev => [...prev, displayMessage]);
  setInputMessage('');
  if (inputRef.current) inputRef.current.style.height = '2.5rem';
  return; // IMPORTANT: stop here — don't go into your old image-gen/meme-gen flow
}

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
                        credits,
                        apiKey,
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

                    let assistantContent = finalEvent.content; // original assistant response

                    // // --- Begin Translation Integration ---
                    // const targetLang = getUserTargetLanguage();
                    // if (targetLang) {
                    //     // If the user’s browser indicates one of the supported languages,
                    //     // call the translation helper.
                    //     const translatedText = await translateText(finalEvent.content, targetLang);

                    //     // You can display both the original and translated version.
                    //     // For example, wrap them in a container:
                    //     assistantContent = (
                    //         <div>
                    //             <div>{finalEvent.content}</div>
                    //             <div className="mt-2 text-blue-400 text-sm">
                    //                 [{targetLang.toUpperCase()}] {translatedText}
                    //             </div>
                    //         </div>
                    //     );
                    // }
                    // --- End Translation Integration ---

                    // First, update your API messages with the name and description.
                    setApiMessages(prev => [
                        ...prev,
                        { role: 'assistant', content: finalEvent.prompt || finalEvent.content }
                    ]);

                    if (isMemeGen) {
                        // Wait for the name/description processing to complete.
                        await handleMemeImageGeneration(finalEvent.content, promptText);

                        // Now that the processing is over, add the image to the display.
                        const assistantMessage = {
                            role: 'assistant',
                            content: finalEvent.content,
                            type: 'image',
                            command: 'create-agent'
                        } as Message;
                        setDisplayMessages(prev => [...prev, assistantMessage]);
                        setProcessingCommand(true);
                        setShowCreateAgentModal(true);
                    } else {
                        // If not meme generation, you can display the image immediately
                        // or add additional processing if needed.
                        const assistantMessage = {
                            role: 'assistant',
                            content: finalEvent.content,
                            type: 'image',
                            command: 'image-gen'
                        } as Message;
                        setDisplayMessages(prev => [...prev, assistantMessage]);
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
                            credits,
                            apiKey,
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
                            credits,
                            apiKey,
                        }),
                        signal: controller.signal,
                    });
                    clearTimeout(timeoutId);

                    console.log('response data', response)

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


                            if (chunk.startsWith('data: [PROOF]')) {
                                const proofStr = chunk.replace('data: [PROOF]', '').trim();
                                try {
                                    const parsedProof = JSON.parse(proofStr);
                                    // console.log('Proof data:', parsedProof.proof);
                                    setProofData(parsedProof.proof);
                                } catch (err) {
                                    console.error('Error parsing proof data:', err);
                                    // Fallback: just log the raw string.
                                    console.log('Proof data (raw):', proofStr);
                                    setProofData(proofStr);
                                }
                                continue;
                            }



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

    // const handleMintNFT = async (base64Image: string) => {
    //     setLoading(true);
    //     try {
    //         // const { txSignature, result } = await createNft(base64Image, 'NFT', wallet);

    //         // console.log('signature', txSignature)
    //         // console.log('result', result)
    //         const response = await createNft(base64Image, 'NFT', wallet);

    //         console.log(response);
    //         // const metaplexUrl = `https://core.metaplex.com/explorer/${assetPublicKey}?env=devnet`;
    //         // window.open(metaplexUrl, '_blank', 'noopener,noreferrer');
    //     } catch (error) {
    //         console.error("Failed to mint NFT:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleMintNFT = async (base64Image: string) => {
        setLoading(true);
        let compressedBase64 = base64Image;

        try {
            compressedBase64 = await compressImageMint(base64Image, 800, 0.7);
            const response = await fetch("/api/mint-nft", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    base64Image: compressedBase64,
                    name: "NFT", // Or any name you want to use
                    recipient: wallet.publicKey ? wallet.publicKey.toString() : "",
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Error minting NFT");
            }
            console.log("NFT minted successfully! Mint address:", data.mintAddress);
            toast.success("NFT minted successfully!");
        } catch (error: any) {
            console.error("Failed to mint NFT:", error);
            toast.error("Failed to mint NFT");
        } finally {
            setLoading(false);
        }
    };

    // const handleDownload = async () => {
    //     if (!proofData) {
    //         console.log('No proof data to download');
    //         toast.error('No proof data to download')
    //         return;
    //     }

    //     const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: 'application/json' });

    //     if (window.showSaveFilePicker) {
    //         try {
    //             const handle = await window.showSaveFilePicker({
    //                 suggestedName: 'proof.json',
    //                 types: [{
    //                     description: 'JSON File',
    //                     accept: { 'application/json': ['.json'] },
    //                 }],
    //             });
    //             const writable = await handle.createWritable();
    //             await writable.write(blob);
    //             await writable.close();
    //         } catch (err) {
    //             console.error('Failed to save file:', err);
    //             // Fall back to the alternative method
    //             fallbackDownload(blob);
    //         }
    //     } else {
    //         fallbackDownload(blob);
    //     }
    // };
    const handleDownload = async () => {
        if (!proofData) {
            console.error('No proof data available.');
            toast.error('No proof data to download');
            return;
        }

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        // Attempt to use the Web Share API on mobile if available.
        if (isMobile && navigator.share) {
            try {
                const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: 'application/json' });
                const file = new File([blob], 'proof.json', { type: blob.type });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Download Proof Data',
                        text: 'Share to save the file',
                    });
                    return;
                }
            } catch (error) {
                console.error('Web Share API error:', error);
            }
        }

        // Fallback: use an iframe on mobile, or a Blob URL on desktop.
        if (isMobile) {
            // For mobile devices without Web Share support, create a hidden iframe to trigger download via your API.
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = '/api/download-proof';
            document.body.appendChild(iframe);
            // Clean up after a few seconds.
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 3000);
        } else {
            // Desktop fallback using a Blob URL.
            const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'proof.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
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


    // const handleSubmitImgToVideoWan2 = async () => {
    //     try {
    //         if (files.length !== 1) {
    //             toast.error('Please upload exactly one image for /img-to-video with Wan2.0.');
    //             return;
    //         }
    //         // The user's text after /img-to-video
    //         const userInput = inputMessage.replace('/img-to-video', '').trim();
    //         if (!userInput) {
    //             toast.error('Please provide a prompt after /img-to-video.');
    //             return;
    //         }

    //         const positivePrompt = userInput.replace(/with wan2\.0/i, '').trim();

    //         const imageFile = files[0].file;
    //         const formData = new FormData();
    //         formData.append('image_file', imageFile);
    //         formData.append('positive_prompt', positivePrompt);
    //         formData.append('seed', '0');
    //         formData.append('steps', '20');
    //         formData.append('cfg', '6');
    //         formData.append('sampler_name', 'uni_pc');
    //         formData.append('scheduler', 'simple');
    //         formData.append('number', '1');
    //         formData.append('video_length', videoLength);
    //         formData.append('width', '512');
    //         formData.append('height', '512');
    //         formData.append('output_fps', '16');
    //         formData.append('output_quality', '90');
    //         formData.append('output_format', 'mp4');

    //         setIsLoading(true);
    //         const response = await fetch('/api/wan-img-to-video', {
    //             method: 'POST',
    //             body: formData,
    //         });

    //         if (!response.ok) {
    //             throw new Error(`Wan2.0 generation failed: ${response.statusText}`);
    //         }
    //         const blob = await response.blob();
    //         const mp4Url = URL.createObjectURL(blob);

    //         // Generate a filename for download
    //         const filename = `video_${new Date().getTime()}.mp4`;


    //         // Also push a chat message so user sees the result
    //         const assistantMessage: Message = {
    //             role: "assistant",
    //             content: (
    //                 <div>
    //                     <div className="relative group">
    //                         <video
    //                             src={mp4Url}
    //                             controls
    //                             autoPlay
    //                             loop
    //                             className="w-full h-auto rounded-lg"
    //                         />
    //                         <button
    //                             className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
    //                             onClick={() => openVideoEditor(mp4Url)}
    //                         >
    //                             Edit Video
    //                         </button>
    //                     </div>

    //                     <a
    //                         href={mp4Url}
    //                         download={filename}
    //                         className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 mt-2"
    //                     >
    //                         {/* … your SVG download icon … */}
    //                         Download MP4
    //                     </a>
    //                 </div>
    //             ),
    //             type: "text",
    //         }
    //         // const assistantMessage: Message = {
    //         //     role: "assistant",
    //         //     content: (
    //         //         <div>
    //         //             <video
    //         //                 src={mp4Url}
    //         //                 controls
    //         //                 autoPlay
    //         //                 loop
    //         //                 className="w-full h-auto rounded-lg"
    //         //             />

    //         //             <a
    //         //                 href={mp4Url}
    //         //                 download={filename}
    //         //                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 mt-2"
    //         //             >
    //         //                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    //         //                     <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    //         //                 </svg>
    //         //                 Download MP4
    //         //             </a>
    //         //         </div>
    //         //     ),
    //         //     type: "text",
    //         // };

    //         setDisplayMessages((prev) => [...prev, assistantMessage]);


    //     } catch (error) {
    //         console.error('Error in handleSubmitImgToVideoWan2:', error);
    //     } finally {
    //         setIsLoading(false);
    //         // reset states if you want
    //         setFiles([]);
    //         setInputMessage('');
    //         setWan2Choice(null);
    //     }
    // };


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

                // let parsedContent;
                // try {
                //     parsedContent = JSON.parse(message.content); // Attempt to parse JSON
                // } catch (error) {
                //     console.error("Error parsing message content:", error);
                //     parsedContent = { content: message.content, thought: null }; // Fallback in case of invalid JSON
                // }

                // const { content, thought } = parsedContent;

                let parsed: { content: string; thought: string | null }
                const raw = String(message.content).trim()
                let thoughtStr: string | null = null

                // only parse if it starts with “{” and ends with “}”
                if (raw.startsWith('{') && raw.endsWith('}')) {
                    try {
                        parsed = JSON.parse(raw)
                    } catch {
                        parsed = { content: raw, thought: null }
                    }
                } else {
                    parsed = { content: raw, thought: null }
                }

                if (parsed.thought === null && raw.includes('</think>')) {
                    const [before, ...after] = raw.split('</think>')
                    parsed.thought = before.replace(/<think>/g, '').trim()
                    parsed.content = after.join('</think>').trim()
                }
                const { content, thought } = parsed
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

    const handleDeleteAgent = async (ticker: string) => {
        if (!walletAddress) {
            toast.error("Wallet not connected");
            return;
        }
        try {
            const response = await fetch(
                `https://zynapse.zkagi.ai/characters?wallet_address=${walletAddress}&ticker=${ticker}`,
                {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': 'zk-123321'
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to delete agent");
            }
            toast.success(`Agent ${ticker} deleted successfully`);
            // Optionally, revalidate or update your agent data here:
            mutate([AGENTS_API_URL, apiKey, walletAddress]);
        } catch (error) {
            console.error("Error deleting agent", error);
            toast.error("Error deleting agent");
        }
    };


    const renderTextContent = (content?: string) => {
        if (!content) {
            return null; // or return an empty fragment: <></>
        }
        // console.log('text content');
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
    // const downloadImage = (imageData: string) => {
    //     try {
    //         // Convert the data URL to a Blob
    //         const blob = dataURLtoBlob(imageData);
    //         // Create a blob URL
    //         const blobUrl = URL.createObjectURL(blob);
    //         // Create a temporary anchor element and trigger the download
    //         const link = document.createElement('a');
    //         link.href = blobUrl;
    //         link.download = 'zkdownloaded-image.png'; // Change the filename/extension if needed
    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);
    //         // Clean up the blob URL after a short delay
    //         setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    //     } catch (error) {
    //         console.error("Error downloading image:", error);
    //     }
    // };

    return (
        <div className="flex min-h-screen bg-[#000000] overflow-hidden text-white">

            {showConnectModal && <ConnectWalletModal onClose={() => {
                setShowConnectModal(false)
                setShowTour(true)

            }}
            />
            }
          

            {/* <PresaleBanner walletConnected={connected} walletAddress={walletAddress} /> */}

            {/* Main content */}
            <div className={`flex-1 flex flex-col bg-[#08121f] min-h-screen`}>
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

                <div className="sticky top-0 z-50">
                    {isMobile ? (

                        <div
                            className="w-full bg-[#08121f] px-4 py-2 flex-shrink-0"
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
                                    {/* <CustomWalletButton /> */}
                                    <div className="wallet-button">
                                        <CustomWalletButton />
                                    </div>
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
                        <>
                            <OnboardingTour
                                isOpen={showTour}
                                onClose={() => setShowTour(false)}
                            />



                            {/* // Desktop header: your original one (or adjusted as needed) */}
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
                        </>
                    )}
                </div>


                {/* content post header */}
                <div className="flex h-full gap-5 overflow-hidden ">
                    {/* <div
                        className={`
                    ${isMobile ? (isMenuOpen ? 'block' : 'hidden') : 'block'} 
                    ${isMobile ? 'w-3/4' : 'w-64'} 
                    bg-[#08121f] border left-0 h-full rounded-lg ml-3
                   `}
                    > */}
                    <div
                        className={`
    bg-[#08121f] border rounded-lg flex-shrink-0 z-40
    ${isMobile ?
                                `fixed left-0 bottom-0 w-3/4 transition-transform duration-300 ease-in-out ml-0
         ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}   top-[5.2rem]` :
                                'w-64 relative ml-3'
                            }
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
                                                {dictionary?.sidebar.home}
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
                                                {dictionary?.sidebar.marketplace}
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
                                                {dictionary?.sidebar.explore}
                                            </div>
                                        </Link>
                                        <Link href={`/${lang}/api-key`}>
                                            <div className="mb-1 flex flex-row items-center justify-start gap-2 cursor-pointer">
                                                <Image
                                                    src="images/lock.svg"
                                                    alt="explore marketplace"
                                                    width={15}
                                                    height={15}
                                                    className="my-2"
                                                />
                                                {dictionary?.sidebar.apiKeys}
                                            </div>
                                        </Link>

                                        {/* <Link href={`/${lang}/payments`} >
                                            <div className="mb-1 flex flex-row items-center justify-start gap-2 cursor-pointer hover:bg-gray-700 p-2 rounded">
                                                <FaCreditCard className="w-5 h-5 text-white" />
                                                <span className="text-white">Payments</span>
                                            </div>
                                        </Link> */}

                                    </div>
                                    <div className="mb-2">
    <h3
        className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between"
        onClick={toggleDropdown}
    >
        {dictionary?.sidebar.agents.title}
        {isDropdownOpen ? <FaChevronDown /> : <FaChevronUp />}
    </h3>
    {isDropdownOpen && (
        <div className="flex-grow overflow-y-auto mb-[4px] max-h-[calc(70vh-200px)] scrollbar-track-gray-700 scrollbar-thumb-gray-500">
            {agentsData && agentsData.items && agentsData.items.length > 0 ? (
                agentsData.items.map((agent: any) => (
                    <div
                        key={agent.id}
                        className="relative cursor-pointer hover:bg-gray-700 p-2 rounded flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-2">
                            <span
                                className={`inline-block w-3 h-3 rounded-full ${
                                    agent.paymentStatus ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                title={agent.paymentStatus ? 'Payment completed' : 'Payment pending'}
                            />
                            <span>{agent.name}</span>
                        </div>

                        <button
                            type="button"
                            className="rounded-full hover:bg-gray-800"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowAgentOptions(agent.id);
                            }}
                        >
                            <HiDotsVertical />
                        </button>

                        {/* {showAgentOptions === agent.id && (
                            <div
                                ref={popUpRef}
                                className="absolute right-0 top-full mt-2 w-40 h-24 pl-1 bg-[#171D3D] rounded shadow-lg z-50 flex flex-col justify-center"
                            >
                                <div>
                                    <button
                                        className="block w-full text-left px-4 py-2 hover:bg-[#24284E] text-white"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowAgentOptions(null);
                                            handleDeleteAgent(agent.id);
                                        }}
                                    >
                                        Delete Agent
                                    </button>
                                </div>
                                <div>
                                    <button
                                        className="block w-full text-left px-4 py-2 hover:bg-[#24284E] text-white"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowAgentOptions(null);
                                            handleEditAgent(agent.id);
                                        }}
                                    >
                                        Edit Agent
                                    </button>
                                </div>
                            </div>
                        )} */}
                    </div>
                ))
            ) : (
                <div className="text-gray-500 text-sm text-center p-4 italic">
                    No agents created yet
                </div>
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
                                            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '20rem' }}>
                                                {mergedTickers.length > 0 ? (
                                                    mergedTickers.map(({ ticker, status }) => (
                                                        <div
                                                            key={ticker}
                                                            className={`
              relative group
              cursor-pointer hover:bg-gray-700 p-2 rounded
              flex items-center justify-between
              ${status === null ? 'cursor-not-allowed' : ''}
            `}
                                                        >
     
                                                            <div
                                                                className="flex items-center space-x-2"
                                                                onClick={() => toggleTickerStatus(ticker, status)}
                                                            >
                                                                <span
                                                                    className={`
                  inline-block w-3 h-3 rounded-full
                  ${status === null ? 'bg-gray-500' : status ? 'bg-green-500' : 'bg-red-500'}
                `}
                                                                />
                                                                <span>{ticker}</span>
                                                            </div>


                                                            <div className="relative flex items-center">
                                                                <button
                                                                    type="button"
                                                                    className="p-1 rounded-full hover:bg-gray-800"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); // stop row onClick
                                                                        // Toggle this agent’s pop-up:
                                                                        setShowAgentOptions((prev) => (prev === ticker ? null : ticker));
                                                                    }}
                                                                >
                                                                    <HiDotsVertical />
                                                                </button>


                                                                {showAgentOptions === ticker && (
                                                                    <div
                                                                        ref={popUpRef}
                                                                        className="absolute right-0 mt-2 w-28 bg-[#171D3D] rounded shadow-lg z-50"
                                                                    >
                                                                        <button
                                                                            className="block w-full text-left px-4 py-2 hover:bg-[#24284E] text-white"
                                                                            onClick={() => {
                                                                                setShowAgentOptions(null);
                                                                                handleEditAgent(ticker);
                                                                            }}
                                                                        >
                                                                            Edit Agent
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-gray-500 text-sm text-center p-4 italic">
                                                        No agents created yet
                                                    </div>
                                                )}
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
                                            <div className="flex justify-center items-center">
                                                <Image
                                                    src="images/Group.svg"
                                                    alt="Docs"
                                                    width={30}
                                                    height={30}
                                                />
                                            </div>
                                            <div>
                                                <div className="font-ttfirs bg-gradient-to-b from-[#2AF698] to-[#5BBFCD] text-transparent bg-clip-text text-sm">
                                                    {dictionary?.docs.needHelp}
                                                </div>
                                                <div className="text-xs font-ttfirs">{dictionary?.docs.checkDocs}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </a>


                        </div>
                    </div>

                    {/* Chat messages */}
                    <div className='  flex flex-col justify-between md:w-3/4 w-full'>

                        {reportData && (
                            <ReportSidebar
                                isOpen={isReportOpen}
                                onClose={() => setIsReportOpen(false)}
                                data={reportData}
                            />
                        )}


                        {(!isMobile || activeMobileTab === 'zkterminal') && (
                            <>
                                <div className="flex-grow overflow-x-auto px-4 py-8 max-h-[630px] ">
                                    {isInitialView ? (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl">
                                                {/* {sampleCommands.map((cmd, index) => (
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
                                        ))} */}
                                                {dictionary?.commands.map((cmd, index) => (
                                                    <div className="flex flex-col justify-center items-center bg-gray-800 text-white p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition duration-300" key={index} 
                                                    // onClick={() => handleCommandBoxClick(cmd.command)}
                                                    onClick={() => {
      if (cmd.label?.trim().toLowerCase() === 'create agent') {
        startCreateAgentFlow();   
      } else {
        handleCommandBoxClick(cmd.command);
      }
    }}
                                                    >
                                                       <h3 className="text-xl font-bold mb-2">
  {cmd.label?.trim().toLowerCase() === 'create agent'
    ? 'Create Agent SWARM'
    : cmd.label}
</h3>

                                                        <p className="text-sm text-gray-300 text-center">{cmd.description}</p>
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
                                                                            {/* <button
                                                                        className="text-white rounded-lg"
                                                                        onClick={() => {
                                                                            if (typeof message.content === 'string') {
                                                                                console.log('message.content', message.content)
                                                                                // Check if the content is a data URL for an image.
                                                                                if (message.content.startsWith('data:image/')) {
                                                                                    // Download as an image.
                                                                                    downloadImage(`${message.content}`);
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
                                                                    </button> */}
                                                                            <DownloadButton message={{ content: message.content }} />

                                                                            <button className="text-white rounded-lg">
                                                                                <Image
                                                                                    src="images/share.svg"
                                                                                    alt="Share"
                                                                                    width={20}
                                                                                    height={20}
                                                                                />
                                                                            </button>
                                                                            {/* <button
                                                                        onClick={() => {
                                                                            // Store the image URL (assumed to be in message.content) then open the modal
                                                                            if (typeof message.content === 'string' && message.content.startsWith('data:image/')) {
                                                                                setSelectedImage(message.content);
                                                                                setShowImageSelectModal(true);
                                                                            } else {
                                                                                console.warn("No valid image available for selection");
                                                                            }
                                                                        }}
                                                                        className="text-white rounded-lg"
                                                                    >
                                                                        <Image src="images/select.svg" alt="Select" width={20} height={20} />
                                                                    </button> */}
                                                                        </div>
                                                                    )}


                                                                </div>
                                                                {message.role === 'assistant' &&

                                                                    (typeof message.content === 'string' && message.content.startsWith('data:image')) ? (
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

                                {showSubscriptionModal && (
                                    <ReportPaymentModal
                                        isOpen={showSubscriptionModal}
                                        onClose={() => setShowSubscriptionModal(false)}
                                        receivingWallet="0x01e919a01a7beff155bcEa5F42eF140881EF5E3a"
                                        connectedWallet={publicKey?.toString()}
                                        onPaymentSuccess={async (planId, orderData, usdAmount) => {
                                            // 1) hide the payment modal
                                            setShowSubscriptionModal(false)

                                            if (!rawPubkey) {
                                                console.error("No wallet connected!");
                                                return;
                                            }

                                            const walletAddress = rawPubkey.toString();
                                            // 2) re-check subscription in your store so the app "knows" they’re paid
                                            await checkSubscription(walletAddress)

                                            // 3) directly show the report panel
                                            // openReport()

                                            // 4) (fallback) if your UI still doesn’t render, do a full reload:
                                            // window.location.reload()
                                            // or
                                            // router.reload()
                                        }}
                                    />

                                )}

                                {/* {showSubscriptionModal && (
                                    <SubscriptionModal
                                        isOpen={showSubscriptionModal}
                                        onClose={() => setShowSubscriptionModal(false)}
                                        treasuryWallet="0x4F0474e8114788D82eD037B71FbE6b88fD081dB5" // Where you receive USDC
                                        onSubscriptionSuccess={(planId, orderData, usdAmount) => {
                                            console.log(`Received $${usdAmount} USD for ${planId}`);
                                            // Activate user subscription
                                        }}
                                        onSingleReportSuccess={(orderData, usdAmount) => {
                                            console.log(`Received $${usdAmount} USD for single report`);
                                            // Grant 24-hour access
                                        }}
                                    />
                                )} */}

                                <footer className="w-full py-6 flex justify-center px-2 sticky bg-[#08121F]  z-40
             md:bottom-0 bottom-[calc(env(safe-area-inset-bottom)+3.5rem)]">
                                    <div className="bg-gradient-to-tr from-[#000D33] via-[#9A9A9A] to-[#000D33] p-0.5 rounded-lg w-full">
                                        <form onSubmit={handleSubmit} className="w-full flex flex-col bg-[#08121f] rounded-lg">

                                            {files.length > 0 && (
                                                <div className="flex flex-wrap gap-2 p-2 border-b border-gray-700">
                                                    {files.map((file, i) => (
                                                        <div key={i} className="relative w-20 h-20">
                                                            {file.isPdf ? (
                                                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-xs text-white rounded-lg">
                                                                    {file.file.name}
                                                                </div>
                                                            ) : file.isVideoOrAudio ? (
                                                                file.file.type.startsWith('video/') ? (
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
                                                                )
                                                            ) : (
                                                                <img
                                                                    src={file.preview}
                                                                    alt={`Preview ${i}`}
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                            )}
                                                            <button
                                                                onClick={() => removeFile(i)}
                                                                type="button"
                                                                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white text-xs"
                                                            >
                                                                ✖
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="p-3 pb-0">
                                                 <div className="relative">
                                                {privacyActive && !privacyQuery && (
      <div
        className="absolute inset-0 pointer-events-none text-gray-400/80 pl-28 pr-10 pt-[4px] leading-6"
        style={{ whiteSpace: 'pre-wrap' }}
      >
        Upload your zkProof JSON, then type your question here…
      </div>
    )}
                                                <textarea
                                                    ref={inputRef}
                                                    value={inputMessage}
                                                    onChange={handleInputChange}
                                                    onKeyDown={(e) => {
                                                        if (e.key === '/') {
                                                            e.preventDefault();
                                                            setShowCommandPopup(true);
                                                            return;
                                                        }
                                                        if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
                                                            if (!inputMessage.trim()) {
                                                                e.preventDefault()
                                                                return
                                                            }
                                                            e.preventDefault()
                                                            handleSubmit(e)
                                                        }
                                                    }}
                                                   placeholder={
  inputMessage.trim().startsWith('/privacy-ai')
    ? 'Upload your zkProof JSON, then type your question here…'
    : inputMessage.trim().startsWith('/generate-private')
      ? 'Upload PDF/DOC/TXT to generate a private proof…'
      : chainGptMode
        ? 'Ask Web3 AI about crypto, DeFi, NFTs...'
        : dictionary?.inputPlaceholder || 'How can I help you today?'
}

                                                    className={`w-full resize-none overflow-y-auto bg-transparent text-white rounded-lg border-none focus:outline-none ${chainGptMode ? 'placeholder-green-400' : 'placeholder-gray-400'
                                                        }`}
                                                    style={{
                                                        lineHeight: '1.5',
                                                        minHeight: '20px',
                                                        maxHeight: '120px',
                                                        padding: '2px 4px',
                                                        boxSizing: 'border-box',
                                                    }}
                                                    onInput={(e) => {
                                                        const t = e.target as HTMLTextAreaElement
                                                        t.style.height = '40px'
                                                        t.style.height = `${Math.min(t.scrollHeight, 120)}px`
                                                    }}
                                                    disabled={!wallet.connected}
                                                />
                                                </div>
                                                 {privacyActive && privacyProofJson && (
    <div className="mt-2 mb-2 inline-flex items-center gap-2 bg-[#171D3D] border border-[#2B2F5B] px-2 py-1 rounded-md">
      <span className="text-xs text-blue-300">{privacyProofName || 'proof.json'}</span>
      <button
        type="button"
        className="text-xs text-gray-300 hover:text-white underline"
        onClick={() => setShowJsonPreview(true)}
      >
        Preview
      </button>
      <button
        type="button"
        className="text-xs text-gray-300 hover:text-white underline"
        onClick={() => { setPrivacyProofJson(null); setPrivacyProofName(''); }}
      >
        Remove
      </button>
    </div>
  )}
                                                {showCommandPopup && (
    <div
      ref={commandPopupRef}
      className="absolute  left-36 top-0 z-50"
    >
      <CommandPopup onSelect={handleCommandSelect}/>
    </div>
  )}
  {isGenPrivate && privateDocs.length > 0 && (
  <div className="mt-2 mb-2 flex flex-wrap gap-2">
    {privateDocs.map((file, i) => (
      <div key={i} className="inline-flex items-center gap-2 bg-[#171D3D] border border-[#2B2F5B] px-2 py-1 rounded-md">
        <span className="text-xs text-blue-300">{file.name}</span>
        <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
        <button onClick={() => setPrivateDocs(prev => prev.filter((_, idx) => idx !== i))}>
          Remove
        </button>
      </div>
    ))}
  </div>
)}
                                            </div>

                                            <div className="flex items-center justify-between gap-2 px-3 pb-3">
                                                <div className="flex items-center gap-2">
                                                   <input
  id="fileInput"
  type="file"
  onChange={handleFileChange}
  accept={
    isPrivacy
      ? 'application/json'
      : isGenPrivate
      ? 'application/pdf,.txt,.md,.doc,.docx,.rtf'
      : 'image/*,.pdf,video/*,audio/*'
  }
  className="hidden"
  multiple={isGenPrivate}   // allow multiple docs for generate-private
  disabled={!wallet.connected}
/>

                                                    <label
                                                        htmlFor="fileInput"
                                                        className={`flex items-center justify-center rounded-lg p-2 transition-colors ${!wallet.connected
                                                            ? 'opacity-50 cursor-not-allowed bg-gray-800'
                                                            : 'cursor-pointer bg-gray-700 hover:bg-gray-600'
                                                            }`}
                                                        style={{ width: '40px', height: '40px' }}
                                                        title={privacyActive ? 'Upload proof JSON' : 'Attach file'}
                                                    >
                                                        <Image
                                                            src="/images/Attach.svg"
                                                            alt="Attach file"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </label>
                                                    {/* <button
                                                        type="button"
                                                        onClick={() => setShowPluginsPopup(!showPluginsPopup)}
                                                        className={`flex items-center justify-center rounded-lg p-2 transition-colors ${chainGptMode
                                                                ? 'bg-green-700 text-white border border-green-500'
                                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                            }`}
                                                        style={{ width: '70px', height: '40px' }}
                                                        disabled={!wallet.connected}
                                                    >
                                                        <span>Plugins</span>
                                                        {chainGptMode && (
                                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                                        )}
                                                    </button> */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPluginsPopup((v) => !v)}
                                                        className={`
      flex items-center justify-center 
      rounded-lg p-2 transition-colors
      ${chainGptMode
                                                                ? 'bg-green-700 text-white border border-green-500'
                                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
    `}
                                                        style={{ width: 70, height: 40 }}
                                                        disabled={!wallet.connected}
                                                    >
                                                        Plugins
                                                        {chainGptMode && (
                                                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                                        )}
                                                    </button>

                                                    {showPluginsPopup && (
                                                        <div className="absolute bottom-full left-0 mb-2 z-50">
                                                            <PluginsPopup onClose={() => setShowPluginsPopup(false)} />
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="submit"
                                                    className={`flex items-center justify-center rounded-lg p-2 font-bold transition-colors ${chainGptMode
                                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                                        : 'bg-white text-black hover:bg-gray-100'
                                                        }`}
                                                    style={{ width: '40px', height: '40px' }}
                                                    disabled={isLoading || !wallet.connected || !inputMessage.trim()}
                                                >
                                                    <BsArrowReturnLeft size={16} />
                                                </button>
                                            </div>

                                 

                                            {showImageSelectModal && selectedImage && (
                                                <ImageSelectionModal
                                                    imageUrl={selectedImage}
                                                    onClose={() => {
                                                        setShowImageSelectModal(false)
                                                        setSelectedImage(null)
                                                    }}
                                                />
                                            )}

                                            {showVideoEditModal && videoToEdit && (
                                                <VideoEditModal
                                                    videoUrl={videoToEdit}
                                                    onClose={() => setShowVideoEditModal(false)}
                                                    onSaveTrimmed={handleSaveTrimmed}
                                                    onSaveCaption={handleSaveCaption}
                                                />
                                            )}

                                        </form>
                                    </div>
                                </footer>

                            </>
                        )}
                        {/* {isMobile && activeMobileTab === 'prediction' && (
                            <div className="flex-grow overflow-y-auto p-4 ">
                                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 text-white border border-gray-700 shadow-2xl w-full mx-auto">
                                    <div className="flex flex-col items-start">
                                        <div className="">
                                            <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                                PREDICTION REPORT
                                            </h2>
                                            <p className="text-gray-300 text-xs mb-8 leading-relaxed">
                                                Checkout the latest trends,
                                                analyze the trading signals and
                                                trade smarter
                                            </p>
                                        </div>
                                        <div>
                                            <div className="flex flex-row items-center justify-center">
                                                <p className="text-xs">CLICK TO VIEW</p>
                                                <div className="ml-1 flex items-center">
                                                    <button onClick={openReport}>
                                                        <Image
                                                            src="images/RightArrow.svg"
                                                            alt="logo"
                                                            width={40}
                                                            height={40}
                                                            className='p-2'
                                                        />
                                                    </button>
                                                    {reportData && (
                                                        <ReportSidebar
                                                            isOpen={isReportOpen}
                                                            onClose={() => setIsReportOpen(false)}
                                                            data={reportData}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )} */}
                        {isMobile && activeMobileTab === 'prediction' && (
                            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                                {/* Current Prediction Report Card (Your existing card) */}
                                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 text-white border border-gray-700 shadow-2xl w-full mx-auto" onClick={openReport}>
                                    <div className="prediction-card flex flex-col items-start">
                                        <div className="">
                                            <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                                PREDICTION REPORT
                                            </h2>
                                            <p className="text-gray-300 text-xs mb-8 leading-relaxed">
                                                Checkout the latest trends,
                                                analyze the trading signals and
                                                trade smarter
                                            </p>
                                        </div>
                                        <div>
                                            <div className="flex flex-row items-center justify-center" >
                                                <p className="text-xs">CLICK TO VIEW</p>
                                                <div className="ml-1 flex items-center">
                                                    <button >
                                                        <Image
                                                            src="images/RightArrow.svg"
                                                            alt="logo"
                                                            width={40}
                                                            height={40}
                                                            className='p-2'
                                                        />
                                                    </button>
                                                    {/* {reportData && (
                                                        <ReportSidebar
                                                            isOpen={isReportOpen}
                                                            onClose={() => setIsReportOpen(false)}
                                                            data={reportData}
                                                        />
                                                    )} */}
                                                    {showSubscriptionModal && (
                                                        <ReportPaymentModal
                                                            isOpen={showSubscriptionModal}
                                                            onClose={() => setShowSubscriptionModal(false)}
                                                            receivingWallet="0x01e919a01a7beff155bcEa5F42eF140881EF5E3a"
                                                            connectedWallet={publicKey?.toString()}
                                                            onPaymentSuccess={async (planId, orderData, usdAmount) => {
                                                                // 1) hide the payment modal
                                                                setShowSubscriptionModal(false)

                                                                if (!rawPubkey) {
                                                                    console.error("No wallet connected!");
                                                                    return;
                                                                }

                                                                const walletAddress = rawPubkey.toString();
                                                                // 2) re-check subscription in your store so the app "knows" they’re paid
                                                                await checkSubscription(walletAddress)
                                                                // 3) directly show the report panel
                                                                // openReport()

                                                                // 4) (fallback) if your UI still doesn’t render, do a full reload:
                                                                // window.location.reload()
                                                                // or
                                                                // router.reload()
                                                            }}
                                                        // isMobile={isMobile} // Pass mobile flag
                                                        />

                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Past Predictions Section */}
                                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 text-white border border-gray-700 shadow-2xl">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                            PAST PREDICTIONS
                                        </h3>
                                        <p className="text-gray-300 text-xs">
                                            View historical prediction reports
                                        </p>
                                    </div>

                                    <PastPredictions
                                        onViewReport={(pastData) => {
                                            setReportData(pastData);
                                            setIsReportOpen(true);
                                        }}
                                        isMobile={true}
                                    />
                                </div>
                            </div>
                        )}
                       {isMobile && (
  <div className="fixed bottom-0 left-0 right-0 h-14  /* 3.5rem = 56px */
                      flex bg-[#08121f] border-t border-gray-600 z-40
                      pb-[env(safe-area-inset-bottom)]">
    <button
      className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
        activeMobileTab === 'zkterminal'
          ? 'bg-[#171D3D] text-white border-b-2 border-blue-400'
          : 'text-gray-400 hover:text-white'
      }`}
      onClick={() => setActiveMobileTab('zkterminal')}
    >
      ZkTerminal
    </button>
    <button
      className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
        activeMobileTab === 'prediction'
          ? 'bg-[#171D3D] text-white border-b-2 border-blue-400'
          : 'text-gray-400 hover:text-white'
      }`}
      onClick={() => setActiveMobileTab('prediction')}
    >
      Prediction
    </button>
  </div>
)}


                    </div >
                    {/* ┌──────────────  “NEWS” SIDEBAR ───────────────┐ */}
                    {/* <div className="hidden lg:block w-64 max-h-[730px] overflow-y-auto p-2 border border-white rounded-lg">
                        <NewsSidebar />
                    </div> */}

                    {!isMobile && (
                        <div className="hidden lg:block w-72 max-h-[730px] overflow-y-auto p-2 rounded-md space-y-4">
                            {/* Current Prediction Report Card (Your existing card) */}
                            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 text-white max-w-2xl border border-gray-700 shadow-2xl" onClick={openReport}>
                                <div className="flex flex-col items-start" >
                                    <div className="">
                                        <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                            PREDICTION REPORT
                                        </h2>
                                        <p className="text-gray-300 text-xs mb-8 leading-relaxed">
                                            Checkout the latest trends,
                                            analyze the trading signals and
                                            trade smarter
                                        </p>
                                    </div>
                                    <div>
                                        <div className="flex flex-row items-center justify-center">
                                            <p className="text-xs">CLICK TO VIEW</p>
                                            <div className="ml-1 flex items-center">
                                                <button  >
                                                    <Image
                                                        src="images/RightArrow.svg"
                                                        alt="logo"
                                                        width={40}
                                                        height={40}
                                                        className='p-2'
                                                    />
                                                </button>
                                                {/* {reportData && (
                                                    <ReportSidebar
                                                        isOpen={isReportOpen}
                                                        onClose={() => setIsReportOpen(false)}
                                                        data={reportData}
                                                    />
                                                )} */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Past Predictions Section */}
                            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 text-white border border-gray-700 shadow-2xl">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                        PAST PREDICTIONS
                                    </h3>
                                    <p className="text-gray-300 text-xs">
                                        View historical prediction reports
                                    </p>
                                </div>

                                <div className="max-h-[500px] overflow-y-auto">
                                    <PastPredictions
                                        onViewReport={(pastData) => {
                                            setReportData(pastData);
                                            setIsReportOpen(true);
                                        }}
                                        isMobile={false}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                </div >
            </div >

      {/* ZEE entry modal */}
{flowGateOpen && <FlowGate />}
{pickerOpen && <AgentPicker />}

{formOpen && <CreateAgentModal/>}



<JsonPreviewModal
  open={showJsonPreview}
  onClose={() => setShowJsonPreview(false)}
  json={privacyProofJson}
/>
            {/* <CreateAgentModal
                visible={showCreateAgentModal}
                onClose={() => setShowCreateAgentModal(false)}
                onAgentTypeSelect={handleAgentTypeSelect}
            /> */}

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