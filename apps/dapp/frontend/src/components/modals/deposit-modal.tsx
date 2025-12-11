'use client'

import { useState, useEffect, useRef } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { gsap } from 'gsap'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SuccessModal } from './success-modal'
import { useAppStore } from '@/store/use-app-store'
import { SimulationModal } from './simulation-modal'
import { useTokenBalances } from '@/hooks/use-token-balances'
import { Transaction } from '@mysten/sui/transactions'
import { TOKENS } from '@/lib/oracle/constants'

type TokenType = 'SUI' | 'USDC'

export function DepositModal() {
    const { depositModalOpen, setDepositModalOpen, selectedStrategy } = useAppStore()
    const [amount, setAmount] = useState('')
    const [tokenType, setTokenType] = useState<TokenType>('SUI')
    const [showSimulation, setShowSimulation] = useState(false)
    const [isDepositing, setIsDepositing] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const account = useCurrentAccount()
    const { mutate: signAndExecute } = useSignAndExecuteTransaction()
    const { data: balances } = useTokenBalances()
    const client = useSuiClient()
    const contentRef = useRef<HTMLDivElement>(null)

    // GSAP animation on modal open
    useEffect(() => {
        if (!depositModalOpen || !contentRef.current) return

        const ctx = gsap.context(() => {
            gsap.from(contentRef.current, {
                scale: 0.9,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.out',
            })
        }, contentRef)

        return () => ctx.revert()
    }, [depositModalOpen])

    const handleDeposit = async () => {
        if (!account?.address || !amount || parseFloat(amount) <= 0) {
            return
        }

        setIsDepositing(true)

        try {
            const packageId = process.env.NEXT_PUBLIC_SUINERGY_PACKAGE_ID || '0x0'
            // Use coin-specific vault ID if available, otherwise fall back to general vault ID
            const vaultId = tokenType === 'USDC'
                ? process.env.NEXT_PUBLIC_USDC_VAULT_ID || process.env.NEXT_PUBLIC_VAULT_ID || '0x0'
                : process.env.NEXT_PUBLIC_SUI_VAULT_ID || process.env.NEXT_PUBLIC_VAULT_ID || '0x0'
            const configId = process.env.NEXT_PUBLIC_PROTOCOL_CONFIG_ID || '0x0'

            console.log('DEBUG: Deposit Transaction Params', {
                tokenType,
                packageId,
                vaultId,
                configId,
                envSuiVault: process.env.NEXT_PUBLIC_SUI_VAULT_ID,
                envUsdcVault: process.env.NEXT_PUBLIC_USDC_VAULT_ID,
                envPackage: process.env.NEXT_PUBLIC_SUINERGY_PACKAGE_ID
            })

            // Convert amount to smallest unit (MIST for SUI, typically 6-9 decimals for stablecoins)
            const decimals = tokenType === 'SUI' ? 9 : 6
            const amountInSmallestUnit = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)))

            // Get coin type - use constants if available, otherwise fall back to env vars
            const coinType =
                tokenType === 'SUI'
                    ? '0x2::sui::SUI'
                    : TOKENS.USDC.coinType || process.env.NEXT_PUBLIC_USDC_COIN_TYPE || ''

            if (!coinType && tokenType !== 'SUI') {
                throw new Error(`Coin type not configured for ${tokenType}`)
            }

            const tx = new Transaction()

            // Track the actual coin type we'll use (may be auto-detected)
            let actualCoinType = coinType

            // For SUI, we can split from gas. For other tokens, fetch and use coin objects
            let coin
            if (tokenType === 'SUI') {
                const [splitCoin] = tx.splitCoins(tx.gas, [amountInSmallestUnit])
                coin = splitCoin
            } else {
                // Check if user actually has balance first (from the hook data)
                const userBalance = tokenType === 'USDC' ? balances?.usdc : BigInt(0)

                // Build list of coin types to try - start with configured, then try common ones
                const coinTypesToTry: string[] = [coinType]

                if (tokenType === 'USDC') {
                    // Add common USDC coin type variations
                    coinTypesToTry.push(
                        TOKENS.USDC.coinType, // From constants (Wormhole USDC)
                        '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN', // Wormhole USDC
                        '0x2::coin::Coin<0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN>', // Wrapped format
                        // Circle native USDC on Sui
                        '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC', // Circle native USDC (Testnet)
                        '0x2::coin::Coin<0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC>', // Circle wrapped format
                        process.env.NEXT_PUBLIC_USDC_COIN_TYPE || '' // From env
                    )
                }

                // Remove duplicates and empty strings
                const uniqueCoinTypes = [...new Set(coinTypesToTry.filter(t => t && t.length > 0))]

                // Try each coin type
                let coins = null as Awaited<ReturnType<typeof client.getCoins>> | null
                for (const testCoinType of uniqueCoinTypes) {
                    try {
                        // First check balance
                        const balance = await client.getBalance({
                            owner: account.address,
                            coinType: testCoinType,
                        }).catch(() => null)

                        if (balance && BigInt(balance.totalBalance) > 0) {
                            // Balance exists, now try to get coins
                            const testCoins = await client.getCoins({
                                owner: account.address,
                                coinType: testCoinType,
                            })

                            if (testCoins.data && testCoins.data.length > 0) {
                                coins = testCoins
                                actualCoinType = testCoinType
                                console.log(`Found ${tokenType} coins with type: ${testCoinType}, balance: ${balance.totalBalance}`)
                                break
                            }
                        }
                    } catch (err) {
                        // Continue to next coin type
                        continue
                    }
                }

                // If still no coins, try querying all balances to find the coin type
                if (!coins || !coins.data || coins.data.length === 0) {
                    // Query all coin types by checking balances
                    const allCoins = await client.getAllCoins({
                        owner: account.address,
                        limit: 100, // Increase limit
                    })

                    // Handle pagination if needed
                    let allCoinData = [...allCoins.data]
                    let nextCursor = allCoins.nextCursor
                    while (nextCursor && allCoinData.length < 500) {
                        const moreCoins = await client.getAllCoins({
                            owner: account.address,
                            cursor: nextCursor,
                            limit: 100,
                        })
                        allCoinData = [...allCoinData, ...moreCoins.data]
                        nextCursor = moreCoins.nextCursor
                        if (!nextCursor) break
                    }

                    // Filter for coins that match the token type
                    const matchingCoins = allCoinData.filter((coin) => {
                        const coinTypeLower = coin.coinType.toLowerCase()
                        const tokenTypeLower = tokenType.toLowerCase()
                        return coinTypeLower.includes(tokenTypeLower)
                    })

                    if (matchingCoins.length > 0) {
                        // Group by coin type and find the one with the highest balance
                        const coinTypeMap = new Map<string, bigint>()
                        matchingCoins.forEach((coin) => {
                            const current = coinTypeMap.get(coin.coinType) || BigInt(0)
                            coinTypeMap.set(coin.coinType, current + BigInt(coin.balance))
                        })

                        // Get the coin type with the highest balance
                        let maxBalance = BigInt(0)
                        let bestCoinType = ''
                        coinTypeMap.forEach((balance, type) => {
                            if (balance > maxBalance) {
                                maxBalance = balance
                                bestCoinType = type
                            }
                        })

                        if (bestCoinType) {
                            actualCoinType = bestCoinType
                            coins = await client.getCoins({
                                owner: account.address,
                                coinType: bestCoinType,
                            })
                        }
                    }
                }

                // If still no coins found, provide helpful error with all discovered coin types
                if (!coins || !coins.data || coins.data.length === 0) {
                    const errorDetails = [
                        `No ${tokenType} coin objects found in wallet.`,
                        `\nConfigured coin type: ${coinType}`,
                    ]

                    // Discover all coin types in wallet
                    try {
                        const allCoins = await client.getAllCoins({
                            owner: account.address,
                            limit: 200,
                        })

                        // Get unique coin types
                        const uniqueCoinTypes = new Set(allCoins.data.map(c => c.coinType))

                        // Find USDC-like coin types
                        const usdcLikeTypes = Array.from(uniqueCoinTypes).filter(type => {
                            const lower = type.toLowerCase()
                            return lower.includes('usdc') || lower.includes('circle') || lower.includes('coin')
                        })

                        if (usdcLikeTypes.length > 0) {
                            errorDetails.push(
                                `\n\n📋 Found ${tokenType}-like coin types in your wallet:`
                            )

                            // Check balance for each type
                            for (const testType of usdcLikeTypes.slice(0, 10)) {
                                try {
                                    const testBalance = await client.getBalance({
                                        owner: account.address,
                                        coinType: testType,
                                    })

                                    if (BigInt(testBalance.totalBalance) > 0) {
                                        const humanBalance = Number(testBalance.totalBalance) / Math.pow(10, decimals)
                                        errorDetails.push(
                                            `\n  ✓ ${testType}`,
                                            `\n    Balance: ${humanBalance} ${tokenType}`
                                        )
                                    }
                                } catch (e) {
                                    // Skip if can't check balance
                                }
                            }
                        }

                        errorDetails.push(
                            `\n\n💡 To fix this:`,
                            `\n1. Copy one of the coin types above that has a balance`,
                            `\n2. Update your .env.local file:`,
                            `\n   NEXT_PUBLIC_${tokenType}_COIN_TYPE=<paste-coin-type-here>`,
                            `\n3. Restart your dev server`
                        )
                    } catch (discoverError) {
                        // If discovery fails, show generic error
                        errorDetails.push(
                            `\n\nUnable to auto-detect coin types. Please check your wallet and update NEXT_PUBLIC_${tokenType}_COIN_TYPE manually.`
                        )
                    }

                    if (userBalance && userBalance > 0) {
                        errorDetails.push(
                            `\n\nℹ️  Note: Your wallet shows a balance of ${Number(userBalance) / Math.pow(10, decimals)} ${tokenType}, but the coin type differs from the configured type.`
                        )
                    }

                    throw new Error(errorDetails.join(''))
                }

                // Merge all coins and split the required amount
                const primaryCoin = tx.object(coins.data[0].coinObjectId)

                // If we have multiple coins, merge them first
                if (coins.data.length > 1) {
                    const mergeCoins = coins.data.slice(1).map(c => tx.object(c.coinObjectId))
                    tx.mergeCoins(primaryCoin, mergeCoins)
                }

                // Split the required amount
                const [splitCoin] = tx.splitCoins(primaryCoin, [amountInSmallestUnit])
                coin = splitCoin
            }

            // Use the generic deposit function for all coin types
            // For SUI, we can use deposit_sui (no type args) or deposit with type args
            // For other coins, use deposit with type arguments
            // Use actualCoinType if it was auto-detected, otherwise use the configured coinType
            const functionName = tokenType === 'SUI' ? 'deposit_sui' : 'deposit'
            const finalCoinType = tokenType === 'SUI' ? '0x2::sui::SUI' : (actualCoinType || coinType)

            // Fetch vault object to get initial shared version
            // This ensures we correctly treat it as a mutable shared object
            const vaultObj = await client.getObject({
                id: vaultId,
                options: { showOwner: true }
            })

            const initialSharedVersion = vaultObj.data?.owner && typeof vaultObj.data.owner === 'object' && 'Shared' in vaultObj.data.owner
                ? vaultObj.data.owner.Shared.initial_shared_version
                : undefined

            if (!initialSharedVersion) {
                throw new Error(`Vault ${vaultId} is not a shared object or version not found`)
            }

            console.log('DEBUG: Resolved Vault Object', {
                vaultId,
                initialSharedVersion,
                owner: vaultObj.data?.owner
            })

            tx.moveCall({
                target: `${packageId}::vault_entry::${functionName}`,
                typeArguments: tokenType === 'SUI' ? [] : [finalCoinType],
                arguments: [
                    tx.sharedObjectRef({
                        objectId: vaultId,
                        initialSharedVersion: initialSharedVersion,
                        mutable: true,
                    }),
                    tx.object(configId),
                    coin,
                ],
            })

            // Note: Type assertion needed due to version mismatch between @mysten/sui packages
            signAndExecute(
                {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    transaction: tx as any,
                    chain: 'sui:testnet',
                },
                {
                    onSuccess: () => {
                        setIsDepositing(false)
                        setDepositModalOpen(false)
                        setShowSuccess(true)
                        setAmount('')
                    },
                    onError: (error) => {
                        console.error('Deposit failed', error)
                        setIsDepositing(false)
                        // Optionally show error to user
                    },
                }
            )
        } catch (error) {
            console.error('Error preparing deposit:', error)
            setIsDepositing(false)
            // Optionally show error to user
        }
    }

    const selectedBalance =
        tokenType === 'SUI'
            ? balances?.sui
            : balances?.usdc

    const hasInsufficientBalance =
        selectedBalance !== undefined &&
        amount &&
        BigInt(Math.floor(parseFloat(amount) * Math.pow(10, tokenType === 'SUI' ? 9 : 6))) > selectedBalance

    return (
        <>
            <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
                <DialogContent ref={contentRef}>
                    <DialogHeader>
                        <DialogTitle>Deposit to Strategy</DialogTitle>
                        <DialogDescription>
                            Enter the amount you want to deposit to this strategy.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="token" className="text-sm sm:text-base">Token</Label>
                            <Select value={tokenType} onValueChange={(value) => setTokenType(value as TokenType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SUI">SUI</SelectItem>
                                    <SelectItem value="USDC">USDC</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="amount" className="text-sm sm:text-base">Amount</Label>
                                {selectedBalance !== undefined && (
                                    <span className="text-xs text-muted-foreground">
                                        Balance: {(
                                            Number(selectedBalance) / Math.pow(10, tokenType === 'SUI' ? 9 : 6)
                                        ).toLocaleString()} {tokenType}
                                    </span>
                                )}
                            </div>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-sm sm:text-base"
                            />
                            {hasInsufficientBalance && (
                                <p className="text-xs text-red-500">Insufficient balance</p>
                            )}
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-muted-foreground">Estimated APY</span>
                            <span className="font-semibold text-transparent bg-clip-text bg-brand-gradient">12.5%</span>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowSimulation(true)
                            }}
                            className="w-full sm:w-auto order-2 sm:order-1"
                        >
                            Simulate
                        </Button>
                        <Button
                            onClick={handleDeposit}
                            disabled={!amount || parseFloat(amount) <= 0 || hasInsufficientBalance || isDepositing}
                            className="w-full sm:w-auto order-1 sm:order-2 bg-brand-gradient flex items-center gap-2"
                        >
                            {isDepositing && <LoadingSpinner size="sm" />}
                            {isDepositing ? 'Processing...' : 'Deposit'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {showSimulation && (
                <SimulationModal
                    open={showSimulation}
                    onOpenChange={setShowSimulation}
                    amount={amount}
                    strategyId={selectedStrategy}
                />
            )}
            <SuccessModal
                open={showSuccess}
                onOpenChange={setShowSuccess}
                title="Deposit Successful!"
                message={`Your ${amount} ${tokenType} deposit has been processed successfully.`}
                onClose={() => {
                    setShowSuccess(false)
                    setAmount('')
                }}
            />
        </>
    )
}

