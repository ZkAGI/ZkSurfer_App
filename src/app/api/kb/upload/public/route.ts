import { NextResponse } from "next/server";
const KB_BASE = process.env.KB_API_BASE ?? "http://45.251.34.28:8009";

export async function POST(req: Request) {
  try {
    const incoming = await req.formData();

    const user_id = incoming.get("user_id");
    const kb_id   = incoming.get("kb_id");
    if (!user_id || !kb_id) {
      return NextResponse.json(
        { error: "user_id and kb_id are required" },
        { status: 400 }
      );
    }

    const out = new FormData();
    out.append("user_id", String(user_id));
    out.append("kb_id", String(kb_id));

    for (const f of incoming.getAll("files")) {
      if (f instanceof File) out.append("files", f, f.name);
    }
    for (const u of incoming.getAll("urls")) {
      if (typeof u === "string") out.append("urls", u);
    }

    const res = await fetch(`${KB_BASE}/kb/upload/public`, { method: "POST", body: out });
    const text = await res.text();
    let json: any;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }
    return NextResponse.json(json, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "proxy error" }, { status: 500 });
  }
}
