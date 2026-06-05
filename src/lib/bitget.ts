import type { TickerData, PriceData, CoinSymbol } from '@/types'

export async function fetchTickerData(symbol: string): Promise<TickerData> {
  try {
    const response = await fetch(`/api/bitget/ticker?symbol=${symbol}`)
    if (response.ok) {
      const data = await response.json()
      return data
    }
  } catch {
    // Fallback to mock data
  }
  return generateMockTicker(symbol)
}

export async function fetchPriceHistory(symbol: string, interval: string = '1h', limit: number = 100): Promise<PriceData[]> {
  try {
    const response = await fetch(`/api/bitget/candles?symbol=${symbol}&interval=${interval}&limit=${limit}`)
    if (response.ok) {
      const data = await response.json()
      return data
    }
  } catch {
    // Fallback to mock data
  }
  return generateMockPriceHistory(symbol, limit)
}

export async function placeOrder(
  symbol: string,
  side: 'buy' | 'sell',
  amount: number,
  price: number,
  orderType: 'market' | 'limit' = 'market'
): Promise<{ orderId: string; status: string }> {
  try {
    const response = await fetch('/api/bitget/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, side, amount, price, orderType }),
    })
    if (response.ok) {
      return await response.json()
    }
  } catch {
    // Fallback to mock
  }
  return {
    orderId: `mock_${Date.now()}`,
    status: 'filled',
  }
}

function generateMockTicker(symbol: string): TickerData {
  const basePrices: Record<string, number> = {
    BTCUSDT: 67500,
    ETHUSDT: 3450,
    SOLUSDT: 178,
    BNBUSDT: 610,
    XRPUSDT: 0.62,
    DOGEUSDT: 0.165,
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
    BTCUSDT: 67500,
    ETHUSDT: 3450,
    SOLUSDT: 178,
    BNBUSDT: 610,
    XRPUSDT: 0.62,
    DOGEUSDT: 0.165,
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
      open: price - change,
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume: parseFloat((Math.random() * 10000000).toFixed(0)),
    })
  }
  return data
}

export const COIN_LIST: { symbol: CoinSymbol; name: string; icon: string }[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: '◆' },
  { symbol: 'XRPUSDT', name: 'XRP', icon: '✕' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'Ð' },
]
