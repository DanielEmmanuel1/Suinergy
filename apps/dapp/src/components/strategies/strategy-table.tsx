'use client'

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/use-app-store'
import { DepositModal } from '../modals/deposit-modal'

interface Strategy {
    id: string
    name: string
    asset: string
    apy: number
    apr: number
    apyChange: number
    tvl: number
    capacity: number
    remaining: number
    userAllocation: number
    risk: 'low' | 'medium' | 'high'
    withdrawalLatency: string
    platformFee: number
}

interface StrategyTableProps {
    strategies: Strategy[]
}

export function StrategyTable({ strategies }: StrategyTableProps) {
    const { setDepositModalOpen, setSelectedStrategy } = useAppStore()

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    const handleDeposit = (strategyId: string) => {
        setSelectedStrategy(strategyId)
        setDepositModalOpen(true)
    }

    return (
        <Card className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-[#f4f3f0] border-b border-[#000000]/10">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-[#000000]">Strategy</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-[#000000]">Asset</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-[#000000]">APY</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-[#000000]">APR</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-[#000000]">TVL</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-[#000000]">Remaining</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-[#000000]">Risk</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-[#000000]">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#000000]/10">
                        {strategies.map((strategy) => (
                            <tr key={strategy.id} className="hover:bg-[#f4f3f0]/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-[#000000]">{strategy.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="secondary">{strategy.asset}</Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-transparent bg-clip-text bg-brand-gradient">{strategy.apy}%</span>
                                        {strategy.apyChange > 0 ? (
                                            <span className="text-green-600 flex items-center gap-0.5 text-xs">
                                                <ArrowUpRight className="w-3 h-3" />
                                                {strategy.apyChange}%
                                            </span>
                                        ) : (
                                            <span className="text-red-600 flex items-center gap-0.5 text-xs">
                                                <ArrowDownRight className="w-3 h-3" />
                                                {Math.abs(strategy.apyChange)}%
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[#000000]">{strategy.apr}%</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[#000000]">{formatCurrency(strategy.tvl)}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[#000000]">{formatCurrency(strategy.remaining)}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge
                                        variant={
                                            strategy.risk === 'low'
                                                ? 'default'
                                                : strategy.risk === 'medium'
                                                    ? 'secondary'
                                                    : 'destructive'
                                        }
                                    >
                                        {strategy.risk}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button
                                        size="sm"
                                        onClick={() => handleDeposit(strategy.id)}
                                    >
                                        Deposit
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <DepositModal />
        </Card>
    )
}

