'use client'

import { User, Wallet, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TabbedContainer } from '@/components/ui/tabbed-container'
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
    transactionHistory: [
        { type: 'deposit', amount: 5000, strategy: 'USDC Liquidity', timestamp: '2h ago', status: 'completed' },
        { type: 'withdrawal', amount: 2000, strategy: 'SUI Staking', timestamp: '1d ago', status: 'completed' },
        { type: 'deposit', amount: 10000, strategy: 'SUI Staking', timestamp: '3d ago', status: 'completed' },
    ],
}

export function ProfilePanel() {
    const account = useCurrentAccount()

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
                <Card className="border-black/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Transaction History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {mockProfile.transactionHistory.map((tx, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg bg-[#f4f3f0]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                tx.type === 'deposit'
                                                    ? 'bg-brand-gradient'
                                                    : 'bg-white border border-black/20'
                                            }`}
                                        >
                                            <Wallet
                                                className={`w-5 h-5 ${
                                                    tx.type === 'deposit' ? 'text-white' : 'text-black'
                                                }`}
                                            />
                                        </div>
                                        <div>
                                            <div className="font-medium text-black capitalize">
                                                {tx.type} - {tx.strategy}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{tx.timestamp}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div
                                            className={`font-semibold ${
                                                tx.type === 'deposit' ? 'text-transparent bg-clip-text bg-brand-gradient' : 'text-black'
                                            }`}
                                        >
                                            {tx.type === 'deposit' ? '+' : '-'}
                                            {formatCurrency(tx.amount)}
                                        </div>
                                        <Badge variant="secondary" className="mt-1 text-xs">
                                            {tx.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabbedContainer>
        </div>
    )
}

