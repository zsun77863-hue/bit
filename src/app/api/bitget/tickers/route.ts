import { NextResponse } from 'next/server'

/**
 * GET /api/bitget/tickers
 * 
 * Fetches all USDT-FUTURES tickers from Bitget Public API.
 * No API key required - this is a public endpoint.
 * 
 * Proxied through our server to avoid CORS issues.
 */
export async function GET() {
  try {
    const res = await fetch('https://api.bitget.com/api/v2/market/tickers?productType=USDT-FUTURES', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 5 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Bitget API returned ${res.status}`, code: res.status },
        { status: res.status }
      )
    }

    const json = await res.json()

    if (json.code !== '00000') {
      return NextResponse.json(
        { error: json.msg || 'Bitget API error', code: json.code },
        { status: 502 }
      )
    }

    return NextResponse.json({ data: json.data, timestamp: Date.now() })
  } catch (error) {
    console.error('Tickers proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickers from Bitget', code: 'PROXY_ERROR' },
      { status: 502 }
    )
  }
}
