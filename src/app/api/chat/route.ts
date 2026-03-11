import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// async function generateKeys() {
//     console.log('Generating keys...');
//     const response = await fetch('https://zynapse.zkagi.ai/api/generate-keys', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'api-key': `${process.env.API_KEY}`
//         }
//     });
//     if (!response.ok) {
//         throw new Error('Failed to generate keys');
//     }
//     const result = await response.json();
//     console.log('Keys generated successfully:', result);
//     return result;
// }

async function generateProof(text: string) {
    const limitedText = text.substring(0, 500);
    const response = await fetch('https://zynapse.zkagi.ai/api/generate-proof', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': `${process.env.API_KEY}`
        },
        body: JSON.stringify({ text: limitedText }),
    });
    if (!response.ok) {
        throw new Error('Failed to generate proof');
    }
    const result = await response.json();
    console.log('Proof generated successfully:', result);
    return result;
}

async function verifyProof(proof: string) {
    console.log('Verifying proof:', proof);
    const response = await fetch('https://zynapse.zkagi.ai/api/verify-proof', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': `${process.env.API_KEY}`
        },
        body: JSON.stringify({ proof }),
    });
    if (!response.ok) {
        throw new Error('Failed to verify proof');
    }
    const result = await response.json();
    console.log('Proof verified successfully:', result);
    return result;
}

async function generate_image(
    prompt: string,
    seed: number | undefined,
    credits: number,
    clientApiKey: string
) {
    // low credits → legacy “landwolf” endpoint
    if (credits <= 10) {
        const landwolfUrl = process.env.NEXT_PUBLIC_LANDWOLF;
        if (!landwolfUrl) throw new Error("…missing LANDWOLF URL");

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 120_000);

        const resp = await fetch(landwolfUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-API-KEY": clientApiKey,
            },
            body: JSON.stringify({
                prompt,
                width: 512,
                height: 512,
                num_steps: 20,
                guidance: 4,
                seed,
            }),
            signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!resp.ok) throw new Error(`Landwolf failed: ${resp.statusText}`);

        const contentType = resp.headers.get("Content-Type")!;
        if (contentType.includes("image/")) {
            const blob = await resp.blob();
            const buf = Buffer.from(await blob.arrayBuffer());
            return {
                image: `data:${contentType};base64,${buf.toString("base64")}`,
                contentType,
            };
        }
        return resp.json();
    }

    // high credits → new ZKAGI v1 endpoint
    else if (credits > 10) {
        const landwolfHigh = process.env.NEXT_PUBLIC_LANDWOLF_HIGH;
        if (!landwolfHigh) throw new Error("…missing LANDWOLFHIGH URL");

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 120_000);

        const resp = await fetch(landwolfHigh, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-API-KEY": clientApiKey,
            },
            body: JSON.stringify({
                prompt,
                width: 512,
                height: 512,
                num_steps: 24,
                guidance: 3.5,
                seed: 1,
                strength: 1,
            }),
            signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!resp.ok) throw new Error(`Landwolf failed: ${resp.statusText}`);

        const contentType = resp.headers.get("Content-Type")!;
        if (contentType.includes("image/")) {
            const blob = await resp.blob();
            const buf = Buffer.from(await blob.arrayBuffer());
            return {
                image: `data:${contentType};base64,${buf.toString("base64")}`,
                contentType,
            };
        }
        return resp.json();
    }
}

// async function generate_image(
//     prompt: string,
//     seed: number | undefined,
//     credits: number,
//     clientApiKey: string
// ) {
//     const landwolfHigh = process.env.NEXT_PUBLIC_LANDWOLF_HIGH;
//     // low credits → legacy “landwolf” endpoint
//     if (credits <= 10) {
//         const landwolfUrl = process.env.NEXT_PUBLIC_LANDWOLF
//         if (!landwolfUrl) throw new Error("…missing LANDWOLF URL")

