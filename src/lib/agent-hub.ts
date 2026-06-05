import type { AgentSkill, SkillResult, AgentDecision, PerceptionStage, AnalysisStage, ExecutionStage, RiskStage } from '@/types'
import { generateId } from '@/lib/utils'

// Agent Hub Skills Definition - Based on Bitget Agent Hub
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

// Simulate skill execution via Agent Hub
export async function executeSkill(skillId: string, symbol: string): Promise<SkillResult> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

  const skill = AGENT_SKILLS.find((s) => s.id === skillId)
  if (!skill) throw new Error(`Skill ${skillId} not found`)

  switch (skillId) {
    case 'macro-analyst':
      return executeMacroAnalyst(symbol)
    case 'sentiment-analyst':
      return executeSentimentAnalyst(symbol)
    case 'technical-analysis':
      return executeTechnicalAnalysis(symbol)
    case 'news-briefing':
      return executeNewsBriefing(symbol)
    case 'market-intel':
      return executeMarketIntel(symbol)
    default:
      return {
        skillId,
        skillName: skill.name,
        timestamp: Date.now(),
        data: {},
        summary: 'Skill executed successfully',
      }
  }
}

function executeMacroAnalyst(symbol: string): SkillResult {
  const coin = symbol.replace('USDT', '')
  const fedStance = Math.random() > 0.5 ? 'hawkish' : 'dovish'
  const inflationTrend = Math.random() > 0.5 ? 'rising' : 'declining'
  const gdpGrowth = (Math.random() * 4 + 1).toFixed(1)
  const riskAppetite = Math.random() > 0.4 ? 'risk-on' : 'risk-off'

  return {
    skillId: 'macro-analyst',
    skillName: 'Macro Analyst',
    timestamp: Date.now(),
    data: {
      fedStance,
      inflationTrend,
      gdpGrowth: `${gdpGrowth}%`,
      riskAppetite,
      dollarIndex: (90 + Math.random() * 15).toFixed(2),
      interestRate: (4.5 + Math.random() * 2).toFixed(2) + '%',
    },
    summary: `Macro environment for ${coin}: Fed stance is ${fedStance}, inflation is ${inflationTrend}. GDP growth at ${gdpGrowth}%. Market sentiment is ${riskAppetite}. This ${riskAppetite === 'risk-on' ? 'favors' : 'weighs on'} crypto assets.`,
  }
}

function executeSentimentAnalyst(symbol: string): SkillResult {
  const coin = symbol.replace('USDT', '')
  const score = parseFloat((Math.random() * 2 - 0.5).toFixed(2)) // -0.5 to 1.5
  const label = score > 0.5 ? 'Bullish' : score > 0 ? 'Slightly Bullish' : score > -0.3 ? 'Neutral' : 'Bearish'
  const socialVolume = Math.floor(Math.random() * 50000 + 10000)
  const fearGreedIndex = Math.floor(Math.random() * 100)

  return {
    skillId: 'sentiment-analyst',
    skillName: 'Sentiment Analyst',
    timestamp: Date.now(),
    data: {
      score,
      label,
      socialVolume,
      fearGreedIndex,
      twitterSentiment: score > 0 ? 'positive' : 'negative',
      redditSentiment: score > 0.2 ? 'positive' : 'mixed',
    },
    summary: `${coin} sentiment score: ${score.toFixed(2)} (${label}). Social volume: ${socialVolume.toLocaleString()} mentions. Fear & Greed Index: ${fearGreedIndex}/100. Overall sentiment is ${label.toLowerCase()}.`,
  }
}

function executeTechnicalAnalysis(symbol: string): SkillResult {
  const coin = symbol.replace('USDT', '')
  const rsi = parseFloat((Math.random() * 60 + 20).toFixed(1))
  const macdSignal = Math.random() > 0.5 ? 'bullish crossover' : 'bearish crossover'
  const bbPosition = Math.random() > 0.5 ? 'near upper band' : 'near lower band'
  const ma50 = Math.random() > 0.5 ? 'above' : 'below'
  const ma200 = Math.random() > 0.5 ? 'above' : 'below'
  const signal = rsi < 30 || (macdSignal === 'bullish crossover' && ma50 === 'above') ? 'BUY' : rsi > 70 || (macdSignal === 'bearish crossover' && ma50 === 'below') ? 'SELL' : 'HOLD'

  return {
    skillId: 'technical-analysis',
    skillName: 'Technical Analysis',
    timestamp: Date.now(),
    data: {
      rsi,
      macdSignal,
      bollingerBands: bbPosition,
      ma50Position: ma50,
      ma200Position: ma200,
      support: 'dynamic',
      resistance: 'dynamic',
      volume: Math.random() > 0.5 ? 'above average' : 'below average',
    },
    summary: `${coin} Technical: RSI=${rsi}, MACD shows ${macdSignal}, price is ${bbPosition}. MA50 ${ma50} price, MA200 ${ma200} price. Signal: ${signal}.`,
  }
}

