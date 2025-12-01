// Shared TypeScript type definitions
// This package will contain common types used across frontend and backend

export interface User {
    id: string;
    walletAddress: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Strategy {
    id: string;
    name: string;
    protocol: string;
    contractAddress: string;
    currentApy: number;
    tvl: string;
    riskScore: number;
    isActive: boolean;
}

export interface Deposit {
    id: string;
    userId: string;
    txHash: string;
    amount: string;
    token: 'SUI' | 'USDC';
    strategyId?: string;
    depositedAt: Date;
    withdrawnAt?: Date;
}

export interface LoyaltyTier {
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    score: number;
    multiplier: number;
}
