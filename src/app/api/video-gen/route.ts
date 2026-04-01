import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

// Streaming approach: maxDuration only applies to Time To First Byte.
// Once we start streaming (first heartbeat sent immediately), the function
// stays alive indefinitely — no 300s limit on total execution time.
// Heartbeats every 15s keep the connection alive through proxies.

// Protocol:
//   0x00 = heartbeat (ignore)
//   0x01 = success, remaining bytes = video/mp4
//   0x02 = error, remaining bytes = UTF-8 error message

export async function POST(request: NextRequest) {
  const externalEndpoint = process.env.NEXT_PUBLIC_VIDEO_GEN_ENDPOINT;
  if (!externalEndpoint) {
    return NextResponse.json(
      { error: "VIDEO_GEN_API endpoint is not defined" },
      { status: 500 }
    );
  }

  // Validate before starting the stream (proper HTTP status codes for errors)
  let apiKey: string;
  let prompt: string;

  try {
    const rawApiKey = request.headers.get("x-api-key");
    const currentCreditsHeader = request.headers.get("x-current-credits");
    const currentCredits = currentCreditsHeader
      ? parseInt(currentCreditsHeader, 10)
      : 0;

    if (!rawApiKey) {
      return NextResponse.json(
        { error: "API key is required. Please generate one using the /api command." },
        { status: 400 }
      );
    }
    apiKey = rawApiKey;

    if (!currentCreditsHeader || isNaN(currentCredits) || currentCredits <= 0) {
      return NextResponse.json(
        { error: "Insufficient credits. Please top up to use video generation." },
        { status: 402 }
      );
    }

    const jsonBody = await request.json();
    prompt = typeof jsonBody.prompt === "string" ? jsonBody.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
        { status: 400 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Bad request" },
      { status: 400 }
    );
  }

  const externalPayload = {
    prompt,
    fast_mode: "Fast",
    lora_scale: 1,
    num_frames: 49,
    aspect_ratio: "16:9",
    sample_shift: 4,
    sample_steps: 14,
    frames_per_second: 12,
    sample_guide_scale: 4.5,
  };

  // Return a streaming response — first byte is sent immediately
  const stream = new ReadableStream({
    async start(controller) {
      // Send first heartbeat immediately → satisfies Vercel TTFB requirement
      controller.enqueue(new Uint8Array([0x00]));

      // Keep-alive heartbeat every 15s (prevents proxy/CDN timeout)
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(new Uint8Array([0x00]));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15_000);

      try {
        console.log("[video-gen] Calling external API...");

        const externalResponse = await fetch(externalEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
            accept: "*/*",
          },
          body: JSON.stringify(externalPayload),
        });

        clearInterval(heartbeat);

        if (!externalResponse.ok) {
          let errorMessage = "Video generation failed";
          try {
            const rawText = await externalResponse.text();
            // Parse nested JSON error responses from external API
            try {
              let parsed = JSON.parse(rawText);
              // Handle nested {"detail": "{\"detail\": \"...\"}"}
              while (parsed.detail && typeof parsed.detail === "string") {
                try {
                  const inner = JSON.parse(parsed.detail);
                  parsed = inner;
                } catch {
                  errorMessage = parsed.detail;
                  break;
                }
              }
              if (parsed.error) errorMessage = parsed.error;
              else if (parsed.message) errorMessage = parsed.message;
              else if (typeof parsed.detail === "string") errorMessage = parsed.detail;
            } catch {
              if (rawText) errorMessage = rawText;
            }
          } catch {}
          console.error("[video-gen] External API error:", errorMessage);
          controller.enqueue(new Uint8Array([0x02]));
          controller.enqueue(new TextEncoder().encode(errorMessage));
          controller.close();
          return;
        }

        // Read response
        const contentType = externalResponse.headers.get("content-type") || "";
        let videoBytes: Uint8Array;

        if (
          contentType.includes("video/") ||
          contentType.includes("application/octet-stream") ||
          contentType.includes("binary/octet-stream")
        ) {
          // Direct video binary
          videoBytes = new Uint8Array(await externalResponse.arrayBuffer());
        } else {
          // Might be JSON with a video URL — read as buffer first
          const rawBuffer = await externalResponse.arrayBuffer();
          let jsonData: any = null;

          try {
            jsonData = JSON.parse(new TextDecoder().decode(rawBuffer));
          } catch {
            // Not JSON — treat as video binary
            videoBytes = new Uint8Array(rawBuffer);
          }

          if (jsonData) {
            // Look for video URL in common field names
            const videoUrl =
              jsonData.videoUrl ||
              jsonData.video_url ||
              jsonData.url ||
              jsonData.download_url ||
              (typeof jsonData.output === "string" ? jsonData.output : null) ||
              (Array.isArray(jsonData.output) ? jsonData.output[0] : null) ||
              jsonData.result;

            if (typeof videoUrl === "string" && videoUrl.startsWith("http")) {
              console.log("[video-gen] Downloading video from URL:", videoUrl);
              const dlResponse = await fetch(videoUrl);
              if (!dlResponse.ok) {
                throw new Error("Failed to download video from URL");
              }
              videoBytes = new Uint8Array(await dlResponse.arrayBuffer());
            } else {
              throw new Error(
                jsonData.error ||
                  jsonData.detail ||
                  jsonData.message ||
                  "Unexpected response from video API"
              );
            }
          }
        }

        console.log(`[video-gen] Success, video size: ${videoBytes!.byteLength} bytes`);

        // Send success marker + video bytes
        controller.enqueue(new Uint8Array([0x01]));

        // Stream video in chunks to avoid memory spikes
        const CHUNK_SIZE = 64 * 1024; // 64KB chunks
        for (let i = 0; i < videoBytes!.byteLength; i += CHUNK_SIZE) {
          controller.enqueue(videoBytes!.slice(i, i + CHUNK_SIZE));
        }

        controller.close();
      } catch (err: any) {
        clearInterval(heartbeat);
        const msg = err.message || "Video generation failed";
        console.error("[video-gen] Error:", msg);
        try {
          controller.enqueue(new Uint8Array([0x02]));
          controller.enqueue(new TextEncoder().encode(msg));
          controller.close();
        } catch {
          // Stream may already be closed
        }
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-cache, no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
