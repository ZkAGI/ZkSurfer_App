'use client'

import React, { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { useRouter, useParams } from 'next/navigation'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { TrendingDown, TrendingUp, Maximize2, X, ArrowLeft, BarChart3, Activity } from 'lucide-react'

// -------------------------------------------------------------
// Types
// -------------------------------------------------------------
type TimeFrame = 'daily' | 'monthly' | 'all-time'

interface PnLData {
  timestamp: string
  value: number
  percentage?: number
}

interface TokenTradeData {
  day: number
  date: string
  trades: number
  dailyPnLPercent: number
  startBalance: number
  endBalance: number
  dailyGain: number
  cumulativeReturn: number
}

interface TokenData {
  symbol: string
  price: number
  cumulativePnL: number
  cumulativePercent: number
  volume: number
  trades: TokenTradeData[]
  totalCumulativePnL?: number // Total cumulative from API
}

// Prediction API types
interface HourlyForecast {
  time: string
  signal: 'LONG' | 'SHORT'
  entry_price: number
  stop_loss: number
  take_profit: number
  forecast_price: number
  current_price: number
  deviation_percent: number
  accuracy_percent: number
  risk_reward_ratio: number
  sentiment_score: number
  confidence_50: [number, number]
  confidence_80: [number, number]
  confidence_90: [number, number]
}

interface PredictionAPIResponse {
  forecast_today_hourly: Record<string, HourlyForecast[]>
}

// -------------------------------------------------------------
// External DB endpoints
// -------------------------------------------------------------
const DB_BASE = 'https://zynapse.zkagi.ai/daily-cumulative'
const DB_ALL_URL = `${DB_BASE}/all`
const DB_MONTH_URL = `${DB_BASE}/month`
const DB_GET_URL = `${DB_BASE}/get`
const DB_API_KEY = 'zk-123321'

// -------------------------------------------------------------
// Helpers (IST date/time, normalizers, pivot)
// -------------------------------------------------------------
const IST = 'Asia/Kolkata'

const istNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: IST }))
const istYYYYMMDD = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const istMonthMM = (d = istNow()) => String(d.getMonth() + 1).padStart(2, '0')

type RawRow = Record<string, any>

const numberish = (...c: any[]) => {
  for (const x of c) {
    if (typeof x === 'number' && !Number.isNaN(x)) return x
    if (typeof x === 'string' && x.trim() !== '' && !Number.isNaN(+x)) return +x
  }
  return undefined
}

const TOKENS_DEF = [
  { key: 'btc', sym: 'BTC' },
  { key: 'eth', sym: 'ETH' },
  { key: 'sol', sym: 'SOL' },
]

// Turn API records into TokenData[] with proper starting balances
function pivotPortfolioRecordsToTokens(
  rows: RawRow[], 
  startBalances?: Record<'BTC'|'ETH'|'SOL', number>
): TokenData[] {
  const sorted = [...rows].sort(
    (a, b) => new Date(a.date ?? a.timestamp ?? 0).getTime() - new Date(b.date ?? b.timestamp ?? 0).getTime(),
  )

  return TOKENS_DEF.map(({ key, sym }) => {
    const trades: TokenTradeData[] = sorted.map((r, idx) => {
      const endBalance = numberish(r[`${key}_ending_balance`]) ?? 100
      const tokenCumulative = numberish(r[`${key}_cumulative`]) ?? 0
      
      // Calculate start balance
      let startBalance: number
      if (idx === 0) {
        // First record: use provided start balance or default to 100
        startBalance = startBalances?.[sym as 'BTC'|'ETH'|'SOL'] ?? 100
      } else {
        // Subsequent records: use previous day's end balance
        const prevRecord = sorted[idx - 1]
        startBalance = numberish(prevRecord[`${key}_ending_balance`]) ?? 100
      }
      
      const dailyGain = endBalance - startBalance
      const dailyPct = startBalance !== 0 ? (dailyGain / startBalance) * 100 : 0
      
      // For monthly/all-time, cumulative return is based on original 100 investment
      // For this period's calculation, it's based on the period start
      const periodStartBalance = startBalances?.[sym as 'BTC'|'ETH'|'SOL'] ?? 100
      const cumulativeReturn = ((endBalance - periodStartBalance) / periodStartBalance) * 100

      const t = new Date(r.date ?? r.timestamp ?? new Date())
      const label = t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: IST })

      return {
        day: idx + 1,
        date: label,
        trades: Math.max(1, Math.floor(numberish(r.total_trades) ?? 1)),
        dailyPnLPercent: dailyPct,
        startBalance: startBalance,
        endBalance: endBalance,
        dailyGain: dailyGain,
        cumulativeReturn: cumulativeReturn,
      }
    })

    const last = trades[trades.length - 1]
    const lastRow = sorted[sorted.length - 1]
    const periodStartBalance = startBalances?.[sym as 'BTC'|'ETH'|'SOL'] ?? 100
    
    // Get total cumulative PnL from API
    const totalCumulativePnL = numberish(lastRow?.[`${key}_cumulative`]) ?? 0
    
    return {
      symbol: sym,
      price: 0,
      cumulativePnL: last ? last.endBalance - periodStartBalance : 0,
      cumulativePercent: last ? ((last.endBalance - periodStartBalance) / periodStartBalance) * 100 : 0,
      volume: 0,
      trades,
      totalCumulativePnL, // Total cumulative from start of trading
    }
  })
}

