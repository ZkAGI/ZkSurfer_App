// // 'use client'
// // import React, { useRef, useEffect, useState } from 'react'
// // import {
// //   createChart,
// //   CandlestickSeries,
// //   HistogramSeries,
// //   LineSeries,
// //   UTCTimestamp,
// // } from 'lightweight-charts'
// // import {
// //   SMA,
// //   EMA,
// //   RSI,
// //   MACD,
// //   BollingerBands,
// //   ATR,
// // } from 'technicalindicators'
// // import { useTradingStore } from '@/stores/trading-store'
// // import { IndicatorSelector } from './IndicatorSelector'
// // import { IndicatorBadge } from './IndicatorBadge'

// // interface Candle {
// //   time: string
// //   open: number
// //   high: number
// //   low: number
// //   close: number
// //   volume: number
// // }

// // export function TradingChart({ width = 720, height = 450 }) {
// //   const container = useRef<HTMLDivElement>(null)
// //   const [indicators, setIndicators] = useState<{ name: string, visible: boolean }[]>([])
// //   const [interval, setInterval] = useState<'1m' | '5m' | '15m' | '1h' | '1d'>('1h')

// //   const [ohlc, setOhlc] = useState<{
// //     o: number
// //     h: number
// //     l: number
// //     c: number
// //     change: number
// //     percent: number
// //   } | null>(null)

// //   const raw = useTradingStore(s => s.candlestickData) as Candle[]
// //   const candles = raw.map(c => ({
// //     time: (new Date().setHours(parseInt(c.time), 0, 0, 0) / 1000) as UTCTimestamp,
// //     open: c.open,
// //     high: c.high,
// //     low: c.low,
// //     close: c.close,
// //     volume: c.volume,
// //   }))

// //   const handleAddIndicator = (name: string) => {
// //     setIndicators(prev => {
// //       if (prev.find(i => i.name === name)) return prev
// //       return [...prev, { name, visible: true }]
// //     })
// //   }

// //   useEffect(() => {
// //     if (!container.current) return
// //     const chart = createChart(container.current, {
// //       width,
// //       height,
// //       layout: { background: '#1e1e2e', textColor: '#d1d4dc' },
// //       grid: {
// //         vertLines: { color: '#2f2f3f' },
// //         horzLines: { color: '#2f2f3f' },
// //       },
// //     })

// //     const priceSeries = chart.addSeries(CandlestickSeries, {
// //       upColor: '#26a69a',
// //       downColor: '#ef5350',
// //       borderVisible: false,
// //     })
// //     priceSeries.setData(candles)
// //     priceSeries.priceScale().applyOptions({ scaleMargins: { top: 0.1, bottom: 0.3 } })

// //     chart.subscribeCrosshairMove(param => {
// //       if (!param?.seriesData || !priceSeries) return

// //       const data = param.seriesData.get(priceSeries)
// //       if (!data || typeof data !== 'object') return

// //       const { open, high, low, close } = data as any
// //       const change = close - open
// //       const percent = (change / open) * 100

// //       setOhlc({ o: open, h: high, l: low, c: close, change, percent })
// //     })

// //     const volumeSeries = chart.addSeries(HistogramSeries, {
// //       priceFormat: { type: 'volume' },
// //       priceScaleId: '',
// //     })
// //     volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.7, bottom: 0 } })

// //     const volumeData = candles.map((bar, i) => {
// //       const prev = candles[i - 1]
// //       const color = !prev || bar.close >= prev.close ? '#26a69a' : '#ef5350'
// //       return { time: bar.time, value: bar.volume, color }
// //     })
// //     volumeSeries.setData(volumeData)

// //     const closes = candles.map(c => c.close)
// //     const highs = candles.map(c => c.high)
// //     const lows = candles.map(c => c.low)

// //     const sma14 = SMA.calculate({ period: 14, values: closes })
// //     const ema14 = EMA.calculate({ period: 14, values: closes })
// //     const rsi14 = RSI.calculate({ period: 14, values: closes })
// //     // const macd = MACD.calculate({ values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 })
// //     const bb = BollingerBands.calculate({ period: 20, values: closes, stdDev: 2 })
// //     const atr14 = ATR.calculate({ period: 14, high: highs, low: lows, close: closes })

