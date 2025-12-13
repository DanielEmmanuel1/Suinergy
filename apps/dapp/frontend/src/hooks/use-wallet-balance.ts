import { useQuery } from '@tanstack/react-query'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'

export function useWalletBalance() {
    const account = useCurrentAccount()
    const client = useSuiClient()

    return useQuery({
        queryKey: ['wallet-balance', account?.address],
        queryFn: async () => {
            if (!account?.address) {
                return null
            }

            // TODO: Replace with actual on-chain balance fetch
            const balances = await client.getBalance({
                owner: account.address,
            })

            return {
                totalBalance: BigInt(balances.totalBalance),
                coinType: balances.coinType,
                coinObjectCount: balances.coinObjectCount,
            }
        },
        enabled: !!account?.address,
        refetchInterval: 10000, // Poll every 10 seconds
    })
}

