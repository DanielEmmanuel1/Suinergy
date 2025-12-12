'use client';

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

const networks = {
    mainnet: { url: getFullnodeUrl('mainnet') },
    testnet: { url: getFullnodeUrl('testnet') },
    devnet: { url: getFullnodeUrl('devnet') },
    localnet: { url: 'http://localhost:9000' },
};

import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/wallets/config';
import { SolanaProvider } from '@/wallets/solana-provider';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <SuiClientProvider networks={networks} defaultNetwork="testnet">
                    <WalletProvider autoConnect>
                        <SolanaProvider>
                            {children}
                        </SolanaProvider>
                    </WalletProvider>
                </SuiClientProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
