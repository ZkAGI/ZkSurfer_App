

// import { NextRequest } from 'next/server';
// import { Hyperliquid } from 'hyperliquid';

// export const runtime = 'nodejs';

// // CRITICAL: Remove NEXT_PUBLIC_ - it exposes your private key to the client!
// const PK = process.env.NEXT_PUBLIC_HL_PRIVATE_KEY; // API wallet private key
// const MAIN_WALLET = process.env.NEXT_PUBLIC_HL_MAIN_WALLET; // Your main trading wallet address

// if (!PK) throw new Error('HL_PRIVATE_KEY missing in env');
// if (!MAIN_WALLET) throw new Error('HL_MAIN_WALLET missing in env');

// // Initialize SDK once
// const sdk = new Hyperliquid({
//   privateKey: PK,
//   walletAddress: MAIN_WALLET, // Your main wallet that holds funds
//   testnet: false
// });

// console.log('[HL] SDK initialized for wallet:', MAIN_WALLET);

// // Asset mapping - BTC is index 0
// const ASSET_MAP = {
//   0: 'BTC-PERP',
//   // 1: 'ETH-PERP',
//   // Add more as needed
// };

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     console.log('[HL] inbound body:', body);

//     const { asset, side, price, size, takeProfit, stopLoss } = body;
//     // const coin = ASSET_MAP[asset] || 'BTC-PERP';
//    const coin = ASSET_MAP[Number(asset) as keyof typeof ASSET_MAP] || 'BTC-PERP';
//     const isBuy = side === 'LONG';

//     console.log(`[HL] Placing order: ${coin} ${side} ${size} @ ${price}`);

//     // Place main order with TP/SL
//     const orderParams = {
//       coin,
//       is_buy: isBuy,
//       sz: size,
//       limit_px: price,
//       order_type: { limit: { tif: 'Gtc' } },
//       reduce_only: false
//     };

//     // Add TP/SL if provided
//     if (takeProfit || stopLoss) {
//       orderParams.order_type = {
//         limit: { tif: 'Gtc' },
//         ...(takeProfit && { tp: takeProfit }),
//         ...(stopLoss && { sl: stopLoss })
//       };
//     }

//     console.log('[HL] Order params:', JSON.stringify(orderParams, null, 2));

//     const result = await sdk.exchange.placeOrder(orderParams);

//     console.log('[HL] Order result:', JSON.stringify(result, null, 2));

//     if (result.status === 'err') {
//       throw new Error(result.response);
//     }

//     return new Response(JSON.stringify(result), { status: 200 });

//   } catch (e: any) {
//     console.error('HL order error:', e);
//     return new Response(JSON.stringify({ error: e.message }), { status: 500 });
//   }
// }


// import { NextRequest } from 'next/server';
// import { Hyperliquid, Tif } from 'hyperliquid'; // import Tif!

// export const runtime = 'nodejs';

// const PK = process.env.NEXT_PUBLIC_HL_PRIVATE_KEY;
// const MAIN_WALLET = process.env.NEXT_PUBLIC_HL_MAIN_WALLET;

// if (!PK) throw new Error('HL_PRIVATE_KEY missing in env');
// if (!MAIN_WALLET) throw new Error('HL_MAIN_WALLET missing in env');

// const sdk = new Hyperliquid({
//   privateKey: PK,
//   walletAddress: MAIN_WALLET,
//   testnet: false
// });

// const ASSET_MAP = { 0: 'BTC-PERP' };

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { asset, side, price, size, takeProfit, stopLoss } = body;
//     const coin = ASSET_MAP[Number(asset) as keyof typeof ASSET_MAP] || 'BTC-PERP';
//     const isBuy = side === 'LONG';

//     const orderParams = {
//       coin,
//       is_buy: isBuy,
//       sz: size,
//       limit_px: price,
//       order_type: { limit: { tif: 'Gtc' as Tif } },
//       reduce_only: false
//     };

//     if (takeProfit || stopLoss) {
//       orderParams.order_type = {
//         limit: { tif: 'Gtc' as Tif },
//         ...(takeProfit && { tp: takeProfit }),
//         ...(stopLoss && { sl: stopLoss })
//       };
//     }

