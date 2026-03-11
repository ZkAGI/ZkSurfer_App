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

export const dynamic = "force-dynamic";
export const revalidate = 0;

const AGENTS_BASE = process.env.AGENTS_API_BASE || "http://45.251.34.28:8002";
const FETCH_TIMEOUT_MS = 10000; // 10 second timeout

// Helper to fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
    }

    const upstream = new URL(`/wallets/${walletAddress}/names`, AGENTS_BASE);

    try {
      const response = await fetchWithTimeout(
        upstream.toString(),
        {
          method: "GET",
          headers: { accept: "application/json", "cache-control": "no-cache" },
          cache: "no-store",
        },
        FETCH_TIMEOUT_MS
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch agents:", errorText);
        // Return empty data instead of error for better UX
        return new NextResponse(JSON.stringify({ items: [], count: 0 }), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store, no-cache, must-revalidate",
          },
        });
      }

      const data = await response.json();

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
    } catch (fetchError: any) {
      // Handle timeout, connection reset, and network errors gracefully
      if (fetchError.name === "AbortError") {
        console.warn("⚠️ Agents API timeout - returning empty data");
      } else if (fetchError.cause?.code === "ECONNRESET" || fetchError.cause?.code === "ECONNREFUSED") {
        console.warn("⚠️ Agents API unavailable (connection issue) - returning empty data");
      } else {
        console.warn("⚠️ Agents API fetch error:", fetchError.message);
      }

      // Return empty data instead of 500 error for better UX
      return new NextResponse(JSON.stringify({ items: [], count: 0 }), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store, no-cache, must-revalidate",
        },
      });
    }
  } catch (error: any) {
    console.error("❌ Agents API error:", error);
    return NextResponse.json({ items: [], count: 0 }, { status: 200 });
  }
}
