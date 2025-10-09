import { NextRequest, NextResponse } from "next/server";

/** Proxies download_url and returns parsed JSON so the client never sees the raw host */
export async function GET(req: NextRequest) {
  const kb_id = req.nextUrl.searchParams.get("kb_id");
  const asset_id = req.nextUrl.searchParams.get("asset_id");
  if (!kb_id || !asset_id) return new NextResponse("kb_id and asset_id required", { status: 400 });

  const base = process.env.KB_API_BASE!;
  const genUrl = `${base}/kb/proofs/download/${encodeURIComponent(kb_id)}/${encodeURIComponent(asset_id)}`;

  const r = await fetch(genUrl, {
    headers: {
      accept: "application/json",
    },
  });

  const text = await r.text();
  if (!r.ok) return new NextResponse(text, { status: r.status });

  // The upstream returns JSON file bytes — parse safely
  try {
    const json = JSON.parse(text);
    return NextResponse.json(json);
  } catch {
    // If it wasn't JSON (shouldn't happen), return raw
    return new NextResponse(text, { status: 200, headers: { "Content-Type": "application/json" } });
  }
}
