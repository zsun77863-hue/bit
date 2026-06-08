import { NextResponse } from 'next/server'

/**
 * GET /api/bitget/balance?apiKey=...&secretKey=...&passphrase=...
 * 
 * Fetches account balance from Bitget Private API.
 * Requires: API Key, Secret Key, Passphrase
 * 
 * IMPORTANT: User must add their IP to Bitget API Key whitelist.
 * Recommended: Add 0.0.0.0/0 (allow all) for testing.
 * 
 * Bitget API: GET /api/v2/mix/account/accounts
 * Signature: HMAC-SHA256(timestamp + "GET" + requestPath + "", secretKey)
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get('apiKey')
    const secretKey = searchParams.get('secretKey')
    const passphrase = searchParams.get('passphrase')

    if (!apiKey || !secretKey || !passphrase) {
      return NextResponse.json(
        { 
          error: 'API Key, Secret Key, and Passphrase are required',
          isIpError: false,
          hint: 'Please configure your Bitget API credentials in Settings.',
        },
        { status: 400 }
      )
    }

    const requestPath = '/api/v2/mix/account/accounts'
    const method = 'GET'
    const body = ''
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
    })

    const json = await res.json()

    if (json.code === '00000' && Array.isArray(json.data)) {
      return NextResponse.json({ data: json.data, timestamp: Date.now() })
    }

    // Check for IP whitelist error
    const errorMsg = json.msg || 'Unknown error'
    const isIpError = errorMsg.toLowerCase().includes('ip') || 
                      errorMsg.toLowerCase().includes('whitelist') ||
                      errorMsg.toLowerCase().includes('access') ||
                      json.code === '40001'

    return NextResponse.json(
      { 
        error: errorMsg, 
        code: json.code,
        isIpError,
        hint: isIpError 
          ? 'IP Whitelist Error: Go to Bitget > API Management > Edit > Add 0.0.0.0/0 to IP Whitelist'
          : 'API request failed. Please check your credentials.',
      },
      { status: 401 }
    )
  } catch (error) {
    console.error('Balance proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balance from Bitget', code: 'PROXY_ERROR' },
      { status: 502 }
    )
  }
}
