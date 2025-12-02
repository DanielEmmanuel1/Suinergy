'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowLeft, TrendingUp, DollarSign, Activity, Info, Clock, AlertCircle, ExternalLink, Settings } from 'lucide-react'
import { useAppStore } from '@/store/use-app-store'
import { DepositModal } from '@/components/modals/deposit-modal'
import { TransactionSettingsModal, TransactionSettings } from '@/components/modals/transaction-settings-modal'
import { TransactionHistory, Transaction } from '@/components/transactions/transaction-history'
import { useUserPositions } from '@/hooks/use-user-positions'
import { useCurrentAccount } from '@mysten/dapp-kit'

// Mock strategy data - will be replaced with real data hooks
const getStrategyData = (id: string) => {
    const strategies: Record<string, any> = {
        '1': {
            id: '1',
            name: 'USDC Liquidity Pool',
            asset: 'USDC',
            apy: 12.5,
            apr: 11.8,
            apyChange: 0.5,
            tvl: 2500000,
            capacity: 5000000,
            remaining: 2500000,
            risk: 'low',
            withdrawalLatency: '24h',
            platformFee: 0.1,
            description: 'USDC Prime is a conservative lending strategy designed to deliver consistent, risk-adjusted yields by allocating funds across highly liquid markets and premium collateral. This strategy optimizes returns by lending USDC against both core collateral markets and select real-world asset (RWA) pools, dynamically adapting to market conditions to ensure robust yield performance and capital preservation.',
            platforms: [
                { id: 'scallop', name: 'Scallop', allocation: 35, apy: 11.5, apyContribution: 4.03, yieldType: 'lending', risk: 'low', health: 'excellent', color: '#1565c0', supplied: 875000, utilization: 87.5, supplyApy: 4.54 },
                { id: 'cetus', name: 'Cetus', allocation: 30, apy: 13.2, apyContribution: 3.96, yieldType: 'lp', risk: 'low', health: 'good', color: '#b92b27', supplied: 750000, utilization: 83.7, supplyApy: 4.34 },
                { id: 'lst', name: 'LST Staking', allocation: 25, apy: 8.5, apyContribution: 2.13, yieldType: 'staking', risk: 'low', health: 'excellent', color: '#8b5cf6', supplied: 625000, utilization: 92.1, supplyApy: 8.5 },
                { id: 'kriya', name: 'Kriya', allocation: 10, apy: 15.8, apyContribution: 1.58, yieldType: 'structured', risk: 'medium', health: 'good', color: '#10b981', supplied: 250000, utilization: 75.2, supplyApy: 15.8 },
            ],
            performanceHistory: Array.from({ length: 90 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (89 - i))
                return {
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    supplyApy: 7.44 + (Math.random() - 0.5) * 2,
                    benchmarkApy: 6.5 + (Math.random() - 0.5) * 1.5,
                    totalSupply: 2000000 + (i * 1500) + Math.random() * 10000,
                }
            }),
            interestGenerated: Array.from({ length: 180 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (179 - i))
                return {
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: 100000 + (i * 18000) + Math.random() * 5000,
                }
            }),
            totalInterestGenerated: 3350593.1,
            deploymentDate: '2024-04-02',
            managementFee: 0.0,
            performanceFee: 0.0,
        },
        '2': {
            id: '2',
            name: 'SUI Staking',
            asset: 'SUI',
            apy: 8.2,
            apr: 7.9,
            apyChange: -0.2,
            tvl: 5000000,
            capacity: 10000000,
            remaining: 5000000,
            risk: 'low',
            withdrawalLatency: '7d',
            platformFee: 0.15,
            description: 'SUI Staking is a low-risk strategy focused on native Sui blockchain staking rewards. This strategy allocates funds primarily to liquid staking tokens (LST) and validator staking pools, providing consistent yields with minimal risk exposure.',
            platforms: [
                { id: 'lst', name: 'LST Staking', allocation: 60, apy: 8.5, apyContribution: 5.1, yieldType: 'staking', risk: 'low', health: 'excellent', color: '#8b5cf6', supplied: 3000000, utilization: 92.1, supplyApy: 8.5 },
                { id: 'scallop', name: 'Scallop', allocation: 25, apy: 11.5, apyContribution: 2.88, yieldType: 'lending', risk: 'low', health: 'excellent', color: '#1565c0', supplied: 1250000, utilization: 87.5, supplyApy: 4.54 },
                { id: 'cetus', name: 'Cetus', allocation: 15, apy: 13.2, apyContribution: 1.98, yieldType: 'lp', risk: 'low', health: 'good', color: '#b92b27', supplied: 750000, utilization: 83.7, supplyApy: 4.34 },
            ],
            performanceHistory: Array.from({ length: 90 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (89 - i))
                return {
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    supplyApy: 8.2 + (Math.random() - 0.5) * 1.5,
                    benchmarkApy: 7.0 + (Math.random() - 0.5) * 1,
                    totalSupply: 4500000 + (i * 550) + Math.random() * 5000,
                }
            }),
            interestGenerated: Array.from({ length: 180 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (179 - i))
                return {
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: 50000 + (i * 9000) + Math.random() * 3000,
                }
            }),
            totalInterestGenerated: 1680000,
            deploymentDate: '2024-03-15',
            managementFee: 0.0,
            performanceFee: 0.0,
        },
        '3': {
            id: '3',
            name: 'Leveraged Yield Farming',
            asset: 'USDT',
            apy: 18.5,
            apr: 16.2,
            apyChange: 1.2,
            tvl: 1200000,
            capacity: 3000000,
            remaining: 1800000,
            risk: 'high',
            withdrawalLatency: '48h',
            platformFee: 0.2,
            description: 'Leveraged Yield Farming is an aggressive strategy that employs leverage to amplify returns. This strategy allocates funds across high-yield structured products, leveraged positions, and emissions farming, targeting maximum APY while managing risk through dynamic rebalancing.',
            platforms: [
                { id: 'kriya', name: 'Kriya', allocation: 40, apy: 15.8, apyContribution: 6.32, yieldType: 'structured', risk: 'medium', health: 'good', color: '#10b981', supplied: 480000, utilization: 75.2, supplyApy: 15.8 },
                { id: 'cetus', name: 'Cetus', allocation: 35, apy: 13.2, apyContribution: 4.62, yieldType: 'lp', risk: 'low', health: 'good', color: '#b92b27', supplied: 420000, utilization: 83.7, supplyApy: 4.34 },
                { id: 'scallop', name: 'Scallop', allocation: 15, apy: 11.5, apyContribution: 1.73, yieldType: 'lending', risk: 'low', health: 'excellent', color: '#1565c0', supplied: 180000, utilization: 87.5, supplyApy: 4.54 },
                { id: 'emissions', name: 'Emissions', allocation: 10, apy: 25.0, apyContribution: 2.5, yieldType: 'emissions', risk: 'high', health: 'fair', color: '#f59e0b', supplied: 120000, utilization: 65.0, supplyApy: 25.0 },
            ],
            performanceHistory: Array.from({ length: 90 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (89 - i))
                return {
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    supplyApy: 18.5 + (Math.random() - 0.5) * 4,
                    benchmarkApy: 12.0 + (Math.random() - 0.5) * 2,
                    totalSupply: 1000000 + (i * 220) + Math.random() * 2000,
                }
            }),
            interestGenerated: Array.from({ length: 180 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (179 - i))
                return {
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: 20000 + (i * 12000) + Math.random() * 4000,
                }
            }),
            totalInterestGenerated: 2200000,
            deploymentDate: '2024-05-10',
            managementFee: 0.0,
            performanceFee: 0.0,
        },
    }
    return strategies[id] || strategies['1']
}

