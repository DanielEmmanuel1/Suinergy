'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ChainId, getAdapter, registerAdapter } from '@/wallets'
import { suiAdapter } from '@/wallets/sui/adapter'
import { AvalancheWalletAdapter } from '@/wallets/avalanche/adapter'
import { SolanaWalletAdapter } from '@/wallets/solana/adapter'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Strategy } from '@/lib/chain-interface'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Quick registration of adapters (in a real app, do this in a provider)
registerAdapter(ChainId.SUI, suiAdapter)
registerAdapter(ChainId.AVALANCHE, new AvalancheWalletAdapter())
registerAdapter(ChainId.SOLANA, new SolanaWalletAdapter())

export default function StrategiesPage() {
    const params = useParams()
    const chainId = params.chainId as string
    const [strategies, setStrategies] = useState<Strategy[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStrategies() {
            try {
                setLoading(true)
                // Map string param to ChainId enum if possible
                const adapter = getAdapter(chainId as ChainId)
                const api = adapter.getChainAPI()
                const data = await api.getStrategies()
                setStrategies(data)
            } catch (e: any) {
                console.error(e)
                setError(e.message || 'Failed to load strategies')
            } finally {
                setLoading(false)
            }
        }

        if (chainId) {
            fetchStrategies()
        }
    }, [chainId])

    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/markets">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight capitalize">{chainId} Strategies</h1>
                    <p className="text-muted-foreground">
                        Explore and deposit into yield strategies on {chainId}.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
                    ))}
                </div>
            ) : error ? (
                <div className="p-10 border border-destructive/20 rounded-xl bg-destructive/5 text-destructive text-center">
                    <p>{error}</p>
                    <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
                </div>
            ) : strategies.length === 0 ? (
                <div className="p-20 text-center border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground">No strategies found for this network yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {strategies.map((strategy) => (
                        <Card key={strategy.id} className="hover:border-primary/50 transition-all">
                            <CardHeader>
                                <div className="flex justify-between">
                                    <CardTitle>{strategy.name}</CardTitle>
                                    <Badge variant="outline" className="uppercase">{strategy.chain}</Badge>
                                </div>
                                {/* <CardDescription>Protocol: {strategy.protocol}</CardDescription> */}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-muted-foreground">APY</span>
                                        <span className="text-2xl font-bold text-green-500">{strategy.apy}%</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm text-muted-foreground">TVL</span>
                                        <span className="font-medium">${strategy.tvl.toLocaleString()}</span>
                                    </div>
                                </div>
                                <Button className="w-full">Deposit</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
