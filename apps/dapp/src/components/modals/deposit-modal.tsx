'use client'

import { useState, useEffect, useRef } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
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

type TokenType = 'SUI' | 'USDC' | 'USDT'

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

    const handleDeposit = () => {
        if (!account?.address || !amount || parseFloat(amount) <= 0) {
            return
        }

        setIsDepositing(true)

        const packageId = process.env.NEXT_PUBLIC_SUINERGY_PACKAGE_ID || '0x0'
        const vaultId = process.env.NEXT_PUBLIC_VAULT_ID || '0x0'
        const configId = process.env.NEXT_PUBLIC_PROTOCOL_CONFIG_ID || '0x0'

        // Convert amount to smallest unit (MIST for SUI, typically 6-9 decimals for stablecoins)
        const decimals = tokenType === 'SUI' ? 9 : 6
        const amountInSmallestUnit = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)))

        const tx = new Transaction()

        // Get coin type for querying user's coins
        const coinType = 
            tokenType === 'SUI' 
                ? '0x2::sui::SUI'
                : tokenType === 'USDC'
                ? process.env.NEXT_PUBLIC_USDC_COIN_TYPE || '0x2::coin::Coin<0x0::usdc::USDC>'
                : process.env.NEXT_PUBLIC_USDT_COIN_TYPE || '0x2::coin::Coin<0x0::usdt::USDT>'

        // For SUI, we can split from gas. For other tokens, we need to use the user's coin objects
        // In a production implementation, you would fetch the user's coin objects and use them
        // For now, we'll use gas for SUI and assume coin objects are available for others
        let coin
        if (tokenType === 'SUI') {
            const [splitCoin] = tx.splitCoins(tx.gas, [amountInSmallestUnit])
            coin = splitCoin
        } else {
            // For USDC/USDT, we need to use coin objects from the user's wallet
            // This is a simplified version - in production, fetch coin objects first
            const primaryCoin = tx.object('0x0') // Placeholder - should be fetched from user's coins
            const [splitCoin] = tx.splitCoins(primaryCoin, [amountInSmallestUnit])
            coin = splitCoin
        }

        // Call the appropriate deposit function
        const functionName = 
            tokenType === 'SUI' 
                ? 'deposit_sui'
                : tokenType === 'USDC'
                ? 'deposit_usdc'
                : 'deposit_usdt'

        tx.moveCall({
            target: `${packageId}::vault_entry::${functionName}`,
            arguments: [
                tx.object(vaultId),
                tx.object(configId),
                coin,
            ],
        })

        signAndExecute(
            {
                transaction: tx,
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
                },
            }
        )
    }

    const selectedBalance = 
        tokenType === 'SUI' 
            ? balances?.sui 
            : tokenType === 'USDC'
            ? balances?.usdc
            : balances?.usdt

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
                                    <SelectItem value="USDT">USDT</SelectItem>
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

