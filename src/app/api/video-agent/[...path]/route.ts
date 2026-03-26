import { NextRequest, NextResponse } from 'next/server';

const VIDEO_API_BASE = 'https://content-agent-video.zkagi.ai';

export async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = path.join('/');
  const targetUrl = `${VIDEO_API_BASE}/api/v1/${targetPath}`;

  // Forward query params
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

  // Build headers to forward (auth, content-type)
  const headers: Record<string, string> = {};
  const authHeader = request.headers.get('authorization');
  if (authHeader) headers['Authorization'] = authHeader;

  const contentType = request.headers.get('content-type');
  if (contentType) headers['Content-Type'] = contentType;

  try {
    let body: BodyInit | null = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      // For multipart/form-data, forward as-is (don't set content-type, let fetch handle boundary)
      if (contentType?.includes('multipart/form-data')) {
        body = await request.arrayBuffer();
        // Keep the original content-type with boundary
      } else {
        body = await request.text();
      }
    }

    const response = await fetch(fullUrl, {
      method: request.method,
      headers,
      body,
    });

    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error(`[video-agent proxy] Error forwarding to ${fullUrl}:`, error);
    return NextResponse.json(
      { error: 'Failed to reach video service' },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
