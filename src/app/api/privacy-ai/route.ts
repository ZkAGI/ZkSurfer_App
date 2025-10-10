import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const payload = await req.json();

  // (Optional) basic validation
  // if (!payload?.query || !payload?.proof_json) {
  //   return NextResponse.json({ error: 'Missing query or proof_json' }, { status: 400 });
  // }

  try {
    // Forward to your backend
    const upstream = await fetch(process.env.PRIVACY_AI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const bodyText = await upstream.text();
      return NextResponse.json(
        { error: 'Upstream error', status: upstream.status, body: bodyText },
        { status: 502 }
      );
    }

    const data = await upstream.json(); // { answers: string[], sources: any[] }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
