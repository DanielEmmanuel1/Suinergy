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
     * Extract strategy ID from vault ID by mapping vault IDs to strategy IDs
     * In production, this would query the vault object to get its associated strategy ID
     */
    private extractStrategyIdFromVaultId(vaultId: string): string | null {
        // Get vault IDs from environment variables
        const suiVaultId = process.env.SUI_VAULT_ID || process.env.NEXT_PUBLIC_VAULT_ID || ''
        const usdcVaultId = process.env.SUI_USDC_VAULT_ID || process.env.NEXT_PUBLIC_USDC_VAULT_ID || ''
        const usdtVaultId = process.env.SUI_USDT_VAULT_ID || process.env.NEXT_PUBLIC_USDT_VAULT_ID || ''

        // Map vault IDs to strategy IDs
        if (vaultId === suiVaultId && suiVaultId) {
            return 'sui-staking'
        } else if (vaultId === usdcVaultId && usdcVaultId) {
            return 'usdc-liquidity'
        } else if (vaultId === usdtVaultId && usdtVaultId) {
            return 'usdt-liquidity'
        }

        // If no match found, return null
        // In production, you could query the vault object to get the strategy ID
        logger.warn(`Could not map vault ID ${vaultId} to a strategy ID`)
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

    /**
     * Get all protocol positions for a vault
     * Queries the StrategyVaultRegistry on-chain
     */
    async getVaultPositions(vaultId: string, registryId?: string): Promise<any[]> {
        const regId = registryId || process.env.SUI_STRATEGY_REGISTRY_ID || null
        
        if (!regId || !this.packageId) {
            logger.warn('Registry ID or Package ID not configured')
            return []
        }

        try {
            // Call view function: get_active_positions
            const result = await this.suiClient.devInspectTransactionBlock({
                sender: '0x0',
                transactionBlock: {
                    kind: 'moveCall',
                    data: {
                        packageId: this.packageId,
                        module: 'vault_selective',
                        function: 'get_active_positions',
                        arguments: [regId],
                    },
                },
            })

            // Parse position IDs from return values
            const positionIds: string[] = []
            // Extract position IDs from result (implementation depends on return format)

            // For each position ID, get position info
            const positions = []
            for (const positionId of positionIds) {
                try {
                    const posInfo = await this.suiClient.devInspectTransactionBlock({
                        sender: '0x0',
                        transactionBlock: {
                            kind: 'moveCall',
                            data: {
                                packageId: this.packageId,
                                module: 'vault_selective',
                                function: 'get_position_info',
                                arguments: [regId, positionId],
                            },
                        },
                    })
                    
                    // Parse PositionInfo and add to positions array
                    // This requires parsing the return values properly
                } catch (error) {
                    logger.warn(`Failed to get info for position ${positionId}`, error)
                }
            }

            return positions
        } catch (error) {
            logger.error(`Failed to fetch vault positions for ${vaultId}`, error)
            return []
        }
    }

    /**
     * Get user's proportional share of each position
     */
    async getUserVaultPositions(vaultId: string, userAddress: string, registryId?: string): Promise<any[]> {
        // Get all vault positions
        const positions = await this.getVaultPositions(vaultId, registryId)
        
        // Get user's total shares
        const userPositions = await this.getUserPositions(userAddress)
        const userVaultPosition = userPositions.find(p => {
            // Match vault ID - would need to store vault ID mapping
            return true // Simplified
        })

        if (!userVaultPosition) {
            return []
        }

        // Calculate user's share of each position
        return positions.map(pos => ({
            ...pos,
            userShare: this.calculateUserPositionShare(
                pos.currentValue,
                userVaultPosition.receiptTokenBalance,
                // Would need vault.total_shares and vault.total_assets
            ),
        }))
    }

    /**
     * Get current allocation breakdown
     */
    async getVaultAllocations(vaultId: string, registryId?: string): Promise<any[]> {
        const positions = await this.getVaultPositions(vaultId, registryId)
        
        // Calculate total value
        const totalValue = positions.reduce((sum, pos) => sum + BigInt(pos.currentValue || 0), BigInt(0))
        
        // Calculate allocation percentages
        return positions.map(pos => ({
            adapterId: pos.adapterId,
            protocolName: pos.protocolName,
            allocationPercent: totalValue > 0 
                ? (Number(BigInt(pos.currentValue) * BigInt(10000) / totalValue)) / 100
                : 0,
            currentValue: pos.currentValue,
            apy: pos.apy,
        }))
    }

    private calculateUserPositionShare(
        positionValue: bigint,
        userShares: number,
        // Would need totalShares and totalAssets parameters
    ): bigint {
        // Simplified calculation
        // In production: (userShares * positionValue) / totalShares
        return BigInt(0) // Placeholder
    }
}

import { suiClient } from '../lib/sui-client'

export const positionService = new PositionService(suiClient)

// Initialize on service load
positionService.initialize().catch((error) => {
    logger.error('Failed to initialize position service', error)
})

