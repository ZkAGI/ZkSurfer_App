import { FC, useEffect, useRef, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import Image from 'next/image';
import { FullReportData } from '@/types/types';
import NewsCard from '@/component/ui/NewsCard';
import Gauge from '@/component/ui/Gauge';
import PriceChart from '@/component/ui/PriceChart';
import HourlyPredictionsTable from './HourelyForecast';
import { Trade, TradingIntegration } from './TradingIntegration';
import { getOrderStatus, placeTestOrder } from '@/lib/hyperLiquidClient';
import { PlaceOrderBody } from '@/lib/hlTypes';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';

interface HourlyEntry {
  time: string;                       // e.g. "2025-07-17T00:00:00+00:00"
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

// New interface for past prediction data
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
    // hourlyForecast?: HourlyEntry[];
    hourlyForecast?: HourlyEntry[] | {
        BTC: HourlyEntry[];
        ETH: HourlyEntry[];
        SOL: HourlyEntry[];
    };
}

interface ReportSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    data: FullReportData | PastPredictionData | null;
}

const ReportSidebar: FC<ReportSidebarProps> = ({ isOpen, onClose, data }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [btcPrice, setBtcPrice] = useState<number | null>(null);
    const [btcChange, setBtcChange] = useState<number | null>(null);
    const [loadingBtc, setLoadingBtc] = useState(true);

    const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'ETH' | 'SOL'>('BTC');

    const { publicKey } = useWallet();
const uid = publicKey?.toBase58() ?? '';



//     const BTC_ASSET_ID = 0;          // <-- replace with real id (see /meta call)
// const USD_CAP = 100;             // max notional you want to risk
// const LOT_SIZE = 0.001;          // adjust to HL tick/lot size for BTC
// const roundLot = (x: number) => (Math.floor(x / LOT_SIZE) * LOT_SIZE).toFixed(3);

// function calcSize(price: number) {
//   return roundLot(USD_CAP / price); // simple $ cap sizing
// }

const BTC_ASSET_ID = 0;
const USD_CAP = 600;             // Your $100 test amount
const LOT_SIZE = 0.00001;        // Use very small lot size (5 decimals)
const MIN_ORDER_SIZE = 0.0001;   // Hyperliquid minimum (ensure this is correct)

// 🎯 Dynamic leverage based on performance
const [dayPnL, setDayPnL] = useState({ profit: 0, loss: 0 });

const roundLot = (x: number) => {
  // Calculate lots and ensure we get at least the minimum
  const lots = Math.max(Math.floor(x / LOT_SIZE), Math.ceil(MIN_ORDER_SIZE / LOT_SIZE));
  return lots * LOT_SIZE;
};


// useEffect(() => {
//   async function loadTrades() {
//     try {
//       const wallet = process.env.NEXT_PUBLIC_HL_MAIN_WALLET!;
//       const res = await fetch(`/api/hl/trades?wallet=${wallet}`);
//       const { trades, summary } = await res.json();
//       console.log('HP trade history', trades);
//       console.log('HP trade summary', summary);
      
//       // Extract daily P&L for dynamic leverage calculation
//       if (summary) {
//   setDayPnL({
//     profit: summary.realizedPnl ? Math.max(0, summary.realizedPnl) : 0,
//     loss: summary.realizedLoss || 0
//   });
// }
//     } catch (e) {
//       console.error('Failed to load trades', e);
//     }
//   }
//   loadTrades();
// }, []);

// function calcSize(price: number) {
//   const rawSize = USD_CAP / price;
//   const size = roundLot(rawSize);
//   return size.toFixed(5); // 5 decimals for precision
// }

const BASE_USD_CAP = 500

// function calcSize(price: number, leverage: number = 1) {
//   const effectiveCapital = BASE_USD_CAP * leverage;
//   const rawSize = effectiveCapital / price;
//   const size = roundLot(rawSize);
//   return size.toFixed(5);
// }

const [availableMargin, setAvailableMargin] = useState<number>(0);

useEffect(() => {
  async function loadMargin() {
    try {
      const res = await fetch('/api/hl/margin');
      const json = await res.json();
      setAvailableMargin(json.availableMargin);
    } catch (e) {
      console.error('could not load margin', e);
    }
  }
  loadMargin();
}, []);


function calcSize(price: number, leverage: number = 1) {
  // 1) maximum notional you can open on‑chain
  const maxNotional = availableMargin * leverage;

  // 2) cap by your strategy's base USD cap
  const strategyNotional = Math.min(BASE_USD_CAP * leverage, maxNotional);

  // 3) convert dollars to coins
  const rawSize = strategyNotional / price;
  const lots = roundLot(rawSize);
  return lots.toFixed(5);
}




function getRiskMetrics(price: number, size: string, leverage: number) {
  const sizeNum = parseFloat(size);
  const notionalValue = sizeNum * price;
  const actualRisk = notionalValue / leverage;
  const requiredMargin = actualRisk;
  
  return {
    notionalValue,
    actualRisk,
    requiredMargin,
    leverage
  };
}

// Calculate dynamic leverage based on daily performance
function calculateDynamicLeverage(dailyProfit: number, dailyLoss: number, signalConfidence?: number) {
  const baseLeverage = 10; // Your preferred base leverage
  
  // Rule 1: If close to daily target ($100), reduce leverage to preserve gains
  if (dailyProfit >= 80) {
    return Math.max(5, baseLeverage - 5); // Reduce to 5x when close to target
  }
  
  // Rule 2: If significant daily loss, reduce leverage to limit risk
  if (dailyLoss >= 100) {
    return Math.max(3, baseLeverage - 7); // Reduce to 3x when loss is high
  }
  
  // Rule 3: If doing well (profit > 40), slightly increase leverage
  if (dailyProfit >= 40 && dailyLoss <= 20) {
    return Math.min(15, baseLeverage + 5); // Increase to 15x when performing well
  }
  
  // Rule 4: If early in day and no major losses, use base leverage
  if (dailyLoss <= 30) {
    return baseLeverage; // Stay at 10x
  }
  
  // Rule 5: If moderate losses, slightly reduce leverage
  if (dailyLoss >= 50 && dailyLoss < 100) {
    return Math.max(7, baseLeverage - 3); // Reduce to 7x
  }
  
  // Default to base leverage
  return baseLeverage;
}

     const [latest, setLatest] = useState<{
    deviation_percent?: number | string;
    overall_accuracy_percent?: number | string;
  } | null>(null);

    const [trades, setTrades] = useState<Trade[]>([]);

     const [placing, setPlacing] = useState(false);

  // 2️⃣ Fetch it once on mount
  useEffect(() => {
    fetch("/api/past-prediction", {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
      .then(r => r.json())
      .then(past => {
        const entry = past.latest_forecast?.[0];
        setLatest({
          deviation_percent: entry?.deviation_percent,
          overall_accuracy_percent: entry?.overall_accuracy_percent
        });
      })
      .catch(console.error);
  }, []);

  const firstFc = latest;
  const rawAcc = firstFc?.overall_accuracy_percent;

    // Check if data is past prediction data
    const isPastData = (data: any): data is PastPredictionData => {
        return data && 'fetched_date' in data && !('predictionAccuracy' in data);
    };

    // Transform past data to current format
    const transformPastDataToCurrentFormat = (pastData: PastPredictionData): FullReportData => {
        const allNews = [...pastData.crypto_news, ...pastData.macro_news];
        const sentimentScores = allNews
            .map(item => item.sentimentScore)
            .filter((score): score is number => score !== undefined && score !== null);
        
        const avgSentiment = sentimentScores.length > 0 
            ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length 
            : 2.5;

        // Determine market sentiment based on average score
        const getMarketSentiment = (score: number): 'bullish' | 'bearish' => {
            return score > 3.2 ? 'bullish' : 'bearish';
        };

        // Determine volatility level
        const getVolatility = (): 'low' | 'moderate' | 'high' => {
            // You can customize this logic based on your requirements
            return 'moderate';
        };

        let forecastTodayHourly: { BTC: HourlyEntry[]; ETH: HourlyEntry[]; SOL: HourlyEntry[] };

        if (Array.isArray(pastData.hourlyForecast)) {
        // Old format - put it in BTC by default
        forecastTodayHourly = {
            BTC: pastData.hourlyForecast,
            ETH: [],
            SOL: []
        };
    } else if (pastData.hourlyForecast && typeof pastData.hourlyForecast === 'object') {
        // New format - use as is
        forecastTodayHourly = {
            BTC: pastData.hourlyForecast.BTC || [],
            ETH: pastData.hourlyForecast.ETH || [],
            SOL: pastData.hourlyForecast.SOL || []
        };
    } else {
        // No data
        forecastTodayHourly = {
            BTC: [],
            ETH: [],
            SOL: []
        };
    }

        return {
            predictionAccuracy: 85, // Default for past data
            predictionSeries: [],
            priceStats: [], // Empty array to match PriceStat[] type
            marketSentiment: getMarketSentiment(avgSentiment),
            avoidTokens: [],
            newsImpact: [
                {
                    title: allNews[0]?.title || "No major news",
                    sentiment: avgSentiment > 3.2 ? 'bullish' : avgSentiment < 1.6 ? 'bearish' : 'neutral'
                }
            ],
            volatility: getVolatility(),
            liquidity: "high",
            trendingNews: [],
            whatsNew: [
                {
                    text: `Historical report from ${new Date(pastData.fetched_date).toLocaleDateString()}`
                }
            ],
            recommendations: [],
            todaysNews: {
                crypto: pastData.crypto_news.map(item => ({
                    news_id: item.news_id,
                    title: item.title,
                    link: item.link,
                    analysis: item.analysis,
                    sentimentScore: item.sentimentScore || 2.5,
                    sentimentTag: item.sentimentTag || 'neutral',
                    advice: item.advice || 'Hold',
                    reason: item.reason || '',
                    rationale: item.rationale || ''
                })),
                macro: pastData.macro_news.map(item => ({
                    news_id: item.news_id,
                    title: item.title,
                    link: item.link,
                    description: item.description || '',
                    analysis: item.analysis,
                    sentimentScore: item.sentimentScore || 2.5,
                    sentimentTag: item.sentimentTag || 'neutral',
                    advice: item.advice || 'Hold',
                    reason: item.reason || '',
                    rationale: item.rationale || ''
                }))
            },
            forecastNext3Days: [],
            priceHistoryLast7Days: [],
            // forecastTodayHourly: pastData.hourlyForecast || [],
             forecastTodayHourly: forecastTodayHourly,
        };
    };

    // Get the properly formatted data
    const reportData: FullReportData | null = data 
        ? isPastData(data) 
            ? transformPastDataToCurrentFormat(data)
            : data as FullReportData
        : null;

// const hourlyFc = reportData?.forecastTodayHourly ?? [];
const hourlyFc = reportData?.forecastTodayHourly?.[selectedAsset] ?? [];

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
         const coinId = selectedAsset === 'BTC' ? 'bitcoin' : 
                   selectedAsset === 'ETH' ? 'ethereum' : 
                   'solana';
        fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}`
        )
            .then(r => r.json())
            .then((arr: any[]) => {
                const btc = arr[0];
                setBtcPrice(btc.current_price);
                setBtcChange(btc.price_change_percentage_24h);
            })
            .catch(console.error)
            .finally(() => setLoadingBtc(false));
    }, []);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        }
        if (isOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen, onClose]);

    // Early return if data is null
    if (!reportData || !reportData.todaysNews) {
        return (
            <>
                {/* overlay */}
                <div
                    className={`fixed inset-0 ${isOpen ? 'report-overlay report-overlay-open z-40' : 'opacity-0 -z-10'}`}
                    aria-hidden="true"
                />
                {/* sliding panel */}
                <div
                    ref={panelRef}
                    className={`
                        fixed inset-y-0 right-0 ${isMobile ? 'w-full' : 'w-5/6'}
                        ${isOpen ? 'report-panel-open' : 'translate-x-full'}
                        report-panel flex flex-col z-50 text-white
                    `}
                >
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center animate-fadeIn">
                            <div className="relative w-16 h-16 mx-auto mb-5">
                                <div className="absolute inset-0 rounded-full animate-spin" style={{
                                    border: '2px solid rgba(124,106,247,0.1)',
                                    borderTopColor: '#a78bfa',
                                }} />
                                <div className="absolute inset-2 rounded-full animate-spin" style={{
                                    border: '2px solid rgba(124,106,247,0.05)',
                                    borderBottomColor: '#7c6af7',
                                    animationDirection: 'reverse',
                                    animationDuration: '1.5s',
                                }} />
                            </div>
                            <p className="text-sm font-dmSans text-dsMuted">Loading report data...</p>
                            <div className="mt-3 flex items-center justify-center gap-1">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-dsPurple-light" style={{
                                        animation: `breathe 1.4s ease-in-out ${i * 0.2}s infinite`,
                                    }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Compute average sentiment
    const allScores = [
        ...(reportData.todaysNews.crypto || []),
        ...(reportData.todaysNews.macro || []),
    ]
        // .map(n => n.sentimentScore)
        // .filter((score): score is number => score !== undefined && score !== null);
        .map(n => Number(n.sentimentScore))
  // keep only real, finite numbers (drops NaN, Infinity, undefined)
  .filter(score => Number.isFinite(score));


    const avgSentiment = allScores.length > 0
        ? allScores.reduce((s, a) => s + a, 0) / allScores.length
        : 2.5;

    const isBearish = avgSentiment <= 1.6;
    const isNeutral = avgSentiment > 1.6 && avgSentiment <= 3.2;
    const isBullish = avgSentiment > 3.2;

    // Decide emoji + label
    const marketEmoji = isBearish ? '😢' : isNeutral ? '😐' : '🤩';
    const marketLabel = isBearish ? 'BEARISH' : isNeutral ? 'NEUTRAL' : 'BULLISH';
    const marketColor = isBearish ? 'text-red-500' : isNeutral ? 'text-yellow-500' : 'text-green-500';

    const getCurrentDate = () => {
        // If it's past data, show the fetched date, otherwise show current date
        if (isPastData(data)) {
            const date = new Date(data.fetched_date);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).toUpperCase();
        }
        
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return now.toLocaleDateString('en-US', options).toUpperCase();
    };

    const getReportTitle = () => {
        if (isPastData(data)) {
            return "HISTORICAL PREDICTION REPORT";
        }
        return "DAILY PREDICTION REPORT";
    };

    function TwoLineTitle({ children }: { children: string }) {
        const words = children.split(' ');
        const mid = Math.ceil(words.length / 2);
        const first = words.slice(0, mid).join(' ');
        const second = words.slice(mid).join(' ');
        return (
            <span className="text-green-400 font-bold text-lg leading-tight">
                {first}<br />{second}
            </span>
        );
    }

    // above your return
const formattedAccuracyDisplay = 
  typeof rawAcc === 'number'
    ? `${rawAcc.toFixed(2)}%`
    : typeof rawAcc === 'string'
      // if the API already gave you a string like "99.687", just append "%"
      ? rawAcc.endsWith('%')
          ? rawAcc
          : `${rawAcc}%`
      : '';



     const handleManualTrade = async () => {
  try {
    setPlacing(true);
    // const slot = hourlyFc.find(h => h.signal !== 'HOLD') ?? hourlyFc[0];
            const assetHourlyFc = reportData?.forecastTodayHourly?.[selectedAsset] ?? [];
        const slot = assetHourlyFc[assetHourlyFc.length - 1];

    //const slot = hourlyFc[hourlyFc.length - 1];

    if (!slot) return;

    const dynamicLeverage = calculateDynamicLeverage(dayPnL.profit, dayPnL.loss, slot.confidence_90?.[1]);
    console.log(`🎯 Dynamic Leverage: ${dynamicLeverage}x (Profit: $${dayPnL.profit}, Loss: $${dayPnL.loss})`);

    const TICK_SIZE = 1; // or use 0.1 or 0.01 if you confirm with /meta
    const roundedPrice = Math.round(slot.forecast_price / TICK_SIZE) * TICK_SIZE;
    const size = calcSize(roundedPrice, dynamicLeverage);
    const riskMetrics = getRiskMetrics(roundedPrice, size, dynamicLeverage);


const payload: PlaceOrderBody = {
  asset: BTC_ASSET_ID,
  side: slot.signal,                           // "LONG" | "SHORT"
  price: roundedPrice,                         // 👈 use tick-corrected price
  size: calcSize(roundedPrice, dynamicLeverage),                // recalc size if you want
  takeProfit: slot.take_profit && Math.round(Number(slot.take_profit) / TICK_SIZE) * TICK_SIZE,
  stopLoss: slot.stop_loss && Math.round(Number(slot.stop_loss) / TICK_SIZE) * TICK_SIZE,
  leverage: dynamicLeverage
};

    // const payload: PlaceOrderBody = {
    //   asset: BTC_ASSET_ID,
    //   side: slot.signal,                           // "LONG" | "SHORT"
    //   price: slot.forecast_price,
    //   size: calcSize(slot.forecast_price),         // <= capped by USD_CAP
    //   takeProfit: slot.take_profit?.toString(),
    //   stopLoss:  slot.stop_loss?.toString()
    // };

    const res = await fetch('/api/hl/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'HL order failed');

    const status0 = json.response.data.statuses[0];
    const oid = status0.resting?.oid ?? status0.filled?.oid;

    const trade: Trade = {
      id: String(oid),
      timestamp: Date.now(),
      signal: slot.signal,
      entryPrice: slot.forecast_price,
      status: 'open'
    };
    setTrades(t => [...t, trade]);
  } catch (err) {
    console.error(err);
  } finally {
    setPlacing(false);
  }
};

// useEffect(() => {
//   const iv = setInterval(async () => {
//     try {
//       const res = await fetch('/api/hl/pnl');
//       if (!res.ok) {
//         console.error('PnL fetch failed:', res.status);
//         return;
//       }
//       const data = await res.json();
//       console.log('[PnL]', data);
//     } catch (e) {
//       console.error('PnL parse error:', e);
//     }
//   }, 10_000);
//   return () => clearInterval(iv);
// }, []);



// useEffect(() => {
//   let timer: NodeJS.Timeout;

//   const scheduleTopOfHour = () => {
//     const now = new Date();
//     const msLeft =
//       (60 - now.getUTCMinutes()) * 60_000 -
//       now.getUTCSeconds() * 1_000 -
//       now.getUTCMilliseconds();

//     timer = setTimeout(async () => {
//       try {
//         // Call your cancel endpoint
//         await fetch('/api/hl/cancel-open', { method: 'POST' });
//         // Optionally close positions here with another endpoint if filled but still open
//         // await fetch('/api/hl/close', { method: 'POST' });

//         // Mark local trades as closed if you want to sync UI instantly
//         setTrades(ts => ts.map(t => t.status === 'open' ? { ...t, status: 'closed' } : t));
//       } catch (e) {
//         console.error('cancel-open failed', e);
//       }

//       scheduleTopOfHour();
//     }, msLeft);
//   };

//   scheduleTopOfHour();
//   return () => clearTimeout(timer);
// }, []);



    return (
        <>
            {/* overlay */}
            <div
                className={`fixed inset-0 transition-all duration-300 ${isOpen ? 'report-overlay report-overlay-open z-40' : 'opacity-0 -z-10'}`}
                aria-hidden="true"
            />
            {/* sliding panel */}
            <div
                ref={panelRef}
                className={`
                    fixed inset-y-0 right-0 ${isMobile ? 'w-full' : 'w-5/6'}
                    transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                    report-panel flex flex-col z-50 text-white font-dmSans
                `}
            >
                {/* Header */}
              <header className={`relative px-6 py-4 pt-[calc(1rem+env(safe-area-inset-top))] report-header ${isPastData(data) ? 'report-header-past' : ''}`}>
  {/* Ambient glow */}
  <div className="absolute -top-20 -right-20 w-60 h-60 pointer-events-none" style={{
    background: 'radial-gradient(ellipse at center, rgba(124,106,247,0.08), transparent 70%)',
    filter: 'blur(60px)',
  }} />

  <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
    {/* Brand + Badge */}
    <div className="flex items-center space-x-3 shrink-0 animate-fadeIn">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center p-1" style={{
        background: 'linear-gradient(135deg, rgba(124,106,247,0.2), rgba(167,139,250,0.1))',
        border: '1px solid rgba(124,106,247,0.25)',
        boxShadow: '0 0 20px -5px rgba(124,106,247,0.2)',
      }}>
        <Image src="images/tiger.svg" alt="logo" width={24} height={24} />
      </div>
      <div>
        <h1 className="text-base font-syne font-bold tracking-tight text-white">
          {isPastData(data) ? 'Historical Report' : 'ZkAGI Newsroom'}
        </h1>
        <p className="text-xs font-dmMono text-dsMuted">{getCurrentDate()}</p>
      </div>
    </div>

    {/* Live indicator + Close button */}
    <div className="flex items-center gap-3">
      {!isPastData(data) && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full animate-fadeIn" style={{
          background: 'rgba(52,211,153,0.08)',
          border: '1px solid rgba(52,211,153,0.15)',
        }}>
          <div className="report-live-pulse" />
          <span className="text-[10px] font-dmMono font-semibold text-dsGreen">LIVE</span>
        </div>
      )}
      <button
        onClick={onClose}
        aria-label="Close"
        className="report-close-btn"
      >
        <IoMdClose size={18} />
      </button>
    </div>
  </div>

  {/* Controls row */}
  <div className="flex items-center gap-2.5 flex-wrap relative z-10 animate-slideUp">
    {/* Asset selector tabs */}
    <div className="flex rounded-xl overflow-hidden" style={{
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.02)',
    }}>
      {(['BTC', 'ETH', 'SOL'] as const).map(asset => (
        <button
          key={asset}
          onClick={() => setSelectedAsset(asset)}
          className={`report-asset-tab ${selectedAsset === asset ? 'active' : ''}`}
        >
          {asset}
        </button>
      ))}
    </div>

    {isPastData(data) && (
      <span className="report-badge report-badge-historical">Historical</span>
    )}

    {/* Sentiment badge */}
    <span className={`report-badge ${isBullish ? 'report-badge-bullish' : isBearish ? 'report-badge-bearish' : 'report-badge-neutral'}`}>
      {isBullish ? '↑' : isBearish ? '↓' : '→'} {marketLabel}
    </span>

    <div className="ml-auto flex items-center gap-2">
      {!isPastData(data) && (
        <Link
          href={{ pathname: '/predictions', query: { uid } }}
          target="_blank"
          className="report-trade-btn"
          aria-disabled={!uid}
          onClick={(e) => { if (!uid) e.preventDefault(); }}
          title={uid ? '' : 'Connect wallet first'}
        >
          Place Trade
        </Link>
      )}
    </div>
  </div>
</header>



                <div className="flex-1 overflow-y-auto report-scroll" data-pdf-content>

                    {/* ── Stats Grid ── */}
                    <div className="px-5 py-4 report-content-glow" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-3`}>
                            {/* Price */}
                            <div className="report-stat-card report-stagger-1">
                                <div className="report-section-header mb-2">{selectedAsset} Price</div>
                                <div className="report-stat-value text-xl">
                                    {loadingBtc ? (
                                        <div className="skeleton h-6 w-24 rounded-md" />
                                    ) : `$${btcPrice?.toLocaleString()}`}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[11px] font-bold font-dmMono" style={{
                                        color: (btcChange ?? 0) >= 0 ? '#34d399' : '#f87171',
                                    }}>
                                        {!loadingBtc && `${btcChange! >= 0 ? '+' : ''}${btcChange?.toFixed(2)}%`}
                                    </span>
                                    <span className="text-[9px] uppercase tracking-widest text-dsMuted">24h</span>
                                </div>
                            </div>

                            {/* Sentiment Score */}
                            <div className="report-stat-card report-stagger-2">
                                <div className="report-section-header mb-2">Fear & Greed</div>
                                <div className="flex items-center gap-3">
                                    <Gauge value={avgSentiment} min={0} max={5} size={48} />
                                    <div>
                                        <div className="report-stat-value text-lg">{avgSentiment.toFixed(2)}</div>
                                        <div className="text-[9px] uppercase tracking-widest text-dsMuted">/5.00</div>
                                    </div>
                                </div>
                            </div>

                            {/* Market Sentiment */}
                            <div className="report-stat-card report-stagger-3" style={{
                                borderColor: isBullish ? 'rgba(52,211,153,0.15)' : isBearish ? 'rgba(248,113,113,0.15)' : 'rgba(245,158,11,0.15)',
                            }}>
                                <div className="report-section-header mb-2">
                                    {isPastData(data) ? 'Historical' : 'Market'} Sentiment
                                </div>
                                <div className={`text-lg font-syne font-extrabold tracking-wider ${marketColor}`}>
                                    {marketLabel}
                                </div>
                                <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <div className="h-full rounded-full transition-all duration-700" style={{
                                        width: `${(avgSentiment / 5) * 100}%`,
                                        background: isBullish ? 'linear-gradient(90deg, #059669, #34d399)' : isBearish ? 'linear-gradient(90deg, #dc2626, #f87171)' : 'linear-gradient(90deg, #d97706, #f59e0b)',
                                    }} />
                                </div>
                            </div>

                            {/* Accuracy / Coverage */}
                            <div className="report-stat-card report-stagger-4">
                                {isPastData(data) ? (
                                    <>
                                        <div className="report-section-header mb-2">Coverage</div>
                                        <div className="report-stat-value text-lg" style={{ color: '#a78bfa' }}>
                                            {[...reportData.todaysNews.crypto, ...reportData.todaysNews.macro].length}
                                        </div>
                                        <div className="text-[10px] text-dsMuted mt-0.5">articles analyzed</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="report-section-header mb-2">Accuracy</div>
                                        <div className="report-stat-value text-lg" style={{ color: '#34d399' }}>
                                            {formattedAccuracyDisplay || 'N/A'}
                                        </div>
                                        <div className="text-[10px] text-dsMuted mt-0.5">prediction rate</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Main Content ── */}
                    <div className="p-5 space-y-5">

                    {/* Chart + Right Panel */}
                    <section className={`${isMobile ? 'space-y-4' : 'grid grid-cols-3 gap-4'}`} style={{ animation: 'cardStagger 0.5s ease-out 0.15s backwards' }}>
                        {/* Chart / Hourly */}
                        <div className="col-span-2 report-section-card">
                            <div className="flex items-center justify-between px-5 pt-4 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-dsPurple-light" />
                                    <span className="report-section-header">
                                        {isPastData(data) ? `${selectedAsset} Hourly Breakdown` : 'Prediction Accuracy'}
                                    </span>
                                </div>
                                {formattedAccuracyDisplay && !isPastData(data) && (
                                    <span className="report-badge report-badge-bullish">
                                        {formattedAccuracyDisplay}
                                    </span>
                                )}
                            </div>
                            <div className="px-5 pb-5">
                                {!isPastData(data) ? (
                                    <PriceChart
                                        priceHistory={reportData.priceHistoryLast7Days || []}
                                        forecast={reportData.forecastNext3Days || []}
                                        hourlyForecast={reportData.forecastTodayHourly?.[selectedAsset] || []}
                                        selectedAsset={selectedAsset}
                                        onAssetChange={setSelectedAsset}
                                    />
                                ) : (
                                    <HourlyPredictionsTable
                                        hourlyForecast={reportData.forecastTodayHourly?.[selectedAsset] ?? []}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="flex flex-col gap-3">
                            {/* Past: asset buttons */}
                            {isPastData(data) && (
                                <div className="report-section-card p-4">
                                    <div className="report-section-header mb-3">
                                        Forecasts by Asset
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        {(['BTC', 'ETH', 'SOL'] as const).map(asset => {
                                            const count = reportData.forecastTodayHourly?.[asset]?.length ?? 0;
                                            const active = selectedAsset === asset;
                                            return (
                                                <button key={asset} onClick={() => setSelectedAsset(asset)}
                                                    className={`report-forecast-btn ${active ? 'active' : ''}`}>
                                                    <div className="text-lg font-bold font-dmMono" style={{
                                                        color: active ? '#a78bfa' : '#e2e8f0',
                                                    }}>{count}</div>
                                                    <div className="text-[9px] font-semibold tracking-wider" style={{
                                                        color: active ? '#a78bfa' : '#6b7280',
                                                    }}>{asset}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Past: news counts */}
                            {isPastData(data) && (
                                <div className="report-section-card p-4">
                                    <div className="report-section-header mb-3">Summary</div>
                                    <div className="space-y-0.5">
                                    {[
                                        { label: 'Crypto News', val: reportData.todaysNews.crypto.length, color: '#34d399', icon: '●' },
                                        { label: 'Macro News', val: reportData.todaysNews.macro.length, color: '#f59e0b', icon: '●' },
                                        { label: 'Sentiment', val: `${avgSentiment.toFixed(1)}/5`, color: isBullish ? '#34d399' : isBearish ? '#f87171' : '#f59e0b', icon: '◆' },
                                    ].map((r, i) => (
                                        <div key={r.label} className="flex items-center justify-between py-2 group" style={{
                                            borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                        }}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px]" style={{ color: r.color }}>{r.icon}</span>
                                                <span className="text-[11px] text-dsMuted group-hover:text-white transition-colors">{r.label}</span>
                                            </div>
                                            <span className="text-xs font-bold font-dmMono" style={{ color: r.color }}>{r.val}</span>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            )}

                            {/* Live: Gauge + Hourly + Trading */}
                            {!isPastData(data) && (
                                <>
                                    {reportData.forecastTodayHourly && (
                                        <div className="report-section-card overflow-hidden">
                                            <HourlyPredictionsTable
                                                hourlyForecast={reportData.forecastTodayHourly?.[selectedAsset] ?? []}
                                            />
                                            <TradingIntegration
                                                hourlyForecast={reportData.forecastTodayHourly?.[selectedAsset] ?? []}
                                                onTradesUpdate={setTrades}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </section>

                    {/* ── News ── */}
                    <section style={{ animation: 'cardStagger 0.5s ease-out 0.25s backwards' }}>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-dsPurple-light to-dsPurple" />
                            <h3 className="report-section-header">
                                {isPastData(data) ? 'Historical News' : 'Trending News'}
                            </h3>
                            <span className="ds-badge-number text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{
                                background: 'rgba(124,106,247,0.1)',
                                border: '1px solid rgba(124,106,247,0.15)',
                                color: '#a78bfa',
                            }}>
                                {[...reportData.todaysNews.crypto, ...reportData.todaysNews.macro].length}
                            </span>
                        </div>

                        <div className={`${isMobile ? 'space-y-3' : 'grid grid-cols-2 gap-3'} max-h-[400px] overflow-y-auto report-scroll pr-1`}>
                            {[...reportData.todaysNews.crypto, ...reportData.todaysNews.macro].map((item, idx) => (
                                <div key={item.news_id} style={{ animation: `cardStagger 0.4s ease-out ${0.05 * Math.min(idx, 8)}s backwards` }}>
                                    <NewsCard item={item} />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* What's New / Recommendations */}
                    {(reportData.whatsNew.length > 0 || reportData.recommendations.length > 0) && (
                        <section className={`${isMobile ? 'space-y-3' : 'grid grid-cols-2 gap-3'}`} style={{ animation: 'cardStagger 0.5s ease-out 0.35s backwards' }}>
                            {reportData.whatsNew.length > 0 && (
                                <div className="report-section-card p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1 h-4 rounded-full bg-dsGreen" />
                                        <div className="report-section-header">
                                            {isPastData(data) ? 'Archive' : "What's New"}
                                        </div>
                                    </div>
                                    <ul className="space-y-2 text-xs">
                                        {reportData.whatsNew.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 group">
                                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-dsGreen shrink-0 group-hover:shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-shadow" />
                                                <span className="text-[#c9d1d9] leading-relaxed">{item.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {reportData.recommendations.length > 0 && (
                                <div className="space-y-2">
                                    {reportData.recommendations.map((rec, i) => (
                                        <div key={i} className="report-section-card p-4 transition-all hover:translate-x-1" style={{
                                            borderLeft: '3px solid',
                                            borderLeftColor: rec.dotClass?.includes('green') ? '#34d399' : rec.dotClass?.includes('red') ? '#f87171' : '#f59e0b',
                                        }}>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className={`w-2 h-2 rounded-full ${rec.dotClass}`} />
                                                <span className={`font-bold text-xs ${rec.textClass}`}>{rec.label}</span>
                                            </div>
                                            <ul className="text-[11px] space-y-1 text-dsMuted">
                                                {rec.items.map((item, idx) => (
                                                    <li key={idx} className="flex items-center gap-1.5">
                                                        <span className="text-[8px] text-dsMuted">▸</span>
                                                        {item.symbol} – {item.target}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    </div>
                </div>

                {/* ── Footer ── */}
                <footer className="px-5 py-3" style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    background: 'linear-gradient(180deg, rgba(11,14,23,0.8), rgba(11,14,23,1))',
                }}>
                    <button
                        className="report-download-btn"
                        onClick={async () => {
                            try {
                                const html2canvas = (await import('html2canvas')).default;
                                const jsPDF = (await import('jspdf')).jsPDF;

                                const contentElement = document.querySelector('[data-pdf-content]') as HTMLElement;
                                if (!contentElement) {
                                    alert('Content not found for PDF generation');
                                    return;
                                }

                                const clone = contentElement.cloneNode(true) as HTMLElement;
                                const pdfContainer = document.createElement('div');
                                pdfContainer.style.position = 'absolute';
                                pdfContainer.style.left = '-9999px';
                                pdfContainer.style.top = '0';
                                pdfContainer.style.width = '794px';
                                pdfContainer.style.minHeight = '1123px';
                                pdfContainer.style.backgroundColor = '#0a1628';
                                pdfContainer.style.color = 'white';
                                pdfContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
                                pdfContainer.style.padding = '20px';
                                pdfContainer.style.boxSizing = 'border-box';

                                const existingLogo = document.querySelector('img[alt="logo"]') as HTMLImageElement;
                                const logoSrc = existingLogo?.src || '/images/tiger.svg';
                                const currentDate = getCurrentDate();

                                const header = document.createElement('div');
                                header.innerHTML = `
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #374151; padding-bottom: 15px;">
                                        <div style="display: flex; align-items: center;">
                                            <img src="${logoSrc}" alt="logo" style="width: 32px; height: 32px; margin-right: 12px;" />
                                            <h1 style="font-size: 18px; font-weight: bold; margin: 0;">ZkAGI Newsroom</h1>
                                        </div>
                                        <div style="text-align: right;">
                                            <h2 style="font-size: 18px; font-weight: bold; margin: 0;">${getReportTitle()}</h2>
                                            <p style="font-size: 12px; color: #9ca3af; margin: 0;">${currentDate}</p>
                                        </div>
                                    </div>
                                `;

                                clone.style.width = '100%';
                                clone.style.fontSize = '12px';
                                clone.style.lineHeight = '1.4';

                                pdfContainer.appendChild(header);
                                pdfContainer.appendChild(clone);
                                document.body.appendChild(pdfContainer);

                                await new Promise(resolve => setTimeout(resolve, 500));

                                const canvas = await html2canvas(pdfContainer, {
                                    backgroundColor: '#0a1628',
                                    scale: 1.5,
                                    useCORS: true,
                                    allowTaint: true,
                                    width: 794,
                                    height: Math.max(1123, pdfContainer.scrollHeight),
                                    logging: false,
                                });

                                document.body.removeChild(pdfContainer);

                                const imgData = canvas.toDataURL('image/png');
                                const pdf = new jsPDF('p', 'mm', 'a4');
                                const imgWidth = 210;
                                const pageHeight = 297;
                                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                                const finalHeight = Math.min(imgHeight, pageHeight);

                                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, finalHeight);

                                const dateStr = isPastData(data)
                                    ? new Date(data.fetched_date).toISOString().split('T')[0]
                                    : new Date().toISOString().split('T')[0];
                                const reportType = isPastData(data) ? 'Historical' : 'Daily';
                                pdf.save(`ZkAGI-${reportType}-Report-${dateStr}.pdf`);
                            } catch (error) {
                                console.error('Error generating PDF:', error);
                                alert('Error generating PDF. Please try again.');
                            }
                        }}
                    >
                        Download PDF
                    </button>
                </footer>
            </div>
        </>
    );
};

export default ReportSidebar;

// import { FC, useEffect, useRef, useState } from 'react';
// import { IoMdClose } from 'react-icons/io';
// import Image from 'next/image';
// import { FullReportData } from '@/types/types';
// import NewsCard from '@/component/ui/NewsCard';
// import Gauge from '@/component/ui/Gauge';
// import PriceChart from '@/component/ui/PriceChart';

// // New interface for past prediction data
// interface PastPredictionData {
//     fetched_date: string;
//     crypto_news: Array<{
//         news_id: string;
//         title: string;
//         link: string;
//         analysis: string;
//         sentimentScore?: number;
//         sentimentTag?: 'bearish' | 'neutral' | 'bullish';
//         advice?: 'Buy' | 'Hold' | 'Sell';
//         reason?: string;
//         rationale?: string;
//     }>;
//     macro_news: Array<{
//         news_id: string;
//         title: string;
//         link: string;
//         description?: string;
//         analysis: string;
//         sentimentScore?: number;
//         sentimentTag?: 'bearish' | 'neutral' | 'bullish';
//         advice?: 'Buy' | 'Hold' | 'Sell';
//         reason?: string;
//         rationale?: string;
//     }>;
// }

// interface ReportSidebarProps {
//     isOpen: boolean;
//     onClose: () => void;
//     data: FullReportData | PastPredictionData | null;
// }

// const ReportSidebar: FC<ReportSidebarProps> = ({ isOpen, onClose, data }) => {
//     const panelRef = useRef<HTMLDivElement>(null);
//     const [isMobile, setIsMobile] = useState(false);
//     const [btcPrice, setBtcPrice] = useState<number | null>(null);
//     const [btcChange, setBtcChange] = useState<number | null>(null);
//     const [loadingBtc, setLoadingBtc] = useState(true);

//      const [latest, setLatest] = useState<{
//     deviation_percent?: number | string;
//     overall_accuracy_percent?: number | string;
//   } | null>(null);

//   // 2️⃣ Fetch it once on mount
//   useEffect(() => {
//     fetch("/api/past-prediction", {
//       cache: "no-store",
//       headers: { "Cache-Control": "no-cache" },
//     })
//       .then(r => r.json())
//       .then(past => {
//         const entry = past.latest_forecast?.[0];
//         setLatest({
//           deviation_percent: entry?.deviation_percent,
//           overall_accuracy_percent: entry?.overall_accuracy_percent
//         });
//       })
//       .catch(console.error);
//   }, []);

//   const firstFc = latest;
//   const rawAcc = firstFc?.overall_accuracy_percent;

//     // Check if data is past prediction data
//     const isPastData = (data: any): data is PastPredictionData => {
//         return data && 'fetched_date' in data && !('predictionAccuracy' in data);
//     };

//     // Transform past data to current format
//     const transformPastDataToCurrentFormat = (pastData: PastPredictionData): FullReportData => {
//         const allNews = [...pastData.crypto_news, ...pastData.macro_news];
//         const sentimentScores = allNews
//             .map(item => item.sentimentScore)
//             .filter((score): score is number => score !== undefined && score !== null);
        
//         const avgSentiment = sentimentScores.length > 0 
//             ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length 
//             : 2.5;

//         // Determine market sentiment based on average score
//         const getMarketSentiment = (score: number): 'bullish' | 'bearish' => {
//             return score > 3.2 ? 'bullish' : 'bearish';
//         };

//         // Determine volatility level
//         const getVolatility = (): 'low' | 'moderate' | 'high' => {
//             // You can customize this logic based on your requirements
//             return 'moderate';
//         };

//         return {
//             predictionAccuracy: 85, // Default for past data
//             predictionSeries: [],
//             priceStats: [], // Empty array to match PriceStat[] type
//             marketSentiment: getMarketSentiment(avgSentiment),
//             avoidTokens: [],
//             newsImpact: [
//                 {
//                     title: allNews[0]?.title || "No major news",
//                     sentiment: avgSentiment > 3.2 ? 'bullish' : avgSentiment < 1.6 ? 'bearish' : 'neutral'
//                 }
//             ],
//             volatility: getVolatility(),
//             liquidity: "high",
//             trendingNews: [],
//             whatsNew: [
//                 {
//                     text: `Historical report from ${new Date(pastData.fetched_date).toLocaleDateString()}`
//                 }
//             ],
//             recommendations: [],
//             todaysNews: {
//                 crypto: pastData.crypto_news.map(item => ({
//                     news_id: item.news_id,
//                     title: item.title,
//                     link: item.link,
//                     analysis: item.analysis,
//                     sentimentScore: item.sentimentScore || 2.5,
//                     sentimentTag: item.sentimentTag || 'neutral',
//                     advice: item.advice || 'Hold',
//                     reason: item.reason || '',
//                     rationale: item.rationale || ''
//                 })),
//                 macro: pastData.macro_news.map(item => ({
//                     news_id: item.news_id,
//                     title: item.title,
//                     link: item.link,
//                     description: item.description || '',
//                     analysis: item.analysis,
//                     sentimentScore: item.sentimentScore || 2.5,
//                     sentimentTag: item.sentimentTag || 'neutral',
//                     advice: item.advice || 'Hold',
//                     reason: item.reason || '',
//                     rationale: item.rationale || ''
//                 }))
//             },
//             forecastNext3Days: [],
//             priceHistoryLast7Days: []
//         };
//     };

//     // Get the properly formatted data
//     const reportData: FullReportData | null = data 
//         ? isPastData(data) 
//             ? transformPastDataToCurrentFormat(data)
//             : data as FullReportData
//         : null;

//     useEffect(() => {
//         const checkMobile = () => {
//             setIsMobile(window.innerWidth < 768);
//         };

//         checkMobile();
//         window.addEventListener('resize', checkMobile);
//         return () => window.removeEventListener('resize', checkMobile);
//     }, []);

//     useEffect(() => {
//         fetch(
//             'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin'
//         )
//             .then(r => r.json())
//             .then((arr: any[]) => {
//                 const btc = arr[0];
//                 setBtcPrice(btc.current_price);
//                 setBtcChange(btc.price_change_percentage_24h);
//             })
//             .catch(console.error)
//             .finally(() => setLoadingBtc(false));
//     }, []);

//     // Close on outside click
//     useEffect(() => {
//         function handleClick(e: MouseEvent) {
//             if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
//                 onClose();
//             }
//         }
//         if (isOpen) document.addEventListener('mousedown', handleClick);
//         return () => document.removeEventListener('mousedown', handleClick);
//     }, [isOpen, onClose]);

//     // Early return if data is null
//     if (!reportData || !reportData.todaysNews) {
//         return (
//             <>
//                 {/* overlay */}
//                 <div
//                     className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${isOpen ? 'opacity-100 z-40' : 'opacity-0 -z-10'
//                         }`}
//                     aria-hidden
//                 />
//                 {/* sliding panel */}
//                 <div
//                     ref={panelRef}
//                     className={`
//                         fixed inset-y-0 right-0 ${isMobile ? 'w-full' : 'w-3/5'} bg-[#0a1628] 
//                         transform transition-transform duration-300 ease-in-out
//                         ${isOpen ? 'translate-x-0' : 'translate-x-full'}
//                         flex flex-col shadow-xl z-50 text-white
//                     `}
//                 >
//                     <div className="flex items-center justify-center h-full">
//                         <div className="text-center">
//                             <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
//                             <p>Loading report data...</p>
//                         </div>
//                     </div>
//                 </div>
//             </>
//         );
//     }

//     // Compute average sentiment
//     const allScores = [
//         ...(reportData.todaysNews.crypto || []),
//         ...(reportData.todaysNews.macro || []),
//     ]
//         // .map(n => n.sentimentScore)
//         // .filter((score): score is number => score !== undefined && score !== null);
//         .map(n => Number(n.sentimentScore))
//   // keep only real, finite numbers (drops NaN, Infinity, undefined)
//   .filter(score => Number.isFinite(score));

//     const avgSentiment = allScores.length > 0
//         ? allScores.reduce((s, a) => s + a, 0) / allScores.length
//         : 2.5;

//     const isBearish = avgSentiment <= 1.6;
//     const isNeutral = avgSentiment > 1.6 && avgSentiment <= 3.2;
//     const isBullish = avgSentiment > 3.2;

//     // Decide emoji + label
//     const marketEmoji = isBearish ? '😢' : isNeutral ? '😐' : '🤩';
//     const marketLabel = isBearish ? 'BEARISH' : isNeutral ? 'NEUTRAL' : 'BULLISH';
//     const marketColor = isBearish ? 'text-red-500' : isNeutral ? 'text-yellow-500' : 'text-green-500';

//     const getCurrentDate = () => {
//         // If it's past data, show the fetched date, otherwise show current date
//         if (isPastData(data)) {
//             const date = new Date(data.fetched_date);
//             return date.toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric'
//             }).toUpperCase();
//         }
        
//         const now = new Date();
//         const options: Intl.DateTimeFormatOptions = {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         };
//         return now.toLocaleDateString('en-US', options).toUpperCase();
//     };

//     const getReportTitle = () => {
//         if (isPastData(data)) {
//             return "HISTORICAL PREDICTION REPORT";
//         }
//         return "DAILY PREDICTION REPORT";
//     };

//     function TwoLineTitle({ children }: { children: string }) {
//         const words = children.split(' ');
//         const mid = Math.ceil(words.length / 2);
//         const first = words.slice(0, mid).join(' ');
//         const second = words.slice(mid).join(' ');
//         return (
//             <span className="text-green-400 font-bold text-lg leading-tight">
//                 {first}<br />{second}
//             </span>
//         );
//     }

//     // above your return
// const formattedAccuracyDisplay = 
//   typeof rawAcc === 'number'
//     ? `${rawAcc.toFixed(2)}%`
//     : typeof rawAcc === 'string'
//       // if the API already gave you a string like "99.687", just append "%"
//       ? rawAcc.endsWith('%')
//           ? rawAcc
//           : `${rawAcc}%`
//       : '';


//     return (
//         <>
//             {/* overlay */}
//             <div
//                 className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${isOpen ? 'opacity-100 z-40' : 'opacity-0 -z-10'
//                     }`}
//                 aria-hidden
//             />
//             {/* sliding panel */}
//             <div
//                 ref={panelRef}
//                 className={`
//                     fixed inset-y-0 right-0 ${isMobile ? 'w-full' : 'w-3/5'} bg-[#0a1628] 
//                     transform transition-transform duration-300 ease-in-out
//                     ${isOpen ? 'translate-x-0' : 'translate-x-full'}
//                     flex flex-col shadow-xl z-50 text-white
//                 `}
//             >
//                 {/* Header */}
//                 <header className="flex items-center justify-between p-6 border-b border-gray-700">
//                     <div className="flex items-center space-x-2">
//                         <div className="">
//                             <Image
//                                 src="images/tiger.svg"
//                                 alt="logo"
//                                 width={40}
//                                 height={40}
//                                 className='p-2'
//                             />
//                         </div>
//                         <div>
//                             <h1 className="text-lg font-bold">ZkAGI Newsroom</h1>
//                             {isPastData(data) && (
//                                 <p className="text-xs text-blue-400">Historical Data</p>
//                             )}
//                         </div>
//                     </div>
//                     <div className="flex items-center space-x-4">
//                         <div className="text-right">
//                             <h2 className="text-lg font-bold">{getReportTitle()}</h2>
//                             <p className="text-sm text-gray-400">{getCurrentDate()}</p>
//                         </div>
//                         <button onClick={onClose} className="text-gray-400 hover:text-white">
//                             <IoMdClose size={24} />
//                         </button>
//                     </div>
//                 </header>

//                 <div className="flex-1 overflow-y-auto p-6 space-y-6" data-pdf-content>
//                     {/* Top Section: 3-Column Layout - Price Chart (2 cols) + Cards (1 col) */}
//                     <section className={`${isMobile ? 'flex-col space-y-4' : 'grid grid-cols-3 gap-6'}`}>
//                         {/* Price Chart - Takes 2 columns */}
//                         <div className={`${isMobile ? '' : 'col-span-2'} bg-[#1a2332] rounded-lg p-4`}>
//                             <div className="flex items-center justify-between mb-4">
//                                 <span className="text-sm text-gray-300">
//                                     {isPastData(data) ? 'Historical Analysis' : 'Prediction Accuracy'}
//                                 </span>
//                                 <span className="text-green-400 font-bold">
//                                     {isPastData(data)
//                                         ? 'ARCHIVE'
//                                         : formattedAccuracyDisplay}
//                                 </span>
//                             </div>

//                             {/* Price Chart or Historical Notice */}
//                             {!isPastData(data) ? (
//                                 <PriceChart
//                                     priceHistory={reportData.priceHistoryLast7Days || []}
//                                     forecast={reportData.forecastNext3Days || []}
//                                 />
//                             ) : (
//                                 <div className="h-40 flex items-center justify-center bg-gray-800/50 rounded-lg">
//                                     <div className="text-center">
//                                         <div className="text-4xl mb-2">📊</div>
//                                         <p className="text-gray-400 text-sm">Historical Report</p>
//                                         <p className="text-xs text-gray-500">
//                                             {new Date(data.fetched_date).toLocaleDateString()}
//                                         </p>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Right Column - Takes 1 column */}
//                         <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-4'}`}>
//                             {/* BTC PRICE CARD */}
//                             <div className="bg-[#1a2332] rounded-lg p-4 text-center flex flex-col justify-center min-h-[120px]">
//                                 {loadingBtc ? (
//                                     <div className="text-gray-400">Loading…</div>
//                                 ) : (
//                                     <>
//                                         <div className="text-2xl font-bold">
//                                             ${btcPrice?.toLocaleString()}
//                                         </div>
//                                         <div className={`text-sm ${(btcChange ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                                             {btcChange! >= 0 ? '+' : ''}
//                                             {btcChange?.toFixed(2)}%
//                                         </div>
//                                     </>
//                                 )}
//                                 <div className="text-xs text-gray-400">
//                                     {isPastData(data) ? 'BTC (Current)' : 'BTC'}
//                                 </div>
//                             </div>

//                             {/* MARKET SENTIMENT */}
//                             <div className="bg-[#1a2332] rounded-lg p-4 text-center flex flex-col justify-center min-h-[120px]">
//                                 <div className="text-3xl">{marketEmoji}</div>
//                                 <div className={`${marketColor} font-bold text-sm`}>
//                                     {marketLabel}
//                                 </div>
//                                 <div className="text-xs text-gray-400">
//                                     {isPastData(data) ? 'HISTORICAL SENTIMENT' : 'MARKET SENTIMENT'}
//                                 </div>
//                             </div>

//                             {/* SENTIMENT GAUGE */}
//                             <div className={`${isMobile ? 'col-span-2' : ''} bg-[#1a2332] rounded-lg p-2 flex flex-col items-center justify-center`}>
//                                 <Gauge
//                                     value={avgSentiment}
//                                     min={0}
//                                     max={5}
//                                     size={isMobile ? 280 : 200}
//                                 />
//                             </div>
//                         </div>
//                     </section>

//                     {/* Bottom Section: News */}
//                     <section className={`${isMobile ? 'flex-col space-y-4' : 'flex gap-6'}`}>
//                         {/* Left Column - News Impact & Trending News */}
//                         <div className="flex-[2] space-y-6">
//                             {/* News Impact */}
//                             <div>
//                                 <div className="flex items-center space-x-2 mb-4">
//                                     <span className="text-lg">📢</span>
//                                     <h3 className="font-bold">
//                                         {isPastData(data) ? 'HISTORICAL NEWS IMPACT' : 'NEWS IMPACT'}
//                                     </h3>
//                                 </div>

//                                 <div className={`${isMobile ? 'grid grid-cols-1 gap-2 mb-4' : 'grid grid-cols-4 gap-4 mb-4 h-16'}`}>
//                                     {/* Main News Card */}
//                                     <div className="col-span-2 bg-[#1a2332] rounded-lg p-4 h-full flex items-center justify-between">
//                                         <TwoLineTitle>
//                                             {reportData.newsImpact[0].title.toUpperCase()}
//                                         </TwoLineTitle>
//                                         <span className={`text-3xl ${reportData.newsImpact[0].sentiment === 'bullish' ? 'text-green-400' : 'text-red-400'}`}>
//                                             {reportData.newsImpact[0].sentiment === 'bullish' ? '↗' : '↘'}
//                                         </span>
//                                     </div>

//                                     {/* Volatility & Liquidity Cards */}
//                                     <div className="bg-[#1a2332] rounded-lg p-4 text-center">
//                                         <div className="text-gray-300 text-xs mb-2">VOLATILITY</div>
//                                         <div className="text-white font-bold text-lg">{reportData.volatility.toUpperCase()}</div>
//                                     </div>

//                                     <div className="bg-[#1a2332] rounded-lg p-4 text-center">
//                                         <div className="text-gray-300 text-xs mb-2">LIQUIDITY</div>
//                                         <div className="text-white font-bold text-lg">{reportData.liquidity.toUpperCase()}</div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Trending News */}
//                             <section className="mt-10">
//                                 <div className="flex items-center space-x-2 my-4">
//                                     <span className="text-lg">🚀</span>
//                                     <h3 className="font-bold">
//                                         {isPastData(data) ? 'HISTORICAL NEWS' : 'TRENDING NEWS'}
//                                     </h3>
//                                 </div>

//                                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                                     {[
//                                         ...reportData.todaysNews.crypto,
//                                         ...reportData.todaysNews.macro
//                                     ].map(item => (
//                                         <NewsCard key={item.news_id} item={item} />
//                                     ))}
//                                 </div>
//                             </section>
//                         </div>

//                         {/* Right Column - What's New & Recommendations */}
//                         {(reportData.whatsNew.length > 0 || reportData.recommendations.length > 0) && (
//                             <div className="flex-1 space-y-6">
//                                 {/* WHAT'S NEW */}
//                                 {reportData.whatsNew.length > 0 && (
//                                     <div className="bg-[#1a2332] rounded-lg p-4">
//                                         <div className="flex items-center space-x-2 mb-4">
//                                             <span className="text-lg">⚙️</span>
//                                             <h3 className="font-bold">
//                                                 {isPastData(data) ? 'ARCHIVE INFO' : "WHAT'S NEW"}
//                                             </h3>
//                                         </div>
//                                         <ul className="space-y-2 text-sm mb-4">
//                                             {reportData.whatsNew.map((item, i) => (
//                                                 <li key={i} className="flex items-start space-x-2">
//                                                     <span className="text-green-400">•</span>
//                                                     <span>{item.text}</span>
//                                                 </li>
//                                             ))}
//                                         </ul>
//                                         <div className="flex justify-end">
//                                             <Image src="/images/tiger.png" alt="" width={40} height={40} />
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* RECOMMENDATIONS */}
//                                 {reportData.recommendations.length > 0 && (
//                                     <div className="space-y-4">
//                                         {reportData.recommendations.map((rec, i) => (
//                                             <div
//                                                 key={i}
//                                                 className={`bg-[#1a2332] rounded-lg p-4 border-l-4 ${rec.borderClass}`}
//                                             >
//                                                 <div className="flex items-center space-x-2 mb-2">
//                                                     <span className={`w-2 h-2 rounded-full ${rec.dotClass}`}></span>
//                                                     <span className={`font-bold ${rec.textClass}`}>{rec.label}</span>
//                                                 </div>
//                                                 <ul className="text-xs space-y-1">
//                                                     {rec.items.map((item, idx) => (
//                                                         <li key={idx}>
//                                                             {item.symbol} – TARGET: {item.target}
//                                                         </li>
//                                                     ))}
//                                                 </ul>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </section>
//                 </div>

//                 {/* Footer with Download PDF */}
//                 <footer className="p-4 border-t border-gray-700">
//                     <button
//                         className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
//                         onClick={async () => {
//                             try {
//                                 const html2canvas = (await import('html2canvas')).default;
//                                 const jsPDF = (await import('jspdf')).jsPDF;

//                                 const contentElement = document.querySelector('[data-pdf-content]') as HTMLElement;
//                                 if (!contentElement) {
//                                     alert('Content not found for PDF generation');
//                                     return;
//                                 }

//                                 const clone = contentElement.cloneNode(true) as HTMLElement;
//                                 const pdfContainer = document.createElement('div');
//                                 pdfContainer.style.position = 'absolute';
//                                 pdfContainer.style.left = '-9999px';
//                                 pdfContainer.style.top = '0';
//                                 pdfContainer.style.width = '794px';
//                                 pdfContainer.style.minHeight = '1123px';
//                                 pdfContainer.style.backgroundColor = '#0a1628';
//                                 pdfContainer.style.color = 'white';
//                                 pdfContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
//                                 pdfContainer.style.padding = '20px';
//                                 pdfContainer.style.boxSizing = 'border-box';

//                                 const existingLogo = document.querySelector('img[alt="logo"]') as HTMLImageElement;
//                                 const logoSrc = existingLogo?.src || '/images/tiger.svg';
//                                 const currentDate = getCurrentDate();

//                                 const header = document.createElement('div');
//                                 header.innerHTML = `
//                                     <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #374151; padding-bottom: 15px;">
//                                         <div style="display: flex; align-items: center;">
//                                             <img src="${logoSrc}" alt="logo" style="width: 32px; height: 32px; margin-right: 12px;" />
//                                             <h1 style="font-size: 18px; font-weight: bold; margin: 0;">ZkAGI Newsroom</h1>
//                                         </div>
//                                         <div style="text-align: right;">
//                                             <h2 style="font-size: 18px; font-weight: bold; margin: 0;">${getReportTitle()}</h2>
//                                             <p style="font-size: 12px; color: #9ca3af; margin: 0;">${currentDate}</p>
//                                         </div>
//                                     </div>
//                                 `;

//                                 clone.style.width = '100%';
//                                 clone.style.fontSize = '12px';
//                                 clone.style.lineHeight = '1.4';

//                                 pdfContainer.appendChild(header);
//                                 pdfContainer.appendChild(clone);
//                                 document.body.appendChild(pdfContainer);

//                                 await new Promise(resolve => setTimeout(resolve, 500));

//                                 const canvas = await html2canvas(pdfContainer, {
//                                     backgroundColor: '#0a1628',
//                                     scale: 1.5,
//                                     useCORS: true,
//                                     allowTaint: true,
//                                     width: 794,
//                                     height: Math.max(1123, pdfContainer.scrollHeight),
//                                     logging: false,
//                                 });

//                                 document.body.removeChild(pdfContainer);

//                                 const imgData = canvas.toDataURL('image/png');
//                                 const pdf = new jsPDF('p', 'mm', 'a4');
//                                 const imgWidth = 210;
//                                 const pageHeight = 297;
//                                 const imgHeight = (canvas.height * imgWidth) / canvas.width;
//                                 const finalHeight = Math.min(imgHeight, pageHeight);

//                                 pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, finalHeight);

//                                 const dateStr = isPastData(data) 
//                                     ? new Date(data.fetched_date).toISOString().split('T')[0]
//                                     : new Date().toISOString().split('T')[0];
//                                 const reportType = isPastData(data) ? 'Historical' : 'Daily';
//                                 pdf.save(`ZkAGI-${reportType}-Report-${dateStr}.pdf`);
//                             } catch (error) {
//                                 console.error('Error generating PDF:', error);
//                                 alert('Error generating PDF. Please try again.');
//                             }
//                         }}
//                     >
//                         Download PDF
//                     </button>
//                 </footer>
//             </div>
//         </>
//     );
// };

// export default ReportSidebar;