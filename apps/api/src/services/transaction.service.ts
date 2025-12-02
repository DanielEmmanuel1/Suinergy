// Service for querying on-chain transactions and events
import { SuiClient } from '@mysten/sui.js/client'
import { logger } from '../utils/logger'

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

export class TransactionService {
    private suiClient: SuiClient
    private packageId: string | null = null

    constructor(suiClient: SuiClient) {
        this.suiClient = suiClient
    }

    async initialize(packageId?: string) {
        this.packageId = packageId || process.env.SUI_SUINERGY_PACKAGE_ID || null
    }

    /**
     * Get all transactions for a user by querying on-chain events
     */
    async getUserTransactions(userAddress: string, strategyId?: string): Promise<Transaction[]> {
        if (!this.packageId) {
            logger.warn('Package ID not configured, returning empty transactions')
            return []
        }

        try {
            const transactions: Transaction[] = []

            // Query DepositEvent
            const depositEvents = await this.queryEvents<{
                user: string
                vault_id: string
                amount: string
                shares_minted: string
            }>(`${this.packageId}::events::DepositEvent`, userAddress)

            for (const event of depositEvents) {
                if (strategyId && !this.matchesStrategy(event.vault_id, strategyId)) continue

                transactions.push({
                    id: event.id.eventId,
                    type: 'deposit',
                    amount: Number(event.parsedJson.amount) / 1e9, // Convert from smallest unit
                    token: 'SUI', // Would determine from vault type
                    strategyId: this.extractStrategyId(event.parsedJson.vault_id),
                    strategyName: await this.getStrategyName(this.extractStrategyId(event.parsedJson.vault_id)),
                    txHash: event.id.txDigest,
                    timestamp: new Date(Number(event.timestampMs)),
                    status: 'completed',
                })
            }

            // Query WithdrawEvent
            const withdrawEvents = await this.queryEvents<{
                user: string
                vault_id: string
                amount: string
                shares_burned: string
            }>(`${this.packageId}::events::WithdrawEvent`, userAddress)

            for (const event of withdrawEvents) {
                if (strategyId && !this.matchesStrategy(event.vault_id, strategyId)) continue

                transactions.push({
                    id: event.id.eventId,
                    type: 'withdrawal',
                    amount: Number(event.parsedJson.amount) / 1e9,
                    token: 'SUI',
                    strategyId: this.extractStrategyId(event.parsedJson.vault_id),
                    strategyName: await this.getStrategyName(this.extractStrategyId(event.parsedJson.vault_id)),
                    txHash: event.id.txDigest,
                    timestamp: new Date(Number(event.timestampMs)),
                    status: 'completed',
                })
            }

            // Sort by timestamp descending
            transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

            return transactions
        } catch (error) {
            logger.error(`Failed to fetch transactions for user ${userAddress}`, error)
            return []
        }
    }

    /**
     * Query events from Sui blockchain
     */
    private async queryEvents<T>(
        eventType: string,
        userAddress: string
    ): Promise<Array<{ id: { eventId: string; txDigest: string }; parsedJson: T; timestampMs: string }>> {
        try {
            const events = await this.suiClient.queryEvents({
                query: {
                    MoveEventType: eventType,
                },
                limit: 100,
                order: 'descending',
            })

            // Filter by user address
            return events.data
                .filter((event) => {
                    const parsed = event.parsedJson as any
                    return parsed.user === userAddress
                })
                .map((event) => ({
                    id: {
                        eventId: event.id.eventId,
                        txDigest: event.id.txDigest,
                    },
                    parsedJson: event.parsedJson as T,
                    timestampMs: event.timestampMs || Date.now().toString(),
                }))
        } catch (error) {
            logger.error(`Failed to query events for type ${eventType}`, error)
            return []
        }
    }

    /**
     * Extract strategy ID from vault ID (simplified)
     */
    private extractStrategyId(vaultId: string): string {
        // Placeholder - would query vault object to get strategy ID
        return vaultId
    }

    /**
     * Check if vault matches strategy
     */
    private matchesStrategy(vaultId: string, strategyId: string): boolean {
        // Placeholder - would query vault to check strategy
        return true
    }

    /**
     * Get strategy name (placeholder)
     */
    private async getStrategyName(strategyId: string): Promise<string> {
        // Placeholder - would query strategy object
        return `Strategy ${strategyId.slice(0, 8)}`
    }
}

import { suiClient } from '../lib/sui-client'

export const transactionService = new TransactionService(suiClient)

// Initialize on service load
transactionService.initialize().catch((error) => {
    logger.error('Failed to initialize transaction service', error)
})

