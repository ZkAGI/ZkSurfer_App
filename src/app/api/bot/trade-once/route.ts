import { NextRequest, NextResponse } from 'next/server'

const BASE = process.env.BOT_API_BASE ?? 'http://34.67.134.209:8080'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const upstream = await fetch(`${BASE}/api/v1/bot/trade-once`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
      cache: 'no-store',
    })

    const text = await upstream.text()
    const isJSON = (upstream.headers.get('content-type') || '').includes('application/json')
    const data = isJSON && text ? JSON.parse(text) : { raw: text }

    return NextResponse.json(data, { status: upstream.status })
  } catch (e) {
    console.error('bot/trade-once error', e)
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 })
  }
}