// Aggregate chart from per-token trades (sum daily gains as percentages)
function aggregateChartFromTokens(tokens: TokenData[], from?: Date, to?: Date): PnLData[] {
  const sums = new Map<string, number>()
  tokens.forEach((t) =>
    t.trades.forEach((tr) => {
      sums.set(tr.date, (sums.get(tr.date) || 0) + tr.dailyPnLPercent)
    }),
  )

  // If a fixed day range is given, iterate day-by-day in IST
  if (from && to) {
    const out: PnLData[] = []
    const d = new Date(from)
    while (d <= to) {
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: IST })
      const ts = new Date(
        new Date(d.toLocaleString('en-US', { timeZone: IST })).toISOString(),
      ).toISOString()
      out.push({ timestamp: ts, value: sums.get(label) ?? 0 })
      d.setDate(d.getDate() + 1)
    }
    return out
  }

  // Otherwise just map known labels to a rough timestamp (this year)
  const year = istNow().getFullYear()
  return Array.from(sums.entries()).map(([label, v]) => {
    const parsed = new Date(`${label} ${year}`)
    return { timestamp: isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString(), value: v }
  })
}

// Convert forecast data to hourly trades with proper chaining of balances
function convertForecastToHourlyTrades(
  fth: Record<string, HourlyForecast[]>,
  prevBalances: Record<'BTC'|'ETH'|'SOL', number>
): TokenData[] {
  const symbols = ['BTC', 'ETH', 'SOL'] as const
  
  return symbols.map((sym) => {
    const rows = fth[sym] ?? []
    const dayStartBalance = prevBalances[sym] ?? 100 // Yesterday's final balance
    
    // FIXED: Build trades array iteratively to avoid scope issues
    const trades: TokenTradeData[] = []
    let currentBalance = dayStartBalance // Track balance as we go
    
    rows.forEach((row, idx) => {
      // Calculate hourly return
      const ret = (row.forecast_price - row.entry_price) / (row.entry_price || 1)
      
      // Start balance is the current running balance
      const startBalance = currentBalance
      const end = startBalance * (1 + ret)
      const gain = end - startBalance
      
      // Update current balance for next iteration
      currentBalance = end
      
      // Cumulative return is relative to day's starting point
      const cumulativeReturn = ((end - dayStartBalance) / dayStartBalance) * 100
      
      const t = new Date(row.time)
      const label = t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      
      trades.push({
        day: idx + 1,
        date: label,
        trades: 1,
        dailyPnLPercent: ret * 100, // This hour's return percentage
        startBalance: startBalance,
        endBalance: end,
        dailyGain: gain, // This hour's gain/loss in dollars
        cumulativeReturn, // Cumulative return since start of day
      })
    })
    
    const lastPrice = rows.length ? rows[rows.length - 1].current_price : 0
    const last = trades[trades.length - 1]
    
    return {
      symbol: sym,
      price: lastPrice,
      cumulativePnL: last ? last.endBalance - dayStartBalance : 0,
      cumulativePercent: last ? last.cumulativeReturn : 0,
      volume: 0,
      trades,
    }
  })
}

// -------------------------------------------------------------
// External DB fetchers (updated to use real API)
// -------------------------------------------------------------
async function fetchAllTimeFromDB(): Promise<{ tokens: TokenData[]; chart: PnLData[] }> {
  try {
    const r = await fetch(DB_ALL_URL, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'api-key': DB_API_KEY },
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const json = await r.json()
    const rows: RawRow[] = Array.isArray(json) ? json : (json?.records || json?.data || json?.items || [])
    
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('No data received from API')
    }
    
    const tokens = pivotPortfolioRecordsToTokens(rows)
    const chart = aggregateChartFromTokens(tokens)
    return { tokens, chart }
  } catch (e) {
    console.error('fetchAllTimeFromDB error:', e)
    throw e
  }
}

// Get the last day of previous month's ending balances
async function fetchPrevMonthEndBalances(): Promise<Record<'BTC'|'ETH'|'SOL', number>> {
  const now = istNow()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const date = istYYYYMMDD(lastDayOfPrevMonth)
  
  try {
    const r = await fetch(`${DB_GET_URL}?date=${encodeURIComponent(date)}`, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'api-key': DB_API_KEY },
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const row = await r.json() as RawRow
    return {
      BTC: numberish(row.btc_ending_balance) ?? 100,
      ETH: numberish(row.eth_ending_balance) ?? 100,
      SOL: numberish(row.sol_ending_balance) ?? 100,
    }
  } catch (e) {
    console.error('fetchPrevMonthEndBalances error:', e)
    return { BTC: 100, ETH: 100, SOL: 100 }
  }
}

