export type Language = 'en' | 'zh'
export type Theme = 'dark' | 'light'
export type TradingMode = 'simulated' | 'real'
export type CoinSymbol = 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT' | 'BNBUSDT' | 'XRPUSDT' | 'DOGEUSDT'

export interface PriceData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TickerData {
  symbol: string
  lastPrice: number
  change24h: number
  high24h: number
  low24h: number
  volume24h: number
}

export interface AgentSkill {
  id: string
  name: string
  description: string
  category: 'analysis' | 'trading' | 'risk' | 'info'
  status: 'idle' | 'running' | 'completed' | 'error'
  result?: SkillResult
}

export interface SkillResult {
  skillId: string
  skillName: string
  timestamp: number
  data: Record<string, unknown>
  summary: string
}

export interface AgentDecision {
  id: string
  timestamp: number
  strategy: string
  perception: PerceptionStage
  analysis: AnalysisStage
  execution: ExecutionStage
  risk: RiskStage
  status: 'pending' | 'running' | 'completed' | 'error'
}

export interface PerceptionStage {
  priceData?: TickerData
  sentiment?: { score: number; label: string; details: string }
  technical?: { signal: string; indicators: Record<string, unknown>; summary: string }
  news?: { items: NewsItem[]; summary: string }
  onChain?: { metrics: Record<string, unknown>; summary: string }
}

export interface AnalysisStage {
  reasoning: string[]
  conclusion: string
  action: 'buy' | 'sell' | 'hold'
  confidence: number
}

export interface NewsItem {
  title: string
  source: string
  timestamp: number
  sentiment: 'positive' | 'negative' | 'neutral'
  summary: string
}

export interface ExecutionStage {
  action: 'buy' | 'sell' | 'hold' | 'close'
  symbol: string
  amount: number
  price: number
  orderType: 'market' | 'limit'
  orderId?: string
  timestamp?: number
}

export interface RiskStage {
  stopLoss: number
  takeProfit: number
  positionSize: number
  maxDrawdown: number
  riskRewardRatio: number
  pnl?: number
}

export interface StrategyHistory {
  id: string
  input: string
  timestamp: number
  decision?: AgentDecision
  status: 'pending' | 'running' | 'completed' | 'error'
}

export interface TradeLog {
  id: string
  timestamp: number
  symbol: string
  side: 'buy' | 'sell'
  amount: number
  price: number
  total: number
  pnl?: number
  mode: TradingMode
  strategy: string
}

export interface PortfolioAsset {
  symbol: string
  amount: number
  avgPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
}

export interface PerformanceMetrics {
  winRate: number
  totalPnl: number
  maxDrawdown: number
  sharpeRatio: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  avgWin: number
  avgLoss: number
  profitFactor: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  decision?: AgentDecision
}

export interface BitgetConfig {
  apiKey: string
  secretKey: string
  passphrase: string
  playbookApiKey: string
}

export interface AccountBalance {
  coin: string
  available: string
  frozen: string
  total: string
  usdtValue: string
}

export interface PositionData {
  symbol: string
  holdSide: string
  side: string
  size: string
  total: string
  avgPrice: string
  averageOpenPrice: string
  markPrice: string
  unrealizedPL: string
  leverage: string
  margin: string
}
