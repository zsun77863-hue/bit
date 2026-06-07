import { NextResponse } from 'next/server'

/**
 * GET /api/bitget/candles?symbol=BTCUSDT&granularity=1h&limit=100
 * 
 * Fetches K-line / candlestick data from Bitget Public API.
 * No API key required - this is a public endpoint.
 * 
 * Granularity options: 1min, 5min, 15min, 30min, 1h, 4h, 12h, 1day, 1week
 * Max limit: 1000
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol') || 'BTCUSDT'
    const granularity = searchParams.get('granularity') || '1h'
    const limit = searchParams.get('limit') || '100'

    // Validate granularity
    const validGranularities = ['1min', '5min', '15min', '30min', '1h', '4h', '12h', '1day', '1week']
    if (!validGranularities.includes(granularity)) {
      return NextResponse.json(
        { error: `Invalid granularity. Must be one of: ${validGranularities.join(', ')}` },
        { status: 400 }
      )
    }

    const url = `https://api.bitget.com/api/v2/market/candles?symbol=${symbol}&granularity=${granularity}&limit=${limit}`

    const res = await fetch(url, {
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

    // Bitget returns candles as arrays: [ts, open, high, low, close, quoteVol, baseVol, usdtVol]
    // Transform to objects for easier frontend consumption
    const candles = Array.isArray(json.data) 
      ? json.data.map((c: string[]) => ({
          ts: c[0],
          open: c[1],
          high: c[2],
          low: c[3],
          close: c[4],
          quoteVol: c[5],
          baseVol: c[6],
          usdtVol: c[7],
        }))
      : []

    return NextResponse.json({ data: candles, timestamp: Date.now() })
  } catch (error) {
    console.error('Candles proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch candles from Bitget', code: 'PROXY_ERROR' },
      { status: 502 }
    )
  }
}
