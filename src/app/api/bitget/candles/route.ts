import { NextResponse } from 'next/server'

const BITGET_BASE = 'https://api.bitget.com'

/**
 * Public API: Get candlestick/K-line data
 * No authentication required - this is a public market data endpoint
 * Endpoint: GET /api/v2/market/candles
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTCUSDT'
  const granularity = searchParams.get('granularity') || '1h'
  const limit = searchParams.get('limit') || '100'

  try {
    // Try USDT-FUTURES first (more liquid)
    const futuresUrl = `${BITGET_BASE}/api/v2/market/candles?symbol=${symbol}&granularity=${granularity}&limit=${limit}&productType=USDT-FUTURES`
    const futuresRes = await fetch(futuresUrl, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    const futuresData = await futuresRes.json()

    if (futuresData.code === '00000' && Array.isArray(futuresData.data) && futuresData.data.length > 0) {
      const candles = futuresData.data.map((c: string[]) => ({
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

    // Fallback to SPOT
    const spotUrl = `${BITGET_BASE}/api/v2/market/candles?symbol=${symbol}&granularity=${granularity}&limit=${limit}`
    const spotRes = await fetch(spotUrl, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    const spotData = await spotRes.json()

    if (spotData.code === '00000' && Array.isArray(spotData.data) && spotData.data.length > 0) {
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

    // Both failed - return error with details
    return NextResponse.json({
      error: `No candle data from Bitget API. Futures: ${futuresData.msg || 'ok'}, Spot: ${spotData.msg || 'ok'}`,
      futuresCode: futuresData.code,
      spotCode: spotData.code,
    }, { status: 502 })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch candles',
    }, { status: 500 })
  }
}
