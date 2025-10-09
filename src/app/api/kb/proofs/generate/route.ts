import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { kb_id, asset_id } = await req.json();
  const base = process.env.KB_API_BASE!;
  const url = `${base}/kb/proofs/generate`;

  const r = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ kb_id, asset_id }),
  });

  const text = await r.text();
  if (!r.ok) return new NextResponse(text, { status: r.status });
  return NextResponse.json(JSON.parse(text || "{}"));
}
