# Suinergy dApp - Production Frontend

The official Suinergy decentralized app interface for depositing assets, viewing strategy allocations, and tracking rewards.

## Design System

The UI is built around the core Suinergy palette:
- **Primary Background**: `#f4f3f0` (warm neutral)
- **Deep Contrast**: `#000000` (black)
- **Crisp Clarity**: `#FFFFFF` (white)
- **Signature Highlight**: `#1055C9` (electric blue)

All components use soft capsule rounded rectangles with gradient borders and shadows derived from this palette.

## Features

✅ **Complete UI Scaffold**
- Persistent collapsible side navigation
- Responsive layout (desktop + mobile bottom dock)
- Main dashboard with portfolio overview
- Strategy list with table/grid view toggle
- Rewards & loyalty panel
- Profile panel with transaction history

✅ **Wallet Integration**
- Sui dApp kit integration
- Wallet connection/disconnection
- Balance display
- Network status

✅ **Strategy Management**
- Dual-mode display (table + card grid)
- APY/APR distinction with tooltips
- Strategy cards with capacity, risk, fees
- Deposit modal with simulation

✅ **Simulation & Projections**
- Allocation simulation modal
- Conservative vs optimistic scenarios
- 52-week projection charts (Recharts)
- Fee overhead calculations

✅ **Animations & Motion**
- Lenis smooth scroll integration
- Framer Motion transitions
- GSAP-ready structure
- Soft capsule container aesthetics

✅ **State Management**
- Zustand store for app state
- React Query for data fetching
- Optimistic UI patterns

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: TailwindCSS with Suinergy theme tokens
- **UI Components**: shadcn/ui (customized for Suinergy palette)
- **Animation**: Framer Motion, GSAP, Lenis
- **Blockchain**: @mysten/dapp-kit, @mysten/sui
- **Charts**: Recharts
- **Data Fetching**: @tanstack/react-query
- **State**: Zustand

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Main dashboard
│   ├── strategies/         # Strategy list & allocation
│   ├── rewards/            # Rewards & loyalty
│   └── profile/            # User profile
├── components/
│   ├── layout/             # Sidebar, main layout
│   ├── strategies/        # Strategy list, table, grid
│   ├── modals/             # Deposit, simulation modals
│   ├── rewards/            # Rewards panel
│   ├── profile/            # Profile panel
│   ├── wallet/             # Wallet connection
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Data fetching hooks
│   ├── use-strategies.ts
│   ├── use-wallet-balance.ts
│   ├── use-user-positions.ts
│   └── use-rewards.ts
├── store/                  # Zustand store
└── config/                 # App configuration
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
# Create .env.local with:
# NEXT_PUBLIC_SUI_NETWORK=testnet
# NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io:443
# NEXT_PUBLIC_API_URL=http://localhost:4000

# Start development server (port 3001)
pnpm dev
```

Visit `http://localhost:3001`

## Pages

- `/dashboard` - Portfolio overview, quick stats, allocations
- `/strategies` - Browse and allocate to yield strategies
- `/rewards` - $SYN balance, SGP points, tier progress
- `/profile` - Account info, transaction history, positions

## Data Hooks (Stubbed)

All data hooks are structured and ready for implementation:
- `useStrategies()` - Fetch strategy list from backend
- `useStrategy(id)` - Fetch individual strategy details
- `useWalletBalance()` - On-chain wallet balance
- `useUserPositions()` - User's active allocations
- `useRewards()` - Loyalty points and rewards

Replace TODO comments in hooks with actual API calls.

## Environment Variables

Required:
- `NEXT_PUBLIC_SUI_NETWORK` - testnet/mainnet/devnet
- `NEXT_PUBLIC_SUI_RPC_URL` - Sui RPC endpoint
- `NEXT_PUBLIC_API_URL` - Backend API base URL

## Build

```bash
pnpm build
pnpm start
```

## Next Steps

1. **Connect Backend**: Replace mock data in hooks with actual API calls
2. **On-Chain Integration**: Implement deposit/withdrawal transactions
3. **Real-time Updates**: Add WebSocket subscriptions for APY updates
4. **Indexer Integration**: Connect to Suinergy indexer for historical data
5. **Business Logic**: Implement allocation calculations and fee structures
