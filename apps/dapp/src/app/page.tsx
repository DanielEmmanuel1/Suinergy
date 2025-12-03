'use client'

import { useCurrentAccount } from '@mysten/dapp-kit'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { WalletLandingScreen } from '@/components/wallet/wallet-landing-screen'

export default function DAppPage() {
    const currentAccount = useCurrentAccount()
    const router = useRouter()

    // Redirect to dashboard if wallet is connected
    useEffect(() => {
        if (currentAccount) {
            router.replace('/dashboard')
        }
    }, [currentAccount, router])

    // Show landing screen if wallet is not connected
    if (!currentAccount) {
        return <WalletLandingScreen />
    }

    // Show nothing while redirecting (or a loading state)
    return null
}
