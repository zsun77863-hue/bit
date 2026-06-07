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
- **Playbook API Integration** — Real API calls when Playbook API Key is provided, with fallback to simulation
- **Real-Time Price Data** — Live prices from Bitget REST API with 5-10s polling, Recharts candlestick charts
- **Transparent Decision Flow** — Watch the agent's Perception → Analysis → Execution → Risk Management pipeline in real-time
- **Account Balance & Positions** — Query real Bitget account balance and positions with proper HMAC-SHA256 signing
- **Performance Dashboard** — Win rate, total PnL, max drawdown, Sharpe ratio, profit factor charts
- **Multi-Coin Price Charts** — Real-time/historical candlestick charts for BTC, ETH, SOL, BNB, XRP, DOGE with 1m/5m/15m/1H/4H/1D intervals
- **Simulated / Real Mode** — Safe simulated trading by default; real mode with confirmation
- **Strategy History** — Local storage with delete/rerun support
- **Trade Log Export** — CSV download of all trade records
- **Bilingual UI** — Full English/Chinese support
- **Dark/Light Theme** — Modern dark-first design
- **PWA + Responsive** — Mobile-optimized, installable as app

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or bun

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

---

## 🔑 API Configuration

### Bitget API Keys

1. Go to [Bitget API Management](https://www.bitget.com/api/common/api-key)
2. Create an API key with trading permissions
3. For simulated trading, create a **sub-account** with demo trading enabled
4. Enter your keys in the **Settings** page or `.env.local`

### Playbook API Key

1. Get your Playbook API Key from [Bitget Agent Hub](https://github.com/Bitget-AI/agent_hub)
2. Enter it in the **Settings** page or `.env.local`
3. When active, natural language strategies are processed through the Playbook API

### Environment Variables

```env
# Bitget API (for real trading)
BITGET_API_KEY=your_api_key
BITGET_SECRET_KEY=your_secret_key
BITGET_PASSPHRASE=your_passphrase

# Playbook API (for natural language strategy processing)
PLAYBOOK_API_KEY=your_playbook_key

# App config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── bitget/
│   │   │   ├── ticker/route.ts     # Real-time ticker (public)
│   │   │   ├── tickers/route.ts    # All tickers (public)
│   │   │   ├── candles/route.ts    # Candlestick data (public)
│   │   │   ├── balance/route.ts    # Account balance (authenticated)
│   │   │   ├── positions/route.ts  # Open positions (authenticated)
│   │   │   └── order/route.ts      # Place orders (authenticated)
│   │   └── agent/
│   │       ├── playbook/route.ts   # Playbook API proxy
│   │       └── process/route.ts    # Agent processing
│   ├── page.tsx                    # Main application
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles + CSS variables
├── lib/
│   ├── bitget-sign.ts             # HMAC-SHA256 signing for Bitget API
│   ├── bitget.ts                  # Bitget API client
│   ├── agent-hub.ts               # Agent Hub + Playbook integration
│   └── utils.ts                   # Utility functions
├── store/
│   └── index.ts                   # Zustand state management
├── types/
│   └── index.ts                   # TypeScript type definitions
└── i18n/
    ├── en.ts                      # English translations
    ├── zh.ts                      # Chinese translations
    └── index.ts                   # i18n utilities
```

---

## 🔐 Bitget API Signing

All authenticated Bitget API requests use HMAC-SHA256 signing:

```
1. Construct pre-hash: timestamp + METHOD + requestPath + body
2. Sign with HMAC-SHA256 using secretKey
3. Base64 encode the signature
4. Add headers: ACCESS-KEY, ACCESS-SIGN, ACCESS-TIMESTAMP, ACCESS-PASSPHRASE
```

Reference: [Bitget API Documentation](https://www.bitget.com/api-doc/common/intro)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type-safe development |
| Tailwind CSS | Utility-first styling |
| Zustand | Lightweight state management |
| Recharts | Candlestick & performance charts |
| Bitget REST API | Real-time market data & trading |
| Bitget Agent Hub | AI skill execution |
| Playbook API | Natural language strategy processing |

---

## 📱 PWA Support

The app is PWA-ready with:
- `manifest.json` for installability
- Responsive design for all screen sizes
- Touch-friendly mobile navigation
- Dark theme optimized for OLED screens

---

## 🚢 Netlify Deployment

1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Deploy!

Or use `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## 📄 License

MIT License — feel free to use this project for your own trading agents!

---

## 🙏 Acknowledgments

- [Bitget Agent Hub](https://github.com/Bitget-AI/agent_hub) — Official Bitget AI agent framework & Playbook API
- [Bitget API Docs](https://www.bitget.com/api-doc/common/intro) — REST API reference & signing specification
- [Next.js](https://nextjs.org/) — React framework
- [Recharts](https://recharts.org/) — Chart library
- [Zustand](https://github.com/pmndrs/zustand) — State management

---

**Built with ❤️ for the Bitget AI Agent Hackathon**
