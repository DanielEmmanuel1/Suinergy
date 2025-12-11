'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { StrategyList } from '@/components/strategies/strategy-list'

export default function StrategiesPage() {
    return (
        <MainLayout>
            <StrategyList />
        </MainLayout>
    )
}