type TimePeriod = '7D' | '30D' | '90D'

export default function StrategyDetailPage() {
    const params = useParams()
    const router = useRouter()
    const strategyId = params.id as string
    const strategy = getStrategyData(strategyId)
    const { setDepositModalOpen, setSelectedStrategy } = useAppStore()
    const { data: positions } = useUserPositions()
    const account = useCurrentAccount()
    const userPosition = positions?.find(p => p.strategyId === strategyId)

    const [timePeriod, setTimePeriod] = useState<TimePeriod>('90D')
    const [transactionSettingsOpen, setTransactionSettingsOpen] = useState(false)
    const [transactionSettings, setTransactionSettings] = useState<TransactionSettings>({
        slippage: 0.5,
        gasPrice: 'standard',
        deadline: 20,
    })

    // Mock transaction history for this strategy
    const strategyTransactions: Transaction[] = useMemo(() => [
        {
            id: '1',
            type: 'deposit',
            amount: 5000,
            token: strategy.asset,
            strategyId: strategyId,
            strategyName: strategy.name,
            txHash: '0x1234567890abcdef',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            status: 'completed',
        },
        {
            id: '2',
            type: 'earnings',
            amount: 125.50,
            token: strategy.asset,
            strategyId: strategyId,
            strategyName: strategy.name,
            txHash: '0xabcdef1234567890',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            status: 'completed',
        },
        {
            id: '3',
            type: 'withdrawal',
            amount: 1000,
            token: strategy.asset,
            strategyId: strategyId,
            strategyName: strategy.name,
            txHash: '0x9876543210fedcba',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            status: 'completed',
        },
    ], [strategyId, strategy.name, strategy.asset])

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }

    const utilization = (strategy.tvl / strategy.capacity) * 100
    const totalBorrowed = strategy.platforms.reduce((sum: number, p: any) => sum + (p.supplied * p.utilization / 100), 0)

    // Filter chart data based on time period
    const getFilteredData = (data: any[], days: number) => {
        return data.slice(-days)
    }

    const apyChartData = useMemo(() => {
        const days = timePeriod === '7D' ? 7 : timePeriod === '30D' ? 30 : 90
        return getFilteredData(strategy.performanceHistory, days)
    }, [timePeriod, strategy.performanceHistory])

    const interestChartData = useMemo(() => {
        const days = timePeriod === '7D' ? 7 : timePeriod === '30D' ? 30 : 90
        return getFilteredData(strategy.interestGenerated, days)
    }, [timePeriod, strategy.interestGenerated])

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Breadcrumb Navigation */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <button onClick={() => router.push('/strategies')} className="hover:text-black transition-colors">
                        Strategies
                    </button>
                    <span>/</span>
                    <span className="text-black">{strategy.name}</span>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-heading">{strategy.name}</h1>
                            <Badge variant="secondary">{strategy.asset}</Badge>
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
                        <p className="text-lg text-muted-foreground max-w-3xl">
                            {strategy.description}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push('/strategies')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-white border-black/10">
                        <TabsTrigger value="overview">Vault Overview</TabsTrigger>
                        <TabsTrigger value="position">My Position</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-6">
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Left Column - Metrics and Charts */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Key Metrics */}
                                <div className="grid md:grid-cols-4 gap-4">
                                    <Card className="border-black/10">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs text-muted-foreground">Total Supplied</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-black">{formatCurrency(strategy.tvl)}</div>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-black/10">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs text-muted-foreground">Total Borrowed</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-black">{formatCurrency(totalBorrowed)}</div>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-black/10">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs text-muted-foreground">Utilization</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-black">{utilization.toFixed(2)}%</div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-brand-gradient border-transparent">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xs text-white/80">Supply APY</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-white">{strategy.apy}%</div>
                                            <div className="text-xs text-white/70 mt-1">90D Avg: {strategy.apy.toFixed(2)}%</div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Supply APY Chart */}
                                <Card className="border-black/10">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Supply APY / Total Supply</CardTitle>
                                            <div className="flex gap-2">
                                                <Button 
                                                    variant={timePeriod === '7D' ? 'default' : 'outline'} 
                                                    size="sm"
                                                    onClick={() => setTimePeriod('7D')}
                                                    className={timePeriod === '7D' ? 'bg-brand-gradient' : ''}
                                                >
                                                    7D
                                                </Button>
                                                <Button 
                                                    variant={timePeriod === '30D' ? 'default' : 'outline'} 
                                                    size="sm"
                                                    onClick={() => setTimePeriod('30D')}
                                                    className={timePeriod === '30D' ? 'bg-brand-gradient' : ''}
                                                >
                                                    30D
                                                </Button>
                                                <Button 
                                                    variant={timePeriod === '90D' ? 'default' : 'outline'} 
                                                    size="sm"
                                                    onClick={() => setTimePeriod('90D')}
                                                    className={timePeriod === '90D' ? 'bg-brand-gradient' : ''}
                                                >
                                                    90D
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={apyChartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                                <XAxis 
                                                    dataKey="date" 
                                                    stroke="#000000"
                                                    style={{ fontSize: '12px' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis 
                                                    yAxisId="left"
                                                    stroke="#000000"
                                                    style={{ fontSize: '12px' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickFormatter={(value) => `${value}%`}
                                                />
                                                <YAxis 
                                                    yAxisId="right"
                                                    orientation="right"
                                                    stroke="#000000"
                                                    style={{ fontSize: '12px' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#ffffff',
                                                        border: '1px solid rgba(0,0,0,0.1)',
                                                        borderRadius: '8px',
                                                    }}
                                                />
                                                <Line 
                                                    yAxisId="left"
                                                    type="monotone" 
                                                    dataKey="supplyApy" 
                                                    stroke="#1565c0" 
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                                <Line 
                                                    yAxisId="left"
                                                    type="monotone" 
                                                    dataKey="benchmarkApy" 
                                                    stroke="#b92b27" 
                                                    strokeWidth={2}
                                                    strokeDasharray="5 5"
                                                    dot={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Interest Generated Chart */}
                                <Card className="border-black/10">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>Interest Generated / Vault Share Price</CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Total interest generated across all users in this vault.
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button 
                                                    variant={timePeriod === '7D' ? 'default' : 'outline'} 
                                                    size="sm"
                                                    onClick={() => setTimePeriod('7D')}
                                                    className={timePeriod === '7D' ? 'bg-brand-gradient' : ''}
                                                >
                                                    7D
                                                </Button>
                                                <Button 
                                                    variant={timePeriod === '30D' ? 'default' : 'outline'} 
                                                    size="sm"
                                                    onClick={() => setTimePeriod('30D')}
                                                    className={timePeriod === '30D' ? 'bg-brand-gradient' : ''}
                                                >
                                                    30D
                                                </Button>
                                                <Button 
                                                    variant={timePeriod === '90D' ? 'default' : 'outline'} 
                                                    size="sm"
                                                    onClick={() => setTimePeriod('90D')}
                                                    className={timePeriod === '90D' ? 'bg-brand-gradient' : ''}
                                                >
                                                    90D
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4">
                                            <div className="text-3xl font-bold text-transparent bg-clip-text bg-brand-gradient">
                                                +{formatCurrency(strategy.totalInterestGenerated)}
                                            </div>
                                        </div>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={interestChartData}>
                                                <defs>
                                                    <linearGradient id="interestGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#1565c0" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#b92b27" stopOpacity={0.1} />
                                                    </linearGradient>
                                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                                        <stop offset="0%" stopColor="#b92b27" />
                                                        <stop offset="100%" stopColor="#1565c0" />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                                <XAxis 
                                                    dataKey="date" 
                                                    stroke="#000000"
                                                    style={{ fontSize: '12px' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <YAxis 
                                                    stroke="#000000"
                                                    style={{ fontSize: '12px' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#ffffff',
                                                        border: '1px solid rgba(0,0,0,0.1)',
                                                        borderRadius: '8px',
                                                    }}
                                                    formatter={(value: number) => formatCurrency(value)}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="value" 
                                                    stroke="url(#lineGradient)"
                                                    strokeWidth={2}
                                                    fill="url(#interestGradient)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                        <div className="grid grid-cols-4 gap-4 mt-4">
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">1D Growth</div>
                                                <div className="text-sm font-semibold text-black">+{formatCurrency(4270)}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">7D Growth</div>
                                                <div className="text-sm font-semibold text-black">+{formatCurrency(162410)}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">30D Growth</div>
                                                <div className="text-sm font-semibold text-black">+{formatCurrency(1740000)}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted-foreground mb-1">180D Growth</div>
                                                <div className="text-sm font-semibold text-black">+{formatCurrency(3320000)}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Allocation Breakdown */}
                                <Card className="border-black/10">
                                    <CardHeader>
                                        <CardTitle>Allocation Breakdown</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-[#f4f3f0] border-b border-black/10">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-black">Market</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-black">Collateral</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-black">Allocation %</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-black">Supplied</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-black">Utilization</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-black">Supply APY</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-black"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-black/10">
                                                    {strategy.platforms.map((platform: any) => (
                                                        <tr key={platform.id} className="hover:bg-[#f4f3f0]/50 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <div className="font-medium text-black">{platform.name}</div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-xs">
                                                                    {platform.name.charAt(0)}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="font-semibold text-black">{platform.allocation}%</div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="text-black">{formatCurrency(platform.supplied)}</div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="text-black">{platform.utilization.toFixed(2)}%</div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="font-semibold text-transparent bg-clip-text bg-brand-gradient">
                                                                    {platform.supplyApy}%
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-black cursor-pointer" />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Deposit/Withdraw */}
                            <div className="space-y-6">
                                <Card className="border-black/10">
                                    <CardHeader>
                                        <CardTitle>You Deposit</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-muted-foreground">Amount</span>
                                                <span className="text-xs text-muted-foreground">Balance: 0 {strategy.asset}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    className="flex-1 px-4 py-3 rounded-lg border border-black/10 bg-white text-black"
                                                />
                                                <Button variant="outline" size="sm">Half</Button>
                                                <Button variant="outline" size="sm">Max</Button>
                                            </div>
                                        </div>
                                        <Button 
                                            className="w-full bg-brand-gradient"
                                            onClick={() => {
                                                setSelectedStrategy(strategyId)
                                                setDepositModalOpen(true)
                                            }}
                                        >
                                            {account ? 'Deposit' : 'Connect Wallet'}
                                        </Button>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Transaction Settings</span>
                                            <button 
                                                className="hover:text-black transition-colors"
                                                onClick={() => setTransactionSettingsOpen(true)}
                                            >
                                                <Settings className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Vault Info */}
                                <Card className="border-black/10">
                                    <CardHeader>
                                        <CardTitle>Vault Info</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Token</span>
                                            <span className="font-medium text-black">{strategy.asset}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Risk Manager</span>
                                            <span className="font-medium text-black">Suinergy</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Vault Profile</span>
                                            <Badge variant="secondary" className="capitalize">{strategy.risk}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Deployment Date</span>
                                            <span className="font-medium text-black">{new Date(strategy.deploymentDate).toLocaleDateString()}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Supply APY</span>
                                            <span className="font-semibold text-transparent bg-clip-text bg-brand-gradient">{strategy.apy}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Management Fee</span>
                                            <span className="font-medium text-black">{strategy.managementFee}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Performance Fee</span>
                                            <span className="font-medium text-black">{strategy.performanceFee}%</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="position" className="space-y-6 mt-6">
                        {userPosition ? (
                            <div className="space-y-6">
                                <Card className="border-black/10">
                                    <CardHeader>
                                        <CardTitle>Your Position</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div>
                                                <div className="text-sm text-muted-foreground mb-1">Deposited</div>
                                                <div className="text-2xl font-bold text-black">{formatCurrency(userPosition.amount)}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground mb-1">Current APY</div>
                                                <div className="text-2xl font-bold text-transparent bg-clip-text bg-brand-gradient">
                                                    {userPosition.apy}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground mb-1">Est. Annual Earnings</div>
                                                <div className="text-2xl font-bold text-black">
                                                    {formatCurrency((userPosition.amount * userPosition.apy) / 100)}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* User Allocation Breakdown */}
                                <Card className="border-black/10">
                                    <CardHeader>
                                        <CardTitle>Your Allocation Breakdown</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {strategy.platforms.map((platform: any) => {
                                                const userAllocation = (platform.allocation / 100) * userPosition.amount
                                                return (
                                                    <div key={platform.id} className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform.color }} />
                                                                <span className="font-medium text-black">{platform.name}</span>
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {platform.yieldType}
                                                                </Badge>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-semibold text-black">{platform.allocation}%</div>
                                                                <div className="text-xs text-muted-foreground">{formatCurrency(userAllocation)}</div>
                                                            </div>
                                                        </div>
                                                        <div className="h-2 bg-[#f4f3f0] rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full transition-all duration-500"
                                                                style={{
                                                                    width: `${platform.allocation}%`,
                                                                    background: `linear-gradient(to right, ${platform.color}, ${platform.color}dd)`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Transaction History */}
                                <TransactionHistory transactions={strategyTransactions} showStrategy={false} />
                            </div>
                        ) : (
                            <Card className="border-black/10">
                                <CardContent className="pt-6 text-center py-12">
                                    <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-semibold text-black mb-2">No Position Yet</p>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Deposit into this strategy to start earning yield
                                    </p>
                                    <Button
                                        className="bg-brand-gradient"
                                        onClick={() => {
                                            setSelectedStrategy(strategyId)
                                            setDepositModalOpen(true)
                                        }}
                                    >
                                        Deposit Now
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
            <DepositModal />
            <TransactionSettingsModal
                open={transactionSettingsOpen}
                onOpenChange={setTransactionSettingsOpen}
                onSave={setTransactionSettings}
            />
        </MainLayout>
    )
}

