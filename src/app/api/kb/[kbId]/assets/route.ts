// app/api/kb/[kbId]/assets/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // don't cache
export const revalidate = 0;

const KB_BASE = process.env.KB_API_BASE || "http://45.251.34.28:8009"; 

export async function GET(
  _req: Request,
  ctx: { params: { kbId: string } }
) {
  const kbId = ctx.params?.kbId;
  if (!kbId) {
    return NextResponse.json(
      { error: "kbId is required" },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(`${KB_BASE}/kb/${encodeURIComponent(kbId)}/assets`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    // Bubble up upstream errors so you see them in the Network tab
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: `Upstream ${upstream.status}`, detail: text || null },
        { status: upstream.status }
      );
    }

    const data = await upstream.json(); // <-- DO NOT swallow this
    // FastAPI returns an array like:
    // [{ id, filename, visibility, file_hash, proof_path, raw_path }, ...]
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Proxy failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
