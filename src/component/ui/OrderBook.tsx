// import React, { useState, useEffect } from 'react'
// import * as hl from '@nktkas/hyperliquid'

// // OrderBook component fetching L2 book via InfoClient.l2Book
// // Note: `coin` must be a valid Hyperliquid asset identifier (e.g., "BTC", "ARB", or spot index like "@107").

// interface BookOrder {
//   p: string  // price
//   s: string  // size
// }

// interface OrderBookProps {
//   coin: string        // Hyperliquid asset ID (e.g., "BTC", "ARB", or "@107" for spot)
//   depth?: number      // levels per side
//   refreshIntervalMs?: number // polling interval in ms
// }

// const OrderBook: React.FC<OrderBookProps> = ({ coin, depth = 10, refreshIntervalMs = 1000 }) => {
//   const [bids, setBids] = useState<BookOrder[]>([])
//   const [asks, setAsks] = useState<BookOrder[]>([])
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const transport = new hl.HttpTransport()
//     const client = new hl.InfoClient({ transport })
//     let mounted = true

//     const fetchBook = async () => {
//       try {
//         const levels = await client.l2Book({ coin })
//         if (!mounted) return

//         const [bidLvls, askLvls] = levels
//         setBids(bidLvls.slice(0, depth).map(l => ({ p: l.px, s: l.sz })))
//         setAsks(askLvls.slice(0, depth).map(l => ({ p: l.px, s: l.sz })))
//         setError(null)
//       } catch (err: any) {
//         console.error('Error fetching L2 book:', err)
//         // Handle 422 Unprocessable Entity (invalid coin)
//         if (err.body?.includes('deserialize') || err.status === 422) {
//           setError(`Invalid asset ID "${coin}". Please use a valid Hyperliquid coin identifier.`)
//         } else {
//           setError('Failed to fetch order book. Retrying...')
//         }
//       }
//     }

//     fetchBook()
//     const id = setInterval(fetchBook, refreshIntervalMs)
//     return () => { mounted = false; clearInterval(id) }
//   }, [coin, depth, refreshIntervalMs])

//   // show error
//   if (error) {
//     return <div style={{ color: '#F55', fontFamily: 'sans-serif' }}>{error}</div>
//   }

//   // compute max size
//   const allSizes = [...bids, ...asks].map(o => parseFloat(o.s))
//   const maxSize = Math.max(...allSizes, 1)

//   // spread
//   const highBid = bids[0] ? parseFloat(bids[0].p) : 0
//   const lowAsk  = asks[0] ? parseFloat(asks[0].p) : 0
//   const spread  = (lowAsk - highBid).toFixed(2)
//   const mid     = highBid && lowAsk ? (highBid + lowAsk) / 2 : 0
//   const pct     = mid ? ((lowAsk - highBid) / mid * 100).toFixed(3) : '0'

//   const renderRow = (order: BookOrder, isAsk: boolean, i: number) => {
//     const sz = parseFloat(order.s)
//     const cum = sz + (isAsk
//       ? asks.slice(0, i).reduce((sum, o) => sum + parseFloat(o.s), 0)
//       : bids.slice(0, i).reduce((sum, o) => sum + parseFloat(o.s), 0)
//     )
//     const width = (sz / maxSize) * 100

//     return (
//       <div key={`${isAsk ? 'ask' : 'bid'}-${i}`} style={{
//         position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '2px 0', fontSize: 12,
//         color: isAsk ? '#FF5555' : '#07E75B'
//       }}>
//         <div style={{ zIndex: 2, textAlign: 'right' }}>{order.p}</div>
//         <div style={{ zIndex: 2, textAlign: 'right' }}>{order.s}</div>
//         <div style={{ zIndex: 2, textAlign: 'right' }}>{cum.toFixed(2)}</div>
//         <div style={{ position: 'absolute', top: 0, bottom: 0, [isAsk ? 'right' : 'left']: 0,
//           width: `${width}%`, background: isAsk ? 'rgba(255,85,85,0.2)' : 'rgba(7,231,91,0.2)', zIndex: 1
//         }} />
//       </div>
//     )
//   }

//   return (
//     <div style={{ width: '100%', fontFamily: 'sans-serif', color: '#FFF' }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
//         <h4 style={{ margin: 0 }}>Order Book</h4>
//         <div style={{ fontSize: 12, opacity: 0.7 }}>Spread {spread} ({pct}%)</div>
//       </div>
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
//         <div style={{ textAlign: 'right' }}>Price</div>
//         <div style={{ textAlign: 'right' }}>Size</div>
//         <div style={{ textAlign: 'right' }}>Total</div>
//       </div>
//       <div>{asks.map((o, i) => renderRow(o, true, i))}</div>
//       <div style={{ height: 8 }} />
//       <div>{bids.map((o, i) => renderRow(o, false, i))}</div>
//     </div>
//   )
// }

