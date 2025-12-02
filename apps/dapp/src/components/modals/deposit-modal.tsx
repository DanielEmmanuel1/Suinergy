'use client'

import { useState } from 'react'
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
import { useAppStore } from '@/store/use-app-store'
import { SimulationModal } from './simulation-modal'

export function DepositModal() {
    const { depositModalOpen, setDepositModalOpen, selectedStrategy } = useAppStore()
    const [amount, setAmount] = useState('')
    const [showSimulation, setShowSimulation] = useState(false)

    const handleDeposit = () => {
        // TODO: Implement deposit logic
        console.log('Depositing', amount, 'to strategy', selectedStrategy)
        setDepositModalOpen(false)
        setAmount('')
    }

    return (
        <>
            <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deposit to Strategy</DialogTitle>
                        <DialogDescription>
                            Enter the amount you want to deposit to this strategy.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-sm sm:text-base">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-sm sm:text-base"
                            />
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
                            disabled={!amount || parseFloat(amount) <= 0}
                            className="w-full sm:w-auto order-1 sm:order-2 bg-brand-gradient"
                        >
                            Deposit
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
        </>
    )
}

