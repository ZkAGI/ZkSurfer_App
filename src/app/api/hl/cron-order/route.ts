// import { NextResponse } from 'next/server';
// import { Hyperliquid, Tif } from 'hyperliquid';
// import { getDayState, pushTrade } from '@/lib/dayState';

// export const runtime = 'nodejs';

// // ——— SDK Configuration ————————————————————————————————————————————————
// const PK = process.env.NEXT_PUBLIC_HL_PRIVATE_KEY;
// const MAIN_WALLET_RAW = process.env.NEXT_PUBLIC_HL_MAIN_WALLET;
// const USER_WALLET_RAW = process.env.NEXT_PUBLIC_HL_USER_WALLET;

// if (!PK) throw new Error('HL_PRIVATE_KEY missing in env');
// if (!MAIN_WALLET_RAW) throw new Error('HL_MAIN_WALLET missing in env');
// if (!USER_WALLET_RAW) throw new Error('USER_WALLET_RAW missing in env');

// const MAIN_WALLET: string = MAIN_WALLET_RAW;
// const USER_WALLET: string = USER_WALLET_RAW;

// const sdk = new Hyperliquid({
//     privateKey: PK,
//     walletAddress: MAIN_WALLET,
//     testnet: false
// });

// // ——— PRODUCTION CONSTANTS ————————————————————————————————————————————
// const LOT_SIZE = 0.00001;
// const MIN_ORDER_SIZE = 0.0001;
// const MIN_PROFIT_PER_TRADE = 50; // $50 minimum target
// const MAX_PROFIT_TARGET = 100; // $100 optimal target
// const HIGH_PROFIT_THRESHOLD = 20; // $20+ = wait 1-2 min before closing
// const MIN_DECLINING_PROFIT = 5; // $5+ declining = close
// const MAX_LOSS_PER_TRADE = 30;
// const DAILY_LOSS_LIMIT = 150;
// const CAPITAL_USAGE_PERCENT = 0.30;
// const MAX_LEVERAGE = 25;
// const MIN_LEVERAGE = 5;

// // ——— DUAL STOP LOSS SYSTEM ————————————————————————————————————————————
// const HARD_STOP_LOSS_PERCENT = 0.8; // Placed with order
// const EMERGENCY_STOP_LOSS_PERCENT = 1.2; // Dynamic monitoring
// const EMERGENCY_STOP_DOLLAR = 25; // $25 emergency stop

// // ——— TIME-BASED RISK MANAGEMENT ————————————————————————————————————————
// const LOSS_MONITORING_MINUTES = 5; // Monitor losses for 5 minutes
// const HIGH_PROFIT_WAIT_MINUTES = 2; // Wait max 2 minutes for $20+ profits
// const PROFIT_PATIENCE_MINUTES = 1; // Wait 1 minute after $50+ target
// const MAX_POSITION_AGE_HOURS = 1; // Auto-close after 1 hour

// // ——— Helper Functions ————————————————————————————————————————————————
// function roundLot(x: number) {
//     const lots = Math.max(
//         Math.floor(x / LOT_SIZE),
//         Math.ceil(MIN_ORDER_SIZE / LOT_SIZE)
//     );
//     return lots * LOT_SIZE;
// }

// // ——— PRODUCTION API CALLS (Real Hyperliquid Data) ————————————————————————
// async function getPositionsWithFills() {
//     try {
//         // Get current positions
//         const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'clearinghouseState',
//                 user: USER_WALLET
//             })
//         });

//         const perpState = await perpResponse.json();
//         const positions = perpState?.assetPositions || [];

//         if (positions.length === 0) {
//             return [];
//         }

//         // Get fills for entry price/time data
//         const fillsResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'userFills',
//                 user: USER_WALLET
//             })
//         });

//         const fills = await fillsResponse.json();

//         // Get current market prices
//         const priceResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ type: 'allMids' })
//         });
//         const allMids = await priceResponse.json();

//         // Combine position data with fill history
//         const enrichedPositions = positions.map((position: any) => {
//             const coin = position.position.coin;
//             const size = parseFloat(position.position.szi);
//             const unrealizedPnl = parseFloat(position.position.unrealizedPnl || '0');
//             const currentPrice = allMids[coin];

//             // Get latest fill for this coin to determine entry price and time
//             const coinFills = fills.filter((fill: any) => fill.coin === coin);
//             const latestFill = coinFills.sort((a: any, b: any) => b.time - a.time)[0];

//             const entryPrice = latestFill ? latestFill.px : currentPrice - (unrealizedPnl / Math.abs(size));
//             const entryTime = latestFill ? latestFill.time : Date.now() - (30 * 60 * 1000);
//             const positionAgeMinutes = (Date.now() - entryTime) / (60 * 1000);

//             return {
//                 coin,
//                 size,
//                 unrealizedPnl,
//                 currentPrice,
//                 entryPrice,
//                 entryTime,
//                 positionAgeMinutes,
//                 isLong: size > 0,
//                 leverage: position.position.leverage?.value || 1,
//                 marginUsed: parseFloat(position.position.marginUsed || '0')
//             };
//         });

//         return enrichedPositions;

//     } catch (error) {
//         console.error('❌ Error getting positions with fills:', error);
//         return [];
//     }
// }

// async function getAvailableUSDC() {
//     try {
//         console.log('🔍 Checking wallet:', USER_WALLET);

//         const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'clearinghouseState',
//                 user: USER_WALLET
//             })
//         });

//         const perpState = await perpResponse.json();
//         const spotResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'spotClearinghouseState',
//                 user: USER_WALLET
//             })
//         });

//         const spotState = await spotResponse.json();
//         const perpBalance = parseFloat(perpState?.marginSummary?.accountValue || '0');
//         const spotBalances = spotState?.balances || [];
//         const usdcSpot = spotBalances.find((b: any) => b.coin === 'USDC');
//         const spotUSDC = parseFloat(usdcSpot?.total || '0');

//         if (perpBalance > 0) {
//             return {
//                 totalUSDC: perpBalance,
//                 availableMargin: parseFloat(perpState.withdrawable || perpState.marginSummary.accountValue),
//                 source: 'perpetuals'
//             };
//         }

//         if (spotUSDC > 0) {
//             return {
//                 totalUSDC: spotUSDC,
//                 availableMargin: spotUSDC,
//                 needsTransfer: true,
//                 spotAmount: spotUSDC,
//                 source: 'spot'
//             };
//         }

//         return { totalUSDC: 0, availableMargin: 0, noFunds: true };

//     } catch (err) {
//         console.error('❌ API Error:', err);
//         return { totalUSDC: 0, availableMargin: 0, error: err };
//     }
// }

// // ——— GUARANTEED INSTANT CLOSE (Proper SDK Usage) ————————————————————————
// async function guaranteedInstantClose(coin: string, size: number, isBuy: boolean, reason: string = 'AUTO') {
//     console.log(`🎯 INSTANT CLOSE: ${coin} | Size: ${size} | Side: ${isBuy ? 'BUY' : 'SELL'} | Reason: ${reason}`);

//     try {
//         // Get aggressive pricing from order book
//         const l2Response = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'l2Book',
//                 coin: coin,
//                 nSigFigs: 5
//             })
//         });

//         const l2Book = await l2Response.json();
//         let aggressivePrice;

//         if (isBuy && l2Book?.levels?.[0]?.[0]) {
//             const bestAsk = parseFloat(l2Book.levels[0][0].px);
//             aggressivePrice = bestAsk * 1.02; // 2% above ask
//         } else if (!isBuy && l2Book?.levels?.[1]?.[0]) {
//             const bestBid = parseFloat(l2Book.levels[1][0].px);
//             aggressivePrice = bestBid * 0.98; // 2% below bid
//         } else {
//             // Fallback to mid-price
//             const midResponse = await fetch('https://api.hyperliquid.xyz/info', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ type: 'allMids' })
//             });
//             const allMids = await midResponse.json();
//             const midPrice = allMids[coin];
//             aggressivePrice = midPrice * (isBuy ? 1.03 : 0.97);
//         }

//         // Use SDK method (handles signing automatically)
//         const closeOrderParams = {
//             coin: `${coin}-PERP`,
//             is_buy: isBuy,
//             sz: Math.abs(size),
//             limit_px: Math.round(aggressivePrice),
//             order_type: { limit: { tif: 'Ioc' as Tif } },
//             reduce_only: true
//         };

//         console.log('📤 INSTANT CLOSE (SDK):', closeOrderParams);
//         const result = await sdk.exchange.placeOrder(closeOrderParams);

//         return {
//             success: result.status === 'ok',
//             method: 'SDK_INSTANT_CLOSE',
//             result: result,
//             executionPrice: aggressivePrice
//         };

//     } catch (error) {
//         console.error(`❌ SDK close error for ${coin}:`, error);
//         return { success: false, method: 'FAILED', error };
//     }
// }

// // ——— PRODUCTION PROFIT/LOSS MONITORING (No In-Memory Tracking) ————————————
// async function productionProfitLossMonitoring() {
//     try {
//         console.log('🔍 PRODUCTION MONITORING: Using real Hyperliquid data...');

//         const positions = await getPositionsWithFills();
//         if (positions.length === 0) {
//             console.log('✅ No positions to monitor');
//             return { actions: 0, totalPnl: 0 };
//         }

//         let actionsPerformed = 0;
//         let totalPnlChange = 0;
//         const currentTime = Date.now();

//         // Get user fills to track profit history for patience logic
//         const fillsResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'userFills',
//                 user: USER_WALLET
//             })
//         });
//         const allFills = await fillsResponse.json();

//         for (const pos of positions) {
//             const { coin, size, unrealizedPnl, currentPrice, entryPrice, positionAgeMinutes, isLong } = pos;

//             console.log(`📊 ${coin} PRODUCTION Analysis:`);
//             console.log(`   Size: ${size} | PnL: $${unrealizedPnl.toFixed(2)} | Age: ${positionAgeMinutes.toFixed(1)}min`);
//             console.log(`   Entry: $${entryPrice} | Current: $${currentPrice} | ${isLong ? 'LONG' : 'SHORT'}`);

//             // Calculate stop loss levels
//             const hardStopPrice = isLong ?
//                 entryPrice * (1 - HARD_STOP_LOSS_PERCENT / 100) :
//                 entryPrice * (1 + HARD_STOP_LOSS_PERCENT / 100);

//             const emergencyStopPrice = isLong ?
//                 entryPrice * (1 - EMERGENCY_STOP_LOSS_PERCENT / 100) :
//                 entryPrice * (1 + EMERGENCY_STOP_LOSS_PERCENT / 100);

//             let shouldClose = false;
//             let closeReason = '';

//             // 🚨 PRIORITY 1: EMERGENCY STOPS (Immediate)

