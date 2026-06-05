# Bitget Trading Agent

**Natural Language-Driven Crypto Trading Agent** — AI-powered trading assistant integrated with Bitget Agent Hub.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Overview

Bitget Trading Agent is a modern, AI-powered web application that allows users to execute cryptocurrency trading strategies using natural language. Built on top of the [Bitget Agent Hub](https://github.com/Bitget-AI/agent_hub), it provides transparent decision-making flows, real-time market data, and simulated/live trading capabilities.

### Key Features

- **Natural Language Strategy Input** — Type trading strategies in plain English or Chinese
- **Bitget Agent Hub Integration** — Deep integration with official skills (macro-analyst, sentiment-analyst, technical-analysis, news-briefing, market-intel)
- **Transparent Decision Flow** — Watch the agent's Perception → Analysis → Execution → Risk Management pipeline in real-time
- **Performance Dashboard** — Win rate, total PnL, max drawdown, Sharpe ratio, profit factor charts
- **Multi-Coin Price Charts** — Real-time/historical price charts for BTC, ETH, SOL, BNB, XRP, DOGE
- **Simulated / Real Mode** — Safe simulated trading by default; real mode with confirmation
- **Strategy History** — Local storage with re-run and delete capabilities
- **Trade Log Export** — Export trade history as CSV
- **Bilingual UI** — Full English and Chinese support
- **Dark / Light Theme** — Modern dark-first design with light mode toggle
- **PWA Support** — Install as a mobile app for native-like experience
- **Responsive Design** — Optimized for desktop, tablet, and mobile

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  Next.js 14 + TypeScript + Tailwind CSS          │
│  Zustand (State) + Canvas Charts                 │
├─────────────────────────────────────────────────┤
│                API Routes                        │
│  /api/bitget/ticker  - Market data               │
│  /api/bitget/candles - Price history             │
│  /api/bitget/order   - Order placement           │
│  /api/agent/process  - Strategy processing       │
├─────────────────────────────────────────────────┤
│            Bitget Agent Hub                      │
│  macro-analyst | sentiment-analyst               │
│  technical-analysis | news-briefing              │
│  market-intel | Playbook API                     │
├─────────────────────────────────────────────────┤
│              Bitget Exchange API                 │
│  REST API | WebSocket | Sub-accounts             │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or bun
- Bitget API credentials (for real trading)

### Installation

```bash
# Clone the repository
git clone https://github.com/zsun77863-hue/bit.git
cd bit

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```env
# Bitget API Configuration
BITGET_API_KEY=your_bitget_api_key_here
BITGET_SECRET_KEY=your_bitget_secret_key_here
BITGET_PASSPHRASE=your_bitget_passphrase_here

# Playbook API Key (for natural language strategy processing)
PLAYBOOK_API_KEY=your_playbook_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Bitget Trading Agent

# Optional: Sub-account configuration
BITGET_SUB_ACCOUNT_ID=
```

---

## 📖 Usage Guide

### 1. Chat Interface

Enter trading strategies in natural language:

- "Buy BTC when RSI drops below 30, sell when RSI exceeds 70"
- "Monitor ETH sentiment, go long when sentiment turns positive"
- "Set 5% stop-loss for SOL position, take profit at 15%"
- "DCA into BTC weekly, $100 per week"

### 2. Agent Decision Flow

When you submit a strategy, the agent follows a transparent pipeline:

1. **Perception** — Gathers market data via Agent Hub skills
   - Price data, sentiment scores, technical indicators, news, on-chain metrics
2. **Analysis** — Processes data and generates reasoning
   - Step-by-step logic with confidence scoring
3. **Execution** — Places simulated or real orders
   - Market/limit orders with order IDs
4. **Risk Management** — Calculates risk parameters
   - Stop-loss, take-profit, position sizing, max drawdown

### 3. Dashboard

Monitor your trading performance:
- **Portfolio Overview** — Balance, positions, PnL
- **Performance Metrics** — Win rate, Sharpe ratio, profit factor
- **Price Charts** — Multi-coin candlestick-style charts
- **Trade Log** — Full history with CSV export

### 4. Mode Switching

- **Simulated Mode** (default) — All trades are virtual, no real money at risk
- **Real Mode** — Requires API keys and double confirmation

---

## 🔧 Bitget Agent Hub Integration

This project deeply integrates with the [Bitget Agent Hub](https://github.com/Bitget-AI/agent_hub):

### Skills Used

| Skill | Description | Category |
|-------|-------------|----------|
| `macro-analyst` | Macroeconomic analysis and market trends | Analysis |
| `sentiment-analyst` | Social media and news sentiment | Analysis |
| `technical-analysis` | RSI, MACD, Bollinger Bands | Analysis |
| `news-briefing` | Crypto news aggregation | Info |
| `market-intel` | Market intelligence and on-chain metrics | Info |

### Integration Methods

- **MCP Server** — Model Context Protocol for AI agent communication
- **REST API** — Direct HTTP calls to Bitget endpoints
- **CLI Style** — Command-line interface for skill execution
- **Playbook API** — Natural language to strategy conversion

### Sub-Account Setup

For simulated trading, create a Bitget sub-account:

1. Log in to your Bitget account
2. Go to **Settings → Sub-account Management**
3. Create a new sub-account for trading
4. Generate API keys for the sub-account
5. Add the credentials to `.env.local`

---

## 🌐 Netlify Deployment

### Step 1: Prepare for Deployment

```bash
# Build the project
npm run build
```

### Step 2: Deploy to Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Add environment variables in Netlify dashboard
7. Deploy!

### Alternative: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

---

## 🏆 Hackathon Submission Guide

### Project Information

- **Project Name**: Bitget Trading Agent
- **Category**: AI + DeFi Trading
- **Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Bitget Agent Hub

### Submission Checklist

- [x] Working demo with simulated trading
- [x] Bitget Agent Hub integration
- [x] Transparent AI decision flow
- [x] Multi-language support (EN/CN)
- [x] Responsive design + PWA
- [x] Clean code with TypeScript
- [x] Complete documentation

### Demo Video Script

1. Show the chat interface with a natural language strategy
2. Demonstrate the transparent decision flow
3. Switch to Dashboard to show performance metrics
4. Toggle between simulated and real mode
5. Show mobile responsive design
6. Export trade log as CSV

---

## 📁 Project Structure

```
bitget-trading-agent/
├── public/
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agent/process/ # Strategy processing API
│   │   │   └── bitget/
│   │   │       ├── ticker/    # Market data API
│   │   │       ├── candles/   # Price history API
│   │   │       └── order/     # Order placement API
│   │   ├── globals.css        # Global styles + CSS variables
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main application page
│   ├── i18n/
│   │   ├── en.ts              # English translations
│   │   ├── zh.ts              # Chinese translations
│   │   └── index.ts           # i18n utilities
│   ├── lib/
│   │   ├── agent-hub.ts       # Agent Hub integration
│   │   ├── bitget.ts          # Bitget API client
│   │   └── utils.ts           # Utility functions
│   ├── store/
│   │   └── index.ts           # Zustand state management
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── .env.example               # Environment variable template
├── .env.local                 # Local environment variables
├── tailwind.config.ts         # Tailwind CSS configuration
├── next.config.mjs            # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type-safe development |
| Tailwind CSS | Utility-first styling |
| Zustand | Lightweight state management |
| Canvas API | Custom chart rendering |
| Bitget API | Exchange integration |
| Bitget Agent Hub | AI skill execution |

---

## 📄 License

MIT License — feel free to use this project for your own trading agents!

---

## 🙏 Acknowledgments

- [Bitget Agent Hub](https://github.com/Bitget-AI/agent_hub) — Official Bitget AI agent framework
- [Next.js](https://nextjs.org/) — React framework
- [Tailwind CSS](https://tailwindcss.com/) — CSS framework
- [Zustand](https://github.com/pmndrs/zustand) — State management

---

**Built with ❤️ for the Bitget AI Agent Hackathon**