function executeNewsBriefing(symbol: string): SkillResult {
  const coin = symbol.replace('USDT', '')
  const newsItems = [
    { title: `${coin} sees increased institutional adoption`, sentiment: 'positive' as const },
    { title: `Regulatory clarity boosts ${coin} market confidence`, sentiment: 'positive' as const },
    { title: `Major exchange announces ${coin} trading pairs expansion`, sentiment: 'positive' as const },
    { title: `${coin} network upgrade scheduled for next month`, sentiment: 'positive' as const },
    { title: `Market volatility increases amid macro uncertainty`, sentiment: 'neutral' as const },
  ]
  const selectedNews = newsItems.slice(0, 2 + Math.floor(Math.random() * 3))

  return {
    skillId: 'news-briefing',
    skillName: 'News Briefing',
    timestamp: Date.now(),
    data: {
      newsCount: selectedNews.length,
      overallSentiment: selectedNews.filter((n) => n.sentiment === 'positive').length > selectedNews.length / 2 ? 'positive' : 'mixed',
      topNews: selectedNews,
    },
    summary: `${coin} News: ${selectedNews.length} significant stories. Overall news sentiment is ${selectedNews.filter((n) => n.sentiment === 'positive').length > selectedNews.length / 2 ? 'positive' : 'mixed'}. Key: ${selectedNews[0].title}.`,
  }
}

function executeMarketIntel(symbol: string): SkillResult {
  const coin = symbol.replace('USDT', '')
  const whaleActivity = Math.random() > 0.5 ? 'accumulating' : 'distributing'
  const exchangeFlow = Math.random() > 0.5 ? 'inflow' : 'outflow'
  const activeAddresses = Math.floor(Math.random() * 1000000 + 500000)
  const tvl = Math.floor(Math.random() * 50000000000)

  return {
    skillId: 'market-intel',
    skillName: 'Market Intel',
    timestamp: Date.now(),
    data: {
      whaleActivity,
      exchangeFlow,
      activeAddresses,
      tvl,
      fundingRate: (Math.random() * 0.1 - 0.05).toFixed(4),
      openInterest: Math.floor(Math.random() * 10000000000),
    },
    summary: `${coin} Market Intel: Whales are ${whaleActivity}. Exchange ${exchangeFlow} detected. Active addresses: ${activeAddresses.toLocaleString()}. Funding rate: ${(Math.random() * 0.1 - 0.05).toFixed(4)}%. OI: $${(Math.random() * 10).toFixed(1)}B.`,
  }
}

