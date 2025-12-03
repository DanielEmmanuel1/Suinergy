import { useQuery } from '@tanstack/react-query'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'

interface UserPosition {
    strategyId: string
    strategyName: string
    amount: number
    apy: number
    receiptTokenBalance: number
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
                const packageId = process.env.NEXT_PUBLIC_SUINERGY_PACKAGE_ID
                if (!packageId) {
                    console.warn('Package ID not configured')
                    return []
                }

                console.log('Querying positions with package ID:', packageId)
                console.log('Looking for type:', `${packageId}::position::UserPosition`)

                // Query all objects owned by the user with new package ID
                let objects = await client.getOwnedObjects({
                    owner: account.address,
                    filter: {
                        StructType: `${packageId}::position::UserPosition`,
                    },
                    options: {
                        showContent: true,
                        showType: true,
                    },
                })

                console.log('Fetched position objects (new package):', objects.data)
                console.log('Total objects found:', objects.data.length)

                // Also try old package ID in case positions were created before upgrade
                const oldPackageId = '0xb18e10c0d4cd763ae8f2d2972a6397d0d92f1638840a6f868f06d52683bf3d58'
                if (objects.data.length === 0 && packageId !== oldPackageId) {
                    console.log('Trying old package ID as fallback:', oldPackageId)
                    const oldObjects = await client.getOwnedObjects({
                        owner: account.address,
                        filter: {
                            StructType: `${oldPackageId}::position::UserPosition`,
                        },
                        options: {
                            showContent: true,
                            showType: true,
                        },
                    })
                    console.log('Fetched position objects (old package):', oldObjects.data)
                    if (oldObjects.data.length > 0) {
                        objects = oldObjects
                    }
                }

                // If no objects found, try querying all owned objects to see what we have
                if (objects.data.length === 0) {
                    console.log('No UserPosition objects found. Querying all owned objects to debug...')
                    const allObjects = await client.getOwnedObjects({
                        owner: account.address,
                        options: {
                            showType: true,
                            showContent: true,
                        },
                        limit: 50,
                    })
                    console.log('All owned objects (first 50):', allObjects.data.map(obj => ({
                        objectId: obj.data?.objectId,
                        type: obj.data?.type,
                        hasContent: !!obj.data?.content,
                    })))
                    
                    // Check if any objects match UserPosition pattern (even with different package ID)
                    const userPositionLike = allObjects.data.filter(obj => 
                        obj.data?.type?.includes('UserPosition') || 
                        obj.data?.type?.includes('position')
                    )
                    if (userPositionLike.length > 0) {
                        console.log('Found objects that might be UserPositions:', userPositionLike.map(obj => ({
                            objectId: obj.data?.objectId,
                            type: obj.data?.type,
                            content: obj.data?.content,
                        })))
                    }
                }

                // Parse the UserPosition objects
                const positions: UserPosition[] = []
                
                // Get vault IDs from environment to map to coin types
                const suiVaultId = process.env.NEXT_PUBLIC_VAULT_ID || ''
                const usdcVaultId = process.env.NEXT_PUBLIC_USDC_VAULT_ID || ''
                const usdtVaultId = process.env.NEXT_PUBLIC_USDT_VAULT_ID || ''
                
                for (const obj of objects.data) {
                    if (obj.data?.content?.dataType === 'moveObject') {
                        const fields = obj.data.content.fields as any
                        const vaultId = fields.vault_id || ''
                        const shares = BigInt(fields.shares || 0)

                        console.log('Parsing position:', { vaultId, shares: shares.toString() })

                        // Determine coin type and strategy from vault ID
                        let coinDecimals = 9 // Default to SUI
                        let strategyId = 'sui-staking'
                        let strategyName = 'Sovereign SUI Vault'

                        if (vaultId === usdcVaultId) {
                            coinDecimals = 6 // USDC has 6 decimals
                            strategyId = 'usdc-liquidity'
                            strategyName = 'Prime USDC Vault'
                        } else if (vaultId === usdtVaultId) {
                            coinDecimals = 6 // USDT has 6 decimals
                            strategyId = 'usdt-liquidity'
                            strategyName = 'Amplified USDT Vault'
                        } else if (vaultId === suiVaultId) {
                            coinDecimals = 9 // SUI has 9 decimals
                            strategyId = 'sui-staking'
                            strategyName = 'Sovereign SUI Vault'
                        }

                        // Calculate actual position value from shares and vault share price
                        // Formula: amount = (shares * vault.total_assets) / vault.total_shares
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
                                    amount = Number(actualValue) / Math.pow(10, coinDecimals)
                                } else {
                                    // Fallback: if no shares, use shares as value (1:1)
                                    amount = Number(shares) / Math.pow(10, coinDecimals)
                                }
                            } else {
                                // Fallback: use shares as value if we can't query vault
                                amount = Number(shares) / Math.pow(10, coinDecimals)
                            }
                        } catch (error) {
                            console.warn(`Could not query vault ${vaultId} for position value, using shares as fallback:`, error)
                            // Fallback: use shares as value if vault query fails
                            amount = Number(shares) / Math.pow(10, coinDecimals)
                        }

                        positions.push({
                            strategyId,
                            strategyName,
                            amount,
                            apy: 12.5, // Mock APY for now
                            receiptTokenBalance: Number(shares),
                        })
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

