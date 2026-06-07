import { NextResponse } from 'next/server'

const BITGET_BASE = 'https://api.bitget.com'

/**
 * Public API: Get all tickers at once
 * No authentication required - this is a public market data endpoint
 * Endpoint: GET /api/v2/market/tickers
 */
export async function GET() {
  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT']
  const result: Record<string, unknown> = {}

  try {
    // Fetch all futures tickers at once (single API call)
    const futuresRes = await fetch(`${BITGET_BASE}/api/v2/market/tickers?productType=USDT-FUTURES`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    const futuresData = await futuresRes.json()

    if (futuresData.code === '00000' && Array.isArray(futuresData.data)) {
      for (const t of futuresData.data) {
        if (symbols.includes(t.symbol)) {
          result[t.symbol] = {
            symbol: t.symbol,
            lastPrice: parseFloat(t.lastPr || t.last || '0'),
            change24h: parseFloat(t.change24h || t.priceChangePercent || '0'),
            high24h: parseFloat(t.high24h || t.high || '0'),
            low24h: parseFloat(t.low24h || t.low || '0'),
            volume24h: parseFloat(t.usdtVolume24h || t.quoteVolume24h || t.volume || '0'),
          }
        }
      }
    }

    // Fill missing from spot
    const missing = symbols.filter(s => !result[s])
    if (missing.length > 0) {
      const spotRes = await fetch(`${BITGET_BASE}/api/v2/market/tickers?productType=SPOT`, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })
      const spotData = await spotRes.json()
      if (spotData.code === '00000' && Array.isArray(spotData.data)) {
        for (const t of spotData.data) {
          if (missing.includes(t.symbol)) {
            result[t.symbol] = {
              symbol: t.symbol,
              lastPrice: parseFloat(t.lastPr || t.last || '0'),
              change24h: parseFloat(t.change24h || t.priceChangePercent || '0'),
              high24h: parseFloat(t.high24h || t.high || '0'),
              low24h: parseFloat(t.low24h || t.low || '0'),
              volume24h: parseFloat(t.usdtVolume24h || t.quoteVolume24h || t.volume || '0'),
            }
          }
        }
      }
    }

    // If we got at least some data, return it
    if (Object.keys(result).length > 0) {
      return NextResponse.json(result)
    }

    return NextResponse.json({
      error: 'No ticker data from Bitget API',
      futuresMsg: futuresData.msg,
    }, { status: 502 })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch tickers',
    }, { status: 500 })
  }
}
