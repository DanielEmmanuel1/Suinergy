'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { 
    TrendingUp, 
    Activity, 
    Info, 
    Zap, 
    RefreshCw, 
    Target,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'
import { useUserPositions } from '@/hooks/use-user-positions'
import { useCurrentAccount } from '@mysten/dapp-kit'

interface Platform {
    id: string
    name: string
    logo?: string
    allocation: number // percentage
    apy: number
    apyContribution: number // weighted contribution to total APY
    yieldType: 'lending' | 'lp' | 'staking' | 'emissions' | 'structured'
    risk: 'low' | 'medium' | 'high'
    health: 'excellent' | 'good' | 'fair'
    color: string
}

interface StrategyTransparencyProps {
    strategyId: string
    strategyName: string
    platforms: Platform[]
}

// Mock user allocation data - will be replaced with real data
const getUserAllocation = (strategyId: string, platforms: Platform[]) => {
    // Simulate user having funds in this strategy
    return platforms.map(platform => ({
        ...platform,
        userAllocation: platform.allocation * 0.8, // User's funds follow strategy allocation
    }))
}

export function StrategyTransparency({ strategyId, strategyName, platforms }: StrategyTransparencyProps) {
    const account = useCurrentAccount()
    const { data: positions } = useUserPositions()
    const userPosition = positions?.find(p => p.strategyId === strategyId)
    const hasUserAllocation = !!userPosition && userPosition.amount > 0
    const userAllocation = hasUserAllocation ? getUserAllocation(strategyId, platforms) : null

    const yieldTypeLabels = {
        lending: 'Lending',
        lp: 'LP Fees',
        staking: 'Staking',
        emissions: 'Emissions',
        structured: 'Structured',
    }

    const healthColors = {
        excellent: 'text-green-600',
        good: 'text-blue-600',
        fair: 'text-yellow-600',
    }

    const healthIcons = {
        excellent: CheckCircle2,
        good: Activity,
        fair: AlertCircle,
    }

    // Prepare data for pie chart
    const chartData = platforms.map(p => ({
        name: p.name,
        value: p.allocation,
        color: p.color,
    }))

    return (
        <Card className="border-black/10 mt-4 w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-transparent bg-clip-text bg-brand-gradient" />
                    Underlying Platforms & Allocation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Platform Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {platforms.map((platform) => {
                        const HealthIcon = healthIcons[platform.health]
                        return (
                            <Card
                                key={platform.id}
                                className="border-black/10 hover:shadow-suinergy-md transition-all duration-200"
                            >
                                <CardContent className="pt-6">
                                    {/* Platform Logo/Name */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">
                                            {platform.logo || platform.name.charAt(0)}
                                        </div>
                                        <HealthIcon className={`w-4 h-4 ${healthColors[platform.health]}`} />
                                    </div>

                                    {/* Platform Name */}
                                    <div className="font-semibold text-black mb-1">{platform.name}</div>

                                    {/* Allocation Percentage */}
                                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-brand-gradient mb-2">
                                        {platform.allocation}%
                                    </div>

                                    {/* APY Contribution */}
                                    <div className="flex items-center justify-between text-sm mb-3">
                                        <span className="text-muted-foreground">APY Contribution</span>
                                        <span className="font-semibold text-black">{platform.apyContribution.toFixed(2)}%</span>
                                    </div>

                                    {/* Yield Type Badge */}
                                    <Badge variant="secondary" className="mb-3 w-full justify-center">
                                        {yieldTypeLabels[platform.yieldType]}
                                    </Badge>

                                    {/* Platform APY */}
                                    <div className="text-xs text-muted-foreground">
                                        Platform APY: <span className="font-medium text-black">{platform.apy}%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Allocation Visualization */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-black/10 bg-[#f4f3f0]">
                        <CardHeader>
                            <CardTitle className="text-base">Strategy Allocation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                        animationDuration={500}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                        }}
                                        formatter={(value: number, name: string, props: any) => [
                                            `${value}%`,
                                            props.payload.name
                                        ]}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value) => <span className="text-xs text-black">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* User Allocation Panel */}
                    {hasUserAllocation && userAllocation && (
                        <Card className="border-black/10 bg-white">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Target className="w-4 h-4 text-transparent bg-clip-text bg-brand-gradient" />
                                    Your Allocation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {userAllocation.map((platform) => (
                                        <div key={platform.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: platform.color }} />
                                                    <span className="text-sm font-medium text-black">{platform.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-semibold text-black">{platform.userAllocation.toFixed(1)}%</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        ${((userPosition!.amount * platform.userAllocation) / 100).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-1.5 bg-[#f4f3f0] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full transition-all duration-500"
                                                    style={{
                                                        width: `${platform.userAllocation}%`,
                                                        background: `linear-gradient(to right, ${platform.color}, ${platform.color}dd)`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <Separator className="my-3" />
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-sm text-muted-foreground">Total Position</span>
                                        <span className="text-lg font-bold text-black">
                                            ${userPosition!.amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!hasUserAllocation && (
                        <Card className="border-black/10 bg-[#f4f3f0]">
                            <CardContent className="pt-6 text-center">
                                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                <p className="text-sm text-muted-foreground mb-2">No position in this strategy</p>
                                <p className="text-xs text-muted-foreground">
                                    Deposit to see your allocation breakdown
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Strategy Mechanics Info */}
                <Card className="border-black/10 bg-[#f4f3f0]">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Info className="w-4 h-4 text-transparent bg-clip-text bg-brand-gradient" />
                            Active Strategy Mechanics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="font-semibold text-black mb-1">Auto-Compounding</div>
                                    <div className="text-sm text-muted-foreground">
                                        Rewards are automatically reinvested to maximize compound growth
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center flex-shrink-0">
                                    <RefreshCw className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="font-semibold text-black mb-1">Periodic Rebalancing</div>
                                    <div className="text-sm text-muted-foreground">
                                        Positions are rebalanced when yields shift to maintain optimal allocation
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="font-semibold text-black mb-1">Yield Harvesting</div>
                                    <div className="text-sm text-muted-foreground">
                                        Emissions and fees are harvested and distributed across platforms
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center flex-shrink-0">
                                    <Target className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <div className="font-semibold text-black mb-1">Target Allocation</div>
                                    <div className="text-sm text-muted-foreground">
                                        Strategy maintains target allocations to stabilize APY performance
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    )
}

