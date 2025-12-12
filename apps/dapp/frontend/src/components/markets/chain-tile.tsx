'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ChainConfig } from '@/config/chains'
import { cn } from '@/lib/utils'

interface ChainTileProps {
    chain: ChainConfig
}

export function ChainTile({ chain }: ChainTileProps) {
    return (
        <Link href={`/markets/${chain.id}`} className="block h-full group">
            <Card className="h-full border-black/10 transition-all duration-300 hover:shadow-lg hover:border-brand-gradient/50 hover:translate-y-[-4px] overflow-hidden relative">
                <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br", chain.color)} />

                <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold bg-gradient-to-br shadow-md", chain.color)}>
                            {chain.name.charAt(0)}
                        </div>
                        <div className="bg-secondary/50 rounded-full p-2 group-hover:bg-brand-gradient group-hover:text-white transition-colors">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-brand-gradient transition-all">
                        {chain.name}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                        {chain.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs">Strategies</span>
                            <span>{chain.strategies.length} Active</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs">Total TVL</span>
                            <span>${(chain.strategies.reduce((acc, s) => acc + s.tvl, 0) / 1000000).toFixed(1)}M</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
