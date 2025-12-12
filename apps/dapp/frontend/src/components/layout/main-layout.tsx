'use client'

import { ReactNode, useEffect, useState } from 'react'
import Lenis from 'lenis'
import { Sidebar } from './sidebar'
import { WalletButton } from '../wallet/wallet-button'
import { ThemeToggle } from '../theme-toggle'
import { Menu, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdapterRegistry } from '@/hooks/use-adapter-registry'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface MainLayoutProps {
    children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { data: registry } = useAdapterRegistry()
    const hasMockAdapters = registry?.hasAnyMockAdapters ?? false

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        })

        function raf(time: number) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)

        return () => {
            lenis.destroy()
        }
    }, [])

    return (
        <div className="min-h-screen bg-[#f4f3f0] dark:bg-[#121212] flex transition-colors duration-200">
            <Sidebar isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 flex flex-col min-h-screen w-full lg:w-auto">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-white dark:bg-gradient-to-r dark:from-[#1a1a1a] dark:to-[#121212] border-b border-black/10 dark:border-white/5 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between transition-colors duration-200 dark:shadow-lg dark:shadow-brand-gradient/5">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg sm:text-xl font-semibold text-black dark:text-white font-heading">Suinergy dApp</h1>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 dark:bg-gradient-to-r dark:from-orange-900/40 dark:to-orange-800/40 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700/50 rounded">
                                TESTNET
                            </span>
                            {hasMockAdapters && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-gradient-to-r dark:from-yellow-900/40 dark:to-yellow-800/40 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700/50 rounded flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                MOCK
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Some strategies are using mock adapters. Real Testnet adapters will be enabled when available.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                        <WalletButton />
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-x-hidden">
                    <div className="p-4 sm:p-6 xl:max-w-[1800px] xl:mx-auto xl:w-full 3xl:max-w-[2800px] 3xl:mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}

