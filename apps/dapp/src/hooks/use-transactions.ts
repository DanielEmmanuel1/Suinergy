import { useQuery } from '@tanstack/react-query'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { apiConfig } from '@/config'

export interface Transaction {
    id: string
    type: 'deposit' | 'withdrawal' | 'earnings' | 'claim'
    amount: number
    token: string
    strategyId: string
    strategyName: string
    txHash: string
    timestamp: Date
    status: 'pending' | 'completed' | 'failed'
}

export function useTransactions(strategyId?: string) {
    const account = useCurrentAccount()

    return useQuery<Transaction[]>({
        queryKey: ['transactions', account?.address, strategyId],
        queryFn: async () => {
            if (!account?.address) {
                return []
            }

            const url = strategyId
                ? `${apiConfig.baseUrl}/api/transactions/${account.address}?strategyId=${strategyId}`
                : `${apiConfig.baseUrl}/api/transactions/${account.address}`

            const response = await fetch(url)
            if (!response.ok) {
                throw new Error('Failed to fetch transactions')
            }
            
            const data = await response.json()
            // Convert timestamp strings to Date objects
            return data.map((tx: any) => ({
                ...tx,
                timestamp: new Date(tx.timestamp),
            }))
        },
        enabled: !!account?.address,
        refetchInterval: 30000, // Poll every 30 seconds
        staleTime: 10000,
    })
}