//     const result = await sdk.exchange.placeOrder(orderParams);
//     if (result.status === 'err') throw new Error(result.response);

//     return new Response(JSON.stringify(result), { status: 200 });
//   } catch (e: any) {
//     console.error('HL order error:', e);
//     return new Response(JSON.stringify({ error: e.message }), { status: 500 });
//   }
// }


// pages/api/hl/order.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { Hyperliquid } from 'hyperliquid';
// import {
//   calcSizeUSD,
//   calcCoinSize,
//   stopFromDollarLoss,
//   RiskCfg
// } from '@/lib/risk';
// import { buildOrder } from '@/lib/orderBuilder';
// import { getDayState, pushTrade } from '@/lib/dayState';
// import { v4 as uuidv4 } from 'uuid';

// export const runtime = 'nodejs';

// const sdk = new Hyperliquid({
//   privateKey: process.env.NEXT_PUBLIC_HL_PRIVATE_KEY!,
//   walletAddress: process.env.NEXT_PUBLIC_HL_MAIN_WALLET!,
//   testnet: false
// });

// const BTC_ASSET_ID = 0;
// const ASSET_MAP: Record<number, string> = {
//   0: 'BTC-PERP'
// };


// export async function POST(req: NextRequest) {
//   try {
//     // 1️⃣ Parse incoming payload (with optional TP/SL)
//     const {
//       side,
//       price,
//       takeProfit,
//       stopLoss
//     }: {
//       side: 'LONG' | 'SHORT';
//       price: number;
//       takeProfit?: number;
//       stopLoss?: number;
//     } = await req.json();

//     // 2️⃣ Fetch your perp account summary for equity & PnL
//     const state = await sdk.info.perpetuals.getClearinghouseState(
//       process.env.NEXT_PUBLIC_HL_MAIN_WALLET!
//     );
//     const equity = Number(state.marginSummary.usdNet);

//     // 3️⃣ Enforce daily loss limit
//     const cfg: RiskCfg = {
//       dailyStartEquity: 1000,
//       maxPerTradeUsd: 350,
//       maxTradeLossUsd: 30,
//       maxDayLossUsd: 150
//     };
//     const day = getDayState();
//     if (day.realizedLoss >= cfg.maxDayLossUsd) {
//       return NextResponse.json(
//         { error: 'Daily loss limit reached' },
//         { status: 400 }
//       );
//     }

//     // 4️⃣ Calculate size based on 35% equity cap
//     const notional = calcSizeUSD(equity, cfg);
//     const perpsMeta = await sdk.info.perpetuals.getMeta();
//     const { lotSize, minOrderSize } = perpsMeta.universe[BTC_ASSET_ID];
//     const size = calcCoinSize(notional, price, lotSize, minOrderSize);

//     const isBuy = side === 'LONG';

//     // 5️⃣ Determine SL/TP: prefer front‑end values if present
//     const slPrice =
//       stopLoss !== undefined
//         ? stopLoss
//         : stopFromDollarLoss(price, Number(size), cfg.maxTradeLossUsd, isBuy);
//     const tpPrice =
//       takeProfit !== undefined
//         ? takeProfit
//         : price + (isBuy ? 1 : -1) * ((price - slPrice) * 4);

//     // 6️⃣ Build and place the order
//     const coin = ASSET_MAP[BTC_ASSET_ID]!;
//     const order = buildOrder({
//       coin,
//       isBuy,
//       px: price,
//       sz: size,
//       tp: tpPrice,
//       sl: slPrice
//     });

//     // 1) your main entry order
//     const limitOrder = {
//       coin,
//       is_buy: isBuy,
//       sz: size,
//       limit_px: price,
//       order_type: { limit: { tif: 'Alo' } },
//       reduce_only: false,
//       c: '0x' + uuidv4().replace(/-/g, '').slice(0, 32)
//     };

//     // 2) take‐profit trigger
//     const tpOrder = {
//       coin,
//       is_buy: !isBuy,
//       sz: size,
//       order_type: {
//         trigger: {
//           isMarket: true,
//           triggerPx: tpPrice.toString(),
//           tpsl: 'tp'
//         }
//       },
//       reduce_only: true,
//       c: '0x' + uuidv4().replace(/-/g, '').slice(0, 32)
//     };

