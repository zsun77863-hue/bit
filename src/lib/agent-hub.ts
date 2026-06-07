import type { AgentSkill, SkillResult, AgentDecision, PerceptionStage, AnalysisStage, ExecutionStage, RiskStage } from '@/types'
import { generateId } from '@/lib/utils'

// ============ AGENT HUB SKILLS ============
// Reference: https://github.com/Bitget-AI/agent_hub
export const AGENT_SKILLS: AgentSkill[] = [
  {
    id: 'macro-analyst',
    name: 'Macro Analyst',
    description: 'Macroeconomic analysis and market trend evaluation',
    category: 'analysis',
    status: 'idle',
  },
  {
    id: 'sentiment-analyst',
    name: 'Sentiment Analyst',
    description: 'Social media and news sentiment analysis',
    category: 'analysis',
    status: 'idle',
  },
  {
    id: 'technical-analysis',
    name: 'Technical Analysis',
    description: 'RSI, MACD, Bollinger Bands, and other technical indicators',
    category: 'analysis',
    status: 'idle',
  },
  {
    id: 'news-briefing',
    name: 'News Briefing',
    description: 'Latest crypto news aggregation and analysis',
    category: 'info',
    status: 'idle',
  },
  {
    id: 'market-intel',
    name: 'Market Intel',
    description: 'Market intelligence and on-chain metrics',
    category: 'info',
    status: 'idle',
  },
]

// ============ PLAYBOOK API INTEGRATION ============

interface PlaybookResponse {
  success: boolean
  strategy?: string
  action?: 'buy' | 'sell' | 'hold'
  symbol?: string
  confidence?: number
  reasoning?: string[]
  stopLoss?: number
  takeProfit?: number
  error?: string
}

/**
 * Call Playbook API with user's API key
 * This processes natural language strategies into structured trading decisions
 */
