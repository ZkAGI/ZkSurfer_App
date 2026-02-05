import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, proof_id } = body;

        if (!user_id || !proof_id) {
            return NextResponse.json(
                { error: 'user_id and proof_id are required.' },
                { status: 400 }
            );
        }

        const externalApiUrl = process.env.KB_BASE;
        if (!externalApiUrl) {
            throw new Error('KB_BASE environment variable is not set!');
        }

        const baseUrl = externalApiUrl.replace(/\/+$/, '');
        const fullUrl = `${baseUrl}/chat/session/create`;

        console.log('Calling:', fullUrl);

        const externalResponse = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, proof_id }),
        });

        if (!externalResponse.ok) {
            const errorText = await externalResponse.text();
            return NextResponse.json(
                { error: `Failed to create session: ${errorText}` },
                { status: externalResponse.status }
            );
        }

        const responseData = await externalResponse.json();

        return NextResponse.json(responseData, { status: 200 });
    } catch (error: any) {
        console.error('Error in /api/medical-proof/session route:', error);
        return NextResponse.json(
            { error: error.message || 'Something went wrong.' },
            { status: 500 }
        );
    }
}