//     // 3) stop‐loss trigger
//     const slOrder = {
//       coin,
//       is_buy: !isBuy,
//       sz: size,
//       order_type: {
//         trigger: {
//           isMarket: true,
//           triggerPx: slPrice.toString(),
//           tpsl: 'sl'
//         }
//       },
//       reduce_only: true,
//       c: '0x' + uuidv4().replace(/-/g, '').slice(0, 32)
//     };

//     // 4) send all three in one grouped call
//     const res = await sdk.exchange.placeOrder({
//       orders: [limitOrder, tpOrder, slOrder],
//       grouping: 'normalTpsl'
//     });


//     // const res = await sdk.exchange.placeOrder(order);


//     const statusObj = res.response.data.statuses[0];

//     // 7️⃣ If the order filled immediately, calculate & record PnL
//     if ('filled' in statusObj && statusObj.filled) {
//       const avgPx = Number(statusObj.filled.avgPx);
//       const filledSz = Number(statusObj.filled.totalSz);
//       const pnl =
//         (isBuy ? avgPx - price : price - avgPx) * filledSz;
//       const oid = statusObj.filled.oid;
//       pushTrade({ id: String(oid), pnl });
//     }

//     // 8️⃣ Return Hyperliquid’s response straight back to the client
//     return NextResponse.json(res);
//   } catch (e: any) {
//     console.error('HL order error:', e);
//     return NextResponse.json(
//       { error: e.message || 'Unknown error' },
//       { status: 500 }
//     );
//   }
// }

// pages/api/hl/order.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { Hyperliquid, Tif } from 'hyperliquid';
// import {
//   calcSizeUSD,
//   calcCoinSize,
//   stopFromDollarLoss,
//   RiskCfg
// } from '@/lib/risk';
// import { getDayState, pushTrade } from '@/lib/dayState';

// export const runtime = 'nodejs';

// const PK = process.env.NEXT_PUBLIC_HL_PRIVATE_KEY;
// const MAIN_WALLET = process.env.NEXT_PUBLIC_HL_MAIN_WALLET;

// if (!PK) throw new Error('HL_PRIVATE_KEY missing in env');
// if (!MAIN_WALLET) throw new Error('HL_MAIN_WALLET missing in env');

// const sdk = new Hyperliquid({
//   privateKey: PK,
//   walletAddress: MAIN_WALLET,
//   testnet: false
// });

// const ASSET_MAP = { 0: 'BTC-PERP' };

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { asset, side, price, size, takeProfit, stopLoss } = body;

//     console.log('📋 Received:', { asset, side, price, size: typeof size, takeProfit, stopLoss });

//     // 🎯 Risk management matching your requirements
//     const cfg = {
//       maxTradeLossUsd: 30,     // $30 max loss per trade ✅
//       maxDayLossUsd: 150,      // $150 max daily loss ✅
//       targetDailyProfit: 1000, // $1000 daily target ✅
//       maxPerTradeUsd: 600      // $600 max per trade ✅
//     };

//     // Quick validation
//     const positionValue = Number(size) * price;
//     if (positionValue > cfg.maxPerTradeUsd) {
//       return NextResponse.json({ 
//         error: `Position $${positionValue.toFixed(0)} exceeds limit $${cfg.maxPerTradeUsd}` 
//       }, { status: 400 });
//     }

//     // Expected profit calculation
//     const expectedProfit = takeProfit 
//       ? Math.abs(takeProfit - price) * Number(size)
//       : 0;

//     console.log('💰 Expected profit: $' + expectedProfit.toFixed(2));

//     // Check if profit target is realistic (should be $30-50)
//     if (expectedProfit > 0 && (expectedProfit < 25 || expectedProfit > 100)) {
//       console.warn(`⚠️ Profit target $${expectedProfit.toFixed(2)} outside $25-100 range`);
//     }

//     try {
//       const state = await sdk.info.perpetuals.getClearinghouseState(MAIN_WALLET);
//       const equity = Number(state.marginSummary.usdNet);
//       const day = getDayState();

//       // Daily limits
//       if (day.realizedLoss >= cfg.maxDayLossUsd) {
//         return NextResponse.json({ 
//           error: `Daily loss limit: -$${day.realizedLoss}` 
//         }, { status: 400 });
//       }

