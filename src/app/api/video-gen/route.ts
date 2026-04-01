import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const maxDuration = 300;

// In-memory job store
interface VideoJob {
  status: "processing" | "complete" | "error";
  videoBuffer?: Buffer;
  error?: string;
  createdAt: number;
}

const jobs = new Map<string, VideoJob>();

// Auto-cleanup jobs older than 15 minutes
setInterval(() => {
  const now = Date.now();
  jobs.forEach((job, id) => {
    if (now - job.createdAt > 15 * 60 * 1000) jobs.delete(id);
  });
}, 60_000);

// Background: call external API and store the video buffer
async function processVideoJob(
  jobId: string,
  externalEndpoint: string,
  apiKey: string,
  externalPayload: object
) {
  try {
    console.log(`[video-gen] Job ${jobId}: calling external API...`);

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
      let errorMessage = "External service failed";
      try {
        errorMessage = (await externalResponse.text()) || errorMessage;
      } catch {}
      jobs.set(jobId, { ...jobs.get(jobId)!, status: "error", error: errorMessage });
      return;
    }

    // Read the entire response as a buffer (works for both binary video and JSON)
    const rawBuffer = Buffer.from(await externalResponse.arrayBuffer());
    const contentType = externalResponse.headers.get("content-type") || "";

    console.log(
      `[video-gen] Job ${jobId}: got response, content-type="${contentType}", size=${rawBuffer.byteLength} bytes`
    );

    // If it's clearly a video, store the buffer directly
    if (
      contentType.includes("video/") ||
      contentType.includes("application/octet-stream") ||
      contentType.includes("binary/octet-stream")
    ) {
      jobs.set(jobId, {
        ...jobs.get(jobId)!,
        status: "complete",
        videoBuffer: rawBuffer,
      });
      console.log(`[video-gen] Job ${jobId}: stored as video buffer`);
      return;
    }

    // Try parsing as JSON to check for a video URL
    let jsonData: any = null;
    try {
      jsonData = JSON.parse(rawBuffer.toString("utf-8"));
    } catch {
      // Not JSON — treat entire buffer as video
      jobs.set(jobId, {
        ...jobs.get(jobId)!,
        status: "complete",
        videoBuffer: rawBuffer,
      });
      console.log(`[video-gen] Job ${jobId}: not JSON, stored as video buffer`);
      return;
    }

    // Look for a video URL in common JSON field names
    const videoUrl =
      jsonData.videoUrl ||
      jsonData.video_url ||
      jsonData.url ||
      jsonData.download_url ||
      (typeof jsonData.output === "string" ? jsonData.output : null) ||
      (Array.isArray(jsonData.output) ? jsonData.output[0] : null) ||
      jsonData.result;

    if (typeof videoUrl === "string" && videoUrl.startsWith("http")) {
      console.log(`[video-gen] Job ${jobId}: downloading video from URL: ${videoUrl}`);
      const videoResponse = await fetch(videoUrl);
      if (videoResponse.ok) {
        const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
        jobs.set(jobId, {
          ...jobs.get(jobId)!,
          status: "complete",
          videoBuffer,
        });
        console.log(`[video-gen] Job ${jobId}: downloaded ${videoBuffer.byteLength} bytes`);
        return;
      }
    }

    // No video URL found — this is an error
    console.log(`[video-gen] Job ${jobId}: JSON had no video. Keys: ${Object.keys(jsonData).join(", ")}`);
    jobs.set(jobId, {
      ...jobs.get(jobId)!,
      status: "error",
      error: "Video generation returned unexpected response",
    });
  } catch (err: any) {
    console.error(`[video-gen] Job ${jobId}: failed:`, err.message);
    jobs.set(jobId, {
      ...jobs.get(jobId)!,
      status: "error",
      error: err.message || "Video generation failed",
    });
  }
}

// POST: Start video generation (returns jobId immediately)
export async function POST(request: NextRequest) {
  const externalEndpoint = process.env.NEXT_PUBLIC_VIDEO_GEN_ENDPOINT;
  if (!externalEndpoint) {
    return NextResponse.json(
      { error: "VIDEO_GEN_API endpoint is not defined" },
      { status: 500 }
    );
  }

  try {
    const apiKey = request.headers.get("x-api-key");
    const currentCreditsHeader = request.headers.get("x-current-credits");
    const currentCredits = currentCreditsHeader
      ? parseInt(currentCreditsHeader, 10)
      : 0;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required. Please generate one using the /api command." },
        { status: 400 }
      );
    }

    if (!currentCreditsHeader || isNaN(currentCredits) || currentCredits <= 0) {
      return NextResponse.json(
        { error: "Insufficient credits. Please top up to use video generation." },
        { status: 402 }
      );
    }

    const jsonBody = await request.json();
    const prompt =
      typeof jsonBody.prompt === "string" ? jsonBody.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
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

    // Create job, fire background processing, return immediately
    const jobId = randomUUID();
    jobs.set(jobId, { status: "processing", createdAt: Date.now() });

    // Don't await — runs in background
    processVideoJob(jobId, externalEndpoint, apiKey, externalPayload);

    return NextResponse.json({ jobId }, { status: 202 });
  } catch (err: any) {
    console.error("Error in POST /api/video-gen:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong." },
      { status: 500 }
    );
  }
}

// GET: Poll for job status — returns video blob when complete
export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId parameter" }, { status: 400 });
  }

  const job = jobs.get(jobId);

  if (!job) {
    return NextResponse.json(
      { error: "Job not found. It may have expired." },
      { status: 404 }
    );
  }

  if (job.status === "processing") {
    return NextResponse.json({ status: "processing" }, { status: 202 });
  }

  if (job.status === "error") {
    const error = job.error;
    jobs.delete(jobId);
    return NextResponse.json({ status: "error", error }, { status: 500 });
  }

  // Complete — return the video buffer and clean up
  if (job.videoBuffer) {
    const buffer = job.videoBuffer;
    jobs.delete(jobId);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": buffer.byteLength.toString(),
        "Cache-Control": "public, max-age=31536000",
      },
    });
  }

  jobs.delete(jobId);
  return NextResponse.json(
    { error: "Job completed but no video data was found" },
    { status: 500 }
  );
}
