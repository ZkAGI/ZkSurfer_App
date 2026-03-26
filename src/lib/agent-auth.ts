import { NextRequest, NextResponse } from 'next/server';

const VIDEO_API_BASE = 'https://content-agent-video.zkagi.ai';

// Validate API key and return the agent's access token from the video backend
export async function validateAgentApiKey(request: NextRequest): Promise<
  { ok: true; token: string; walletAddress: string } | { ok: false; response: NextResponse }
> {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Missing x-api-key header' },
        { status: 401 }
      ),
    };
  }

  try {
    // Exchange API key for an access token from the video backend
    const res = await fetch(`${VIDEO_API_BASE}/api/v1/auth/api-key-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });

    if (!res.ok) {
      // Fallback: validate against our own stored keys
      const fallback = await validateLocalApiKey(apiKey);
      if (!fallback) {
        return {
          ok: false,
          response: NextResponse.json({ error: 'Invalid API key' }, { status: 401 }),
        };
      }
      return { ok: true, token: fallback.token, walletAddress: fallback.walletAddress };
    }

    const data = await res.json();
    return { ok: true, token: data.accessToken, walletAddress: data.walletAddress };
  } catch {
    // If backend is unreachable, try local validation
    const fallback = await validateLocalApiKey(apiKey);
    if (!fallback) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 }),
      };
    }
    return { ok: true, token: fallback.token, walletAddress: fallback.walletAddress };
  }
}

// Local API key validation (keys stored in env as comma-separated KEY:WALLET pairs)
// Format: AGENT_API_KEYS="sk_agent_abc123:WalletAddr1,sk_agent_def456:WalletAddr2"
async function validateLocalApiKey(apiKey: string): Promise<{ token: string; walletAddress: string } | null> {
  const keys = process.env.AGENT_API_KEYS || '';
  const pairs = keys.split(',').filter(Boolean);

  for (const pair of pairs) {
    const [key, walletAddress] = pair.split(':');
    if (key === apiKey && walletAddress) {
      // Authenticate with the video backend using the wallet address
      try {
        const res = await fetch(`${VIDEO_API_BASE}/api/v1/auth/service-auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-service-key': process.env.VIDEO_SERVICE_KEY || '',
          },
          body: JSON.stringify({ walletAddress }),
        });
        if (res.ok) {
          const data = await res.json();
          return { token: data.accessToken, walletAddress };
        }
      } catch { /* fall through */ }

      // Return wallet address even without token - endpoints will handle gracefully
      return { token: '', walletAddress };
    }
  }

  return null;
}

export { VIDEO_API_BASE };
