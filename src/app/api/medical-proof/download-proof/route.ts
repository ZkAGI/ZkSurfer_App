import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const kb_id = req.nextUrl.searchParams.get('kb_id');
        const asset_id = req.nextUrl.searchParams.get('asset_id');

        if (!kb_id || !asset_id) {
            return NextResponse.json(
                { error: 'kb_id and asset_id are required' },
                { status: 400 }
            );
        }

        const base = process.env.KB_API_BASE;
        if (!base) {
            throw new Error('KB_API_BASE environment variable is not set');
        }

        const baseUrl = base.replace(/\/+$/, '');
        const downloadUrl = `${baseUrl}/kb/proofs/download/${encodeURIComponent(kb_id)}/${encodeURIComponent(asset_id)}`;

        console.log('📥 Proxying proof download from:', downloadUrl);

        const response = await fetch(downloadUrl, {
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Download failed:', errorText);
            return NextResponse.json(
                { error: `Failed to download proof: ${errorText}` },
                { status: response.status }
            );
        }

        const blob = await response.blob();
        console.log('✅ Proof file downloaded, size:', blob.size, 'bytes');

        return new NextResponse(blob, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="proof_${asset_id}.json"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error: any) {
        console.error('❌ Download proxy error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to download proof' },
            { status: 500 }
        );
    }
}