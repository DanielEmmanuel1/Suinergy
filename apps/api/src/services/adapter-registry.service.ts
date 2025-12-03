// Service for querying adapter registry from on-chain contracts
// Handles discovery of real vs mock adapters and provides view functions

import { SuiClient } from '@mysten/sui.js/client'
import { logger } from '../utils/logger'

export interface AdapterBinding {
    adapterType: 'mock' | 'real'
    packageId: string | null
    adapterObjectId: string | null
    allocationBasisPoints: number
    lastHarvestTimestamp: number
    isActive: boolean
}

export interface StrategyAdapterInfo {
    strategyId: string
    adapters: Record<number, AdapterBinding>
    hasMockAdapters: boolean
}

export interface AdapterRegistryState {
    isTestnet: boolean
    strategies: StrategyAdapterInfo[]
    hasAnyMockAdapters: boolean
}

export class AdapterRegistryService {
    private suiClient: SuiClient
    private protocolRegistryId: string | null = null
    private protocolConfigId: string | null = null

    constructor(suiClient: SuiClient) {
        this.suiClient = suiClient
    }

    /**
     * Initialize registry IDs from environment or discovery
     */
    async initialize(registryId?: string, configId?: string): Promise<void> {
        this.protocolRegistryId = registryId || process.env.SUI_PROTOCOL_REGISTRY_ID || null
        this.protocolConfigId = configId || process.env.SUI_PROTOCOL_CONFIG_ID || null

        if (!this.protocolRegistryId || !this.protocolConfigId) {
            logger.warn('Adapter registry IDs not configured. Using mock data.')
        }
    }

    /**
     * Get full adapter registry state
     */
    async getRegistryState(): Promise<AdapterRegistryState> {
        if (!this.protocolRegistryId || !this.protocolConfigId) {
            // Return mock state when registry not deployed
            return {
                isTestnet: true,
                strategies: [],
                hasAnyMockAdapters: true,
            }
        }

        try {
            // Call view function: is_testnet
            const isTestnet = await this.suiClient.devInspectTransactionBlock({
                sender: '0x0', // Use zero address for view calls
                transactionBlock: {
                    kind: 'moveCall',
                    data: {
                        packageId: process.env.SUI_SUINERGY_PACKAGE_ID || '0x0',
                        module: 'registry',
                        function: 'is_testnet',
                        arguments: [this.protocolConfigId],
                    },
                },
            })

            // Get all registered strategies
            const strategies = await this.getStrategies()

            const hasAnyMockAdapters = strategies.some((s) => s.hasMockAdapters)

            // Extract boolean value from return values (1 = true, 0 = false)
            const isTestnetValue = isTestnet.results?.[0]?.returnValues?.[0]?.[0] === 1

            return {
                isTestnet: isTestnetValue,
                strategies,
                hasAnyMockAdapters,
            }
        } catch (error) {
            logger.error('Failed to fetch adapter registry state', error)
            // Fallback to mock state
            return {
                isTestnet: true,
                strategies: [],
                hasAnyMockAdapters: true,
            }
        }
    }

    /**
     * Get adapter info for a specific strategy
     */
    async getStrategyAdapters(strategyId: string): Promise<StrategyAdapterInfo> {
        if (!this.protocolRegistryId) {
            return {
                strategyId,
                adapters: {},
                hasMockAdapters: true,
            }
        }

        try {
            // Call view function: get_adapter_binding for each slot
            // For now, we'll check slots 0-9 (max 10 adapters per strategy)
            const adapters: Record<number, AdapterBinding> = {}

            for (let slot = 0; slot < 10; slot++) {
                try {
                    const result = await this.suiClient.devInspectTransactionBlock({
                        sender: '0x0',
                        transactionBlock: {
                            kind: 'moveCall',
                            data: {
                                packageId: process.env.SUI_SUINERGY_PACKAGE_ID || '0x0',
                                module: 'registry',
                                function: 'get_adapter_binding',
                                arguments: [this.protocolRegistryId, strategyId, slot.toString()],
                            },
                        },
                    })

                    const returnValues = result.results?.[0]?.returnValues
                    if (returnValues && returnValues.length >= 6) {
                        const isMock = returnValues[0]?.[0] === 1
                        const packageId = returnValues[1]?.[0] || null
                        const adapterObjectId = returnValues[2]?.[0] || null
                        const allocationBp = returnValues[3]?.[0] || 0
                        const lastHarvest = returnValues[4]?.[0] || 0
                        const isActive = returnValues[5]?.[0] === 1

                        if (isActive) {
                            adapters[slot] = {
                                adapterType: isMock ? 'mock' : 'real',
                                packageId: packageId ? `0x${packageId.toString(16)}` : null,
                                adapterObjectId: adapterObjectId
                                    ? `0x${adapterObjectId.toString(16)}`
                                    : null,
                                allocationBasisPoints: Number(allocationBp),
                                lastHarvestTimestamp: Number(lastHarvest),
                                isActive: true,
                            }
                        }
                    }
                } catch (error) {
                    // Slot doesn't exist, continue
                    break
                }
            }

            const hasMockAdapters = Object.values(adapters).some((a) => a.adapterType === 'mock')

            return {
                strategyId,
                adapters,
                hasMockAdapters,
            }
        } catch (error) {
            logger.error(`Failed to fetch adapters for strategy ${strategyId}`, error)
            return {
                strategyId,
                adapters: {},
                hasMockAdapters: true,
            }
        }
    }

