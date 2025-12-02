import { useQuery } from '@tanstack/react-query'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'

interface UserPosition {
    strategyId: string
    strategyName: string
    amount: number
    apy: number
    receiptTokenBalance: number
}

export function useUserPositions() {
    const account = useCurrentAccount()
    const client = useSuiClient()

    return useQuery<UserPosition[]>({
        queryKey: ['user-positions', account?.address],
        queryFn: async () => {
            if (!account?.address) {
                return []
            }

            try {
                const packageId = process.env.NEXT_PUBLIC_SUINERGY_PACKAGE_ID
                if (!packageId) {
                    console.warn('Package ID not configured')
                    return []
                }

                // Query all objects owned by the user
                const objects = await client.getOwnedObjects({
                    owner: account.address,
                    filter: {
                        StructType: `${packageId}::position::UserPosition`,
                    },
                    options: {
                        showContent: true,
                        showType: true,
                    },
                })

                // Parse the UserPosition objects
                const positions: UserPosition[] = []
                for (const obj of objects.data) {
                    if (obj.data?.content?.dataType === 'moveObject') {
                        const fields = obj.data.content.fields as any

                        // Calculate amount from shares (simplified - in production, query vault for exchange rate)
                        const shares = BigInt(fields.shares || 0)
                        const amount = Number(shares) / 1e9 // Convert from MIST to SUI

                        positions.push({
                            strategyId: 'sui-staking', // Default strategy
                            strategyName: 'SUI Staking',
                            amount,
                            apy: 12.5, // Mock APY for now
                            receiptTokenBalance: Number(shares),
                        })
                    }
                }

                return positions
            } catch (error) {
                console.error('Failed to fetch user positions:', error)
                return []
            }
        },
        enabled: !!account?.address,
        refetchInterval: 30000, // Poll every 30 seconds
    })
}

