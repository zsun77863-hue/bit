import { NextResponse } from 'next/server'

const BITGET_BASE = 'https://api.bitget.com'

/**
 * Public API: Get ticker data for a single symbol
 * No authentication required - this is a public market data endpoint
 * Endpoint: GET /api/v2/market/tickers
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTCUSDT'

  try {
    // Try USDT-FUTURES first
    const futuresRes = await fetch(`${BITGET_BASE}/api/v2/market/tickers?productType=USDT-FUTURES&symbol=${symbol}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    const futuresData = await futuresRes.json()

    if (futuresData.code === '00000' && futuresData.data && futuresData.data.length > 0) {
      const t = futuresData.data[0]
      return NextResponse.json({
        symbol: t.symbol || symbol,
        lastPrice: parseFloat(t.lastPr || t.last || '0'),
        change24h: parseFloat(t.change24h || t.priceChangePercent || '0'),
        high24h: parseFloat(t.high24h || t.high || '0'),
        low24h: parseFloat(t.low24h || t.low || '0'),
        volume24h: parseFloat(t.usdtVolume24h || t.quoteVolume24h || t.volume || '0'),
      })
    }

    // Fallback to SPOT
    const spotRes = await fetch(`${BITGET_BASE}/api/v2/market/tickers?productType=SPOT&symbol=${symbol}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    const spotData = await spotRes.json()

    if (spotData.code === '00000' && spotData.data && spotData.data.length > 0) {
      const t = spotData.data[0]
      return NextResponse.json({
        symbol: t.symbol || symbol,
        lastPrice: parseFloat(t.lastPr || t.last || '0'),
        change24h: parseFloat(t.change24h || t.priceChangePercent || '0'),
        high24h: parseFloat(t.high24h || t.high || '0'),
        low24h: parseFloat(t.low24h || t.low || '0'),
        volume24h: parseFloat(t.usdtVolume24h || t.quoteVolume24h || t.volume || '0'),
      })
    }

    return NextResponse.json({
      error: `No ticker data. Futures: ${futuresData.msg || 'no data'}, Spot: ${spotData.msg || 'no data'}`,
      symbol,
    }, { status: 502 })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch ticker',
      symbol,
    }, { status: 500 })
  }
}
