'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { StrategyList } from '@/components/strategies/strategy-list'
import { getChainConfig } from '@/config/chains'
import { redirect, useParams } from 'next/navigation'

export default function ChainMarketPage() {
    const params = useParams()
    const chainId = params.chainId as string
    const config = getChainConfig(chainId)

    if (!config) {
        redirect('/markets')
    }

    return (
        <MainLayout>
            <StrategyList
                strategies={config.strategies}
                chainName={config.name}
            />
        </MainLayout>
    )
}