export async function callPlaybookAPI(
  strategy: string,
  symbol: string,
  playbookApiKey: string
): Promise<PlaybookResponse> {
  try {
    const response = await fetch('/api/agent/playbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategy,
        symbol,
        playbookApiKey,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return data
    }

    return {
      success: false,
      error: 'Playbook API request failed',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// ============ SKILL EXECUTION ============

async function executeSkill(skillId: string, symbol: string): Promise<SkillResult> {
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700))

  const skill = AGENT_SKILLS.find((s) => s.id === skillId)
  if (!skill) throw new Error(`Skill not found: ${skillId}`)

  const basePrices: Record<string, number> = {
    BTCUSDT: 67500, ETHUSDT: 3450, SOLUSDT: 178,
    BNBUSDT: 610, XRPUSDT: 0.62, DOGEUSDT: 0.165,
  }
  const price = basePrices[symbol] || 100

  switch (skillId) {
    case 'macro-analyst':
      return {
        skillId,
        skillName: skill.name,
        timestamp: Date.now(),
        data: {
          gdpGrowth: (Math.random() * 4 + 1).toFixed(2),
          inflation: (Math.random() * 5 + 1).toFixed(2),
          interestRate: (Math.random() * 3 + 4).toFixed(2),
          marketPhase: Math.random() > 0.5 ? 'expansion' : 'contraction',
        },
        summary: `Macro environment shows ${Math.random() > 0.5 ? 'favorable' : 'cautious'} conditions for crypto. Interest rates and inflation trends suggest ${Math.random() > 0.5 ? 'risk-on' : 'risk-off'} sentiment.`,
      }

    case 'sentiment-analyst':
      return {
        skillId,
        skillName: skill.name,
        timestamp: Date.now(),
        data: {
          socialScore: (Math.random() * 2 - 1).toFixed(2),
          fearGreedIndex: Math.floor(Math.random() * 100),
          twitterVolume: Math.floor(Math.random() * 10000),
          redditSentiment: (Math.random() * 2 - 1).toFixed(2),
        },
        summary: `Social sentiment is ${Math.random() > 0.5 ? 'predominantly positive' : 'mixed to negative'}. Fear & Greed Index at ${Math.floor(Math.random() * 100)} indicates ${Math.random() > 0.5 ? 'greed' : 'fear'} in the market.`,
      }

    case 'technical-analysis':
      return {
        skillId,
        skillName: skill.name,
        timestamp: Date.now(),
        data: {
          rsi: (Math.random() * 40 + 30).toFixed(1),
          macd: (Math.random() * 200 - 100).toFixed(2),
          bollingerPosition: Math.random() > 0.5 ? 'upper' : 'lower',
          support: (price * 0.95).toFixed(2),
          resistance: (price * 1.05).toFixed(2),
          signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
        },
        summary: `Technical indicators: RSI at ${(Math.random() * 40 + 30).toFixed(1)}, MACD ${(Math.random() > 0.5 ? 'bullish' : 'bearish')} crossover. Key support at $${(price * 0.95).toFixed(0)}, resistance at $${(price * 1.05).toFixed(0)}.`,
      }

    case 'news-briefing':
      return {
        skillId,
        skillName: skill.name,
        timestamp: Date.now(),
        data: {
          headlines: [
            `${symbol.split('USDT')[0]} sees increased institutional interest`,
            'Regulatory developments in major markets',
            'DeFi TVL reaches new milestone',
          ],
          overallSentiment: Math.random() > 0.5 ? 'positive' : 'neutral',
          impactLevel: Math.random() > 0.5 ? 'high' : 'medium',
        },
        summary: `Recent news flow is ${Math.random() > 0.5 ? 'positive' : 'neutral'} for ${symbol}. Key themes: institutional adoption, regulatory clarity, and DeFi growth.`,
      }

    case 'market-intel':
      return {
        skillId,
        skillName: skill.name,
        timestamp: Date.now(),
        data: {
          openInterest: (Math.random() * 10000000000).toFixed(0),
          fundingRate: (Math.random() * 0.02 - 0.01).toFixed(6),
          liquidations24h: (Math.random() * 500000000).toFixed(0),
          whaleTransactions: Math.floor(Math.random() * 50 + 10),
          exchangeFlow: Math.random() > 0.5 ? 'inflow' : 'outflow',
        },
        summary: `Market intelligence: Open interest trending ${Math.random() > 0.5 ? 'up' : 'down'}, funding rate ${Math.random() > 0.5 ? 'positive' : 'negative'}. ${Math.random() > 0.5 ? 'Whale accumulation' : 'Distribution'} detected.`,
      }

    default:
      return {
        skillId,
        skillName: skill.name,
        timestamp: Date.now(),
        data: {},
        summary: 'Skill executed successfully.',
      }
  }
}

// ============ AGENT PIPELINE ============

export async function runAgentPipeline(
  strategy: string,
  symbol: string,
  tradingMode: 'simulated' | 'real',
  playbookApiKey?: string
): Promise<AgentDecision> {
  const decisionId = generateId()

  // Step 1: Try Playbook API first if key is provided
  let playbookResult: PlaybookResponse | null = null
  let usedPlaybook = false

  if (playbookApiKey && playbookApiKey.trim().length > 0) {
    playbookResult = await callPlaybookAPI(strategy, symbol, playbookApiKey)
    if (playbookResult.success) {
      usedPlaybook = true
    }
  }

  // Step 2: Execute Agent Hub Skills for perception
  const [macroResult, sentimentResult, technicalResult, newsResult, marketResult] =
    await Promise.all([
      executeSkill('macro-analyst', symbol),
      executeSkill('sentiment-analyst', symbol),
      executeSkill('technical-analysis', symbol),
      executeSkill('news-briefing', symbol),
      executeSkill('market-intel', symbol),
    ])

  // Build perception stage
  const sentimentScore = parseFloat(String(sentimentResult.data.socialScore || 0))
  const technicalSignal = String(technicalResult.data.signal || 'HOLD')

  const perception: PerceptionStage = {
    priceData: undefined,
    sentiment: {
      score: sentimentScore,
      label: sentimentScore > 0.3 ? 'Bullish' : sentimentScore < -0.3 ? 'Bearish' : 'Neutral',
      details: sentimentResult.summary,
    },
    technical: {
      signal: technicalSignal,
      indicators: technicalResult.data,
      summary: technicalResult.summary,
    },
    news: {
      items: (newsResult.data.headlines as string[] || []).map((h) => ({
        title: h,
        source: 'Agent Hub',
        timestamp: Date.now(),
        sentiment: 'neutral' as const,
        summary: h,
      })),
      summary: newsResult.summary,
    },
    onChain: {
      metrics: marketResult.data,
      summary: marketResult.summary,
    },
  }

  // Step 3: Analysis - Use Playbook result if available, otherwise simulate
  let analysis: AnalysisStage

  if (usedPlaybook && playbookResult) {
    analysis = {
      reasoning: playbookResult.reasoning || [
        `Playbook analyzed strategy: "${strategy}"`,
        `Target symbol: ${symbol}`,
        `Recommended action: ${playbookResult.action?.toUpperCase() || 'HOLD'}`,
        `Confidence level: ${((playbookResult.confidence || 0.5) * 100).toFixed(0)}%`,
      ],
      conclusion: `Playbook recommends ${playbookResult.action?.toUpperCase() || 'HOLD'} for ${symbol}`,
      action: playbookResult.action || 'hold',
      confidence: playbookResult.confidence || 0.5,
    }
  } else {
    const bullishSignals = [sentimentScore > 0, technicalSignal === 'BUY', Math.random() > 0.5].filter(Boolean).length
    const bearishSignals = [sentimentScore < 0, technicalSignal === 'SELL', Math.random() > 0.5].filter(Boolean).length
    const action: 'buy' | 'sell' | 'hold' = bullishSignals > bearishSignals ? 'buy' : bearishSignals > bullishSignals ? 'sell' : 'hold'
    const confidence = 0.4 + Math.random() * 0.4

    analysis = {
      reasoning: [
        `Macro: ${macroResult.summary}`,
        `Sentiment: ${sentimentResult.summary}`,
        `Technical: ${technicalResult.summary}`,
        `News: ${newsResult.summary}`,
        `On-chain: ${marketResult.summary}`,
        usedPlaybook ? 'Playbook API was called but returned incomplete results, using skill-based analysis' : 'Using Agent Hub skill-based analysis (no Playbook key provided)',
      ],
      conclusion: `Based on ${bullishSignals} bullish and ${bearishSignals} bearish signals, recommending ${action.toUpperCase()} action with ${(confidence * 100).toFixed(0)}% confidence.`,
      action,
      confidence,
    }
  }

  // Step 4: Execution
  const basePrices: Record<string, number> = {
    BTCUSDT: 67500, ETHUSDT: 3450, SOLUSDT: 178,
    BNBUSDT: 610, XRPUSDT: 0.62, DOGEUSDT: 0.165,
  }
  const currentPrice = basePrices[symbol] || 100
  const amount = analysis.action === 'hold' ? 0 : parseFloat((Math.random() * 0.5 + 0.1).toFixed(4))

  const execution: ExecutionStage = {
    action: analysis.action,
    symbol,
    amount,
    price: currentPrice,
    orderType: 'market',
    orderId: tradingMode === 'simulated' ? `sim_${Date.now()}` : undefined,
    timestamp: Date.now(),
  }

  // Step 5: Risk Management
  const stopLossPercent = 0.05
  const takeProfitPercent = 0.15
  const positionSize = amount * currentPrice

  const risk: RiskStage = {
    stopLoss: analysis.action === 'buy' ? currentPrice * (1 - stopLossPercent) : analysis.action === 'sell' ? currentPrice * (1 + stopLossPercent) : 0,
    takeProfit: analysis.action === 'buy' ? currentPrice * (1 + takeProfitPercent) : analysis.action === 'sell' ? currentPrice * (1 - takeProfitPercent) : 0,
    positionSize,
    maxDrawdown: positionSize * stopLossPercent,
    riskRewardRatio: takeProfitPercent / stopLossPercent,
  }

  return {
    id: decisionId,
    timestamp: Date.now(),
    strategy,
    perception,
    analysis,
    execution,
    risk,
    status: 'completed',
  }
}
