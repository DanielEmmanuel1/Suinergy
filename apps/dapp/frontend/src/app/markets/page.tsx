'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { ChainTile } from '@/components/markets/chain-tile'
import { SUPPORTED_CHAINS } from '@/config/chains'
import { TabbedContainer } from '@/components/ui/tabbed-container'

export default function MarketsPage() {
    return (
        <MainLayout>
            <div className="space-y-6">
                <TabbedContainer
                    label="Markets"
                    className="w-full"
                    tabClassName="bg-white"
                    contentClassName="bg-white"
                >
                    <div className="text-left mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2 font-heading">
                            Markets
                        </h1>
                        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl">
                            Explore yield opportunities across supported blockchains. Select a chain to view available vaults.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {SUPPORTED_CHAINS.map((chain) => (
                            <div key={chain.id} className="h-64">
                                <ChainTile chain={chain} />
                            </div>
                        ))}
                    </div>
                </TabbedContainer>
            </div>
        </MainLayout>
    )
}
