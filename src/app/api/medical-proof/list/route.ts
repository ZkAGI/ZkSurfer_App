import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json(
                { error: 'user_id is required.' },
                { status: 400 }
            );
        }

        const externalApiUrl = process.env.KB_BASE;
        if (!externalApiUrl) {
            throw new Error('KB_BASE environment variable is not set!');
        }

        const baseUrl = externalApiUrl.replace(/\/+$/, '');
        const fullUrl = `${baseUrl}/proofs/list?user_id=${encodeURIComponent(userId)}`;

        console.log('Calling:', fullUrl);

        const externalResponse = await fetch(fullUrl, { method: 'GET' });

        if (!externalResponse.ok) {
            const errorText = await externalResponse.text();
            return NextResponse.json(
                { error: `Failed to list proofs: ${errorText}` },
                { status: externalResponse.status }
            );
        }

        const responseData = await externalResponse.json();

        return NextResponse.json(responseData, { status: 200 });
    } catch (error: any) {
        console.error('Error in /api/medical-proof/list route:', error);
        return NextResponse.json(
            { error: error.message || 'Something went wrong.' },
            { status: 500 }
        );
    }
}