    /**
     * Get all registered strategies
     */
    private async getStrategies(): Promise<StrategyAdapterInfo[]> {
        // In a full implementation, this would query the registry for all strategy IDs
        // For now, return empty array - strategies will be discovered from events or config
        return []
    }

    /**
     * Verify a candidate Testnet adapter by calling read functions
     */
    async verifyTestnetAdapter(
        packageId: string,
        adapterObjectId: string,
        verificationFunctions: string[]
    ): Promise<boolean> {
        try {
            // Try to call each verification function
            for (const func of verificationFunctions) {
                try {
                    await this.suiClient.devInspectTransactionBlock({
                        sender: '0x0',
                        transactionBlock: {
                            kind: 'moveCall',
                            data: {
                                packageId,
                                module: 'adapter', // Assumes standard module name
                                function: func,
                                arguments: [adapterObjectId],
                            },
                        },
                    })
                } catch (error) {
                    logger.warn(`Verification function ${func} failed for adapter ${adapterObjectId}`, error)
                    return false
                }
            }
            return true
        } catch (error) {
            logger.error(`Failed to verify adapter ${adapterObjectId}`, error)
            return false
        }
    }

    /**
     * Discover real Testnet adapters by checking known protocol package IDs
     */
    async discoverTestnetAdapters(): Promise<
        Array<{ packageId: string; adapterObjectId: string; protocol: string }>
    > {
        // Known Testnet protocol package IDs (should be updated from official sources)
        const knownProtocols = [
            {
                name: 'Scallop',
                packageId: process.env.SUI_SCALLOP_PACKAGE_ID || '',
                verificationFunctions: ['get_pool_info', 'get_total_supply'],
            },
            {
                name: 'Cetus',
                packageId: process.env.SUI_CETUS_PACKAGE_ID || '',
                verificationFunctions: ['get_pool_info'],
            },
            // Add more protocols as they deploy to Testnet
        ]

        const discovered: Array<{ packageId: string; adapterObjectId: string; protocol: string }> = []

        for (const protocol of knownProtocols) {
            if (!protocol.packageId) continue

            try {
                // Try to find adapter objects for this protocol
                const objects = await this.suiClient.getOwnedObjects({
                    owner: protocol.packageId, // This is a placeholder - actual discovery logic needed
                    filter: {
                        StructType: `${protocol.packageId}::adapter::Adapter`,
                    },
                    options: {
                        showContent: true,
                    },
                })

                for (const obj of objects.data) {
                    if (obj.data?.objectId) {
                        const verified = await this.verifyTestnetAdapter(
                            protocol.packageId,
                            obj.data.objectId,
                            protocol.verificationFunctions
                        )
                        if (verified) {
                            discovered.push({
                                packageId: protocol.packageId,
                                adapterObjectId: obj.data.objectId,
                                protocol: protocol.name,
                            })
                        }
                    }
                }
            } catch (error) {
                logger.warn(`Failed to discover adapters for ${protocol.name}`, error)
            }
        }

        return discovered
    }
}

import { suiClient } from '../lib/sui-client'

export const adapterRegistryService = new AdapterRegistryService(suiClient)

// Initialize on service load
adapterRegistryService.initialize().catch((error) => {
    logger.error('Failed to initialize adapter registry service', error)
})

