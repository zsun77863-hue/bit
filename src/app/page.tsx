'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/store'
import { getTranslation } from '@/i18n'
import { cn, formatCurrency, formatPercent, downloadCSV, generateId } from '@/lib/utils'
import { COIN_LIST } from '@/lib/bitget'
import { AGENT_SKILLS, runAgentPipeline } from '@/lib/agent-hub'
import type { AgentDecision, TradeLog, CoinSymbol, TickerData, PriceData } from '@/types'

// ============ ICONS ============
function IconBot({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
  )
}
function IconSend({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
    </svg>
  )
}
function IconDashboard({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}
function IconChat({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  )
}
function IconHistory({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
    </svg>
  )
}
function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function IconSun({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}
function IconMoon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}
function IconHelp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
    </svg>
  )
}
function IconDownload({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}
function IconTrash({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}
function IconRefresh({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
    </svg>
  )
}
function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}
function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  )
}
function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
function IconAlertTriangle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  )
}
function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />
    </svg>
  )
}

// ============ TOAST SYSTEM ============
interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in-right',
            'max-w-xs sm:max-w-sm',
            toast.type === 'success' && 'bg-emerald-500/90 text-white',
            toast.type === 'error' && 'bg-red-500/90 text-white',
            toast.type === 'warning' && 'bg-amber-500/90 text-white',
            toast.type === 'info' && 'bg-blue-500/90 text-white',
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}