//             // Emergency dollar stop
//             if (unrealizedPnl <= -EMERGENCY_STOP_DOLLAR) {
//                 shouldClose = true;
//                 closeReason = `EMERGENCY_DOLLAR_STOP_$${unrealizedPnl.toFixed(2)}`;
//             }
//             // Emergency percentage stop
//             else if ((isLong && currentPrice <= emergencyStopPrice) ||
//                 (!isLong && currentPrice >= emergencyStopPrice)) {
//                 shouldClose = true;
//                 closeReason = `EMERGENCY_PERCENT_STOP_${EMERGENCY_STOP_LOSS_PERCENT}%_$${unrealizedPnl.toFixed(2)}`;
//             }
//             // Hard stop loss (should be handled by exchange, but double-check)
//             else if ((isLong && currentPrice <= hardStopPrice) ||
//                 (!isLong && currentPrice >= hardStopPrice)) {
//                 shouldClose = true;
//                 closeReason = `HARD_STOP_BREACH_${HARD_STOP_LOSS_PERCENT}%_$${unrealizedPnl.toFixed(2)}`;
//             }

//             // 💰 PRIORITY 2: SMART PROFIT MANAGEMENT

//             // High profit ($20+) with patience logic
//             else if (unrealizedPnl >= HIGH_PROFIT_THRESHOLD) {
//                 // Calculate time at $20+ using real fill history
//                 const twentyPlusTime = currentTime - (2 * 60 * 1000); // 2 minutes ago
//                 const recentFills = allFills.filter((fill: any) =>
//                     fill.coin === coin && fill.time >= twentyPlusTime
//                 );

//                 // Check if we've been profitable for the patience period
//                 const hasBeenAt20Plus = recentFills.some((fill: any) => {
//                     const fillPnl = isLong ?
//                         (currentPrice - fill.px) * Math.abs(size) :
//                         (fill.px - currentPrice) * Math.abs(size);
//                     return fillPnl >= HIGH_PROFIT_THRESHOLD;
//                 });

//                 const timeAt20Plus = hasBeenAt20Plus ?
//                     (currentTime - recentFills[0]?.time) / (60 * 1000) : 0;

//                 if (timeAt20Plus >= HIGH_PROFIT_WAIT_MINUTES || unrealizedPnl >= 50) {
//                     shouldClose = true;
//                     closeReason = `HIGH_PROFIT_PATIENCE_${unrealizedPnl.toFixed(2)}_${timeAt20Plus.toFixed(1)}min`;
//                 } else {
//                     console.log(`⏳ ${coin} at ${unrealizedPnl.toFixed(2)} - waiting ${(HIGH_PROFIT_WAIT_MINUTES - timeAt20Plus).toFixed(1)}min more`);
//                 }
//             }

//             // Declining profit from $5+
//             else if (unrealizedPnl >= MIN_DECLINING_PROFIT) {
//                 // Get max profit from recent fills to detect decline
//                 const recentFills = allFills.filter((fill: any) =>
//                     fill.coin === coin && (currentTime - fill.time) <= (10 * 60 * 1000)
//                 );

//                 if (recentFills.length > 0) {
//                     const maxRecentPnl = Math.max(...recentFills.map((fill: any) => {
//                         return isLong ?
//                             (currentPrice - fill.px) * Math.abs(size) :
//                             (fill.px - currentPrice) * Math.abs(size);
//                     }));

//                     // If current PnL is 10% below recent max, close
//                     if (unrealizedPnl < maxRecentPnl * 0.9 && maxRecentPnl >= MIN_DECLINING_PROFIT) {
//                         shouldClose = true;
//                         closeReason = `DECLINING_PROFIT_$${unrealizedPnl.toFixed(2)}_from_$${maxRecentPnl.toFixed(2)}`;
//                     }
//                 }
//             }

//             // Target profit reached ($50+) with patience
//             else if (unrealizedPnl >= MIN_PROFIT_PER_TRADE) {
//                 // Check time since reaching $50
//                 const target50Fills = allFills.filter((fill: any) => {
//                     const fillPnl = isLong ?
//                         (currentPrice - fill.px) * Math.abs(size) :
//                         (fill.px - currentPrice) * Math.abs(size);
//                     return fill.coin === coin && fillPnl >= MIN_PROFIT_PER_TRADE;
//                 });

//                 const timeSince50 = target50Fills.length > 0 ?
//                     (currentTime - target50Fills[0].time) / (60 * 1000) : 0;

//                 if (timeSince50 >= PROFIT_PATIENCE_MINUTES) {
//                     // Check if declining after patience period
//                     const recentMax = Math.max(...allFills
//                         .filter((fill: any) => fill.coin === coin && (currentTime - fill.time) <= (PROFIT_PATIENCE_MINUTES * 60 * 1000))
//                         .map((fill: any) => isLong ?
//                             (currentPrice - fill.px) * Math.abs(size) :
//                             (fill.px - currentPrice) * Math.abs(size)
//                         ));

//                     if (unrealizedPnl < recentMax * 0.95) { // 5% decline after patience
//                         shouldClose = true;
//                         closeReason = `PATIENT_PROFIT_$${unrealizedPnl.toFixed(2)}_after_${timeSince50.toFixed(1)}min`;
//                     }
//                 }
//             }

//             // 🕐 PRIORITY 3: TIME-BASED RISK CONTROL

//             // Loss monitoring (5+ minutes in red and getting worse)
//             else if (unrealizedPnl < 0 && positionAgeMinutes >= LOSS_MONITORING_MINUTES) {
//                 // Check if loss is persistent by examining fill history
//                 const lossStartTime = currentTime - (LOSS_MONITORING_MINUTES * 60 * 1000);
//                 const recentFills = allFills.filter((fill: any) =>
//                     fill.coin === coin && fill.time >= lossStartTime
//                 );

//                 const isLossWorsening = recentFills.length > 2 &&
//                     recentFills.every((fill: any) => {
//                         const fillPnl = isLong ?
//                             (currentPrice - fill.px) * Math.abs(size) :
//                             (fill.px - currentPrice) * Math.abs(size);
//                         return fillPnl < -5; // Consistently losing
//                     });

//                 if (isLossWorsening) {
//                     shouldClose = true;
//                     closeReason = `PERSISTENT_LOSS_$${unrealizedPnl.toFixed(2)}_${positionAgeMinutes.toFixed(1)}min`;
//                 }
//             }

//             // Age limit (1 hour max)
//             else if (positionAgeMinutes >= (MAX_POSITION_AGE_HOURS * 60)) {
//                 shouldClose = true;
//                 closeReason = `AGE_LIMIT_${positionAgeMinutes.toFixed(1)}min_$${unrealizedPnl.toFixed(2)}`;
//             }

//             // Execute close if needed
//             if (shouldClose) {
//                 console.log(`🔴 CLOSING ${coin}: ${closeReason}`);

//                 const isBuy = size < 0; // If short, buy to close
//                 const closeResult = await guaranteedInstantClose(coin, size, isBuy, closeReason);

//                 if (closeResult.success) {
//                     console.log(`✅ PRODUCTION CLOSE SUCCESS: ${coin} - ${closeReason}`);
//                     actionsPerformed++;
//                     totalPnlChange += unrealizedPnl;

//                     // Track the realized trade
//                     pushTrade({
//                         id: `close_${Date.now()}`,
//                         pnl: unrealizedPnl,
//                         side: closeReason,
//                         size: Math.abs(size),
//                         avgPrice: currentPrice,
//                         leverage: pos.leverage,
//                         timestamp: currentTime
//                     });
//                 }

//                 await new Promise(resolve => setTimeout(resolve, 1000));
//             }
//         }

//         return { actions: actionsPerformed, totalPnl: totalPnlChange };

//     } catch (error) {
//         console.error('❌ Production monitoring error:', error);
//         return { actions: 0, totalPnl: 0, error };
//     }
// }

// // ——— ISOLATED MARGIN ORDER PLACEMENT (Proper SDK) ————————————————————————
// async function placeIsolatedMarginOrder(orderParams: any) {
//     try {
//         console.log('🔒 PRODUCTION ISOLATED MARGIN setup...');

//         // Set isolated margin using SDK method (correct parameters)
//         try {
//             const marginResult = await sdk.exchange.updateLeverage(
//                 'BTC',// BTC asset index (typically 0)
//                 'isolated', // BTC asset index (typically 0)
//                 orderParams.leverage || MIN_LEVERAGE
//             );
//             // Then set to isolated mode if SDK supports it
//             console.log('✅ Leverage updated via SDK:', marginResult);
//         } catch (marginErr) {
//             console.warn('⚠️ SDK leverage update:', marginErr);
//         }

//         // Calculate hard stop loss for trigger order
//         const hardStopPrice = orderParams.is_buy ?
//             orderParams.limit_px * (1 - HARD_STOP_LOSS_PERCENT / 100) :
//             orderParams.limit_px * (1 + HARD_STOP_LOSS_PERCENT / 100);

//         // Place main order using SDK
//         const mainOrderParams = {
//             coin: orderParams.coin,
//             is_buy: orderParams.is_buy,
//             sz: Number(orderParams.sz),
//             limit_px: orderParams.limit_px,
//             order_type: { limit: { tif: 'Ioc' as Tif } },
//             reduce_only: false
//         };

//         console.log('📤 MAIN ORDER (SDK):', mainOrderParams);
//         const mainResult = await sdk.exchange.placeOrder(mainOrderParams);
//         console.log('📥 MAIN ORDER RESULT:', mainResult);

//         // Place hard stop loss as trigger order using SDK
//         if (mainResult.status === 'ok') {
//             const stopOrderParams = {
//                 coin: orderParams.coin,
//                 is_buy: !orderParams.is_buy, // Opposite side for stop
//                 sz: Number(orderParams.sz),
//                 limit_px: Math.round(hardStopPrice),
//                 order_type: {
//                     trigger: {
//                         triggerPx: Math.round(hardStopPrice),
//                         isMarket: false,
//                         tpsl: 'sl' as 'sl'
//                     }
//                 },
//                 reduce_only: true
//             };

//             console.log('🛑 HARD STOP ORDER (SDK):', stopOrderParams);
//             const stopResult = await sdk.exchange.placeOrder(stopOrderParams);
//             console.log('🛑 HARD STOP RESULT:', stopResult);

//             return {
//                 mainOrder: mainResult,
//                 stopOrder: stopResult,
//                 combinedSuccess: mainResult.status === 'ok' && stopResult.status === 'ok'
//             };
//         }

//         return { mainOrder: mainResult, combinedSuccess: mainResult.status === 'ok' };

//     } catch (error) {
//         console.error('❌ Isolated margin order error:', error);
//         throw error;
//     }
// }

// // ——— ENHANCED POSITION SIZING ————————————————————————————————————————————
// function calculateProductionSize(
//     price: number,
//     availableUSDC: number,
//     currentProfit: number,
//     currentLoss: number,
//     confidence: number = 85
// ) {
//     // Dynamic profit targeting based on performance
//     let targetProfit = MIN_PROFIT_PER_TRADE;

