import { NextRequest, NextResponse } from 'next/server';
import { validateAgentApiKey, VIDEO_API_BASE } from '@/lib/agent-auth';

// GET /api/agent/video/{id} — Get video status & details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateAgentApiKey(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const res = await fetch(`${VIDEO_API_BASE}/api/v1/videos/${id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ error: data.error || 'Video not found' }, { status: res.status });
    }

    return NextResponse.json({
      id: data.id,
      topic: data.topic,
      status: data.status,
      phase: data.phase,
      phaseDetail: data.phaseDetail,
      queuePosition: data.queuePosition,
      isPaid: data.isPaid,
      paymentStatus: data.paymentStatus,
      format: data.format,
      durationSeconds: data.durationSeconds,
      fileSizeMb: data.fileSizeMb,
      previewUrl: data.previewUrl,
      downloadUrl: data.isPaid ? data.downloadUrl : null,
      createdAt: data.createdAt,
      completedAt: data.completedAt,
      failureReason: data.failureReason,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/agent/video/{id} — Purchase video (get Stripe checkout URL)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateAgentApiKey(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const res = await fetch(`${VIDEO_API_BASE}/api/v1/payments/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({
        videoId: id,
        successUrl: body.successUrl || body.callbackUrl,
        cancelUrl: body.cancelUrl,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ error: data.error || 'Failed to create checkout' }, { status: res.status });
    }

    return NextResponse.json({
      checkoutUrl: data.url,
      sessionId: data.sessionId,
      videoId: id,
      amount: '$5.00',
      message: 'Redirect user to checkoutUrl to complete payment. Video downloadUrl will be available after payment.',
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
