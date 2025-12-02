import { useQuery } from '@tanstack/react-query'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { apiConfig } from '@/config'

interface RewardsData {
    synBalance: number
    sgpPoints: number
    currentTier: string
    nextTier: string
    tierProgress: number
    receiptTokens: Array<{
        id: string
        name: string
        amount: number
        apy: number
    }>
    recentActivity: Array<{
        type: string
        amount: number
        description: string
        timestamp: string
    }>
}

export function useRewards() {
    const account = useCurrentAccount()

    return useQuery<RewardsData>({
        queryKey: ['rewards', account?.address],
        queryFn: async () => {
            if (!account?.address) {
                return {
                    synBalance: 0,
                    sgpPoints: 0,
                    currentTier: 'Bronze',
                    nextTier: 'Silver',
                    tierProgress: 0,
                    receiptTokens: [],
                    recentActivity: [],
                }
            }

            // TODO: Replace with actual API call
            const response = await fetch(
                `${apiConfig.baseUrl}/api/rewards/${account.address}`
            )
            if (!response.ok) {
                throw new Error('Failed to fetch rewards')
            }
            return response.json()
        },
        enabled: !!account?.address,
        refetchInterval: 60000, // Poll every minute
    })
}

