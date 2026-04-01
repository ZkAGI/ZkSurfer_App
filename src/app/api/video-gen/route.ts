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
        // Retry up to 3 times — GPU services can be flaky with timeouts
        const MAX_RETRIES = 3;
        let videoBytes: Uint8Array | undefined;
        let lastError = "Video generation failed";

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            console.log(`[video-gen] Attempt ${attempt}/${MAX_RETRIES} — calling external API...`);

            if (attempt > 1) {
              // Wait before retrying (5s, 10s)
              await new Promise((r) => setTimeout(r, attempt * 5000));
            }

            const externalResponse = await fetch(externalEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-API-Key": apiKey,
                accept: "*/*",
              },
              body: JSON.stringify(externalPayload),
            });

            if (!externalResponse.ok) {
              let errorMessage = "Video generation failed";
              try {
                const rawText = await externalResponse.text();
                try {
                  let parsed = JSON.parse(rawText);
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
                  else if (typeof parsed.detail === "string")
                    errorMessage = parsed.detail;
                } catch {
                  if (rawText) errorMessage = rawText;
                }
              } catch {}

              lastError = errorMessage;
              console.error(`[video-gen] Attempt ${attempt} error:`, errorMessage);

              // Retry on timeout errors
              if (
                errorMessage.toLowerCase().includes("timed out") &&
                attempt < MAX_RETRIES
              ) {
                continue;
              }
              throw new Error(errorMessage);
            }

            // Read response
            const contentType =
              externalResponse.headers.get("content-type") || "";

            if (
              contentType.includes("video/") ||
              contentType.includes("application/octet-stream") ||
              contentType.includes("binary/octet-stream")
            ) {
              videoBytes = new Uint8Array(
                await externalResponse.arrayBuffer()
              );
            } else {
              const rawBuffer = await externalResponse.arrayBuffer();
              let jsonData: any = null;

              try {
                jsonData = JSON.parse(
                  new TextDecoder().decode(rawBuffer)
                );
              } catch {
                videoBytes = new Uint8Array(rawBuffer);
              }

              if (jsonData) {
                const videoUrl =
                  jsonData.videoUrl ||
                  jsonData.video_url ||
                  jsonData.url ||
                  jsonData.download_url ||
                  (typeof jsonData.output === "string"
                    ? jsonData.output
                    : null) ||
                  (Array.isArray(jsonData.output)
                    ? jsonData.output[0]
                    : null) ||
                  jsonData.result;

                if (
                  typeof videoUrl === "string" &&
                  videoUrl.startsWith("http")
                ) {
                  console.log(
                    "[video-gen] Downloading video from URL:",
                    videoUrl
                  );
                  const dlResponse = await fetch(videoUrl);
                  if (!dlResponse.ok) {
                    throw new Error("Failed to download video from URL");
                  }
                  videoBytes = new Uint8Array(
                    await dlResponse.arrayBuffer()
                  );
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

            // If we got video bytes, break out of retry loop
            if (videoBytes && videoBytes.byteLength > 0) {
              console.log(
                `[video-gen] Success on attempt ${attempt}, video size: ${videoBytes.byteLength} bytes`
              );
              break;
            }
          } catch (retryErr: any) {
            lastError = retryErr.message || "Video generation failed";
            if (attempt === MAX_RETRIES) {
              throw retryErr;
            }
            if (
              !lastError.toLowerCase().includes("timed out") &&
              !lastError.toLowerCase().includes("timeout")
            ) {
              throw retryErr; // Don't retry non-timeout errors
            }
            console.log(
              `[video-gen] Attempt ${attempt} timed out, will retry...`
            );
          }
        }

        clearInterval(heartbeat);

        if (!videoBytes || videoBytes.byteLength === 0) {
          throw new Error(lastError);
        }

        // Send success marker + video bytes
        controller.enqueue(new Uint8Array([0x01]));

        // Stream video in chunks to avoid memory spikes
        const CHUNK_SIZE = 64 * 1024;
        for (let i = 0; i < videoBytes.byteLength; i += CHUNK_SIZE) {
          controller.enqueue(videoBytes.slice(i, i + CHUNK_SIZE));
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
