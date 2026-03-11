// pages/api/hl/margin.ts
import { NextRequest, NextResponse } from 'next/server';
import { Hyperliquid } from 'hyperliquid';

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
      testnet: false,
    }),
    MAIN_WALLET
  };
}

export async function GET(_: NextRequest) {
  try {
    const { sdk, MAIN_WALLET } = getHyperliquidSDK();
    const state = await sdk.info.perpetuals.getClearinghouseState(MAIN_WALLET);
    const availableMargin = Number(state.marginSummary.accountValue);
    return NextResponse.json({ availableMargin });
  } catch (error: any) {
    console.error('Margin API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
