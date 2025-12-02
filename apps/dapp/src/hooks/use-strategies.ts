import { useQuery } from '@tanstack/react-query'
import { apiConfig } from '@/config'

interface Strategy {
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
}

export function useStrategies() {
    return useQuery<Strategy[]>({
        queryKey: ['strategies'],
        queryFn: async () => {
            // TODO: Replace with actual API call
            const response = await fetch(`${apiConfig.baseUrl}/api/strategies`)
            if (!response.ok) {
                throw new Error('Failed to fetch strategies')
            }
            return response.json()
        },
        refetchInterval: 30000, // Poll every 30 seconds
        staleTime: 10000, // Consider data stale after 10 seconds
    })
}

export function useStrategy(strategyId: string) {
    return useQuery<Strategy>({
        queryKey: ['strategy', strategyId],
        queryFn: async () => {
            // TODO: Replace with actual API call
            const response = await fetch(`${apiConfig.baseUrl}/api/strategies/${strategyId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch strategy')
            }
            return response.json()
        },
        enabled: !!strategyId,
    })
}

