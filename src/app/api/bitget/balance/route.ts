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
      return NextResponse.json({ error: 'API credentials required (API Key, Secret Key, Passphrase)' }, { status: 400 })
    }

    const method = 'GET'
    const requestPath = '/api/v2/mix/account/accounts?productType=USDT-FUTURES'
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
        'X-CHANNEL-API-CODE': 'bitget_trading_agent',
      },
    })

    const data = await res.json()

    if (data.code === '00000') {
      return NextResponse.json({ data: data.data, ok: true })
    }

    // Detect specific error types
    const errorMsg = data.msg || 'Failed to fetch account balance'
    const errorCode = data.code || ''

    // IP whitelist error
    if (String(errorMsg).includes('Invalid IP') || errorCode === '40001') {
      return NextResponse.json({
        data: null,
        ok: false,
        error: `Invalid IP (${extractIp(errorMsg)}). You need to add this IP or "0.0.0.0/0" to your Bitget API Key IP whitelist. Go to: Bitget > API Management > Edit > IP Whitelist`,
        errorType: 'IP_WHITELIST',
      })
    }

    // Authentication error
    if (errorCode === '40002' || String(errorMsg).includes('Invalid')) {
      return NextResponse.json({
        data: null,
        ok: false,
        error: `Authentication failed: ${errorMsg}. Please check your API Key, Secret Key, and Passphrase.`,
        errorType: 'AUTH',
      })
    }

    return NextResponse.json({
      data: null,
      ok: false,
      error: errorMsg,
      errorType: 'API_ERROR',
    })
  } catch (error) {
    return NextResponse.json({
      data: null,
      ok: false,
      error: error instanceof Error ? error.message : 'Network error',
      errorType: 'NETWORK',
    }, { status: 500 })
  }
}

function extractIp(msg: string): string {
  const match = msg.match(/(\d+\.\d+\.\d+\.\d+)/)
  return match ? match[1] : 'unknown'
}
