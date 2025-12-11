import { ChainAPI } from '@/lib/chain-interface';

export enum ChainId {
    SUI = 'sui',
    AVALANCHE = 'avalanche',
    SOLANA = 'solana'
}

export interface WalletAdapter {
    connect(): Promise<string | null>;
    disconnect(): Promise<void>;
    getAccount(): Promise<string | null>;
    getChainId(): ChainId;
    getChainAPI(): ChainAPI;
}

const adapters: Record<string, WalletAdapter> = {};

export function registerAdapter(chainId: ChainId, adapter: WalletAdapter) {
    adapters[chainId] = adapter;
}

export function getAdapter(chainId: ChainId): WalletAdapter {
    if (!adapters[chainId]) {
        throw new Error(`No adapter found for chain ${chainId}`);
    }
    return adapters[chainId];
}
