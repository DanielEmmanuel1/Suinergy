'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, ExternalLink, ArrowDownCircle, ArrowUpCircle, Coins, Gift, Filter, Search, ChevronLeft, ChevronRight, X, SlidersHorizontal } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

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
    // Filter states
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [strategyFilter, setStrategyFilter] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [showFilters, setShowFilters] = useState(true)

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Get unique strategies for filter dropdown
    const uniqueStrategies = useMemo(() => {
        const strategies = new Set<string>()
        transactions.forEach(tx => {
            if (tx.strategyName) strategies.add(tx.strategyName)
        })
        return Array.from(strategies).sort()
    }, [transactions])

    // Apply filters
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            if (typeFilter !== 'all' && tx.type !== typeFilter) return false
            if (strategyFilter !== 'all' && tx.strategyName !== strategyFilter) return false
            if (searchQuery && tx.txHash && !tx.txHash.toLowerCase().includes(searchQuery.toLowerCase())) return false
            return true
        })
    }, [transactions, typeFilter, strategyFilter, searchQuery])

    // Apply pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return filteredTransactions.slice(startIndex, startIndex + itemsPerPage)
    }, [filteredTransactions, currentPage, itemsPerPage])

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1)
    }, [typeFilter, strategyFilter, searchQuery, itemsPerPage])

    const hasActiveFilters = typeFilter !== 'all' || strategyFilter !== 'all' || searchQuery

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
                return 'bg-white dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#121212] border border-black/20 dark:border-white/10'
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
                return <Badge variant="default" className="text-xs bg-brand-gradient border-none">Completed</Badge>
            case 'failed':
                return <Badge variant="destructive" className="text-xs">Failed</Badge>
        }
    }

    const clearAllFilters = () => {
        setTypeFilter('all')
        setStrategyFilter('all')
        setSearchQuery('')
    }

    return (
        <Card className="border-black/10 overflow-hidden">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-[#1055C9]/5 to-transparent p-6 border-b border-black/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-brand-gradient">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Transaction History</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
                                {hasActiveFilters && ` (filtered from ${transactions.length})`}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "gap-2 transition-all",
                            showFilters && "bg-brand-gradient text-white border-transparent"
                        )}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </Button>
                </div>
            </div>

            <CardContent className="p-6">
                {/* Collapsible Filter Section */}
                {showFilters && (
                    <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-[#f4f3f0] to-white border border-black/5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <h3 className="font-semibold text-black">Filter Transactions</h3>
                            </div>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="h-8 gap-2 text-muted-foreground hover:text-black"
                                >
                                    <X className="w-3 h-3" />
                                    Clear all
                                </Button>
                            )}
                        </div>

                        {/* Filter Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Type Filter */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Transaction Type
                                </label>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="h-11 bg-white dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#121212] border-black/10 dark:border-white/10 hover:border-[#1055C9]/30 transition-colors dark:text-white">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="deposit">Deposits</SelectItem>
                                        <SelectItem value="withdrawal">Withdrawals</SelectItem>
                                        <SelectItem value="earnings">Earnings</SelectItem>
                                        <SelectItem value="claim">Claims</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Strategy Filter */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Strategy
                                </label>
                                <Select value={strategyFilter} onValueChange={setStrategyFilter}>
                                    <SelectTrigger className="h-11 bg-white dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#121212] border-black/10 dark:border-white/10 hover:border-[#1055C9]/30 transition-colors dark:text-white">
                                        <SelectValue placeholder="All strategies" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Strategies</SelectItem>
                                        {uniqueStrategies.map(strategy => (
                                            <SelectItem key={strategy} value={strategy}>{strategy}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Search */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Search Hash
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="0x..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-11 pl-10 bg-white dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#121212] border-black/10 dark:border-white/10 hover:border-[#1055C9]/30 transition-colors dark:text-white dark:placeholder:text-white/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Active Filter Tags */}
                        {hasActiveFilters && (
                            <div className="mt-4 pt-4 border-t border-black/5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
                                    {typeFilter !== 'all' && (
                                        <Badge variant="secondary" className="gap-1">
                                            Type: {typeFilter}
                                            <X className="w-3 h-3 cursor-pointer" onClick={() => setTypeFilter('all')} />
                                        </Badge>
                                    )}
                                    {strategyFilter !== 'all' && (
                                        <Badge variant="secondary" className="gap-1">
                                            Strategy: {strategyFilter}
                                            <X className="w-3 h-3 cursor-pointer" onClick={() => setStrategyFilter('all')} />
                                        </Badge>
                                    )}
                                    {searchQuery && (
                                        <Badge variant="secondary" className="gap-1">
                                            Search: {searchQuery.slice(0, 10)}...
                                            <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Transactions List */}
                {paginatedTransactions.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#f4f3f0] to-white flex items-center justify-center">
                            <Clock className="w-10 h-10 text-muted-foreground opacity-50" />
                        </div>
                        <p className="text-muted-foreground font-medium">
                            {filteredTransactions.length === 0 && transactions.length > 0
                                ? 'No transactions match your filters'
                                : 'No transactions yet'}
                        </p>
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearAllFilters}
                                className="mt-4"
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Transaction Cards */}
                        <div className="space-y-3 mb-6">
                            {paginatedTransactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="group relative p-4 rounded-xl bg-gradient-to-br from-white to-[#f4f3f0]/30 border border-black/5 hover:border-[#1055C9]/30 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Left: Icon + Details */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200",
                                                getTypeColor(tx.type)
                                            )}>
                                                {getTypeIcon(tx.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="font-semibold text-black capitalize text-base">
                                                        {tx.type}
                                                    </span>
                                                    {getStatusBadge(tx.status)}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                                    <span className="font-semibold text-black">
                                                        {formatCurrency(tx.amount)} {tx.token}
                                                    </span>
                                                    {showStrategy && tx.strategyName && (
                                                        <>
                                                            <span className="hidden sm:inline text-black/20">•</span>
                                                            <span className="truncate max-w-[200px]">{tx.strategyName}</span>
                                                        </>
                                                    )}
                                                    <span className="hidden sm:inline text-black/20">•</span>
                                                    <span className="text-xs">{formatDistanceToNow(tx.timestamp, { addSuffix: true })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: External Link */}
                                        {tx.txHash && (
                                            <a
                                                href={`https://suiscan.xyz/mainnet/tx/${tx.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg hover:bg-[#f4f3f0] text-muted-foreground hover:text-black transition-colors"
                                                title="View on explorer"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Enhanced Pagination */}
                        {filteredTransactions.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-black/5">
                                {/* Items per page */}
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground font-medium">Rows per page:</span>
                                    <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                                        <SelectTrigger className="w-20 h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Page info and navigation */}
                                <div className="flex items-center gap-6">
                                    <span className="text-sm text-muted-foreground font-medium">
                                        {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="h-9 w-9 p-0"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f4f3f0] border border-black/5">
                                            <span className="text-sm font-semibold text-black">{currentPage}</span>
                                            <span className="text-sm text-muted-foreground">of {totalPages}</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="h-9 w-9 p-0"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
