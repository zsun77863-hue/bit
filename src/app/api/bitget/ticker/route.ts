import { NextResponse } from 'next/server'

/**
 * GET /api/bitget/ticker?symbol=BTCUSDT
 * 
 * Fetches a single ticker from Bitget Public API.
 * No API key required - this is a public endpoint.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'

    const res = await fetch(
      `https://api.bitget.com/api/v2/market/tickers?symbol=${symbol}&productType=USDT-FUTURES`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 3 },
      }
    )

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
    console.error('Ticker proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticker from Bitget', code: 'PROXY_ERROR' },
      { status: 502 }
    )
  }
}
