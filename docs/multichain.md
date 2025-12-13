# Multichain Developer Guide

This guide explains how to add and maintain chains in the Suinergy platform.

## Architecture

The project is split into:
- **Frontend**: `apps/dapp/frontend` (Next.js)
  - Unified Interface: `src/lib/chain-interface.ts`
  - Adapters: `src/wallets/*`
- **Chains**: `apps/dapp/chains/<chain>`
  - Backend/Contracts specific to each chain.

## Adding a New Chain

### 1. Backend Setup
1. Create `apps/dapp/chains/<chain_name>`.
2. Add `contracts` folder with smart contracts.
3. Add `backend` folder for any off-chain scripts.
4. Create `capabilities.md` defining key entrypoints.

### 2. Frontend Integration
1. Create `apps/dapp/frontend/src/wallets/<chain_name>/adapter.ts`.
2. Implement `WalletAdapter` interface.
3. Implement `ChainAPI` class for that chain (fetching strategies, user balances).
4. Register the adapter in `src/app/markets/[chainId]/strategies/page.tsx` (or central registry).
5. Update `CHAINS` constant in `src/app/markets/page.tsx` to display the card.

## Testing
- Run `pnpm dev` in `apps/dapp/frontend`.
- Navigate to `/markets`.
- Select your new chain.
