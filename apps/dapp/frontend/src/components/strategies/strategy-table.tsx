'use client'

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    return (
        <Card className="overflow-hidden">
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full" style={{ minWidth: '500px' }}>
                    <thead className="bg-[#f4f3f0] border-b border-[#000000]/10">
                        <tr>
                            <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-[#000000]">Strategy</th>
                            <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-[#000000] hidden sm:table-cell">Asset</th>
                            <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-[#000000]">APY</th>
                            <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-[#000000] hidden md:table-cell">APR</th>
                            <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-[#000000] hidden lg:table-cell">TVL</th>
                            <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-[#000000] hidden lg:table-cell">Remaining</th>
                            <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-[#000000] hidden sm:table-cell">Risk</th>
                            <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-[#000000]">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#000000]/10">
                        {strategies.map((strategy) => (
                            <tr key={strategy.id} className="hover:bg-[#f4f3f0]/50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                    <div className="font-medium text-[#000000] text-xs sm:text-sm md:text-base dark:text-white">
                                        <div>{strategy.name}</div>
                                        <div className="sm:hidden mt-1">
                                            <Badge variant="secondary" className="text-xs">{strategy.asset}</Badge>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                    <Badge variant="secondary">{strategy.asset}</Badge>
                                </td>
                                <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                        <span className="font-semibold text-transparent bg-clip-text bg-brand-gradient text-xs sm:text-sm">{strategy.apy}%</span>
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
                                <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hidden md:table-cell">
                                    <span className="text-[#000000] text-xs sm:text-sm dark:text-white">{strategy.apr}%</span>
                                </td>
                                <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hidden lg:table-cell">
                                    <span className="text-[#000000] text-xs sm:text-sm dark:text-white">{formatCurrency(strategy.tvl)}</span>
                                </td>
                                <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hidden lg:table-cell">
                                    <span className="text-[#000000] text-xs sm:text-sm dark:text-white">{formatCurrency(strategy.remaining)}</span>
                                </td>
                                <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hidden sm:table-cell">
                                    <Badge
                                        variant={
                                            strategy.risk === 'low'
                                                ? 'default'
                                                : strategy.risk === 'medium'
                                                    ? 'secondary'
                                                    : 'destructive'
                                        }
                                        className="text-xs"
                                    >
                                        {strategy.risk}
                                    </Badge>
                                </td>
                                <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-right">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        asChild
                                        className="w-full sm:w-auto text-xs px-2 sm:px-3"
                                    >
                                        <Link href={`/strategies/${strategy.id}`}>
                                            View Details
                                        </Link>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    )
}