// Main Agent Decision Pipeline
export async function runAgentPipeline(
  strategy: string,
  symbol: string,
  tradingMode: 'simulated' | 'real',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  playbookApiKey?: string
): Promise<AgentDecision> {
  const decisionId = generateId()

  // Step 1: Perception - Run all skills
  const [macroResult, sentimentResult, technicalResult, newsResult, marketResult] = await Promise.all([
    executeSkill('macro-analyst', symbol),
    executeSkill('sentiment-analyst', symbol),
    executeSkill('technical-analysis', symbol),
    executeSkill('news-briefing', symbol),
    executeSkill('market-intel', symbol),
  ])

  const perception: PerceptionStage = {
    priceData: undefined, // Will be filled from ticker
    sentiment: {
      score: (sentimentResult.data.score as number) || 0,
      label: (sentimentResult.data.label as string) || 'Neutral',
      details: sentimentResult.summary,
    },
    technical: {
      signal: (technicalResult.data.rsi as number) < 30 ? 'BUY' : (technicalResult.data.rsi as number) > 70 ? 'SELL' : 'HOLD',
      indicators: technicalResult.data,
      summary: technicalResult.summary,
    },
    news: {
      items: (newsResult.data.topNews as Array<{ title: string; sentiment: string }>)?.map((n) => ({
        title: n.title,
        source: 'Agent Hub',
        timestamp: Date.now(),
        sentiment: n.sentiment as 'positive' | 'negative' | 'neutral',
        summary: n.title,
      })) || [],
      summary: newsResult.summary,
    },
    onChain: {
      metrics: marketResult.data,
      summary: marketResult.summary,
    },
  }

  // Step 2: Analysis - Combine all signals
  const signals: string[] = []
  const sentimentScore = perception.sentiment?.score || 0
  const techSignal = perception.technical?.signal || 'HOLD'
  const macroStance = (macroResult.data.riskAppetite as string) || 'neutral'

  if (sentimentScore > 0.5) signals.push('Positive sentiment')
  else if (sentimentScore < -0.2) signals.push('Negative sentiment')

  if (techSignal === 'BUY') signals.push('Technical buy signal')
  else if (techSignal === 'SELL') signals.push('Technical sell signal')

  if (macroStance === 'risk-on') signals.push('Risk-on macro environment')
  else if (macroStance === 'risk-off') signals.push('Risk-off macro environment')

  const bullishSignals = signals.filter((s) => s.includes('Positive') || s.includes('buy') || s.includes('Risk-on')).length
  const bearishSignals = signals.filter((s) => s.includes('Negative') || s.includes('sell') || s.includes('Risk-off')).length

  let action: 'buy' | 'sell' | 'hold' | 'close'
  let confidence: number

  if (bullishSignals > bearishSignals + 1) {
    action = 'buy'
    confidence = 0.6 + bullishSignals * 0.1
  } else if (bearishSignals > bullishSignals + 1) {
    action = 'sell'
    confidence = 0.6 + bearishSignals * 0.1
  } else {
    action = 'hold'
    confidence = 0.4 + Math.abs(bullishSignals - bearishSignals) * 0.1
  }

  // Strategy-specific overrides
  const strategyLower = strategy.toLowerCase()
  if (strategyLower.includes('buy') || strategyLower.includes('long') || strategyLower.includes('dca')) {
    action = 'buy'
    confidence = Math.min(confidence + 0.15, 0.95)
  } else if (strategyLower.includes('sell') || strategyLower.includes('short')) {
    action = 'sell'
    confidence = Math.min(confidence + 0.15, 0.95)
  } else if (strategyLower.includes('stop') || strategyLower.includes('止损')) {
    action = 'close'
    confidence = Math.min(confidence + 0.1, 0.9)
  }

  confidence = Math.min(confidence, 0.95)

  const analysis: AnalysisStage = {
    reasoning: [
      `Sentiment score: ${sentimentScore.toFixed(2)} (${perception.sentiment?.label})`,
      `Technical signal: ${techSignal} (RSI: ${technicalResult.data.rsi})`,
      `Macro environment: ${macroStance}`,
      `News sentiment: ${newsResult.data.overallSentiment}`,
      `Whale activity: ${marketResult.data.whaleActivity}`,
      `Strategy intent: ${action} based on user input analysis`,
    ],
    conclusion: `Based on ${bullishSignals} bullish and ${bearishSignals} bearish signals, recommending ${action.toUpperCase()} action with ${(confidence * 100).toFixed(0)}% confidence.`,
    confidence,
  }

  // Step 3: Execution
  const basePrices: Record<string, number> = {
    BTCUSDT: 67500,
    ETHUSDT: 3450,
    SOLUSDT: 178,
    BNBUSDT: 610,
    XRPUSDT: 0.62,
    DOGEUSDT: 0.165,
  }
  const currentPrice = basePrices[symbol] || 100
  const amount = action === 'hold' ? 0 : parseFloat((Math.random() * 0.5 + 0.1).toFixed(4))

  const execution: ExecutionStage = {
    action,
    symbol,
    amount,
    price: currentPrice,
    orderType: 'market',
    orderId: tradingMode === 'simulated' ? `sim_${Date.now()}` : undefined,
    timestamp: Date.now(),
  }

  // Step 4: Risk Management
  const stopLossPercent = 0.05
  const takeProfitPercent = 0.15
  const positionSize = amount * currentPrice

  const risk: RiskStage = {
    stopLoss: action === 'buy' ? currentPrice * (1 - stopLossPercent) : action === 'sell' ? currentPrice * (1 + stopLossPercent) : 0,
    takeProfit: action === 'buy' ? currentPrice * (1 + takeProfitPercent) : action === 'sell' ? currentPrice * (1 - takeProfitPercent) : 0,
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