//         const controller = new AbortController()
//         const timeout = setTimeout(() => controller.abort(), 120_000)

//         const resp = await fetch(landwolfUrl, {
//             method: 'POST',
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json',
//                 'X-API-KEY': clientApiKey,   // pass the stored key
//             },
//             body: JSON.stringify({
//                 prompt,
//                 width: 512,
//                 height: 512,
//                 num_steps: 20,
//                 guidance: 4,
//                 seed,
//             }),
//             signal: controller.signal,
//         })
//         clearTimeout(timeout)
//         if (!resp.ok) throw new Error(`Landwolf failed: ${resp.statusText}`)

//         // handle image or JSON exactly as before…
//         const contentType = resp.headers.get('Content-Type')!
//         if (contentType.includes('image/')) {
//             const blob = await resp.blob()
//             const buf = Buffer.from(await blob.arrayBuffer())
//             return {
//                 image: `data:${contentType};base64,${buf.toString('base64')}`,
//                 contentType
//             }
//         }
//         return resp.json()
//     }

//     if (!landwolfHigh) {
//         console.error("❌ Missing NEXT_PUBLIC_LANDWOLF_HIGH in environment");
//         throw new Error("Missing LANDWOLF_HIGH URL");
//     }

//     // high credits → new ZKAGI v1 endpoint
//     const resp2 = await fetch(landwolfHigh, {
//         method: 'POST',
//         headers: {
//             'Accept': '*/*',
//             //'User-Agent': 'ZkAGI-Client',
//             'X-API-KEY': clientApiKey,      // use the stored key here too
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             prompt,
//             width: 720,
//             height: 1024,
//             num_steps: 24,
//             guidance: 3.5,
//             seed,
//             strength: 1
//         }),
//     })
//     if (!resp2.ok) throw new Error(`ZKAGI-v1 failed: ${resp2.statusText}`)
//     const data = await resp2.json()
//     // assume `data.image` is a base64 URL or URL string
//     return {
//         image: data.image,
//         contentType: 'image/png',
//     }
// }


// async function generate_image(prompt: string, seed?: number,) {

//     const landwolfUrl = process.env.NEXT_PUBLIC_LANDWOLF;
//     if (!landwolfUrl) {
//         throw new Error("NEXT_PUBLIC_LANDWOLF is not defined in environment variables");
//     }

//     try {
//         // Create an AbortController for the timeout.
//         const controller = new AbortController();
//         const timeout = setTimeout(() => controller.abort(), 120000);

//         // Make the fetch call with the provided prompt.
//         const response = await fetch(landwolfUrl, {
//             method: 'POST',
//             headers: {
//                 Accept: 'application/json',
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 prompt,
//                 width: 512,
//                 height: 512,
//                 num_steps: 20,
//                 guidance: 4,
//             }),
//             signal: controller.signal,
//         });

//         clearTimeout(timeout);

//         if (!response.ok) {
//             throw new Error(`Failed to generate image: ${response.statusText}`);
//         }

//         // Check the Content-Type of the response.
//         const contentType = response.headers.get('Content-Type');

//         if (contentType?.includes('image/')) {
//             // Convert image to base64 string to send to frontend
//             const blob = await response.blob();
//             const arrayBuffer = await blob.arrayBuffer();
//             const buffer = Buffer.from(arrayBuffer);
//             const base64Image = buffer.toString('base64');

//             return {
//                 image: `data:${contentType};base64,${base64Image}`,
//                 contentType
//             };
//         } else if (contentType?.includes('application/json')) {
//             // If response is JSON, just return it
//             const result = await response.json();
//             return result;
//         } else {
//             throw new Error('Unsupported response type');
//         }
//     } catch (error) {
//         console.error(error);
//         throw error;
//     }
// }

//
// ─── STREAMING API ENDPOINT ─────────────────────────────────────────────
//

