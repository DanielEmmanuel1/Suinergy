'use client'

import { useMemo } from 'react'
import { User, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TabbedContainer } from '@/components/ui/tabbed-container'
import { TransactionHistory, Transaction } from '@/components/transactions/transaction-history'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useTransactions } from '@/hooks/use-transactions'
import { useUserPositions } from '@/hooks/use-user-positions'

// Import strategy data function (same as in strategy detail page)
const getStrategyData = (id: string) => {
    const strategies: Record<string, any> = {
        '1': {
            id: '1',
            name: 'USDC Liquidity Pool',
            platforms: [
                { id: 'scallop', name: 'Scallop', allocation: 35, color: '#1565c0' },
                { id: 'cetus', name: 'Cetus', allocation: 30, color: '#b92b27' },
                { id: 'lst', name: 'LST Staking', allocation: 25, color: '#8b5cf6' },
                { id: 'kriya', name: 'Kriya', allocation: 10, color: '#10b981' },
            ],
        },
        '2': {
            id: '2',
            name: 'SUI Staking',
            platforms: [
                { id: 'lst', name: 'LST Staking', allocation: 60, color: '#8b5cf6' },
                { id: 'scallop', name: 'Scallop', allocation: 25, color: '#1565c0' },
                { id: 'cetus', name: 'Cetus', allocation: 15, color: '#b92b27' },
            ],
        },
        '3': {
            id: '3',
            name: 'Leveraged Yield Farming',
            platforms: [
                { id: 'kriya', name: 'Kriya', allocation: 40, color: '#10b981' },
                { id: 'cetus', name: 'Cetus', allocation: 35, color: '#b92b27' },
                { id: 'scallop', name: 'Scallop', allocation: 15, color: '#1565c0' },
                { id: 'emissions', name: 'Emissions', allocation: 10, color: '#f59e0b' },
            ],
        },
    }
    return strategies[id] || strategies['1']
}