//     if (currentProfit >= 200 && currentLoss <= 30) {
//         targetProfit = MAX_PROFIT_TARGET; // $100 on hot streak
//     } else if (currentProfit >= 100 && currentLoss <= 50) {
//         targetProfit = 75; // $75 when doing well
//     }

//     const capitalPerTrade = availableUSDC * CAPITAL_USAGE_PERCENT;

//     // Calculate leverage for target
//     const expectedMovePercent = 2.0; // 2% expected move
//     const requiredNotional = (targetProfit / expectedMovePercent) * 100;
//     const neededLeverage = Math.max(MIN_LEVERAGE, requiredNotional / capitalPerTrade);

//     // Performance-based leverage
//     const performanceLeverage = calculateDynamicLeverage(currentProfit, currentLoss, confidence);
//     const finalLeverage = Math.min(Math.max(neededLeverage, performanceLeverage), MAX_LEVERAGE);

//     const notionalValue = capitalPerTrade * finalLeverage;
//     const positionSize = notionalValue / price;
//     const actualExpectedProfit = (notionalValue * expectedMovePercent) / 100;

//     return {
//         size: roundLot(positionSize),
//         leverage: finalLeverage,
//         notionalValue,
//         expectedProfit: actualExpectedProfit,
//         targetProfit,
//         maxRisk: Math.min(notionalValue * 0.025, MAX_LOSS_PER_TRADE)
//     };
// }

// function calculateDynamicLeverage(profit: number, loss: number, confidence: number = 85) {
//     if (loss >= 120) return 3;   // Emergency mode
//     if (loss >= 80) return 6;    // Caution mode

//     // Aggressive when performing well
//     if (profit >= 300 && loss <= 30) return MAX_LEVERAGE;
//     if (profit >= 200 && loss <= 50) return 20;
//     if (profit >= 100 && loss <= 40) return 18;
//     if (loss <= 40) return 15;
//     if (loss >= 60) return 10;

//     return 12; // Default aggressive
// }

// // ——— MAIN PRODUCTION HANDLER ————————————————————————————————————————————
// export async function GET() {
//     try {
//         console.log('🚀 PRODUCTION TRADING BOT:', new Date().toISOString());

//         // 🔍 STEP 1: Production monitoring using real Hyperliquid data
//         console.log('🔍 Step 1: Production position monitoring...');
//         const monitoringResult = await productionProfitLossMonitoring();

//         if (monitoringResult.actions > 0) {
//             console.log(`✅ Monitoring: ${monitoringResult.actions} actions, $${monitoringResult.totalPnl.toFixed(2)} PnL`);
//             await new Promise(resolve => setTimeout(resolve, 2000)); // Settlement wait
//         }

//         // 📊 STEP 2: Get trading signal
//         console.log('📊 Step 2: Fetching production signal...');
//         const apiKey = process.env.NEXT_PUBLIC_API_KEY;
//         if (!apiKey) {
//             return NextResponse.json({ error: 'API_KEY missing' }, { status: 500 });
//         }

//         const forecastRes = await fetch('https://zynapse.zkagi.ai/today', {
//             method: 'GET',
//             cache: 'no-store',
//             headers: {
//                 accept: 'application/json',
//                 'api-key': apiKey
//             }
//         });

//         if (!forecastRes.ok) {
//             return NextResponse.json(
//                 { error: `Forecast API error (${forecastRes.status})` },
//                 { status: forecastRes.status }
//             );
//         }

//         const { forecast_today_hourly } = await forecastRes.json();
//         const slot = Array.isArray(forecast_today_hourly) && forecast_today_hourly.length > 0
//             ? forecast_today_hourly[forecast_today_hourly.length - 1]
//             : null;

//         if (!slot || slot.signal === 'HOLD' || !slot.forecast_price) {
//             return NextResponse.json({
//                 message: 'No trade signal',
//                 monitoringActions: monitoringResult.actions,
//                 monitoringPnl: monitoringResult.totalPnl
//             });
//         }

//         // 🛑 STEP 3: Daily loss check
//         const dayState = getDayState();
//         if (dayState.realizedLoss >= DAILY_LOSS_LIMIT) {
//             return NextResponse.json({
//                 message: `Daily loss limit: ${dayState.realizedLoss}`,
//                 monitoringActions: monitoringResult.actions
//             });
//         }

//         // 💰 STEP 4: Production position sizing
//         console.log('💰 Step 4: Production position calculation...');
//         const balanceInfo = await getAvailableUSDC();

//         if (balanceInfo.noFunds || balanceInfo.availableMargin < 10) {
//             return NextResponse.json({
//                 error: 'Insufficient funds',
//                 balanceInfo,
//                 monitoringActions: monitoringResult.actions
//             });
//         }

//         // Auto-transfer if needed
//         if (balanceInfo.needsTransfer && balanceInfo.spotAmount > 0) {
//             console.log(`💸 Auto-transfer: ${balanceInfo.spotAmount} USDC`);
//             try {
//                 await sdk.exchange.transferBetweenSpotAndPerp(balanceInfo.spotAmount, true);
//                 await new Promise(resolve => setTimeout(resolve, 2000));
//                 const updatedBalance = await getAvailableUSDC();
//                 balanceInfo.availableMargin = updatedBalance.availableMargin;
//             } catch (transferErr) {
//                 console.error('❌ Transfer failed:', transferErr);
//             }
//         }

//         const positionCalc = calculateProductionSize(
//             slot.forecast_price,
//             balanceInfo.availableMargin,
//             Math.max(0, dayState.realizedPnl),
//             dayState.realizedLoss,
//             slot.confidence_90?.[1] || 85
//         );

//         // 🎯 STEP 5: Place production isolated margin order
//         console.log('🎯 Step 5: Placing production isolated order...');

//         const coin = 'BTC-PERP';
//         const isBuy = slot.signal === 'LONG';

//         // Get current market for aggressive entry
//         const currentMarketPrice = (await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ type: 'allMids' })
//         }).then(r => r.json()))['BTC'];

//         // 1.5% slippage for guaranteed fills
//         const aggressiveEntryPrice = isBuy ?
//             Math.round(currentMarketPrice * 1.015) :
//             Math.round(currentMarketPrice * 0.985);

//         const orderParams = {
//             coin,
//             is_buy: isBuy,
//             sz: Number(positionCalc.size),
//             limit_px: aggressiveEntryPrice,
//             leverage: positionCalc.leverage,
//             reduce_only: false
//         };

//         const result = await placeIsolatedMarginOrder(orderParams);

//         // Handle the response from the new isolated margin function
//         const success = result.combinedSuccess || (result.mainOrder && result.mainOrder.status === 'ok');

//         console.log('📊 ISOLATED ORDER EXECUTION:', {
//             mainOrderSuccess: result.mainOrder?.status === 'ok',
//             stopOrderSuccess: result.stopOrder?.status === 'ok',
//             combinedSuccess: success
//         });

//         // 📊 STEP 6: Production response
//         const payload = {
//             success: true,
//             timestamp: new Date().toISOString(),
//             productionFeatures: {
//                 isolatedMargin: true,
//                 dualStopLoss: true,
//                 realTimeMonitoring: true,
//                 smartProfitManagement: true,
//                 noInMemoryTracking: true
//             },
//             monitoringResult: {
//                 actions: monitoringResult.actions,
//                 totalPnl: monitoringResult.totalPnl
//             },
//             forecastSlot: slot,
//             orderDetails: {
//                 coin,
//                 signal: slot.signal,
//                 size: positionCalc.size,
//                 leverage: positionCalc.leverage,
//                 entryPrice: aggressiveEntryPrice,
//                 marketPrice: currentMarketPrice,
//                 isolatedMargin: true
//             },
//             riskManagement: {
//                 hardStopLoss: `${HARD_STOP_LOSS_PERCENT}% (placed with order)`,
//                 emergencyStopLoss: `${EMERGENCY_STOP_LOSS_PERCENT}% or $${EMERGENCY_STOP_DOLLAR}`,
//                 profitStrategy: {
//                     highProfitWait: `$${HIGH_PROFIT_THRESHOLD}+ waits ${HIGH_PROFIT_WAIT_MINUTES}min max`,
//                     targetRange: `$${MIN_PROFIT_PER_TRADE}-${MAX_PROFIT_TARGET}`,
//                     decliningProfit: `$${MIN_DECLINING_PROFIT}+ declining = instant close`,
//                     patience: `${PROFIT_PATIENCE_MINUTES}min after $${MIN_PROFIT_PER_TRADE}`
//                 },
//                 timeManagement: {
//                     lossMonitoring: `${LOSS_MONITORING_MINUTES}min persistent loss check`,
//                     maxAge: `${MAX_POSITION_AGE_HOURS}h auto-close`
//                 }
//             },
//             performance: {
//                 expectedProfit: `$${positionCalc.expectedProfit.toFixed(2)}`,
//                 maxRisk: `$${positionCalc.maxRisk.toFixed(2)}`,
//                 capitalUsed: `$${(balanceInfo.availableMargin * CAPITAL_USAGE_PERCENT).toFixed(0)}`
//             },
//             sdkResponse: result
//         };

//         console.log('🎯 PRODUCTION COMPLETE (SDK):', JSON.stringify(payload, null, 2));
//         return NextResponse.json(payload);

//     } catch (err: any) {
//         console.error('❌ Production error:', err);
//         return NextResponse.json({ error: err.message }, { status: 500 });
//     }
// }


// import { NextResponse } from 'next/server';
// import { Hyperliquid, Tif } from 'hyperliquid';
// import { getDayState, pushTrade } from '@/lib/dayState';

// export const runtime = 'nodejs';

// // ——— SDK Configuration ————————————————————————————————————————————————
// const PK = process.env.NEXT_PUBLIC_HL_PRIVATE_KEY;
// const MAIN_WALLET_RAW = process.env.NEXT_PUBLIC_HL_MAIN_WALLET;
// const USER_WALLET_RAW = process.env.NEXT_PUBLIC_HL_USER_WALLET;

// if (!PK) throw new Error('HL_PRIVATE_KEY missing in env');
// if (!MAIN_WALLET_RAW) throw new Error('HL_MAIN_WALLET missing in env');
// if (!USER_WALLET_RAW) throw new Error('USER_WALLET_RAW missing in env');

// const MAIN_WALLET: string = MAIN_WALLET_RAW;
// const USER_WALLET: string = USER_WALLET_RAW;

// const sdk = new Hyperliquid({
//     privateKey: PK,
//     walletAddress: MAIN_WALLET,
//     testnet: false
// });

