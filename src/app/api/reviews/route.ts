// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime (not edge)

const BACKEND_URL = process.env.REVIEWS_API_URL!;
if (!BACKEND_URL) {
  throw new Error("REVIEWS_API_URL is not set. Add it to .env.local");
}

export async function POST(req: NextRequest) {
  try {
    // Parse incoming multipart/form-data from the browser
    const incoming = await req.formData();

    // Rebuild a fresh FormData to forward (files included)
    const forward = new FormData();
    for (const [key, value] of incoming.entries()) {
      // value can be string or File
      forward.append(key, value as any);
    }

    // Forward to your Python API
    const upstream = await fetch(BACKEND_URL, {
      method: "POST",
      body: forward, // Don't set Content-Type; fetch will set with proper boundary
      // headers: { Authorization: `Bearer ${token}` } // if you need to pass auth
    });

    const contentType = upstream.headers.get("content-type") || "";
    const bodyText = await upstream.text(); // safe for JSON or text

    return new NextResponse(bodyText, {
      status: upstream.status,
      headers: { "content-type": contentType },
    });
  } catch (err: any) {
    console.error("Proxy /api/reviews error:", err);
    return NextResponse.json(
      { error: "Failed to submit review", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
