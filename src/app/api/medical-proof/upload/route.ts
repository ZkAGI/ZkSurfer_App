import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const userId = formData.get('user_id');
        const kbId = formData.get('kb_id');
        const proofName = formData.get('proof_name');
        const accessPolicy = formData.get('access_policy');
        const file = formData.get('file'); // Single file

        if (!userId || !kbId) {
            return NextResponse.json(
                { error: 'user_id and kb_id are required.' },
                { status: 400 }
            );
        }

        if (!file) {
            return NextResponse.json(
                { error: 'File is required.' },
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
        forwardFormData.append('proof_name', proofName?.toString() || `${userId}_report_${kbId}`);
        forwardFormData.append('access_policy', accessPolicy?.toString() || JSON.stringify({
            roles: ['owner', 'verifier'],
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }));
        forwardFormData.append('auto_generate_proof', 'true');
        forwardFormData.append('files', file); // Single file as string URL

        const externalResponse = await fetch(`${externalApiUrl}/kb/upload/private/enhanced`, {
            method: 'POST',
            body: forwardFormData,
        });

        if (!externalResponse.ok) {
            const errorText = await externalResponse.text();
            return NextResponse.json(
                { error: `Failed to upload file: ${errorText}` },
                { status: externalResponse.status }
            );
        }

        const responseData = await externalResponse.json();
        
        return NextResponse.json(responseData, { status: 200 });
    } catch (error: any) {
        console.error('Error in /api/medical-proof/upload route:', error);
        return NextResponse.json(
            { error: error.message || 'Something went wrong.' },
            { status: 500 }
        );
    }
}