// // ——— CONSTANTS ————————————————————————————————————————————————
// const LOT_SIZE = 0.00001;
// const MIN_ORDER_SIZE = 0.0001;
// const MIN_PROFIT_PER_TRADE = 50;
// const MAX_LOSS_PER_TRADE = 20;
// const DAILY_LOSS_LIMIT = 100;
// const CAPITAL_USAGE_PERCENT = 0.30;
// const MAX_LEVERAGE = 25;
// const MIN_LEVERAGE = 5;
// const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// // ——— Helper Functions ————————————————————————————————————————————————
// function roundLot(x: number) {
//     const lots = Math.max(
//         Math.floor(x / LOT_SIZE),
//         Math.ceil(MIN_ORDER_SIZE / LOT_SIZE)
//     );
//     return lots * LOT_SIZE;
// }

// // ——— REVERSE SIGNAL FUNCTION ————————————————————————————————————————
// function reverseSignal(originalSignal: string): string {
//     if (originalSignal === 'LONG') return 'SHORT';
//     if (originalSignal === 'SHORT') return 'LONG';
//     return originalSignal; // Keep HOLD as is
// }

// // ——— DEBUG: SHOW RAW POSITION DATA ————————————————————————————————————————
// async function debugPositionData() {
//     try {
//         console.log('🔍 DEBUG: Raw position data from Hyperliquid API...');

//         const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'clearinghouseState',
//                 user: USER_WALLET
//             })
//         });

//         const perpState = await perpResponse.json();
        
//         console.log('📊 FULL API RESPONSE:');
//         console.log(JSON.stringify(perpState, null, 2));

//         if (perpState?.assetPositions) {
//             console.log('\n📊 POSITION DETAILS:');
//             perpState.assetPositions.forEach((pos: any, index: number) => {
//                 console.log(`\n--- Position ${index + 1} ---`);
//                 console.log('Raw position object:', JSON.stringify(pos, null, 2));
                
//                 if (pos.position) {
//                     console.log('Available fields in position:');
//                     Object.keys(pos.position).forEach(key => {
//                         console.log(`  ${key}: ${pos.position[key]}`);
//                     });
//                 }
//             });
//         }

//         return perpState;
//     } catch (error) {
//         console.error('❌ Debug error:', error);
//         return null;
//     }
// }

// // ——— GET POSITIONS WITH EXACT HYPERLIQUID ROE/PNL ————————————————————————————————————————
// async function getPositionsWithROE() {
//     try {
//         console.log('🔍 Getting positions with exact Hyperliquid ROE calculation...');

//         // Get current positions
//         const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'clearinghouseState',
//                 user: USER_WALLET
//             })
//         });

//         const perpState = await perpResponse.json();
//         const positions = perpState?.assetPositions || [];

//         if (positions.length === 0) {
//             console.log('✅ No open positions found');
//             return [];
//         }

//         // Get fills for entry price/time data
//         const fillsResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'userFills',
//                 user: USER_WALLET
//             })
//         });

//         const fills = await fillsResponse.json();

//         // Get current market prices
//         const priceResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ type: 'allMids' })
//         });
//         const allMids = await priceResponse.json();

//         const enrichedPositions = positions.map((position: any) => {
//             const coin = position.position.coin;
//             const size = parseFloat(position.position.szi);
//             const unrealizedPnl = parseFloat(position.position.unrealizedPnl || '0');
//             const currentPrice = allMids[coin];
//             const marginUsed = parseFloat(position.position.marginUsed || '0');
//             const leverage = parseFloat(position.position.leverage?.value || '1');
//             const positionValue = parseFloat(position.position.positionValue || '0');

//             // Get latest fill for entry price and time
//             const coinFills = fills.filter((fill: any) => fill.coin === coin);
//             const latestFill = coinFills.sort((a: any, b: any) => b.time - a.time)[0];

//             const entryPrice = latestFill ? latestFill.px : currentPrice - (unrealizedPnl / Math.abs(size));
//             const entryTime = latestFill ? latestFill.time : Date.now() - (30 * 60 * 1000);
//             const positionAgeMs = Date.now() - entryTime;
//             const positionAgeHours = positionAgeMs / (60 * 60 * 1000);

//             // Calculate ROE% exactly like Hyperliquid UI
//             // ROE% = (Unrealized PnL / Initial Margin) * 100
//             // Initial Margin = Position Value / Leverage
//             const initialMargin = Math.abs(positionValue) / leverage;
//             const roe = initialMargin > 0 ? (unrealizedPnl / initialMargin) * 100 : 0;

//             // Alternative calculation if positionValue not available
//             const alternativeInitialMargin = marginUsed; // Sometimes marginUsed = initial margin
//             const alternativeROE = alternativeInitialMargin > 0 ? (unrealizedPnl / alternativeInitialMargin) * 100 : 0;

//             return {
//                 coin,
//                 size,
//                 unrealizedPnl,
//                 currentPrice,
//                 entryPrice,
//                 entryTime,
//                 positionAgeMs,
//                 positionAgeHours,
//                 isLong: size > 0,
//                 leverage,
//                 marginUsed,
//                 positionValue,
//                 initialMargin,
//                 roe, // Primary ROE calculation
//                 alternativeROE, // Backup ROE calculation
//                 isOlderThanOneHour: positionAgeMs > ONE_HOUR_MS
//             };
//         });

//         // Log each position's ROE details like Hyperliquid UI
//         enrichedPositions.forEach(pos => {
//             console.log(`📊 POSITION: ${pos.coin}`);
//             console.log(`   Size: ${pos.size} | Entry: ${pos.entryPrice}`);
//             console.log(`   Current: ${pos.currentPrice} | PnL: ${pos.unrealizedPnl.toFixed(2)}`);
//             console.log(`   Position Value: ${pos.positionValue.toFixed(2)} | Leverage: ${pos.leverage}x`);
//             console.log(`   Initial Margin: ${pos.initialMargin.toFixed(2)} | Margin Used: ${pos.marginUsed.toFixed(2)}`);
//             console.log(`   ROE: ${pos.roe.toFixed(2)}% | Alt ROE: ${pos.alternativeROE.toFixed(2)}%`);
//             console.log(`   Age: ${pos.positionAgeHours.toFixed(1)}h | 1h+: ${pos.isOlderThanOneHour}`);
//             console.log(`   ─────────────────────────────────`);
//         });

//         console.log(`📊 Found ${enrichedPositions.length} positions with exact ROE data`);
//         return enrichedPositions;

//     } catch (error) {
//         console.error('❌ Error getting positions with ROE:', error);
//         return [];
//     }
// }

// // ——— CHECK AND MANAGE 1+ HOUR OLD POSITIONS WITH DETAILED ROE ————————————————————————————————————————
// async function manageOldPositions() {
//     try {
//         console.log('⏰ Checking positions older than 1 hour with detailed ROE analysis...');

//         const positions = await getPositionsWithROE();
//         const oldPositions = positions.filter(pos => pos.isOlderThanOneHour);

//         if (oldPositions.length === 0) {
//             console.log('✅ No positions older than 1 hour');
//             return { actionsPerformed: 0, oldPositionsChecked: 0 };
//         }

//         let actionsPerformed = 0;

//         for (const pos of oldPositions) {
//             const { coin, size, unrealizedPnl, roe, alternativeROE, positionAgeHours, isLong, positionValue, leverage, initialMargin } = pos;

//             console.log(`\n🔍 OLD POSITION ANALYSIS: ${coin} (${positionAgeHours.toFixed(1)}h old)`);
//             console.log(`   📊 Position Details:`);
//             console.log(`      Size: ${size} | Direction: ${isLong ? 'LONG' : 'SHORT'}`);
//             console.log(`      Position Value: ${positionValue.toFixed(2)} | Leverage: ${leverage}x`);
//             console.log(`      Initial Margin: ${initialMargin.toFixed(2)}`);
//             console.log(`   💰 Performance:`);
//             console.log(`      Unrealized PnL: ${unrealizedPnl.toFixed(2)}`);
//             console.log(`      ROE: ${roe.toFixed(2)}% | Alt ROE: ${alternativeROE.toFixed(2)}%`);
//             console.log(`      Status: ${unrealizedPnl > 0 ? '✅ PROFITABLE' : '❌ LOSING'}`);

//             // Enhanced decision logic using both PnL and ROE
//             const isProfitable = unrealizedPnl > 0 && roe > 0;
//             const isSignificantLoss = unrealizedPnl < -20 || roe < -15; // Major loss threshold

//             if (isProfitable) {
//                 console.log(`   🎯 DECISION: SELL (Profitable position)`);
//                 console.log(`      Reason: PnL: ${unrealizedPnl.toFixed(2)}, ROE: ${roe.toFixed(2)}%`);
                
//                 const isBuy = size < 0; // If short, buy to close
//                 const closeResult = await guaranteedInstantClose(
//                     coin, 
//                     size, 
//                     isBuy, 
//                     `OLD_PROFIT_${positionAgeHours.toFixed(1)}h_ROE${roe.toFixed(1)}%_PnL${unrealizedPnl.toFixed(0)}`
//                 );

//                 if (closeResult.success) {
//                     console.log(`   ✅ Successfully closed profitable old position: ${coin}`);
//                     actionsPerformed++;
                    
//                     pushTrade({
//                         id: `close_old_${Date.now()}`,
//                         pnl: unrealizedPnl,
//                         side: `OLD_PROFIT_CLOSE_ROE${roe.toFixed(1)}%`,
//                         size: Math.abs(size),
//                         avgPrice: pos.currentPrice,
//                         leverage: pos.leverage,
//                         timestamp: Date.now()
//                     });
//                 } else {
//                     console.error(`   ❌ Failed to close old position: ${coin}`);
//                 }

//                 await new Promise(resolve => setTimeout(resolve, 1000));
                
//             } else if (isSignificantLoss) {
//                 console.log(`   ⚠️ DECISION: SIGNIFICANT LOSS DETECTED but HOLDING as per rules`);
//                 console.log(`      Reason: Large loss (PnL: ${unrealizedPnl.toFixed(2)}, ROE: ${roe.toFixed(2)}%)`);
//                 console.log(`      Action: HOLD (following 1-hour rule: hold losses, sell profits)`);
                
//             } else {
//                 console.log(`   🔒 DECISION: HOLD (Unprofitable position)`);
//                 console.log(`      Reason: PnL: ${unrealizedPnl.toFixed(2)}, ROE: ${roe.toFixed(2)}%`);
//                 console.log(`      Strategy: Wait for potential recovery`);
//             }
//         }

//         return { 
//             actionsPerformed, 
//             oldPositionsChecked: oldPositions.length,
//             totalPositions: positions.length,
//             positionsDetails: oldPositions.map(pos => ({
//                 coin: pos.coin,
//                 ageHours: pos.positionAgeHours.toFixed(1),
//                 pnl: pos.unrealizedPnl.toFixed(2),
//                 roe: pos.roe.toFixed(2),
//                 action: pos.unrealizedPnl > 0 && pos.roe > 0 ? 'SOLD' : 'HELD'
//             }))
//         };

