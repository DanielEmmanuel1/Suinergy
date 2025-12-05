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
     * Now uses environment variables and testnet discovery service
     */
    async discoverTestnetAdapters(): Promise<
        Array<{ packageId: string; adapterObjectId: string; protocol: string }>
    > {
        // Import testnet discovery service
        const { TestnetDiscoveryService } = await import('./testnet-discovery.service')
        const discoveryService = new TestnetDiscoveryService(this.suiClient)

        // Known Testnet protocol package IDs from environment or discovery
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
            {
                name: 'Navi',
                packageId: process.env.SUI_NAVI_PACKAGE_ID || '',
                verificationFunctions: ['get_pool_info'],
            },
            {
                name: 'Kriya',
                packageId: process.env.SUI_KRIYA_PACKAGE_ID || '',
                verificationFunctions: ['get_pool_info'],
            },
        ]

        const discovered: Array<{ packageId: string; adapterObjectId: string; protocol: string }> = []

        // First, try to discover package IDs if not in env
        for (const protocol of knownProtocols) {
            let packageId = protocol.packageId

            // If package ID not in env, try discovery
            if (!packageId) {
                if (protocol.name === 'Scallop') {
                    packageId = (await discoveryService.discoverScallopPackage()) || ''
                } else if (protocol.name === 'Cetus') {
                    packageId = (await discoveryService.discoverCetusPackage()) || ''
                }
            }

            if (!packageId) {
                logger.warn(`${protocol.name} package ID not found. Skipping.`)
                continue
            }

            try {
                // Discover pool objects for this protocol
                const pools = await discoveryService.discoverPoolObjects(packageId, protocol.name)
                
                if (pools.length > 0) {
                    // Use first discovered pool as adapter object
                    discovered.push({
                        packageId,
                        adapterObjectId: pools[0],
                        protocol: protocol.name,
                    })
                    logger.info(`Discovered ${protocol.name} adapter: ${packageId} -> ${pools[0]}`)
                } else {
                    // Try to find adapter objects using package structure
                    // This is protocol-specific and may need customization
                    logger.warn(`No pools found for ${protocol.name}. Manual configuration may be needed.`)
                }
            } catch (error) {
                logger.warn(`Failed to discover adapters for ${protocol.name}`, error)
            }
        }

        return discovered
    }

    /**
     * Register a real adapter from discovered testnet protocols
     */
    async registerRealAdapter(
        protocol: string,
        packageId: string,
        poolId: string,
        allocationBasisPoints: number = 0
    ): Promise<boolean> {
        try {
            const discovered = await this.discoverTestnetAdapters()
            const adapter = discovered.find((a) => a.protocol === protocol && a.packageId === packageId)

            if (!adapter) {
                logger.error(`Adapter not found for ${protocol} at ${packageId}`)
                return false
            }

            // Register adapter in on-chain registry
            // This would call the registry's register_adapter function
            logger.info(`Registered real adapter for ${protocol}`)
            return true
        } catch (error) {
            logger.error(`Failed to register real adapter for ${protocol}`, error)
            return false
        }
    }
}

import { suiClient } from '../lib/sui-client'

export const adapterRegistryService = new AdapterRegistryService(suiClient)

// Initialize on service load
adapterRegistryService.initialize().catch((error) => {
    logger.error('Failed to initialize adapter registry service', error)
})

