// // /api/hl/pnl/route.ts
// import { NextResponse } from 'next/server';
// import { Hyperliquid } from 'hyperliquid';
// import { getDayState } from '@/lib/dayState';

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

// export async function GET() {
//   try {
//     // Fix: Ensure MAIN_WALLET is not undefined
//     if (!MAIN_WALLET) {
//       throw new Error('MAIN_WALLET environment variable is not set');
//     }

//     console.log('🔍 Fetching PnL data for wallet:', MAIN_WALLET);

//     const state = await sdk.info.perpetuals.getClearinghouseState(MAIN_WALLET);

//     // 🚨 DEBUG: Log the actual structure to see what properties exist
//     console.log('📊 Full clearinghouse state:', JSON.stringify(state, null, 2));
//     console.log('📋 marginSummary properties:', Object.keys(state.marginSummary || {}));

//     const marginSummary = state.marginSummary;

//     // ✅ Use ONLY the properties that actually exist (based on the TypeScript error message)
//     const equity = Number(marginSummary?.accountValue || 0);
//     const availableMargin = Number(marginSummary?.totalRawUsd || 0);
//     const marginUsed = Number(marginSummary?.totalMarginUsed || 0);
//     const totalNotional = Number(marginSummary?.totalNtlPos || 0);

//     // Fix: Use type assertion to access potentially non-existent properties
//     const marginSummaryAny = marginSummary as any;

//     // Get local day state for realized PnL
//     const dayState = getDayState();
//     const localRealizedPnl = dayState.realizedPnl || 0;

//     // Calculate unrealized PnL from positions if they exist
//     let calculatedUnrealized = 0;
//     if (state.assetPositions && Array.isArray(state.assetPositions)) {
//       console.log('📊 Found asset positions:', state.assetPositions.length);
//       calculatedUnrealized = state.assetPositions.reduce((sum: number, pos: any) => {
//         console.log('📊 Position:', pos);
//         const positionPnl = Number(pos.position?.unrealizedPnl || pos.unrealizedPnl || pos.pnl || 0);
//         return sum + positionPnl;
//       }, 0);
//     }

//     // Try to find PnL properties with type assertion (won't cause TypeScript errors)
//     const hyperliquidRealized = Number(
//       marginSummaryAny?.totalRealized ||
//       marginSummaryAny?.realizedPnl ||
//       marginSummaryAny?.realized ||
//       0
//     );

//     const hyperliquidUnrealized = Number(
//       marginSummaryAny?.totalUnrealized ||
//       marginSummaryAny?.unrealizedPnl ||
//       marginSummaryAny?.unrealized ||
//       calculatedUnrealized ||
//       0
//     );

//     // Use the best available data source
//     const realized = hyperliquidRealized !== 0 ? hyperliquidRealized : localRealizedPnl;
//     const unrealized = hyperliquidUnrealized;

//     const result = {
//       realized: realized,
//       unrealized: unrealized,
//       equity: equity,
//       // Additional useful info
//       availableMargin: availableMargin,
//       marginUsed: marginUsed,
//       totalNotional: totalNotional,
//       // Debug info
//       debug: {
//         marginSummaryKeys: Object.keys(marginSummary || {}),
//         hasPositions: !!state.assetPositions,
//         positionCount: state.assetPositions?.length || 0,
//         localRealizedPnl: localRealizedPnl,
//         hyperliquidRealized: hyperliquidRealized,
//         hyperliquidUnrealized: hyperliquidUnrealized,
//         calculatedUnrealized: calculatedUnrealized,
//         dataSource: {
//           realized: hyperliquidRealized !== 0 ? 'hyperliquid' : 'local',
//           unrealized: hyperliquidUnrealized !== 0 ? 'hyperliquid' : 'calculated'
//         }
//       }
//     };

//     console.log('📊 PnL result:', result);

//     return NextResponse.json(result);

//   } catch (e: any) {
//     console.error('❌ PnL endpoint error:', e);
//     console.error('❌ Error details:', e.message, e.stack);

//     // Fallback to local data
//     const dayState = getDayState();

//     return NextResponse.json({
//       realized: dayState.realizedPnl || 0,
//       unrealized: 0,
//       equity: 0,
//       availableMargin: 0,
//       marginUsed: 0,
//       totalNotional: 0,
//       debug: {
//         error: e.message,
//         fallbackToLocal: true,
//         localData: dayState
//       }
//     });
//   }
// }
// /api/hl/pnl/route.ts - DEBUG VERSION
import { NextResponse } from 'next/server';
import { Hyperliquid } from 'hyperliquid';
import { getDayState } from '@/lib/dayState';

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
    MAIN_WALLET,
    PK
  };
}

