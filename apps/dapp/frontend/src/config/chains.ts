import { ChainId } from '@/wallets'

export interface Strategy {
    id: string
    name: string
    asset: string
    apy: number
    apr: number
    apyChange: number
    tvl: number
    capacity: number
    remaining: number
    userAllocation: number
    risk: 'low' | 'medium' | 'high'
    withdrawalLatency: string
    platformFee: number
    description?: string
    platforms?: {
        id: string
        name: string
        allocation: number
        apy: number
        risk: 'low' | 'medium' | 'high'
        health: 'excellent' | 'good' | 'fair'
        color: string
    }[]
}

export interface ChainConfig {
    id: string
    name: string
    description: string
    color: string // CSS gradient or color class
    strategies: Strategy[]
}

export const SUPPORTED_CHAINS: ChainConfig[] = [
    {
        id: 'sui',
        name: 'Sui',
        description: 'High-performance Layer 1 with instant finality',
        color: 'from-blue-500 to-cyan-400',
        strategies: [
            {
                id: 'sui-1',
                name: 'Sovereign SUI Vault',
                asset: 'SUI',
                apy: 8.2,
                apr: 7.9,
                apyChange: -0.2,
                tvl: 5000000,
                capacity: 10000000,
                remaining: 5000000,
                userAllocation: 0,
                risk: 'low',
                withdrawalLatency: '7d',
                platformFee: 0.15,
            },
            {
                id: 'sui-2',
                name: 'Prime USDC Vault',
                asset: 'USDC',
                apy: 12.5,
                apr: 11.8,
                apyChange: 0.5,
                tvl: 2500000,
                capacity: 5000000,
                remaining: 2500000,
                userAllocation: 0,
                risk: 'low',
                withdrawalLatency: '24h',
                platformFee: 0.1,
            },
        ],
    },
    {
        id: 'solana',
        name: 'Solana',
        description: 'Fast, secure, and scalable decentralized apps',
        color: 'from-purple-500 to-indigo-500',
        strategies: [
            {
                id: 'sol-1',
                name: 'MNDE Staking Strategy',
                asset: 'MNDE',
                apy: 7.8,
                apr: 7.5,
                apyChange: 0.1,
                tvl: 12000000,
                capacity: 20000000,
                remaining: 8000000,
                userAllocation: 0,
                risk: 'low',
                withdrawalLatency: '2d',
                platformFee: 0.1,
            },
            {
                id: 'sol-2',
                name: 'USDC Yield Optimizer',
                asset: 'USDC',
                apy: 14.2,
                apr: 13.8,
                apyChange: 0.4,
                tvl: 8500000,
                capacity: 15000000,
                remaining: 6500000,
                userAllocation: 0,
                risk: 'medium',
                withdrawalLatency: '24h',
                platformFee: 0.15,
            },
            {
                id: 'sol-3',
                name: 'Bonk Momentum Vault',
                asset: 'Bonk',
                apy: 45.5,
                apr: 40.2,
                apyChange: 5.2,
                tvl: 500000,
                capacity: 1000000,
                remaining: 500000,
                userAllocation: 0,
                risk: 'high',
                withdrawalLatency: 'Instant',
                platformFee: 0.2,
            },
        ],
    },
    {
        id: 'base',
        name: 'Base',
        description: 'Secure, low-cost, builder-friendly Ethereum L2',
        color: 'from-blue-600 to-blue-400',
        strategies: [
            {
                id: 'base-1',
                name: 'Base ETH Compounding',
                asset: 'ETH',
                apy: 4.5,
                apr: 4.2,
                apyChange: 0.05,
                tvl: 3000000,
                capacity: 10000000,
                remaining: 7000000,
                userAllocation: 0,
                risk: 'low',
                withdrawalLatency: '1d',
                platformFee: 0.1,
            },
        ],
    },
    {
        id: 'lisk',
        name: 'Lisk',
        description: 'Accessible blockchain application platform',
        color: 'from-blue-400 to-cyan-300',
        strategies: [
            {
                id: 'lisk-1',
                name: 'LSK Staking Rewards',
                asset: 'LSK',
                apy: 10.0,
                apr: 9.8,
                apyChange: 0.0,
                tvl: 1000000,
                capacity: 5000000,
                remaining: 4000000,
                userAllocation: 0,
                risk: 'low',
                withdrawalLatency: '3d',
                platformFee: 0.1,
            },
        ],
    },
    {
        id: 'avalanche',
        name: 'Avalanche',
        description: 'Blazingly fast, low cost, & eco-friendly',
        color: 'from-red-500 to-red-400',
        strategies: [
            {
                id: 'avax-1',
                name: 'AVAX Validator Vault',
                asset: 'AVAX',
                apy: 8.5,
                apr: 8.2,
                apyChange: 0.1,
                tvl: 4500000,
                capacity: 10000000,
                remaining: 5500000,
                userAllocation: 0,
                risk: 'low',
                withdrawalLatency: '2d',
                platformFee: 0.1,
            },
        ],
    },
]

export function getChainConfig(chainId: string): ChainConfig | undefined {
    return SUPPORTED_CHAINS.find(chain => chain.id === chainId)
}
