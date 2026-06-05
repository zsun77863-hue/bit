import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { symbol, side, amount, price, orderType } = body

  // In production, this would call Bitget API with proper authentication
  // For demo, return simulated order response
  return NextResponse.json({
    orderId: `order_${Date.now()}`,
    symbol,
    side,
    amount,
    price,
    orderType: orderType || 'market',
    status: 'filled',
    timestamp: Date.now(),
    message: 'Order placed successfully (simulated)',
  })
}
