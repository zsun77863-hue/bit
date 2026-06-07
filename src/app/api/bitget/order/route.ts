import { NextResponse } from 'next/server'

/**
 * POST /api/bitget/order
 * 
 * Places an order on Bitget.
 * For simulated mode: returns a mock order response.
 * For real mode: calls Bitget API with proper HMAC-SHA256 signature.
 * 
 * Bitget API: POST /api/v2/mix/order/place-order
 */

async function signRequest(
  timestamp: string,
  method: string,
  requestPath: string,
  body: string,
  secretKey: string
): Promise<string> {
  const message = timestamp + method.toUpperCase() + requestPath + body
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secretKey)
  const msgData = encoder.encode(message)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
  const sigArray = Array.from(new Uint8Array(signature))
  return btoa(String.fromCharCode(...sigArray))
}

export async function POST(request: Request) {
  try {
    const { apiKey, secretKey, passphrase, symbol, side, amount, price, orderType, tradingMode } = await request.json()

    if (!apiKey || !secretKey || !passphrase) {
      return NextResponse.json({ error: 'API credentials required' }, { status: 400 })
    }

    if (tradingMode === 'simulated') {
      return NextResponse.json({
        ok: true,
        data: {
          orderId: `sim_${Date.now()}`,
          symbol,
          side,
          amount,
          price,
          orderType: orderType || 'market',
          status: 'filled',
          timestamp: Date.now(),
          simulated: true,
        },
      })
    }

    // Real order placement
    const method = 'POST'
    const requestPath = '/api/v2/mix/order/place-order'
    const bodyObj = {
      symbol,
      productType: 'USDT-FUTURES',
      marginMode: 'crossed',
      side: side === 'buy' ? 'buy' : 'sell',
      tradeSide: 'open',
      orderType: orderType || 'market',
      size: String(amount),
      ...(orderType === 'limit' && price ? { price: String(price) } : {}),
    }
    const body = JSON.stringify(bodyObj)

    const timestamp = Date.now().toString()
    const sign = await signRequest(timestamp, method, requestPath, body, secretKey)

    const res = await fetch('https://api.bitget.com' + requestPath, {
      method,
      headers: {
        'ACCESS-KEY': apiKey,
        'ACCESS-SIGN': sign,
        'ACCESS-TIMESTAMP': timestamp,
        'ACCESS-PASSPHRASE': passphrase,
        'Content-Type': 'application/json',
        'locale': 'en-US',
      },
      body,
    })

    const data = await res.json()

    if (data.code === '00000') {
      return NextResponse.json({ ok: true, data: data.data })
    }

    const errorMsg = data.msg || 'Failed to place order'
    const isIpError = errorMsg.toLowerCase().includes('ip') || 
                      errorMsg.toLowerCase().includes('whitelist') ||
                      data.code === '40001'

    return NextResponse.json({
      ok: false,
      error: errorMsg,
      isIpError,
      hint: isIpError 
        ? 'IP Whitelist Error: Go to Bitget > API Management > Edit > Add 0.0.0.0/0 to IP Whitelist'
        : undefined,
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Network error',
    }, { status: 500 })
  }
}