//     } catch (error) {
//         console.error('❌ Error managing old positions:', error);
//         return { actionsPerformed: 0, oldPositionsChecked: 0, error };
//     }
// }

// // ——— GUARANTEED INSTANT CLOSE FUNCTION ————————————————————————————————————
// async function guaranteedInstantClose(coin: string, size: number, isBuy: boolean, reason: string = 'AUTO') {
//     console.log(`🎯 INSTANT CLOSE: ${coin} | Size: ${size} | Side: ${isBuy ? 'BUY' : 'SELL'} | Reason: ${reason}`);

//     try {
//         // Get aggressive pricing from order book
//         const l2Response = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'l2Book',
//                 coin: coin,
//                 nSigFigs: 5
//             })
//         });

//         const l2Book = await l2Response.json();
//         let aggressivePrice;

//         if (isBuy && l2Book?.levels?.[0]?.[0]) {
//             const bestAsk = parseFloat(l2Book.levels[0][0].px);
//             aggressivePrice = bestAsk * 1.02; // 2% above ask
//         } else if (!isBuy && l2Book?.levels?.[1]?.[0]) {
//             const bestBid = parseFloat(l2Book.levels[1][0].px);
//             aggressivePrice = bestBid * 0.98; // 2% below bid
//         } else {
//             // Fallback to mid-price
//             const midResponse = await fetch('https://api.hyperliquid.xyz/info', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ type: 'allMids' })
//             });
//             const allMids = await midResponse.json();
//             const midPrice = allMids[coin];
//             aggressivePrice = midPrice * (isBuy ? 1.03 : 0.97);
//         }

//         const closeOrderParams = {
//             coin: `${coin}-PERP`,
//             is_buy: isBuy,
//             sz: Math.abs(size),
//             limit_px: Math.round(aggressivePrice),
//             order_type: { limit: { tif: 'Ioc' as Tif } },
//             reduce_only: true
//         };

//         console.log('📤 INSTANT CLOSE (SDK):', closeOrderParams);
//         const result = await sdk.exchange.placeOrder(closeOrderParams);

//         return {
//             success: result.status === 'ok',
//             method: 'SDK_INSTANT_CLOSE',
//             result: result,
//             executionPrice: aggressivePrice
//         };

//     } catch (error) {
//         console.error(`❌ SDK close error for ${coin}:`, error);
//         return { success: false, method: 'FAILED', error };
//     }
// }

// // ——— GET AVAILABLE USDC ————————————————————————————————————————
// async function getAvailableUSDC() {
//     try {
//         console.log('🔍 Checking wallet:', USER_WALLET);

//         const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'clearinghouseState',
//                 user: USER_WALLET
//             })
//         });

//         const perpState = await perpResponse.json();
//         const perpBalance = parseFloat(perpState?.marginSummary?.accountValue || '0');

//         if (perpBalance > 0) {
//             return {
//                 totalUSDC: perpBalance,
//                 availableMargin: parseFloat(perpState.withdrawable || perpState.marginSummary.accountValue),
//                 source: 'perpetuals'
//             };
//         }

//         return { totalUSDC: 0, availableMargin: 0, noFunds: true };

//     } catch (err) {
//         console.error('❌ API Error:', err);
//         return { totalUSDC: 0, availableMargin: 0, error: err };
//     }
// }

// // ——— CALCULATE DYNAMIC POSITION SIZE ————————————————————————————————————————
// function calculateDynamicSize(
//     price: number,
//     availableUSDC: number,
//     confidence: number = 85
// ) {
//     const capitalPerTrade = availableUSDC * CAPITAL_USAGE_PERCENT;
    
//     // Dynamic leverage based on confidence
//     let leverage = MIN_LEVERAGE;
//     if (confidence >= 95) leverage = MAX_LEVERAGE;
//     else if (confidence >= 90) leverage = Math.round(MAX_LEVERAGE * 0.8);
//     else if (confidence >= 85) leverage = Math.round(MAX_LEVERAGE * 0.6);

//     const notionalValue = capitalPerTrade * leverage;
//     const positionSize = notionalValue / price;

//     return {
//         size: roundLot(positionSize),
//         leverage,
//         notionalValue,
//         capitalUsed: capitalPerTrade,
//         expectedProfit: (notionalValue * 2.0) / 100, // 2% expected move
//         maxRisk: Math.min(notionalValue * 0.025, MAX_LOSS_PER_TRADE)
//     };
// }

// // ——— PLACE ORDER WITH REVERSED SIGNAL ————————————————————————————————————————
// async function placeReversedOrder(originalSignal: string, size: number, price: number) {
//     try {
//         const reversedSignal = reverseSignal(originalSignal);
//         console.log(`🔄 SIGNAL REVERSAL: ${originalSignal} → ${reversedSignal}`);

//         const coin = 'BTC-PERP';
//         const isBuy = reversedSignal === 'LONG'; // Reversed logic

//         // Get current market price for aggressive entry
//         const currentMarketPrice = (await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ type: 'allMids' })
//         }).then(r => r.json()))['BTC'];

//         // 1% slippage for instant fills
//         const aggressiveEntryPrice = isBuy ?
//             Math.round(currentMarketPrice * 1.01) :
//             Math.round(currentMarketPrice * 0.99);

//         const orderParams = {
//             coin,
//             is_buy: isBuy,
//             sz: Number(size),
//             limit_px: aggressiveEntryPrice,
//             order_type: { limit: { tif: 'Ioc' as Tif } },
//             reduce_only: false
//         };

//         console.log('📤 REVERSED ORDER:', orderParams);
//         const result = await sdk.exchange.placeOrder(orderParams);

//         return {
//             success: result.status === 'ok',
//             result,
//             reversedSignal,
//             orderPrice: aggressiveEntryPrice,
//             marketPrice: currentMarketPrice
//         };

//     } catch (error) {
//         console.error('❌ Reversed order error:', error);
//         return { success: false, error };
//     }
// }

// // ——— MAIN HANDLER ————————————————————————————————————————————————
// export async function GET() {
//     try {
//         console.log('🚀 FIXED TRADING BOT with Signal Reversal & 1-Hour Logic:', new Date().toISOString());

//         // 🔍 STEP 1: Debug raw position data (optional)
//         if (process.env.DEBUG_POSITIONS === 'true') {
//             console.log('🔍 DEBUG MODE: Showing raw position data...');
//             await debugPositionData();
//         }

//         // ⏰ STEP 2: Manage old positions (1+ hours) based on ROE/PnL
//         console.log('⏰ Step 2: Managing positions older than 1 hour...');
//         const oldPositionResult = await manageOldPositions();

//         if (oldPositionResult.actionsPerformed > 0) {
//             console.log(`✅ Old Position Management: ${oldPositionResult.actionsPerformed} actions on ${oldPositionResult.oldPositionsChecked} old positions`);
//             await new Promise(resolve => setTimeout(resolve, 2000)); // Settlement wait
//         }

//         // 📊 STEP 3: Get trading signal
//         console.log('📊 Step 3: Fetching trading signal...');
//         const apiKey = process.env.NEXT_PUBLIC_API_KEY;
//         if (!apiKey) {
//             return NextResponse.json({ error: 'API_KEY missing' }, { status: 500 });
//         }

//         const forecastRes = await fetch('https://zynapse.zkagi.ai/today', {
//             method: 'GET',
//             cache: 'no-store',
//             headers: {
//                 accept: 'application/json',
//                 'api-key': apiKey
//             }
//         });

//         if (!forecastRes.ok) {
//             return NextResponse.json(
//                 { error: `Forecast API error (${forecastRes.status})` },
//                 { status: forecastRes.status }
//             );
//         }

//         const { forecast_today_hourly } = await forecastRes.json();
//         const slot = Array.isArray(forecast_today_hourly) && forecast_today_hourly.length > 0
//             ? forecast_today_hourly[forecast_today_hourly.length - 1]
//             : null;

//         if (!slot || slot.signal === 'HOLD' || !slot.forecast_price) {
//             return NextResponse.json({
//                 message: 'No trade signal',
//                 oldPositionManagement: {
//                     actionsPerformed: oldPositionResult.actionsPerformed,
//                     oldPositionsChecked: oldPositionResult.oldPositionsChecked,
//                     positionsDetails: oldPositionResult.positionsDetails
//                 }
//             });
//         }

//         // 🛑 STEP 4: Daily loss check
//         const dayState = getDayState();
//         if (dayState.realizedLoss >= DAILY_LOSS_LIMIT) {
//             return NextResponse.json({
//                 message: `Daily loss limit: ${dayState.realizedLoss}`,
//                 oldPositionManagement: {
//                     actionsPerformed: oldPositionResult.actionsPerformed,
//                     oldPositionsChecked: oldPositionResult.oldPositionsChecked,
//                     positionsDetails: oldPositionResult.positionsDetails
//                 }
//             });
//         }

//         // 💰 STEP 5: Position sizing
//         console.log('💰 Step 5: Position calculation...');
//         const balanceInfo = await getAvailableUSDC();

//         if (balanceInfo.noFunds || balanceInfo.availableMargin < 10) {
//             return NextResponse.json({
//                 error: 'Insufficient funds',
//                 balanceInfo,
//                 oldPositionManagement: {
//                     actionsPerformed: oldPositionResult.actionsPerformed,
//                     oldPositionsChecked: oldPositionResult.oldPositionsChecked,
//                     positionsDetails: oldPositionResult.positionsDetails
//                 }
//             });
//         }

//         const positionCalc = calculateDynamicSize(
//             slot.forecast_price,
//             balanceInfo.availableMargin,
//             slot.confidence_90?.[1] || 85
//         );

//         // 🎯 STEP 6: Place reversed signal order
//         console.log('🎯 Step 6: Placing REVERSED signal order...');
//         const orderResult = await placeReversedOrder(
//             slot.signal,
//             positionCalc.size,
//             slot.forecast_price
//         );

//         // 📊 STEP 7: Response
//         const payload = {
//             success: orderResult.success,
//             timestamp: new Date().toISOString(),
            
//             signalReversal: {
//                 originalSignal: slot.signal,
//                 reversedSignal: orderResult.reversedSignal,
//                 reason: 'Signal automatically reversed as requested'
//             },
            
//             oldPositionManagement: {
//                 actionsPerformed: oldPositionResult.actionsPerformed,
//                 oldPositionsChecked: oldPositionResult.oldPositionsChecked,
//                 totalPositions: oldPositionResult.totalPositions,
//                 positionsDetails: oldPositionResult.positionsDetails || []
//             },

//             forecastSlot: slot,
            
//             orderDetails: {
//                 coin: 'BTC',
//                 originalSignal: slot.signal,
//                 executedSignal: orderResult.reversedSignal,
//                 size: positionCalc.size,
//                 leverage: positionCalc.leverage,
//                 orderPrice: orderResult.orderPrice,
//                 marketPrice: orderResult.marketPrice
//             },

