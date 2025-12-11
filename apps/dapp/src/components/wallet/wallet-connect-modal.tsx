'use client'

import { useWallets, useConnectWallet } from '@mysten/dapp-kit'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WalletConnectModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

// Popular wallets (displayed as boxes)
const POPULAR_WALLETS = [
    {
        name: 'Phantom',
        iconUrl: '/phantom.png',
        matchNames: ['phantom']
    },
    {
        name: 'Slush',
        iconUrl: '/slush.png',
        matchNames: ['slush']
    },
    {
        name: 'Surf Wallet',
        iconUrl: '/surf.png',
        matchNames: ['surf']
    },
]

// Other wallets (displayed as compact list)
const OTHER_WALLETS = [
    {
        name: 'Suiet',
        iconUrl: '/suiet.jpg',
        matchNames: ['suiet']
    },
    {
        name: 'OKX Wallet',
        iconUrl: '/okx.png',
        matchNames: ['okx', 'okex']
    },
    {
        name: 'Martian Wallet',
        iconUrl: '/martian.png',
        matchNames: ['martian']
    },
    {
        name: 'Nightly',
        iconUrl: '/nightly.png',
        matchNames: ['nightly']
    },
    {
        name: 'Bitget Wallet',
        iconUrl: '/bitget.png',
        matchNames: ['bitget', 'bitkeep']
    },
    {
        name: 'Backpack',
        iconUrl: '/backpack.png',
        matchNames: ['backpack']
    },
    {
        name: 'Desig',
        iconUrl: '/desig.png',
        matchNames: ['desig']
    },
]

const WALLET_CONFIG = [...POPULAR_WALLETS, ...OTHER_WALLETS]

