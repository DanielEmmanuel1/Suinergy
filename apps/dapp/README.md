# dApp Application - Suinergy

The actual yield aggregator dApp with wallet integration and blockchain functionality.

## Purpose

This is the **dApp application** (`app.suinergy.com`) where users connect their wallets and interact with the yield aggregator protocol.

**For the marketing website, see:** `apps/website`

## Features

- 🔗 Sui wallet integration (@mysten/dapp-kit)
- 📊 User dashboard with portfolio overview
- 💰 Deposit/withdrawal interface
- 📈 Strategy allocation and rebalancing
- 📉 Historical APY charts (Recharts)
- 🏆 Loyalty rewards tracking
- ✨ Animated UI with GSAP, Framer Motion, Lenis

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animation**: GSAP, Framer Motion, Lenis
- **UI Components**: shadcn/ui
- **Blockchain**: @mysten/dapp-kit, @mysten/sui
- **Charts**: Recharts
- **Data Fetching**: @tanstack/react-query

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Start development server (port 3001)
pnpm dev
```

Visit `http://localhost:3001`

## Key Pages (To Be Implemented)

- `/` - Dashboard overview
- `/deposit` - Deposit SUI/USDC
- `/withdraw` - Withdraw funds
- `/strategies` - View and allocate to strategies
- `/portfolio` - Detailed portfolio analytics
- `/rewards` - Loyalty rewards

## Environment Variables

See `.env.example` for required configuration:
- Sui network (testnet/mainnet/devnet)
- Backend API URL
- Feature flags

## Build

```bash
pnpm build
pnpm start
```
