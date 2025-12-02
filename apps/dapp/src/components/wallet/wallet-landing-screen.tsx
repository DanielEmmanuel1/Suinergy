'use client'

import { useState } from 'react'
import { WalletConnectModal } from './wallet-connect-modal'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

export function WalletLandingScreen() {
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)

    return (
        <div className="min-h-screen bg-[#f4f3f0] flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-2xl">
                {/* Header Section */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-3 sm:mb-4 font-heading leading-tight">
                        Make your assets work for you
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
                        Why just hold when you can{' '}
                        <span className="font-semibold bg-brand-gradient bg-clip-text text-transparent">
                            SUInegize
                        </span>{' '}
                        them?
                    </p>
                </div>

                {/* Main Card with Folder Shape */}
                <div className="relative flex flex-col w-full">
                    {/* Tab Header */}
                    <div className="flex items-end relative z-10 -mb-[1px] ml-px">
                        <div className="bg-white px-6 py-2 rounded-t-xl border-t border-l border-r border-black/10">
                            <span className="text-xs font-bold tracking-wider uppercase font-heading text-black/60">
                                Connect Wallet
                            </span>
                        </div>
                    </div>
                    {/* Content */}
                    <div className="relative z-0 bg-white rounded-b-xl rounded-tr-xl border border-black/10 p-6 sm:p-8 md:p-12">
                        <div className="text-center mb-6 sm:mb-8">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-black mb-2 sm:mb-3 font-heading">
                                Connect wallet to see your portfolio
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                Start earning yield on your Sui assets
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                            <div className="text-center p-4 rounded-lg bg-brand-gradient text-white">
                                <h3 className="text-sm sm:text-base font-semibold mb-1">High Yields</h3>
                                <p className="text-xs sm:text-sm text-white/90">
                                    Maximize returns with optimized strategies
                                </p>
                            </div>

                            <div className="text-center p-4 rounded-lg bg-brand-gradient text-white">
                                <h3 className="text-sm sm:text-base font-semibold mb-1">Auto-Compound</h3>
                                <p className="text-xs sm:text-sm text-white/90">
                                    Earn on your earnings automatically
                                </p>
                            </div>

                            <div className="text-center p-4 rounded-lg bg-brand-gradient text-white">
                                <h3 className="text-sm sm:text-base font-semibold mb-1">Secure</h3>
                                <p className="text-xs sm:text-sm text-white/90">
                                    Your assets, your keys, always
                                </p>
                            </div>
                        </div>

                        {/* Connect Button */}
                        <Button
                            onClick={() => setIsConnectModalOpen(true)}
                            className={cn(
                                "w-full bg-brand-gradient text-white hover:opacity-90",
                                "h-12 sm:h-14 text-base sm:text-lg font-semibold",
                                "rounded-lg shadow-sm transition-all duration-200",
                                "flex items-center justify-center gap-2"
                            )}
                        >
                            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>Connect Wallet</span>
                        </Button>

                        {/* Additional Info */}
                        <p className="text-xs sm:text-sm text-center text-muted-foreground mt-4 sm:mt-6">
                            New to Sui?{' '}
                            <a
                                href="https://sui.io/learn/wallet"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#1055C9] hover:underline font-medium"
                            >
                                Learn how to create a wallet
                            </a>
                        </p>
                    </div>
                </div>

                {/* Wallet Connect Modal */}
                <WalletConnectModal
                    open={isConnectModalOpen}
                    onOpenChange={setIsConnectModalOpen}
                />
            </div>
        </div>
    )
}

