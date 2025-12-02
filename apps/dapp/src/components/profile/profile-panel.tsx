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

    const totalAllocations = useMemo(() => {
        return positions.map((pos) => ({
            strategy: pos.strategyName,
            amount: pos.amount,
            apy: pos.apy,
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
                                totalAllocations.map((allocation, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-[#f4f3f0] border border-black/10"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-black break-words">{allocation.strategy}</div>
                                            <div className="text-sm text-muted-foreground">
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
                                ))
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

