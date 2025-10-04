

// import { NextRequest, NextResponse } from "next/server";

// const BACKEND_URL = process.env.REVIEWS_API_URL; // e.g. http://127.0.0.1:8000/reviews

// export async function POST(req: NextRequest) {
//   try {
//     if (!BACKEND_URL) {
//       return new NextResponse("Missing REVIEWS_API_URL", { status: 500 });
//     }

//     // read incoming form
//     const inFd = await req.formData();

//     // rebuild outgoing form so we can massage fields
//     const outFd = new FormData();
//     for (const [k, v] of inFd.entries()) {
//       // we’ll rewrite voiceType below
//       if (k !== "voiceType") outFd.append(k, v as any);
//     }

//     const rawVoiceType = (inFd.get("voiceType") || "").toString();
//     if (rawVoiceType === "upload") {
//       // backend expects "custom" when a file is provided
//       outFd.append("voiceType", "custom");
//     } else {
//       outFd.append("voiceType", rawVoiceType); // "preset" or ''
//     }

//     // forward to backend
//     const res = await fetch(BACKEND_URL, { method: "POST", body: outFd });
//     const text = await res.text();

//     if (!res.ok) {
//       return new NextResponse(`Backend error (${res.status}): ${text || "Unknown"}`, { status: res.status });
//     }

//     try {
//       return NextResponse.json(JSON.parse(text));
//     } catch {
//       return new NextResponse(text, { status: 200 });
//     }
//   } catch (err: any) {
//     return new NextResponse(`Proxy failed: ${err?.message || String(err)}`, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.REVIEWS_API_URL; // e.g. http://127.0.0.1:8000/reviews

export async function POST(req: NextRequest) {
  try {
    if (!BACKEND_URL) {
      return new NextResponse("Missing REVIEWS_API_URL", { status: 500 });
    }

    // Just pass through the FormData as-is since buildReviewFormData already
    // handles the field naming correctly
    const formData = await req.formData();
    
    // Debug logging (remove in production)
    console.log("API Route - Forwarding to backend:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [File: ${value.name}]`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // Forward to backend
    const res = await fetch(BACKEND_URL, { 
      method: "POST", 
      body: formData 
    });
    
    const text = await res.text();

    if (!res.ok) {
      console.error("Backend error:", text);
      return new NextResponse(text, { 
        status: res.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return new NextResponse(text, { status: 200 });
    }
  } catch (err: any) {
    console.error("Proxy error:", err);
    return new NextResponse(`Proxy failed: ${err?.message || String(err)}`, { status: 500 });
  }
}