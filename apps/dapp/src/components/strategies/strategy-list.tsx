'use client'

import { useState } from 'react'
import { LayoutGrid, Table2, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TabbedContainer } from '@/components/ui/tabbed-container'
import { useAppStore } from '@/store/use-app-store'
import { StrategyTable } from './strategy-table'
import { StrategyGrid } from './strategy-grid'
import { DepositModal } from '../modals/deposit-modal'

// Mock data - will be replaced with real data hooks
const mockStrategies = [
    {
        id: '1',
        name: 'USDC Liquidity Pool',
        asset: 'USDC',
        apy: 12.5,
        apr: 11.8,
        apyChange: 0.5,
        tvl: 2500000,
        capacity: 5000000,
        remaining: 2500000,
        userAllocation: 0,
        risk: 'low',
        withdrawalLatency: '24h',
        platformFee: 0.1,
    },
    {
        id: '2',
        name: 'SUI Staking',
        asset: 'SUI',
        apy: 8.2,
        apr: 7.9,
        apyChange: -0.2,
        tvl: 5000000,
        capacity: 10000000,
        remaining: 5000000,
        userAllocation: 0,
        risk: 'low',
        withdrawalLatency: '7d',
        platformFee: 0.15,
    },
    {
        id: '3',
        name: 'Leveraged Yield Farming',
        asset: 'USDT',
        apy: 18.5,
        apr: 16.2,
        apyChange: 1.2,
        tvl: 1200000,
        capacity: 3000000,
        remaining: 1800000,
        userAllocation: 0,
        risk: 'high',
        withdrawalLatency: '48h',
        platformFee: 0.2,
    },
]

export function StrategyList() {
    const { viewMode, setViewMode } = useAppStore()

    return (
        <div className="space-y-6">
            <TabbedContainer
                label="Strategies"
                className="w-full"
                tabClassName="bg-white"
                contentClassName="bg-white"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 font-heading">Yield Strategies</h2>
                        <p className="text-lg text-muted-foreground">
                            Browse and allocate to yield-generating strategies
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={viewMode === 'table' ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => setViewMode('table')}
                                    >
                                        <Table2 className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Table View</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Grid View</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/* APY vs APR Info */}
                <Card className="mb-6 border-black/10">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Info className="w-4 h-4 text-transparent bg-clip-text bg-brand-gradient" />
                            Understanding APY vs APR
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="font-semibold text-transparent bg-clip-text bg-brand-gradient mb-1">APY (Annual Percentage Yield)</div>
                                <p className="text-muted-foreground">
                                    Includes compound interest. Shows the total return you'll earn if you reinvest your earnings.
                                </p>
                            </div>
                            <div>
                                <div className="font-semibold text-black mb-1">APR (Annual Percentage Rate)</div>
                                <p className="text-muted-foreground">
                                    Simple interest rate without compounding. The base rate before reinvestment effects.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Strategy Display */}
                {viewMode === 'table' ? (
                    <StrategyTable strategies={mockStrategies} />
                ) : (
                    <StrategyGrid strategies={mockStrategies} />
                )}
            </TabbedContainer>
            <DepositModal />
        </div>
    )
}

