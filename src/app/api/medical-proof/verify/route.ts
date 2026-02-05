import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const userId = formData.get('user_id');
        const kbId = formData.get('kb_id');
        const proofId = formData.get('proof_id');

        if (!userId || !kbId) {
            return NextResponse.json(
                { error: 'user_id and kb_id are required.' },
                { status: 400 }
            );
        }

        const externalApiUrl = process.env.KB_API_BASE;
        if (!externalApiUrl) {
            throw new Error('KB_API_BASE environment variable is not set!');
        }

        const forwardFormData = new FormData();
        forwardFormData.append('user_id', userId.toString());
        forwardFormData.append('kb_id', kbId.toString());
        if (proofId) {
            forwardFormData.append('proof_id', proofId.toString());
        }

        const externalResponse = await fetch(`${externalApiUrl}/kb/verify`, {
            method: 'POST',
            body: forwardFormData,
        });

        if (!externalResponse.ok) {
            const errorText = await externalResponse.text();
            return NextResponse.json(
                { error: `Failed to verify proof: ${errorText}` },
                { status: externalResponse.status }
            );
        }

        const responseData = await externalResponse.json();
        
        return NextResponse.json(responseData, { status: 200 });
    } catch (error: any) {
        console.error('Error in /api/medical-proof/verify route:', error);
        return NextResponse.json(
            { error: error.message || 'Something went wrong.' },
            { status: 500 }
        );
    }
}