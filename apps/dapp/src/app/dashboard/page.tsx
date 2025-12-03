'use client'

import { useState, useMemo, useEffect } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TabbedContainer } from '@/components/ui/tabbed-container'
import { PortfolioChart } from '@/components/charts/portfolio-chart'
// Removed useWalletBalance - now using protocol deposits from positions
import { useUserPositions } from '@/hooks/use-user-positions'
import { useRewards } from '@/hooks/use-rewards'
import { useTokenPrice } from '@/hooks/oracle/use-token-price'
import { useWalletBalancesWithUsd } from '@/hooks/oracle/use-wallet-usd'
import { useTransactions } from '@/hooks/use-transactions'
import { WalletLandingScreen } from '@/components/wallet/wallet-landing-screen'
import {
    TrendingUp,
    Wallet,
    DollarSign,
    Coins,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    ArrowUpCircle,
    ArrowDownCircle,
    Clock,
    Award,
    PieChart,
    Gift,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type TimePeriod = '7D' | '30D' | '90D'

// Mock portfolio performance data - 90 days
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

// Mock recent activity
const mockRecentActivity = [
    { type: 'deposit', strategy: 'Prime USDC Vault', amount: 5000, timestamp: '2h ago', status: 'completed' },
    { type: 'earnings', strategy: 'Sovereign SUI Vault', amount: 125.50, timestamp: '5h ago', status: 'completed' },
    { type: 'deposit', strategy: 'Amplified USDT Vault', amount: 2000, timestamp: '1d ago', status: 'completed' },
    { type: 'withdrawal', strategy: 'Prime USDC Vault', amount: 1000, timestamp: '2d ago', status: 'completed' },
]

export default function DashboardPage() {
    const currentAccount = useCurrentAccount()
    const router = useRouter()
    const { data: positions } = useUserPositions()
    const { data: rewards } = useRewards()
    const { data: suiPriceData } = useTokenPrice('SUI')
    const { data: walletBalances, totalUsdValue: totalWalletUsd = 0 } = useWalletBalancesWithUsd()
    const { data: transactions } = useTransactions()

    const [portfolioTimePeriod, setPortfolioTimePeriod] = useState<TimePeriod>('30D')

    // Generate mock data once
    const fullPortfolioData = useMemo(() => getMockPortfolioData(), [])

    // Filter portfolio data based on time period
    const portfolioData = useMemo(() => {
        const days = portfolioTimePeriod === '7D' ? 7 : portfolioTimePeriod === '30D' ? 30 : 90
        return fullPortfolioData.slice(-days)
    }, [portfolioTimePeriod, fullPortfolioData])

    // Redirect to home page if wallet is disconnected
    // This prevents browser back button from returning to dashboard
    // Using replace instead of push to avoid adding to history
    useEffect(() => {
        if (!currentAccount) {
            router.replace('/')
        }
    }, [currentAccount, router])

    // Show landing screen if wallet is not connected
    // This check happens early to ensure immediate redirect when wallet disconnects
    if (!currentAccount) {
        return <WalletLandingScreen key="no-account" />
    }

    const suiPrice = suiPriceData?.priceUsd ?? 0
    const totalAllocatedSui = positions?.reduce((sum, pos) => sum + pos.amount, 0) ?? 0
    const totalAllocatedUsd = totalAllocatedSui * suiPrice

    // Calculate weighted APY - avoid division by zero
    const estimatedAPY = positions?.length && totalAllocatedSui > 0
        ? positions.reduce((sum, pos) => sum + pos.apy * pos.amount, 0) / totalAllocatedSui
        : 0

    // Calculate total earned (mock for now)
    const totalEarnedSui = positions?.reduce((sum, pos) => {
        // Estimate earnings as 1% of allocation (simplified)
        return sum + (pos.amount * 0.01)
    }, 0) ?? 0
    const totalEarnedUsd = totalEarnedSui * suiPrice

    const estimatedMonthlyEarningsSui = totalAllocatedSui > 0 && estimatedAPY > 0
        ? (totalAllocatedSui * estimatedAPY) / 100 / 12
        : 0
    const estimatedMonthlyEarningsUsd = estimatedMonthlyEarningsSui * suiPrice

    // Filter portfolio data based on time period

    return (
        <MainLayout>
            <div className="space-y-6">
                <TabbedContainer
                    label="Dashboard"
                    className="w-full"
                    tabClassName="bg-white"
                    contentClassName="bg-white"
                >
                    <div className="text-left mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2 font-heading">Portfolio Overview</h1>
                        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl">
                            Track your yield allocations, earnings, and portfolio performance
                        </p>
                    </div>

                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="bg-brand-gradient border-transparent">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-white/80 flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    Protocol Balance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">
                                    ${isNaN(totalAllocatedUsd) || !isFinite(totalAllocatedUsd) ? '0.00' : totalAllocatedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className="text-xs text-white/70 mt-1">
                                    {isNaN(totalAllocatedSui) || !isFinite(totalAllocatedSui) ? '0' : totalAllocatedSui.toLocaleString(undefined, { maximumFractionDigits: 2 })} SUI
                                </div>
                            </CardContent>
                        </Card>



                        <Card className="border-black/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Weighted APY
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-transparent bg-clip-text bg-brand-gradient">
                                    {isNaN(estimatedAPY) || !isFinite(estimatedAPY) ? '0.00' : estimatedAPY.toFixed(2)}%
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Est. ${isNaN(estimatedMonthlyEarningsUsd) || !isFinite(estimatedMonthlyEarningsUsd) ? '0.00' : estimatedMonthlyEarningsUsd.toFixed(2)}/month
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-black/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Coins className="w-4 h-4" />
                                    Total Earned
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-black">
                                    ${isNaN(totalEarnedUsd) || !isFinite(totalEarnedUsd) ? '0.00' : totalEarnedUsd.toFixed(2)}
                                </div>
                                <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" />
                                    All time
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Portfolio Performance Chart */}
                    <Card className="mb-6 border-black/10">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Portfolio Performance
                                </CardTitle>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 rounded-full bg-brand-gradient"></div>
                                        <span className="text-muted-foreground">Portfolio Value</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={portfolioTimePeriod === '7D' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setPortfolioTimePeriod('7D')}
                                            className={portfolioTimePeriod === '7D' ? 'bg-brand-gradient' : ''}
                                        >
                                            7D
                                        </Button>
                                        <Button
                                            variant={portfolioTimePeriod === '30D' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setPortfolioTimePeriod('30D')}
                                            className={portfolioTimePeriod === '30D' ? 'bg-brand-gradient' : ''}
                                        >
                                            30D
                                        </Button>
                                        <Button
                                            variant={portfolioTimePeriod === '90D' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setPortfolioTimePeriod('90D')}
                                            className={portfolioTimePeriod === '90D' ? 'bg-brand-gradient' : ''}
                                        >
                                            90D
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full h-[200px] sm:h-[250px] md:h-[300px]">
                                <PortfolioChart data={portfolioData} height={250} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                        {/* Active Positions */}
                        <Card className="border-black/10">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChart className="w-5 h-5" />
                                        Active Positions
                                    </CardTitle>
                                    <Link href="/strategies" className="text-sm text-transparent bg-clip-text bg-brand-gradient hover:opacity-80">
                                        View All
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {positions && positions.length > 0 ? (
                                    <div className="space-y-4">
                                        {positions.map((position, index) => (
                                            <div key={`${position.strategyId}-${index}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">
                                                            {position.strategyName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-black">{position.strategyName}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {position.receiptTokenBalance.toLocaleString()} receipt tokens
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-black">
                                                            ${(position.amount * suiPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </div>
                                                        <div className="text-xs text-transparent bg-clip-text bg-brand-gradient">
                                                            {position.apy}% APY
                                                        </div>
                                                    </div>
                                                </div>
                                                {index < positions.length - 1 && <Separator className="mt-4" />}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <p className="text-muted-foreground mb-4">No active positions yet</p>
                                        <Link href="/strategies">
                                            <span className="text-sm text-transparent bg-clip-text bg-brand-gradient hover:opacity-80 font-semibold">
                                                Browse Strategies →
                                            </span>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="border-black/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardContent>
                                    <div className="space-y-4">
                                        {transactions && transactions.length > 0 ? (
                                            transactions.slice(0, 5).map((activity, index) => (
                                                <div key={activity.id}>
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'deposit'
                                                            ? 'bg-green-100 text-green-600'
                                                            : activity.type === 'withdrawal'
                                                                ? 'bg-red-100 text-red-600'
                                                                : 'bg-brand-gradient text-white'
                                                            }`}>
                                                            {activity.type === 'deposit' ? (
                                                                <ArrowDownCircle className="w-4 h-4" />
                                                            ) : activity.type === 'withdrawal' ? (
                                                                <ArrowUpCircle className="w-4 h-4" />
                                                            ) : activity.type === 'claim' ? (
                                                                <Gift className="w-4 h-4" />
                                                            ) : (
                                                                <Coins className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="font-medium text-black capitalize">
                                                                        {activity.type === 'earnings' ? 'Earnings Claimed' : activity.type}
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {activity.strategyName}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className={`font-semibold ${activity.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                                                                        }`}>
                                                                        {activity.type === 'withdrawal' ? '-' : '+'}${activity.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {activity.timestamp.toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {index < Math.min(transactions.length, 5) - 1 && <Separator className="mt-4" />}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p>No recent activity</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Earnings Breakdown */}
                    <Card className="mb-6 border-black/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Earnings Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                <div className="text-center p-4 rounded-lg bg-[#f4f3f0]">
                                    <div className="text-2xl font-bold text-black mb-1">
                                        ${isNaN(totalEarnedUsd) || !isFinite(totalEarnedUsd) ? '0.00' : totalEarnedUsd.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Earned</div>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-[#f4f3f0]">
                                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-brand-gradient mb-1">
                                        ${isNaN(estimatedMonthlyEarningsUsd) || !isFinite(estimatedMonthlyEarningsUsd) ? '0.00' : estimatedMonthlyEarningsUsd.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Est. Monthly</div>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-[#f4f3f0]">
                                    <div className="text-2xl font-bold text-black mb-1">
                                        ${isNaN(estimatedMonthlyEarningsUsd) || !isFinite(estimatedMonthlyEarningsUsd) ? '0.00' : (estimatedMonthlyEarningsUsd / 30).toFixed(2)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Est. Daily</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rewards Summary */}
                    {rewards && (
                        <Card className="mb-6 border-black/10">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="w-5 h-5" />
                                        Rewards Summary
                                    </CardTitle>
                                    <Link href="/rewards" className="text-sm text-transparent bg-clip-text bg-brand-gradient hover:opacity-80">
                                        View Details →
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-lg bg-brand-gradient text-white">
                                        <div className="text-sm text-white/80 mb-1">$SYN Balance</div>
                                        <div className="text-2xl font-bold">{rewards.synBalance.toLocaleString()}</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-[#f4f3f0]">
                                        <div className="text-sm text-muted-foreground mb-1">SGP Points</div>
                                        <div className="text-2xl font-bold text-black">{rewards.sgpPoints.toLocaleString()}</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-[#f4f3f0]">
                                        <div className="text-sm text-muted-foreground mb-1">Current Tier</div>
                                        <div className="text-2xl font-bold text-transparent bg-clip-text bg-brand-gradient">
                                            {rewards.currentTier}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <Card className="border-black/10">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <Link
                                    href="/strategies"
                                    className="p-4 rounded-xl bg-brand-gradient text-white hover:opacity-90 transition-opacity"
                                >
                                    <div className="font-semibold mb-1">Browse Strategies</div>
                                    <div className="text-sm text-white/80">
                                        Explore available yield opportunities
                                    </div>
                                </Link>
                                <Link
                                    href="/rewards"
                                    className="p-4 rounded-xl bg-[#f4f3f0] border border-black/10 hover:bg-white transition-colors"
                                >
                                    <div className="font-semibold text-black mb-1">View Rewards</div>
                                    <div className="text-sm text-muted-foreground">
                                        Check your $SYN balance and loyalty points
                                    </div>
                                </Link>
                                <Link
                                    href="/profile"
                                    className="p-4 rounded-xl bg-[#f4f3f0] border border-black/10 hover:bg-white transition-colors"
                                >
                                    <div className="font-semibold text-black mb-1">View Profile</div>
                                    <div className="text-sm text-muted-foreground">
                                        Manage your account and transaction history
                                    </div>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </TabbedContainer>
            </div>
        </MainLayout>
    )
}

