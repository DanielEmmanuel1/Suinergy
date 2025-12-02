'use client'

import { ReactNode, useEffect } from 'react'
import Lenis from 'lenis'
import { Sidebar } from './sidebar'
import { WalletButton } from '../wallet/wallet-button'

interface MainLayoutProps {
    children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
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
            <Sidebar />
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-white border-b border-black/10 px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-black font-heading">Suinergy dApp</h1>
                    <WalletButton />
                </header>

                {/* Content Area */}
                <div className="flex-1 p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}