//             oneHourLogic: {
//                 description: "Positions older than 1 hour: if profitable (ROE > 0, PnL > 0) → SELL, if losing → HOLD",
//                 implemented: true,
//                 roeCalculation: "ROE% = (Unrealized PnL / Initial Margin) * 100",
//                 debugMode: "Set DEBUG_POSITIONS=true in env to see raw API data"
//             },

//             performance: {
//                 expectedProfit: `$${positionCalc.expectedProfit.toFixed(2)}`,
//                 maxRisk: `$${positionCalc.maxRisk.toFixed(2)}`,
//                 capitalUsed: `$${positionCalc.capitalUsed.toFixed(0)}`
//             },

//             sdkResponse: orderResult.result
//         };

//         console.log('🎯 FIXED BOT COMPLETE:', JSON.stringify(payload, null, 2));
//         return NextResponse.json(payload);

//     } catch (err: any) {
//         console.error('❌ Fixed bot error:', err);
//         return NextResponse.json({ error: err.message }, { status: 500 });
//     }
// }

import { NextResponse } from 'next/server';
import { Hyperliquid, Tif } from 'hyperliquid';
import { getDayState, pushTrade } from '@/lib/dayState';

export const runtime = 'nodejs';

// ——— SDK Configuration ————————————————————————————————————————————————
// Server-only: DO NOT use NEXT_PUBLIC_ prefix for private keys
// Note: SDK is initialized lazily in the handler to avoid build-time errors

let _sdk: Hyperliquid | null = null;
let MAIN_WALLET: string = '';
let USER_WALLET: string = '';

function getSDK(): Hyperliquid {
    if (_sdk) return _sdk;

    const PK = process.env.HL_PRIVATE_KEY;
    const mainWallet = process.env.NEXT_PUBLIC_HL_MAIN_WALLET;
    const userWallet = process.env.NEXT_PUBLIC_HL_USER_WALLET;

    if (!PK) throw new Error('HL_PRIVATE_KEY missing in env');
    if (!mainWallet) throw new Error('HL_MAIN_WALLET missing in env');
    if (!userWallet) throw new Error('USER_WALLET missing in env');

    _sdk = new Hyperliquid({
        privateKey: PK,
        walletAddress: mainWallet,
        testnet: false
    });
    MAIN_WALLET = mainWallet;
    USER_WALLET = userWallet;
    return _sdk;
}

// Helper getter for SDK that's used by helper functions
const sdk = { get exchange() { return getSDK().exchange; }, get info() { return getSDK().info; }, get custom() { return getSDK().custom; } };

function getHyperliquidSDK() {
    const sdkInstance = getSDK();
    return { sdk: sdkInstance, MAIN_WALLET, USER_WALLET };
}

// ——— SIMPLIFIED CONSTANTS WITH IMMEDIATE PROFIT TARGETS ————————————————————————————————————————————————
const LOT_SIZE = 0.00001;
const MIN_ORDER_SIZE = 0.0001;
const MAX_PROFIT_PER_TRADE = 100;        // 🎯 IMMEDIATE CLOSE at $100 profit
const QUICK_PROFIT_TARGET = 50;          // 🎯 IMMEDIATE CLOSE at $50 profit
const MAX_LOSS_PER_TRADE = 20;           // 🛑 IMMEDIATE CLOSE at $20 loss (stop loss)
const DAILY_LOSS_LIMIT = 100;
const CAPITAL_USAGE_PERCENT = 0.30;
const MAX_LEVERAGE = 25;
const MIN_LEVERAGE = 5;
const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// ——— SIMPLIFIED PNL TRACKER (NO MORE 1-MINUTE MONITORING) ————————————————————————————————————————
class SimplifiedPnLTracker {
    public updatePosition(coin: string, currentPnl: number): {
        shouldClose: boolean;
        reason: string;
        action: 'STOP_LOSS' | 'PROFIT_TAKE' | 'HOLD' | 'MAX_PROFIT';
    } {
        console.log(`📊 CHECKING: ${coin} PnL: ${currentPnl.toFixed(2)}`);

        // 🎯 RULE 1: MAXIMUM PROFIT TARGET - $100 (IMMEDIATE CLOSE)
        if (currentPnl >= MAX_PROFIT_PER_TRADE) {
            console.log(`🎯 MAX PROFIT REACHED: ${coin} at ${currentPnl.toFixed(2)} → IMMEDIATE CLOSE`);
            return {
                shouldClose: true,
                reason: `MAX_PROFIT_${currentPnl.toFixed(2)}`,
                action: 'MAX_PROFIT'
            };
        }

        // 🎯 RULE 2: QUICK PROFIT TARGET - $50 (IMMEDIATE CLOSE)
        if (currentPnl >= QUICK_PROFIT_TARGET) {
            console.log(`💰 QUICK PROFIT REACHED: ${coin} at ${currentPnl.toFixed(2)} → IMMEDIATE CLOSE`);
            return {
                shouldClose: true,
                reason: `QUICK_PROFIT_${currentPnl.toFixed(2)}`,
                action: 'PROFIT_TAKE'
            };
        }

        // 🛑 RULE 3: STOP LOSS - $20 (IMMEDIATE CLOSE)
        if (currentPnl <= -MAX_LOSS_PER_TRADE) {
            console.log(`🛑 STOP LOSS HIT: ${coin} at ${currentPnl.toFixed(2)} → IMMEDIATE CLOSE`);
            return {
                shouldClose: true,
                reason: `STOP_LOSS_${currentPnl.toFixed(2)}`,
                action: 'STOP_LOSS'
            };
        }

        // 📈 RULE 4: CONTINUE HOLDING
        console.log(`📈 HOLDING: ${coin} at ${currentPnl.toFixed(2)} (waiting for targets)`);
        return {
            shouldClose: false,
            reason: `HOLDING_${currentPnl.toFixed(2)}`,
            action: 'HOLD'
        };
    }

    public clearTracker(coin: string): void {
        // No tracking needed in simplified version
        console.log(`✅ Cleared tracker for ${coin}`);
    }
}

// Global simplified PnL tracker instance
const pnlTracker = new SimplifiedPnLTracker();

// ——— Helper Functions ————————————————————————————————————————————————
function roundLot(x: number) {
    const lots = Math.max(
        Math.floor(x / LOT_SIZE),
        Math.ceil(MIN_ORDER_SIZE / LOT_SIZE)
    );
    return lots * LOT_SIZE;
}

// ——— REVERSE SIGNAL FUNCTION ————————————————————————————————————————
function reverseSignal(originalSignal: string): string {
    if (originalSignal === 'LONG') return 'SHORT';
    if (originalSignal === 'SHORT') return 'LONG';
    return originalSignal; // Keep HOLD as is
}

// ——— DEBUG: SHOW RAW POSITION DATA ————————————————————————————————————————
async function debugPositionData() {
    try {
        console.log('🔍 DEBUG: Raw position data from Hyperliquid API...');

        const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'clearinghouseState',
                user: USER_WALLET
            })
        });

        const perpState = await perpResponse.json();
        
        console.log('📊 FULL API RESPONSE:');
        console.log(JSON.stringify(perpState, null, 2));

        if (perpState?.assetPositions) {
            console.log('\n📊 POSITION DETAILS:');
            perpState.assetPositions.forEach((pos: any, index: number) => {
                console.log(`\n--- Position ${index + 1} ---`);
                console.log('Raw position object:', JSON.stringify(pos, null, 2));
                
                if (pos.position) {
                    console.log('Available fields in position:');
                    Object.keys(pos.position).forEach(key => {
                        console.log(`  ${key}: ${pos.position[key]}`);
                    });
                }
            });
        }

        return perpState;
    } catch (error) {
        console.error('❌ Debug error:', error);
        return null;
    }
}

// ——— GET POSITIONS WITH EXACT HYPERLIQUID ROE/PNL ————————————————————————————————————————
async function getPositionsWithROE() {
    try {
        console.log('🔍 Getting positions with exact Hyperliquid ROE calculation...');

        // Get current positions
        const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'clearinghouseState',
                user: USER_WALLET
            })
        });

        const perpState = await perpResponse.json();
        const positions = perpState?.assetPositions || [];

        if (positions.length === 0) {
            console.log('✅ No open positions found');
            return [];
        }

        // Get fills for entry price/time data
        const fillsResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'userFills',
                user: USER_WALLET
            })
        });

        const fills = await fillsResponse.json();

        // Get current market prices
        const priceResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'allMids' })
        });
        const allMids = await priceResponse.json();

        const enrichedPositions = positions.map((position: any) => {
            const coin = position.position.coin;
            const size = parseFloat(position.position.szi);
            const unrealizedPnl = parseFloat(position.position.unrealizedPnl || '0');
            const currentPrice = allMids[coin];
            const marginUsed = parseFloat(position.position.marginUsed || '0');
            const leverage = parseFloat(position.position.leverage?.value || '1');
            const positionValue = parseFloat(position.position.positionValue || '0');

            // Get latest fill for entry price and time
            const coinFills = fills.filter((fill: any) => fill.coin === coin);
            const latestFill = coinFills.sort((a: any, b: any) => b.time - a.time)[0];

            const entryPrice = latestFill ? latestFill.px : currentPrice - (unrealizedPnl / Math.abs(size));
            const entryTime = latestFill ? latestFill.time : Date.now() - (30 * 60 * 1000);
            const positionAgeMs = Date.now() - entryTime;
            const positionAgeHours = positionAgeMs / (60 * 60 * 1000);

            // Calculate ROE% exactly like Hyperliquid UI
            // ROE% = (Unrealized PnL / Initial Margin) * 100
            // Initial Margin = Position Value / Leverage
            const initialMargin = Math.abs(positionValue) / leverage;
            const roe = initialMargin > 0 ? (unrealizedPnl / initialMargin) * 100 : 0;

            // Alternative calculation if positionValue not available
            const alternativeInitialMargin = marginUsed; // Sometimes marginUsed = initial margin
            const alternativeROE = alternativeInitialMargin > 0 ? (unrealizedPnl / alternativeInitialMargin) * 100 : 0;

            return {
                coin,
                size,
                unrealizedPnl,
                currentPrice,
                entryPrice,
                entryTime,
                positionAgeMs,
                positionAgeHours,
                isLong: size > 0,
                leverage,
                marginUsed,
                positionValue,
                initialMargin,
                roe, // Primary ROE calculation
                alternativeROE, // Backup ROE calculation
                isOlderThanOneHour: positionAgeMs > ONE_HOUR_MS
            };
        });

        // Log each position's ROE details like Hyperliquid UI
        enrichedPositions.forEach((pos: { coin: any; size: any; entryPrice: any; currentPrice: any; unrealizedPnl: number; positionValue: number; leverage: any; initialMargin: number; marginUsed: number; roe: number; alternativeROE: number; positionAgeHours: number; isOlderThanOneHour: any; }) => {
            console.log(`📊 POSITION: ${pos.coin}`);
            console.log(`   Size: ${pos.size} | Entry: ${pos.entryPrice}`);
            console.log(`   Current: ${pos.currentPrice} | PnL: ${pos.unrealizedPnl.toFixed(2)}`);
            console.log(`   Position Value: ${pos.positionValue.toFixed(2)} | Leverage: ${pos.leverage}x`);
            console.log(`   Initial Margin: ${pos.initialMargin.toFixed(2)} | Margin Used: ${pos.marginUsed.toFixed(2)}`);
            console.log(`   ROE: ${pos.roe.toFixed(2)}% | Alt ROE: ${pos.alternativeROE.toFixed(2)}%`);
            console.log(`   Age: ${pos.positionAgeHours.toFixed(1)}h | 1h+: ${pos.isOlderThanOneHour}`);
            console.log(`   ─────────────────────────────────`);
        });

        console.log(`📊 Found ${enrichedPositions.length} positions with exact ROE data`);
        return enrichedPositions;

    } catch (error) {
        console.error('❌ Error getting positions with ROE:', error);
        return [];
    }
}

