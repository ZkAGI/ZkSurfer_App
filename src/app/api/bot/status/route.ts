import { NextRequest, NextResponse } from 'next/server'

const BASE = process.env.BOT_API_BASE ?? 'http://34.67.134.209:8080'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  try {
    const upstream = await fetch(`${BASE}/api/v1/bot/status?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      cache: 'no-store'
    })

    const text = await upstream.text()
    const contentType = upstream.headers.get('content-type') || ''
    const data = contentType.includes('application/json') ? JSON.parse(text || '{}') : { raw: text }

    return NextResponse.json(data, { status: upstream.status })
  } catch (e: any) {
    console.error('bot/status error', e)
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 })
  }
}
