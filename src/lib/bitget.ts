/**
 * Bitget API Client
 * 
 * Public API (no auth needed):
 * - GET /api/v2/market/tickers - All tickers
 * - GET /api/v2/market/candles - K-line data
 * 
 * Private API (auth required):
 * - GET /api/v2/mix/account/accounts - Account balance
 * - GET /api/v2/mix/position/all-position - Open positions
 * - POST /api/v2/mix/order/place-order - Place order
 * 
 * Reference: https://www.bitget.com/api-doc
 * Reference: https://github.com/Bitget-AI/agent_hub
 */

// ============ TYPES ============

// Types are imported from @/types
// TickerData, PriceData, AccountBalance, PositionData are defined in src/types/index.ts

export interface CandleData {
  ts: string
  open: string
  high: string
  low: string
  close: string
  quoteVol: string
  baseVol: string
  usdtVol: string
}

export const COIN_LIST = [
  { symbol: 'BTCUSDT' as const, name: 'BTC', icon: '₿' },
  { symbol: 'ETHUSDT' as const, name: 'ETH', icon: 'Ξ' },
  { symbol: 'SOLUSDT' as const, name: 'SOL', icon: '◎' },
  { symbol: 'BNBUSDT' as const, name: 'BNB', icon: '◆' },
  { symbol: 'XRPUSDT' as const, name: 'XRP', icon: '✕' },
  { symbol: 'DOGEUSDT' as const, name: 'DOGE', icon: 'Ð' },
]

export const CHART_INTERVALS = [
  { value: '1min', label: '1m' },
  { value: '5min', label: '5m' },
  { value: '15min', label: '15m' },
  { value: '30min', label: '30m' },
  { value: '1h', label: '1H' },
  { value: '4h', label: '4H' },
  { value: '1day', label: '1D' },
  { value: '1week', label: '1W' },
]

// ============ PUBLIC API FUNCTIONS ============

/**
 * Fetch all USDT-FUTURES tickers from our proxy
 * Maps Bitget response to our TickerData format
 */
export async function fetchAllTickers(): Promise<Record<string, import('@/types').TickerData>> {
  try {
    const res = await fetch('/api/bitget/tickers')
    const json = await res.json()

    if (!json.data || typeof json.data !== 'object') {
      console.warn('fetchAllTickers: no data object in response', json)
      return {}
    }

    // Our proxy returns { data: { BTCUSDT: {...}, ETHUSDT: {...}, ... } }
    const result: Record<string, import('@/types').TickerData> = {}
    for (const [symbol, t] of Object.entries(json.data)) {
      const ticker = t as Record<string, string>
      result[symbol] = {
        symbol,
        lastPrice: parseFloat(ticker.lastPr || '0'),
        high24h: parseFloat(ticker.high24h || '0'),
        low24h: parseFloat(ticker.low24h || '0'),
        change24h: parseFloat(ticker.changeUtc24h || ticker.change24h || '0'),
        volume24h: parseFloat(ticker.usdtVolume || ticker.quoteVolume || '0'),
      }
    }
    return result
  } catch (error) {
    console.error('fetchAllTickers error:', error)
    return {}
  }
}

/**
 * Fetch K-line / candlestick data from our proxy
 * Maps Bitget response to our PriceData format
 */
export async function fetchPriceHistory(
  symbol: string = 'BTCUSDT',
  granularity: string = '1h',
  limit: number = 100
): Promise<import('@/types').PriceData[]> {
  try {
    const res = await fetch(
      `/api/bitget/candles?symbol=${symbol}&granularity=${granularity}&limit=${limit}`
    )
    const json = await res.json()

    if (!json.data || !Array.isArray(json.data)) {
      console.warn('fetchPriceHistory: no data array in response')
      return []
    }

    // Our proxy transforms arrays to objects with named fields
    // Candle fields: ts, open, high, low, close, baseVol, quoteVol, usdtVol
    return json.data.map((c: { ts: string; open: string; high: string; low: string; close: string; quoteVol?: string; baseVol?: string; usdtVol?: string }) => ({
      timestamp: parseInt(c.ts),
      open: parseFloat(c.open),
      high: parseFloat(c.high),
      low: parseFloat(c.low),
      close: parseFloat(c.close),
      volume: parseFloat(c.usdtVol || c.quoteVol || c.baseVol || '0'),
    }))
  } catch (error) {
    console.error('fetchPriceHistory error:', error)
    return []
  }
}

// ============ PRIVATE API FUNCTIONS ============

/**
 * Fetch account balance from our proxy (GET with query params)
 */
export async function fetchAccountBalance(
  apiKey: string,
  secretKey: string,
  passphrase: string
): Promise<{ data?: import('@/types').AccountBalance[]; error?: string; isIpError?: boolean }> {
  try {
    const res = await fetch(
      `/api/bitget/balance?apiKey=${encodeURIComponent(apiKey)}&secretKey=${encodeURIComponent(secretKey)}&passphrase=${encodeURIComponent(passphrase)}`
    )
    const json = await res.json()

    if (json.data && Array.isArray(json.data)) {
      // Map Bitget account data to our format
      const balances: import('@/types').AccountBalance[] = json.data.map((a: Record<string, string>) => ({
        marginCoin: a.marginCoin || 'USDT',
        coin: a.marginCoin || 'USDT',
        available: a.available || '0',
        frozen: a.frozen || '0',
        total: a.equity || a.total || '0',
        usdtValue: a.equity || '0',
        equity: a.equity || '0',
      }))
      return { data: balances }
    }

    return {
      error: json.error || json.hint || 'Unknown error',
      isIpError: json.isIpError || false,
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      isIpError: false,
    }
  }
}

/**
 * Fetch open positions from our proxy (GET with query params)
 */
export async function fetchAccountPositions(
  apiKey: string,
  secretKey: string,
  passphrase: string
): Promise<{ data?: import('@/types').PositionData[]; error?: string; isIpError?: boolean }> {
  try {
    const res = await fetch(
      `/api/bitget/positions?apiKey=${encodeURIComponent(apiKey)}&secretKey=${encodeURIComponent(secretKey)}&passphrase=${encodeURIComponent(passphrase)}`
    )
    const json = await res.json()

    if (json.data && Array.isArray(json.data)) {
      // Map Bitget position data to our format
      const positions: import('@/types').PositionData[] = json.data.map((p: Record<string, string>) => ({
        symbol: p.symbol || '',
        holdSide: p.holdSide || '',
        side: p.holdSide || p.side || '',
        total: p.total || p.size || '0',
        size: p.size || p.total || '0',
        averageOpenPrice: p.averageOpenPrice || '0',
        avgPrice: p.averageOpenPrice || p.avgPrice || '0',
        markPrice: p.markPrice || '0',
        unrealizedPL: p.unrealizedPL || '0',
      }))
      return { data: positions }
    }

    return {
      error: json.error || json.hint || 'Unknown error',
      isIpError: json.isIpError || false,
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      isIpError: false,
    }
  }
}

/**
 * Place order via our proxy
 */
export async function placeOrder(params: {
  symbol: string
  side: string
  amount: number
  price: number
  orderType: string
}): Promise<{ ok: boolean; data?: Record<string, string>; error?: string }> {
  try {
    // Get credentials from localStorage via store
    const configStr = localStorage.getItem('bitget-config')
    const config = configStr ? JSON.parse(configStr) : {}
    
    const res = await fetch('/api/bitget/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        apiKey: config.apiKey,
        secretKey: config.secretKey,
        passphrase: config.passphrase,
        tradingMode: config.tradingMode || 'simulated',
      }),
    })
    return await res.json()
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}
