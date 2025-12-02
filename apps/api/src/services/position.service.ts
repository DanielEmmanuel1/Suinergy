// Service for querying user positions from on-chain vault shares
import { SuiClient } from '@mysten/sui.js/client'
import { logger } from '../utils/logger'

export interface UserPosition {
    strategyId: string
    strategyName: string
    amount: number
    apy: number
    receiptTokenBalance: number
}

export class PositionService {
    private suiClient: SuiClient
    private packageId: string | null = null

    constructor(suiClient: SuiClient) {
        this.suiClient = suiClient
    }

    async initialize(packageId?: string) {
        this.packageId = packageId || process.env.SUI_SUINERGY_PACKAGE_ID || null
    }

    /**
     * Get all user positions by querying their vault share objects
     */
    async getUserPositions(userAddress: string): Promise<UserPosition[]> {
        if (!this.packageId) {
            logger.warn('Package ID not configured, returning empty positions')
            return []
        }

        try {
            // Query for UserPosition objects owned by the user
            // These are created when users deposit into vaults
            const positionObjects = await this.suiClient.getOwnedObjects({
                owner: userAddress,
                filter: {
                    StructType: `${this.packageId}::position::UserPosition`,
                },
                options: {
                    showContent: true,
                    showType: true,
                },
            })

            const positions: UserPosition[] = []

            for (const obj of positionObjects.data) {
                if (!obj.data?.content || !('fields' in obj.data.content)) continue

                const fields = obj.data.content.fields as any
                const vaultId = fields.vault_id || ''
                const shares = BigInt(fields.shares || '0')

                // Get vault info to determine strategy
                // For now, we'll use a simplified approach
                // In production, you'd query the vault object to get strategy info
                const strategyId = this.extractStrategyIdFromVaultId(vaultId)
                
                if (strategyId) {
                    // Get strategy APY from registry or strategy object
                    const apy = await this.getStrategyAPY(strategyId)
                    const strategyName = await this.getStrategyName(strategyId)

                    // Calculate amount from shares and vault share price
                    const amount = await this.calculatePositionValue(vaultId, shares)

                    positions.push({
                        strategyId,
                        strategyName: strategyName || `Strategy ${strategyId}`,
                        amount: Number(amount) / 1e9, // Convert from smallest unit
                        apy,
                        receiptTokenBalance: Number(shares),
                    })
                }
            }

            return positions
        } catch (error) {
            logger.error(`Failed to fetch positions for user ${userAddress}`, error)
            return []
        }
    }

    /**
     * Extract strategy ID from vault ID (simplified - in production would query vault object)
     */
    private extractStrategyIdFromVaultId(vaultId: string): string | null {
        // This is a placeholder - in production, you'd query the vault object
        // to get its associated strategy ID
        // For now, return null or use a mapping
        return null
    }

    /**
     * Get strategy APY (placeholder - would query from strategy or adapter registry)
     */
    private async getStrategyAPY(strategyId: string): Promise<number> {
        // Placeholder - would query from strategy object or adapter registry
        return 12.5 // Default APY
    }

    /**
     * Get strategy name (placeholder)
     */
    private async getStrategyName(strategyId: string): Promise<string | null> {
        // Placeholder - would query from strategy object
        return null
    }

    /**
     * Calculate position value from shares
     */
    private async calculatePositionValue(vaultId: string, shares: bigint): Promise<bigint> {
        try {
            // Query vault to get share price
            // This would call a view function on the vault contract
            // For now, return shares as 1:1 (placeholder)
            return shares
        } catch (error) {
            logger.error(`Failed to calculate position value for vault ${vaultId}`, error)
            return shares // Fallback to 1:1
        }
    }
}

import { suiClient } from '../lib/sui-client'

export const positionService = new PositionService(suiClient)

// Initialize on service load
positionService.initialize().catch((error) => {
    logger.error('Failed to initialize position service', error)
})