// ——— SIMPLIFIED POSITION MONITORING WITH IMMEDIATE PROFIT TARGETS ————————————————————————————————————————
async function monitorAllPositionsPnL() {
    try {
        console.log('💰 CORRECT AGE-BASED MONITORING: Stop loss only for new positions...');

        const positions = await getPositionsWithROE();
        
        if (positions.length === 0) {
            console.log('✅ No positions to monitor');
            return { actionsPerformed: 0, monitoringResults: [] };
        }

        let actionsPerformed = 0;
        const monitoringResults = [];

        for (const pos of positions) {
            const { coin, size, unrealizedPnl, roe, positionAgeHours, isLong, isOlderThanOneHour } = pos;

            console.log(`\n📊 MONITORING: ${coin}`);
            console.log(`   PnL: ${unrealizedPnl.toFixed(2)} | ROE: ${roe.toFixed(2)}% | Age: ${positionAgeHours.toFixed(1)}h`);

            let result = {
                coin,
                pnl: unrealizedPnl.toFixed(2),
                roe: roe.toFixed(2),
                age: positionAgeHours.toFixed(1),
                action: 'HOLD',
                reason: '',
                closed: false
            };

            // 🎯 PRIORITY RULE 1: MAX PROFIT TARGET - $100 (applies to ALL positions regardless of age)
            if (unrealizedPnl >= MAX_PROFIT_PER_TRADE) {
                console.log(`   🎯 MAX PROFIT RULE: ${unrealizedPnl.toFixed(2)} ≥ ${MAX_PROFIT_PER_TRADE} → IMMEDIATE CLOSE`);
                result.action = 'MAX_PROFIT';
                result.reason = `MAX_PROFIT_${unrealizedPnl.toFixed(2)}`;
                
                const isBuy = size < 0;
                const closeResult = await guaranteedInstantClose(coin, size, isBuy, result.reason);

                if (closeResult.success) {
                    console.log(`   ✅ Successfully closed max profit position: ${coin}`);
                    actionsPerformed++;
                    result.closed = true;
                    pnlTracker.clearTracker(coin);
                    
                    pushTrade({
                        id: `max_profit_${Date.now()}`,
                        pnl: unrealizedPnl,
                        side: result.reason,
                        size: Math.abs(size),
                        avgPrice: pos.currentPrice,
                        leverage: pos.leverage,
                        timestamp: Date.now()
                    });
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
                monitoringResults.push(result);
                continue;
            }

            // 🎯 PRIORITY RULE 2: QUICK PROFIT TARGET - $50 (applies to ALL positions regardless of age)
            if (unrealizedPnl >= QUICK_PROFIT_TARGET) {
                console.log(`   💰 QUICK PROFIT RULE: ${unrealizedPnl.toFixed(2)} ≥ ${QUICK_PROFIT_TARGET} → IMMEDIATE CLOSE`);
                result.action = 'PROFIT_TAKE';
                result.reason = `QUICK_PROFIT_${unrealizedPnl.toFixed(2)}`;
                
                const isBuy = size < 0;
                const closeResult = await guaranteedInstantClose(coin, size, isBuy, result.reason);

                if (closeResult.success) {
                    console.log(`   ✅ Successfully closed quick profit position: ${coin}`);
                    actionsPerformed++;
                    result.closed = true;
                    pnlTracker.clearTracker(coin);
                    
                    pushTrade({
                        id: `quick_profit_${Date.now()}`,
                        pnl: unrealizedPnl,
                        side: result.reason,
                        size: Math.abs(size),
                        avgPrice: pos.currentPrice,
                        leverage: pos.leverage,
                        timestamp: Date.now()
                    });
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
                monitoringResults.push(result);
                continue;
            }

            // ——— AGE-BASED RULES WITH CORRECT STOP LOSS LOGIC ———————————————————————————————————————
            if (isOlderThanOneHour) {
                // ——— OLD POSITIONS (>1 HOUR): NO STOP LOSS, LET RECOVER ———————————————————————————————————————
                if (unrealizedPnl < 0) {
                    console.log(`   🔒 OLD POSITION RULE: ${positionAgeHours.toFixed(1)}h old + NEGATIVE PnL → HOLD (no stop loss, let recover)`);
                    result.action = 'HOLD';
                    result.reason = `OLD_NEGATIVE_HOLD_${unrealizedPnl.toFixed(2)}`;
                } else {
                    console.log(`   💰 OLD POSITION RULE: ${positionAgeHours.toFixed(1)}h old + POSITIVE PnL → CLOSE (take any profit)`);
                    result.action = 'PROFIT_TAKE';
                    result.reason = `OLD_POSITIVE_CLOSE_${unrealizedPnl.toFixed(2)}`;
                    
                    const isBuy = size < 0;
                    const closeResult = await guaranteedInstantClose(coin, size, isBuy, result.reason);

                    if (closeResult.success) {
                        console.log(`   ✅ Successfully closed old profitable position: ${coin}`);
                        actionsPerformed++;
                        result.closed = true;
                        pnlTracker.clearTracker(coin);
                        
                        pushTrade({
                            id: `old_profit_${Date.now()}`,
                            pnl: unrealizedPnl,
                            side: result.reason,
                            size: Math.abs(size),
                            avgPrice: pos.currentPrice,
                            leverage: pos.leverage,
                            timestamp: Date.now()
                        });
                    }

                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } else {
                // ——— NEW POSITIONS (<1 HOUR): APPLY STOP LOSS AT -$20 ———————————————————————————————————————
                console.log(`   ⏱️ NEW POSITION: ${positionAgeHours.toFixed(1)}h old → Apply stop loss rule`);
                
                // 🛑 STOP LOSS FOR NEW POSITIONS ONLY
                if (unrealizedPnl <= -MAX_LOSS_PER_TRADE) {
                    console.log(`   🛑 NEW POSITION STOP LOSS: ${coin} at ${unrealizedPnl.toFixed(2)} → IMMEDIATE CLOSE`);
                    result.action = 'STOP_LOSS';
                    result.reason = `NEW_STOP_LOSS_${unrealizedPnl.toFixed(2)}`;
                    
                    const isBuy = size < 0;
                    const closeResult = await guaranteedInstantClose(coin, size, isBuy, result.reason);

                    if (closeResult.success) {
                        console.log(`   ✅ Successfully executed stop loss on new position: ${coin}`);
                        actionsPerformed++;
                        result.closed = true;
                        pnlTracker.clearTracker(coin);
                        
                        pushTrade({
                            id: `new_stop_${Date.now()}`,
                            pnl: unrealizedPnl,
                            side: result.reason,
                            size: Math.abs(size),
                            avgPrice: pos.currentPrice,
                            leverage: pos.leverage,
                            timestamp: Date.now()
                        });
                    } else {
                        console.error(`   ❌ Failed to execute stop loss: ${coin}`);
                        result.reason += '_FAILED';
                    }

                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    // NEW POSITION WITHIN ACCEPTABLE LOSS RANGE
                    console.log(`   📈 NEW POSITION OK: ${unrealizedPnl.toFixed(2)} > -${MAX_LOSS_PER_TRADE} → Continue monitoring`);
                    result.action = 'MONITOR';
                    result.reason = `NEW_MONITORING_${unrealizedPnl.toFixed(2)}`;
                }
            }

            monitoringResults.push(result);
        }

        console.log(`\n💰 CORRECT AGE-BASED MONITORING COMPLETE: ${actionsPerformed} actions on ${positions.length} positions`);
        return { actionsPerformed, monitoringResults };

    } catch (error) {
        console.error('❌ Error in age-based monitoring:', error);
        return { actionsPerformed: 0, monitoringResults: [], error };
    }
}

// ——— GUARANTEED INSTANT CLOSE FUNCTION ————————————————————————————————————
async function guaranteedInstantClose(coin: string, size: number, isBuy: boolean, reason: string = 'AUTO') {
    console.log(`🎯 INSTANT CLOSE: ${coin} | Size: ${size} | Side: ${isBuy ? 'BUY' : 'SELL'} | Reason: ${reason}`);

    try {
        // Get aggressive pricing from order book
        const l2Response = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'l2Book',
                coin: coin,
                nSigFigs: 5
            })
        });

        const l2Book = await l2Response.json();
        let aggressivePrice;

        if (isBuy && l2Book?.levels?.[0]?.[0]) {
            const bestAsk = parseFloat(l2Book.levels[0][0].px);
            aggressivePrice = bestAsk * 1.02; // 2% above ask
        } else if (!isBuy && l2Book?.levels?.[1]?.[0]) {
            const bestBid = parseFloat(l2Book.levels[1][0].px);
            aggressivePrice = bestBid * 0.98; // 2% below bid
        } else {
            // Fallback to mid-price
            const midResponse = await fetch('https://api.hyperliquid.xyz/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'allMids' })
            });
            const allMids = await midResponse.json();
            const midPrice = allMids[coin];
            aggressivePrice = midPrice * (isBuy ? 1.03 : 0.97);
        }

        const closeOrderParams = {
            coin: `${coin}-PERP`,
            is_buy: isBuy,
            sz: Math.abs(size),
            limit_px: Math.round(aggressivePrice),
            order_type: { limit: { tif: 'Ioc' as Tif } },
            reduce_only: true
        };

        console.log('📤 INSTANT CLOSE (SDK):', closeOrderParams);
        const result = await sdk.exchange.placeOrder(closeOrderParams);

        return {
            success: result.status === 'ok',
            method: 'SDK_INSTANT_CLOSE',
            result: result,
            executionPrice: aggressivePrice
        };

    } catch (error) {
        console.error(`❌ SDK close error for ${coin}:`, error);
        return { success: false, method: 'FAILED', error };
    }
}

