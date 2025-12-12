'use client'

import { useState, useMemo } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { User, TrendingUp, Wallet, Coins, Activity, PieChart, Award, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { TabbedContainer } from '@/components/ui/tabbed-container'
import { PortfolioChart } from '@/components/charts/portfolio-chart'
import { TransactionHistory } from '@/components/transactions/transaction-history'
import { useUserPositions } from '@/hooks/use-user-positions'
import { useRewards } from '@/hooks/use-rewards'
import { useTokenPrice } from '@/hooks/oracle/use-token-price'
import { useTransactions } from '@/hooks/use-transactions'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type TimePeriod = '7D' | '30D' | '90D'

// Chain configuration for multichain display
const SUPPORTED_CHAINS = [
    { id: 'sui', name: 'Sui', icon: '◆' },
    { id: 'base', name: 'Base', icon: '▲' },
    { id: 'avalanche', name: 'Avalanche', icon: '▼' },
    { id: 'lisk', name: 'Lisk', icon: '●' },
]

// Mock portfolio performance data
const getMockPortfolioData = () => Array.from({ length: 90 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (89 - i))
    const baseValue = 10000
    const growth = Math.random() * 50 + 10
    return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: baseValue + growth * (i + 1),
        earnings: growth * (i + 1),
    }
})