// --- add this helper near your other helpers ---
function firstDayOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function lastDayOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/**
 * Fetch the starting balances for a given month, i.e., the
 * ending balances of the month **before** `targetMonthDate`.
 * Example: target = 2025-09-XX  => fetch 2025-08-31 row
 */
async function fetchMonthStartBalances(
  targetMonthDate: Date
): Promise<Record<'BTC'|'ETH'|'SOL', number>> {
  // prev month’s last calendar day
  const prevMonthLastDay = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), 0);
  const date = istYYYYMMDD(prevMonthLastDay);

  try {
    const r = await fetch(`${DB_GET_URL}?date=${encodeURIComponent(date)}`, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'api-key': DB_API_KEY },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const row = await r.json() as RawRow;
    return {
      BTC: numberish(row.btc_ending_balance) ?? 100,
      ETH: numberish(row.eth_ending_balance) ?? 100,
      SOL: numberish(row.sol_ending_balance) ?? 100,
    };
  } catch (e) {
    console.error('fetchMonthStartBalances error:', e);
    return { BTC: 100, ETH: 100, SOL: 100 };
  }
}


// async function fetchMonthlyFromDB(): Promise<{ tokens: TokenData[]; chart: PnLData[] }> {
//   const mm = istMonthMM()
//   const monthUrl = `${DB_MONTH_URL}?month=${encodeURIComponent(mm)}`
//   const nowI = istNow()
//   const start = new Date(nowI.getFullYear(), nowI.getMonth(), 1)
//   const end = new Date(nowI.getFullYear(), nowI.getMonth(), nowI.getDate())

//   try {
//     // Get previous month's ending balances first
//     const prevMonthBalances = await fetchPrevMonthEndBalances()
//     console.log('Previous month ending balances:', prevMonthBalances)

//     const r = await fetch(monthUrl, {
//       method: 'GET',
//       cache: 'no-store',
//       headers: { 'api-key': DB_API_KEY },
//     })
//     if (!r.ok) throw new Error(`HTTP ${r.status}`)
//     const json = await r.json()
//     const rows: RawRow[] = Array.isArray(json) ? json : (json?.records || json?.data || json?.items || [])
    
//     if (!Array.isArray(rows) || rows.length === 0) {
//       // Fallback: filter /all to the current IST month
//       const allData = await fetchAllTimeFromDB()
//       const currentMonth = istMonthMM()
//       const filteredRows = allData.tokens.length > 0 ? 
//         (allData.tokens[0]?.trades || [])
//           .map((_, i) => {
//             const anyToken = allData.tokens[0]
//             const tradeData = anyToken?.trades[i]
//             if (!tradeData) return null
            
//             // Parse the date from the trade to check if it's current month
//             const label = tradeData.date
//             const parsed = new Date(`${label} ${istNow().getFullYear()}`)
//             const m = String(parsed.getMonth() + 1).padStart(2, '0')
            
//             if (m !== currentMonth) return null
            
//             // Create synthetic row from trade data
//             const row: RawRow = {
//               date: parsed.toISOString(),
//               btc_ending_balance: allData.tokens.find(t => t.symbol === 'BTC')?.trades[i]?.endBalance,
//               eth_ending_balance: allData.tokens.find(t => t.symbol === 'ETH')?.trades[i]?.endBalance,
//               sol_ending_balance: allData.tokens.find(t => t.symbol === 'SOL')?.trades[i]?.endBalance,
//               total_trades: tradeData.trades,
//             }
//             return row
//           })
//           .filter(Boolean) as RawRow[]
//         : []
        
//       if (filteredRows.length === 0) {
//         throw new Error('No monthly data available')
//       }
      
//       const tokens = pivotPortfolioRecordsToTokens(filteredRows, prevMonthBalances)
//       const chart = aggregateChartFromTokens(tokens, start, end)
//       return { tokens, chart }
//     }
    
//     const tokens = pivotPortfolioRecordsToTokens(rows, prevMonthBalances)
//     const chart = aggregateChartFromTokens(tokens, start, end)
//     return { tokens, chart }
//   } catch (e) {
//     console.error('fetchMonthlyFromDB error:', e)
//     throw e
//   }
// }

