import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { user_id, kb_name, is_public } = await req.json();
  const base = process.env.KB_API_BASE!;
  const url = `${base}/kb/create`;

  const body = new URLSearchParams();
  body.set("user_id", String(user_id));
  body.set("kb_name", String(kb_name));
  body.set("is_public", String(!!is_public));

  const r = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const text = await r.text();
  if (!r.ok) return new NextResponse(text, { status: r.status });
  return NextResponse.json(JSON.parse(text || "{}"));
}