// //     const shift = (arr: any[]) => candles.slice(candles.length - arr.length).map((c, i) => ({ time: c.time, value: arr[i] }))

// //     for (const ind of indicators) {
// //       if (!ind.visible) continue
// //       if (ind.name === 'SMA')
// //         chart.addSeries(LineSeries, { color: '#f1c40f' }).setData(shift(sma14))
// //       if (ind.name === 'EMA')
// //         chart.addSeries(LineSeries, { color: '#8e44ad' }).setData(shift(ema14))
// //       if (ind.name === 'RSI')
// //         chart.addSeries(LineSeries, { color: '#2ecc71' }).setData(shift(rsi14))
// //       if (ind.name === 'ATR')
// //         chart.addSeries(LineSeries, { color: '#e74c3c' }).setData(shift(atr14))
// //       // if (ind.name === 'MACD') {
// //       //   chart.addSeries(LineSeries, { color: '#e67e22' }).setData(macd.map((m, i) => ({ time: candles[i + (candles.length - macd.length)].time, value: m.MACD })))
// //       //   chart.addSeries(LineSeries, { color: '#3498db' }).setData(macd.map((m, i) => ({ time: candles[i + (candles.length - macd.length)].time, value: m.signal })))
// //       //   chart.addSeries(HistogramSeries, { color: '#95a5a6' }).setData(macd.map((m, i) => ({ time: candles[i + (candles.length - macd.length)].time, value: m.histogram })))
// //       // }
// //       if (ind.name === 'Bollinger Bands') {
// //         chart.addSeries(LineSeries, { color: '#bdc3c7' }).setData(bb.map((b, i) => ({ time: candles[i + (candles.length - bb.length)].time, value: b.upper })))
// //         chart.addSeries(LineSeries, { color: '#bdc3c7' }).setData(bb.map((b, i) => ({ time: candles[i + (candles.length - bb.length)].time, value: b.lower })))
// //       }
// //     }

// //     chart.timeScale().fitContent()
// //     return () => chart.remove()
// //   }, [candles, width, height, indicators])

// //   return (
// //     <div className="relative ">
// //       <div className="absolute left-40 z-50">
// //         <select
// //           value={interval}
// //           onChange={(e) => setInterval(e.target.value as any)}
// //           className="bg-gray-800 text-white p-2 rounded border border-gray-600 text-sm"
// //         >
// //           <optgroup label="Minutes">
// //             <option value="1m">1m</option>
// //             <option value="5m">5m</option>
// //             <option value="15m">15m</option>
// //           </optgroup>
// //           <optgroup label="Hours">
// //             <option value="1h">1h</option>
// //           </optgroup>
// //           <optgroup label="Days">
// //             <option value="1d">1d</option>
// //           </optgroup>
// //         </select>
// //       </div>

// //       <IndicatorSelector onSelect={handleAddIndicator} />

// //       {ohlc && (
// //         <div className="absolute top-1 left-1/2  text-sm text-white bg-black/60 px-4 py-1 rounded flex gap-4 z-50">
// //           <span>O {ohlc.o.toFixed(2)}</span>
// //           <span>H {ohlc.h.toFixed(2)}</span>
// //           <span>L {ohlc.l.toFixed(2)}</span>
// //           <span>C {ohlc.c.toFixed(2)}</span>
// //           <span className={ohlc.change >= 0 ? 'text-green-400' : 'text-red-400'}>
// //             {ohlc.change.toFixed(2)} ({ohlc.percent.toFixed(2)}%)
// //           </span>
// //         </div>
// //       )}

// //       <div className="absolute top-2 left-2 z-50 flex gap-2">
// //         {indicators.map(ind => (
// //           <IndicatorBadge
// //             key={ind.name}
// //             name={ind.name}
// //             visible={ind.visible}
// //             onToggle={() => {
// //               setIndicators(prev => prev.map(i => i.name === ind.name ? { ...i, visible: !i.visible } : i))
// //             }}
// //             onRemove={() => {
// //               setIndicators(prev => prev.filter(i => i.name !== ind.name))
// //             }}
// //           />
// //         ))}
// //       </div>
// //       <div ref={container}/>
// //     </div>
// //   )
// // }