export function ProfilePanel() {
    const account = useCurrentAccount()
    const { data: positions = [] } = useUserPositions()
    const { data: rewards } = useRewards()
    const { data: suiPriceData } = useTokenPrice('SUI')
    const { data: transactions = [] } = useTransactions()

    const [portfolioTimePeriod, setPortfolioTimePeriod] = useState<TimePeriod>('30D')

    // Generate mock data once
    const fullPortfolioData = useMemo(() => getMockPortfolioData(), [])

    // Filter portfolio data based on time period
    const portfolioData = useMemo(() => {
        const days = portfolioTimePeriod === '7D' ? 7 : portfolioTimePeriod === '30D' ? 30 : 90
        return fullPortfolioData.slice(-days)
    }, [portfolioTimePeriod, fullPortfolioData])

    const suiPrice = suiPriceData?.priceUsd ?? 0
    const totalAllocatedSui = positions.reduce((sum, pos) => sum + pos.amount, 0)
    const totalAllocatedUsd = totalAllocatedSui * suiPrice

    // Calculate weighted APY
    const estimatedAPY = positions.length && totalAllocatedSui > 0
        ? positions.reduce((sum, pos) => sum + pos.apy * pos.amount, 0) / totalAllocatedSui
        : 0

    // Calculate total earned
    const totalEarnedSui = positions.reduce((sum, pos) => sum + (pos.amount * 0.01), 0)
    const totalEarnedUsd = totalEarnedSui * suiPrice

    const estimatedMonthlyEarningsSui = totalAllocatedSui > 0 && estimatedAPY > 0
        ? (totalAllocatedSui * estimatedAPY) / 100 / 12
        : 0
    const estimatedMonthlyEarningsUsd = estimatedMonthlyEarningsSui * suiPrice

    // Calculate totals from transactions
    const totalDeposits = useMemo(() => {
        return positions.reduce((sum, pos) => sum + pos.amount, 0)
    }, [positions])

    const totalWithdrawals = useMemo(() => {
        return transactions
            .filter((tx) => tx.type === 'withdrawal')
            .reduce((sum, tx) => sum + tx.amount, 0)
    }, [transactions])

    const netPosition = totalDeposits - totalWithdrawals

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }

    return (
        <div className="space-y-6">
            <TabbedContainer
                label="Profile"
                className="w-full"
                tabClassName="bg-white"
                contentClassName="bg-white"
            >
                {/* Hero Header with Multichain Indicator */}
                <div className="relative mb-8 overflow-hidden rounded-2xl bg-brand-gradient p-8 text-white shadow-lg">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Globe className="w-8 h-8" />
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-heading">
                                        Multichain Portfolio
                                    </h1>
                                </div>
                                <p className="text-white/90 text-sm sm:text-base max-w-2xl">
                                    Your unified view across Sui, Base, Avalanche, and Lisk networks
                                </p>
                            </div>
                        </div>

                        {/* Supported Chains Pills */}
                        <div className="flex flex-wrap gap-2">
                            {SUPPORTED_CHAINS.map((chain) => (
                                <div
                                    key={chain.id}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200"
                                >
                                    <span className="text-lg">{chain.icon}</span>
                                    <span className="text-sm font-medium">{chain.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Account Info Card */}
                <Card className="mb-6 border-black/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-brand-gradient">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-[#f4f3f0] border border-black/5">
                                <span className="text-muted-foreground font-medium">Wallet Address</span>
                                <span className="font-mono text-sm text-black font-semibold">
                                    {account?.address.slice(0, 8)}...{account?.address.slice(-6)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-[#f4f3f0] border border-black/5">
                                <span className="text-muted-foreground font-medium">Network</span>
                                <Badge variant="secondary" className="bg-brand-gradient text-white border-none">
                                    Sui Testnet
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Protocol Balance */}
                    <Card className="relative overflow-hidden bg-brand-gradient border-transparent group hover:scale-105 transition-transform duration-300 shadow-lg">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-sm text-white/90 flex items-center gap-2">
                                <Wallet className="w-4 h-4" />
                                Protocol Balance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold text-white mb-1">
                                ${isNaN(totalAllocatedUsd) || !isFinite(totalAllocatedUsd) ? '0.00' : totalAllocatedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-white/80">
                                {isNaN(totalAllocatedSui) || !isFinite(totalAllocatedSui) ? '0' : totalAllocatedSui.toLocaleString(undefined, { maximumFractionDigits: 2 })} SUI
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weighted APY */}
                    <Card className="border-black/10 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Weighted APY
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-transparent bg-clip-text bg-brand-gradient">
                                {isNaN(estimatedAPY) || !isFinite(estimatedAPY) ? '0.00' : estimatedAPY.toFixed(2)}%
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Est. ${isNaN(estimatedMonthlyEarningsUsd) || !isFinite(estimatedMonthlyEarningsUsd) ? '0.00' : estimatedMonthlyEarningsUsd.toFixed(2)}/month
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
                                ${isNaN(totalEarnedUsd) || !isFinite(totalEarnedUsd) ? '0.00' : totalEarnedUsd.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                All time
                            </div>
                        </CardContent>
                    </Card>

                    {/* Net Position */}
                    <Card className="border-black/10 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                <PieChart className="w-4 h-4" />
                                Net Position
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-black">
                                {formatCurrency(netPosition)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Across all chains
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Portfolio Performance Chart */}
                <Card className="mb-6 border-black/10 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#1055C9]/5 to-transparent p-6 border-b border-black/5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-brand-gradient">
                                    <Activity className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Portfolio Performance</CardTitle>
                                    <p className="text-sm text-muted-foreground">Track your growth across all chains</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-white border border-black/10">
                                    <div className="w-3 h-3 rounded-full bg-brand-gradient"></div>
                                    <span className="text-muted-foreground font-medium">Portfolio Value</span>
                                </div>
                                <div className="flex gap-2">
                                    {(['7D', '30D', '90D'] as TimePeriod[]).map((period) => (
                                        <Button
                                            key={period}
                                            variant={portfolioTimePeriod === period ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setPortfolioTimePeriod(period)}
                                            className={cn(
                                                "transition-all duration-200",
                                                portfolioTimePeriod === period
                                                    ? 'bg-brand-gradient text-white shadow-lg'
                                                    : 'hover:bg-[#f4f3f0]'
                                            )}
                                        >
                                            {period}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <CardContent className="pt-6">
                        <div className="w-full h-[200px] sm:h-[250px] md:h-[300px]">
                            <PortfolioChart data={portfolioData} height={250} />
                        </div>
                    </CardContent>
                </Card>

                {/* Active Positions */}
                <Card className="mb-6 border-black/10">
                    <div className="bg-gradient-to-r from-[#1055C9]/5 to-transparent p-6 border-b border-black/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-brand-gradient">
                                    <PieChart className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Active Positions</CardTitle>
                                    <p className="text-sm text-muted-foreground">Your investments across all chains</p>
                                </div>
                            </div>
                            <Link href="/strategies" className="text-sm font-semibold text-transparent bg-clip-text bg-brand-gradient hover:opacity-80 transition-opacity">
                                View All →
                            </Link>
                        </div>
                    </div>
                    <CardContent className="pt-6">
                        {positions && positions.length > 0 ? (
                            <div className="space-y-3">
                                {positions.map((position, index) => (
                                    <div
                                        key={`${position.strategyId}-${index}`}
                                        className="group p-4 rounded-xl bg-gradient-to-br from-white to-[#f4f3f0]/50 border border-black/5 hover:border-[#1055C9]/30 hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-200">
                                                    {position.strategyName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-black text-lg">{position.strategyName}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {position.receiptTokenBalance.toLocaleString()} tokens
                                                        </Badge>
                                                        <span className="text-transparent bg-clip-text bg-brand-gradient font-medium">● Sui</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-black text-xl">
                                                    ${(position.amount * suiPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-sm font-semibold text-transparent bg-clip-text bg-brand-gradient mt-1">
                                                    {position.apy}% APY
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#f4f3f0] to-white flex items-center justify-center">
                                    <PieChart className="w-10 h-10 text-muted-foreground opacity-50" />
                                </div>
                                <p className="text-muted-foreground mb-4 font-medium">No active positions yet</p>
                                <Link href="/strategies">
                                    <span className="text-sm text-transparent bg-clip-text bg-brand-gradient hover:opacity-80 font-semibold">
                                        Browse Strategies →
                                    </span>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Earnings Breakdown */}
                <Card className="mb-6 border-black/10 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#1055C9]/5 to-transparent p-6 border-b border-black/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-brand-gradient">
                                <Award className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Earnings Breakdown</CardTitle>
                                <p className="text-sm text-muted-foreground">Your rewards across all networks</p>
                            </div>
                        </div>
                    </div>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center p-6 rounded-xl bg-[#f4f3f0] border border-black/5 hover:shadow-lg transition-shadow duration-200">
                                <div className="text-3xl font-bold text-black mb-2">
                                    ${isNaN(totalEarnedUsd) || !isFinite(totalEarnedUsd) ? '0.00' : totalEarnedUsd.toFixed(2)}
                                </div>
                                <div className="text-sm text-muted-foreground font-medium">Total Earned</div>
                            </div>
                            <div className="text-center p-6 rounded-xl bg-[#f4f3f0] border border-black/5 hover:shadow-lg transition-shadow duration-200">
                                <div className="text-3xl font-bold text-transparent bg-clip-text bg-brand-gradient mb-2">
                                    ${isNaN(estimatedMonthlyEarningsUsd) || !isFinite(estimatedMonthlyEarningsUsd) ? '0.00' : estimatedMonthlyEarningsUsd.toFixed(2)}
                                </div>
                                <div className="text-sm text-muted-foreground font-medium">Est. Monthly</div>
                            </div>
                            <div className="text-center p-6 rounded-xl bg-[#f4f3f0] border border-black/5 hover:shadow-lg transition-shadow duration-200">
                                <div className="text-3xl font-bold text-black mb-2">
                                    ${isNaN(estimatedMonthlyEarningsUsd) || !isFinite(estimatedMonthlyEarningsUsd) ? '0.00' : (estimatedMonthlyEarningsUsd / 30).toFixed(2)}
                                </div>
                                <div className="text-sm text-muted-foreground font-medium">Est. Daily</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rewards Summary */}
                {rewards && (
                    <Card className="mb-6 border-black/10 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#1055C9]/5 to-transparent p-6 border-b border-black/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-brand-gradient">
                                        <Award className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Rewards Summary</CardTitle>
                                        <p className="text-sm text-muted-foreground">Your loyalty program status</p>
                                    </div>
                                </div>
                                <Link href="/rewards" className="text-sm font-semibold text-transparent bg-clip-text bg-brand-gradient hover:opacity-80 transition-opacity">
                                    View Details →
                                </Link>
                            </div>
                        </div>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-6 rounded-xl bg-brand-gradient text-white hover:scale-105 transition-transform duration-200 shadow-lg">
                                    <div className="text-sm text-white/90 mb-2 font-medium">$SYN Balance</div>
                                    <div className="text-3xl font-bold">{rewards.synBalance.toLocaleString()}</div>
                                </div>
                                <div className="p-6 rounded-xl bg-[#f4f3f0] border border-black/5 hover:shadow-lg transition-shadow duration-200">
                                    <div className="text-sm text-muted-foreground mb-2 font-medium">SGP Points</div>
                                    <div className="text-3xl font-bold text-black">{rewards.sgpPoints.toLocaleString()}</div>
                                </div>
                                <div className="p-6 rounded-xl bg-[#f4f3f0] border border-black/5 hover:shadow-lg transition-shadow duration-200">
                                    <div className="text-sm text-muted-foreground mb-2 font-medium">Current Tier</div>
                                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-brand-gradient">
                                        {rewards.currentTier}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Transaction History with Enhanced Filters */}
                <TransactionHistory
                    transactions={transactions}
                    showStrategy={true}
                />
            </TabbedContainer>
        </div>
    )
}
