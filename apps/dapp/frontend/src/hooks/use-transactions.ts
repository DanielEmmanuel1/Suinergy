import { useQuery } from '@tanstack/react-query'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'

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
    const client = useSuiClient()

    return useQuery<Transaction[]>({
        queryKey: ['transactions', account?.address, strategyId],
        queryFn: async () => {
            if (!account?.address) {
                return []
            }

            try {
                // Fetch recent transactions for the user
                const txs = await client.queryTransactionBlocks({
                    filter: {
                        FromAddress: account.address,
                    },
                    options: {
                        showEffects: true,
                        showInput: true,
                        showBalanceChanges: true,
                        showEvents: true,
                    },
                    limit: 20,
                    order: 'descending',
                })

                const transactions: Transaction[] = []

                for (const tx of txs.data) {
                    // Skip failed transactions
                    if (tx.effects?.status.status !== 'success') continue

                    const timestamp = tx.timestampMs ? new Date(Number(tx.timestampMs)) : new Date()

                    // Analyze balance changes to determine activity type
                    if (tx.balanceChanges) {
                        for (const change of tx.balanceChanges) {
                            // We only care about changes for the current user
                            const owner = change.owner as { AddressOwner?: string }
                            if (owner.AddressOwner !== account.address) continue

                            const rawAmount = Number(change.amount)
                            // Skip very small amounts (dust)
                            if (Math.abs(rawAmount) < 100) continue

                            const isDeposit = rawAmount < 0
                            const amount = Math.abs(rawAmount)

                            // Determine token type
                            let token = 'SUI'
                            let decimals = 9
                            if (change.coinType.includes('usdc')) {
                                token = 'USDC'
                                decimals = 6
                            } else if (change.coinType.includes('usdt')) {
                                token = 'USDT'
                                decimals = 6
                            }

                            const humanAmount = amount / Math.pow(10, decimals)

                            const type = isDeposit ? 'deposit' : 'withdrawal'

                            // Try to get function name/strategy from transaction block
                            let strategyName = 'Suinergy Vault'
                            // Map token to vault name
                            if (token === 'USDC') {
                                strategyName = 'Prime USDC Vault'
                            } else if (token === 'SUI') {
                                strategyName = 'Sovereign SUI Vault'
                            } else if (token === 'USDT') {
                                strategyName = 'Amplified USDT Vault'
                            }

                            transactions.push({
                                id: tx.digest + change.coinType, // Unique ID
                                type,
                                amount: humanAmount,
                                token,
                                strategyId: strategyId || 'unknown',
                                strategyName,
                                txHash: tx.digest,
                                timestamp,
                                status: 'completed',
                            })
                        }
                    }
                }

                return transactions
            } catch (error) {
                console.error('Failed to fetch transactions:', error)
                return []
            }
        },
        enabled: !!account?.address,
        refetchInterval: 30000, // Poll every 30 seconds
        staleTime: 10000,
    })
}

