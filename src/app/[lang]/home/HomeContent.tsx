'use client';
import { FC, useState, useEffect, useRef, ReactNode } from 'react';
import { toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter, useParams } from 'next/navigation';
import { useModelStore } from '@/stores/useModel-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useAgentCart } from '@/stores/agent-cart-store';
import { useConversationStore } from '@/stores/conversation-store';
import { useMedicalProofStore } from '@/stores/medical-proof-store';
import { FullReportData, CryptoNewsItem, MacroNewsItem, HourlyForecast } from '@/types/types';
import { dummyReportData } from '@/data/dummyReportData';

// Components
import ZkTerminal from '@/component/ZkTerminal/ZkTerminal';
import SwarmCreationModal from '@/component/zee/SwarmCreationModal';
import ReportSidebar from '@/component/ui/ReportSidebar';
import SubscriptionModal from '@/component/ui/SubscriptionModal';
import PastPredictions from '@/component/ui/PastPredictions';
import VideoAgentModal from '@/component/ui/VideoAgentModal';

interface Message {
  role: 'user' | 'assistant';
  content: string | ReactNode;
  type?: 'text' | 'image' | 'command';
  command?: string;
}

interface HourlyEntryLocal {
  time: string;
  signal: 'LONG' | 'SHORT' | 'HOLD';
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  forecast_price: number;
  current_price: number;
  deviation_percent: number;
  accuracy_percent: number;
  risk_reward_ratio: number;
  sentiment_score: number;
  confidence_50: [number, number];
  confidence_80: [number, number];
  confidence_90: [number, number];
}

interface PastPredictionData {
  fetched_date: string;
  crypto_news: Array<{
    news_id: string;
    title: string;
    link: string;
    analysis: string;
    sentimentScore?: number;
    sentimentTag?: 'bearish' | 'neutral' | 'bullish';
    advice?: 'Buy' | 'Hold' | 'Sell';
    reason?: string;
    rationale?: string;
  }>;
  macro_news: Array<{
    news_id: string;
    title: string;
    link: string;
    description?: string;
    analysis: string;
    sentimentScore?: number;
    sentimentTag?: 'bearish' | 'neutral' | 'bullish';
    advice?: 'Buy' | 'Hold' | 'Sell';
    reason?: string;
    rationale?: string;
  }>;
  hourlyForecast?: HourlyEntryLocal[] | {
    BTC: HourlyEntryLocal[];
    ETH: HourlyEntryLocal[];
    SOL: HourlyEntryLocal[];
  };
}

const API_KEYS_URL = "https://zynapse.zkagi.ai/get-api-keys-by-wallet";
const BALANCE_API_URL = "https://zynapse.zkagi.ai/v1/check-balance";
const API_KEY = "zk-123321";

