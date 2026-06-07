import crypto from 'crypto'

/**
 * Bitget API Signature Generator
 * Reference: https://www.bitget.com/api-doc/common/intro
 * 
 * Signature logic:
 * 1. Construct pre-hash string: timestamp + method.toUpperCase() + requestPath + body
 * 2. Sign with HMAC SHA256 using secretKey
 * 3. Base64 encode the result
 */
export function signBitgetRequest(
  timestamp: string,
  method: string,
  requestPath: string,
  body: string,
  secretKey: string
): string {
  const preHash = timestamp + method.toUpperCase() + requestPath + body
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(preHash)
    .digest('base64')
  return signature
}

/**
 * Build authenticated headers for Bitget API requests
 */
export function buildBitgetHeaders(
  apiKey: string,
  secretKey: string,
  passphrase: string,
  method: string,
  requestPath: string,
  body: string = ''
): Record<string, string> {
  const timestamp = Date.now().toString()
  const sign = signBitgetRequest(timestamp, method, requestPath, body, secretKey)

  return {
    'ACCESS-KEY': apiKey,
    'ACCESS-SIGN': sign,
    'ACCESS-TIMESTAMP': timestamp,
    'ACCESS-PASSPHRASE': passphrase,
    'Content-Type': 'application/json',
    'X-CHANNEL-API-CODE': 'bitget_trading_agent',
  }
}

/**
 * Server-side Bitget API call with proper authentication
 */
export async function bitgetAuthenticatedRequest(
  method: string,
  requestPath: string,
  apiKey: string,
  secretKey: string,
  passphrase: string,
  body?: Record<string, unknown>
): Promise<{ data: unknown; ok: boolean; error?: string }> {
  const baseUrl = 'https://api.bitget.com'
  const bodyStr = body ? JSON.stringify(body) : ''
  const url = `${baseUrl}${requestPath}`

  const headers = buildBitgetHeaders(
    apiKey,
    secretKey,
    passphrase,
    method,
    requestPath,
    bodyStr
  )

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' ? bodyStr : undefined,
    })

    const data = await response.json()

    if (data.code !== '00000') {
      return { data: null, ok: false, error: data.msg || 'API request failed' }
    }

    return { data: data.data, ok: true }
  } catch (error) {
    return {
      data: null,
      ok: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Public Bitget API call (no authentication needed)
 */
export async function bitgetPublicRequest(
  requestPath: string,
  params?: Record<string, string>
): Promise<{ data: unknown; ok: boolean; error?: string }> {
  const baseUrl = 'https://api.bitget.com'
  let url = `${baseUrl}${requestPath}`

  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json()

    if (data.code !== '00000') {
      return { data: null, ok: false, error: data.msg || 'API request failed' }
    }

    return { data: data.data, ok: true }
  } catch (error) {
    return {
      data: null,
      ok: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}
