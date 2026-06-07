import { NextResponse } from 'next/server'

const BITGET_BASE = 'https://api.bitget.com'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTCUSDT'
  const granularity = searchParams.get('granularity') || '1h'
  const limit = searchParams.get('limit') || '100'

  try {
    const url = `${BITGET_BASE}/api/v2/market/candles?symbol=${symbol}&granularity=${granularity}&limit=${limit}&productType=USDT-FUTURES`
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 10 },
    })
    const data = await res.json()

    if (data.code === '00000' && Array.isArray(data.data)) {
      // Bitget returns: [[timestamp, open, high, low, close, volume, quoteVolume]]
      const candles = data.data.map((c: string[]) => ({
        timestamp: parseInt(c[0]),
        open: parseFloat(c[1]),
        high: parseFloat(c[2]),
        low: parseFloat(c[3]),
        close: parseFloat(c[4]),
        volume: parseFloat(c[5]),
      }))
      // API returns newest first, we want oldest first for charts
      candles.reverse()
      return NextResponse.json(candles)
    }

    // Try spot as fallback
    const spotUrl = `${BITGET_BASE}/api/v2/market/candles?symbol=${symbol}&granularity=${granularity}&limit=${limit}`
    const spotRes = await fetch(spotUrl, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 10 },
    })
    const spotData = await spotRes.json()

    if (spotData.code === '00000' && Array.isArray(spotData.data)) {
      const candles = spotData.data.map((c: string[]) => ({
        timestamp: parseInt(c[0]),
        open: parseFloat(c[1]),
        high: parseFloat(c[2]),
        low: parseFloat(c[3]),
        close: parseFloat(c[4]),
        volume: parseFloat(c[5]),
      }))
      candles.reverse()
      return NextResponse.json(candles)
    }

    return NextResponse.json({ error: 'No candle data from Bitget API' }, { status: 502 })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch candles',
    }, { status: 500 })
  }
}
