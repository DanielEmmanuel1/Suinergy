import { useQuery } from '@tanstack/react-query'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { apiConfig } from '@/config'

interface UserPosition {
    strategyId: string
    strategyName: string
    amount: number
    apy: number
    receiptTokenBalance: number
}

export function useUserPositions() {
    const account = useCurrentAccount()

    return useQuery<UserPosition[]>({
        queryKey: ['user-positions', account?.address],
        queryFn: async () => {
            if (!account?.address) {
                return []
            }

            // TODO: Replace with actual API call
            const response = await fetch(
                `${apiConfig.baseUrl}/api/positions/${account.address}`
            )
            if (!response.ok) {
                throw new Error('Failed to fetch user positions')
            }
            return response.json()
        },
        enabled: !!account?.address,
        refetchInterval: 30000, // Poll every 30 seconds
    })
}