export async function POST(request: Request) {
    try {
        console.log('Received request to /api/chat');

        // Parse the request body once.
        const { messages, directCommand, selectedModel, credits,
            apiKey: clientApiKey } = await request.json();
        console.log('Parsed messages:', messages);
        console.log('Received selectedModel from frontend:', selectedModel);

        const resolvedModel = selectedModel || "DeepSeek";

        // Generate keys first.
        // await generateKeys();

        if (directCommand) {
            // Call your image-generation service.
            const generatedImage = await generate_image(directCommand.prompt, directCommand.seed, credits,
                clientApiKey);

            // Generate and verify proof.
            // const proof = await generateProof(directCommand.prompt);
            // await verifyProof(proof);

            const encoder = new TextEncoder();

            const stream = new ReadableStream({
                async start(controller) {
                    // Send a progress update.
                    const progressEvent = JSON.stringify({ progress: 50 });
                    controller.enqueue(encoder.encode(`data: ${progressEvent}\n\n`));

                    // Now send the final payload.
                    const finalPayload = JSON.stringify({
                        content: generatedImage.image,
                        type: 'img',
                        prompt: directCommand.prompt,
                        seed: 'null',
                      //  proof,
                    });
                    controller.enqueue(encoder.encode(`data: ${finalPayload}\n\n`));
                    controller.close();
                },
            });

            return new Response(stream, {
                headers: { "Content-Type": "text/event-stream" }
            });
        }


        // ─── NORMAL CHAT FLOW (STREAMED) ─────────────────────────────
        // Prepend a system prompt.
        const updatedMessages = [
            { role: "system", content: 'You are an advanced AI assistant named ZkTerminal made by ZkAGI' },
            ...messages
        ];

        // Select the correct base URL and model.
        const deepSeekBaseURL = process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL;
        const deepSeekModel = process.env.NEXT_PUBLIC_DEEPSEEK_MODEL;
        const mistralBaseURL = process.env.NEXT_PUBLIC_OPENAI_BASE_URL;
        const mistralModel = process.env.NEXT_PUBLIC_MISTRAL_MODEL;
        const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

        if (!deepSeekBaseURL || !deepSeekModel || !mistralBaseURL || !mistralModel || !apiKey) {
            throw new Error("Missing required environment variables for AI client.");
        }

        let baseURL = deepSeekBaseURL;
        let model = deepSeekModel;
        if (resolvedModel === "Mistral") {
            baseURL = mistralBaseURL;
            model = mistralModel;
        }
        console.log(`Using AI Provider: ${resolvedModel}`);
        console.log(`Base URL: ${baseURL}, Model: ${model}`);

        // Create a client using the selected provider.
        const aiClient = new OpenAI({ baseURL, apiKey });

        // Request a streaming completion.
        const openAIStream = await aiClient.chat.completions.create({
            model,
            messages: updatedMessages,
            stream: true,
        });

        // Prepare a ReadableStream that will push SSE-formatted tokens to the client.
        const encoder = new TextEncoder();
        let accumulatedResponse = '';
        let buffer = '';

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of openAIStream) {
                        const delta = chunk.choices[0].delta;
                        if (delta && delta.content) {
                            const token = delta.content;
                            accumulatedResponse += token;
                            buffer += token;

                            if (/[ \t\n\r.,!?]$/.test(buffer)) {
                                const message = `${buffer}`;
                                controller.enqueue(encoder.encode(message));
                                buffer = '';
                            }
                        }
                    }
                    if (buffer.length > 0) {
                        controller.enqueue(encoder.encode(`${buffer}`));
                    }
                } catch (error) {
                    controller.enqueue(encoder.encode(`data: [ERROR] ${error}\n\n`));
                    controller.error(error);
                }
                controller.close();
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform"
            }
        });

    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error('Error in /api/chat:', errMsg, error);
        return new Response(
            JSON.stringify({ error: errMsg || 'An error occurred while processing your request' }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}