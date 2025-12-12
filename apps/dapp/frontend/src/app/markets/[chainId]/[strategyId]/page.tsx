'use client'

import { useParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { getChainConfig } from '@/config/chains'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { redirect } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function MarketStrategyPage() {
    const params = useParams()
    const router = useRouter()
    const chainId = params.chainId as string
    const strategyId = params.strategyId as string

    const config = getChainConfig(chainId)
    const strategy = config?.strategies.find(s => s.id === strategyId)

    if (!config || !strategy) {
        // redirect('/markets') 
        // Can't redirect in render easily if not server component, but useEffect or just return null
        return <div className="p-8">Strategy not found</div>
    }

    // Mock chart data
    const data = Array.from({ length: 30 }, (_, i) => ({
        date: `Day ${i + 1}`,
        value: 100 + i + Math.random() * 5
    }))

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/markets/${chainId}`)}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-heading">{strategy.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Badge variant="outline">{config.name}</Badge>
                            <span>{strategy.asset}</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Performance Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="date" hide />
                                            <YAxis domain={['auto', 'auto']} />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#2563eb"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>About this Strategy</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    {strategy.description || `This strategy optimizes yield for ${strategy.asset} on ${config.name}. It automatically rebalances across lending and liquidity protocols to maximize returns while managing risk.`}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar / Actions */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Position</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-brand-gradient">
                                        {strategy.apy}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">Current APY</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">TVL</span>
                                        <span className="font-medium">${(strategy.tvl / 1000000).toFixed(2)}M</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Latency</span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{strategy.withdrawalLatency}</span>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Risk</span>
                                        <Badge variant={strategy.risk === 'low' ? 'default' : 'secondary'}>
                                            {strategy.risk}
                                        </Badge>
                                    </div>
                                </div>

                                <Button className="w-full bg-brand-gradient text-white font-bold h-12">
                                    Connect Wallet to Deposit
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    Connect your {config.id === 'solana' ? 'Solana' : config.id === 'sui' ? 'Sui' : 'EVM'} wallet to continue.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
