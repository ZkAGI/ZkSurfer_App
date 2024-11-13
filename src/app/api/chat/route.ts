import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import tools from './tools.json';

interface CustomResponse extends Omit<OpenAI.Chat.Completions.ChatCompletionMessage, 'content'> {
    generateImage?: string;
    proof?: string;
    content?: string | null;
    type?: 'img' | 'text';
    prompt?: string;
}

const client = new OpenAI({
    baseURL: process.env.OPENAI_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY,
});


async function generateKeys() {
    console.log('Generating keys...');
    const response = await fetch('https://zynapse.zkagi.ai/api/generate-keys', { method: 'POST', headers: { 'Content-Type': 'application/json', 'api-key': `${process.env.API_KEY}` } });
    if (!response.ok) {
        throw new Error('Failed to generate keys');
    }
    const result = await response.json();
    console.log('Keys generated successfully:', result);
    return result;
}

async function generateProof(text: string) {
    console.log('Generating proof for text:', text);
    const response = await fetch('https://zynapse.zkagi.ai/api/generate-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': `${process.env.API_KEY}` },
        body: JSON.stringify({ text }),
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
        headers: { 'Content-Type': 'application/json', 'api-key': `${process.env.API_KEY}` },
        body: JSON.stringify({ proof }),
    });
    if (!response.ok) {
        throw new Error('Failed to verify proof');
    }
    const result = await response.json();
    console.log('Proof verified successfully:', result);
    return result;
}

async function generate_image(prompt: string, seed?: number) { //id_image?: string
    // console.log('Generating image...');
    console.log('Generating image...', { prompt, seed }); //id_image

    const fetchWithTimeout = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Request timed out after 60 seconds'));
        }, 120000);

        fetch('https://zynapse.zkagi.ai/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': `${process.env.API_KEY}`
            },
            body: JSON.stringify({
                prompt,
                width: 512,
                height: 512,
                add_sampling_metadata: true,
                num_steps: 20,
                start_step: 0,
                guidance: 4,
                seed: seed ?? -1,
                // id_image: id_image ?? '',
                id_weight: 1.0,
                neg_prompt: "bad quality, worst quality, text, signature, watermark, extra limbs",
                true_cfg: 1.0,
                timestep_to_start_cfg: 1,
                max_sequence_length: 128
            }),
        })
            .then(response => {
                clearTimeout(timeout); // Clear timeout if request is successful
                if (!response.ok) {
                    throw new Error(`Failed to generate image: ${response.statusText}`);
                }
                return response.json();
            })
            .then(result => resolve(result))
            .catch(err => reject(err));
    });

    try {
        const result: any = await fetchWithTimeout;
        console.log('result', result);
        // return result.image;
        return {
            image: result.image,
            seed: result.seed // Include seed in return value
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}



function openAIWithTimeout(request: any, timeout = 120000): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    return Promise.race([
        client.chat.completions.create(request),
        new Promise((_, reject) => setTimeout(() => reject(new Error('OpenAI request timed out')), timeout))
    ]) as Promise<OpenAI.Chat.Completions.ChatCompletion>;
}