// 'use client'
// import React, { useRef, useEffect, useState } from 'react'
// import {
//   createChart,
//   CandlestickSeries,
//   HistogramSeries,
//   LineSeries,
//   UTCTimestamp,
// } from 'lightweight-charts'
// import {
//   SMA,
//   EMA,
//   RSI,
//   MACD,
//   BollingerBands,
//   ATR,
// } from 'technicalindicators'
// import { IndicatorSelector } from './IndicatorSelector'
// import { IndicatorBadge } from './IndicatorBadge'

// interface BinanceKline {
//   time: UTCTimestamp
//   open: number
//   high: number
//   low: number
//   close: number
//   volume: number
// }

// interface Candle {
//   time: string
//   open: number
//   high: number
//   low: number
//   close: number
//   volume: number
// }

// export function TradingChart() {
//   const container = useRef<HTMLDivElement>(null)
//   const chartInstance = useRef<any>(null)
//   const [indicators, setIndicators] = useState<{ name: string, visible: boolean }[]>([])
//   const [interval, setInterval] = useState<'1m' | '5m' | '15m' | '1h' | '1d'>('1h')
//   const [candles, setCandles] = useState<BinanceKline[]>([])
//   const [loading, setLoading] = useState(true)
//   const [currentPrice, setCurrentPrice] = useState<number>(0)

//   const [ohlc, setOhlc] = useState<{
//     o: number
//     h: number
//     l: number
//     c: number
//     change: number
//     percent: number
//   } | null>(null)

//   // Fetch historical data from Binance
//   const fetchBinanceData = async (symbol: string = 'BTCUSDT', interval: string = '1h', limit: number = 500) => {
//     try {
//       setLoading(true)
//       const response = await fetch(
//         `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
//       )
//       const data = await response.json()
      
//       const formattedData: BinanceKline[] = data.map((kline: any[]) => ({
//         time: (kline[0] / 1000) as UTCTimestamp, // Convert to seconds
//         open: parseFloat(kline[1]),
//         high: parseFloat(kline[2]),
//         low: parseFloat(kline[3]),
//         close: parseFloat(kline[4]),
//         volume: parseFloat(kline[5]),
//       }))
      
//       setCandles(formattedData)
//       setCurrentPrice(formattedData[formattedData.length - 1]?.close || 0)
//       setLoading(false)
//     } catch (error) {
//       console.error('Error fetching Binance data:', error)
//       setLoading(false)
//     }
//   }

//   // Set up WebSocket for real-time updates
//   useEffect(() => {
//     const symbol = 'btcusdt'
//     const wsUrl = `wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`
//     const ws = new WebSocket(wsUrl)

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data)
//       const kline = data.k
      
//       if (kline.x) { // Only update on closed candles
//         const newCandle: BinanceKline = {
//           time: (kline.t / 1000) as UTCTimestamp,
//           open: parseFloat(kline.o),
//           high: parseFloat(kline.h),
//           low: parseFloat(kline.l),
//           close: parseFloat(kline.c),
//           volume: parseFloat(kline.v),
//         }
        
//         setCandles(prev => {
//           const updated = [...prev]
//           const lastIndex = updated.length - 1
          
//           if (updated[lastIndex]?.time === newCandle.time) {
//             updated[lastIndex] = newCandle
//           } else {
//             updated.push(newCandle)
//           }
          
//           return updated.slice(-500) // Keep last 500 candles
//         })
        
//         setCurrentPrice(parseFloat(kline.c))
//       }
//     }

//     ws.onerror = (error) => {
//       console.error('WebSocket error:', error)
//     }

//     return () => {
//       ws.close()
//     }
//   }, [interval])

//   // Fetch initial data when interval changes
//   useEffect(() => {
//     console.log(`Fetching ${interval} data for Bitcoin...`)
//     fetchBinanceData('BTCUSDT', interval, 500)
//   }, [interval])

//   // Handle interval change
//   const handleIntervalChange = (newInterval: '1m' | '5m' | '15m' | '1h' | '1d') => {
//     console.log(`Switching to ${newInterval} timeframe`)
//     setInterval(newInterval)
//     setLoading(true)
//   }

//   const handleAddIndicator = (name: string) => {
//     setIndicators(prev => {
//       if (prev.find(i => i.name === name)) return prev
//       return [...prev, { name, visible: true }]
//     })
//   }

