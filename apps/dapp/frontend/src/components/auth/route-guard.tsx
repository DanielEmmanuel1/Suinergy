'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { WalletLandingScreen } from '@/components/wallet/wallet-landing-screen'

interface RouteGuardProps {
    children: React.ReactNode
}

/**
 * Route guard that protects all routes except the landing page
 * Redirects to landing page if wallet is not connected
 * Uses hard redirect to prevent browser back button from accessing protected pages
 */
export function RouteGuard({ children }: RouteGuardProps) {
    const currentAccount = useCurrentAccount()
    const pathname = usePathname()
    const isLandingPage = pathname === '/'

    // Redirect function
    const redirectToLanding = () => {
        if (!isLandingPage && !currentAccount) {
            // Use replace to prevent back button from accessing protected pages
            window.location.replace('/')
        }
    }

    // If on any protected page (not landing) and wallet is not connected, redirect immediately
    useEffect(() => {
        redirectToLanding()
    }, [isLandingPage, currentAccount])

    // Listen for browser back/forward button navigation
    useEffect(() => {
        const handlePopState = () => {
            // Small delay to let pathname update
            setTimeout(() => {
                if (!currentAccount && window.location.pathname !== '/') {
                    window.location.replace('/')
                }
            }, 0)
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [currentAccount])

    // If on protected page without wallet, show landing screen while redirecting
    if (!isLandingPage && !currentAccount) {
        return <WalletLandingScreen />
    }

    return <>{children}</>
}