export async function POST(request: Request) {
    try {
        console.log('Received request to /api/chat');
        // Parse request body once
        const { messages, directCommand } = await request.json();
        console.log('Parsed messages:', messages);

        if (!client.apiKey) {
            console.error('OPENAI_API_KEY is not set');
            throw new Error('API configuration is incomplete');
        }

        // Generate keys
        await generateKeys();

        // Handle direct commands first
        if (directCommand) {
            // Generate image directly
            const generatedImage = await generate_image(directCommand.prompt, directCommand.seed); // directCommand.id_image

            // Generate and verify proof
            const proof = await generateProof(directCommand.prompt);
            await verifyProof(proof);

            return NextResponse.json({
                content: generatedImage.image,
                type: 'img',
                prompt: directCommand.prompt,
                seed: generatedImage.seed,
                proof
            });
        }

        // If not a direct command, proceed with normal chat flow
        // Add system prompt
        //         const tool_prompt = `You are an advanced AI assistant named ZKSurfer made by ZkAGI with access to external tools, but your primary capability is your own extensive knowledge and reasoning. Your goal is to provide helpful, accurate responses to user queries.

        //  <tools>
        //  ${JSON.stringify(tools)}
        //  </tools>

        //  Guidelines for tool usage:

        //  1. Rely primarily on your own knowledge and capabilities. This should be your default approach for answering queries.

        //  2. Use tools only when absolutely necessary. Consider using a tool if:
        //     - The query explicitly requires real-time or external data you cannot access otherwise.
        //     - The task involves specialized computations or data processing beyond your built-in capabilities.
        //     - You need to verify critical information that you're unsure about.

        //  3. Before using a tool, carefully evaluate:
        //     - Is the information truly essential to answer the query?
        //     - Is there any way to provide a satisfactory response without the tool?
        //     - Will the tool provide significant value beyond what you can offer directly?

        //  4. If you determine a tool is necessary:
        //     - Verify the tool is listed in the provided <tools> section.
        //     - Use only the tools explicitly defined in the <tools> section. Do not create or invent new tools.
        //     - Use only the arguments required by the tool signature as defined in the <tools> section.
        //     - Call multiple tools in sequence if needed to gather all necessary information.

        //  5. To use a tool, format your request as follows:
        //     <tool_call>
        //     {"name": "<function-name>", "arguments": <args-dict>}
        //     </tool_call>

        //  6. After using a tool, integrate the results seamlessly into your response. Explain how the tool output contributes to answering the user's query.

        //  Remember: 
        //  - Your intelligence and knowledge are your primary assets. Tools are supplementary and should be used judiciously to enhance your capabilities, not replace them.
        //  - Only use tools that are explicitly defined in the <tools> section. Do not create, invent, or assume the existence of any tools not listed there.
        //  - Adhere strictly to the defined tool signatures and do not attempt to use arguments or functionalities not specified in the tool definitions.`;


        const updatedMessages = [
            { role: "system", content: 'You are an advanced AI assistant named ZKSurfer made by ZkAGI' },
            ...messages
        ];

        const response = await openAIWithTimeout({
            // model: "meta-llama/llama-3.2-11b-vision-instruct:free",
            // model: "mistralai/Pixtral-12B-2409",
            model: "pixtral-12b-2409",
            messages: updatedMessages,
        });

        console.log('response', response);
        const responseMessage = response.choices[0].message;

        let finalResponse: CustomResponse = { ...responseMessage };

        // Check for tool calls
        // if (responseMessage.content) {
        //     const toolCallMatch = responseMessage.content.match(/<tool_call>([^]*?)<\/tool_call>/);
        //     if (toolCallMatch) {
        //         const toolCallContent = toolCallMatch[1];
        //         try {
        //             const toolCall = JSON.parse(toolCallContent);
        //             console.log('Tool call detected:', toolCall);

        //             switch (toolCall.name) {
        //                 case 'generate_image':
        //                     const generatedImage = await generate_image(toolCall.arguments.prompt);
        //                     finalResponse.content = generatedImage.image;
        //                     finalResponse.type = 'img';
        //                     finalResponse.prompt = responseMessage.content;
        //                     console.log('finalResponse', finalResponse);
        //                     break;
        //                 default:
        //                     console.log('Unknown tool call:', toolCall.name);
        //             }
        //         } catch (error) {
        //             console.error('Error parsing or executing tool call:', error);
        //         }
        //     }
        // }

        // Generate proof
        const lastMessage = messages[messages.length - 1].content;
        console.log('lastMessage', lastMessage);

        if (Array.isArray(lastMessage)) {
            const firstObject = lastMessage[0];
            if (firstObject.type === 'text') {
                console.log('Text:', firstObject.text);
                const proof = await generateProof(firstObject.text);
                await verifyProof(proof);
                finalResponse.proof = proof;
            } else {
                console.log('The first object is not a text message');
            }
        } else {
            const proof = await generateProof(lastMessage);
            await verifyProof(proof);
            finalResponse.proof = proof;
        }

        return NextResponse.json(finalResponse);

    } catch (error) {
        console.error('Error in /api/chat:', error);
        return NextResponse.json(
            { error: 'An error occurred while processing your request' },
            { status: 500 }
        );
    }
}