export async function GET() {
  try {
    // Get SDK lazily to avoid build-time errors
    const { sdk, MAIN_WALLET, PK } = getHyperliquidSDK();

    console.log('🔍 === DEBUGGING PnL API ===');
    console.log('🔑 Private Key (first 10 chars):', PK?.substring(0, 10) + '...');
    console.log('👛 Wallet Address:', MAIN_WALLET);
    console.log('🌐 Network: MAINNET (testnet: false)');

    const state = await sdk.info.perpetuals.getClearinghouseState(MAIN_WALLET);

    // 🚨 COMPREHENSIVE DEBUG
    console.log('📊 === RAW API RESPONSE ===');
    console.log('Full state:', JSON.stringify(state, null, 2));

    console.log('📋 === MARGIN SUMMARY ANALYSIS ===');
    const marginSummary = state.marginSummary;
    console.log('marginSummary exists:', !!marginSummary);
    console.log('marginSummary keys:', Object.keys(marginSummary || {}));

    // Check each value individually
    console.log('Raw accountValue:', marginSummary?.accountValue, typeof marginSummary?.accountValue);
    console.log('Raw totalRawUsd:', marginSummary?.totalRawUsd, typeof marginSummary?.totalRawUsd);
    console.log('Raw totalMarginUsed:', marginSummary?.totalMarginUsed, typeof marginSummary?.totalMarginUsed);
    console.log('Raw totalNtlPos:', marginSummary?.totalNtlPos, typeof marginSummary?.totalNtlPos);

    console.log('📊 === POSITIONS ANALYSIS ===');
    console.log('assetPositions exists:', !!state.assetPositions);
    console.log('assetPositions type:', typeof state.assetPositions);
    console.log('assetPositions length:', state.assetPositions?.length);
    console.log('assetPositions content:', JSON.stringify(state.assetPositions, null, 2));

    // Check if there are any other properties that might contain balance info
    console.log('📋 === ALL STATE PROPERTIES ===');
    console.log('State keys:', Object.keys(state));

    // Parse values with detailed logging
    const accountValueRaw = marginSummary?.accountValue;
    const totalRawUsdRaw = marginSummary?.totalRawUsd;

    console.log('🧮 === VALUE PARSING ===');
    console.log('accountValue raw:', accountValueRaw);
    console.log('accountValue Number():', Number(accountValueRaw));
    console.log('accountValue === "0":', accountValueRaw === "0");
    console.log('totalRawUsd raw:', totalRawUsdRaw);
    console.log('totalRawUsd Number():', Number(totalRawUsdRaw));

    const equity = Number(marginSummary?.accountValue || 0);
    const availableMargin = Number(marginSummary?.totalRawUsd || 0);
    const marginUsed = Number(marginSummary?.totalMarginUsed || 0);
    const totalNotional = Number(marginSummary?.totalNtlPos || 0);

    // Get local day state
    const dayState = getDayState();
    console.log('📊 === LOCAL DAY STATE ===');
    console.log('Local dayState:', JSON.stringify(dayState, null, 2));

    const result = {
      realized: dayState.realizedPnl || 0,
      unrealized: 0,
      equity: equity,
      availableMargin: availableMargin,
      marginUsed: marginUsed,
      totalNotional: totalNotional,

      // 🚨 EXTENSIVE DEBUG INFO
      debug: {
        // Environment
        env: {
          hasPrivateKey: !!PK,
          hasWallet: !!MAIN_WALLET,
          walletAddress: MAIN_WALLET,
          isTestnet: false
        },

        // Raw API data
        raw: {
          marginSummary: marginSummary,
          assetPositions: state.assetPositions,
          allStateKeys: Object.keys(state)
        },

        // Parsing results
        parsing: {
          accountValueRaw: accountValueRaw,
          accountValueParsed: Number(accountValueRaw),
          totalRawUsdRaw: totalRawUsdRaw,
          totalRawUsdParsed: Number(totalRawUsdRaw),
          allValuesAreZero: equity === 0 && availableMargin === 0 && marginUsed === 0
        },

        // Possible issues
        possibleIssues: [
          equity === 0 ? 'NO_FUNDS_OR_WRONG_WALLET' : null,
          !state.assetPositions || state.assetPositions.length === 0 ? 'NO_POSITIONS' : null,
          dayState.trades?.length === 0 ? 'NO_LOCAL_TRADES' : null
        ].filter(Boolean),

        // Local data
        local: {
          dayState: dayState,
          tradesCount: dayState.trades?.length || 0
        }
      }
    };

    console.log('📊 === FINAL RESULT ===');
    console.log('Result:', JSON.stringify(result, null, 2));

    return NextResponse.json(result);

  } catch (e: any) {
    console.error('❌ === PnL API ERROR ===');
    console.error('Error message:', e.message);
    console.error('Error stack:', e.stack);

    return NextResponse.json({
      realized: 0,
      unrealized: 0,
      equity: 0,
      error: e.message,
      debug: {
        errorOccurred: true,
        errorMessage: e.message,
        env: {
          hasPrivateKey: !!process.env.HL_PRIVATE_KEY,
          hasWallet: !!process.env.NEXT_PUBLIC_HL_MAIN_WALLET
        }
      }
    });
  }
}