// --- replace your fetchMonthlyFromDB with this version ---
async function fetchMonthlyFromDB(): Promise<{ tokens: TokenData[]; chart: PnLData[] }> {
  const nowI = istNow();

  // Decide which month to show:
  // - If today is the 1st, prefer previous month.
  // - Otherwise start with current month, but we will fall back to previous if 404/empty.
  const isFirstOfMonth = nowI.getDate() === 1;
  const currentMonthDate = new Date(nowI.getFullYear(), nowI.getMonth(), 1);
  const previousMonthDate = new Date(nowI.getFullYear(), nowI.getMonth() - 1, 1);

  // Start by targeting the intended month (prev on 1st, else current)
  let targetMonthDate = isFirstOfMonth ? previousMonthDate : currentMonthDate;

  // Helper to build range + month param for a given target month
  const buildMonthQuery = (d: Date) => {
    const mm = String(d.getMonth() + 1).padStart(2, '0'); // "01".."12"
    const monthUrl = `${DB_MONTH_URL}?month=${encodeURIComponent(mm)}`;

    // Chart range:
    // - For current month → from 1st to "today"
    // - For any past month → 1st to last day of that month
    const sameMonthAsNow = d.getFullYear() === nowI.getFullYear() && d.getMonth() === nowI.getMonth();
    const start = firstDayOfMonth(d);
    const end = sameMonthAsNow ? nowI : lastDayOfMonth(d);

    return { monthUrl, start, end };
  };

  // Try fetching a specific month; on 404/empty and if we were targeting current month, retry with previous month once.
  const loadForTargetMonth = async (d: Date) => {
    const { monthUrl, start, end } = buildMonthQuery(d);

    // Use the **month-start balances** (i.e., end of the month before `d`)
    const monthStartBalances = await fetchMonthStartBalances(d);
    console.log('Month start balances (prev month end):', d, monthStartBalances);

    try {
      const r = await fetch(monthUrl, {
        method: 'GET',
        cache: 'no-store',
        headers: { 'api-key': DB_API_KEY },
      });

      let rows: RawRow[] = [];
      if (r.ok) {
        const json = await r.json();
        rows = Array.isArray(json) ? json : (json?.records || json?.data || json?.items || []);
      }

      // If 404 or empty rows, return a special marker so caller can decide to fall back
      if (!r.ok || !Array.isArray(rows) || rows.length === 0) {
        return { ok: false as const, rows: [] as RawRow[], start, end, balances: monthStartBalances };
      }

      // Happy path
      const tokens = pivotPortfolioRecordsToTokens(rows, monthStartBalances);
      const chart = aggregateChartFromTokens(tokens, start, end);
      return { ok: true as const, tokens, chart };
    } catch (e) {
      console.error('fetchMonthlyFromDB error:', e);
      return { ok: false as const, rows: [] as RawRow[], start, end, balances: monthStartBalances };
    }
  };

  // 1) Try intended month
  let attempt = await loadForTargetMonth(targetMonthDate);

  // 2) If failed/empty AND we started with current month, fall back to previous month once
  const startedWithCurrent =
    targetMonthDate.getFullYear() === currentMonthDate.getFullYear() &&
    targetMonthDate.getMonth() === currentMonthDate.getMonth();

  if (!attempt.ok && startedWithCurrent) {
    targetMonthDate = previousMonthDate;
    attempt = await loadForTargetMonth(targetMonthDate);
  }

  // 4) Success path
  return attempt as { tokens: TokenData[]; chart: PnLData[] };
}


// Daily: fetch yesterday's ending balances (IST) for BTC/ETH/SOL
async function fetchPrevDayStartBalances(): Promise<Record<'BTC'|'ETH'|'SOL', number>> {
  const y = istNow()
  y.setDate(y.getDate() - 1)
  const date = istYYYYMMDD(y)
  try {
    const r = await fetch(`${DB_GET_URL}?date=${encodeURIComponent(date)}`, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'api-key': DB_API_KEY },
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const row = await r.json() as RawRow
    return {
      BTC: numberish(row.btc_ending_balance) ?? 100,
      ETH: numberish(row.eth_ending_balance) ?? 100,
      SOL: numberish(row.sol_ending_balance) ?? 100,
    }
  } catch (e) {
    console.error('fetchPrevDayStartBalances error:', e)
    return { BTC: 100, ETH: 100, SOL: 100 }
  }
}

// Find the latest non-empty ending balance for a given key across all rows
function latestEndingBalance(rows: RawRow[], key: 'btc'|'eth'|'sol'): number {
  for (let i = rows.length - 1; i >= 0; i--) {
    const v = numberish(rows[i]?.[`${key}_ending_balance`]);
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
  }
  return 100; // fallback if missing
}

