import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTCUSDT'

  const basePrices: Record<string, number> = {
    BTCUSDT: 67500, ETHUSDT: 3450, SOLUSDT: 178,
    BNBUSDT: 610, XRPUSDT: 0.62, DOGEUSDT: 0.165,
  }
  const base = basePrices[symbol] || 100
  const change = (Math.random() - 0.5) * 0.06
  const lastPrice = base * (1 + change)

  return NextResponse.json({
    symbol,
    lastPrice: parseFloat(lastPrice.toFixed(lastPrice > 1 ? 2 : 6)),
    change24h: parseFloat((change * 100).toFixed(2)),
    high24h: parseFloat((lastPrice * 1.03).toFixed(2)),
    low24h: parseFloat((lastPrice * 0.97).toFixed(2)),
    volume24h: parseFloat((Math.random() * 1000000000).toFixed(0)),
  })
}
