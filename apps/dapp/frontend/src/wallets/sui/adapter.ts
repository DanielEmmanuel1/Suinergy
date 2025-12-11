import { WalletAdapter, ChainId } from '../index';
import { SuiChainAPI } from './chain-api';
import { ChainAPI } from '@/lib/chain-interface';

export class SuiWalletAdapter implements WalletAdapter {
    private chainApi: SuiChainAPI;
    private address: string | null = null;

    constructor() {
        this.chainApi = new SuiChainAPI();
    }

    async connect(): Promise<string | null> {
        // In valid React setup, this would trigger the modal
        console.warn("Please use the connect button in the UI for Sui.");
        return this.address;
    }

    async disconnect(): Promise<void> {
        this.address = null;
        this.chainApi.setSigner(null);
    }

    async getAccount(): Promise<string | null> {
        return this.address;
    }

    getChainId(): ChainId {
        return ChainId.SUI;
    }

    getChainAPI(): ChainAPI {
        return this.chainApi;
    }

    // Hook for React to inject state
    updateState(address: string | null, signer: any) {
        this.address = address;
        this.chainApi.setSigner(signer);
    }
}

export const suiAdapter = new SuiWalletAdapter();
