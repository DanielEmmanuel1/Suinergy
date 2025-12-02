'use client'

import { useMemo } from 'react'
import { User, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TabbedContainer } from '@/components/ui/tabbed-container'
import { TransactionHistory, Transaction } from '@/components/transactions/transaction-history'
import { useCurrentAccount } from '@mysten/dapp-kit'

// Mock data - will be replaced with real data hooks
const mockProfile = {
    totalDeposits: 15000,
    totalWithdrawals: 5000,
    netPosition: 10000,
    totalEarned: 1250,
    activeStrategies: 3,
    totalAllocations: [
        { strategy: 'USDC Liquidity', amount: 5000, apy: 12.5 },
        { strategy: 'SUI Staking', amount: 10000, apy: 8.2 },
        { strategy: 'Leveraged Yield', amount: 2000, apy: 18.5 },
    ],
}

export function ProfilePanel() {
    const account = useCurrentAccount()

    // Mock all transactions across all strategies
    const allTransactions: Transaction[] = useMemo(() => [
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
                <div className="text-left mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 font-heading">Account Profile</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl">
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
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="border-black/10">
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">Total Deposits</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">
                                {formatCurrency(mockProfile.totalDeposits)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-black/10">
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">Total Withdrawals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-black">
                                {formatCurrency(mockProfile.totalWithdrawals)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-brand-gradient border-transparent">
                        <CardHeader>
                            <CardTitle className="text-sm text-white/80">Net Position</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {formatCurrency(mockProfile.netPosition)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-black/10">
                        <CardHeader>
                            <CardTitle className="text-sm text-muted-foreground">Total Earned</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-transparent bg-clip-text bg-brand-gradient">
                                {formatCurrency(mockProfile.totalEarned)}
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
                            {mockProfile.totalAllocations.map((allocation, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 rounded-xl bg-[#f4f3f0] border border-black/10"
                                >
                                    <div>
                                        <div className="font-semibold text-black">{allocation.strategy}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatCurrency(allocation.amount)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-transparent bg-clip-text bg-brand-gradient">{allocation.apy}% APY</div>
                                        <Badge variant="default" className="mt-1">
                                            Active
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction History */}
                <TransactionHistory transactions={allTransactions} showStrategy={true} />
            </TabbedContainer>
        </div>
    )
}