//   // Handle window resize
//   useEffect(() => {
//     const handleResize = () => {
//       if (chartInstance.current && container.current) {
//         const { clientWidth, clientHeight } = container.current
//         chartInstance.current.applyOptions({
//           width: clientWidth,
//           height: clientHeight,
//         })
//       }
//     }

//     window.addEventListener('resize', handleResize)
//     return () => window.removeEventListener('resize', handleResize)
//   }, [])

//   useEffect(() => {
//     if (!container.current || candles.length === 0) return
    
//     // Get container dimensions
//     const { clientWidth, clientHeight } = container.current
    
//     // Configure time scale options based on interval
//     const getTimeScaleOptions = (interval: string) => {
//       switch (interval) {
//         case '1m':
//           return {
//             timeVisible: true,
//             secondsVisible: false,
//             tickMarkFormatter: (time: UTCTimestamp) => {
//               const date = new Date(time * 1000)
//               return date.toLocaleTimeString('en-US', { 
//                 hour: '2-digit', 
//                 minute: '2-digit',
//                 hour12: false 
//               })
//             }
//           }
//         case '5m':
//         case '15m':
//           return {
//             timeVisible: true,
//             secondsVisible: false,
//             tickMarkFormatter: (time: UTCTimestamp) => {
//               const date = new Date(time * 1000)
//               return date.toLocaleTimeString('en-US', { 
//                 hour: '2-digit', 
//                 minute: '2-digit',
//                 hour12: false 
//               })
//             }
//           }
//         case '1h':
//           return {
//             timeVisible: true,
//             secondsVisible: false,
//             tickMarkFormatter: (time: UTCTimestamp) => {
//               const date = new Date(time * 1000)
//               return date.toLocaleTimeString('en-US', { 
//                 hour: '2-digit',
//                 hour12: false 
//               }) + ':00'
//             }
//           }
//         case '1d':
//           return {
//             timeVisible: true,
//             secondsVisible: false,
//             tickMarkFormatter: (time: UTCTimestamp) => {
//               const date = new Date(time * 1000)
//               return date.toLocaleDateString('en-US', { 
//                 month: 'short', 
//                 day: 'numeric' 
//               })
//             }
//           }
//         default:
//           return {
//             timeVisible: true,
//             secondsVisible: false
//           }
//       }
//     }
    
//     const chart = createChart(container.current, {
//       width: clientWidth,
//       height: clientHeight,
//       layout: { 
//         // background: { type: 'solid', color: '#0f1419' }, 
//        // backgroundColor: '#0f1419',
//          background: { color: '#0f1419' },
//         textColor: '#d1d5db' 
//       },
//       grid: {
//         vertLines: { color: '#374151' },
//         horzLines: { color: '#374151' },
//       },
//       crosshair: {
//         mode: 0,
//         vertLine: {
//           color: '#6b7280',
//           width: 1,
//           style: 0,
//         },
//         horzLine: {
//           color: '#6b7280',
//           width: 1,
//           style: 0,
//         },
//       },
//       timeScale: {
//         borderColor: '#4b5563',
//         ...getTimeScaleOptions(interval),
//       },
//       rightPriceScale: {
//         borderColor: '#4b5563',
//         autoScale: true,
//         scaleMargins: {
//           top: 0.1,
//           bottom: 0.1,
//         },
//       },
//     })

//     chartInstance.current = chart

//     const priceSeries = chart.addSeries(CandlestickSeries, {
//       upColor: '#26a69a',
//       downColor: '#ef5350',
//       borderVisible: false,
//       wickUpColor: '#26a69a',
//       wickDownColor: '#ef5350',
//     })
//     priceSeries.setData(candles)
//     priceSeries.priceScale().applyOptions({ 
//       scaleMargins: { top: 0.1, bottom: 0.3 },
//       autoScale: true
//     })

//     chart.subscribeCrosshairMove(param => {
//       if (!param?.seriesData || !priceSeries) return

//       const data = param.seriesData.get(priceSeries)
//       if (!data || typeof data !== 'object') return

//       const { open, high, low, close } = data as any
//       const change = close - open
//       const percent = (change / open) * 100

//       setOhlc({ o: open, h: high, l: low, c: close, change, percent })
//     })

