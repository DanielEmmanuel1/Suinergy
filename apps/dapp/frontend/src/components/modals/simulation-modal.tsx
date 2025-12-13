'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

interface SimulationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    amount: string
    strategyId: string | null
}

const mockProjectionData = [
    { week: 1, conservative: 1000, optimistic: 1000 },
    { week: 4, conservative: 1040, optimistic: 1050 },
    { week: 8, conservative: 1080, optimistic: 1100 },
    { week: 12, conservative: 1120, optimistic: 1160 },
    { week: 16, conservative: 1160, optimistic: 1220 },
    { week: 20, conservative: 1200, optimistic: 1280 },
    { week: 24, conservative: 1240, optimistic: 1350 },
    { week: 52, conservative: 1360, optimistic: 1500 },
]

export function SimulationModal({ open, onOpenChange, amount, strategyId }: SimulationModalProps) {
    const principal = parseFloat(amount) || 0
    const apy = 12.5
    const apr = 11.8
    const fee = 0.1
    const weeklyReturn = (apy / 52) * (1 - fee / 100)

    const projectedData = mockProjectionData.map((point) => ({
        week: point.week,
        conservative: principal * (point.conservative / 1000),
        optimistic: principal * (point.optimistic / 1000),
    }))

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Allocation Simulation</DialogTitle>
                    <DialogDescription>
                        Projected returns and scenarios for your allocation
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="bg-[#FFFFFF]">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="projections">Projections</TabsTrigger>
                            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="border-black/10">
                                    <CardHeader>
                                        <CardTitle className="text-sm text-muted-foreground">Principal</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-black">
                                            ${principal.toLocaleString()}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-black/10">
                                    <CardHeader>
                                        <CardTitle className="text-sm text-muted-foreground">Weighted APY</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-transparent bg-clip-text bg-brand-gradient">{apy}%</div>
                                    </CardContent>
                                </Card>
                                <Card className="border-black/10">
                                    <CardHeader>
                                        <CardTitle className="text-sm text-muted-foreground">First Week Return</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-black">
                                            ${(principal * weeklyReturn).toFixed(2)}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-black/10">
                                    <CardHeader>
                                        <CardTitle className="text-sm text-muted-foreground">Fee Overhead</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-black">{fee}%</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="projections" className="space-y-4">
                            <Card className="border-black/10">
                                <CardHeader>
                                    <CardTitle>52-Week Projection</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={projectedData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#000000/10" />
                                            <XAxis dataKey="week" stroke="#000000/60" />
                                            <YAxis stroke="#000000/60" />
                                            <RechartsTooltip
                                                contentStyle={{
                                                    backgroundColor: '#FFFFFF',
                                                    border: '1px solid rgba(0,0,0,0.1)',
                                                    borderRadius: '0.5rem',
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="conservative"
                                                stroke="#000000"
                                                strokeWidth={2}
                                                name="Conservative"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="optimistic"
                                                stroke="#1055C9"
                                                strokeWidth={2}
                                                name="Optimistic"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="scenarios" className="space-y-4">
                            <div className="grid gap-4">
                                <Card className="border-black/20">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <span className="text-black">Conservative</span>
                                            <Badge variant="outline">#000000-forward</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-muted-foreground">
                                            Based on current APR with minimal compounding. Estimated return: $
                                            {(principal * 1.36).toLocaleString()}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-brand-gradient border-transparent">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <span className="text-white">Optimistic</span>
                                            <Badge variant="default" className="bg-white/20 text-white">
                                                #brand-gradient
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-white/90">
                                            Based on full APY with optimal compounding. Estimated return: $
                                            {(principal * 1.5).toLocaleString()}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    )
}

