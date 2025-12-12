'use client'

import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ChainConfig } from '@/config/chains'
import { cn } from '@/lib/utils'

interface ChainListItemProps {
    chain: ChainConfig
}

export function ChainListItem({ chain }: ChainListItemProps) {
    return (
        <Link href={`/markets/${chain.id}`} className="block group">
            <Card className="border-black/10 transition-all duration-300 hover:shadow-lg hover:border-brand-gradient/50 overflow-hidden relative">
                <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br", chain.color)} />

                <div className="p-6 flex items-center justify-between gap-6">
                    {/* Left: Logo + Info */}
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-white border border-black/5 shadow-md group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                            <Image
                                src={`/chains/${chain.id}.png`}
                                alt={`${chain.name} logo`}
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-brand-gradient transition-all">
                                {chain.name}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                {chain.description}
                            </p>
                        </div>
                    </div>

                    {/* Right: Stats + Arrow */}
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-6 text-sm font-medium">
                            <div className="flex flex-col items-center">
                                <span className="text-muted-foreground text-xs mb-1">Strategies</span>
                                <span className="text-lg font-bold">{chain.strategies.length} Active</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-muted-foreground text-xs mb-1">Total TVL</span>
                                <span className="text-lg font-bold">${(chain.strategies.reduce((acc, s) => acc + s.tvl, 0) / 1000000).toFixed(1)}M</span>
                            </div>
                        </div>

                        <div className="bg-secondary/50 rounded-full p-3 group-hover:bg-brand-gradient group-hover:text-white transition-colors">
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
