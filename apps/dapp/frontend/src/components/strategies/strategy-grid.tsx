'use client'

import { ArrowUpRight, ArrowDownRight, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

interface Platform {
    id: string
    name: string
    logo?: string
    allocation: number
    apy: number
    apyContribution: number
    yieldType: 'lending' | 'lp' | 'staking' | 'emissions' | 'structured'
    risk: 'low' | 'medium' | 'high'
    health: 'excellent' | 'good' | 'fair'
    color: string
}

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
    platforms?: Platform[]
}

interface StrategyGridProps {
    strategies: Strategy[]
}

export function StrategyGrid({ strategies }: StrategyGridProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    const getCapacityPercentage = (tvl: number, capacity: number) => {
        return (tvl / capacity) * 100
    }

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.map((strategy) => (
                <Card
                    key={strategy.id}
                    className="hover:shadow-suinergy-medium transition-all duration-200 border-black/10"
                >
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-lg text-black dark:text-white">{strategy.name}</CardTitle>
                                <Badge variant="secondary" className="mt-2">
                                    {strategy.asset}
                                </Badge>
                            </div>
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
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* APY Display */}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-3xl font-bold text-transparent bg-clip-text bg-brand-gradient">{strategy.apy}%</span>
                                <span className="text-sm text-muted-foreground">APY</span>
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
                            <div className="text-sm text-muted-foreground">
                                APR: <span className="text-black dark:text-white">{strategy.apr}%</span>
                            </div>
                        </div>

                        {/* Capacity */}
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Capacity</span>
                                <span className="text-black dark:text-white font-medium">
                                    {formatCurrency(strategy.tvl)} / {formatCurrency(strategy.capacity)}
                                </span>
                            </div>
                            <Progress
                                value={getCapacityPercentage(strategy.tvl, strategy.capacity)}
                                className="h-2"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                                {formatCurrency(strategy.remaining)} remaining
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-black/10">
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{strategy.withdrawalLatency}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <AlertCircle className="w-3 h-3" />
                                <span>{strategy.platformFee}% fee</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <Button
                            variant="outline"
                            className="w-full"
                            asChild
                        >
                            <Link href={`/strategies/${strategy.id}`}>
                                View Details
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