// All-time = latest ending balance - 100, portfolio = sum
async function fetchAllTimeTotalsFromAll(): Promise<Record<'BTC'|'ETH'|'SOL', number> & { portfolio: number }> {
  const r = await fetch(DB_ALL_URL, {
    method: 'GET',
    cache: 'no-store',
    headers: { 'api-key': DB_API_KEY },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const json = await r.json();
  const rows: RawRow[] = Array.isArray(json) ? json : (json?.records || json?.data || json?.items || []);

  const sorted = [...rows].sort(
    (a, b) => new Date(a.date ?? a.timestamp ?? 0).getTime() - new Date(b.date ?? b.timestamp ?? 0).getTime(),
  );

  const lastBTC = latestEndingBalance(sorted, 'btc');
  const lastETH = latestEndingBalance(sorted, 'eth');
  const lastSOL = latestEndingBalance(sorted, 'sol');

  const BTC = lastBTC - 100;
  const ETH = lastETH - 100;
  const SOL = lastSOL - 100;

  return { BTC, ETH, SOL, portfolio: BTC + ETH + SOL };
}

// Get latest data for cumulative totals — computed from /all ending balances
async function fetchLatestCumulativeTotals(): Promise<Record<'BTC'|'ETH'|'SOL', number> & { portfolio: number }> {
  return fetchAllTimeTotalsFromAll();
}

// SWR fetcher for prediction API
const swrFetcher = (url: string) =>
  fetch(url, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  })

// -------------------------------------------------------------
// UI Components
// -------------------------------------------------------------
const tokenColors: Record<string, string> = { BTC: '#F7931A', ETH: '#627EEA', SOL: '#14F195' }

const TimeFrameToggle: React.FC<{ timeFrame: TimeFrame; onChange: (t: TimeFrame) => void }> = ({ timeFrame, onChange }) => (
  <div className="flex bg-dsBgAlt rounded-xl p-1 border border-dsBorder">
    {(['daily', 'monthly', 'all-time'] as TimeFrame[]).map((v) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          timeFrame === v
            ? 'bg-dsPurple text-white shadow-lg shadow-dsPurple/25'
            : 'text-dsMuted hover:text-white hover:bg-dsBorder/50'
        }`}
      >
        {v === 'all-time' ? 'All-time' : v.charAt(0).toUpperCase() + v.slice(1)}
      </button>
    ))}
  </div>
)

const CumulativePnLCard: React.FC<{ 
  timeFrame: TimeFrame; 
  tokenData?: TokenData[]; 
  value?: number; // not used anymore; keeping for compatibility
  cumulativeTotals?: Record<'BTC'|'ETH'|'SOL', number> & { portfolio: number };
}> = ({
  timeFrame,
  tokenData = [],
  cumulativeTotals,
}) => {
  // Helpers
  const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

  // ---- Aggregate (big number) ----
  // For all-time: use /all derived totals against $300 initial (100 each)
  const allTimeInvested = 300;
  const allTimeTotalPnL = cumulativeTotals?.portfolio ?? 0;
  const allTimePct = allTimeInvested > 0 ? (allTimeTotalPnL / allTimeInvested) * 100 : 0;

  // For daily/monthly: compute against the **actual period start balances**
  const periodStartSum = tokenData.reduce(
    (s, t) => s + (t.trades?.[0]?.startBalance ?? 100),
    0
  );
  const periodCumulativeDollar = tokenData.reduce(
    (s, t) => s + (t.cumulativePnL ?? 0),
    0
  );
  const periodPct = periodStartSum > 0 ? (periodCumulativeDollar / periodStartSum) * 100 : 0;

  // Choose what to display based on timeframe
  const aggPct = timeFrame === 'all-time' ? allTimePct : periodPct;
  const isPositive = aggPct >= 0;

  // Title text exactly as requested
  const title =
    timeFrame === 'daily'
      ? 'Daily PnL Performance'
      : timeFrame === 'monthly'
      ? 'Monthly PnL Performance'
      : 'All Time PnL Performance';

  // Small cards: show period-aware % per token
  const tokenColors: Record<string, string> = { BTC: '#F7931A', ETH: '#627EEA', SOL: '#14F195' };
  const periodLabel =
    timeFrame === 'daily' ? 'Daily return' : timeFrame === 'monthly' ? 'Monthly return' : 'All-time return';

  const spark = (t?: TokenData) =>
    t?.trades?.map((tr, i) => ({ x: i, y: tr.cumulativeReturn })) ?? [];

  return (
    <div className="ds-card h-full">
      <h3 className="text-sm font-medium text-dsMuted">{title}</h3>

      <div className="flex items-end mt-3 space-x-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPositive ? 'bg-dsGreen/15' : 'bg-red-500/15'}`}>
          {isPositive ? <TrendingUp className="w-6 h-6 text-dsGreen" /> : <TrendingDown className="w-6 h-6 text-red-400" />}
        </div>
        <span className={`text-5xl font-extrabold tracking-tight ${isPositive ? 'text-dsGreen' : 'text-red-400'}`}>
          {fmtPct(aggPct)}
        </span>
      </div>

      <div className="mt-2 text-sm text-dsMuted">
        Portfolio cumulative return
      </div>

      {/* Per-token period blocks */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['BTC', 'ETH', 'SOL'] as const).map((sym) => {
          const t = tokenData.find((x) => x.symbol.toUpperCase() === sym);
          // For all-time, prefer server-derived totals; for other frames, use t.cumulativePercent
          const pct =
            timeFrame === 'all-time'
              ? (cumulativeTotals?.[sym] ?? 0) // equals % because base = 100
              : (t?.cumulativePercent ?? 0);

          const gid = `grad-${sym}-${timeFrame}`;

          return (
            <div key={sym} className="rounded-xl border border-dsBorder bg-dsBg p-4 flex flex-col justify-between min-h-[120px]
                                      hover:border-dsPurple/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{sym}</span>
                <span className={`text-lg font-bold ${pct >= 0 ? 'text-dsGreen' : 'text-red-400'}`}>
                  {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                </span>
              </div>

              <div className="text-xs text-dsMuted mt-1">
                {periodLabel}
              </div>

              <div className="mt-3 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spark(t)} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={tokenColors[sym]} stopOpacity={0.6} />
                        <stop offset="100%" stopColor={tokenColors[sym]} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="y" stroke={tokenColors[sym]} strokeWidth={1.5} fill={`url(#${gid})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// const CumulativePnLCard: React.FC<{ 
//   timeFrame: TimeFrame; 
//   tokenData?: TokenData[]; 
//   value?: number;
//   cumulativeTotals?: Record<'BTC'|'ETH'|'SOL', number> & { portfolio: number };
// }> = ({
//   timeFrame,
//   tokenData = [],
//   value = 0,
//   cumulativeTotals,
// }) => {
//   // Always show all-time totals on the card
//   const allTimeTotalPnL = cumulativeTotals?.portfolio ?? 0;
//   const totalInvested = 300; // $100 each for BTC/ETH/SOL

//   const aggPct = totalInvested > 0 ? (allTimeTotalPnL / totalInvested) * 100 : 0;
//   const isPositive = aggPct >= 0;
//   const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

//   const spark = (t?: TokenData) =>
//     t?.trades?.map((tr, i) => ({ x: i, y: tr.cumulativeReturn })) ?? [];

//   return (
//     <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 h-full">
//       {/* <h3 className="text-sm font-medium text-gray-400">
//         Portfolio Performance
//       </h3> */}
//        <h3 className="text-sm font-medium text-gray-400">
//         {timeFrame === 'daily' ? 'Daily' : timeFrame === 'monthly' ? 'Monthly' : 'All Time'} PnL Performance
//       </h3>

//       <div className="flex items-end mt-3 space-x-3">
//         {isPositive ? <TrendingUp className="w-8 h-8 text-green-500" /> : <TrendingDown className="w-8 h-8 text-red-500" />}
//         <span className={`text-6xl font-extrabold tracking-tight ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
//           {fmtPct(aggPct)}
//         </span>
//       </div>

//       <div className="mt-2 text-sm text-gray-400">
//         Portfolio cumulative return
//       </div>

//       {/* Per-token all-time blocks */}
//       <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {(['BTC', 'ETH', 'SOL'] as const).map((sym) => {
//           const t = tokenData.find((x) => x.symbol.toUpperCase() === sym);
//           const allTimeVal = cumulativeTotals?.[sym] ?? 0;        // $ PnL all-time
//           const pct = (allTimeVal / 100) * 100;                   // % vs $100 start
//           const pos = pct >= 0;
//           const gid = `grad-${sym}-${timeFrame}`;

//           return (
//             <div key={sym} className="rounded-xl border border-gray-700 bg-gray-900/40 p-4 flex flex-col justify-between min-h-[120px]">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-bold text-white">{sym}</span>
//                 <span className={`text-lg font-bold ${pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                   {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
//                 </span>
//               </div>

//               <div className="text-xs text-gray-500 mt-1">
//                 All-time return
//               </div>

//               <div className="mt-3 h-10">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <AreaChart data={spark(t)} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
//                     <defs>
//                       <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="0%" stopColor={tokenColors[sym]} stopOpacity={0.6} />
//                         <stop offset="100%" stopColor={tokenColors[sym]} stopOpacity={0.05} />
//                       </linearGradient>
//                     </defs>
//                     <Area type="monotone" dataKey="y" stroke={tokenColors[sym]} strokeWidth={1.5} fill={`url(#${gid})`} />
//                   </AreaChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

const PnLChart: React.FC<{ data: PnLData[]; timeFrame: TimeFrame }> = ({ data, timeFrame }) => {
  const fmtX = (ts: string) => {
    const d = new Date(ts)
    if (timeFrame === 'daily') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    if (timeFrame === 'monthly') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  return (
    <div className="ds-card h-full">
      <h3 className="ds-heading-sm mb-4">
        {timeFrame === 'daily' ? 'Daily' : timeFrame === 'monthly' ? 'Monthly' : 'All Time'} PnL Plots
      </h3>
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2333" />
            <XAxis dataKey="timestamp" tickFormatter={fmtX} className="text-xs" stroke="#6b7280" />
            <YAxis tickFormatter={(v) => `${v.toFixed(1)}%`} className="text-xs" stroke="#6b7280" />
            <Tooltip
              labelFormatter={(ts) => new Date(ts as string).toLocaleString('en-US')}
              formatter={(v: number) => [`${v >= 0 ? '+' : ''}${v.toFixed(2)}%`, 'Return']}
              contentStyle={{
                backgroundColor: '#0b0e17',
                border: '1px solid #1e2333',
                borderRadius: 12,
                color: 'white',
              }}
            />
            <Line type="monotone" dataKey="value" stroke="#7c6af7" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#7c6af7' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const TokenTableModal: React.FC<{ tokenData: TokenData; timeFrame: TimeFrame; onClose: () => void }> = ({
  tokenData,
  timeFrame,
  onClose,
}) => {
  return (
    <div className="ds-modal-backdrop">
      <div className="ds-modal w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-dsBorder">
          <h2 className="ds-heading-md">
            {tokenData.symbol} - {timeFrame} Details
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-dsBorder/50 hover:bg-dsBorder flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-dsMuted" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="overflow-x-auto">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Time</th>
                  <th>Trades</th>
                  <th>Period Return %</th>
                  <th>Cumulative Return %</th>
                </tr>
              </thead>
              <tbody>
                {tokenData.trades.map((tr, i) => (
                  <tr key={i}>
                    <td>{tr.day}</td>
                    <td>{tr.date}</td>
                    <td>{tr.trades}</td>
                    <td className={`font-bold text-lg ${tr.dailyPnLPercent >= 0 ? 'text-dsGreen' : 'text-red-400'}`}>
                      {tr.dailyPnLPercent >= 0 ? '+' : ''}{tr.dailyPnLPercent.toFixed(3)}%
                    </td>
                    <td className={`font-bold text-lg ${tr.cumulativeReturn >= 0 ? 'text-dsGreen' : 'text-red-400'}`}>
                      {tr.cumulativeReturn >= 0 ? '+' : ''}{tr.cumulativeReturn.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const TokenTable: React.FC<{ tokenData: TokenData; timeFrame: TimeFrame }> = ({ tokenData, timeFrame }) => {
  const [isMaximized, setIsMaximized] = useState(false)
  const showMaximize = timeFrame === 'monthly' || timeFrame === 'all-time'

  return (
    <>
      <div className="ds-card flex flex-col h-[500px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-dsPurple/15 flex items-center justify-center">
              <Activity className="w-5 h-5 text-dsPurple-light" />
            </div>
            <h3 className="ds-heading-sm">{tokenData.symbol}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-dsMuted">Performance</span>
            {showMaximize && (
              <button
                onClick={() => setIsMaximized(true)}
                className="w-8 h-8 rounded-lg hover:bg-dsBorder/50 flex items-center justify-center transition-colors"
                title="Maximize"
              >
                <Maximize2 className="w-4 h-4 text-dsMuted" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs table-fixed">
            <thead className="sticky top-0 bg-dsBgAlt">
              <tr className="border-b border-dsBorder text-dsMuted">
                <th className="text-left py-2 w-12 font-medium">Step</th>
                <th className="text-left py-2 w-20 font-medium">Time</th>
                <th className="text-left py-2 w-16 font-medium">Trades</th>
                <th className="text-left py-2 w-24 font-medium">Period Return %</th>
                <th className="text-left py-2 w-24 font-medium">Cumulative %</th>
              </tr>
            </thead>
            <tbody>
              {tokenData.trades.map((tr, i) => (
                <tr key={i} className="border-b border-dsBorder/50 hover:bg-dsBorder/30 transition-colors">
                  <td className="py-2 text-white/80">{tr.day}</td>
                  <td className="py-2 text-white/80">{tr.date}</td>
                  <td className="py-2 text-white/80">{tr.trades}</td>
                  <td className={`py-2 font-bold text-base ${tr.dailyPnLPercent >= 0 ? 'text-dsGreen' : 'text-red-400'}`}>
                    {tr.dailyPnLPercent >= 0 ? '+' : ''}{tr.dailyPnLPercent.toFixed(3)}%
                  </td>
                  <td className={`py-2 font-bold text-base ${tr.cumulativeReturn >= 0 ? 'text-dsGreen' : 'text-red-400'}`}>
                    {tr.cumulativeReturn >= 0 ? '+' : ''}{tr.cumulativeReturn.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isMaximized && (
        <TokenTableModal tokenData={tokenData} timeFrame={timeFrame} onClose={() => setIsMaximized(false)} />
      )}
    </>
  )
}

// -------------------------------------------------------------
// Main Dashboard
// -------------------------------------------------------------
const PnLDashboard: React.FC = () => {
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as string || 'en'
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('all-time')
  const [cumulativePnL, setCumulativePnL] = useState<number>(0)
  const [chartData, setChartData] = useState<PnLData[]>([])
  const [tokenData, setTokenData] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cumulativeTotals, setCumulativeTotals] = useState<Record<'BTC'|'ETH'|'SOL', number> & { portfolio: number }>()

  // Fetch prediction data for daily view
  const { data: prediction, error: predictionError, isLoading: predictionLoading } = useSWR<PredictionAPIResponse>(
    timeFrame === 'daily' ? '/api/today-prediction' : null,
    swrFetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, shouldRetryOnError: true }
  )

  // Load cumulative totals for display
  useEffect(() => {
    fetchLatestCumulativeTotals().then(setCumulativeTotals).catch(console.error)
  }, [])

  const loadData = async (frame: TimeFrame) => {
    setLoading(true)
    setError(null)
    try {
      if (frame === 'monthly') {
        const { tokens, chart } = await fetchMonthlyFromDB()
        setTokenData(tokens)
        setChartData(chart)
        setCumulativePnL(tokens.reduce((s, t) => s + (t?.cumulativePnL || 0), 0))
      } else if (frame === 'all-time') {
        const { tokens, chart } = await fetchAllTimeFromDB()
        setTokenData(tokens)
        setChartData(chart)
        setCumulativePnL(tokens.reduce((s, t) => s + (t?.cumulativePnL || 0), 0))
      } else {
        // Daily view handled by useEffect below
        setTokenData([])
        setChartData([])
        setCumulativePnL(0)
      }
    } catch (e) {
      console.error('Error loading data:', e)
      setError(e instanceof Error ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(timeFrame)
  }, [timeFrame])

  // Handle daily prediction data
  useEffect(() => {
    if (timeFrame !== 'daily') return
    if (!prediction?.forecast_today_hourly) return

    let cancelled = false
    
    ;(async () => {
      try {
        // Get yesterday's final balances
        const prevBalances = await fetchPrevDayStartBalances()
        console.log('Previous day balances:', prevBalances)
        
        // Convert forecast to hourly trades
        const newTokens = convertForecastToHourlyTrades(
          prediction.forecast_today_hourly,
          prevBalances
        )
        
        // Create chart data from forecasts (use percentage returns)
        const syntheticChart: PnLData[] = (prediction.forecast_today_hourly['BTC'] ?? []).map((r) => ({
          timestamp: r.time,
          value: ((r.forecast_price - r.entry_price) / r.entry_price) * 100, // Percentage return
        }))
        
        if (cancelled) return
        
        setTokenData(newTokens)
        setChartData(syntheticChart)
        setCumulativePnL(newTokens.reduce((s, t) => s + (t?.cumulativePnL || 0), 0))
      } catch (e) {
        console.error('Error processing daily prediction data:', e)
        setError('Failed to process daily prediction data')
      }
    })()

    return () => { cancelled = true }
  }, [prediction, timeFrame])

  return (
    <div className="min-h-screen bg-dsBg">
      {/* Header */}
      <div className="ds-topbar sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/${lang}/home`)}
            className="w-9 h-9 rounded-lg bg-dsBorder/50 hover:bg-dsBorder flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-dsMuted" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-dsPurple/15 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-dsPurple-light" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Performance Dashboard</h1>
            <p className="text-xs text-dsMuted">Track your portfolio performance</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full bg-dsGreen/10 border border-dsGreen/20">
            <span className="text-xs font-medium text-dsGreen flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-dsGreen rounded-full animate-pulse" />
              Live Data
            </span>
          </div>
          <TimeFrameToggle timeFrame={timeFrame} onChange={setTimeFrame} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(loading || (timeFrame === 'daily' && predictionLoading)) && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-dsPurple/30 border-t-dsPurple rounded-full animate-spin mx-auto" />
            <p className="text-dsMuted mt-4">
              {timeFrame === 'daily' ? 'Loading hourly predictions...' : 'Loading performance data...'}
            </p>
          </div>
        )}

        {(error || (timeFrame === 'daily' && predictionError)) && (
          <div className="ds-alert-error mb-6">
            <p className="text-sm">
              Error: {error || (predictionError instanceof Error ? predictionError.message : 'Failed to load predictions')}
            </p>
          </div>
        )}

        {!loading && !error && !(timeFrame === 'daily' && predictionLoading) && (
          <>
            {/* Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <CumulativePnLCard
                timeFrame={timeFrame}
                tokenData={tokenData}
                value={cumulativePnL}
                cumulativeTotals={cumulativeTotals}
              />
              <PnLChart data={chartData} timeFrame={timeFrame} />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {tokenData.map((t) => (
                <TokenTable key={t.symbol} tokenData={t} timeFrame={timeFrame} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PnLDashboard