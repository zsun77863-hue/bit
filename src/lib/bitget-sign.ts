/**
 * Bitget API Signature Utility
 * 
 * Implements correct Bitget V2 API signing:
 * - Signature = Base64(HMAC-SHA256(timestamp + method + requestPath + body, secretKey))
 * - Headers: ACCESS-KEY, ACCESS-SIGN, ACCESS-TIMESTAMP, ACCESS-PASSPHRASE
 * 
 * Reference: https://www.bitget.com/api-doc/common/intro
 * Reference: https://github.com/Bitget-AI/agent_hub (bitget-client logic)
 */

export interface BitgetAuthHeaders {
  'ACCESS-KEY': string
  'ACCESS-SIGN': string
  'ACCESS-TIMESTAMP': string
  'ACCESS-PASSPHRASE': string
  'Content-Type': string
  'locale': string
}

/**
 * Generate HMAC-SHA256 signature for Bitget API
 * 
 * @param timestamp - Unix timestamp in milliseconds (string)
 * @param method - HTTP method (GET, POST)
 * @param requestPath - API path (e.g., /api/v2/mix/account/accounts)
 * @param body - Request body (empty string for GET)
 * @param secretKey - API Secret Key
 * @returns Base64 encoded signature
 */
export async function signRequest(
  timestamp: string,
  method: string,
  requestPath: string,
  body: string,
  secretKey: string
): Promise<string> {
  const message = timestamp + method.toUpperCase() + requestPath + body
  
  // Use Web Crypto API (available in Node.js and browsers)
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

/**
 * Generate full authentication headers for Bitget API
 */
export async function generateAuthHeaders(
  method: string,
  requestPath: string,
  body: string,
  apiKey: string,
  secretKey: string,
  passphrase: string
): Promise<BitgetAuthHeaders> {
  const timestamp = Date.now().toString()
  const sign = await signRequest(timestamp, method, requestPath, body, secretKey)
  
  return {
    'ACCESS-KEY': apiKey,
    'ACCESS-SIGN': sign,
    'ACCESS-TIMESTAMP': timestamp,
    'ACCESS-PASSPHRASE': passphrase,
    'Content-Type': 'application/json',
    'locale': 'en-US',
  }
}