//     const volumeSeries = chart.addSeries(HistogramSeries, {
//       priceFormat: { type: 'volume' },
//       priceScaleId: '',
//     })
//     volumeSeries.priceScale().applyOptions({ 
//       scaleMargins: { top: 0.7, bottom: 0 },
//       autoScale: true
//     })

//     const volumeData = candles.map((bar, i) => {
//       const prev = candles[i - 1]
//       const color = !prev || bar.close >= prev.close ? '#26a69a' : '#ef5350'
//       return { time: bar.time, value: bar.volume, color }
//     })
//     volumeSeries.setData(volumeData)

//     const closes = candles.map(c => c.close)
//     const highs = candles.map(c => c.high)
//     const lows = candles.map(c => c.low)

//     const sma14 = SMA.calculate({ period: 14, values: closes })
//     const ema14 = EMA.calculate({ period: 14, values: closes })
//     const rsi14 = RSI.calculate({ period: 14, values: closes })
//     const bb = BollingerBands.calculate({ period: 20, values: closes, stdDev: 2 })
//     const atr14 = ATR.calculate({ period: 14, high: highs, low: lows, close: closes })

//     const shift = (arr: any[]) => candles.slice(candles.length - arr.length).map((c, i) => ({ time: c.time, value: arr[i] }))

//     for (const ind of indicators) {
//       if (!ind.visible) continue
//       if (ind.name === 'SMA')
//         chart.addSeries(LineSeries, { color: '#f1c40f' }).setData(shift(sma14))
//       if (ind.name === 'EMA')
//         chart.addSeries(LineSeries, { color: '#8e44ad' }).setData(shift(ema14))
//       if (ind.name === 'RSI')
//         chart.addSeries(LineSeries, { color: '#2ecc71' }).setData(shift(rsi14))
//       if (ind.name === 'ATR')
//         chart.addSeries(LineSeries, { color: '#e74c3c' }).setData(shift(atr14))
//       if (ind.name === 'Bollinger Bands') {
//         chart.addSeries(LineSeries, { color: '#bdc3c7' }).setData(bb.map((b, i) => ({ time: candles[i + (candles.length - bb.length)].time, value: b.upper })))
//         chart.addSeries(LineSeries, { color: '#bdc3c7' }).setData(bb.map((b, i) => ({ time: candles[i + (candles.length - bb.length)].time, value: b.lower })))
//       }
//     }

//     chart.timeScale().fitContent()
    
//     // Auto-fit the price scale to show all data properly
//     setTimeout(() => {
//       chart.timeScale().fitContent()
//     }, 100)
    
//     return () => {
//       chart.remove()
//       chartInstance.current = null
//     }
//   }, [candles, indicators, interval])

//   return (
//     <div className="relative w-full h-full bg-gray-900 rounded-lg">
//       {loading && candles.length === 0 && (
//         <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-50 rounded-lg">
//           <div className="text-center">
//             <div className="text-white text-lg font-medium">Loading Bitcoin Data...</div>
//             <div className="text-gray-400 text-sm mt-1">Fetching {interval} candles from Binance</div>
//           </div>
//         </div>
//       )}
      
//       <div className="absolute left-2 top-2 z-50 flex gap-2">
//         <select
//           value={interval}
//           onChange={(e) => handleIntervalChange(e.target.value as any)}
//           className="bg-gray-800 text-white p-2 rounded border border-gray-600 text-sm font-medium"
//         >
//           <optgroup label="Minutes">
//             <option value="1m">1 Minute</option>
//             <option value="5m">5 Minutes</option>
//             <option value="15m">15 Minutes</option>
//           </optgroup>
//           <optgroup label="Hours">
//             <option value="1h">1 Hour</option>
//           </optgroup>
//           <optgroup label="Days">
//             <option value="1d">1 Day</option>
//           </optgroup>
//         </select>
        
//         <div className="bg-gray-800 text-white px-3 py-2 rounded text-sm">
//           <span className="text-gray-400">BTC/USDT:</span> 
//           <span className="text-green-400 font-mono ml-1">${currentPrice.toLocaleString()}</span>
//         </div>
        
//         {loading && (
//           <div className="bg-blue-600 text-white px-3 py-2 rounded text-sm animate-pulse">
//             Loading {interval} data...
//           </div>
//         )}
//       </div>

//       <div className="absolute right-2 top-2 z-50">
//         <IndicatorSelector onSelect={handleAddIndicator} />
//       </div>

