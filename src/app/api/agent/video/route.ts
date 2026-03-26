import { NextRequest, NextResponse } from 'next/server';
import { validateAgentApiKey, VIDEO_API_BASE } from '@/lib/agent-auth';

// POST /api/agent/video — Generate a new video
export async function POST(request: NextRequest) {
  const auth = await validateAgentApiKey(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { topic, mode, voice, format, product, customInstructions } = body;

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    const payload: Record<string, unknown> = {
      topic,
      mode: mode || 'standard',
      voice: voice || 'pad',
      format: format || '16:9',
    };
    if (product) payload.product = product;
    if (customInstructions) payload.customInstructions = customInstructions;

    const res = await fetch(`${VIDEO_API_BASE}/api/v1/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ error: data.error || 'Video generation failed' }, { status: res.status });
    }

    return NextResponse.json({
      id: data.id,
      status: data.status,
      topic: data.topic,
      format: data.format,
      message: 'Video generation started. Poll GET /api/agent/video/{id} for status.',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/agent/video — List videos
export async function GET(request: NextRequest) {
  const auth = await validateAgentApiKey(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '20';

  try {
    const res = await fetch(`${VIDEO_API_BASE}/api/v1/videos?limit=${limit}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ error: data.error || 'Failed to list videos' }, { status: res.status });
    }

    const videos = (data.videos || []).map((v: Record<string, unknown>) => ({
      id: v.id,
      topic: v.topic,
      status: v.status,
      isPaid: v.isPaid,
      format: v.format,
      durationSeconds: v.durationSeconds,
      previewUrl: v.previewUrl,
      downloadUrl: v.isPaid ? v.downloadUrl : null,
      createdAt: v.createdAt,
      completedAt: v.completedAt,
    }));

    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
