import { NextRequest, NextResponse } from 'next/server';

const VIDEO_WEBHOOK_URL = 'https://content-agent-video.zkagi.ai/api/v1/payments/webhook';

export async function POST(request: NextRequest) {
  try {
    // Forward the raw body and Stripe signature to the video backend
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (signature) {
      headers['stripe-signature'] = signature;
    }

    const response = await fetch(VIDEO_WEBHOOK_URL, {
      method: 'POST',
      headers,
      body,
    });

    const responseText = await response.text();
    console.log(`[video-webhook] Forwarded to backend, status: ${response.status}`);

    return new NextResponse(responseText, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[video-webhook] Error forwarding:', error);
    return NextResponse.json(
      { error: 'Failed to forward webhook' },
      { status: 502 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Video payment webhook relay is active.' });
}