// ——— GET AVAILABLE USDC ————————————————————————————————————————
async function getAvailableUSDC() {
    try {
        console.log('🔍 Checking wallet:', USER_WALLET);

        const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'clearinghouseState',
                user: USER_WALLET
            })
        });

        const perpState = await perpResponse.json();
        const perpBalance = parseFloat(perpState?.marginSummary?.accountValue || '0');

        if (perpBalance > 0) {
            return {
                totalUSDC: perpBalance,
                availableMargin: parseFloat(perpState.withdrawable || perpState.marginSummary.accountValue),
                source: 'perpetuals'
            };
        }

        return { totalUSDC: 0, availableMargin: 0, noFunds: true };

    } catch (err) {
        console.error('❌ API Error:', err);
        return { totalUSDC: 0, availableMargin: 0, error: err };
    }
}

// ——— CALCULATE DYNAMIC POSITION SIZE ————————————————————————————————————————
function calculateDynamicSize(
    price: number,
    availableUSDC: number,
    confidence: number = 85
) {
    const capitalPerTrade = availableUSDC * CAPITAL_USAGE_PERCENT;
    
    // Dynamic leverage based on confidence
    let leverage = MIN_LEVERAGE;
    if (confidence >= 95) leverage = MAX_LEVERAGE;
    else if (confidence >= 90) leverage = Math.round(MAX_LEVERAGE * 0.8);
    else if (confidence >= 85) leverage = Math.round(MAX_LEVERAGE * 0.6);

    const notionalValue = capitalPerTrade * leverage;
    const positionSize = notionalValue / price;

    return {
        size: roundLot(positionSize),
        leverage,
        notionalValue,
        capitalUsed: capitalPerTrade,
        expectedProfit: (notionalValue * 2.0) / 100, // 2% expected move
        maxRisk: Math.min(notionalValue * 0.025, MAX_LOSS_PER_TRADE)
    };
}

// ——— PLACE ORDER WITH REVERSED SIGNAL ————————————————————————————————————————
async function placeReversedOrder(originalSignal: string, size: number, price: number) {
    try {
        const reversedSignal = reverseSignal(originalSignal);
        console.log(`🔄 SIGNAL REVERSAL: ${originalSignal} → ${reversedSignal}`);

        const coin = 'BTC-PERP';
        const isBuy = reversedSignal === 'LONG'; // Reversed logic

        // Get current market price for aggressive entry
        const currentMarketPrice = (await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'allMids' })
        }).then(r => r.json()))['BTC'];

        // 1% slippage for instant fills
        const aggressiveEntryPrice = isBuy ?
            Math.round(currentMarketPrice * 1.01) :
            Math.round(currentMarketPrice * 0.99);

        const orderParams = {
            coin,
            is_buy: isBuy,
            sz: Number(size),
            limit_px: aggressiveEntryPrice,
            order_type: { limit: { tif: 'Ioc' as Tif } },
            reduce_only: false
        };

        console.log('📤 REVERSED ORDER:', orderParams);
        const result = await sdk.exchange.placeOrder(orderParams);

        return {
            success: result.status === 'ok',
            result,
            reversedSignal,
            orderPrice: aggressiveEntryPrice,
            marketPrice: currentMarketPrice
        };

    } catch (error) {
        console.error('❌ Reversed order error:', error);
        return { success: false, error };
    }
}

// ——— MAIN HANDLER ————————————————————————————————————————————————
export async function GET() {
    try {
        // Initialize SDK lazily
        const { sdk, MAIN_WALLET, USER_WALLET } = getHyperliquidSDK();

        console.log('🚀 SIMPLIFIED TRADING BOT with Immediate Profit Targets:', new Date().toISOString());

        // 🔍 STEP 1: Simplified position management
        console.log('💰 Step 1: Simplified position management with immediate targets...');
        const pnlMonitoringResult = await monitorAllPositionsPnL();

        if (pnlMonitoringResult.actionsPerformed > 0) {
            console.log(`✅ Position Management: ${pnlMonitoringResult.actionsPerformed} actions performed`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Settlement wait
        }

        // 🔍 STEP 2: Debug raw position data (optional)
        if (process.env.DEBUG_POSITIONS === 'true') {
            console.log('🔍 DEBUG MODE: Showing raw position data...');
            await debugPositionData();
        }

        // 📊 STEP 3: Get trading signal
        console.log('📊 Step 3: Fetching trading signal...');
        const apiKey = process.env.NEXT_PUBLIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API_KEY missing' }, { status: 500 });
        }

        const forecastRes = await fetch('https://zynapse.zkagi.ai/today', {
            method: 'GET',
            cache: 'no-store',
            headers: {
                accept: 'application/json',
                'api-key': apiKey
            }
        });

        if (!forecastRes.ok) {
            return NextResponse.json(
                { error: `Forecast API error (${forecastRes.status})` },
                { status: forecastRes.status }
            );
        }

        const { forecast_today_hourly } = await forecastRes.json();
        const slot = Array.isArray(forecast_today_hourly) && forecast_today_hourly.length > 0
            ? forecast_today_hourly[forecast_today_hourly.length - 1]
            : null;

        if (!slot || slot.signal === 'HOLD' || !slot.forecast_price) {
            return NextResponse.json({
                message: 'No trade signal',
                simplifiedManagement: {
                    actionsPerformed: pnlMonitoringResult.actionsPerformed,
                    monitoringResults: pnlMonitoringResult.monitoringResults
                }
            });
        }

        // 🛑 STEP 4: Daily loss check
        const dayState = getDayState();
        if (dayState.realizedLoss >= DAILY_LOSS_LIMIT) {
            return NextResponse.json({
                message: `Daily loss limit: ${dayState.realizedLoss}`,
                simplifiedManagement: {
                    actionsPerformed: pnlMonitoringResult.actionsPerformed,
                    monitoringResults: pnlMonitoringResult.monitoringResults
                }
            });
        }

        // 💰 STEP 5: Position sizing
        console.log('💰 Step 5: Position calculation...');
        const balanceInfo = await getAvailableUSDC();

        if (balanceInfo.noFunds || balanceInfo.availableMargin < 10) {
            return NextResponse.json({
                error: 'Insufficient funds',
                balanceInfo,
                simplifiedManagement: {
                    actionsPerformed: pnlMonitoringResult.actionsPerformed,
                    monitoringResults: pnlMonitoringResult.monitoringResults
                }
            });
        }

        const positionCalc = calculateDynamicSize(
            slot.forecast_price,
            balanceInfo.availableMargin,
            slot.confidence_90?.[1] || 85
        );

        // 🎯 STEP 6: Place reversed signal order
        console.log('🎯 Step 6: Placing REVERSED signal order...');
        const orderResult = await placeReversedOrder(
            slot.signal,
            positionCalc.size,
            slot.forecast_price
        );

        // 📊 STEP 7: Response
        const payload = {
            success: orderResult.success,
            timestamp: new Date().toISOString(),
            
            signalReversal: {
                originalSignal: slot.signal,
                reversedSignal: orderResult.reversedSignal,
                reason: 'Signal automatically reversed as requested'
            },

            simplifiedManagement: {
                actionsPerformed: pnlMonitoringResult.actionsPerformed,
                monitoringResults: pnlMonitoringResult.monitoringResults,
                rules: {
                    system: "Simplified immediate profit targets",
                    maxProfit: `$${MAX_PROFIT_PER_TRADE} → IMMEDIATE CLOSE`,
                    quickProfit: `$${QUICK_PROFIT_TARGET} → IMMEDIATE CLOSE`,
                    stopLoss: `$${MAX_LOSS_PER_TRADE} → IMMEDIATE CLOSE`,
                    oldPositions: "Positions 1h+ old: Negative PnL → HOLD, Positive PnL → CLOSE",
                    implementation: 'No complex timing logic - all rules are immediate'
                }
            },

            forecastSlot: slot,
            
            orderDetails: {
                coin: 'BTC-PERP',
                originalSignal: slot.signal,
                executedSignal: orderResult.reversedSignal,
                size: positionCalc.size,
                leverage: positionCalc.leverage,
                orderPrice: orderResult.orderPrice,
                marketPrice: orderResult.marketPrice
            },

            riskManagement: {
                immediateRules: {
                    maxProfit: `🎯 $${MAX_PROFIT_PER_TRADE} profit → IMMEDIATE CLOSE`,
                    quickProfit: `💰 $${QUICK_PROFIT_TARGET} profit → IMMEDIATE CLOSE`,
                    stopLoss: `🛑 $${MAX_LOSS_PER_TRADE} loss → IMMEDIATE CLOSE`
                },
                ageBasedRules: {
                    oldPositions: "🕰️ Positions 1h+ old: Negative PnL → HOLD, Positive PnL → CLOSE",
                    newPositions: "⚡ Positions < 1h old: Wait for immediate profit targets"
                },
                implementation: "Simplified system - NO complex timing logic",
                benefits: "More reliable, easier to manage, no continuous monitoring needed"
            },

            performance: {
                expectedProfit: `$${positionCalc.expectedProfit.toFixed(2)}`,
                maxRisk: `$${positionCalc.maxRisk.toFixed(2)}`,
                capitalUsed: `$${positionCalc.capitalUsed.toFixed(0)}`
            },

            sdkResponse: orderResult.result
        };

        console.log('🎯 SIMPLIFIED BOT COMPLETE:', JSON.stringify(payload, null, 2));
        return NextResponse.json(payload);

    } catch (err: any) {
        console.error('❌ Simplified bot error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ——— POST ENDPOINT FOR MANUAL MONITORING ————————————————————————————————————————
export async function POST() {
    try {
        console.log('🔄 MANUAL SIMPLIFIED MONITORING TRIGGER:', new Date().toISOString());

        // Run simplified position management
        const simplifiedResult = await monitorAllPositionsPnL();

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            message: 'Manual simplified monitoring completed',
            
            simplifiedManagement: {
                actionsPerformed: simplifiedResult.actionsPerformed,
                totalPositionsChecked: simplifiedResult.monitoringResults.length,
                results: simplifiedResult.monitoringResults,
                rules: {
                    system: "Simplified immediate profit targets",
                    maxProfit: `$${MAX_PROFIT_PER_TRADE} → IMMEDIATE CLOSE`,
                    quickProfit: `$${QUICK_PROFIT_TARGET} → IMMEDIATE CLOSE`,
                    stopLoss: `$${MAX_LOSS_PER_TRADE} → IMMEDIATE CLOSE`,
                    oldPositions: "Positions 1h+ old: Negative PnL → HOLD, Positive PnL → CLOSE",
                    implementation: 'No complex timing logic - all rules are immediate'
                }
            },

            summary: {
                totalActions: simplifiedResult.actionsPerformed,
                systemStatus: "Simplified immediate profit targeting active",
                benefits: "No continuous monitoring needed - all rules are immediate"
            }
        });

    } catch (err: any) {
        console.error('❌ Manual simplified monitoring error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}