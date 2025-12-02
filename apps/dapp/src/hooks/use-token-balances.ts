import { useQuery } from '@tanstack/react-query'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { suiConfig } from '@/config'

export interface TokenBalances {
    sui: bigint
    usdc: bigint
    usdt: bigint
}

/**
 * Hook to fetch token balances using the on-chain balance_reader module
 * Falls back to direct RPC queries if the module isn't available
 */
export function useTokenBalances() {
    const account = useCurrentAccount()
    const client = useSuiClient()

    return useQuery<TokenBalances>({
        queryKey: ['token-balances', account?.address],
        queryFn: async () => {
            if (!account?.address) {
                return {
                    sui: BigInt(0),
                    usdc: BigInt(0),
                    usdt: BigInt(0),
                }
            }


            try {
                // Note: balance_reader module is not deployed, using direct RPC queries
                const [suiBalance, usdcBalance, usdtBalance] = await Promise.all([
                    client.getBalance({
                        owner: account.address,
                        coinType: '0x2::sui::SUI',
                    }),
                    // Query USDC if testnet package ID is known
                    process.env.NEXT_PUBLIC_USDC_COIN_TYPE
                        ? client
                            .getBalance({
                                owner: account.address,
                                coinType: process.env.NEXT_PUBLIC_USDC_COIN_TYPE,
                            })
                            .catch(() => ({ totalBalance: '0' }))
                        : Promise.resolve({ totalBalance: '0' }),
                    // Query USDT if testnet package ID is known
                    process.env.NEXT_PUBLIC_USDT_COIN_TYPE
                        ? client
                            .getBalance({
                                owner: account.address,
                                coinType: process.env.NEXT_PUBLIC_USDT_COIN_TYPE,
                            })
                            .catch(() => ({ totalBalance: '0' }))
                        : Promise.resolve({ totalBalance: '0' }),
                ])

                return {
                    sui: BigInt(suiBalance.totalBalance),
                    usdc: BigInt(usdcBalance.totalBalance),
                    usdt: BigInt(usdtBalance.totalBalance),
                }
            } catch (error) {
                console.error('Failed to fetch token balances', error)
                return {
                    sui: BigInt(0),
                    usdc: BigInt(0),
                    usdt: BigInt(0),
                }
            }
        },
        enabled: !!account?.address,
        refetchInterval: 10000, // Poll every 10 seconds
        staleTime: 5000,
    })
}