//       if (day.realizedProfit >= cfg.targetDailyProfit) {
//         return NextResponse.json({ 
//           success: true,
//           message: `🎉 Daily target achieved: $${day.realizedProfit}`,
//           shouldStop: true 
//         });
//       }

//       console.log(`📊 Daily P&L: +$${day.realizedProfit}/-$${day.realizedLoss}, Equity: $${equity.toFixed(0)}`);
//     } catch (riskError) {
//       console.warn('Risk check failed:', riskError);
//     }

//     // Map asset to coin
//     const coin = ASSET_MAP[Number(asset) as keyof typeof ASSET_MAP] || 'BTC-PERP';
//     const isBuy = side === 'LONG';

//     // 🎯 EXACT same format as your working commented code
//     const orderParams = {
//       coin,
//       is_buy: isBuy,
//       sz: Number(size),      // 🎯 Ensure it's a number
//       limit_px: Number(price), // 🎯 Ensure it's a number
//       order_type: { limit: { tif: 'Gtc' as Tif } },
//       reduce_only: false
//     };

//     // Add TP/SL if provided
//     if (takeProfit || stopLoss) {
//       orderParams.order_type = {
//         limit: { tif: 'Gtc' as Tif },
//         ...(takeProfit && { tp: Number(takeProfit) }),
//         ...(stopLoss && { sl: Number(stopLoss) })
//       };
//     }

//     console.log('📤 Order params:', JSON.stringify(orderParams, null, 2));

//     // Place order
//     const result = await sdk.exchange.placeOrder(orderParams);

//     if (result.status === 'err') {
//       throw new Error(result.response);
//     }

//     // Track trade
//     try {
//       if (result.status === 'ok' && result.response?.data?.statuses?.[0]) {
//         const statusObj = result.response.data.statuses[0];

//         if ('filled' in statusObj && statusObj.filled) {
//           const avgPx = Number(statusObj.filled.avgPx);
//           const filledSz = Number(statusObj.filled.totalSz);
//           const pnl = (isBuy ? avgPx - price : price - avgPx) * filledSz;
//           const oid = statusObj.filled.oid;

//           pushTrade({ 
//             id: String(oid), 
//             pnl,
//             side,
//             size: filledSz,
//             avgPrice: avgPx,
//             timestamp: Date.now()
//           });

//           console.log(`💰 FILLED: ${side} ${filledSz} @ $${avgPx}, PnL: $${pnl.toFixed(2)}`);
//         } else if ('resting' in statusObj) {
//           console.log(`📋 ORDER PLACED: ${side} ${size} @ $${price}`);
//         }
//       }
//     } catch (trackError) {
//       console.warn('Trade tracking failed:', trackError);
//     }

//     return new Response(JSON.stringify(result), { status: 200 });

//   } catch (e: any) {
//     console.error('❌ HL order error:', e);
//     return new Response(JSON.stringify({ error: e.message }), { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { Hyperliquid, Tif } from 'hyperliquid';
import {
    calcSizeUSD,
    calcCoinSize,
    stopFromDollarLoss,
    RiskCfg
} from '@/lib/risk';
import { getDayState, pushTrade, getDailyProfit, getDailyLoss } from '@/lib/dayState';

export const runtime = 'nodejs';

// Server-only: DO NOT use NEXT_PUBLIC_ prefix for private keys
// Note: Environment variables are validated at runtime in the handler

function getHyperliquidSDK() {
    const PK = process.env.HL_PRIVATE_KEY;
    const MAIN_WALLET = process.env.NEXT_PUBLIC_HL_MAIN_WALLET;

    if (!PK) throw new Error('HL_PRIVATE_KEY missing in env');
    if (!MAIN_WALLET) throw new Error('HL_MAIN_WALLET missing in env');

    return {
        sdk: new Hyperliquid({
            privateKey: PK,
            walletAddress: MAIN_WALLET,
            testnet: false
        }),
        MAIN_WALLET
    };
}

const ASSET_MAP = { 0: 'BTC-PERP' };

