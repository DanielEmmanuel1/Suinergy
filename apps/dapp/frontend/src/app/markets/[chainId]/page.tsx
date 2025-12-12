'use client'

import { useMemo } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { StrategyList } from '@/components/strategies/strategy-list'
import { getChainConfig } from '@/config/chains'
import { redirect, useParams } from 'next/navigation'
import { TabbedContainer } from '@/components/ui/tabbed-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Wallet, Coins, PieChart, Activity, BarChart3 } from 'lucide-react'
import Image from 'next/image'
import { PortfolioChart } from '@/components/charts/portfolio-chart'

// Mock TVL history data
const getMockTVLData = () => Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const baseValue = 5000000
    const growth = Math.random() * 500000 + 100000
    return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: baseValue + growth * (i + 1),
        earnings: growth * (i + 1),
    }
})

export default function ChainMarketPage() {
    const params = useParams()
    const chainId = params.chainId as string
    const config = getChainConfig(chainId)

    if (!config) {
        redirect('/markets')
    }

    // Calculate market stats
    const totalTVL = useMemo(() => {
        return config.strategies.reduce((sum, strategy) => sum + strategy.tvl, 0)
    }, [config.strategies])

    const averageAPY = useMemo(() => {
        if (config.strategies.length === 0) return 0
        const totalAPY = config.strategies.reduce((sum, strategy) => sum + strategy.apy, 0)
        return totalAPY / config.strategies.length
    }, [config.strategies])

    const highestAPY = useMemo(() => {
        if (config.strategies.length === 0) return 0
        return Math.max(...config.strategies.map(s => s.apy))
    }, [config.strategies])

    const lowestAPY = useMemo(() => {
        if (config.strategies.length === 0) return 0
        return Math.min(...config.strategies.map(s => s.apy))
    }, [config.strategies])

    // Mock earned yields (in reality this would come from user data)
    const totalEarnedYields = totalTVL * 0.05 // 5% of TVL as example

    const tvlData = useMemo(() => getMockTVLData(), [])

    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(2)}M`
        }
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <TabbedContainer
                    label={`${config.name} Market`}
                    className="w-full"
                    tabClassName="bg-white dark:bg-gradient-to-r dark:from-[#1a1a1a] dark:to-[#121212]"
                    contentClassName="bg-white dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#121212]"
                >
                    {/* Market Header */}
                    <div className="relative mb-8 overflow-hidden rounded-2xl bg-brand-gradient p-8 text-white shadow-lg">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-white shadow-lg">
                                    <Image
                                        src={`/chains/${config.id}.png`}
                                        alt={`${config.name} logo`}
                                        width={48}
                                        height={48}
                                        className="object-contain"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-heading">
                                        {config.name} Market
                                    </h1>
                                    <p className="text-white/90 text-sm sm:text-base mt-1">
                                        {config.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Market Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Total TVL */}
                        <Card className="relative overflow-hidden bg-brand-gradient border-transparent group hover:scale-105 transition-transform duration-300 shadow-lg">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                            <CardHeader className="pb-2 relative z-10">
                                <CardTitle className="text-sm text-white/90 flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    Total TVL
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-3xl font-bold text-white mb-1">
                                    {formatCurrency(totalTVL)}
                                </div>
                                <div className="text-xs text-white/80">
                                    Across {config.strategies.length} strategies
                                </div>
                            </CardContent>
                        </Card>

                        {/* Average APY */}
                        <Card className="border-black/10 hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Average APY
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-transparent bg-clip-text bg-brand-gradient">
                                    {averageAPY.toFixed(2)}%
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Range: {lowestAPY.toFixed(1)}% - {highestAPY.toFixed(1)}%
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Earned */}
                        <Card className="border-black/10 hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Coins className="w-4 h-4" />
                                    Total Earned
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-black">
                                    {formatCurrency(totalEarnedYields)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    All-time yields
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Strategies */}
                        <Card className="border-black/10 hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                    <PieChart className="w-4 h-4" />
                                    Active Strategies
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-black">
                                    {config.strategies.length}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Available vaults
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* TVL Chart */}
                    <Card className="mb-6 border-black/10 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#1055C9]/5 to-transparent p-6 border-b border-black/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-brand-gradient">
                                    <Activity className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Total Value Locked (TVL)</CardTitle>
                                    <p className="text-sm text-muted-foreground">30-day TVL growth on {config.name}</p>
                                </div>
                            </div>
                        </div>
                        <CardContent className="pt-6">
                            <div className="w-full h-[250px] md:h-[300px]">
                                <PortfolioChart data={tvlData} height={300} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Market Insights */}
                    <Card className="mb-6 border-black/10">
                        <div className="bg-gradient-to-r from-[#1055C9]/5 to-transparent p-6 border-b border-black/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-brand-gradient">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Market Insights</CardTitle>
                                    <p className="text-sm text-muted-foreground">Key metrics and performance indicators</p>
                                </div>
                            </div>
                        </div>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Highest Yielding Strategy */}
                                <div className="p-4 rounded-xl bg-[#f4f3f0] border border-black/5">
                                    <div className="text-sm text-muted-foreground mb-2">Highest Yielding Strategy</div>
                                    <div className="text-xl font-bold text-transparent bg-clip-text bg-brand-gradient mb-1">
                                        {highestAPY.toFixed(2)}% APY
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {config.strategies.find(s => s.apy === highestAPY)?.name || 'N/A'}
                                    </div>
                                </div>

                                {/* Total Depositors */}
                                <div className="p-4 rounded-xl bg-[#f4f3f0] border border-black/5">
                                    <div className="text-sm text-muted-foreground mb-2">Total Depositors</div>
                                    <div className="text-xl font-bold text-black mb-1">
                                        {Math.floor(totalTVL / 50000).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Active participants
                                    </div>
                                </div>

                                {/* 24h Volume */}
                                <div className="p-4 rounded-xl bg-[#f4f3f0] border border-black/5">
                                    <div className="text-sm text-muted-foreground mb-2">24h Volume</div>
                                    <div className="text-xl font-bold text-black mb-1">
                                        {formatCurrency(totalTVL * 0.15)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Trading volume
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Strategies Section */}
                    <div className="pt-6 border-t border-black/5">
                        <StrategyList
                            strategies={config.strategies}
                            chainName={config.name}
                        />
                    </div>
                </TabbedContainer>
            </div>
        </MainLayout>
    )
}
