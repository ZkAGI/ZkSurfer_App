import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const userId = formData.get('user_id');
        const kbName = formData.get('kb_name');

        if (!userId) {
            return NextResponse.json(
                { error: 'user_id (wallet address) is required.' },
                { status: 400 }
            );
        }

        const externalApiUrl = process.env.KB_BASE;
        if (!externalApiUrl) {
            throw new Error('KB_BASE environment variable is not set!');
        }

        const forwardFormData = new FormData();
        forwardFormData.append('user_id', userId.toString());
        forwardFormData.append('kb_name', kbName?.toString() || `Medical Reports_${userId}`);
        forwardFormData.append('is_public', 'false');

        const externalResponse = await fetch(`${externalApiUrl}/kb/create`, {
            method: 'POST',
            body: forwardFormData,
        });

        if (!externalResponse.ok) {
            const errorText = await externalResponse.text();
            return NextResponse.json(
                { error: `Failed to create KB: ${errorText}` },
                { status: externalResponse.status }
            );
        }

        const responseData = await externalResponse.json();
        
        return NextResponse.json(responseData, { status: 200 });
    } catch (error: any) {
        console.error('Error in /api/medical-proof/create route:', error);
        return NextResponse.json(
            { error: error.message || 'Something went wrong.' },
            { status: 500 }
        );
    }
}