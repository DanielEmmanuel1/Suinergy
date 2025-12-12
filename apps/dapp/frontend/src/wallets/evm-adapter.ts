'use client';

import { WalletAdapter, ChainId } from './index';
import { ChainAPI } from '@/lib/chain-interface';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { base, avalanche, lisk } from 'wagmi/chains';

export class EVMAdapter implements WalletAdapter {
    private chainId: ChainId;
    private wagmiChainId: number;

    constructor(chainId: ChainId) {
        this.chainId = chainId;

        // Map our ChainId to Wagmi chain IDs
        switch (chainId) {
            case ChainId.BASE:
                this.wagmiChainId = base.id;
                break;
            case ChainId.AVALANCHE:
                this.wagmiChainId = avalanche.id;
                break;
            case ChainId.LISK:
                this.wagmiChainId = lisk.id;
                break;
            default:
                throw new Error(`Unsupported EVM chain: ${chainId}`);
        }
    }

    async connect(): Promise<string | null> {
        // This will be called from a component that has access to wagmi hooks
        // For now, return null - actual connection happens via wagmi hooks in components
        return null;
    }

    async disconnect(): Promise<void> {
        // Disconnect happens via wagmi hooks in components
    }

    async getAccount(): Promise<string | null> {
        // Account retrieval happens via wagmi hooks in components
        return null;
    }

    getChainId(): ChainId {
        return this.chainId;
    }

    getChainAPI(): ChainAPI {
        // Return a basic ChainAPI implementation for EVM chains
        return {
            getBalance: async (address: string) => {
                // TODO: Implement using wagmi/viem
                return '0';
            },
            sendTransaction: async (params: any) => {
                // TODO: Implement using wagmi
                return '';
            },
            // Add other required ChainAPI methods
        } as ChainAPI;
    }
}

// Hook-based adapter for use in React components
export function useEVMWallet(chainId: ChainId) {
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();

    return {
        address: address || null,
        isConnected,
        connect: async () => {
            const connector = connectors[0]; // Use first available connector (WalletConnect)
            if (connector) {
                connect({ connector });
            }
        },
        disconnect: async () => {
            disconnect();
        },
    };
}
