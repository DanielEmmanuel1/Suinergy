import { WalletAdapter, ChainId } from '../index';
import { ChainAPI, Strategy, VaultState, DepositParams, WithdrawParams, TxResult, UserBalances } from '@/lib/chain-interface';

// Placeholder API
class SolanaChainAPI implements ChainAPI {
    async getStrategies(): Promise<Strategy[]> { return []; }
    async getVaultState(vaultId: string): Promise<VaultState> { return { totalAssets: '0', lastUpdate: 0 }; }
    async deposit(params: DepositParams): Promise<TxResult> { throw new Error('Not implemented'); }
    async withdraw(params: WithdrawParams): Promise<TxResult> { throw new Error('Not implemented'); }
    async getUserBalances(address: string): Promise<UserBalances> { return { native: '0', tokens: {} }; }
    async connectWallet(): Promise<string | null> { return null; }
}

export class SolanaWalletAdapter implements WalletAdapter {
    private api = new SolanaChainAPI();
    async connect() { return null; }
    async disconnect() { }
    async getAccount() { return null; }
    getChainId() { return ChainId.SOLANA; }
    getChainAPI() { return this.api; }
}
