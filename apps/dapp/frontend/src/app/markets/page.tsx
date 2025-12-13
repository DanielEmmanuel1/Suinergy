'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { ChainTile } from '@/components/markets/chain-tile'
import { ChainListItem } from '@/components/markets/chain-list-item'
import { SUPPORTED_CHAINS } from '@/config/chains'
import { TabbedContainer } from '@/components/ui/tabbed-container'
import { Button } from '@/components/ui/button'
import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MarketsPage() {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

    return (
        <MainLayout>
            <div className="space-y-6">
                <TabbedContainer
                    label="Markets"
                    className="w-full"
                    tabClassName="bg-white dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#121212] dark:bg-gradient-to-r dark:from-[#1a1a1a] dark:to-[#121212]"
                    contentClassName="bg-white dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#121212] dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#121212]"
                >
                    <div className="flex items-start justify-between mb-6 sm:mb-8 gap-4">
                        <div className="text-left flex-1">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2 font-heading">
                                Markets
                            </h1>
                            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground dark:text-white/70 max-w-2xl">
                                Explore yield opportunities across supported blockchains. Select a chain to view available vaults.
                            </p>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center gap-2 bg-[#f4f3f0] dark:bg-white/5 p-1 rounded-lg">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "gap-2 h-9 transition-all",
                                    viewMode === 'list' && "bg-white dark:bg-white/10 shadow-sm"
                                )}
                            >
                                <List className="w-4 h-4" />
                                <span className="hidden sm:inline">List</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "gap-2 h-9 transition-all",
                                    viewMode === 'grid' && "bg-white dark:bg-white/10 shadow-sm"
                                )}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span className="hidden sm:inline">Grid</span>
                            </Button>
                        </div>
                    </div>

                    {/* List View */}
                    {viewMode === 'list' && (
                        <div className="space-y-4">
                            {SUPPORTED_CHAINS.map((chain) => (
                                <ChainListItem key={chain.id} chain={chain} />
                            ))}
                        </div>
                    )}

                    {/* Grid View */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {SUPPORTED_CHAINS.map((chain) => (
                                <div key={chain.id} className="h-64">
                                    <ChainTile chain={chain} />
                                </div>
                            ))}
                        </div>
                    )}
                </TabbedContainer>
            </div>
        </MainLayout>
    )
}
