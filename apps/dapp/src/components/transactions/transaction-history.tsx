'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, ArrowUpRight, ArrowDownRight, TrendingUp, ExternalLink, ArrowDownCircle, ArrowUpCircle, Coins, Gift } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export interface Transaction {
    id: string
    type: 'deposit' | 'withdrawal' | 'earnings' | 'claim'
    amount: number
    token: string
    strategyId?: string
    strategyName?: string
    txHash?: string
    timestamp: Date
    status: 'pending' | 'completed' | 'failed'
}

interface TransactionHistoryProps {
    transactions: Transaction[]
    showStrategy?: boolean
}

export function TransactionHistory({ transactions, showStrategy = true }: TransactionHistoryProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }

    const getTypeIcon = (type: Transaction['type']) => {
        switch (type) {
            case 'deposit':
                return <ArrowDownCircle className="w-5 h-5 text-white" />
            case 'withdrawal':
                return <ArrowUpCircle className="w-5 h-5 text-black" />
            case 'earnings':
                return <Coins className="w-5 h-5 text-white" />
            case 'claim':
                return <Gift className="w-5 h-5 text-white" />
        }
    }

    const getTypeColor = (type: Transaction['type']) => {
        switch (type) {
            case 'deposit':
                return 'bg-brand-gradient'
            case 'withdrawal':
                return 'bg-white border border-black/20'
            case 'earnings':
                return 'bg-brand-gradient'
            case 'claim':
                return 'bg-brand-gradient'
        }
    }

    const getStatusBadge = (status: Transaction['status']) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="text-xs">Pending</Badge>
            case 'completed':
                return <Badge variant="default" className="text-xs bg-green-500">Completed</Badge>
            case 'failed':
                return <Badge variant="destructive" className="text-xs">Failed</Badge>
        }
    }

    if (transactions.length === 0) {
        return (
            <Card className="border-black/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Transaction History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No transactions yet</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-black/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Transaction History
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {transactions.map((tx) => (
                        <div
                            key={tx.id}
                            className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-[#f4f3f0] hover:bg-[#f4f3f0]/80 transition-colors"
                        >
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(tx.type)}`}>
                                    {getTypeIcon(tx.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="font-semibold text-black capitalize text-sm sm:text-base">
                                            {tx.type}
                                        </span>
                                        {getStatusBadge(tx.status)}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                                        <span className="font-medium text-black">
                                            {formatCurrency(tx.amount)} {tx.token}
                                        </span>
                                        {showStrategy && tx.strategyName && (
                                            <>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="truncate max-w-[150px] sm:max-w-none">{tx.strategyName}</span>
                                            </>
                                        )}
                                        <span className="hidden sm:inline">•</span>
                                        <span>{formatDistanceToNow(tx.timestamp, { addSuffix: true })}</span>
                                    </div>
                                </div>
                            </div>
                            {tx.txHash && (
                                <a
                                    href={`https://suiscan.xyz/mainnet/tx/${tx.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-4 text-muted-foreground hover:text-black transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

