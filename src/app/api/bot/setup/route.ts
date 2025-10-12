import { NextRequest, NextResponse } from 'next/server'

const BASE = process.env.BOT_API_BASE ?? 'http://34.67.134.209:8080' // note: no extra colon

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    // basic shape guard
    const required = ['userId','HL_MAIN_PK','HL_MAIN_ADDR','HL_API_PK','HL_API_ADDR','CAPITAL_USAGE','MAX_LEVERAGE','MIN_NOTIONAL','enable']
    for (const k of required) {
      if (!(k in payload)) return NextResponse.json({ error: `Missing ${k}` }, { status: 400 })
    }

    const upstream = await fetch(`${BASE}/api/v1/bot/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // keep it server-side only
      cache: 'no-store'
    })

    const text = await upstream.text()
    const contentType = upstream.headers.get('content-type') || ''
    const data = contentType.includes('application/json') ? JSON.parse(text || '{}') : { raw: text }

    return NextResponse.json(data, { status: upstream.status })
  } catch (e: any) {
    console.error('bot/setup error', e)
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 })
  }
}
