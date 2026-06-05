import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Language,
  Theme,
  TradingMode,
  ChatMessage,
  StrategyHistory,
  TradeLog,
  PortfolioAsset,
  PerformanceMetrics,
  AgentDecision,
  BitgetConfig,
  CoinSymbol,
  TickerData,
  PriceData,
} from '@/types'
import { generateId } from '@/lib/utils'

interface AppState {
  // Language & Theme
  language: Language
  theme: Theme
  setLanguage: (lang: Language) => void
  setTheme: (theme: Theme) => void

  // Trading Mode
  tradingMode: TradingMode
  setTradingMode: (mode: TradingMode) => void

  // Navigation
  activePage: 'chat' | 'dashboard' | 'history' | 'settings'
  setActivePage: (page: 'chat' | 'dashboard' | 'history' | 'settings') => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  // Chat
  messages: ChatMessage[]
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearMessages: () => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void

  // Strategy History
  strategyHistory: StrategyHistory[]
  addStrategy: (input: string) => string
  updateStrategy: (id: string, decision: AgentDecision, status: StrategyHistory['status']) => void
  deleteStrategy: (id: string) => void
  clearHistory: () => void

  // Trade Logs
  tradeLogs: TradeLog[]
  addTradeLog: (log: Omit<TradeLog, 'id'>) => void

  // Portfolio
  portfolioAssets: PortfolioAsset[]
  setPortfolioAssets: (assets: PortfolioAsset[]) => void
  balance: number
  setBalance: (balance: number) => void

  // Performance
  performanceMetrics: PerformanceMetrics
  setPerformanceMetrics: (metrics: PerformanceMetrics) => void

  // Bitget Config
  bitgetConfig: BitgetConfig
  setBitgetConfig: (config: Partial<BitgetConfig>) => void

  // Price Data
  selectedCoin: CoinSymbol
  setSelectedCoin: (coin: CoinSymbol) => void
  tickerData: Record<string, TickerData>
  setTickerData: (data: Record<string, TickerData>) => void
  priceHistory: PriceData[]
  setPriceHistory: (data: PriceData[]) => void

  // Help dialog
  helpOpen: boolean
  setHelpOpen: (open: boolean) => void
}

const defaultPerformance: PerformanceMetrics = {
  winRate: 0,
  totalPnl: 0,
  maxDrawdown: 0,
  sharpeRatio: 0,
  totalTrades: 0,
  winningTrades: 0,
  losingTrades: 0,
  avgWin: 0,
  avgLoss: 0,
  profitFactor: 0,
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Language & Theme
      language: 'en',
      theme: 'dark',
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),

      // Trading Mode
      tradingMode: 'simulated',
      setTradingMode: (tradingMode) => set({ tradingMode }),

      // Navigation
      activePage: 'chat',
      setActivePage: (activePage) => set({ activePage }),
      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      // Chat
      messages: [],
      addMessage: (msg) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { ...msg, id: generateId(), timestamp: Date.now() },
          ],
        })),
      clearMessages: () => set({ messages: [] }),
      isProcessing: false,
      setIsProcessing: (isProcessing) => set({ isProcessing }),

      // Strategy History
      strategyHistory: [],
      addStrategy: (input) => {
        const id = generateId()
        set((state) => ({
          strategyHistory: [
            { id, input, timestamp: Date.now(), status: 'pending' },
            ...state.strategyHistory,
          ],
        }))
        return id
      },
      updateStrategy: (id, decision, status) =>
        set((state) => ({
          strategyHistory: state.strategyHistory.map((s) =>
            s.id === id ? { ...s, decision, status } : s
          ),
        })),
      deleteStrategy: (id) =>
        set((state) => ({
          strategyHistory: state.strategyHistory.filter((s) => s.id !== id),
        })),
      clearHistory: () => set({ strategyHistory: [] }),

      // Trade Logs
      tradeLogs: [],
      addTradeLog: (log) =>
        set((state) => ({
          tradeLogs: [{ ...log, id: generateId() }, ...state.tradeLogs],
        })),

      // Portfolio
      portfolioAssets: [],
      setPortfolioAssets: (portfolioAssets) => set({ portfolioAssets }),
      balance: 100000,
      setBalance: (balance) => set({ balance }),

      // Performance
      performanceMetrics: defaultPerformance,
      setPerformanceMetrics: (performanceMetrics) => set({ performanceMetrics }),

      // Bitget Config
      bitgetConfig: {
        apiKey: '',
        secretKey: '',
        passphrase: '',
        playbookApiKey: '',
      },
      setBitgetConfig: (config) =>
        set((state) => ({
          bitgetConfig: { ...state.bitgetConfig, ...config },
        })),

      // Price Data
      selectedCoin: 'BTCUSDT',
      setSelectedCoin: (selectedCoin) => set({ selectedCoin }),
      tickerData: {},
      setTickerData: (tickerData) => set({ tickerData }),
      priceHistory: [],
      setPriceHistory: (priceHistory) => set({ priceHistory }),

      // Help
      helpOpen: false,
      setHelpOpen: (helpOpen) => set({ helpOpen }),
    }),
    {
      name: 'bitget-trading-agent',
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
        tradingMode: state.tradingMode,
        strategyHistory: state.strategyHistory,
        tradeLogs: state.tradeLogs,
        portfolioAssets: state.portfolioAssets,
        balance: state.balance,
        performanceMetrics: state.performanceMetrics,
        bitgetConfig: state.bitgetConfig,
        selectedCoin: state.selectedCoin,
      }),
    }
  )
)
