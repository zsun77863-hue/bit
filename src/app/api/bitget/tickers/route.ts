import { NextResponse } from 'next/server'

/**
 * GET /api/bitget/tickers
 * 
 * Fetches tickers for our target coins from Bitget Spot Public API.
 * No API key required - this is a public endpoint.
 * 
 * Bitget API v2 path: /api/v2/spot/market/tickers?symbol=BTCUSDT
 * We fetch each symbol individually to avoid the huge all-tickers response (~280KB).
 */
const TARGET_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT']

export async function GET() {
  try {
    // Fetch all 6 symbols in parallel using individual requests
    // This is faster than fetching all 859 tickers and filtering
    const results = await Promise.all(
      TARGET_SYMBOLS.map(async (symbol) => {
        try {
          const res = await fetch(`https://api.bitget.com/api/v2/spot/market/tickers?symbol=${symbol}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
          })
          const json = await res.json()
          if (json.code === '00000' && Array.isArray(json.data) && json.data.length > 0) {
            return { symbol, data: json.data[0] }
          }
          return { symbol, data: null }
        } catch {
          return { symbol, data: null }
        }
      })
    )

    // Build the response object
    const tickers: Record<string, {
      symbol: string
      lastPr: string
      high24h: string
      low24h: string
      change24h: string
      changeUtc24h: string
      quoteVolume: string
      usdtVolume: string
      ts: string
    }> = {}

    for (const result of results) {
      if (result.data) {
        const t = result.data
        tickers[result.symbol] = {
          symbol: t.symbol,
          lastPr: t.lastPr || '0',
          high24h: t.high24h || '0',
          low24h: t.low24h || '0',
          change24h: t.change24h || '0',
          changeUtc24h: t.changeUtc24h || '0',
          quoteVolume: t.quoteVolume || '0',
          usdtVolume: t.usdtVolume || '0',
          ts: t.ts || '0',
        }
      }
    }

    return NextResponse.json({ data: tickers, timestamp: Date.now() })
  } catch (error) {
    console.error('Tickers proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickers from Bitget', code: 'PROXY_ERROR' },
      { status: 502 }
    )
  }
}
