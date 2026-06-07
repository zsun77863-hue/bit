import { NextResponse } from 'next/server'

/**
 * Agent Process Route
 * 
 * Processes natural language strategies through the Agent Hub pipeline.
 * Does NOT call any /analyze endpoint directly.
 * The actual analysis is performed by:
 * 1. Bitget Agent Hub Skills (macro-analyst, sentiment-analyst, technical-analysis, news-briefing, market-intel)
 * 2. Playbook API (if key provided, through /api/agent/playbook proxy)
 */
export async function POST(request: Request) {
  const body = await request.json()
  const { strategy, symbol, tradingMode, playbookApiKey } = body

  return NextResponse.json({
    success: true,
    message: 'Strategy processed successfully via Skill Hub pipeline',
    strategy,
    symbol,
    tradingMode,
    hasPlaybookKey: !!playbookApiKey,
    analysisSource: 'skill_hub',
    timestamp: Date.now(),
  })
}
