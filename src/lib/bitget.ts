import type { TickerData, PriceData, CoinSymbol } from '@/types'

// ============ PUBLIC API (No Auth Required) ============

/**
 * Fetch real-time ticker from Bitget public API
 * Endpoint: GET /api/v2/market/tickers
 */
export async function fetchTickerData(symbol: string): Promise<TickerData> {
  try {
    const response = await fetch(`/api/bitget/ticker?symbol=${symbol}`)
    if (response.ok) {
      const data = await response.json()
      if (data && data.lastPrice) return data
    }
  } catch {
    // fallback
  }
  return generateMockTicker(symbol)
}

/**
 * Fetch all tickers at once for the ticker bar
 */
export async function fetchAllTickers(): Promise<Record<string, TickerData>> {
  try {
    const response = await fetch('/api/bitget/tickers')
    if (response.ok) {
      const data = await response.json()
      if (data && typeof data === 'object') return data
    }
  } catch {
    // fallback
  }
  // Generate mock for all coins
  const result: Record<string, TickerData> = {}
  const coins: CoinSymbol[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT']
  for (const coin of coins) {
    result[coin] = generateMockTicker(coin)
  }
  return result
}

/**
 * Fetch candlestick data from Bitget public API
 * Endpoint: GET /api/v2/market/candles
 */
export async function fetchPriceHistory(
  symbol: string,
  granularity: string = '1h',
  limit: number = 100
): Promise<PriceData[]> {
  try {
    const response = await fetch(
      `/api/bitget/candles?symbol=${symbol}&granularity=${granularity}&limit=${limit}`
    )
    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch {
    // fallback
  }
  return generateMockPriceHistory(symbol, limit)
}

// ============ AUTHENTICATED API (Requires API Keys) ============

export interface AccountBalance {
  coin: string
  available: string
  frozen: string
  total: string
  usdtValue: string
}

export interface PositionData {
  symbol: string
  side: string
  size: string
  avgPrice: string
  markPrice: string
  unrealizedPL: string
  leverage: string
  margin: string
}

/**
 * Fetch account balance via server-side API proxy
 */
export async function fetchAccountBalance(): Promise<{
  ok: boolean
  data: AccountBalance[]
  error?: string
}> {
  try {
    const response = await fetch('/api/bitget/balance')
    if (response.ok) {
      return await response.json()
    }
    return { ok: false, data: [], error: 'Failed to fetch balance' }
  } catch (error) {
    return {
      ok: false,
      data: [],
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Fetch positions via server-side API proxy
 */
export async function fetchPositions(): Promise<{
  ok: boolean
  data: PositionData[]
  error?: string
}> {
  try {
    const response = await fetch('/api/bitget/positions')
    if (response.ok) {
      return await response.json()
    }
    return { ok: false, data: [], error: 'Failed to fetch positions' }
  } catch (error) {
    return {
      ok: false,
      data: [],
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Place order via server-side API proxy
 */
export async function placeOrder(params: {
  symbol: string
  side: 'buy' | 'sell'
  amount: number
  price: number
  orderType: 'market' | 'limit'
}): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  try {
    const response = await fetch('/api/bitget/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    if (response.ok) {
      return await response.json()
    }
    return { ok: false, error: 'Failed to place order' }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// ============ MOCK DATA GENERATORS ============

function generateMockTicker(symbol: string): TickerData {
  const basePrices: Record<string, number> = {
    BTCUSDT: 67500, ETHUSDT: 3450, SOLUSDT: 178,
    BNBUSDT: 610, XRPUSDT: 0.62, DOGEUSDT: 0.165,
  }
  const base = basePrices[symbol] || 100
  const change = (Math.random() - 0.5) * 0.06
  const lastPrice = base * (1 + change)
  return {
    symbol,
    lastPrice: parseFloat(lastPrice.toFixed(lastPrice > 1 ? 2 : 6)),
    change24h: parseFloat((change * 100).toFixed(2)),
    high24h: parseFloat((lastPrice * 1.03).toFixed(2)),
    low24h: parseFloat((lastPrice * 0.97).toFixed(2)),
    volume24h: parseFloat((Math.random() * 1000000000).toFixed(0)),
  }
}

function generateMockPriceHistory(symbol: string, limit: number): PriceData[] {
  const basePrices: Record<string, number> = {
    BTCUSDT: 67500, ETHUSDT: 3450, SOLUSDT: 178,
    BNBUSDT: 610, XRPUSDT: 0.62, DOGEUSDT: 0.165,
  }
  const base = basePrices[symbol] || 100
  const now = Date.now()
  const data: PriceData[] = []
  let price = base

  for (let i = limit; i > 0; i--) {
    const change = (Math.random() - 0.48) * base * 0.02
    price += change
    const high = price * (1 + Math.random() * 0.01)
    const low = price * (1 - Math.random() * 0.01)
    data.push({
      timestamp: now - i * 3600000,
      open: parseFloat((price - change).toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume: parseFloat((Math.random() * 10000000).toFixed(0)),
    })
  }
  return data
}

// ============ COIN LIST ============

export const COIN_LIST: { symbol: CoinSymbol; name: string; icon: string }[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: '◆' },
  { symbol: 'XRPUSDT', name: 'XRP', icon: '✕' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'Ð' },
]

export const CHART_INTERVALS = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '1h', label: '1H' },
  { value: '4h', label: '4H' },
  { value: '1day', label: '1D' },
] as const

export type ChartInterval = (typeof CHART_INTERVALS)[number]['value']