//       {ohlc && (
//         <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/80 px-4 py-2 rounded-lg flex gap-4 z-50 border border-gray-600">
//           <span className="text-gray-300 font-medium">Bitcoin ({interval})</span>
//           <span className="text-gray-400">O:</span><span className="text-white font-mono">{ohlc.o.toFixed(2)}</span>
//           <span className="text-gray-400">H:</span><span className="text-white font-mono">{ohlc.h.toFixed(2)}</span>
//           <span className="text-gray-400">L:</span><span className="text-white font-mono">{ohlc.l.toFixed(2)}</span>
//           <span className="text-gray-400">C:</span><span className="text-white font-mono">{ohlc.c.toFixed(2)}</span>
//           <span className={`font-mono ${ohlc.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//             {ohlc.change >= 0 ? '+' : ''}{ohlc.change.toFixed(2)} ({ohlc.percent >= 0 ? '+' : ''}{ohlc.percent.toFixed(2)}%)
//           </span>
//         </div>
//       )}

//       <div className="absolute bottom-2 left-2 z-50 flex gap-2 flex-wrap">
//         {indicators.map(ind => (
//           <IndicatorBadge
//             key={ind.name}
//             name={ind.name}
//             visible={ind.visible}
//             onToggle={() => {
//               setIndicators(prev => prev.map(i => i.name === ind.name ? { ...i, visible: !i.visible } : i))
//             }}
//             onRemove={() => {
//               setIndicators(prev => prev.filter(i => i.name !== ind.name))
//             }}
//           />
//         ))}
//       </div>
//       <div ref={container} className="w-full h-full" />
//     </div>
//   )
// }


'use client'
import React, { useRef, useEffect, useState, useCallback } from 'react'
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  UTCTimestamp,
  IChartApi,
} from 'lightweight-charts'
import {
  SMA,
  EMA,
  RSI,
  BollingerBands,
  ATR,
} from 'technicalindicators'
import { IndicatorSelector } from './IndicatorSelector'
import { IndicatorBadge } from './IndicatorBadge'

interface BinanceKline {
  time: UTCTimestamp
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export function TradingChart() {
  const container = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<IChartApi | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [indicators, setIndicators] = useState<{ name: string, visible: boolean }[]>([])
  const [interval, setInterval] = useState<'1m' | '5m' | '15m' | '1h' | '1d'>('1h')
  const [candles, setCandles] = useState<BinanceKline[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPrice, setCurrentPrice] = useState<number>(0)

  const [ohlc, setOhlc] = useState<{
    o: number
    h: number
    l: number
    c: number
    change: number
    percent: number
  } | null>(null)

  // ResizeObserver for reliable dimension tracking
  useEffect(() => {
    if (!container.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          setDimensions({ width, height })
          
          // Update existing chart dimensions
          if (chartInstance.current) {
            chartInstance.current.applyOptions({ width, height })
          }
        }
      }
    })

    resizeObserver.observe(container.current)
    
    // Initial dimension check
    const { clientWidth, clientHeight } = container.current
    if (clientWidth > 0 && clientHeight > 0) {
      setDimensions({ width: clientWidth, height: clientHeight })
    }

