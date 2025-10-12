// // app/api/agents/route.ts
// import { NextRequest, NextResponse } from "next/server";

// const AGENTS_BASE = "http://45.251.34.28:8002";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const walletAddress = searchParams.get("walletAddress");

//     if (!walletAddress) {
//       return NextResponse.json(
//         { error: "walletAddress is required" },
//         { status: 400 }
//       );
//     }

//     console.log('Fetching agents for wallet:', walletAddress);

//     const response = await fetch(`${AGENTS_BASE}/wallets/${walletAddress}/names`, {
//       method: "GET",
//       headers: {
//         "accept": "application/json",
//       },
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('Failed to fetch agents:', errorText);
//       return NextResponse.json(
//         { error: `Failed to fetch agents: ${errorText}` },
//         { status: response.status }
//       );
//     }

//     const data = await response.json();
//     console.log('Agents fetched successfully:', data);

//     return NextResponse.json(data);

//   } catch (error: any) {
//     console.error("❌ Agents API error:", error);
//     return NextResponse.json(
//       { error: error?.message || "Failed to fetch agents" },
//       { status: 500 }
//     );
//   }
// }

// app/api/agents/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // do not prerender
export const revalidate = 0;            // never revalidate cached data

const AGENTS_BASE = "http://45.251.34.28:8002";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
    }

    // Build upstream URL
    const upstream = new URL(`/wallets/${walletAddress}/names`, AGENTS_BASE);

    // Disable fetch cache
    const response = await fetch(upstream.toString(), {
      method: "GET",
      headers: { accept: "application/json", "cache-control": "no-cache" },
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch agents:", errorText);
      return NextResponse.json({ error: `Failed to fetch agents: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();

    // Also disable caching on this API response
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        pragma: "no-cache",
        expires: "0",
        "surrogate-control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("❌ Agents API error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch agents" }, { status: 500 });
  }
}
