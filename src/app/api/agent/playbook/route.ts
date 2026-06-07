import { NextResponse } from 'next/server'

/**
 * Playbook API Proxy & Skill Hub Fallback
 * 
 * Based on Bitget Agent Hub: https://github.com/Bitget-AI/agent_hub
 * 
 * IMPORTANT: The Playbook system does NOT have a public /analyze endpoint.
 * The previous implementation incorrectly hardcoded non-existent endpoints like:
 *   - /api/v2/ai/strategy/analyze
 *   - /api/v2/ai/agent/execute
 *   - /api/v2/ai/playbook/analyze
 * 
 * Correct approach:
 * 1. If user has a Playbook API Key (from TG group), try the correct endpoint
 *    (currently unknown/undocumented, so we validate the key format and gracefully fail)
 * 2. Always fall back to Skill Hub analysis (macro-analyst, sentiment-analyst, etc.)
 * 3. Return structured results with clear source indicators
 */

export async function POST(request: Request) {
  try {
    const { playbookApiKey, strategy, symbol } = await request.json()

    if (!playbookApiKey) {
      return NextResponse.json({
        success: false,
        error: 'Playbook API Key is required',
        errorDetail: 'Please enter your Playbook API Key in Settings. If you don\'t have one, Skill Hub analysis will be used automatically.',
        fallback: true,
        source: 'none',
      })
    }

    // Validate key format (basic check)
    if (playbookApiKey.trim().length < 8) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Playbook API Key format',
        errorDetail: 'The provided key appears to be too short. Please check your key from the TG group.',
        fallback: true,
        source: 'none',
      })
    }

    // Try to reach Playbook API
    // NOTE: As of now, there is NO publicly documented /analyze endpoint for Playbook.
    // The correct endpoint should be obtained from the Bitget TG group or official docs.
    // We try a basic health check on the Bitget API to verify connectivity.
    try {
      const healthCheck = await fetch('https://api.bitget.com/api/v2/public/time', {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      })

      if (!healthCheck.ok) {
        return NextResponse.json({
          success: false,
          error: 'Bitget API unreachable',
          errorDetail: 'Cannot reach Bitget API servers. Skill Hub analysis will be used.',
          fallback: true,
          source: 'none',
        })
      }

      // API is reachable, but /analyze endpoint does not exist publicly
      // Return a clear message that Playbook is supplementary
      return NextResponse.json({
        success: true,
        strategy,
        action: 'hold' as const,
        symbol,
        confidence: 0.5,
        reasoning: [
          'Playbook API Key detected and Bitget API is reachable',
          'Note: Playbook /analyze endpoint is not publicly available',
          'Skill Hub analysis is the primary analysis source',
          'Playbook Key may enable future features when the endpoint is documented',
        ],
        warning: 'Playbook /analyze endpoint is not publicly available. Skill Hub analysis is used as the primary source.',
        source: 'playbook_key_validated',
        fallback: true,
      })
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Network error reaching Bitget API',
        errorDetail: 'Could not connect to Bitget API. Please check your internet connection.',
        fallback: true,
        source: 'none',
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      fallback: true,
      source: 'none',
    }, { status: 500 })
  }
}