// ============ DECISION FLOW COMPONENT ============
function DecisionFlow({ decision, lang }: { decision: AgentDecision; lang: 'en' | 'zh' }) {
  const tr = getTranslation(lang)
  const [expandedStage, setExpandedStage] = useState<string | null>('perception')

  const stages = [
    { id: 'perception', label: tr.decision.perception, icon: '👁️', color: 'from-blue-500 to-cyan-500' },
    { id: 'analysis', label: tr.decision.analysis, icon: '🧠', color: 'from-purple-500 to-pink-500' },
    { id: 'execution', label: tr.decision.execution, icon: '⚡', color: 'from-emerald-500 to-green-500' },
    { id: 'risk', label: tr.decision.risk, icon: '🛡️', color: 'from-amber-500 to-orange-500' },
  ]

  return (
    <div className="space-y-2">
      {/* Stage Progress */}
      <div className="flex items-center gap-1 mb-3">
        {stages.map((stage, i) => (
          <React.Fragment key={stage.id}>
            <button
              onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                expandedStage === stage.id
                  ? `bg-gradient-to-r ${stage.color} text-white shadow-lg`
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <span>{stage.icon}</span>
              <span className="hidden sm:inline">{stage.label}</span>
            </button>
            {i < stages.length - 1 && (
              <div className="w-4 h-0.5 bg-border" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Expanded Stage Content */}
      {expandedStage === 'perception' && (
        <div className="bg-card/50 rounded-lg p-3 space-y-2 animate-slide-up border border-border/50">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{tr.decision.perception}</h4>
          {decision.perception.sentiment && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{tr.decision.sentiment}:</span>
              <span className={cn('font-medium', decision.perception.sentiment.score > 0 ? 'text-emerald-400' : 'text-red-400')}>
                {decision.perception.sentiment.label} ({decision.perception.sentiment.score.toFixed(2)})
              </span>
            </div>
          )}
          {decision.perception.technical && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{tr.decision.technical}:</span>
              <span className={cn('font-medium', decision.perception.technical.signal === 'BUY' ? 'text-emerald-400' : decision.perception.technical.signal === 'SELL' ? 'text-red-400' : 'text-yellow-400')}>
                {decision.perception.technical.signal}
              </span>
            </div>
          )}
          {decision.perception.news && (
            <div className="text-sm">
              <span className="text-muted-foreground">{tr.decision.news}: </span>
              <span>{decision.perception.news.summary}</span>
            </div>
          )}
          {decision.perception.onChain && (
            <div className="text-sm">
              <span className="text-muted-foreground">{tr.decision.onChain}: </span>
              <span>{decision.perception.onChain.summary}</span>
            </div>
          )}
        </div>
      )}

      {expandedStage === 'analysis' && (
        <div className="bg-card/50 rounded-lg p-3 space-y-2 animate-slide-up border border-border/50">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{tr.decision.analysis}</h4>
          <div className="space-y-1">
            {decision.analysis.reasoning.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-emerald-400 mt-0.5">→</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{tr.decision.conclusion}:</span>
              <span className="font-medium">{decision.analysis.conclusion}</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <span className="text-muted-foreground">{tr.decision.confidence}:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                    style={{ width: `${decision.analysis.confidence * 100}%` }}
                  />
                </div>
                <span className="font-medium">{(decision.analysis.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {expandedStage === 'execution' && (
        <div className="bg-card/50 rounded-lg p-3 space-y-2 animate-slide-up border border-border/50">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{tr.decision.execution}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">{tr.decision.action}:</span>
              <span className={cn(
                'ml-1 font-bold',
                decision.execution.action === 'buy' ? 'text-emerald-400' :
                decision.execution.action === 'sell' ? 'text-red-400' :
                'text-yellow-400'
              )}>
                {decision.execution.action === 'buy' ? tr.decision.buy :
                 decision.execution.action === 'sell' ? tr.decision.sell :
                 decision.execution.action === 'close' ? tr.decision.close : tr.decision.hold}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Symbol:</span>
              <span className="ml-1 font-medium">{decision.execution.symbol}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Amount:</span>
              <span className="ml-1 font-medium">{decision.execution.amount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Price:</span>
              <span className="ml-1 font-medium">${decision.execution.price.toLocaleString()}</span>
            </div>
          </div>
          {decision.execution.orderId && (
            <div className="text-xs text-muted-foreground mt-1">
              Order ID: {decision.execution.orderId}
            </div>
          )}
        </div>
      )}

      {expandedStage === 'risk' && (
        <div className="bg-card/50 rounded-lg p-3 space-y-2 animate-slide-up border border-border/50">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{tr.decision.risk}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">{tr.decision.stopLoss}:</span>
              <span className="ml-1 text-red-400 font-medium">${decision.risk.stopLoss.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{tr.decision.takeProfit}:</span>
              <span className="ml-1 text-emerald-400 font-medium">${decision.risk.takeProfit.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{tr.decision.positionSize}:</span>
              <span className="ml-1 font-medium">${decision.risk.positionSize.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{tr.decision.riskReward}:</span>
              <span className="ml-1 font-medium">{decision.risk.riskRewardRatio.toFixed(1)}:1</span>
            </div>
          </div>
          <div className="text-sm mt-1">
            <span className="text-muted-foreground">Max Drawdown: </span>
            <span className="text-amber-400 font-medium">${decision.risk.maxDrawdown.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ PRICE CHART COMPONENT ============
function PriceChart({ data }: { data: PriceData[]; coin: string; lang: 'en' | 'zh' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    const padding = { top: 20, right: 60, bottom: 30, left: 10 }
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom

    const closes = data.map(d => d.close)
    const minPrice = Math.min(...closes) * 0.998
    const maxPrice = Math.max(...closes) * 1.002
    const priceRange = maxPrice - minPrice

    // Clear
    ctx.clearRect(0, 0, w, h)

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(w - padding.right, y)
      ctx.stroke()

      // Price labels
      const price = maxPrice - (priceRange / 4) * i
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(price.toLocaleString(undefined, { maximumFractionDigits: 2 }), w - padding.right + 5, y + 3)
    }

    // Line chart
    const isUp = closes[closes.length - 1] >= closes[0]
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom)
    if (isUp) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)')
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)')
    }

    // Fill area
    ctx.beginPath()
    ctx.moveTo(padding.left, h - padding.bottom)
    for (let i = 0; i < closes.length; i++) {
      const x = padding.left + (chartW / (closes.length - 1)) * i
      const y = padding.top + chartH - ((closes[i] - minPrice) / priceRange) * chartH
      ctx.lineTo(x, y)
    }
    ctx.lineTo(padding.left + chartW, h - padding.bottom)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Line
    ctx.beginPath()
    for (let i = 0; i < closes.length; i++) {
      const x = padding.left + (chartW / (closes.length - 1)) * i
      const y = padding.top + chartH - ((closes[i] - minPrice) / priceRange) * chartH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = isUp ? '#10b981' : '#ef4444'
    ctx.lineWidth = 2
    ctx.stroke()

    // Current price line
    const lastPrice = closes[closes.length - 1]
    const lastY = padding.top + chartH - ((lastPrice - minPrice) / priceRange) * chartH
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(padding.left, lastY)
    ctx.lineTo(w - padding.right, lastY)
    ctx.strokeStyle = isUp ? '#10b981' : '#ef4444'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.setLineDash([])

    // Current price label
    ctx.fillStyle = isUp ? '#10b981' : '#ef4444'
    ctx.fillRect(w - padding.right, lastY - 8, 55, 16)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 9px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(lastPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }), w - padding.right + 3, lastY + 3)

  }, [data])

  return (
    <div className="w-full h-48 sm:h-64">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

// ============ PERFORMANCE CHART ============
function PerformanceChart({ tradeLogs }: { metrics: TradeLog[]; tradeLogs: TradeLog[]; lang: 'en' | 'zh' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || tradeLogs.length === 0) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    const padding = { top: 20, right: 10, bottom: 30, left: 50 }
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom

    // Calculate cumulative PnL
    let cumPnl = 0
    const pnlData = tradeLogs.slice().reverse().map((log) => {
      cumPnl += (log.pnl || 0)
      return cumPnl
    })

    if (pnlData.length === 0) return

    const minPnl = Math.min(0, ...pnlData)
    const maxPnl = Math.max(0, ...pnlData)
    const range = maxPnl - minPnl || 1

    ctx.clearRect(0, 0, w, h)

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(w - padding.right, y)
      ctx.stroke()

      const val = maxPnl - (range / 4) * i
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText('$' + val.toFixed(0), padding.left - 5, y + 3)
    }

    // Zero line
    const zeroY = padding.top + ((maxPnl - 0) / range) * chartH
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(padding.left, zeroY)
    ctx.lineTo(w - padding.right, zeroY)
    ctx.stroke()
    ctx.setLineDash([])

    // Area fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom)
    const isProfit = pnlData[pnlData.length - 1] >= 0
    if (isProfit) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)')
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)')
    }

    ctx.beginPath()
    ctx.moveTo(padding.left, zeroY)
    for (let i = 0; i < pnlData.length; i++) {
      const x = padding.left + (chartW / Math.max(pnlData.length - 1, 1)) * i
      const y = padding.top + ((maxPnl - pnlData[i]) / range) * chartH
      ctx.lineTo(x, y)
    }
    ctx.lineTo(padding.left + (chartW / Math.max(pnlData.length - 1, 1)) * (pnlData.length - 1), zeroY)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Line
    ctx.beginPath()
    for (let i = 0; i < pnlData.length; i++) {
      const x = padding.left + (chartW / Math.max(pnlData.length - 1, 1)) * i
      const y = padding.top + ((maxPnl - pnlData[i]) / range) * chartH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = isProfit ? '#10b981' : '#ef4444'
    ctx.lineWidth = 2
    ctx.stroke()

  }, [tradeLogs])

  return (
    <div className="w-full h-40 sm:h-52">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

// ============ MAIN APP ============
export default function HomePage() {
  const store = useAppStore()
  const tr = getTranslation(store.language)

  const [inputText, setInputText] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [realModeConfirm, setRealModeConfirm] = useState(false)
  const [playbookKeyInput, setPlaybookKeyInput] = useState(store.bitgetConfig.playbookApiKey)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [tickers, setTickers] = useState<Record<string, TickerData>>({})

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = generateId()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  // Load price data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [priceRes, tickerRes] = await Promise.all([
          fetch(`/api/bitget/candles?symbol=${store.selectedCoin}&limit=100`),
          fetch(`/api/bitget/ticker?symbol=${store.selectedCoin}`)
        ])
        if (priceRes.ok) setPriceData(await priceRes.json())
        if (tickerRes.ok) {
          const ticker = await tickerRes.json()
          setTickers(prev => ({ ...prev, [store.selectedCoin]: ticker }))
        }
      } catch {
        // Use fallback mock data
        const basePrices: Record<string, number> = {
          BTCUSDT: 67500, ETHUSDT: 3450, SOLUSDT: 178,
          BNBUSDT: 610, XRPUSDT: 0.62, DOGEUSDT: 0.165,
        }
        const base = basePrices[store.selectedCoin] || 100
        const now = Date.now()
        const mockPrice: PriceData[] = []
        let price = base
        for (let i = 100; i > 0; i--) {
          const change = (Math.random() - 0.48) * base * 0.02
          price += change
          mockPrice.push({
            timestamp: now - i * 3600000,
            open: price - change,
            high: price * (1 + Math.random() * 0.01),
            low: price * (1 - Math.random() * 0.01),
            close: price,
            volume: Math.random() * 10000000,
          })
        }
        setPriceData(mockPrice)
      }
    }
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [store.selectedCoin])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [store.messages])

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', store.theme === 'dark')
  }, [store.theme])

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || store.isProcessing) return

    const strategy = inputText.trim()
    setInputText('')
    store.addMessage({ role: 'user', content: strategy })
    store.setIsProcessing(true)

    const strategyId = store.addStrategy(strategy)

    try {
      // Determine symbol from strategy
      const symbolMap: Record<string, CoinSymbol> = {
        'btc': 'BTCUSDT', 'bitcoin': 'BTCUSDT',
        'eth': 'ETHUSDT', 'ethereum': 'ETHUSDT',
        'sol': 'SOLUSDT', 'solana': 'SOLUSDT',
        'bnb': 'BNBUSDT',
        'xrp': 'XRPUSDT', 'ripple': 'XRPUSDT',
        'doge': 'DOGEUSDT', 'dogecoin': 'DOGEUSDT',
      }
      let symbol: CoinSymbol = store.selectedCoin
      const strategyLower = strategy.toLowerCase()
      for (const [key, val] of Object.entries(symbolMap)) {
        if (strategyLower.includes(key)) {
          symbol = val
          break
        }
      }

      const decision = await runAgentPipeline(
        strategy,
        symbol,
        store.tradingMode,
        store.bitgetConfig.playbookApiKey
      )

      store.updateStrategy(strategyId, decision, 'completed')

      // Add trade log if action is buy/sell
      if (decision.execution.action === 'buy' || decision.execution.action === 'sell') {
        const pnl = (Math.random() - 0.3) * decision.risk.positionSize * 0.1
        store.addTradeLog({
          timestamp: Date.now(),
          symbol: decision.execution.symbol,
          side: decision.execution.action as 'buy' | 'sell',
          amount: decision.execution.amount,
          price: decision.execution.price,
          total: decision.execution.amount * decision.execution.price,
          pnl,
          mode: store.tradingMode,
          strategy,
        })

        // Update balance
        if (decision.execution.action === 'buy') {
          store.setBalance(store.balance - decision.execution.amount * decision.execution.price)
        } else {
          store.setBalance(store.balance + decision.execution.amount * decision.execution.price)
        }

        // Update performance metrics
        const logs = store.tradeLogs
        const winningTrades = logs.filter(l => (l.pnl || 0) > 0).length
        const losingTrades = logs.filter(l => (l.pnl || 0) < 0).length
        const totalPnl = logs.reduce((sum, l) => sum + (l.pnl || 0), 0)
        const avgWin = winningTrades > 0 ? logs.filter(l => (l.pnl || 0) > 0).reduce((s, l) => s + (l.pnl || 0), 0) / winningTrades : 0
        const avgLoss = losingTrades > 0 ? Math.abs(logs.filter(l => (l.pnl || 0) < 0).reduce((s, l) => s + (l.pnl || 0), 0) / losingTrades) : 0

        store.setPerformanceMetrics({
          winRate: logs.length > 0 ? (winningTrades / logs.length) * 100 : 0,
          totalPnl,
          maxDrawdown: Math.min(0, ...logs.map(l => l.pnl || 0)),
          sharpeRatio: logs.length > 2 ? (totalPnl / (logs.length * Math.abs(avgLoss || 1))) * Math.sqrt(252) : 0,
          totalTrades: logs.length,
          winningTrades,
          losingTrades,
          avgWin,
          avgLoss,
          profitFactor: avgLoss > 0 ? (avgWin * winningTrades) / (avgLoss * losingTrades) : 0,
        })
      }

      store.addMessage({
        role: 'assistant',
        content: `Strategy analyzed! ${decision.analysis.conclusion}`,
        decision,
      })

      addToast('Strategy processed successfully', 'success')
    } catch {
      store.updateStrategy(strategyId, undefined as unknown as AgentDecision, 'error')
      store.addMessage({
        role: 'system',
        content: `Error processing strategy. Please try again.`,
      })
      addToast('Failed to process strategy', 'error')
    } finally {
      store.setIsProcessing(false)
    }
  }, [inputText, store, addToast])

  // Handle mode switch
  const handleModeSwitch = useCallback(() => {
    if (store.tradingMode === 'simulated') {
      setRealModeConfirm(true)
    } else {
      store.setTradingMode('simulated')
      addToast('Switched to simulated mode', 'info')
    }
  }, [store, addToast])

  const confirmRealMode = useCallback(() => {
    store.setTradingMode('real')
    setRealModeConfirm(false)
    addToast('⚠️ Real trading mode activated!', 'warning')
  }, [store, addToast])

  // Export CSV
  const handleExportCSV = useCallback(() => {
    if (store.tradeLogs.length === 0) {
      addToast('No trades to export', 'warning')
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
      `bitget-trades-${Date.now()}.csv`
    )
    addToast('Trade log exported', 'success')
  }, [store.tradeLogs, addToast])

  // Save playbook key
  const handleSavePlaybookKey = useCallback(() => {
    store.setBitgetConfig({ playbookApiKey: playbookKeyInput })
    addToast('Playbook API Key saved', 'success')
  }, [store, playbookKeyInput, addToast])

  const exampleStrategies = [
    tr.chat.example1,
    tr.chat.example2,
    tr.chat.example3,
    tr.chat.example4,
    tr.chat.example5,
    tr.chat.example6,
  ]

  return (
    <div className={cn('min-h-screen flex flex-col', store.theme === 'dark' ? 'dark' : '')}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-border/50">
          <div className="flex items-center justify-between px-3 sm:px-6 py-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => store.setSidebarOpen(!store.sidebarOpen)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg"
              >
                <IconMenu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <IconBot className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-sm font-bold gradient-text">{tr.app.title}</h1>
                  <p className="text-[10px] text-muted-foreground">{tr.app.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Language Toggle */}
              <button
                onClick={() => store.setLanguage(store.language === 'en' ? 'zh' : 'en')}
                className="flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors"
              >
                <IconGlobe className="w-3.5 h-3.5" />
                <span>{store.language === 'en' ? '中文' : 'EN'}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => store.setTheme(store.theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {store.theme === 'dark' ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
              </button>

              {/* Mode Toggle */}
              <button
                onClick={handleModeSwitch}
                className={cn(
                  'flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                  store.tradingMode === 'simulated'
                    ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', store.tradingMode === 'simulated' ? 'bg-blue-400' : 'bg-red-400 animate-pulse')} />
                <span className="hidden sm:inline">{tr.chat.mode}:</span>
                <span>{store.tradingMode === 'simulated' ? tr.chat.simulated : tr.chat.real}</span>
              </button>

              {/* Help */}
              <button
                onClick={() => store.setHelpOpen(true)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <IconHelp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex px-3 sm:px-6 gap-1">
            {[
              { id: 'chat' as const, icon: IconChat, label: tr.nav.chat },
              { id: 'dashboard' as const, icon: IconDashboard, label: tr.nav.dashboard },
              { id: 'history' as const, icon: IconHistory, label: tr.nav.history },
              { id: 'settings' as const, icon: IconSettings, label: tr.nav.settings },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => store.setActivePage(id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-all border-b-2',
                  store.activePage === id
                    ? 'text-emerald-400 border-emerald-400 bg-emerald-500/10'
                    : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {/* ============ CHAT PAGE ============ */}
          {store.activePage === 'chat' && (
            <div className="h-full flex flex-col">
              {/* Ticker Bar */}
              <div className="flex items-center gap-2 px-3 sm:px-6 py-2 border-b border-border/30 overflow-x-auto hide-scrollbar">
                {COIN_LIST.map(coin => {
                  const ticker = tickers[coin.symbol]
                  return (
                    <button
                      key={coin.symbol}
                      onClick={() => store.setSelectedCoin(coin.symbol)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all',
                        store.selectedCoin === coin.symbol
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'hover:bg-muted text-muted-foreground'
                      )}
                    >
                      <span>{coin.icon}</span>
                      <span className="font-medium">{coin.symbol.replace('USDT', '')}</span>
                      {ticker && (
                        <span className={cn(ticker.change24h >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {formatPercent(ticker.change24h)}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 hide-scrollbar">
                {store.messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                      <IconBot className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold gradient-text">{tr.app.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{tr.app.description}</p>
                    </div>

                    {/* Example Strategies */}
                    <div className="space-y-2 w-full max-w-lg">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{tr.chat.examples}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {exampleStrategies.map((example, i) => (
                          <button
                            key={i}
                            onClick={() => setInputText(example)}
                            className="text-left px-3 py-2 rounded-lg bg-card/50 border border-border/50 text-xs hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Agent Skills */}
                    <div className="space-y-2 w-full max-w-lg">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agent Hub Skills</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {AGENT_SKILLS.map(skill => (
                          <span key={skill.id} className="px-2.5 py-1 rounded-full bg-card/50 border border-border/50 text-[10px] font-medium text-muted-foreground">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {store.messages.map(msg => (
                  <div key={msg.id} className={cn('animate-slide-up', msg.role === 'user' ? 'flex justify-end' : 'flex justify-start')}>
                    <div className={cn(
                      'max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3',
                      msg.role === 'user'
                        ? 'bg-emerald-500/20 text-foreground rounded-br-md'
                        : msg.role === 'system'
                        ? 'bg-amber-500/20 text-foreground rounded-bl-md'
                        : 'bg-card border border-border/50 rounded-bl-md'
                    )}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                            <IconBot className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-[10px] font-medium text-emerald-400">Trading Agent</span>
                        </div>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      {msg.decision && <DecisionFlow decision={msg.decision} lang={store.language} />}
                    </div>
                  </div>
                ))}

                {store.isProcessing && (
                  <div className="flex justify-start animate-slide-up">
                    <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                          <IconBot className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
                          <span className="text-xs text-muted-foreground">{tr.chat.thinking}</span>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        {AGENT_SKILLS.map((skill, i) => (
                          <div key={skill.id} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <div className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              i < 3 ? 'bg-emerald-400' : i < 5 ? 'bg-amber-400 animate-pulse' : 'bg-muted'
                            )} />
                            <span>{skill.name}</span>
                            {i < 3 && <IconCheck className="w-3 h-3 text-emerald-400" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Playbook Key Input */}
              {!store.bitgetConfig.playbookApiKey && (
                <div className="px-3 sm:px-6 py-2 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={playbookKeyInput}
                      onChange={(e) => setPlaybookKeyInput(e.target.value)}
                      placeholder={tr.chat.apiKeyInput}
                      className="flex-1 px-3 py-1.5 text-xs bg-muted/50 border border-border/50 rounded-lg focus:outline-none focus:border-emerald-500/50"
                    />
                    <button
                      onClick={handleSavePlaybookKey}
                      className="px-3 py-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                    >
                      {tr.chat.saveKey}
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Input */}
              <div className="px-3 sm:px-6 py-3 border-t border-border/50 glass">
                <div className="flex items-end gap-2">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder={tr.chat.placeholder}
                    rows={2}
                    className="flex-1 resize-none px-3 py-2 text-sm bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:border-emerald-500/50 placeholder:text-muted-foreground/50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || store.isProcessing}
                    className={cn(
                      'p-2.5 rounded-xl transition-all',
                      inputText.trim() && !store.isProcessing
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    <IconSend className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============ DASHBOARD PAGE ============ */}
          {store.activePage === 'dashboard' && (
            <div className="h-full overflow-y-auto px-3 sm:px-6 py-4 space-y-4">
              {/* Portfolio Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-card/50 border border-border/50 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{tr.dashboard.balance}</p>
                  <p className="text-lg font-bold mt-1">{formatCurrency(store.balance)}</p>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{tr.dashboard.totalPnl}</p>
                  <p className={cn('text-lg font-bold mt-1', store.performanceMetrics.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {formatCurrency(store.performanceMetrics.totalPnl)}
                  </p>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{tr.dashboard.winRate}</p>
                  <p className="text-lg font-bold mt-1">{store.performanceMetrics.winRate.toFixed(1)}%</p>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{tr.dashboard.totalTrades}</p>
                  <p className="text-lg font-bold mt-1">{store.performanceMetrics.totalTrades}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: tr.dashboard.maxDrawdown, value: formatCurrency(store.performanceMetrics.maxDrawdown), color: 'text-red-400' },
                  { label: tr.dashboard.sharpeRatio, value: store.performanceMetrics.sharpeRatio.toFixed(2), color: 'text-cyan-400' },
                  { label: tr.dashboard.profitFactor, value: store.performanceMetrics.profitFactor.toFixed(2), color: 'text-purple-400' },
                  { label: tr.dashboard.winningTrades || 'Winning', value: String(store.performanceMetrics.winningTrades), color: 'text-emerald-400' },
                  { label: tr.dashboard.losingTrades || 'Losing', value: String(store.performanceMetrics.losingTrades), color: 'text-amber-400' },
                ].map((metric, i) => (
                  <div key={i} className="bg-card/50 border border-border/50 rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground">{metric.label}</p>
                    <p className={cn('text-sm font-bold mt-1', metric.color)}>{metric.value}</p>
                  </div>
                ))}
              </div>

              {/* Price Chart */}
              <div className="bg-card/50 border border-border/50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">{tr.dashboard.priceChart}</h3>
                  <div className="flex items-center gap-1">
                    {COIN_LIST.slice(0, 4).map(coin => (
                      <button
                        key={coin.symbol}
                        onClick={() => store.setSelectedCoin(coin.symbol)}
                        className={cn(
                          'px-2 py-0.5 text-[10px] rounded-md transition-all',
                          store.selectedCoin === coin.symbol
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'text-muted-foreground hover:bg-muted'
                        )}
                      >
                        {coin.symbol.replace('USDT', '')}
                      </button>
                    ))}
                  </div>
                </div>
                <PriceChart data={priceData} coin={store.selectedCoin} lang={store.language} />
              </div>

              {/* PnL Chart */}
              <div className="bg-card/50 border border-border/50 rounded-xl p-3">
                <h3 className="text-sm font-semibold mb-3">Cumulative PnL</h3>
                {store.tradeLogs.length > 0 ? (
                  <PerformanceChart metrics={store.tradeLogs} tradeLogs={store.tradeLogs} lang={store.language} />
                ) : (
                  <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
                    {tr.dashboard.noTrades}
                  </div>
                )}
              </div>

              {/* Trade Log */}
              <div className="bg-card/50 border border-border/50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">{tr.dashboard.tradeLog}</h3>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                  >
                    <IconDownload className="w-3 h-3" />
                    {tr.dashboard.exportCSV}
                  </button>
                </div>
                {store.tradeLogs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-muted-foreground border-b border-border/30">
                          <th className="text-left py-2 px-1">Time</th>
                          <th className="text-left py-2 px-1">Symbol</th>
                          <th className="text-left py-2 px-1">Side</th>
                          <th className="text-right py-2 px-1">Amount</th>
                          <th className="text-right py-2 px-1">Price</th>
                          <th className="text-right py-2 px-1">PnL</th>
                          <th className="text-left py-2 px-1">Mode</th>
                        </tr>
                      </thead>
                      <tbody>
                        {store.tradeLogs.slice(0, 20).map(log => (
                          <tr key={log.id} className="border-b border-border/10 hover:bg-muted/30">
                            <td className="py-1.5 px-1 text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</td>
                            <td className="py-1.5 px-1 font-medium">{log.symbol}</td>
                            <td className={cn('py-1.5 px-1 font-medium', log.side === 'buy' ? 'text-emerald-400' : 'text-red-400')}>
                              {log.side.toUpperCase()}
                            </td>
                            <td className="py-1.5 px-1 text-right">{log.amount}</td>
                            <td className="py-1.5 px-1 text-right">${log.price.toLocaleString()}</td>
                            <td className={cn('py-1.5 px-1 text-right font-medium', (log.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                              {formatCurrency(log.pnl || 0)}
                            </td>
                            <td className="py-1.5 px-1">
                              <span className={cn(
                                'px-1.5 py-0.5 rounded text-[9px] font-medium',
                                log.mode === 'simulated' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                              )}>
                                {log.mode}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">{tr.dashboard.noTrades}</p>
                )}
              </div>
            </div>
          )}

          {/* ============ HISTORY PAGE ============ */}
          {store.activePage === 'history' && (
            <div className="h-full overflow-y-auto px-3 sm:px-6 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{tr.history.title}</h2>
                {store.strategyHistory.length > 0 && (
                  <button
                    onClick={() => { store.clearHistory(); addToast('History cleared', 'info') }}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <IconTrash className="w-3 h-3" />
                    {tr.history.clearAll}
                  </button>
                )}
              </div>

              {store.strategyHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <IconHistory className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">{tr.history.empty}</p>
                </div>
              ) : (
                store.strategyHistory.map(item => (
                  <div key={item.id} className="bg-card/50 border border-border/50 rounded-xl p-3 animate-slide-up">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.input}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                          <span className={cn(
                            'px-1.5 py-0.5 rounded text-[9px] font-medium',
                            item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                            item.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                            item.status === 'error' ? 'bg-red-500/20 text-red-400' :
                            'bg-amber-500/20 text-amber-400'
                          )}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setInputText(item.input); store.setActivePage('chat') }}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                          title={tr.history.rerun}
                        >
                          <IconRefresh className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => { store.deleteStrategy(item.id); addToast('Strategy deleted', 'info') }}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                          title={tr.history.delete}
                        >
                          <IconTrash className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                    {item.decision && (
                      <div className="mt-2 pt-2 border-t border-border/30">
                        <DecisionFlow decision={item.decision} lang={store.language} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ============ SETTINGS PAGE ============ */}
          {store.activePage === 'settings' && (
            <div className="h-full overflow-y-auto px-3 sm:px-6 py-4 space-y-4">
              <h2 className="text-lg font-bold">{tr.settings.title}</h2>

              {/* Theme */}
              <div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold">{tr.settings.theme}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => store.setTheme('dark')}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all',
                      store.theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <IconMoon className="w-4 h-4" />
                    {tr.settings.dark}
                  </button>
                  <button
                    onClick={() => store.setTheme('light')}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all',
                      store.theme === 'light' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <IconSun className="w-4 h-4" />
                    {tr.settings.light}
                  </button>
                </div>
              </div>

              {/* Language */}
              <div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold">{tr.settings.language}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => store.setLanguage('en')}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm transition-all',
                      store.language === 'en' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    English
                  </button>
                  <button
                    onClick={() => store.setLanguage('zh')}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm transition-all',
                      store.language === 'zh' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    中文
                  </button>
                </div>
              </div>

              {/* Bitget API */}
              <div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold">{tr.settings.bitgetApi}</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{tr.settings.apiKey}</label>
                    <input
                      type="password"
                      value={store.bitgetConfig.apiKey}
                      onChange={(e) => store.setBitgetConfig({ apiKey: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-sm bg-muted/50 border border-border/50 rounded-lg focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{tr.settings.secretKey}</label>
                    <input
                      type="password"
                      value={store.bitgetConfig.secretKey}
                      onChange={(e) => store.setBitgetConfig({ secretKey: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-sm bg-muted/50 border border-border/50 rounded-lg focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{tr.settings.passphrase}</label>
                    <input
                      type="password"
                      value={store.bitgetConfig.passphrase}
                      onChange={(e) => store.setBitgetConfig({ passphrase: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-sm bg-muted/50 border border-border/50 rounded-lg focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{tr.settings.playbookApiKey}</label>
                    <input
                      type="password"
                      value={store.bitgetConfig.playbookApiKey}
                      onChange={(e) => store.setBitgetConfig({ playbookApiKey: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-sm bg-muted/50 border border-border/50 rounded-lg focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-semibold">{tr.settings.about}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tr.settings.aboutText}</p>
              </div>
            </div>
          )}
        </main>

        {/* Real Mode Confirmation Dialog */}
        {realModeConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-sm mx-4 animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <IconAlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-bold">⚠️ {tr.chat.real} Mode</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{tr.chat.realConfirm}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setRealModeConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  {tr.common.cancel}
                </button>
                <button
                  onClick={confirmRealMode}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {tr.common.confirm}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Dialog */}
        {store.helpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-lg mx-4 max-h-[80vh] overflow-y-auto animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{tr.help.title}</h3>
                <button onClick={() => store.setHelpOpen(false)} className="p-1 hover:bg-muted rounded-lg">
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
    </div>
  )
}
