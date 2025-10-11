// app/api/agents/route.ts
import { NextRequest, NextResponse } from "next/server";

const AGENTS_BASE = "http://45.251.34.28:8002";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress is required" },
        { status: 400 }
      );
    }

    console.log('Fetching agents for wallet:', walletAddress);

    const response = await fetch(`${AGENTS_BASE}/wallets/${walletAddress}/names`, {
      method: "GET",
      headers: {
        "accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch agents:', errorText);
      return NextResponse.json(
        { error: `Failed to fetch agents: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Agents fetched successfully:', data);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("❌ Agents API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch agents" },
      { status: 500 }
    );
  }
}