export function ProfilePanel() {
    const account = useCurrentAccount()
    const { data: transactions = [] } = useTransactions()
    const { data: positions = [] } = useUserPositions()

    // Calculate totals from real positions
    const totalDeposits = useMemo(() => {
        return positions.reduce((sum, pos) => sum + pos.amount, 0)
    }, [positions])

    const totalWithdrawals = useMemo(() => {
        return transactions
            .filter((tx) => tx.type === 'withdrawal')
            .reduce((sum, tx) => sum + tx.amount, 0)
    }, [transactions])

    const netPosition = totalDeposits - totalWithdrawals

    const totalEarned = useMemo(() => {
        return transactions
            .filter((tx) => tx.type === 'earnings' || tx.type === 'claim')
            .reduce((sum, tx) => sum + tx.amount, 0)
    }, [transactions])

    // Filter out $0 positions and show individual positions (not aggregated)
    // Each position represents a separate deposit that may be diversified differently
    const totalAllocations = useMemo(() => {
        return positions
            .filter((pos) => pos.amount > 0) // Filter out $0 positions
            .map((pos, index) => ({
                id: `${pos.strategyId}-${index}`, // Unique ID for each position
                strategy: pos.strategyName,
                strategyId: pos.strategyId,
                amount: pos.amount,
                apy: pos.apy,
                receiptTokenBalance: pos.receiptTokenBalance,
            }))
    }, [positions])

    // Use real transactions instead of mock
    const allTransactions: Transaction[] = transactions

    // Mock profile data structure for compatibility (using real data where available)
    const mockProfile = {
        totalDeposits,
        totalWithdrawals,
        netPosition,
        totalEarned,
        activeStrategies: positions.length,
        totalAllocations,
    }

    // Mock all transactions across all strategies (fallback if no real data)
    const mockTransactions: Transaction[] = useMemo(() => [
        {
            id: '1',
            type: 'deposit',
            amount: 5000,
            token: 'USDC',
            strategyId: '1',
            strategyName: 'USDC Liquidity Pool',
            txHash: '0x1234567890abcdef',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            status: 'completed',
        },
        {
            id: '2',
            type: 'earnings',
            amount: 125.50,
            token: 'SUI',
            strategyId: '2',
            strategyName: 'SUI Staking',
            txHash: '0xabcdef1234567890',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            status: 'completed',
        },
        {
            id: '3',
            type: 'withdrawal',
            amount: 2000,
            token: 'SUI',
            strategyId: '2',
            strategyName: 'SUI Staking',
            txHash: '0x9876543210fedcba',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            status: 'completed',
        },
        {
            id: '4',
            type: 'deposit',
            amount: 10000,
            token: 'SUI',
            strategyId: '2',
            strategyName: 'SUI Staking',
            txHash: '0x5555555555555555',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            status: 'completed',
        },
        {
            id: '5',
            type: 'deposit',
            amount: 2000,
            token: 'USDT',
            strategyId: '3',
            strategyName: 'Leveraged Yield Farming',
            txHash: '0x4444444444444444',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            status: 'completed',
        },
        {
            id: '6',
            type: 'earnings',
            amount: 37.00,
            token: 'USDC',
            strategyId: '1',
            strategyName: 'USDC Liquidity Pool',
            txHash: '0x3333333333333333',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            status: 'completed',
        },
    ], [])

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    return (
        <div className="space-y-6">
            <TabbedContainer
                label="Profile"
                className="w-full"
                tabClassName="bg-white"
                contentClassName="bg-white"
            >
                <div className="text-left mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 font-heading">Account Profile</h2>
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl">
                        Your account overview and activity history
                    </p>
                </div>

                {/* Account Info */}
                <Card className="mb-6 border-black/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Wallet Address</span>
                                <span className="font-mono text-sm text-black">
                                    {account?.address.slice(0, 8)}...{account?.address.slice(-6)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Network</span>
                                <Badge variant="secondary">Sui Testnet</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Portfolio Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="border-black/10">
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">Total Deposits</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">
                                {formatCurrency(totalDeposits)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-black/10">
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">Total Withdrawals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">
                                {formatCurrency(totalWithdrawals)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-brand-gradient border-transparent">
                        <CardHeader>
                            <CardTitle className="text-sm text-white/80">Net Position</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {formatCurrency(netPosition)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-black/10">
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">Total Earned</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-transparent bg-clip-text bg-brand-gradient">
                                {formatCurrency(totalEarned)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Allocations */}
                <Card className="mb-6 border-black/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Active Allocations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {totalAllocations.length > 0 ? (
                                totalAllocations.map((allocation) => {
                                    // Get strategy data to show platform breakdown
                                    const strategyIdMap: Record<string, string> = {
                                        'usdc-liquidity': '1',
                                        'usdc-liquidity-pool': '1',
                                        'sui-staking': '2',
                                        'usdt-liquidity': '3',
                                    }
                                    const pageId = strategyIdMap[allocation.strategyId] || '1'
                                    const strategyData = getStrategyData(pageId)
                                    
                                    return (
                                        <div
                                            key={allocation.id}
                                            className="p-4 rounded-xl bg-[#f4f3f0] border border-black/10 space-y-3"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-black break-words mb-1">{allocation.strategy}</div>
                                                    <div className="text-lg font-bold text-black">
                                                        {formatCurrency(allocation.amount)}
                                                    </div>
                                                </div>
                                                <div className="text-left sm:text-right flex-shrink-0">
                                                    <div className="font-semibold text-transparent bg-clip-text bg-brand-gradient">{allocation.apy}% APY</div>
                                                    <Badge variant="default" className="mt-1">
                                                        Active
                                                    </Badge>
                                                </div>
                                            </div>
                                            
                                            {/* Platform Breakdown */}
                                            {strategyData?.platforms && (
                                                <div className="pt-3 border-t border-black/10">
                                                    <div className="text-xs text-muted-foreground mb-2">Diversified across:</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {strategyData.platforms.map((platform: any) => {
                                                            const platformAmount = (platform.allocation / 100) * allocation.amount
                                                            return (
                                                                <div
                                                                    key={platform.id}
                                                                    className="flex items-center gap-2 px-2 py-1 rounded-md bg-white border border-black/10"
                                                                    title={`${platform.name}: ${platform.allocation}% (${formatCurrency(platformAmount)})`}
                                                                >
                                                                    <div
                                                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                                                        style={{ backgroundColor: platform.color }}
                                                                    />
                                                                    <span className="text-xs font-medium text-black">{platform.name}</span>
                                                                    <span className="text-xs text-muted-foreground">{platform.allocation}%</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No active positions</p>
                                    <p className="text-sm mt-2">Deposit into a strategy to see your allocations here</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction History */}
                <TransactionHistory 
                    transactions={allTransactions.length > 0 ? allTransactions : mockTransactions} 
                    showStrategy={true} 
                />
            </TabbedContainer>
        </div>
    )
}