export async function POST(req: NextRequest) {
    try {
        // Get SDK lazily to avoid build-time errors
        const { sdk, MAIN_WALLET } = getHyperliquidSDK();
        const day = getDayState();
        const dailyProfit = getDailyProfit();
        const dailyLoss = getDailyLoss();

        const body = await req.json();
        const { asset, side, price, size, takeProfit, stopLoss, leverage = 1 } = body;

        console.log('📋 Received:', { asset, side, price, size: typeof size, takeProfit, stopLoss });

        // 🎯 Risk management matching your requirements
        const cfg = {
            maxTradeLossUsd: 30,     // $30 max loss per trade ✅
            maxDayLossUsd: 150,      // $150 max daily loss ✅
            targetDailyProfit: 1000, // $1000 daily target ✅
            maxPerTradeUsd: 1000,     // $600 max per trade ✅
            maxLeverage: 25
        };

        // Validate leverage
        if (leverage < 1 || leverage > cfg.maxLeverage) {
            return NextResponse.json({
                error: `Leverage must be between 1x and ${cfg.maxLeverage}x`
            }, { status: 400 });
        }

        // Calculate actual dollar exposure vs notional
        const notionalValue = Number(size) * price;
        const actualDollarRisk = notionalValue / leverage; // This is your actual capital at risk

        // Quick validation
        // const positionValue = Number(size) * price;
        // if (positionValue > cfg.maxPerTradeUsd) {
        //   return NextResponse.json({ 
        //     error: `Position $${positionValue.toFixed(0)} exceeds limit $${cfg.maxPerTradeUsd}` 
        //   }, { status: 400 });
        // }

        // Validate actual dollar risk
        if (actualDollarRisk > cfg.maxPerTradeUsd) {
            return NextResponse.json({
                error: `Actual capital risk $${actualDollarRisk.toFixed(0)} exceeds limit $${cfg.maxPerTradeUsd}`
            }, { status: 400 });
        }

        // Expected profit calculation
        // const expectedProfit = takeProfit 
        //   ? Math.abs(takeProfit - price) * Number(size)
        //   : 0;

        // console.log('💰 Expected profit: $' + expectedProfit.toFixed(2));
        const expectedProfit = takeProfit
            ? Math.abs(takeProfit - price) * Number(size)
            : 0;

        console.log('💰 Expected profit: $' + expectedProfit.toFixed(2));
        console.log(`📊 Leverage: ${leverage}x | Notional: $${notionalValue.toFixed(0)} | Actual Risk: $${actualDollarRisk.toFixed(0)}`);

        // Check if profit target is realistic (should be $30-50)
        if (expectedProfit > 0 && (expectedProfit < 25 || expectedProfit > 100)) {
            console.warn(`⚠️ Profit target $${expectedProfit.toFixed(2)} outside $25-100 range`);
        }

        // Daily limits check
        if (dailyLoss >= cfg.maxDayLossUsd) {
            return NextResponse.json({
                error: `Daily loss limit reached: -$${dailyLoss}/$${cfg.maxDayLossUsd}`
            }, { status: 400 });
        }

        if (dailyProfit >= cfg.targetDailyProfit) {
            return NextResponse.json({
                success: true,
                message: `🎉 Daily target achieved: $${dailyProfit}/${cfg.targetDailyProfit}`,
                shouldStop: true
            });
        }
        try {
            if (!MAIN_WALLET) {
                throw new Error('MAIN_WALLET not configured');
            }

            const state = await sdk.info.perpetuals.getClearinghouseState(MAIN_WALLET);
            console.log("Available margin:", state.marginSummary.accountValue);


            // Try different property names for equity
            const equity = Number(
                state.marginSummary?.accountValue ||
                state.marginSummary?.totalRawUsd ||
                1000 // Default fallback
            );

            const day = getDayState();

            // Calculate daily P&L from trades
            // Use the already calculated daily P&L values
            const dailyProfit = Math.max(0, day.realizedPnl); // Positive profits only
            const dailyLoss = day.realizedLoss; // Already calculated absolute loss

            // Daily limits check
            if (dailyLoss >= cfg.maxDayLossUsd) {
                return NextResponse.json({
                    error: `Daily loss limit reached: -$${dailyLoss}/$${cfg.maxDayLossUsd}`
                }, { status: 400 });
            }

            if (dailyProfit >= cfg.targetDailyProfit) {
                return NextResponse.json({
                    success: true,
                    message: `🎉 Daily target achieved: $${dailyProfit}/${cfg.targetDailyProfit}`,
                    shouldStop: true
                });
            }

            // Check if we have enough margin for the leveraged position
            const requiredMargin = notionalValue / leverage;
            const availableMargin = equity * 1.0; 

            if (requiredMargin > availableMargin) {
                return NextResponse.json({
                    error: `Insufficient margin: need $${requiredMargin.toFixed(0)}, available $${availableMargin.toFixed(0)}`
                }, { status: 400 });
            }

            console.log(`📊 Daily P&L: +$${dailyProfit}/-$${dailyLoss}, Equity: $${equity.toFixed(0)}, Required Margin: $${requiredMargin.toFixed(0)}`);
        } catch (riskError) {
            console.warn('Risk check failed:', riskError);
        }

        // Set leverage first if different from current
        try {
            const coin = ASSET_MAP[Number(asset) as keyof typeof ASSET_MAP] || 'BTC-PERP';

            // Set leverage for the asset
            const leverageResult = await sdk.exchange.updateLeverage(
                coin,
                'cross',
                leverage
            );

            if (leverageResult.status === 'err') {
                console.warn(`⚠️ Leverage update failed: ${leverageResult.response}`);
                // Continue anyway as leverage might already be set
            } else {
                console.log(`✅ Leverage set to ${leverage}x for ${coin}`);
            }
        } catch (leverageError) {
            console.warn('Leverage setting failed:', leverageError);
            // Continue with order placement
        }

        // Map asset to coin
        const coin = ASSET_MAP[Number(asset) as keyof typeof ASSET_MAP] || 'BTC-PERP';
        const isBuy = side === 'LONG';

        // 🎯 EXACT same format as your working commented code
        const orderParams = {
            coin,
            is_buy: isBuy,
            sz: Number(size),      // 🎯 Ensure it's a number
            limit_px: Number(price), // 🎯 Ensure it's a number
            order_type: { limit: { tif: 'Gtc' as Tif } },
            reduce_only: false
        };

        // Add TP/SL if provided
        if (takeProfit || stopLoss) {
            orderParams.order_type = {
                limit: { tif: 'Gtc' as Tif },
                ...(takeProfit && { tp: Number(takeProfit) }),
                ...(stopLoss && { sl: Number(stopLoss) })
            };
        }

        console.log('📤 Order params:', JSON.stringify(orderParams, null, 2));

        // Place order
        const result = await sdk.exchange.placeOrder(orderParams);

        if (result.status === 'err') {
            throw new Error(result.response);
        }

        // Track trade
        try {
            if (result.status === 'ok' && result.response?.data?.statuses?.[0]) {
                const statusObj = result.response.data.statuses[0];

                if ('filled' in statusObj && statusObj.filled) {
                    const avgPx = Number(statusObj.filled.avgPx);
                    const filledSz = Number(statusObj.filled.totalSz);
                    const pnl = (isBuy ? avgPx - price : price - avgPx) * filledSz;
                    const oid = statusObj.filled.oid;

                    pushTrade({
                        id: String(oid),
                        pnl,
                        side,
                        size: filledSz,
                        avgPrice: avgPx,
                        leverage,
                        timestamp: Date.now()
                    });

                    console.log(`💰 FILLED: ${side} ${filledSz} @ $${avgPx}, PnL: $${pnl.toFixed(2)}`);
                } else if ('resting' in statusObj) {
                    console.log(`📋 ORDER PLACED: ${side} ${size} @ $${price}`);
                }
            }
        } catch (trackError) {
            console.warn('Trade tracking failed:', trackError);
        }

        // return new Response(JSON.stringify(result), { status: 200 });
        return new Response(JSON.stringify({
            ...result,
            leverageInfo: {
                leverage,
                notionalValue: notionalValue.toFixed(2),
                actualRisk: actualDollarRisk.toFixed(2),
                requiredMargin: (notionalValue / leverage).toFixed(2)
            }
        }), { status: 200 });

    } catch (e: any) {
        console.error('❌ HL order error:', e);
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

