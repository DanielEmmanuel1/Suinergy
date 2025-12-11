import { ChainAPI, Strategy, VaultState, DepositParams, WithdrawParams, TxResult, UserBalances } from '@/lib/chain-interface';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

export class SuiChainAPI implements ChainAPI {
    private client: SuiClient;
    private signer: any | null = null; // Should be the wallet signer from dapp-kit or wallet-standard

    constructor(network: 'mainnet' | 'testnet' | 'devnet' = 'testnet') {
        this.client = new SuiClient({ url: getFullnodeUrl(network) });
    }

    setSigner(signer: any) {
        this.signer = signer;
    }

    async getStrategies(): Promise<Strategy[]> {
        // Placeholder: Fetch from backend or on-chain registry
        return [
            {
                id: 'sui-cetus-usdc',
                name: 'Sui Cetus USDC',
                apy: 12.5,
                tvl: 1000000,
                chain: 'sui'
            }
        ];
    }

    async getVaultState(vaultId: string): Promise<VaultState> {
        // Placeholder implementation
        return {
            totalAssets: '0',
            lastUpdate: Date.now()
        };
    }

    async deposit(params: DepositParams): Promise<TxResult> {
        if (!this.signer) throw new Error('Wallet not connected');

        const tx = new Transaction();
        // Logic to build deposit PTB would go here
        // tx.moveCall({ target: ..., arguments: ... })

        try {
            const result = await this.signer.signAndExecuteTransactionBlock({ transactionBlock: tx });
            return {
                txId: result.digest,
                status: 'success'
            };
        } catch (e: any) {
            return { txId: '', status: 'failed', error: e.message };
        }
    }

    async withdraw(params: WithdrawParams): Promise<TxResult> {
        if (!this.signer) throw new Error('Wallet not connected');

        const tx = new Transaction();
        // Logic to build withdraw PTB

        try {
            const result = await this.signer.signAndExecuteTransactionBlock({ transactionBlock: tx });
            return {
                txId: result.digest,
                status: 'success'
            };
        } catch (e: any) {
            return { txId: '', status: 'failed', error: e.message };
        }
    }

    async getUserBalances(address: string): Promise<UserBalances> {
        const coins = await this.client.getCoins({ owner: address });
        const balances: UserBalances = { native: '0', tokens: {} };

        // Simplistic aggregation
        for (const coin of coins.data) {
            if (coin.coinType === '0x2::sui::SUI') {
                balances.native = (BigInt(balances.native) + BigInt(coin.balance)).toString();
            } else {
                balances.tokens[coin.coinType] = (BigInt(balances.tokens[coin.coinType] || '0') + BigInt(coin.balance)).toString();
            }
        }
        return balances;
    }

    async connectWallet(): Promise<string | null> {
        // In React/dapp-kit context, connection is handled by the provider UI usually.
        // This method might trigger a modal or be a no-op if relying on external state.
        return null;
    }
}
