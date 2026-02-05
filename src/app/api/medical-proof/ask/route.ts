import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { session_id, question, top_k } = body;

        if (!session_id || !question) {
            return NextResponse.json(
                { error: 'session_id and question are required.' },
                { status: 400 }
            );
        }

        const externalApiUrl = process.env.KB_BASE;
        if (!externalApiUrl) {
            throw new Error('KB_BASE environment variable is not set!');
        }

        const baseUrl = externalApiUrl.replace(/\/+$/, '');
        const fullUrl = `${baseUrl}/chat/ask`;

        console.log('Calling:', fullUrl);

        const externalResponse = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id,
                question,
                top_k: top_k || 5,
            }),
        });

        if (!externalResponse.ok) {
            const errorText = await externalResponse.text();
            return NextResponse.json(
                { error: `Failed to get answer: ${errorText}` },
                { status: externalResponse.status }
            );
        }

        const responseData = await externalResponse.json();

        return NextResponse.json(responseData, { status: 200 });
    } catch (error: any) {
        console.error('Error in /api/medical-proof/ask route:', error);
        return NextResponse.json(
            { error: error.message || 'Something went wrong.' },
            { status: 500 }
        );
    }
}