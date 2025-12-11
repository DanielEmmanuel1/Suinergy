# Suinergy Multichain Architecture

## Overview
This repository has been restructured to support multiple blockchains (Sui, Avalanche, Solana).

## Directory Structure

### `apps/dapp/frontend`
The Next.js application.
- `src/wallets`: Wallet adapters for each chain.
- `src/app/markets`: New multichain routing pages.
- `src/lib/chain-interface.ts`: Standard API definition.

### `apps/dapp/chains`
Chain-specific backend and contract code.
- `sui/`: Contains original Move contracts and backend logic.
- `avalanche/`: Start here for EVM implementation.
- `solana/`: Start here for SVM implementation.

## Adding a New Chain
1. Create `apps/dapp/chains/<chain>`.
2. Implement `capabilities.md`.
3. Create `apps/dapp/frontend/src/wallets/<chain>/adapter.ts` implementing `WalletAdapter`.
4. Register the adapter in `src/app/markets/[chainId]/strategies/page.tsx` (or a central provider).

## Development
- Run frontend: `cd apps/dapp/frontend && pnpm dev`
- Build contracts: `cd apps/dapp/chains/sui/contracts && sui move build`