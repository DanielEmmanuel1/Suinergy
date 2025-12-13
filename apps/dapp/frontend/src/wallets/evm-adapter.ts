/**
 * EVM Wallet Adapter
 * 
 * This file is a placeholder for future EVM wallet adapter implementation.
 * Currently, EVM wallet connections are handled directly via Wagmi hooks
 * in the WalletConnectButton component (see src/providers/wagmi-provider.tsx).
 * 
 * To use EVM wallets in your app:
 * 1. Import useAccount, useConnect from 'wagmi' in your component
 * 2. Use the WalletConnectButton component for connection UI
 * 3. Access wallet state via Wagmi hooks
 * 
 * Supported chains: Base, Avalanche, Lisk
 */

export const EVM_CHAINS = {
    BASE: 8453,
    AVALANCHE: 43114,
    LISK: 1135,
} as const;

export type EVMChainId = typeof EVM_CHAINS[keyof typeof EVM_CHAINS];

