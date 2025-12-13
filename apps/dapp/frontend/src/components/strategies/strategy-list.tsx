'use client'

import { useState, useEffect } from 'react'
import { LayoutGrid, Table2, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TabbedContainer } from '@/components/ui/tabbed-container'
import { useAppStore } from '@/store/use-app-store'
import { StrategyTable } from './strategy-table'
import { StrategyGrid } from './strategy-grid'

// Strategies are now passed via props
import { Strategy } from '@/config/chains'

interface StrategyListProps {
    strategies: Strategy[]
    chainName?: string
}

export function StrategyList({ strategies, chainName }: StrategyListProps) {
    const { viewMode, setViewMode } = useAppStore()
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Force grid view on mobile
    const effectiveViewMode = isMobile ? 'grid' : viewMode

    return (
        <div className="space-y-6">
            <TabbedContainer
                label="Strategies"
                className="w-full"
                tabClassName="bg-white dark:bg-gradient-to-r dark:from-[#1a1a1a] dark:to-[#121212]"
                contentClassName="bg-white dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#121212]"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2 font-heading">
                            {chainName ? `${chainName} Strategies` : 'Yield Strategies'}
                        </h2>
                        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                            Browse and allocate to yield-generating strategies
                        </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        {/* Table View - Hidden on Small Screens */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={viewMode === 'table' ? 'default' : 'outline'}
                                        size="icon"
                                        onClick={() => setViewMode('table')}
                                        className="hidden md:flex"
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
                                <div className="font-semibold text-black dark:text-white mb-1">APR (Annual Percentage Rate)</div>
                                <p className="text-muted-foreground">
                                    Simple interest rate without compounding. The base rate before reinvestment effects.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Strategy Display */}
                {/* Always show grid on mobile, respect viewMode on desktop */}
                {effectiveViewMode === 'table' ? (
                    <StrategyTable strategies={strategies} />
                ) : (
                    <StrategyGrid strategies={strategies} />
                )}
            </TabbedContainer>
        </div>
    )
}

