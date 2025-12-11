import { useQuery } from '@tanstack/react-query'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { PACKAGE_VAULT_MAPPINGS } from '../lib/package-mappings'

interface UserPosition {
    strategyId: string
    strategyName: string
    amount: number
    apy: number
    receiptTokenBalance: number
    packageId: string
    vaultId: string
    objectId: string
}

export function useUserPositions() {
    const account = useCurrentAccount()
    const client = useSuiClient()

    return useQuery<UserPosition[]>({
        queryKey: ['user-positions', account?.address],
        queryFn: async () => {
            if (!account?.address) {
                return []
            }

            try {
                // Collect all package IDs to check
                const envPackageId = process.env.NEXT_PUBLIC_SUINERGY_PACKAGE_ID
                const packageIds = new Set<string>()

                if (envPackageId) packageIds.add(envPackageId)
                Object.keys(PACKAGE_VAULT_MAPPINGS).forEach(id => packageIds.add(id))

                console.log('Querying positions across packages:', Array.from(packageIds))

                // Query all packages in parallel
                const queryPromises = Array.from(packageIds).map(async (packageId) => {
                    try {
                        const objects = await client.getOwnedObjects({
                            owner: account.address,
                            filter: {
                                StructType: `${packageId}::position::UserPosition`,
                            },
                            options: {
                                showContent: true,
                                showType: true,
                            },
                        })
                        return { packageId, objects: objects.data }
                    } catch (e) {
                        console.warn(`Failed to query package ${packageId}:`, e)
                        return { packageId, objects: [] }
                    }
                })

                const results = await Promise.all(queryPromises)

                // Parse the UserPosition objects
                const positions: UserPosition[] = []

                // Helper to resolve strategy info from vault ID
                const getStrategyInfo = (vaultId: string) => {
                    // Check env vars first
                    if (vaultId === process.env.NEXT_PUBLIC_USDC_VAULT_ID) {
                        return { id: 'usdc-liquidity', name: 'Prime USDC Vault', decimals: 6 }
                    }
                    if (vaultId === process.env.NEXT_PUBLIC_USDT_VAULT_ID) {
                        return { id: 'usdt-liquidity', name: 'Amplified USDT Vault', decimals: 6 }
                    }
                    if (vaultId === process.env.NEXT_PUBLIC_VAULT_ID) {
                        return { id: 'sui-staking', name: 'Sovereign SUI Vault', decimals: 9 }
                    }

                    // Check mappings
                    for (const mapping of Object.values(PACKAGE_VAULT_MAPPINGS)) {
                        if (mapping.USDC === vaultId) {
                            return { id: 'usdc-liquidity', name: 'Prime USDC Vault (Legacy)', decimals: 6 }
                        }
                        if (mapping.SUI === vaultId) {
                            return { id: 'sui-staking', name: 'Sovereign SUI Vault (Legacy)', decimals: 9 }
                        }
                    }

                    // Default fallback
                    return { id: 'unknown', name: 'Unknown Strategy', decimals: 9 }
                }

                for (const result of results) {
                    for (const obj of result.objects) {
                        if (obj.data?.content?.dataType === 'moveObject') {
                            const fields = obj.data.content.fields as any
                            const vaultId = fields.vault_id || ''
                            const shares = BigInt(fields.shares || 0)
                            const objectId = obj.data?.objectId || ''

                            console.log('Parsing position:', { vaultId, shares: shares.toString(), packageId: result.packageId, objectId })

                            const strategyInfo = getStrategyInfo(vaultId)

                            // Calculate actual position value from shares and vault share price
                            let amount = 0
                            try {
                                // Query vault to get total_assets and total_shares
                                const vaultObject = await client.getObject({
                                    id: vaultId,
                                    options: {
                                        showContent: true,
                                    },
                                })

                                if (vaultObject.data?.content && 'fields' in vaultObject.data.content) {
                                    const vaultFields = vaultObject.data.content.fields as any
                                    const totalAssets = BigInt(vaultFields?.total_assets || 0)
                                    const totalShares = BigInt(vaultFields?.total_shares || 1)

                                    if (totalShares > 0) {
                                        // Calculate actual value: (shares * total_assets) / total_shares
                                        const actualValue = (shares * totalAssets) / totalShares
                                        amount = Number(actualValue) / Math.pow(10, strategyInfo.decimals)
                                    } else {
                                        amount = Number(shares) / Math.pow(10, strategyInfo.decimals)
                                    }
                                } else {
                                    amount = Number(shares) / Math.pow(10, strategyInfo.decimals)
                                }
                            } catch (error) {
                                console.warn(`Could not query vault ${vaultId}, using shares as fallback`, error)
                                amount = Number(shares) / Math.pow(10, strategyInfo.decimals)
                            }

                            positions.push({
                                strategyId: strategyInfo.id,
                                strategyName: strategyInfo.name,
                                amount,
                                apy: 12.5, // Mock APY
                                receiptTokenBalance: Number(shares),
                                packageId: result.packageId,
                                vaultId,
                                objectId
                            })
                        }
                    }
                }

                return positions
            } catch (error) {
                console.error('Failed to fetch user positions:', error)
                return []
            }
        },
        enabled: !!account?.address,
        refetchInterval: 30000, // Poll every 30 seconds
    })
}

