import { useQuery } from '@tanstack/react-query'
import { useSuiClient } from '@mysten/dapp-kit'
import { ProtocolPosition } from '@/components/modals/selective-withdraw-modal'
import { apiConfig } from '@/config'

interface VaultPosition {
    adapterId: string
    positionId: string
    protocolName: string
    allocationPercent: number
    currentValue: string // BigInt as string
    apy: number
    logo?: string
}

export function useVaultPositions(vaultId: string | undefined, registryId: string | undefined, userShares: bigint) {
    const client = useSuiClient()

    return useQuery<ProtocolPosition[]>({
        queryKey: ['vault-positions', vaultId, registryId, userShares.toString()],
        queryFn: async () => {
            if (!vaultId || !registryId) {
                return []
            }

            try {
                // Try to fetch from backend API first
                const response = await fetch(`${apiConfig.baseUrl}/api/vaults/${vaultId}/positions`)
                
                if (response.ok) {
                    const data = await response.json()
                    return data.map((pos: VaultPosition) => ({
                        adapterId: pos.adapterId,
                        positionId: pos.positionId,
                        protocolName: pos.protocolName,
                        allocationPercent: pos.allocationPercent,
                        currentValue: BigInt(pos.currentValue),
                        userShare: calculateUserShare(
                            BigInt(pos.currentValue),
                            pos.allocationPercent,
                            userShares
                        ),
                        apy: pos.apy,
                        logo: pos.logo,
                    }))
                }

                // Fallback: Query on-chain if backend not available
                // This would require view functions in the contract
                // For now, return empty array
                return []
            } catch (error) {
                console.error('Failed to fetch vault positions:', error)
                return []
            }
        },
        enabled: !!vaultId && !!registryId && userShares > 0,
        refetchInterval: 30000, // Refresh every 30 seconds
    })
}

/**
 * Calculate user's share of a position based on their total shares
 * This is a simplified calculation - in production, should use vault total_assets
 */
function calculateUserShare(
    positionValue: bigint,
    allocationPercent: number,
    userShares: bigint
): bigint {
    // Simplified: user_share = position_value * (user_shares / estimated_total_shares)
    // In production, this should query vault.total_shares and vault.total_assets
    // For now, estimate based on allocation percentage
    // This is approximate and should be replaced with actual on-chain queries
    
    if (userShares === BigInt(0)) return BigInt(0)
    
    // Approximate: assume user's share is proportional to allocation
    // In reality: user_share = position_value * (user_shares / total_shares)
    // Since we don't have total_shares here, we'll use a placeholder calculation
    // This will be fixed when view functions are implemented
    return (positionValue * userShares) / (BigInt(1000000)) // Placeholder denominator
}

