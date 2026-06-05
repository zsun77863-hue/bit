import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTCUSDT'
  const limit = parseInt(searchParams.get('limit') || '100')

  const basePrices: Record<string, number> = {
    BTCUSDT: 67500, ETHUSDT: 3450, SOLUSDT: 178,
    BNBUSDT: 610, XRPUSDT: 0.62, DOGEUSDT: 0.165,
  }
  const base = basePrices[symbol] || 100
  const now = Date.now()
  const data = []
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

  return NextResponse.json(data)
}
