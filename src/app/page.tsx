'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/store'
import { getTranslation } from '@/i18n'
import { cn, formatCurrency, formatPercent, downloadCSV, generateId } from '@/lib/utils'
import { COIN_LIST, CHART_INTERVALS, fetchAllTickers, fetchPriceHistory, placeOrder } from '@/lib/bitget'
import { runAgentPipeline } from '@/lib/agent-hub'
import type { AgentDecision, TradeLog, CoinSymbol, TickerData, PriceData, AccountBalance, PositionData } from '@/types'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts'

// ============ ICONS ============
function IconBot({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
}
function IconSend({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
}
function IconDashboard({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
}
function IconHistory({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
}
function IconSettings({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
}
function IconSun({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
}
function IconMoon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
}
function IconX({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
}
function IconAlert({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
}
function IconDownload({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
}
function IconMenu({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
}
function IconHelp({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
}
function IconTrash({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
}
function IconRefresh({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
}
function IconWallet({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
}
function IconEye({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
}
function IconPlay({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
}

// ============ TOAST SYSTEM ============
interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={cn(
          'px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in-right max-w-sm',
          toast.type === 'success' && 'bg-emerald-500/90 text-white',
          toast.type === 'error' && 'bg-red-500/90 text-white',
          toast.type === 'warning' && 'bg-amber-500/90 text-white',
          toast.type === 'info' && 'bg-blue-500/90 text-white',
        )}>
          {toast.message}
        </div>
      ))}
    </div>
  )
}

// ============ CANDLESTICK CHART WITH RECHARTS ============
function CandlestickChart({ data, lang }: { data: PriceData[]; lang: 'en' | 'zh' }) {
  const tr = getTranslation(lang)

  // Transform data for Recharts candlestick rendering
  const chartData = data.map((d) => {
    const isUp = d.close >= d.open
    return {
      ...d,
      time: new Date(d.timestamp).toLocaleTimeString(lang === 'zh' ? 'zh-CN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
      }),
      // For the bar body
      bodyLow: Math.min(d.open, d.close),
      bodyHigh: Math.max(d.open, d.close),
      // For coloring
      isUp,
      // Wick
      wickLow: d.low,
      wickHigh: d.high,
      // Volume color
      volumeColor: isUp ? '#10b981' : '#ef4444',
    }
  })

  // Custom candlestick shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CandlestickShape = (props: any) => {
    const { x, y, width, height, payload } = props
    if (!payload) return null
    const color = payload.isUp ? '#10b981' : '#ef4444'
    return (
      <g>
        {/* Wick line */}
        <line
          x1={x + width / 2}
          y1={y}
          x2={x + width / 2}
          y2={y + height}
          stroke={color}
          strokeWidth={1}
        />
      </g>
    )
  }

  // Custom tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
        <p className="text-muted-foreground mb-1">{d.time}</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <span className="text-muted-foreground">O:</span><span>{d.open.toFixed(2)}</span>
          <span className="text-muted-foreground">H:</span><span className="text-emerald-500">{d.high.toFixed(2)}</span>
          <span className="text-muted-foreground">L:</span><span className="text-red-500">{d.low.toFixed(2)}</span>
          <span className="text-muted-foreground">C:</span><span className={d.isUp ? 'text-emerald-500' : 'text-red-500'}>{d.close.toFixed(2)}</span>
          <span className="text-muted-foreground">Vol:</span><span>{(d.volume / 1e6).toFixed(2)}M</span>
        </div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {tr.common.loading}
      </div>
    )
  }

  const prices = chartData.flatMap(d => [d.high, d.low])
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const padding = (maxPrice - minPrice) * 0.1

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis
          dataKey="time"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          interval="preserveStartEnd"
          minTickGap={50}
        />
        <YAxis
          domain={[minPrice - padding, maxPrice + padding]}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          tickFormatter={(v: number) => v.toFixed(v > 100 ? 0 : 2)}
          width={70}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />

        {/* Volume bars at bottom */}
        <Bar
          dataKey="volume"
          fill="#3b82f6"
          opacity={0.3}
          yAxisId="volume"
          barSize={3}
          name="Volume"
        />
        <YAxis
          yAxisId="volume"
          orientation="right"
          hide
        />

        {/* Candlestick wicks */}
        <Bar
          dataKey="wickHigh"
          shape={<CandlestickShape />}
          yAxisId="price"
          barSize={8}
          name="High"
          isAnimationActive={false}
        />

        {/* Close price line for trend */}
        <Line
          type="monotone"
          dataKey="close"
          stroke="#8b5cf6"
          dot={false}
          strokeWidth={1.5}
          yAxisId="price"
          name="Close"
          isAnimationActive={false}
        />

        {/* Moving average */}
        <Line
          type="monotone"
          dataKey="close"
          stroke="#f59e0b"
          dot={false}
          strokeWidth={1}
          strokeDasharray="4 4"
          yAxisId="price"
          name="MA"
          isAnimationActive={false}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// ============ PERFORMANCE CHART ============
function PerformanceChart({ tradeLogs }: { tradeLogs: TradeLog[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || tradeLogs.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    ctx.clearRect(0, 0, w, h)

    // Calculate cumulative PnL
    let cumPnl = 0
    const points: { x: number; y: number; pnl: number }[] = []
    tradeLogs.forEach((log, i) => {
      cumPnl += log.pnl || 0
      points.push({ x: (i / Math.max(tradeLogs.length - 1, 1)) * (w - 60) + 30, y: 0, pnl: cumPnl })
    })

    const maxPnl = Math.max(...points.map(p => Math.abs(p.pnl)), 1)
    const midY = h / 2
    const scale = (h / 2 - 20) / maxPnl

    points.forEach(p => { p.y = midY - p.pnl * scale })

    // Zero line
    ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(30, midY)
    ctx.lineTo(w - 30, midY)
    ctx.stroke()
    ctx.setLineDash([])

    // PnL line
    if (points.length > 1) {
      const gradient = ctx.createLinearGradient(0, 0, 0, h)
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
      gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.05)')
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.3)')

      ctx.beginPath()
      ctx.moveTo(points[0].x, midY)
      points.forEach(p => ctx.lineTo(p.x, p.y))
      ctx.lineTo(points[points.length - 1].x, midY)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      points.forEach(p => ctx.lineTo(p.x, p.y))
      ctx.strokeStyle = cumPnl >= 0 ? '#10b981' : '#ef4444'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Labels
    ctx.fillStyle = 'hsl(var(--muted-foreground))'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`+${maxPnl.toFixed(2)}`, 28, 25)
    ctx.fillText(`-${maxPnl.toFixed(2)}`, 28, h - 15)
    ctx.fillText('0', 28, midY + 4)
  }, [tradeLogs])

  if (tradeLogs.length === 0) return null

  return <canvas ref={canvasRef} className="w-full h-48 rounded-lg" />
}

// ============ MAIN APP ============
export default function TradingAgentApp() {
  const store = useAppStore()
  const tr = getTranslation(store.language)

  const [input, setInput] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [realModeConfirm, setRealModeConfirm] = useState(false)
  const [orderConfirm, setOrderConfirm] = useState<{ decision: AgentDecision; callback: () => void } | null>(null)
  const [playbookKeyInput, setPlaybookKeyInput] = useState(store.bitgetConfig.playbookApiKey)
  const [settingsApi, setSettingsApi] = useState({
    apiKey: store.bitgetConfig.apiKey,
    secretKey: store.bitgetConfig.secretKey,
    passphrase: store.bitgetConfig.passphrase,
    playbookApiKey: store.bitgetConfig.playbookApiKey,
  })
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([])
  const [accountPositions, setAccountPositions] = useState<PositionData[]>([])
  const [accountLoading, setAccountLoading] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // ============ TOAST HELPER ============
  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = generateId()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  // ============ THEME ============
  useEffect(() => {
    document.documentElement.classList.toggle('dark', store.theme === 'dark')
  }, [store.theme])

  // ============ REAL-TIME PRICE POLLING ============
  const refreshPrices = useCallback(async () => {
    try {
      // Fetch all tickers (single API call for efficiency)
      const tickers = await fetchAllTickers()
      if (Object.keys(tickers).length > 0) {
        store.setTickerData(tickers)
      }

      // Fetch candlestick data for selected coin
      const history = await fetchPriceHistory(store.selectedCoin, store.chartInterval, 100)
      if (history.length > 0) {
        store.setPriceHistory(history)
      }
    } catch {
      // silently fail - will retry on next poll
    }
  }, [store.selectedCoin, store.chartInterval])

  useEffect(() => {
    refreshPrices()
    // Poll every 5 seconds for real-time data
    pollingRef.current = setInterval(refreshPrices, 5000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [store.selectedCoin, store.chartInterval, refreshPrices])

  // ============ FETCH ACCOUNT DATA ============
  const fetchAccountData = useCallback(async () => {
    if (!store.bitgetConfig.apiKey || !store.bitgetConfig.secretKey || !store.bitgetConfig.passphrase) {
      return
    }
    setAccountLoading(true)
    try {
      const qs = new URLSearchParams({
        apiKey: store.bitgetConfig.apiKey,
        secretKey: store.bitgetConfig.secretKey,
        passphrase: store.bitgetConfig.passphrase,
      }).toString()

      const [balRes, posRes] = await Promise.all([
        fetch(`/api/bitget/balance?${qs}`),
        fetch(`/api/bitget/positions?${qs}`),
      ])

      const balData = await balRes.json()
      const posData = await posRes.json()

      // Check for IP whitelist error
      const isIpError = balData.isIpError || posData.isIpError ||
                         (balData.error && String(balData.error).toLowerCase().includes('ip')) ||
                         (posData.error && String(posData.error).toLowerCase().includes('ip'))

      if (isIpError) {
        store.setAccountError('IP whitelist error: Add 0.0.0.0/0 to your Bitget API Key IP whitelist. Go to Bitget > API Management > Edit > IP Whitelist.')
      } else if (balData.error || posData.error) {
        const errMsg = balData.error || posData.error || 'Unknown error'
        store.setAccountError(`API Error: ${errMsg}`)
      } else {
        store.setAccountError('')
      }

      if (Array.isArray(balData.data)) {
        setAccountBalances(balData.data)
        const usdtBalance = balData.data.find((b: AccountBalance) => b.marginCoin === 'USDT')
        if (usdtBalance) {
          store.setBalance(parseFloat(usdtBalance.available || usdtBalance.equity || '0'))
        }
      }

      if (Array.isArray(posData.data)) {
        setAccountPositions(posData.data)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error'
      store.setAccountError(`Connection failed: ${msg}`)
    }
    setAccountLoading(false)
  }, [store])

  useEffect(() => {
    fetchAccountData()
  }, [fetchAccountData])

  // ============ SIMULATED ACCOUNT DATA ============
  // When no API keys are configured, show simulated data
  useEffect(() => {
    if (!store.bitgetConfig.apiKey && accountBalances.length === 0) {
      setAccountBalances([
        { marginCoin: 'USDT', coin: 'USDT', available: '10000.00', frozen: '0.00', total: '10000.00', usdtValue: '10000.00', equity: '10000.00' },
      ])
      store.setBalance(10000)
    }
  }, [store.bitgetConfig.apiKey, accountBalances.length, store])

  // ============ AUTO SCROLL ============
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [store.messages])

  // ============ SEND MESSAGE ============
  const handleSend = useCallback(async () => {
    if (!input.trim() || store.isProcessing) return

    const strategy = input.trim()
    setInput('')
    store.addMessage({ role: 'user', content: strategy })
    store.setIsProcessing(true)

    const strategyId = store.addStrategy(strategy)

    try {
      // Always use runAgentPipeline - it handles Playbook + Skill Hub internally
      // Playbook API is called inside the pipeline if key is provided
      // Skill Hub is always executed as the primary analysis source
      const decision = await runAgentPipeline(
        strategy,
        store.selectedCoin,
        store.tradingMode,
        store.bitgetConfig.playbookApiKey || undefined
      )

      // Build structured Skill Hub output for chat display
      const skillHubLines: string[] = []

      // Header with analysis source
      const hasPlaybookKey = !!store.bitgetConfig.playbookApiKey
      skillHubLines.push(`📊 ${tr.chat.strategyAnalyzed}`)
      skillHubLines.push(`━━━━━━━━━━━━━━━━━━━━`)

      // Perception: Sentiment
      if (decision.perception.sentiment) {
        const s = decision.perception.sentiment
        const emoji = s.label === 'Bullish' ? '🟢' : s.label === 'Bearish' ? '🔴' : '🟡'
        skillHubLines.push(`${emoji} Sentiment: ${s.label} (${s.score > 0 ? '+' : ''}${s.score.toFixed(2)})`)
      }

      // Perception: Technical
      if (decision.perception.technical) {
        const t = decision.perception.technical
        const emoji = t.signal === 'BUY' ? '📈' : t.signal === 'SELL' ? '📉' : '➡️'
        skillHubLines.push(`${emoji} Technical: ${t.signal}`)
        if (t.indicators) {
          if (t.indicators.rsi) skillHubLines.push(`   RSI: ${t.indicators.rsi}`)
          if (t.indicators.macd) skillHubLines.push(`   MACD: ${t.indicators.macd}`)
        }
      }

      // Perception: News
      if (decision.perception.news) {
        const n = decision.perception.news
        skillHubLines.push(`📰 News: ${n.summary || 'No significant news'}`)
      }

      // Perception: On-chain
      if (decision.perception.onChain) {
        const o = decision.perception.onChain
        skillHubLines.push(`⛓️ On-chain: ${o.summary || 'No data'}`)
      }

      // Analysis conclusion
      skillHubLines.push(`━━━━━━━━━━━━━━━━━━━━`)
      const actionEmoji = decision.analysis.action === 'buy' ? '🟢' : decision.analysis.action === 'sell' ? '🔴' : '🟡'
      skillHubLines.push(`${actionEmoji} Action: ${decision.analysis.action.toUpperCase()} (${(decision.analysis.confidence * 100).toFixed(0)}% confidence)`)

      // Playbook status
      if (hasPlaybookKey) {
        skillHubLines.push(`✅ Playbook Key: Active (supplementary)`)
      }
      skillHubLines.push(`🤖 Source: Skill Hub Analysis`)

      store.addMessage({
        role: 'assistant',
        content: skillHubLines.join('\n'),
        decision,
      })
      addToast(tr.chat.strategyAnalyzed, 'success')

      store.updateStrategy(strategyId, decision, 'completed')

      // If action is buy/sell, create trade log
      if (decision.execution.action !== 'hold') {
        const log: Omit<TradeLog, 'id'> = {
          timestamp: Date.now(),
          symbol: decision.execution.symbol,
          side: decision.execution.action === 'buy' ? 'buy' : 'sell',
          amount: decision.execution.amount,
          price: decision.execution.price,
          total: decision.execution.amount * decision.execution.price,
          mode: store.tradingMode,
          strategy,
        }
        store.addTradeLog(log)
      }
    } catch {
      store.addMessage({ role: 'assistant', content: tr.common.error })
      store.updateStrategy(strategyId, undefined as unknown as AgentDecision, 'error')
      addToast(tr.common.error, 'error')
    }

    store.setIsProcessing(false)
  }, [input, store, tr, addToast])

  // ============ EXECUTE ORDER ============
  const executeOrder = useCallback(async (decision: AgentDecision) => {
    if (store.tradingMode === 'real') {
      setOrderConfirm({
        decision,
        callback: async () => {
          try {
            const result = await placeOrder({
              symbol: decision.execution.symbol,
              side: decision.execution.action === 'buy' ? 'buy' : 'sell',
              amount: decision.execution.amount,
              price: decision.execution.price,
              orderType: decision.execution.orderType,
            })
            if (result.ok) {
              addToast('Order placed successfully!', 'success')
            } else {
              addToast(result.error || 'Order failed', 'error')
            }
          } catch {
            addToast('Order failed', 'error')
          }
          setOrderConfirm(null)
        },
      })
    } else {
      addToast(`Simulated order: ${decision.execution.action.toUpperCase()} ${decision.execution.amount} ${decision.execution.symbol}`, 'info')
    }
  }, [store.tradingMode, addToast])

  // ============ SAVE SETTINGS ============
  const saveSettings = useCallback(() => {
    store.setBitgetConfig(settingsApi)
    addToast(tr.settings.save + ' ✓', 'success')
  }, [settingsApi, store, tr, addToast])

  // ============ SAVE PLAYBOOK KEY ============
  const savePlaybookKey = useCallback(() => {
    store.setBitgetConfig({ playbookApiKey: playbookKeyInput })
    addToast(tr.chat.playbookKey + ' ' + tr.settings.configured, 'success')
  }, [playbookKeyInput, store, tr, addToast])

  // ============ TEST CONNECTION ============
  const testConnection = useCallback(async () => {
    if (!settingsApi.apiKey || !settingsApi.secretKey || !settingsApi.passphrase) {
      addToast('Please fill in all API credentials first', 'error')
      return
    }
    try {
      const res = await fetch('/api/bitget/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsApi),
      })
      const data = await res.json()
      if (data.ok) {
        addToast(tr.settings.connectionSuccess, 'success')
      } else {
        const errMsg = data.error || 'Unknown error'
        // Check for IP whitelist error specifically
        if (String(errMsg).includes('Invalid IP')) {
          addToast('❌ IP Whitelist Error: Go to Bitget > API Management > Edit your API Key > Add "0.0.0.0/0" to IP Whitelist', 'error')
        } else if (String(errMsg).includes('Invalid')) {
          addToast(`❌ Authentication Error: ${errMsg}. Check your API Key, Secret, and Passphrase.`, 'error')
        } else {
          addToast(`❌ ${tr.settings.connectionFailed}: ${errMsg}`, 'error')
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error'
      addToast(`❌ ${tr.settings.connectionFailed}: ${msg}`, 'error')
    }
  }, [settingsApi, tr, addToast])

  // ============ EXPORT CSV ============
  const handleExportCSV = useCallback(() => {
    if (store.tradeLogs.length === 0) {
      addToast(tr.dashboard.noTrades, 'warning')
      return
    }
    downloadCSV(
      store.tradeLogs.map(log => ({
        timestamp: new Date(log.timestamp).toISOString(),
        symbol: log.symbol,
        side: log.side,
        amount: log.amount,
        price: log.price,
        total: log.total,
        pnl: log.pnl || 0,
        mode: log.mode,
        strategy: log.strategy,
      })),
      `bitget-trading-log-${new Date().toISOString().split('T')[0]}.csv`
    )
    addToast('CSV exported!', 'success')
  }, [store.tradeLogs, tr, addToast])

  // ============ DERIVED DATA ============
  const currentTicker = store.tickerData[store.selectedCoin]
  const performanceMetrics = React.useMemo(() => {
    const logs = store.tradeLogs
    const withPnl = logs.filter(l => l.pnl !== undefined)
    const wins = withPnl.filter(l => (l.pnl || 0) > 0)
    const losses = withPnl.filter(l => (l.pnl || 0) < 0)
    const totalPnl = withPnl.reduce((sum, l) => sum + (l.pnl || 0), 0)
    const avgWin = wins.length > 0 ? wins.reduce((s, l) => s + (l.pnl || 0), 0) / wins.length : 0
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, l) => s + (l.pnl || 0), 0) / losses.length) : 1
    const winRate = withPnl.length > 0 ? (wins.length / withPnl.length) * 100 : 0

    // Max drawdown
    let peak = 0
    let maxDD = 0
    let cumPnl = 0
    for (const l of withPnl) {
      cumPnl += l.pnl || 0
      if (cumPnl > peak) peak = cumPnl
      const dd = peak - cumPnl
      if (dd > maxDD) maxDD = dd
    }

    return {
      winRate,
      totalPnl,
      maxDrawdown: maxDD,
      sharpeRatio: avgLoss > 0 ? (avgWin / avgLoss) * Math.sqrt(winRate / 100) : 0,
      totalTrades: logs.length,
      winningTrades: wins.length,
      losingTrades: losses.length,
      avgWin,
      avgLoss,
      profitFactor: avgLoss > 0 ? (wins.reduce((s, l) => s + (l.pnl || 0), 0)) / (losses.reduce((s, l) => s + Math.abs(l.pnl || 0), 0) || 1) : 0,
    }
  }, [store.tradeLogs])

  // ============ RENDER DECISION FLOW ============
  const renderDecisionFlow = (decision: AgentDecision) => (
    <div className="mt-3 space-y-2 animate-slide-up">
      {/* Perception */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-2">
          <IconEye className="w-4 h-4" />
          {tr.decision.perception}
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          {decision.perception.priceData && (
            <p>💰 {decision.perception.priceData.symbol}: {formatCurrency(decision.perception.priceData.lastPrice)} ({formatPercent(decision.perception.priceData.change24h)})</p>
          )}
          {decision.perception.sentiment && (
            <p>📊 Sentiment: {decision.perception.sentiment.label} ({(decision.perception.sentiment.score * 100).toFixed(0)}%)</p>
          )}
          {decision.perception.technical && (
            <p>📈 Technical: {decision.perception.technical.signal} — {decision.perception.technical.summary}</p>
          )}
          {decision.perception.news && (
            <p>📰 News: {decision.perception.news.summary}</p>
          )}
          {decision.perception.onChain && (
            <p>⛓️ On-Chain: {decision.perception.onChain.summary}</p>
          )}
        </div>
      </div>

      {/* Analysis */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
        <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm mb-2">
          <IconBot className="w-4 h-4" />
          {tr.decision.analysis}
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          {decision.analysis.reasoning.map((r, i) => (
            <p key={i}>→ {r}</p>
          ))}
          <p className="font-medium text-foreground mt-1">{tr.decision.conclusion}: {decision.analysis.conclusion}</p>
        </div>
      </div>

      {/* Execution */}
      <div className={cn(
        'rounded-lg p-3 border',
        decision.execution.action === 'buy' ? 'bg-emerald-500/10 border-emerald-500/20' :
        decision.execution.action === 'sell' ? 'bg-red-500/10 border-red-500/20' :
        'bg-yellow-500/10 border-yellow-500/20'
      )}>
        <div className={cn(
          'flex items-center gap-2 font-semibold text-sm mb-2',
          decision.execution.action === 'buy' ? 'text-emerald-400' :
          decision.execution.action === 'sell' ? 'text-red-400' :
          'text-yellow-400'
        )}>
          <IconPlay className="w-4 h-4" />
          {tr.decision.execution}
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p className={cn(
            'font-bold text-lg',
            decision.execution.action === 'buy' ? 'text-emerald-400' :
            decision.execution.action === 'sell' ? 'text-red-400' :
            'text-yellow-400'
          )}>
            {decision.execution.action.toUpperCase()} {decision.execution.symbol}
          </p>
          <p>Amount: {decision.execution.amount} @ {formatCurrency(decision.execution.price)}</p>
          <p>Confidence: {(decision.analysis.confidence * 100).toFixed(0)}%</p>
          {decision.execution.orderId && <p>Order ID: {decision.execution.orderId}</p>}
        </div>
        {decision.execution.action !== 'hold' && (
          <button
            onClick={() => executeOrder(decision)}
            className={cn(
              'mt-2 px-3 py-1 rounded text-xs font-medium',
              decision.execution.action === 'buy' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' :
              'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            )}
          >
            {store.tradingMode === 'simulated' ? '⚡ Simulate Order' : '⚡ Execute Order'}
          </button>
        )}
      </div>

      {/* Risk */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
          <IconAlert className="w-4 h-4" />
          {tr.decision.risk}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <p>🛑 {tr.decision.stopLoss}: {formatCurrency(decision.risk.stopLoss)}</p>
          <p>🎯 {tr.decision.takeProfit}: {formatCurrency(decision.risk.takeProfit)}</p>
          <p>📐 {tr.decision.positionSize}: {formatCurrency(decision.risk.positionSize)}</p>
          <p>⚖️ {tr.decision.riskReward}: 1:{decision.risk.riskRewardRatio.toFixed(1)}</p>
        </div>
      </div>
    </div>
  )

  // ============ RENDER PAGES ============
  const renderChatPage = () => (
    <div className="flex flex-col h-full">
      {/* Ticker Bar */}
      <div className="flex-shrink-0 border-b border-border bg-card/50 overflow-x-auto">
        <div className="flex items-center gap-4 px-4 py-2 min-w-max">
          {COIN_LIST.map(coin => {
            const ticker = store.tickerData[coin.symbol] as TickerData | undefined
            return (
              <button
                key={coin.symbol}
                onClick={() => store.setSelectedCoin(coin.symbol)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap',
                  store.selectedCoin === coin.symbol
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'hover:bg-muted text-muted-foreground'
                )}
              >
                <span className="font-mono">{coin.icon}</span>
                <span className="font-medium">{coin.name}</span>
                {ticker && (
                  <span className={cn(
                    'font-mono text-xs',
                    ticker.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    ${ticker.lastPrice > 1 ? ticker.lastPrice.toLocaleString() : ticker.lastPrice}
                    <span className="ml-1">{formatPercent(ticker.change24h)}</span>
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Analysis Source Status */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-border bg-card/30">
        <div className="flex items-center gap-2 text-xs">
          <span className={cn(
            'w-2 h-2 rounded-full',
            'bg-emerald-400'
          )} />
          <span className="text-emerald-400">
            🤖 Skill Hub Active
          </span>
          {store.bitgetConfig.playbookApiKey && (
            <span className="text-amber-400 ml-2">
              ✅ Playbook Key (supplementary)
            </span>
          )}
          {!store.bitgetConfig.playbookApiKey && (
            <span className="text-muted-foreground ml-2">
              Playbook: Not configured
              <span className="text-primary cursor-pointer hover:underline ml-1" onClick={() => store.setActivePage('settings')}>
                → Settings
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
        {store.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <IconBot className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold gradient-text">{tr.app.title}</h2>
              <p className="text-muted-foreground text-sm mt-1">{tr.app.subtitle}</p>
            </div>
            {/* Example Strategies */}
            <div className="space-y-2 w-full max-w-lg">
              <p className="text-xs text-muted-foreground font-medium">{tr.chat.examples}</p>
              {[
                tr.chat.example1, tr.chat.example2, tr.chat.example3,
                tr.chat.example4, tr.chat.example5, tr.chat.example6,
              ].map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setInput(ex)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {store.messages.map(msg => (
          <div key={msg.id} className={cn(
            'flex gap-3 animate-slide-up',
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          )}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <IconBot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={cn(
              'max-w-[80%] rounded-2xl px-4 py-3',
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border'
            )}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.decision && renderDecisionFlow(msg.decision)}
            </div>
          </div>
        ))}

        {store.isProcessing && (
          <div className="flex gap-3 animate-slide-up">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <IconBot className="w-4 h-4 text-primary animate-pulse-glow" />
            </div>
            <div className="bg-card border border-border rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                {tr.chat.thinking}
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-sm p-4">
        {/* Example buttons (collapsed) */}
        {store.messages.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto hide-scrollbar">
            {[tr.chat.example1, tr.chat.example2, tr.chat.example3].map((ex, i) => (
              <button
                key={i}
                onClick={() => setInput(ex)}
                className="flex-shrink-0 px-2 py-1 rounded-full bg-muted/50 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {ex.substring(0, 30)}...
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder={tr.chat.placeholder}
            className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px] max-h-32"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || store.isProcessing}
            className="px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <IconSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )

  const renderDashboardPage = () => (
    <div className="p-4 space-y-6 overflow-y-auto h-full">
      {/* Price Display */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {COIN_LIST.map(coin => {
          const ticker = store.tickerData[coin.symbol] as TickerData | undefined
          return (
            <button
              key={coin.symbol}
              onClick={() => store.setSelectedCoin(coin.symbol)}
              className={cn(
                'p-3 rounded-xl border transition-all text-left',
                store.selectedCoin === coin.symbol
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-card border-border hover:border-primary/20'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-lg">{coin.icon}</span>
                <span className="text-xs text-muted-foreground">{coin.name}</span>
              </div>
              {ticker ? (
                <>
                  <p className="font-bold font-mono text-sm">
                    ${ticker.lastPrice > 1 ? ticker.lastPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : ticker.lastPrice}
                  </p>
                  <p className={cn('text-xs font-mono', ticker.change24h >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {formatPercent(ticker.change24h)}
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">{tr.common.loading}</p>
              )}
            </button>
          )
        })}
      </div>

      {/* Account Balance */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IconWallet className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">{tr.dashboard.assetOverview}</h3>
            {store.bitgetConfig.apiKey && accountBalances.length > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400">LIVE</span>
            )}
            {!store.bitgetConfig.apiKey && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400">SIMULATED</span>
            )}
          </div>
          <button 
            onClick={fetchAccountData} 
            disabled={accountLoading}
            className={cn(
              "text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors",
              accountLoading 
                ? "bg-muted text-muted-foreground cursor-wait" 
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            <IconRefresh className={cn("w-3 h-3", accountLoading && "animate-spin")} />
            {accountLoading ? 'Loading...' : 'Refresh Assets'}
          </button>
        </div>

        {/* IP Whitelist Error Banner */}
        {store.accountError && (
          <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400 space-y-1">
            <p className="font-semibold">⚠️ API Connection Error</p>
            <p>{store.accountError}</p>
            <p className="text-amber-400/70">💡 Tip: Public market data (prices, K-lines) works without API keys. Only private endpoints (balance, positions, orders) require IP whitelisting.</p>
          </div>
        )}

        {/* No API Keys Warning */}
        {!store.bitgetConfig.apiKey && (
          <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-400 space-y-1">
            <p className="font-semibold">ℹ️ Simulated Mode</p>
            <p>Showing simulated account data. Go to Settings to add your Bitget API credentials for real balance &amp; positions.</p>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">{tr.dashboard.balance}</p>
            <p className="font-bold text-lg font-mono">
              {accountBalances.length > 0
                ? formatCurrency(accountBalances.reduce((sum, b) => sum + parseFloat(b.equity || b.usdtValue || b.total || '0'), 0))
                : formatCurrency(store.balance)}
            </p>
            {accountBalances.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {accountBalances.slice(0, 3).map((b) => (
                  <p key={b.marginCoin || b.coin} className="text-xs text-muted-foreground font-mono">
                    {b.marginCoin || b.coin}: {parseFloat(b.available || '0').toFixed(4)}
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">{tr.dashboard.positions}</p>
            <p className="font-bold text-lg">{accountPositions.length}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">{tr.dashboard.totalPnl}</p>
            <p className={cn('font-bold text-lg font-mono', performanceMetrics.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
              {formatCurrency(performanceMetrics.totalPnl)}
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">{tr.dashboard.winRate}</p>
            <p className="font-bold text-lg font-mono">{performanceMetrics.winRate.toFixed(1)}%</p>
          </div>
        </div>
        {/* Account positions */}
        {accountPositions.length > 0 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2">Symbol</th>
                  <th className="text-left py-2">Side</th>
                  <th className="text-right py-2">Size</th>
                  <th className="text-right py-2">Entry</th>
                  <th className="text-right py-2">Mark</th>
                  <th className="text-right py-2">PnL</th>
                </tr>
              </thead>
              <tbody>
                {accountPositions.slice(0, 5).map((pos: PositionData, i: number) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1.5 font-medium">{pos.symbol}</td>
                    <td className={cn('py-1.5', pos.holdSide === 'long' ? 'text-emerald-400' : 'text-red-400')}>{pos.holdSide || pos.side}</td>
                    <td className="text-right py-1.5 font-mono">{pos.total || pos.size}</td>
                    <td className="text-right py-1.5 font-mono">{pos.averageOpenPrice || pos.avgPrice}</td>
                    <td className="text-right py-1.5 font-mono">{pos.markPrice}</td>
                    <td className={cn('text-right py-1.5 font-mono', parseFloat(pos.unrealizedPL || '0') >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {pos.unrealizedPL || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {accountLoading && <p className="text-xs text-muted-foreground mt-2">{tr.common.loading}</p>}
      </div>

      {/* Price Chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-semibold">{tr.dashboard.priceChart}</h3>
          <div className="flex items-center gap-2">
            {/* Coin selector */}
            <select
              value={store.selectedCoin}
              onChange={e => store.setSelectedCoin(e.target.value as CoinSymbol)}
              className="bg-muted/50 border border-border rounded-lg px-2 py-1 text-xs"
            >
              {COIN_LIST.map(c => <option key={c.symbol} value={c.symbol}>{c.name}</option>)}
            </select>
            {/* Interval selector */}
            <div className="flex gap-1">
              {CHART_INTERVALS.map(iv => (
                <button
                  key={iv.value}
                  onClick={() => store.setChartInterval(iv.value)}
                  className={cn(
                    'px-2 py-1 rounded text-xs',
                    store.chartInterval === iv.value ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  )}
                >
                  {iv.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {currentTicker && (
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl font-bold font-mono">
              ${currentTicker.lastPrice > 1 ? currentTicker.lastPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : currentTicker.lastPrice}
            </span>
            <span className={cn('text-sm font-mono font-semibold px-2 py-0.5 rounded', currentTicker.change24h >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10')}>
              {formatPercent(currentTicker.change24h)}
            </span>
          </div>
        )}
        <CandlestickChart data={store.priceHistory} lang={store.language} />
      </div>

      {/* Performance Metrics */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold mb-3">{tr.dashboard.performance}</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: tr.dashboard.winRate, value: `${performanceMetrics.winRate.toFixed(1)}%`, color: performanceMetrics.winRate >= 50 ? 'text-emerald-400' : 'text-red-400' },
            { label: tr.dashboard.totalPnl, value: formatCurrency(performanceMetrics.totalPnl), color: performanceMetrics.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400' },
            { label: tr.dashboard.maxDrawdown, value: formatCurrency(performanceMetrics.maxDrawdown), color: 'text-red-400' },
            { label: tr.dashboard.sharpeRatio, value: performanceMetrics.sharpeRatio.toFixed(2), color: performanceMetrics.sharpeRatio >= 1 ? 'text-emerald-400' : 'text-yellow-400' },
            { label: tr.dashboard.profitFactor, value: performanceMetrics.profitFactor.toFixed(2), color: performanceMetrics.profitFactor >= 1 ? 'text-emerald-400' : 'text-red-400' },
            { label: tr.dashboard.totalTrades, value: String(performanceMetrics.totalTrades), color: 'text-foreground' },
            { label: tr.dashboard.winningTrades, value: String(performanceMetrics.winningTrades), color: 'text-emerald-400' },
            { label: tr.dashboard.losingTrades, value: String(performanceMetrics.losingTrades), color: 'text-red-400' },
          ].map((m, i) => (
            <div key={i} className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={cn('font-bold font-mono', m.color)}>{m.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <PerformanceChart tradeLogs={store.tradeLogs} />
        </div>
      </div>

      {/* Trade Log */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{tr.dashboard.tradeLog}</h3>
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs hover:bg-primary/20 transition-colors">
              <IconDownload className="w-3 h-3" />
              {tr.dashboard.exportCSV}
            </button>
          </div>
        </div>
        {store.tradeLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{tr.dashboard.noTrades}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Symbol</th>
                  <th className="text-left py-2">Side</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Total</th>
                  <th className="text-right py-2">PnL</th>
                  <th className="text-left py-2">Mode</th>
                </tr>
              </thead>
              <tbody>
                {store.tradeLogs.slice(-20).reverse().map(log => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="py-1.5 text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-1.5 font-medium">{log.symbol}</td>
                    <td className={cn('py-1.5 font-medium', log.side === 'buy' ? 'text-emerald-400' : 'text-red-400')}>{log.side.toUpperCase()}</td>
                    <td className="text-right py-1.5 font-mono">{log.amount}</td>
                    <td className="text-right py-1.5 font-mono">{log.price.toFixed(2)}</td>
                    <td className="text-right py-1.5 font-mono">{log.total.toFixed(2)}</td>
                    <td className={cn('text-right py-1.5 font-mono', (log.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {log.pnl ? formatCurrency(log.pnl) : '-'}
                    </td>
                    <td className="py-1.5">
                      <span className={cn('px-1.5 py-0.5 rounded text-[10px]', log.mode === 'simulated' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400')}>
                        {log.mode}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )

  const renderHistoryPage = () => (
    <div className="p-4 space-y-3 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{tr.history.title}</h2>
        {store.strategyHistory.length > 0 && (
          <button onClick={() => store.clearHistory()} className="flex items-center gap-1 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-xs hover:bg-destructive/20">
            <IconTrash className="w-3 h-3" />
            {tr.history.clearAll}
          </button>
        )}
      </div>
      {store.strategyHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <IconHistory className="w-12 h-12 mb-3 opacity-30" />
          <p>{tr.history.empty}</p>
        </div>
      ) : (
        [...store.strategyHistory].reverse().map(item => (
          <div key={item.id} className="bg-card border border-border rounded-xl p-4 animate-slide-up">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.input}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(item.timestamp).toLocaleString()} · 
                  <span className={cn(
                    'ml-1',
                    item.status === 'completed' ? 'text-emerald-400' :
                    item.status === 'running' ? 'text-blue-400' :
                    item.status === 'error' ? 'text-red-400' : 'text-muted-foreground'
                  )}>
                    {item.status}
                  </span>
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => { setInput(item.input); store.setActivePage('chat') }}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                  title={tr.history.rerun}
                >
                  <IconPlay className="w-4 h-4" />
                </button>
                <button
                  onClick={() => store.deleteStrategy(item.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  title={tr.history.delete}
                >
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
            {item.decision && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className={cn(
                  'px-2 py-0.5 rounded font-medium',
                  item.decision.execution.action === 'buy' ? 'bg-emerald-500/10 text-emerald-400' :
                  item.decision.execution.action === 'sell' ? 'bg-red-500/10 text-red-400' :
                  'bg-yellow-500/10 text-yellow-400'
                )}>
                  {item.decision.execution.action.toUpperCase()}
                </span>
                <span className="text-muted-foreground">{item.decision.execution.symbol}</span>
                <span className="text-muted-foreground">Confidence: {(item.decision.analysis.confidence * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )

  const renderSettingsPage = () => (
    <div className="p-4 space-y-6 overflow-y-auto h-full">
      <h2 className="text-lg font-bold">{tr.settings.title}</h2>

      {/* Playbook API Key */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{tr.chat.playbookKey}</h3>
          <span className={cn(
            'px-2 py-0.5 rounded text-xs',
            store.bitgetConfig.playbookApiKey ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'
          )}>
            {store.bitgetConfig.playbookApiKey ? tr.settings.configured : tr.settings.notConfigured}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {tr.help.apiDesc}
        </p>
        <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-400">
          💡 Skill Hub is always active as the primary analysis source. Playbook Key adds supplementary analysis when available.
        </div>
        <div className="flex gap-2">
          <input
            type="password"
            value={playbookKeyInput}
            onChange={e => setPlaybookKeyInput(e.target.value)}
            placeholder={tr.chat.apiKeyInput}
            className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button onClick={savePlaybookKey} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90">
            {tr.chat.saveKey}
          </button>
        </div>
      </div>

      {/* Bitget API */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="font-semibold">{tr.settings.bitgetApi}</h3>
        <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400">
          ⚠️ IP Whitelist: If you get &quot;Invalid IP&quot; errors, add &quot;0.0.0.0/0&quot; to your Bitget API Key IP whitelist. Go to: Bitget &gt; API Management &gt; Edit &gt; IP Whitelist
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-muted-foreground">{tr.settings.apiKey}</label>
            <input
              type="password"
              value={settingsApi.apiKey}
              onChange={e => setSettingsApi(prev => ({ ...prev, apiKey: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{tr.settings.secretKey}</label>
            <input
              type="password"
              value={settingsApi.secretKey}
              onChange={e => setSettingsApi(prev => ({ ...prev, secretKey: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{tr.settings.passphrase}</label>
            <input
              type="password"
              value={settingsApi.passphrase}
              onChange={e => setSettingsApi(prev => ({ ...prev, passphrase: e.target.value }))}
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={saveSettings} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90">
            {tr.settings.save}
          </button>
          <button onClick={testConnection} className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80">
            {tr.settings.testConnection}
          </button>
        </div>
        {/* Key Status */}
        <div className="flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">{tr.settings.keyStatus}:</span>
          <span className={cn('flex items-center gap-1', settingsApi.apiKey ? 'text-emerald-400' : 'text-muted-foreground')}>
            <span className={cn('w-1.5 h-1.5 rounded-full', settingsApi.apiKey ? 'bg-emerald-400' : 'bg-muted-foreground')} />
            API Key {settingsApi.apiKey ? tr.settings.configured : tr.settings.notConfigured}
          </span>
          <span className={cn('flex items-center gap-1', settingsApi.secretKey ? 'text-emerald-400' : 'text-muted-foreground')}>
            <span className={cn('w-1.5 h-1.5 rounded-full', settingsApi.secretKey ? 'bg-emerald-400' : 'bg-muted-foreground')} />
            Secret {settingsApi.secretKey ? tr.settings.configured : tr.settings.notConfigured}
          </span>
        </div>
        {/* IP Whitelist Guide */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400 space-y-1">
          <p className="font-semibold">🔒 IP Whitelist Configuration (Required for Private API)</p>
          <p>If you see &quot;Invalid IP&quot; errors, you need to add your server IP to the Bitget API Key whitelist:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-amber-400/80">
            <li>Log in to Bitget → API Management</li>
            <li>Find your API Key → Edit</li>
            <li>Add &quot;0.0.0.0/0&quot; (allow all IPs) or the specific server IP</li>
            <li>Save and wait 5 minutes for changes to take effect</li>
          </ol>
          <p className="text-amber-400/60">Note: Public market data (prices, K-lines) works without API keys or IP whitelisting.</p>
        </div>
      </div>

      {/* Theme & Language */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="font-semibold">{tr.settings.theme} & {tr.settings.language}</h3>
        <div className="flex gap-3">
          <button
            onClick={() => store.setTheme('dark')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm',
              store.theme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            <IconMoon className="w-4 h-4" /> {tr.settings.dark}
          </button>
          <button
            onClick={() => store.setTheme('light')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm',
              store.theme === 'light' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            <IconSun className="w-4 h-4" /> {tr.settings.light}
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => store.setLanguage('en')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm',
              store.language === 'en' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            English
          </button>
          <button
            onClick={() => store.setLanguage('zh')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm',
              store.language === 'zh' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            中文
          </button>
        </div>
      </div>

      {/* Trading Mode */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="font-semibold">{tr.chat.mode}</h3>
        <div className="flex gap-3">
          <button
            onClick={() => store.setTradingMode('simulated')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm',
              store.tradingMode === 'simulated' ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'
            )}
          >
            🧪 {tr.chat.simulated}
          </button>
          <button
            onClick={() => {
              if (store.tradingMode === 'simulated') setRealModeConfirm(true)
            }}
            className={cn(
              'px-4 py-2 rounded-lg text-sm',
              store.tradingMode === 'real' ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'
            )}
          >
            🔴 {tr.chat.real}
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold mb-2">{tr.settings.about}</h3>
        <p className="text-sm text-muted-foreground">{tr.settings.aboutText}</p>
      </div>
    </div>
  )

  // ============ MAIN RENDER ============
  return (
    <div className={cn('h-screen flex flex-col bg-background text-foreground', store.theme === 'dark' && 'dark')}>
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => store.setSidebarOpen(!store.sidebarOpen)} className="md:hidden p-1.5 rounded-lg hover:bg-muted">
              <IconMenu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                <IconBot className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold gradient-text">{tr.app.title}</h1>
                <p className="text-[10px] text-muted-foreground">{tr.app.subtitle}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mode indicator */}
            <span className={cn(
              'px-2 py-1 rounded-full text-[10px] font-medium',
              store.tradingMode === 'simulated' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
            )}>
              {store.tradingMode === 'simulated' ? `🧪 ${tr.chat.simulated}` : `🔴 ${tr.chat.real}`}
            </span>
            {/* Theme toggle */}
            <button onClick={() => store.setTheme(store.theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg hover:bg-muted">
              {store.theme === 'dark' ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
            </button>
            {/* Language toggle */}
            <button onClick={() => store.setLanguage(store.language === 'en' ? 'zh' : 'en')} className="px-2 py-1 rounded-lg hover:bg-muted text-xs font-medium">
              {store.language === 'en' ? '中' : 'EN'}
            </button>
            {/* Help */}
            <button onClick={() => store.setHelpOpen(true)} className="p-2 rounded-lg hover:bg-muted">
              <IconHelp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className={cn(
          'flex-shrink-0 border-r border-border bg-card/50 transition-all duration-300 z-20',
          'md:w-16 md:relative md:translate-x-0',
          store.sidebarOpen ? 'absolute inset-y-0 left-0 w-56 translate-x-0 mt-[57px]' : 'absolute inset-y-0 left-0 w-56 -translate-x-full mt-[57px]'
        )}>
          <div className="flex flex-col items-center md:items-stretch py-4 gap-1 px-2">
            {[
              { id: 'chat' as const, icon: IconBot, label: tr.nav.chat },
              { id: 'dashboard' as const, icon: IconDashboard, label: tr.nav.dashboard },
              { id: 'history' as const, icon: IconHistory, label: tr.nav.history },
              { id: 'settings' as const, icon: IconSettings, label: tr.nav.settings },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { store.setActivePage(item.id); store.setSidebarOpen(false) }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  store.activePage === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="md:hidden whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {store.activePage === 'chat' && renderChatPage()}
          {store.activePage === 'dashboard' && renderDashboardPage()}
          {store.activePage === 'history' && renderHistoryPage()}
          {store.activePage === 'settings' && renderSettingsPage()}
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-around py-2">
          {[
            { id: 'chat' as const, icon: IconBot, label: tr.nav.chat },
            { id: 'dashboard' as const, icon: IconDashboard, label: tr.nav.dashboard },
            { id: 'history' as const, icon: IconHistory, label: tr.nav.history },
            { id: 'settings' as const, icon: IconSettings, label: tr.nav.settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => store.setActivePage(item.id)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs',
                store.activePage === item.id ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Real Mode Confirmation */}
      {realModeConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <IconAlert className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="font-bold text-lg">{tr.chat.realConfirm.split('.')[0]}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{tr.chat.realConfirm}</p>
            <div className="flex gap-3">
              <button onClick={() => setRealModeConfirm(false)} className="flex-1 px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80">
                {tr.common.cancel}
              </button>
              <button onClick={() => { store.setTradingMode('real'); setRealModeConfirm(false); addToast('Real mode activated', 'warning') }} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                {tr.common.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation */}
      {orderConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <IconAlert className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="font-bold">Confirm Real Order</h3>
            </div>
            <div className="text-sm space-y-1 mb-4">
              <p>Action: <span className={cn('font-bold', orderConfirm.decision.execution.action === 'buy' ? 'text-emerald-400' : 'text-red-400')}>{orderConfirm.decision.execution.action.toUpperCase()}</span></p>
              <p>Symbol: {orderConfirm.decision.execution.symbol}</p>
              <p>Amount: {orderConfirm.decision.execution.amount}</p>
              <p>Price: {formatCurrency(orderConfirm.decision.execution.price)}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setOrderConfirm(null)} className="flex-1 px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80">
                {tr.common.cancel}
              </button>
              <button onClick={orderConfirm.callback} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {store.helpOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{tr.help.title}</h3>
              <button onClick={() => store.setHelpOpen(false)} className="p-1.5 rounded-lg hover:bg-muted">
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">{tr.help.intro}</p>
              <div>
                <h4 className="font-semibold mb-2">{tr.help.howToUse}</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>{tr.help.step1}</p>
                  <p>{tr.help.step2}</p>
                  <p>{tr.help.step3}</p>
                  <p>{tr.help.step4}</p>
                  <p>{tr.help.step5}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{tr.help.skills}</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>• {tr.help.skillMacro}</p>
                  <p>• {tr.help.skillSentiment}</p>
                  <p>• {tr.help.skillTechnical}</p>
                  <p>• {tr.help.skillNews}</p>
                  <p>• {tr.help.skillMarket}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{tr.help.apiConfig}</h4>
                <p className="text-muted-foreground">{tr.help.apiDesc}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} />
    </div>
  )
}
