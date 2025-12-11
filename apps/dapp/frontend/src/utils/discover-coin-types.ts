import { SuiClient } from '@mysten/sui/client'

/**
 * Discover all coin types in a wallet that match a token symbol
 */
export async function discoverCoinTypes(
    client: SuiClient,
    owner: string,
    tokenSymbol: string
): Promise<Array<{ coinType: string; balance: bigint; count: number }>> {
    try {
        // Get all coins from wallet
        const allCoins = await client.getAllCoins({
            owner,
            limit: 100,
        })

        // Handle pagination
        let allCoinData = [...allCoins.data]
        let nextCursor = allCoins.nextCursor
        while (nextCursor && allCoinData.length < 500) {
            const moreCoins = await client.getAllCoins({
                owner,
                cursor: nextCursor,
                limit: 100,
            })
            allCoinData = [...allCoinData, ...moreCoins.data]
            nextCursor = moreCoins.nextCursor
            if (!nextCursor) break
        }

        // Filter for coins matching the token symbol
        const tokenLower = tokenSymbol.toLowerCase()
        const matchingCoins = allCoinData.filter((coin) => {
            const coinTypeLower = coin.coinType.toLowerCase()
            return (
                coinTypeLower.includes(tokenLower) ||
                coinTypeLower.includes('usdc') ||
                coinTypeLower.includes('usdt')
            )
        })

        // Group by coin type
        const coinTypeMap = new Map<
            string,
            { balance: bigint; count: number }
        >()
        matchingCoins.forEach((coin) => {
            const existing = coinTypeMap.get(coin.coinType) || {
                balance: BigInt(0),
                count: 0,
            }
            coinTypeMap.set(coin.coinType, {
                balance: existing.balance + BigInt(coin.balance),
                count: existing.count + 1,
            })
        })

        // Convert to array and sort by balance
        return Array.from(coinTypeMap.entries())
            .map(([coinType, data]) => ({
                coinType,
                balance: data.balance,
                count: data.count,
            }))
            .sort((a, b) => (b.balance > a.balance ? 1 : -1))
    } catch (error) {
        console.error('Error discovering coin types:', error)
        return []
    }
}

/**
 * Common USDC coin types on Sui
 */
export const COMMON_USDC_COIN_TYPES = {
    WORMHOLE: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
    NATIVE_CIRCLE: '0x2::coin::Coin<0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN>',
    // Add more as needed
}

/**
 * Get balance for a specific coin type
 */
export async function getCoinBalance(
    client: SuiClient,
    owner: string,
    coinType: string
): Promise<bigint> {
    try {
        const balance = await client.getBalance({
            owner,
            coinType,
        })
        return BigInt(balance.totalBalance)
    } catch {
        return BigInt(0)
    }
}

