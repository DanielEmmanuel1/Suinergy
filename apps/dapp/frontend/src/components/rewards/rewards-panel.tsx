'use client'

import { Coins, Gift, TrendingUp, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TabbedContainer } from '@/components/ui/tabbed-container'

// Mock data - will be replaced with real data hooks
const mockRewards = {
    synBalance: 1250.5,
    sgpPoints: 8500,
    currentTier: 'Gold',
    nextTier: 'Platinum',
    tierProgress: 65,
    receiptTokens: [
        { id: '1', name: 'Prime USDC Vault', amount: 5000, apy: 12.5 },
        { id: '2', name: 'Sovereign SUI Vault', amount: 10000, apy: 8.2 },
    ],
    recentActivity: [
        { type: 'points_earned', amount: 100, description: 'Liquidity mining reward', timestamp: '2h ago' },
        { type: 'tier_upgrade', amount: 0, description: 'Upgraded to Gold tier', timestamp: '1d ago' },
        { type: 'syn_earned', amount: 50, description: 'Weekly staking reward', timestamp: '3d ago' },
    ],
}

export function RewardsPanel() {
    return (
        <div className="space-y-6">
            <TabbedContainer
                label="Rewards"
                className="w-full"
                tabClassName="bg-white dark:bg-gradient-to-r dark:from-[#1a1a1a] dark:to-[#121212]"
                contentClassName="bg-white dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#121212]"
            >
                <div className="text-left mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 font-heading">
                        Earn $SYN Rewards
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Track your $SYN balance, SGP points, and tier progress
                    </p>
                </div>

                {/* Balance Cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <Card className="bg-brand-gradient border-transparent">
                        <CardHeader>
                            <CardTitle className="text-sm text-white/80 flex items-center gap-2">
                                <Coins className="w-4 h-4" />
                                $SYN Balance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">
                                {mockRewards.synBalance.toLocaleString()}
                            </div>
                            <div className="text-sm text-white/70 mt-1">SYN</div>
                        </CardContent>
                    </Card>

                    <Card className="border-black/10">
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                SGP Points
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-black dark:text-white">
                                {mockRewards.sgpPoints.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">Loyalty Points</div>
                        </CardContent>
                    </Card>

                    <Card className="border-black/10">
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Current Tier
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-transparent bg-clip-text bg-brand-gradient mb-2">
                                {mockRewards.currentTier}
                            </div>
                            <Progress value={mockRewards.tierProgress} className="h-2 mb-1" />
                            <div className="text-xs text-muted-foreground">
                                {mockRewards.tierProgress}% to {mockRewards.nextTier}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Receipt Tokens */}
                <Card className="mb-6 border-black/10">
                    <CardHeader>
                        <CardTitle>Receipt Tokens</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mockRewards.receiptTokens.map((token) => (
                                <div
                                    key={token.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-[#f4f3f0] dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#121212] border border-black/10 dark:border-white/10"
                                >
                                    <div>
                                        <div className="font-semibold text-black dark:text-white">{token.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {token.amount.toLocaleString()} tokens
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-transparent bg-clip-text bg-brand-gradient">{token.apy}% APY</div>
                                        <Badge variant="secondary" className="mt-1">
                                            Active
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-black/10">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {mockRewards.recentActivity.map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg bg-[#f4f3f0] dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#121212]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center">
                                            <Gift className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-black dark:text-white">{activity.description}</div>
                                            <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
                                        </div>
                                    </div>
                                    {activity.amount > 0 && (
                                        <div className="font-semibold text-transparent bg-clip-text bg-brand-gradient">+{activity.amount}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabbedContainer>
        </div>
    )
}

