// import { NextRequest, NextResponse } from "next/server";

// export async function POST(request: NextRequest) {
//   // 1) Read the external endpoint from env (or hardcode if you prefer).
//   const externalEndpoint = process.env.NEXT_PUBLIC_VIDEO_GEN_ENDPOINT
//     || "http://34.67.134.209:8005/generate-video";
//   if (!externalEndpoint) {
//     return NextResponse.json(
//       { error: "VIDEO_GEN_API endpoint is not defined" },
//       { status: 500 }
//     );
//   }

//   try {
//     // 2) Read the API key and current credits from request headers.
//     const apiKey = request.headers.get("x-api-key");
//     const currentCreditsHeader = request.headers.get("x-current-credits");
//     const currentCredits = currentCreditsHeader ? parseInt(currentCreditsHeader, 10) : 0;

//     if (!apiKey) {
//       return NextResponse.json(
//         { error: "API key is required" },
//         { status: 400 }
//       );
//     }

//     if (!currentCreditsHeader || isNaN(currentCredits) || currentCredits <= 0) {
//       return NextResponse.json(
//         { error: "Insufficient credits" },
//         { status: 402 } // 402 Payment Required
//       );
//     }

//     // 3) Parse the JSON body to extract { prompt }.
//     //    We expect the client to send: { prompt: string, …other optional fields }
//     const jsonBody = await request.json();
//     const prompt = typeof jsonBody.prompt === "string"
//       ? jsonBody.prompt.trim()
//       : "";

//     if (!prompt) {
//       return NextResponse.json(
//         { error: "Missing required field: prompt" },
//         { status: 400 }
//       );
//     }

//     // 4) Build the payload exactly as the external service expects.
//     //    You can add or remove any of these keys if they’re optional:
//     const externalPayload = {
//       prompt,
//       fast_mode: "Balanced",
//       lora_scale: 1,
//       num_frames: 81,
//       aspect_ratio: "16:9",
//       sample_shift: 5,
//       sample_steps: 30,
//       frames_per_second: 16,
//       sample_guide_scale: 5,
//       // … you could accept overrides from jsonBody if you liked:
//       // ...jsonBody.fast_mode && { fast_mode: jsonBody.fast_mode },
//     };

//     // 5) Forward the POST to the external endpoint.
//     const externalResponse = await fetch(externalEndpoint, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-API-Key": apiKey,
//         accept: "*/*",
//       },
//       body: JSON.stringify(externalPayload),
//     });

//     if (!externalResponse.ok) {
//       // Try to unwrap any JSON error they returned:
//       let errJson: any = null;
//       try {
//         errJson = await externalResponse.json();
//       } catch {
//         // If it wasn’t valid JSON, fall back to text
//       }

//       if (errJson && typeof errJson === "object") {
//         return NextResponse.json(
//           {
//             error: `External service failed`,
//             details: errJson,
//           },
//           { status: externalResponse.status }
//         );
//       } else {
//         const errText = await externalResponse.text();
//         return NextResponse.json(
//           {
//             error: `External service failed: ${errText}`,
//           },
//           { status: externalResponse.status }
//         );
//       }
//     }

//     // 6) Otherwise, parse the JSON response (e.g. { video_url: "https://…" })
//     const data = await externalResponse.json();

//     // 7) Return it to the client, and let the client deduct 1 credit locally.
//     return NextResponse.json(data, {
//       status: 200,
//     });
//   } catch (err: any) {
//     console.error("Error in /api/video-gen:", err);
//     return NextResponse.json(
//       { error: err.message || "Something went wrong." },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // 1) Read the external endpoint from env (or hardcode if you prefer).
  const externalEndpoint =process.env.NEXT_PUBLIC_VIDEO_GEN_ENDPOINT
  //"http://45.251.34.28:8000/generate-video"
  //process.env.NEXT_PUBLIC_VIDEO_GEN_ENDPOINT | "http://34.67.134.209:8005/generate-video";
  if (!externalEndpoint) {
    return NextResponse.json(
      { error: "VIDEO_GEN_API endpoint is not defined" },
      { status: 500 }
    );
  }

  try {
    // 2) Read the API key and current credits from request headers.
    const apiKey = request.headers.get("x-api-key");
    const currentCreditsHeader = request.headers.get("x-current-credits");
    const currentCredits = currentCreditsHeader ? parseInt(currentCreditsHeader, 10) : 0;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    if (!currentCreditsHeader || isNaN(currentCredits) || currentCredits <= 0) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 } // 402 Payment Required
      );
    }

    // 3) Parse the JSON body to extract { prompt }.
    const jsonBody = await request.json();
    const prompt = typeof jsonBody.prompt === "string"
      ? jsonBody.prompt.trim()
      : "";

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
        { status: 400 }
      );
    }

    // 4) Build the payload exactly as the external service expects.
    const externalPayload = {
      prompt,
      fast_mode: "Balanced",
      lora_scale: 1,
      num_frames: 81,
      aspect_ratio: "16:9",
      sample_shift: 5,
      sample_steps: 30,
      frames_per_second: 16,
      sample_guide_scale: 5,
    };

    // 5) Forward the POST to the external endpoint.
    const externalResponse = await fetch(externalEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        accept: "*/*", // Accept any content type (JSON or binary)
      },
      body: JSON.stringify(externalPayload),
    });

    if (!externalResponse.ok) {
      // Try to unwrap any error response
      let errorMessage = "External service failed";
      try {
        const errText = await externalResponse.text();
        errorMessage = errText || errorMessage;
      } catch {
        // If we can't read the error, use default message
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: externalResponse.status }
      );
    }

    // 6) Check if response is MP4 or JSON
    const contentType = externalResponse.headers.get('content-type');
    
    if (contentType?.includes('video/mp4') || 
        contentType?.includes('application/octet-stream') ||
        contentType?.includes('binary/octet-stream')) {
      
      // Handle direct MP4 response
      const videoBuffer = await externalResponse.arrayBuffer();
      
      return new NextResponse(videoBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': videoBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=31536000',
        },
      });
      
    } else {
      // Try to handle JSON response
      try {
        const data = await externalResponse.json();
        return NextResponse.json(data, { status: 200 });
      } catch (jsonError) {
        // If JSON parsing fails, assume it's binary data
        console.log("JSON parsing failed, treating as binary data");
        const videoBuffer = await externalResponse.arrayBuffer();
        
        return new NextResponse(videoBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Length': videoBuffer.byteLength.toString(),
            'Cache-Control': 'public, max-age=31536000',
          },
        });
      }
    }

  } catch (err: any) {
    console.error("Error in /api/video-gen:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
