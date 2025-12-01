# Backend API - Suinergy

Node.js/TypeScript backend server for the Suinergy yield aggregator.

## Features

- 🔄 Sui blockchain event indexing
- 📊 APY calculation and historical tracking
- 🏆 Loyalty scoring system
- 💾 PostgreSQL database with Prisma ORM
- ⚡ Redis caching layer
- 🔁 Background job processing with BullMQ
- ⏰ Scheduled tasks with node-cron

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma
- **Cache**: Redis
- **Jobs**: BullMQ
- **Blockchain**: Sui SDK

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start PostgreSQL and Redis (via Docker)
docker-compose up -d postgres redis

# Run migrations
pnpm prisma:migrate

# Generate Prisma client
pnpm prisma:generate

# Start development server
pnpm dev
```

API will be available at `http://localhost:4000`

## Project Structure

```
src/
├── config/          # Configuration management
├── jobs/            # Background jobs and queues
├── lib/             # Database and client instances
├── services/        # Business logic layer
└── utils/           # Utility functions
```

## Database

```bash
# Run migrations
pnpm prisma:migrate

# Open Prisma Studio
pnpm prisma:studio

# Reset database
pnpm prisma migrate reset
```

## Environment Variables

See `.env.example` for required configuration.

## Build

```bash
pnpm build
pnpm start
```
