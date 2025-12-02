'use client'

import { ReactNode, useEffect, useState } from 'react'
import Lenis from 'lenis'
import { Sidebar } from './sidebar'
import { WalletButton } from '../wallet/wallet-button'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MainLayoutProps {
    children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
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
        <div className="min-h-screen bg-[#f4f3f0] flex">
            <Sidebar isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 flex flex-col min-h-screen w-full lg:w-auto">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-white border-b border-black/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <h1 className="text-lg sm:text-xl font-semibold text-black font-heading">Suinergy dApp</h1>
                    <div className="flex items-center gap-2">
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
                    <div className="p-4 sm:p-6 xl:max-w-[1800px] xl:mx-auto xl:w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}

