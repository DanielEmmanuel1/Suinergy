# Suinergy - Sui Yield Aggregator

A hybrid decentralized application for maximizing DeFi yields on the Sui blockchain. This monorepo contains the complete technical foundation for a production-ready yield aggregator.

## 🏗️ Architecture

Suinergy uses a hybrid architecture combining on-chain and off-chain components:

- **On-chain (Sui Move)**: Deposit handling, strategy execution, position tracking, canonical protocol state
- **Off-chain Backend**: Event indexing, yield aggregation, APY calculations, loyalty scoring, performance metrics
- **Frontend**: Animation-rich Next.js application with Sui wallet integration
- **Storage**: Sui Walrus for decentralized metadata storage

## 📦 Project Structure

```
suinergy/
├── apps/
│   ├── web/              # Next.js frontend application
│   └── api/              # Node.js backend server
├── packages/
│   └── contracts/        # Sui Move smart contracts
│       ├── vault/        # Deposit/withdrawal management
│       ├── strategy/     # Yield strategy orchestration
│       └── governance/   # Protocol administration
└── scripts/              # Deployment and utility scripts
```

## 🎨 Design System

The application uses a carefully curated color palette:

- **Neutral**: `#f4f3f0` - Soft muted background
- **Black**: `#000000` - Deep contrast
- **White**: `#FFFFFF` - Clean highlights
- **Blue**: `#1055C9` - Electric accent

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- Sui CLI (for smart contract development)
- PostgreSQL 16+ (or use Docker)
- Redis 7+ (or use Docker)

### Installation

1. **Clone the repository**
   ```bash
   cd C:\Users\owner\Projects\Suinergy
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Frontend
   cp apps/web/.env.example apps/web/.env.local
   
   # Backend
   cp apps/api/.env.example apps/api/.env
   ```

4. **Start infrastructure with Docker**
   ```bash
   docker-compose up -d postgres redis
   ```

5. **Run database migrations**
   ```bash
   cd apps/api
   pnpm prisma migrate dev
   ```

6. **Start development servers**
   ```bash
   # From root directory
   pnpm dev
   ```

The frontend will be available at `http://localhost:3000` and the API at `http://localhost:4000`.

## 📚 Development

### Frontend (apps/web)

- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS with custom design tokens
- **Animation**: GSAP, Framer Motion, Lenis
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Sui Integration**: @mysten/dapp-kit, @mysten/sui.js

```bash
cd apps/web
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm lint         # Run ESLint
```

### Backend (apps/api)

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis with ioredis
- **Jobs**: BullMQ for background processing
- **Blockchain**: Sui SDK for indexing and RPC calls

```bash
cd apps/api
pnpm dev                # Start dev server with hot reload
pnpm build              # Compile TypeScript
pnpm prisma:studio      # Open Prisma Studio
pnpm prisma:migrate     # Run migrations
```

### Smart Contracts (packages/contracts)

- **Language**: Sui Move
- **Packages**: vault, strategy, governance

```bash
# Build contracts
sui move build --path packages/contracts/vault
sui move build --path packages/contracts/strategy
sui move build --path packages/contracts/governance

# Test contracts
sui move test --path packages/contracts/vault

# Deploy (update scripts/deploy.js first)
node scripts/deploy.js testnet
```

## 🗄️ Database Schema

The backend uses Prisma with PostgreSQL for:

- **User**: Wallet addresses and account management
- **Deposit**: Transaction tracking and position history
- **Strategy**: Yield strategy metadata and performance
- **ApyHistory**: Historical APY snapshots
- **LoyaltyScore**: User loyalty tiers and multipliers
- **IndexedEvent**: On-chain event processing
- **MetricsCache**: Performance metrics caching

## 🔧 Configuration

### Frontend Environment Variables

See `apps/web/.env.example` for:
- Sui network configuration
- Backend API URL
- Walrus endpoints
- Feature flags

### Backend Environment Variables

See `apps/api/.env.example` for:
- Database connection
- Redis configuration
- Sui RPC endpoints
- Smart contract addresses
- Indexer settings
- Cron job schedules

## 🐳 Docker

Run the entire stack with Docker Compose:

```bash
docker-compose up
```

This starts:
- PostgreSQL database
- Redis cache
- Backend API server
- Frontend Next.js app

## 📝 Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm typecheck` - Type check all packages
- `pnpm clean` - Clean all build artifacts

## 🏛️ Technology Stack

### Frontend
- Next.js 14
- React 18
- TailwindCSS
- GSAP, Framer Motion, Lenis
- shadcn/ui
- Sui dApp Kit

### Backend
- Node.js / TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ
- Sui SDK

### Smart Contracts
- Sui Move
- Sui Framework

### DevOps
- Docker
- Turborepo
- pnpm workspaces

## 🔐 Security

- Helmet.js for HTTP security headers
- CORS configuration
- Rate limiting
- Input validation with Zod
- Secure environment variable handling

## 📄 License

See LICENSE file for details.

## 🤝 Contributing

This is a foundational setup. All module implementations, UI components, and smart contract logic are ready to be built on this structure.

---

**Note**: This is a complete development foundation. No functionality, UI components, or smart contract logic has been implemented yet. The structure is ready for immediate development.