export function WalletConnectModal({ open, onOpenChange }: WalletConnectModalProps) {
    const { mutate: connect, isPending } = useConnectWallet()
    const wallets = useWallets()
    console.log('Available wallets:', wallets.map(w => w.name))
    const [connectingWallet, setConnectingWallet] = useState<string | null>(null)

    const handleConnect = (walletObj: any) => {
        if (!walletObj) return

        setConnectingWallet(walletObj.name)
        connect(
            { wallet: walletObj },
            {
                onSuccess: () => {
                    onOpenChange(false)
                    setConnectingWallet(null)
                },
                onError: () => {
                    setConnectingWallet(null)
                },
            }
        )
    }

    // Get all wallets - detected ones first, then common ones that aren't detected
    const detectedWalletNames = new Set(wallets.map((w) => w.name.toLowerCase()))

    const processWallets = (walletConfigs: typeof POPULAR_WALLETS) => {
        const processed: Array<{
            name: string
            iconUrl: string | null
            detected: boolean
            wallet: any
        }> = []

        // Add detected wallets first
        wallets.forEach((w) => {
            const config = walletConfigs.find((c) =>
                c.matchNames.some((match) => w.name.toLowerCase().includes(match))
            )
            if (config) {
                processed.push({
                    name: config.name, // Use config name to avoid duplicates
                    iconUrl: config.iconUrl || w.icon,
                    detected: true,
                    wallet: w,
                })
            }
        })

        // Add non-detected wallets
        walletConfigs.forEach((config) => {
            // Check if this config was already added (by name)
            const alreadyProcessed = processed.some((p) => p.name === config.name)

            if (!alreadyProcessed && !detectedWalletNames.has(config.name.toLowerCase())) {
                processed.push({
                    name: config.name,
                    iconUrl: config.iconUrl,
                    detected: false,
                    wallet: null,
                })
            }
        })

        return processed
    }

    const popularWallets = processWallets(POPULAR_WALLETS)
    const otherWallets = processWallets(OTHER_WALLETS)

    // Add any detected wallets that don't match our config
    wallets.forEach((w) => {
        const isInPopular = popularWallets.some((pw) => pw.name === w.name)
        const isInOther = otherWallets.some((ow) => ow.name === w.name)
        // Also check if it was merged into a config name (e.g. Martian Sui Wallet -> Martian Wallet)
        const isConfigured = [...popularWallets, ...otherWallets].some(p => p.wallet && p.wallet.name === w.name)

        if (!isInPopular && !isInOther && !isConfigured) {
            otherWallets.push({
                name: w.name,
                iconUrl: w.icon || null,
                detected: true,
                wallet: w,
            })
        }
    })

    const handleNoWallet = () => {
        // Open a new tab/window to wallet creation resources
        window.open('https://sui.io/learn/wallet', '_blank')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white mx-2 sm:mx-4">
                <DialogHeader className="px-1 sm:px-0">
                    <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-black font-heading">
                        Connect Your Wallet
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm md:text-base text-muted-foreground">
                        Connect with one of available wallet providers or create a new wallet
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6 px-1 sm:px-0">
                    {/* Popular Wallets Section */}
                    {popularWallets.length > 0 && (
                        <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-black mb-2 sm:mb-3">Popular Wallets</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                                {popularWallets.map((wallet) => {
                                    const isConnecting = connectingWallet === wallet.name
                                    const isDisabled = !wallet.detected || isPending

                                    return (
                                        <button
                                            key={wallet.name}
                                            type="button"
                                            className={cn(
                                                "h-auto flex flex-col items-center justify-center gap-1 sm:gap-2 p-3 sm:p-4 md:p-6",
                                                "hover:bg-[#f4f3f0] transition-all duration-200",
                                                "border-2 rounded-lg bg-white",
                                                wallet.detected
                                                    ? "border-black/10 hover:border-[#1055C9] cursor-pointer"
                                                    : "border-black/5 cursor-not-allowed",
                                                isConnecting && "border-[#1055C9]"
                                            )}
                                            onClick={() => wallet.detected && !isPending && handleConnect(wallet.wallet)}
                                            disabled={isDisabled}
                                        >
                                            {wallet.iconUrl ? (
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-1 flex items-center justify-center">
                                                    <img
                                                        src={wallet.iconUrl}
                                                        alt={wallet.name}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement
                                                            target.style.display = 'none'
                                                            if (target.parentElement) {
                                                                const fallback = document.createElement('div')
                                                                fallback.className = 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#f4f3f0] rounded-full flex items-center justify-center text-lg sm:text-xl'
                                                                fallback.textContent = wallet.name.charAt(0).toUpperCase()
                                                                target.parentElement.appendChild(fallback)
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-1 bg-[#f4f3f0] rounded-full flex items-center justify-center text-lg sm:text-xl font-semibold text-[#1055C9]">
                                                    {wallet.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-[10px] sm:text-xs md:text-sm font-medium text-center text-black">
                                                {wallet.name}
                                            </span>
                                            {isConnecting && (
                                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-[#1055C9] mt-1" />
                                            )}
                                            {!wallet.detected && (
                                                <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">
                                                    Not installed
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Other Options Section */}
                    {otherWallets.length > 0 && (
                        <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-black mb-2 sm:mb-3">Other options</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {otherWallets.map((wallet) => {
                                    const isConnecting = connectingWallet === wallet.name
                                    const isDisabled = !wallet.detected || isPending

                                    return (
                                        <button
                                            key={wallet.name}
                                            type="button"
                                            className={cn(
                                                "h-auto flex flex-row items-center justify-start gap-2 sm:gap-3 p-2 sm:p-3",
                                                "hover:bg-[#f4f3f0] transition-all duration-200",
                                                "border border-black/10 rounded-lg bg-white",
                                                wallet.detected
                                                    ? "hover:border-[#1055C9] cursor-pointer"
                                                    : "cursor-not-allowed",
                                                isConnecting && "border-[#1055C9]"
                                            )}
                                            onClick={() => wallet.detected && !isPending && handleConnect(wallet.wallet)}
                                            disabled={isDisabled}
                                        >
                                            {wallet.iconUrl ? (
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 flex items-center justify-center">
                                                    <img
                                                        src={wallet.iconUrl}
                                                        alt={wallet.name}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement
                                                            target.style.display = 'none'
                                                            if (target.parentElement) {
                                                                const fallback = document.createElement('div')
                                                                fallback.className = 'w-7 h-7 sm:w-8 sm:h-8 bg-[#f4f3f0] rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold text-[#1055C9]'
                                                                fallback.textContent = wallet.name.charAt(0).toUpperCase()
                                                                target.parentElement.appendChild(fallback)
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 bg-[#f4f3f0] rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold text-[#1055C9]">
                                                    {wallet.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1 flex items-center justify-between min-w-0">
                                                <span className="text-xs sm:text-sm font-medium text-black truncate">
                                                    {wallet.name}
                                                </span>
                                                {isConnecting && (
                                                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-[#1055C9] flex-shrink-0 ml-2" />
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {wallets.length === 0 && popularWallets.length === 0 && otherWallets.length === 0 && (
                        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted rounded-lg text-center">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                No wallets detected. Please install a Sui-compatible wallet extension.
                            </p>
                        </div>
                    )}

                    {/* Don't have wallet option */}
                    <div className="pt-2 sm:pt-4 border-t border-black/10">
                        <button
                            type="button"
                            onClick={handleNoWallet}
                            className="w-full text-center text-xs sm:text-sm text-muted-foreground hover:text-[#1055C9] transition-colors duration-200 py-2"
                        >
                            I don't have a wallet
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}