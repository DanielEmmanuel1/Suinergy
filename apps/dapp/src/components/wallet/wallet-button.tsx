'use client'

import { useCurrentAccount, useDisconnectWallet, useWallets } from '@mysten/dapp-kit'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Wallet } from 'lucide-react'
import { ConnectButton } from '@mysten/dapp-kit'

export function WalletButton() {
    const currentAccount = useCurrentAccount()
    const { disconnect } = useDisconnectWallet()
    const wallets = useWallets()

    if (!currentAccount) {
        return (
            <ConnectButton
                connectText="Connect Wallet"
                className="!bg-brand-gradient !text-white hover:!opacity-90 rounded-md"
            />
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Wallet className="w-4 h-4" />
                    <span className="hidden sm:inline">
                        {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => disconnect()}
                    className="cursor-pointer"
                >
                    Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