    return () => resizeObserver.disconnect()
  }, [])

  // Fetch historical data from Binance
  const fetchBinanceData = async (symbol: string = 'BTCUSDT', interval: string = '1h', limit: number = 500) => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      )
      const data = await response.json()
      
      const formattedData: BinanceKline[] = data.map((kline: any[]) => ({
        time: (kline[0] / 1000) as UTCTimestamp,
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
      }))
      
      setCandles(formattedData)
      setCurrentPrice(formattedData[formattedData.length - 1]?.close || 0)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching Binance data:', error)
      setLoading(false)
    }
  }

  // WebSocket for real-time updates
  useEffect(() => {
    const symbol = 'btcusdt'
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`
    const ws = new WebSocket(wsUrl)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const kline = data.k
      
      if (kline.x) {
        const newCandle: BinanceKline = {
          time: (kline.t / 1000) as UTCTimestamp,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
          volume: parseFloat(kline.v),
        }
        
        setCandles(prev => {
          const updated = [...prev]
          const lastIndex = updated.length - 1
          
          if (updated[lastIndex]?.time === newCandle.time) {
            updated[lastIndex] = newCandle
          } else {
            updated.push(newCandle)
          }
          
          return updated.slice(-500)
        })
        
        setCurrentPrice(parseFloat(kline.c))
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => ws.close()
  }, [interval])

  // Fetch initial data
  useEffect(() => {
    fetchBinanceData('BTCUSDT', interval, 500)
  }, [interval])

  const handleIntervalChange = (newInterval: '1m' | '5m' | '15m' | '1h' | '1d') => {
    setInterval(newInterval)
    setLoading(true)
  }

  const handleAddIndicator = (name: string) => {
    setIndicators(prev => {
      if (prev.find(i => i.name === name)) return prev
      return [...prev, { name, visible: true }]
    })
  }

  // Chart creation - only when we have valid dimensions and data
  useEffect(() => {
    if (!container.current || candles.length === 0) return
    if (dimensions.width === 0 || dimensions.height === 0) return
    
    const getTimeScaleOptions = (interval: string) => {
      switch (interval) {
        case '1m':
        case '5m':
        case '15m':
          return {
            timeVisible: true,
            secondsVisible: false,
            tickMarkFormatter: (time: UTCTimestamp) => {
              const date = new Date(time * 1000)
              return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })
            }
          }
        case '1h':
          return {
            timeVisible: true,
            secondsVisible: false,
            tickMarkFormatter: (time: UTCTimestamp) => {
              const date = new Date(time * 1000)
              return date.toLocaleTimeString('en-US', { 
                hour: '2-digit',
                hour12: false 
              }) + ':00'
            }
          }
        case '1d':
          return {
            timeVisible: true,
            secondsVisible: false,
            tickMarkFormatter: (time: UTCTimestamp) => {
              const date = new Date(time * 1000)
              return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })
            }
          }
        default:
          return { timeVisible: true, secondsVisible: false }
      }
    }
    
    const chart = createChart(container.current, {
      width: dimensions.width,
      height: dimensions.height,
      layout: { 
        background: { color: '#0f1419' },
        textColor: '#d1d5db' 
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: '#6b7280', width: 1, style: 0 },
        horzLine: { color: '#6b7280', width: 1, style: 0 },
      },
      timeScale: {
        borderColor: '#4b5563',
        ...getTimeScaleOptions(interval),
      },
      rightPriceScale: {
        borderColor: '#4b5563',
        autoScale: true,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
    })

    chartInstance.current = chart

    const priceSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })
    priceSeries.setData(candles)
    priceSeries.priceScale().applyOptions({ 
      scaleMargins: { top: 0.1, bottom: 0.3 },
      autoScale: true
    })

    chart.subscribeCrosshairMove(param => {
      if (!param?.seriesData || !priceSeries) return
      const data = param.seriesData.get(priceSeries)
      if (!data || typeof data !== 'object') return

      const { open, high, low, close } = data as any
      const change = close - open
      const percent = (change / open) * 100
      setOhlc({ o: open, h: high, l: low, c: close, change, percent })
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    })
    volumeSeries.priceScale().applyOptions({ 
      scaleMargins: { top: 0.7, bottom: 0 },
      autoScale: true
    })

    const volumeData = candles.map((bar, i) => {
      const prev = candles[i - 1]
      const color = !prev || bar.close >= prev.close ? '#26a69a' : '#ef5350'
      return { time: bar.time, value: bar.volume, color }
    })
    volumeSeries.setData(volumeData)

    // Indicators
    const closes = candles.map(c => c.close)
    const highs = candles.map(c => c.high)
    const lows = candles.map(c => c.low)

    const sma14 = SMA.calculate({ period: 14, values: closes })
    const ema14 = EMA.calculate({ period: 14, values: closes })
    const rsi14 = RSI.calculate({ period: 14, values: closes })
    const bb = BollingerBands.calculate({ period: 20, values: closes, stdDev: 2 })
    const atr14 = ATR.calculate({ period: 14, high: highs, low: lows, close: closes })

    const shift = (arr: any[]) => candles.slice(candles.length - arr.length).map((c, i) => ({ time: c.time, value: arr[i] }))

    for (const ind of indicators) {
      if (!ind.visible) continue
      if (ind.name === 'SMA')
        chart.addSeries(LineSeries, { color: '#f1c40f' }).setData(shift(sma14))
      if (ind.name === 'EMA')
        chart.addSeries(LineSeries, { color: '#8e44ad' }).setData(shift(ema14))
      if (ind.name === 'RSI')
        chart.addSeries(LineSeries, { color: '#2ecc71' }).setData(shift(rsi14))
      if (ind.name === 'ATR')
        chart.addSeries(LineSeries, { color: '#e74c3c' }).setData(shift(atr14))
      if (ind.name === 'Bollinger Bands') {
        chart.addSeries(LineSeries, { color: '#bdc3c7' }).setData(bb.map((b, i) => ({ time: candles[i + (candles.length - bb.length)].time, value: b.upper })))
        chart.addSeries(LineSeries, { color: '#bdc3c7' }).setData(bb.map((b, i) => ({ time: candles[i + (candles.length - bb.length)].time, value: b.lower })))
      }
    }

    chart.timeScale().fitContent()
    
    return () => {
      chart.remove()
      chartInstance.current = null
    }
  }, [candles, indicators, interval, dimensions])

  return (
    <div className="relative w-full h-full min-h-[400px] bg-gray-900 rounded-lg">
      {loading && candles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-50 rounded-lg">
          <div className="text-center">
            <div className="text-white text-lg font-medium">Loading Bitcoin Data...</div>
            <div className="text-gray-400 text-sm mt-1">Fetching {interval} candles from Binance</div>
          </div>
        </div>
      )}
      
      <div className="absolute left-2 top-2 z-50 flex gap-2 flex-wrap">
        <select
          value={interval}
          onChange={(e) => handleIntervalChange(e.target.value as any)}
          className="bg-gray-800 text-white p-2 rounded border border-gray-600 text-sm font-medium"
        >
          <optgroup label="Minutes">
            <option value="1m">1 Minute</option>
            <option value="5m">5 Minutes</option>
            <option value="15m">15 Minutes</option>
          </optgroup>
          <optgroup label="Hours">
            <option value="1h">1 Hour</option>
          </optgroup>
          <optgroup label="Days">
            <option value="1d">1 Day</option>
          </optgroup>
        </select>
        
        <div className="bg-gray-800 text-white px-3 py-2 rounded text-sm">
          <span className="text-gray-400">BTC/USDT:</span> 
          <span className="text-green-400 font-mono ml-1">${currentPrice.toLocaleString()}</span>
        </div>
        
        {loading && (
          <div className="bg-blue-600 text-white px-3 py-2 rounded text-sm animate-pulse">
            Loading...
          </div>
        )}
      </div>

      <div className="absolute right-2 top-2 z-50">
        <IndicatorSelector onSelect={handleAddIndicator} />
      </div>

      {ohlc && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/80 px-4 py-2 rounded-lg flex gap-4 z-50 border border-gray-600">
          <span className="text-gray-300 font-medium">Bitcoin ({interval})</span>
          <span className="text-gray-400">O:</span><span className="text-white font-mono">{ohlc.o.toFixed(2)}</span>
          <span className="text-gray-400">H:</span><span className="text-white font-mono">{ohlc.h.toFixed(2)}</span>
          <span className="text-gray-400">L:</span><span className="text-white font-mono">{ohlc.l.toFixed(2)}</span>
          <span className="text-gray-400">C:</span><span className="text-white font-mono">{ohlc.c.toFixed(2)}</span>
          <span className={`font-mono ${ohlc.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {ohlc.change >= 0 ? '+' : ''}{ohlc.change.toFixed(2)} ({ohlc.percent >= 0 ? '+' : ''}{ohlc.percent.toFixed(2)}%)
          </span>
        </div>
      )}

      <div className="absolute bottom-2 left-2 z-50 flex gap-2 flex-wrap">
        {indicators.map(ind => (
          <IndicatorBadge
            key={ind.name}
            name={ind.name}
            visible={ind.visible}
            onToggle={() => {
              setIndicators(prev => prev.map(i => i.name === ind.name ? { ...i, visible: !i.visible } : i))
            }}
            onRemove={() => {
              setIndicators(prev => prev.filter(i => i.name !== ind.name))
            }}
          />
        ))}
      </div>
      
      <div ref={container} className="w-full h-full" />
    </div>
  )
}