import { NextResponse } from 'next/server'
import crypto from 'crypto'

const BITGET_BASE = 'https://api.bitget.com'

function signRequest(timestamp: string, method: string, path: string, body: string, secretKey: string): string {
  const preHash = timestamp + method.toUpperCase() + path + body
  return crypto.createHmac('sha256', secretKey).update(preHash).digest('base64')
}

export async function POST(request: Request) {
  try {
    const { apiKey, secretKey, passphrase } = await request.json()

    if (!apiKey || !secretKey || !passphrase) {
      return NextResponse.json({ error: 'API credentials required' }, { status: 400 })
    }

    const method = 'GET'
    const requestPath = '/api/v2/mix/position/all-position?productType=USDT-FUTURES'
    const timestamp = Date.now().toString()
    const sign = signRequest(timestamp, method, requestPath, '', secretKey)

    const res = await fetch(`${BITGET_BASE}${requestPath}`, {
      method,
      headers: {
        'ACCESS-KEY': apiKey,
        'ACCESS-SIGN': sign,
        'ACCESS-TIMESTAMP': timestamp,
        'ACCESS-PASSPHRASE': passphrase,
        'Content-Type': 'application/json',
      },
    })

    const data = await res.json()

    if (data.code === '00000') {
      return NextResponse.json({ data: data.data, ok: true })
    }

    return NextResponse.json({
      data: null,
      ok: false,
      error: data.msg || 'Failed to fetch positions',
    })
  } catch (error) {
    return NextResponse.json({
      data: null,
      ok: false,
      error: error instanceof Error ? error.message : 'Network error',
    }, { status: 500 })
  }
}
