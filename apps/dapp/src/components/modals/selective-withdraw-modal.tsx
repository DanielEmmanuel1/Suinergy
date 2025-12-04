'use client'

import { useState, useEffect, useMemo } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
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
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useTokenPrice } from '@/hooks/oracle/use-token-price'
import { TOKENS } from '@/lib/oracle/constants'

export interface ProtocolPosition {
    adapterId: string
    protocolName: string
    allocationPercent: number
    currentValue: bigint
    userShare: bigint
    apy: number
    logo?: string
    positionId: string
}

interface SelectiveWithdrawModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    vaultId: string
    configId: string
    registryId: string
    userPosition: {
        shares: bigint
        vaultId: string
    }
    positions: ProtocolPosition[]
    tokenType: 'SUI' | 'USDC' | 'USDT'
    onSuccess?: () => void
    onWithdrawAll?: (amount: string) => Promise<void>
    totalPositionValue?: number
}

export function SelectiveWithdrawModal({
    open,
    onOpenChange,
    vaultId,
    configId,
    registryId,
    userPosition,
    positions,
    tokenType,
    onSuccess,
    onWithdrawAll,
    totalPositionValue = 0,
}: SelectiveWithdrawModalProps) {
    const account = useCurrentAccount()
    const { mutate: signAndExecute } = useSignAndExecuteTransaction()
    const client = useSuiClient()
    const { data: tokenPrice } = useTokenPrice(tokenType)

    const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set())
    const [isAllPositions, setIsAllPositions] = useState(false)
    const [positionAmounts, setPositionAmounts] = useState<Record<string, string>>({})
    const [allPositionsAmount, setAllPositionsAmount] = useState('')
    const [isWithdrawing, setIsWithdrawing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const decimals = tokenType === 'SUI' ? 9 : 6

    // Get max withdrawable for a position
    const getMaxWithdrawable = (position: ProtocolPosition): number => {
        const userShareNum = Number(position.userShare)
        return userShareNum / Math.pow(10, decimals)
    }

    // Calculate total USD value of all withdrawals
    const totalUsdValue = useMemo(() => {
        if (!tokenPrice?.priceUsd) return 0

        let total = 0
        if (isAllPositions && allPositionsAmount) {
            total += parseFloat(allPositionsAmount) * tokenPrice.priceUsd
        } else {
            Object.entries(positionAmounts).forEach(([adapterId, amount]) => {
                if (amount && parseFloat(amount) > 0) {
                    total += parseFloat(amount) * tokenPrice.priceUsd
                }
            })
        }
        return total
    }, [positionAmounts, allPositionsAmount, isAllPositions, tokenPrice])

    // Toggle position selection
    const togglePosition = (adapterId: string) => {
        if (isAllPositions) return

        setSelectedPositions(prev => {
            const newSet = new Set(prev)
            if (newSet.has(adapterId)) {
                newSet.delete(adapterId)
                setPositionAmounts(prevAmts => {
                    const newAmts = { ...prevAmts }
                    delete newAmts[adapterId]
                    return newAmts
                })
            } else {
                newSet.add(adapterId)
            }
            return newSet
        })
        setError(null)
    }

    // Toggle "All Positions"
    const toggleAllPositions = () => {
        setIsAllPositions(prev => {
            const newValue = !prev
            if (newValue) {
                setSelectedPositions(new Set())
                setPositionAmounts({})
            }
            return newValue
        })
        setAllPositionsAmount('')
        setError(null)
    }

    // Update amount for a specific position
    const updatePositionAmount = (adapterId: string, amount: string) => {
        if (!/^\d*\.?\d*$/.test(amount) && amount !== '') return
        setPositionAmounts(prev => ({ ...prev, [adapterId]: amount }))
        setError(null)
    }

    // Set max amount for a position
    const setMaxAmount = (adapterId: string) => {
        const position = positions.find(p => p.adapterId === adapterId)
        if (!position) return
        const max = getMaxWithdrawable(position)
        updatePositionAmount(adapterId, max.toFixed(6))
    }

    // Set half amount for a position
    const setHalfAmount = (adapterId: string) => {
        const position = positions.find(p => p.adapterId === adapterId)
        if (!position) return
        const max = getMaxWithdrawable(position)
        updatePositionAmount(adapterId, (max / 2).toFixed(6))
    }

    const handleWithdrawAll = async () => {
        if (!account?.address || !allPositionsAmount || parseFloat(allPositionsAmount) <= 0) {
            setError('Please enter an amount')
            return
        }

        if (onWithdrawAll) {
            setIsWithdrawing(true)
            setError(null)
            try {
                await onWithdrawAll(allPositionsAmount)
                setAllPositionsAmount('')
                setIsAllPositions(false)
                onSuccess?.()
                onOpenChange(false)
            } catch (error) {
                console.error('Withdraw all failed:', error)
                setError(error instanceof Error ? error.message : 'Withdrawal failed. Please try again.')
            } finally {
                setIsWithdrawing(false)
            }
        }
    }

    const handleWithdraw = async () => {
        if (!account?.address || selectedPositions.size === 0) {
            setError('Please select at least one position')
            return
        }

        // Validate all amounts
        const withdrawalEntries: Array<{ position: ProtocolPosition; amount: string }> = []

        for (const adapterId of selectedPositions) {
            const position = positions.find(p => p.adapterId === adapterId)
            if (!position) continue

            const amount = positionAmounts[adapterId] || ''
            if (!amount || parseFloat(amount) <= 0) continue

            const maxWithdraw = getMaxWithdrawable(position)
            if (parseFloat(amount) > maxWithdraw) {
                setError(`Amount for ${position.protocolName} exceeds available ${maxWithdraw.toFixed(6)} ${tokenType}`)
                return
            }

            withdrawalEntries.push({ position, amount })
        }

        if (withdrawalEntries.length === 0) {
            setError('Please enter amounts for at least one selected position')
            return
        }

        setIsWithdrawing(true)
        setError(null)

        try {
            const packageId = process.env.NEXT_PUBLIC_SUINERGY_PACKAGE_ID || '0x0'
            const coinType = tokenType === 'SUI'
                ? '0x2::sui::SUI'
                : tokenType === 'USDC'
                    ? TOKENS.USDC.coinType || process.env.NEXT_PUBLIC_USDC_COIN_TYPE || ''
                    : TOKENS.USDT.coinType || process.env.NEXT_PUBLIC_USDT_COIN_TYPE || ''

            if (!coinType && tokenType !== 'SUI') {
                throw new Error(`Coin type not configured for ${tokenType}`)
            }

            const clockId = '0x6'
            const functionName = tokenType === 'SUI' ? 'withdraw_from_position_sui' : 'withdraw_from_position'

            // Get UserPosition
            const userPositionObjects = await client.getOwnedObjects({
                owner: account.address,
                filter: {
                    StructType: `${packageId}::position::UserPosition`,
                },
                options: {
                    showContent: true,
                },
            })

            const matchingUserPosition = userPositionObjects.data.find((obj: any) => {
                if (obj.data?.content?.dataType === 'moveObject') {
                    const fields = (obj.data.content as any).fields
                    return fields?.vault_id === vaultId
                }
                return false
            })

            if (!matchingUserPosition?.data?.objectId) {
                throw new Error('User position not found')
            }

            // Create transaction with multiple withdrawals
            const tx = new Transaction()

            // Execute withdrawals sequentially (Sui transactions can handle multiple calls)
            for (const { position, amount } of withdrawalEntries) {
                const amountInSmallestUnit = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)))
                // Convert adapter ID - if it's a hex string, parse it; otherwise use a placeholder
                // In production, adapterId should be a proper Sui object ID
                let adapterIdU128: bigint
                if (position.adapterId.startsWith('0x')) {
                    adapterIdU128 = BigInt(position.adapterId.replace('0x', ''), 16)
                } else {
                    // For mock/testnet: convert string to hash-like value
                    // In production, this should be a real object ID from the registry
                    const hash = Array.from(position.adapterId).reduce((acc, char) => acc + char.charCodeAt(0), 0)
                    adapterIdU128 = BigInt(hash)
                }

                tx.moveCall({
                    target: `${packageId}::vault_entry::${functionName}`,
                    typeArguments: tokenType === 'SUI' ? [] : [coinType],
                    arguments: [
                        tx.object(vaultId),
                        tx.object(registryId),
                        tx.object(configId),
                        tx.object(matchingUserPosition.data.objectId),
                        tx.object(position.positionId),
                        adapterIdU128,
                        amountInSmallestUnit,
                        tx.object(clockId),
                    ],
                })
            }

            signAndExecute(
                {
                    transaction: tx as any,
                    chain: 'sui:testnet',
                },
                {
                    onSuccess: () => {
                        setIsWithdrawing(false)
                        setPositionAmounts({})
                        setSelectedPositions(new Set())
                        onSuccess?.()
                        onOpenChange(false)
                    },
                    onError: (error) => {
                        console.error('Selective withdrawal failed:', error)
                        setIsWithdrawing(false)
                        setError(error instanceof Error ? error.message : 'Withdrawal failed. Please try again.')
                    },
                }
            )
        } catch (error) {
            console.error('Error preparing selective withdrawal:', error)
            setIsWithdrawing(false)
            setError(error instanceof Error ? error.message : 'Failed to prepare withdrawal')
        }
    }



    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setSelectedPositions(new Set())
            setIsAllPositions(false)
            setPositionAmounts({})
            setAllPositionsAmount('')
            setError(null)
        }
    }, [open])

    // Check if summary should be shown
    const showSummary = useMemo(() => {
        if (isAllPositions && allPositionsAmount && parseFloat(allPositionsAmount) > 0) {
            return true
        }
        if (selectedPositions.size > 0 && Object.values(positionAmounts).some(amt => amt && parseFloat(amt) > 0)) {
            return true
        }
        return false
    }, [isAllPositions, allPositionsAmount, selectedPositions.size, positionAmounts])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-2xl max-h-[90vh] !flex !flex-col"
                style={{ overflow: 'hidden' }}
            >
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Withdraw</DialogTitle>
                    <DialogDescription>
                        Select one or more protocol positions to withdraw from, or choose "All Positions" for proportional withdrawal.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4 min-h-0 flex-1 overflow-hidden flex flex-col">
                    {/* Position Selection */}
                    <div className="flex flex-col flex-1 min-h-0">
                        <Label className="mb-3 block flex-shrink-0">Select Position(s)</Label>
                        <div className="space-y-2 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain min-h-0 pr-2">
                            {/* All Positions Option */}
                            <button
                                onClick={toggleAllPositions}
                                disabled={isWithdrawing}
                                className={`
                                    w-full p-4 rounded-lg border-2 transition-all text-left relative
                                    ${isAllPositions
                                        ? 'border-transparent bg-gradient-to-r from-[#b92b27] to-[#1055C9] bg-clip-padding'
                                        : 'border-black/10 hover:border-black/20'}
                                    ${isWithdrawing ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                style={isAllPositions ? {
                                    background: 'linear-gradient(white, white) padding-box, linear-gradient(to right, #b92b27, #1055C9) border-box',
                                    border: '2px solid transparent',
                                } : {}}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1055C9] to-[#b92b27] flex items-center justify-center text-white font-bold">
                                            All
                                        </div>
                                        <div>
                                            <div className="font-semibold text-black">All Positions</div>
                                            <div className="text-sm text-muted-foreground">
                                                Proportional withdrawal across all protocols
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-black">
                                            {totalPositionValue.toFixed(4)} {tokenType}
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {/* Individual Positions */}
                            {positions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No specific positions available. Use "All Positions" for withdrawal.
                                </p>
                            ) : (
                                positions.map((position) => {
                                    const isSelected = selectedPositions.has(position.adapterId)
                                    const isDisabled = isAllPositions || isWithdrawing

                                    return (
                                        <div key={position.adapterId} className="space-y-2">
                                            <button
                                                onClick={() => togglePosition(position.adapterId)}
                                                disabled={isDisabled}
                                                className={`
                                                    w-full p-4 rounded-lg border-2 transition-all text-left
                                                    ${isSelected
                                                        ? 'border-transparent'
                                                        : 'border-black/10 hover:border-black/20'}
                                                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                                                `}
                                                style={isSelected ? {
                                                    background: 'linear-gradient(white, white) padding-box, linear-gradient(to right, #b92b27, #1055C9) border-box',
                                                    border: '2px solid transparent',
                                                } : {}}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {position.logo ? (
                                                            <img
                                                                src={position.logo}
                                                                alt={position.protocolName}
                                                                className="w-10 h-10 rounded-full"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1055C9] to-[#b92b27] flex items-center justify-center text-white font-bold">
                                                                {position.protocolName.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-semibold text-black">{position.protocolName}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {position.allocationPercent}% allocation • APY: {position.apy}%
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-black">
                                                            {(Number(position.userShare) / Math.pow(10, decimals)).toFixed(4)} {tokenType}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>

                                            {/* Amount Input for Selected Position */}
                                            {isSelected && !isAllPositions && (
                                                <div className="w-full px-4 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            step="any"
                                                            placeholder="0"
                                                            value={positionAmounts[position.adapterId] || ''}
                                                            onChange={(e) => updatePositionAmount(position.adapterId, e.target.value)}
                                                            className="flex-1"
                                                            disabled={isWithdrawing}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setHalfAmount(position.adapterId)}
                                                            disabled={isWithdrawing}
                                                        >
                                                            Half
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setMaxAmount(position.adapterId)}
                                                            disabled={isWithdrawing}
                                                        >
                                                            Max
                                                        </Button>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Max: {getMaxWithdrawable(position).toFixed(6)} {tokenType}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Amount Input for All Positions */}
                    {isAllPositions && (
                        <div className="flex-shrink-0">
                            <Label>Withdrawal Amount</Label>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder="0"
                                    value={allPositionsAmount}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                            setAllPositionsAmount(val)
                                            setError(null)
                                        }
                                    }}
                                    className="flex-1"
                                    disabled={isWithdrawing}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAllPositionsAmount((totalPositionValue / 2).toFixed(6))}
                                    disabled={isWithdrawing}
                                >
                                    Half
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAllPositionsAmount(totalPositionValue.toFixed(6))}
                                    disabled={isWithdrawing}
                                >
                                    Max
                                </Button>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Max: {totalPositionValue.toFixed(6)} {tokenType}
                            </div>
                        </div>
                    )}

                    {/* Summary */}
                    {showSummary && (
                        <div className="p-4 rounded-lg bg-[#f4f3f0] space-y-2 flex-shrink-0">
                            {isAllPositions ? (
                                <>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">You withdraw</span>
                                        <span className="font-semibold">{allPositionsAmount} {tokenType}</span>
                                    </div>
                                    {totalUsdValue > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">USD Value</span>
                                            <span className="font-semibold">${totalUsdValue.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">From</span>
                                        <Badge>All Positions</Badge>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-sm font-semibold mb-2">Withdrawal Summary</div>
                                    {Object.entries(positionAmounts)
                                        .filter(([_, amount]) => amount && parseFloat(amount) > 0)
                                        .map(([adapterId, amount]) => {
                                            const position = positions.find(p => p.adapterId === adapterId)
                                            if (!position) return null
                                            const usdVal = (parseFloat(amount) * (tokenPrice?.priceUsd || 0))
                                            return (
                                                <div key={adapterId} className="flex items-center justify-between text-sm pt-1 border-t border-black/10 first:border-0 first:pt-0">
                                                    <div>
                                                        <span className="text-muted-foreground">{position.protocolName}:</span>
                                                        <span className="font-semibold ml-2">{amount} {tokenType}</span>
                                                    </div>
                                                    {usdVal > 0 && (
                                                        <span className="text-muted-foreground">${usdVal.toFixed(2)}</span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    {totalUsdValue > 0 && (
                                        <div className="flex items-center justify-between text-sm font-semibold pt-2 border-t border-black/20">
                                            <span>Total USD Value</span>
                                            <span>${totalUsdValue.toFixed(2)}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex-shrink-0">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isWithdrawing} className="flex-1">
                        Cancel
                    </Button>
                    {isAllPositions ? (
                        <Button
                            onClick={handleWithdrawAll}
                            disabled={!allPositionsAmount || parseFloat(allPositionsAmount) <= 0 || isWithdrawing}
                            className="flex-1 bg-brand-gradient"
                        >
                            {isWithdrawing && <LoadingSpinner size="sm" className="mr-2" />}
                            {isWithdrawing ? 'Withdrawing...' : 'Withdraw All'}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleWithdraw}
                            disabled={selectedPositions.size === 0 || !Object.values(positionAmounts).some(amt => amt && parseFloat(amt) > 0) || isWithdrawing}
                            className="flex-1 bg-brand-gradient"
                        >
                            {isWithdrawing && <LoadingSpinner size="sm" className="mr-2" />}
                            {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
