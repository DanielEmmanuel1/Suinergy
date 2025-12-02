'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TabbedContainer } from '@/components/ui/tabbed-container'
import { useWalletBalance } from '@/hooks/use-wallet-balance'
import { useUserPositions } from '@/hooks/use-user-positions'
import { TrendingUp, Wallet, DollarSign } from 'lucide-react'

export default function DashboardPage() {
    const { data: balance } = useWalletBalance()
    const { data: positions } = useUserPositions()

    const totalAllocated = positions?.reduce((sum, pos) => sum + pos.amount, 0) || 0
    const estimatedAPY = positions?.length
        ? positions.reduce((sum, pos) => sum + pos.apy * pos.amount, 0) / totalAllocated || 0
        : 0

    return (
        <MainLayout>
            <div className="space-y-6">
                <TabbedContainer
                    label="Dashboard"
                    className="w-full"
                    tabClassName="bg-white"
                    contentClassName="bg-white"
                >
                    <div className="text-left mb-12">
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 font-heading">Portfolio Overview</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            Overview of your yield allocations and portfolio performance
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-brand-gradient border-transparent">
                            <CardHeader>
                                <CardTitle className="text-sm text-white/80 flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    Wallet Balance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">
                                    {balance
                                        ? `${(Number(balance.totalBalance) / 1e9).toFixed(2)} SUI`
                                        : '0.00 SUI'}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-black/10">
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Total Allocated
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-black">
                                    ${totalAllocated.toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-black/10">
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Weighted APY
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-transparent bg-clip-text bg-brand-gradient">
                                    {estimatedAPY.toFixed(2)}%
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card className="border-black/10">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                <a
                                    href="/strategies"
                                    className="p-4 rounded-xl bg-brand-gradient text-white hover:opacity-90 transition-opacity"
                                >
                                    <div className="font-semibold">Browse Strategies</div>
                                    <div className="text-sm text-white/80 mt-1">
                                        Explore available yield opportunities
                                    </div>
                                </a>
                                <a
                                    href="/rewards"
                                    className="p-4 rounded-xl bg-[#f4f3f0] border border-black/10 hover:bg-white transition-colors"
                                >
                                    <div className="font-semibold text-black">View Rewards</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Check your $SYN balance and loyalty points
                                    </div>
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </TabbedContainer>
            </div>
        </MainLayout>
    )
}

