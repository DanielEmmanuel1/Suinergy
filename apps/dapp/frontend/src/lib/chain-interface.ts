export interface Strategy {
    id: string;
    name: string;
    apy: number;
    tvl: number;
    chain: string;
}

export interface VaultState {
    totalAssets: string;
    userDeposit?: string;
    lastUpdate: number;
}

export interface DepositParams {
    amount: string;
    vaultId: string;
    account: string;
}

export interface WithdrawParams {
    amount: string;
    vaultId: string;
    account: string;
}

export interface UserBalances {
    native: string;
    tokens: Record<string, string>;
}

export interface TxResult {
    txId: string;
    status: 'success' | 'failed' | 'pending';
    error?: string;
}

export interface ChainAPI {
    getStrategies(): Promise<Strategy[]>;
    getVaultState(vaultId: string): Promise<VaultState>;
    deposit(params: DepositParams): Promise<TxResult>;
    withdraw(params: WithdrawParams): Promise<TxResult>;
    getUserBalances(address: string): Promise<UserBalances>;
    connectWallet(): Promise<string | null>; // basic connection returning address
}
