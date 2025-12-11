import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Activity, Lock, Layers } from 'lucide-react'

const CHAINS = [
    {
        id: 'sui',
        name: 'Sui Network',
        description: 'High-performance L1 with instant finality.',
        status: 'active',
        tvl: '$12.5M',
        strategies: 4,
    },
    {
        id: 'avalanche',
        name: 'Avalanche',
        description: 'Scalable implementation of the EVM.',
        status: 'coming_soon',
        tvl: '$0',
        strategies: 0,
    },
    {
        id: 'solana',
        name: 'Solana',
        description: 'High-speed blockchain with low fees.',
        status: 'coming_soon',
        tvl: '$0',
        strategies: 0,
    },
]

export default function MarketsPage() {
    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight">Markets</h1>
                <p className="text-muted-foreground text-lg">
                    Select a network to view available yield strategies.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CHAINS.map((chain) => (
                    <Card key={chain.id} className="group relative overflow-hidden border-muted-foreground/20 hover:border-primary/50 transition-all duration-300">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-2xl">{chain.name}</CardTitle>
                                <Badge variant={chain.status === 'active' ? 'default' : 'secondary'}>
                                    {chain.status === 'active' ? 'Active' : 'Coming Soon'}
                                </Badge>
                            </div>
                            <CardDescription className="pt-2">{chain.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground font-medium uppercase">TVL</span>
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-primary" />
                                        <span className="font-semibold">{chain.tvl}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground font-medium uppercase">Strategies</span>
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-primary" />
                                        <span className="font-semibold">{chain.strategies}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                {chain.status === 'active' ? (
                                    <Link href={`/markets/${chain.id}/strategies`} className="w-full">
                                        <Button className="w-full group-hover:bg-primary/90 transition-colors">
                                            View Strategies
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button disabled variant="outline" className="w-full opacity-50 cursor-not-allowed">
                                        Coming Soon
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