const HomeContent: FC = () => {
  const params = useParams();
  const lang = params.lang as string || 'en';
  const router = useRouter();
  const wallet = useWallet();
  const { connected, publicKey } = useWallet();
  const rawPubkey = publicKey;

  // Stores
  const { credits, setCredits, setApiKey, apiKey } = useModelStore();
  const { isSubscribed, checkSubscription } = useSubscriptionStore();
  const { flowGateOpen } = useAgentCart();
  const { messages, addMessage, setMessages } = useConversationStore();

  // Local state
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);
  const [pastPredictionsError, setPastPredictionsError] = useState<string | null>(null);

  // Report state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState<FullReportData | PastPredictionData | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showVideoAgent, setShowVideoAgent] = useState(false);

  // Initialize credits
  useEffect(() => {
    const initializeCredits = async () => {
      if (!rawPubkey) {
        setCredits(0);
        setIsLoadingCredits(false);
        return;
      }

      try {
        setIsLoadingCredits(true);

        const keysResponse = await fetch(API_KEYS_URL, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "api-key": API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ wallet_address: rawPubkey.toString() }),
        });

        if (!keysResponse.ok) throw new Error("Failed to fetch API keys");

        const keysData = await keysResponse.json();
        const keys = keysData.api_keys || [];

        if (keys.length === 0) {
          setCredits(0);
          setIsLoadingCredits(false);
          return;
        }

        const firstApiKey = keys[0];
        setApiKey(firstApiKey);

        const balanceResponse = await fetch(BALANCE_API_URL, {
          method: "GET",
          headers: {
            "Accept": "*/*",
            "Authorization": `Bearer ${firstApiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!balanceResponse.ok) throw new Error("Failed to fetch balance");

        const balanceData = await balanceResponse.json();
        setCredits(balanceData.credit_balance || 0);
      } catch (error) {
        console.error("Error initializing credits:", error);
        setCredits(0);
      } finally {
        setIsLoadingCredits(false);
      }
    };

    initializeCredits();
  }, [rawPubkey, setCredits, setApiKey]);

  // Check subscription
  useEffect(() => {
    if (publicKey) {
      checkSubscription(publicKey.toString());
    }
  }, [publicKey, checkSubscription]);

  const normalizeSentiment = (score: number): 'bearish' | 'neutral' | 'bullish' => {
    if (score <= 1.6) return 'bearish';
    if (score <= 3.3) return 'neutral';
    return 'bullish';
  };

  const handleOpenReport = async () => {
    if (!isSubscribed) {
      setShowSubscriptionModal(true);
      return;
    }

    try {
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

      const forecastTodayHourly = {
        BTC: mapHourly(raw.forecast_today_hourly?.BTC || []),
        ETH: mapHourly(raw.forecast_today_hourly?.ETH || []),
        SOL: mapHourly(raw.forecast_today_hourly?.SOL || [])
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
        forecastTodayHourly,
      };

      setReportData(report);
      setIsReportOpen(true);
    } catch (error) {
      console.error('Error fetching report:', error);
      setPastPredictionsError('Failed to fetch prediction report');
    }
  };

  // Helper: stream chat response from /api/chat
  const streamChatResponse = async (body: Record<string, unknown>) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Chat API error: ${response.status}`);
      }

      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  // Helper: read SSE image response from /api/chat directCommand
  const readImageStream = async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder('utf-8');
    let done = false;
    let finalEvent: any = null;
    let buffer = '';

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice('data: '.length).trim();
            if (!jsonStr) continue;
            try {
              const event = JSON.parse(jsonStr);
              if (event.content && event.type === 'img') {
                finalEvent = event;
              }
            } catch { /* skip invalid JSON */ }
          }
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim().startsWith('data: ')) {
      const jsonStr = buffer.trim().slice('data: '.length).trim();
      try {
        const event = JSON.parse(jsonStr);
        if (event.content && event.type === 'img') finalEvent = event;
      } catch { /* skip */ }
    }

    return finalEvent;
  };

  const handleSendMessage = async (message: string, command?: string) => {
    if (!message.trim()) return;

    const fullMessage = message.trim();

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      type: command ? 'command' : 'text',
      command,
    };
    setDisplayMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // ── /swarm or /create-swarm ──
      if (command === '/swarm' || fullMessage.startsWith('/create-swarm') || fullMessage.startsWith('/swarm')) {
        useAgentCart.getState().setFlowGateOpen(true);
        setIsLoading(false);
        return;
      }

      // ── /analyze ──
      if (command === '/analyze' || fullMessage.startsWith('/analyze')) {
        setIsLoading(false);
        handleOpenReport();
        return;
      }

      // ── /image-gen ──
      if (command === '/image-gen' || fullMessage.startsWith('/image-gen')) {
        const prompt = fullMessage.replace(/^\/image-gen\s*/, '').trim();
        if (!prompt) {
          setDisplayMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Please provide a prompt for image generation. Usage: /image-gen your prompt here',
            type: 'text'
          }]);
          setIsLoading(false);
          return;
        }

        const { credits: currentCredits, apiKey: currentApiKey } = useModelStore.getState();
        try {
          const response = await streamChatResponse({
            selectedModel: 'Mistral',
            credits: currentCredits,
            apiKey: currentApiKey,
            messages: [{ role: 'user', content: fullMessage }],
            directCommand: { type: 'image-gen', prompt },
          });

          const finalEvent = await readImageStream(response);

          if (finalEvent) {
            setDisplayMessages(prev => [...prev, {
              role: 'assistant',
              content: finalEvent.content,
              type: 'image',
              command: 'image-gen',
            }]);
          } else {
            setDisplayMessages(prev => [...prev, {
              role: 'assistant',
              content: 'Image generation completed but no image was received.',
              type: 'text',
            }]);
          }
        } catch (err: any) {
          console.error('Image generation error:', err);
          setDisplayMessages(prev => [...prev, {
            role: 'assistant',
            content: `Error generating image: ${err.message}`,
            type: 'text',
          }]);
        }
        setIsLoading(false);
        return;
      }

      // ── /mint ──
      if (command === '/mint' || fullMessage.startsWith('/mint')) {
        const prompt = fullMessage.replace(/^\/mint\s*/, '').trim();
        if (!prompt) {
          setDisplayMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Please provide a prompt for NFT minting. Usage: /mint your prompt here',
            type: 'text',
          }]);
          setIsLoading(false);
          return;
        }

        const { credits: currentCredits, apiKey: currentApiKey } = useModelStore.getState();
        try {
          const response = await streamChatResponse({
            selectedModel: 'Mistral',
            credits: currentCredits,
            apiKey: currentApiKey,
            messages: [{ role: 'user', content: fullMessage }],
            directCommand: { type: 'image-gen', prompt },
          });

          const finalEvent = await readImageStream(response);

          if (finalEvent) {
            setDisplayMessages(prev => [...prev, {
              role: 'assistant',
              content: finalEvent.content,
              type: 'image',
              command: 'image-gen',
            }]);
          } else {
            setDisplayMessages(prev => [...prev, {
              role: 'assistant',
              content: 'Mint image generation completed but no image was received.',
              type: 'text',
            }]);
          }
        } catch (err: any) {
          console.error('Mint error:', err);
          setDisplayMessages(prev => [...prev, {
            role: 'assistant',
            content: `Error minting: ${err.message}`,
            type: 'text',
          }]);
        }
        setIsLoading(false);
        return;
      }

      // ── /video-gen ──
      if (command === '/video-gen' || fullMessage.startsWith('/video-gen')) {
        const prompt = fullMessage.replace(/^\/video-gen\s*/, '').trim();
        if (!prompt) {
          setDisplayMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Please provide a prompt for video generation. Usage: /video-gen your prompt here',
            type: 'text',
          }]);
          setIsLoading(false);
          return;
        }

        try {
          const { apiKey: currentApiKey, credits: currentCredits } = useModelStore.getState();
          const response = await fetch('/api/video-gen', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': currentApiKey || '',
              'x-current-credits': currentCredits.toString(),
            },
            body: JSON.stringify({ prompt }),
          });

          if (!response.ok) throw new Error(await response.text() || 'Video generation failed');

          const contentType = response.headers.get('content-type');
          if (contentType?.includes('video/mp4')) {
            const videoBlob = await response.blob();
            const videoUrl = URL.createObjectURL(videoBlob);
            setDisplayMessages(prev => [...prev, {
              role: 'assistant',
              content: videoUrl,
              type: 'text',
              command: 'video-gen',
            }]);
          } else {
            const data = await response.json();
            setDisplayMessages(prev => [...prev, {
              role: 'assistant',
              content: data.videoUrl || data.message || 'Video generated successfully.',
              type: 'text',
            }]);
          }
        } catch (err: any) {
          console.error('Video generation error:', err);
          setDisplayMessages(prev => [...prev, {
            role: 'assistant',
            content: `Error generating video: ${err.message}`,
            type: 'text',
          }]);
        }
        setIsLoading(false);
        return;
      }

      // ── /api ──
      if (command === '/api' || fullMessage.startsWith('/api')) {
        try {
          const walletAddress = publicKey?.toString() ?? '';
          if (!walletAddress) {
            setDisplayMessages(prev => [...prev, {
              role: 'assistant',
              content: 'Please connect your wallet first to generate an API key.',
              type: 'text',
            }]);
            setIsLoading(false);
            return;
          }

          const headersList = {
            'Accept': '*/*',
            'api-key': 'zk-123321',
            'Content-Type': 'application/json',
          };
          const bodyContent = JSON.stringify({ wallet_address: walletAddress });

          const addUserResponse = await fetch('https://zynapse.zkagi.ai/add-user', {
            method: 'POST',
            body: bodyContent,
            headers: headersList,
          });
          const addUserData = await addUserResponse.json();

          let generatedKey = '';

          if (addUserResponse.status === 200 && addUserData.api_keys?.length > 0) {
            generatedKey = addUserData.api_keys[0];
          } else if (addUserResponse.status === 400 && addUserData.detail === 'User already exists') {
            const genRes = await fetch('https://zynapse.zkagi.ai/generate-api-key', {
              method: 'POST',
              body: bodyContent,
              headers: headersList,
            });
            const genData = await genRes.json();
            if (genData.api_key) {
              generatedKey = genData.api_key;
            }
          }

          if (generatedKey) {
            setDisplayMessages(prev => [...prev, {
              role: 'assistant',
              content: `Your Zynapse API Key:\n\n\`${generatedKey}\`\n\nSave this key securely. You can use it to access ZkAGI APIs.`,
              type: 'text',
            }]);
          } else {
            setDisplayMessages(prev => [...prev, {
              role: 'assistant',
              content: 'Could not generate API key. Please try again.',
              type: 'text',
            }]);
          }
        } catch (err: any) {
          console.error('API key generation error:', err);
          setDisplayMessages(prev => [...prev, {
            role: 'assistant',
            content: `Error generating API key: ${err.message}`,
            type: 'text',
          }]);
        }
        setIsLoading(false);
        return;
      }

      // ── /zk-prove or /generate-private ──
      if (command === '/zk-prove' || command === '/generate-private' ||
          fullMessage.startsWith('/zk-prove') || fullMessage.startsWith('/generate-private')) {
        setDisplayMessages(prev => [...prev, {
          role: 'assistant',
          content: 'To generate a ZK proof, please upload your files (PDF/DOC/TXT) using the attachment button, then run this command again. The system will create a private knowledge base and generate zero-knowledge proofs for your documents.',
          type: 'text',
        }]);
        setIsLoading(false);
        return;
      }

      // ── /privacy-ai ──
      if (command === '/privacy-ai' || fullMessage.startsWith('/privacy-ai')) {
        const query = fullMessage.replace(/^\/privacy-ai\s*/, '').trim();
        if (!query) {
          setDisplayMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Please provide a question after /privacy-ai. Upload a zkProof JSON file first, then ask your question.',
            type: 'text',
          }]);
          setIsLoading(false);
          return;
        }

        setDisplayMessages(prev => [...prev, {
          role: 'assistant',
          content: 'To use Privacy AI, please upload a zkProof JSON file using the attachment button, then run /privacy-ai with your question.',
          type: 'text',
        }]);
        setIsLoading(false);
        return;
      }

      // ── /medical-proof-create ──
      if (command === '/medical-proof-create' || fullMessage.startsWith('/medical-proof-create')) {
        try {
          const walletAddress = publicKey?.toString() ?? '';
          if (!walletAddress) {
            setDisplayMessages(prev => [...prev, {
              role: 'assistant',
              content: 'Please connect your wallet first.',
              type: 'text',
            }]);
            setIsLoading(false);
            return;
          }

          const res = await fetch('/api/medical-proof/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet_address: walletAddress }),
          });

          if (!res.ok) throw new Error('Failed to create medical proof session');
          const data = await res.json();

          useMedicalProofStore.getState().setKbId(data.kb_id);

          setDisplayMessages(prev => [...prev, {
            role: 'assistant',
            content: `Medical knowledge base created successfully!\n\nKB ID: \`${data.kb_id}\`\n\nYou can now upload medical files and generate proofs. Use the attachment button to upload files, then run /medical-proof-create again.`,
            type: 'text',
          }]);
        } catch (err: any) {
          console.error('Medical proof create error:', err);
          setDisplayMessages(prev => [...prev, {
            role: 'assistant',
            content: `Error creating medical proof: ${err.message}`,
            type: 'text',
          }]);
        }
        setIsLoading(false);
        return;
      }

      // ── /medical-proof-verify ──
      if (command === '/medical-proof-verify' || fullMessage.startsWith('/medical-proof-verify')) {
        const { currentKbId: kbId } = useMedicalProofStore.getState();
        if (!kbId) {
          setDisplayMessages(prev => [...prev, {
            role: 'assistant',
            content: 'No active medical KB session. Please run `/medical-proof-create` first, then paste your Proof ID.',
            type: 'text',
          }]);
          setIsLoading(false);
          return;
        }

        useMedicalProofStore.getState().setAwaitingProofId(true);
        setDisplayMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Please paste your **Proof ID** (UUID format) to start a verification session.\n\nYou can find your Proof ID in the success message from `/generate-private` or `/medical-proof-create`.',
          type: 'text',
        }]);
        setIsLoading(false);
        return;
      }

      // ── Default: send to chat API for AI response ──
      const { selectedModel, credits: currentCredits, apiKey: currentApiKey } = useModelStore.getState();

      const response = await streamChatResponse({
        messages: [...displayMessages, userMessage].map(m => ({
          role: m.role,
          content: typeof m.content === 'string' ? m.content : '',
        })),
        selectedModel: selectedModel || 'DeepSeek',
        credits: currentCredits,
        apiKey: currentApiKey,
      });

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        // Add placeholder assistant message
        setDisplayMessages(prev => [...prev, {
          role: 'assistant',
          content: '',
          type: 'text'
        }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          // Update the last message in place
          setDisplayMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: fullResponse,
              type: 'text'
            };
            return updated;
          });
        }
      }

      if (!fullResponse) {
        setDisplayMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'No response received.',
            type: 'text'
          };
          return updated;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to get response', {
        description: errMsg,
      });
      setDisplayMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, there was an error processing your request: ${errMsg}`,
        type: 'text'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (command: string) => {
    if (command === 'create-swarm') {
      useAgentCart.getState().setFlowGateOpen(true);
    } else if (command === 'video-agent') {
      setShowVideoAgent(true);
    } else if (command === 'analyze') {
      handleOpenReport();
    } else if (command === 'image-gen') {
      // Will be triggered via ZkTerminal input
    } else if (command === 'generate-private') {
      // Will be triggered via ZkTerminal input
    } else if (command === 'privacy-ai') {
      // Will be triggered via ZkTerminal input
    }
  };

  const handleRetryPastPredictions = () => {
    setPastPredictionsError(null);
    handleOpenReport();
  };

  const handleViewPastReport = (day: PastPredictionData) => {
    if (!isSubscribed) {
      setShowSubscriptionModal(true);
      return;
    }
    // Process the past prediction day data so ReportSidebar can render it
    const processedDay: PastPredictionData = {
      fetched_date: day.fetched_date,
      hourlyForecast: day.hourlyForecast,
      crypto_news: day.crypto_news.map(n => {
        let parsed: any = {};
        // Try JSON block
        const jsonBlock = n.analysis?.match(/```json\s*([\s\S]*?)```/);
        if (jsonBlock) {
          try { parsed = JSON.parse(jsonBlock[1]); } catch { /* skip */ }
        }
        // Try direct JSON
        if (!parsed.sentiment_score && n.analysis) {
          try {
            const direct = JSON.parse(n.analysis);
            if (direct && typeof direct === 'object') parsed = direct;
          } catch { /* plain text */ }
        }
        const score = parsed.sentiment_score ?? parsed.sentimentScore ?? 0;
        return {
          ...n,
          sentimentScore: typeof score === 'number' ? (score > 5 ? score / 20 : score) : 0,
          sentimentTag: normalizeSentiment(typeof score === 'number' ? (score > 5 ? score / 20 : score) : 0),
          advice: (parsed.investment?.advice || 'Hold') as 'Buy' | 'Hold' | 'Sell',
          reason: parsed.investment?.reason || '',
          rationale: parsed.rationale || '',
        };
      }),
      macro_news: day.macro_news.map(n => {
        let parsed: any = {};
        const jsonBlock = n.analysis?.match(/```json\s*([\s\S]*?)```/);
        if (jsonBlock) {
          try { parsed = JSON.parse(jsonBlock[1]); } catch { /* skip */ }
        }
        if (!parsed.sentiment_score && n.analysis) {
          try {
            const direct = JSON.parse(n.analysis);
            if (direct && typeof direct === 'object') parsed = direct;
          } catch { /* plain text */ }
        }
        const score = parsed.sentiment_score ?? parsed.sentimentScore ?? 0;
        return {
          ...n,
          sentimentScore: typeof score === 'number' ? (score > 5 ? score / 20 : score) : 0,
          sentimentTag: normalizeSentiment(typeof score === 'number' ? (score > 5 ? score / 20 : score) : 0),
          advice: (parsed.investment?.advice || 'Hold') as 'Buy' | 'Hold' | 'Sell',
          reason: parsed.investment?.reason || '',
          rationale: parsed.rationale || '',
        };
      }),
    };
    setReportData(processedDay);
    setIsReportOpen(true);
  };

  return (
    <div className="relative">
      <ZkTerminal
        onSendMessage={handleSendMessage}
        onCardClick={handleCardClick}
        onOpenReport={handleOpenReport}
        onViewPastReport={handleViewPastReport}
        isLoading={isLoading}
        messages={displayMessages}
        pastPredictionsError={pastPredictionsError}
        onRetryPastPredictions={handleRetryPastPredictions}
      />

      {/* Swarm Creation Modal */}
      {flowGateOpen && <SwarmCreationModal />}

      {/* Video Agent Modal */}
      <VideoAgentModal
        isOpen={showVideoAgent}
        onClose={() => setShowVideoAgent(false)}
      />

      {/* Report Sidebar */}
      {reportData && (
        <ReportSidebar
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          data={reportData}
        />
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          treasuryWallet="8jgNmNZ5ig9jPyYw1acGj8MsGbAFvPR8RqunPdNByoqm"
          onSubscriptionSuccess={async (planId, orderData, usdAmount) => {
            setShowSubscriptionModal(false);
            if (publicKey) {
              await checkSubscription(publicKey.toString());
              handleOpenReport();
            }
          }}
          onSingleReportSuccess={async (orderData, usdAmount) => {
            setShowSubscriptionModal(false);
            if (publicKey) {
              await checkSubscription(publicKey.toString());
              handleOpenReport();
            }
          }}
        />
      )}
    </div>
  );
};

export default HomeContent;