// export default OrderBook

import React, { useState, useEffect } from 'react'
import * as hl from '@nktkas/hyperliquid'

// OrderBook component fetching L2 book via InfoClient.l2Book
// Note: `coin` must be a valid Hyperliquid asset identifier (e.g., "BTC", "ARB", or spot index like "@107").

interface BookOrder {
  p: string  // price
  s: string  // size
}

interface OrderBookProps {
  coin: string        // Hyperliquid asset ID (e.g., "BTC", "ARB", or "@107" for spot)
  depth?: number      // levels per side
  refreshIntervalMs?: number // polling interval in ms
}

const OrderBook: React.FC<OrderBookProps> = ({ coin, depth = 10, refreshIntervalMs = 1000 }) => {
  const [bids, setBids] = useState<BookOrder[]>([])
  const [asks, setAsks] = useState<BookOrder[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const transport = new hl.HttpTransport()
    const client = new hl.InfoClient({ transport })
    let mounted = true

    const fetchBook = async () => {
      try {
        // pull out `levels` tuple from the returned object
        const { levels } = await client.l2Book({ coin })
        if (!mounted) return

        const [bidLvls, askLvls] = levels
        setBids(bidLvls.slice(0, depth).map(l => ({ p: l.px, s: l.sz })))
        setAsks(askLvls.slice(0, depth).map(l => ({ p: l.px, s: l.sz })))
        setError(null)
      } catch (err: any) {
        console.error('Error fetching L2 book:', err)
        // Handle 422 Unprocessable Entity (invalid coin)
        if (err.body?.includes('deserialize') || err.status === 422) {
          setError(`Invalid asset ID "${coin}". Please use a valid Hyperliquid coin identifier.`)
        } else {
          setError('Failed to fetch order book. Retrying...')
        }
      }
    }

    fetchBook()
    const id = setInterval(fetchBook, refreshIntervalMs)
    return () => { mounted = false; clearInterval(id) }
  }, [coin, depth, refreshIntervalMs])

  // show error
  if (error) {
    return <div style={{ color: '#ef4444', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{error}</div>
  }

  // compute max size
  const allSizes = [...bids, ...asks].map(o => parseFloat(o.s))
  const maxSize = Math.max(...allSizes, 1)

  // spread
  const highBid = bids[0] ? parseFloat(bids[0].p) : 0
  const lowAsk  = asks[0] ? parseFloat(asks[0].p) : 0
  const spread  = (lowAsk - highBid).toFixed(2)
  const mid     = highBid && lowAsk ? (highBid + lowAsk) / 2 : 0
  const pct     = mid ? ((lowAsk - highBid) / mid * 100).toFixed(3) : '0'

  const renderRow = (order: BookOrder, isAsk: boolean, i: number) => {
    const sz = parseFloat(order.s)
    const cum = sz + (isAsk
      ? asks.slice(0, i).reduce((sum, o) => sum + parseFloat(o.s), 0)
      : bids.slice(0, i).reduce((sum, o) => sum + parseFloat(o.s), 0)
    )
    const width = (sz / maxSize) * 100

    return (
      <div key={`${isAsk ? 'ask' : 'bid'}-${i}`} style={{
        position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '3px 0', fontSize: 12,
        fontFamily: "'DM Mono', monospace",
        color: isAsk ? '#ef4444' : '#34d399'
      }}>
        <div style={{ zIndex: 2, textAlign: 'right' }}>{order.p}</div>
        <div style={{ zIndex: 2, textAlign: 'right' }}>{order.s}</div>
        <div style={{ zIndex: 2, textAlign: 'right' }}>{cum.toFixed(2)}</div>
        <div style={{ position: 'absolute', top: 0, bottom: 0, [isAsk ? 'right' : 'left']: 0,
          width: `${width}%`, background: isAsk ? 'rgba(239,68,68,0.1)' : 'rgba(52,211,153,0.1)', zIndex: 1,
          borderRadius: 2
        }} />
      </div>
    )
  }

  return (
    <div style={{ width: '100%', fontFamily: "'DM Sans', sans-serif", color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{coin}/USDT</span>
        <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: '#6b7280', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 6 }}>Spread {spread} ({pct}%)</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: 11, color: '#6b7280', marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>
        <div style={{ textAlign: 'right' }}>Price</div>
        <div style={{ textAlign: 'right' }}>Size</div>
        <div style={{ textAlign: 'right' }}>Total</div>
      </div>
      <div>{asks.map((o, i) => renderRow(o, true, i))}</div>
      <div style={{ height: 6, borderBottom: '1px solid rgba(255,255,255,0.06)' }} />
      <div>{bids.map((o, i) => renderRow(o, false, i))}</div>
    </div>
  )
}

export default OrderBook
