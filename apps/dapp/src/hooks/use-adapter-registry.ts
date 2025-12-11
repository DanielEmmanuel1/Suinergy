import { useQuery } from '@tanstack/react-query'
import { apiConfig } from '@/config'

export interface AdapterBinding {
    adapterType: 'mock' | 'real'
    packageId: string | null
    adapterObjectId: string | null
    allocationBasisPoints: number
    lastHarvestTimestamp: number
    isActive: boolean
}

export interface StrategyAdapterInfo {
    strategyId: string
    adapters: Record<number, AdapterBinding> // slot -> binding
    hasMockAdapters: boolean
}

export interface AdapterRegistryState {
    isTestnet: boolean
    strategies: StrategyAdapterInfo[]
    hasAnyMockAdapters: boolean
}

export function useAdapterRegistry() {
    return useQuery<AdapterRegistryState>({
        queryKey: ['adapter-registry'],
        queryFn: async () => {
            const response = await fetch(`${apiConfig.baseUrl}/api/adapter-registry`)
            if (!response.ok) {
                throw new Error('Failed to fetch adapter registry')
            }
            return response.json()
        },
        refetchInterval: 30000, // Poll every 30 seconds
        staleTime: 10000,
    })
}

export function useStrategyAdapters(strategyId: string) {
    return useQuery<StrategyAdapterInfo>({
        queryKey: ['strategy-adapters', strategyId],
        queryFn: async () => {
            const response = await fetch(`${apiConfig.baseUrl}/api/adapter-registry/strategy/${strategyId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch strategy adapters')
            }
            return response.json()
        },
        enabled: !!strategyId,
        refetchInterval: 30000,
    })
}

