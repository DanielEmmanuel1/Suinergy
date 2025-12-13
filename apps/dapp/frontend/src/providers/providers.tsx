'use client';

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/contexts/theme-context';

const networks = {
    mainnet: { url: getFullnodeUrl('mainnet') },
    testnet: { url: getFullnodeUrl('testnet') },
    devnet: { url: getFullnodeUrl('devnet') },
    localnet: { url: 'http://localhost:9000' },
};

// Dynamically import multichain providers to avoid SSR issues
const WagmiClientProvider = dynamic(
    () => import('./wagmi-provider').then(mod => ({ default: mod.WagmiClientProvider })),
    { ssr: false }
);

const SolanaClientProvider = dynamic(
    () => import('./solana-provider').then(mod => ({ default: mod.SolanaClientProvider })),
    { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <ThemeProvider>
            <WagmiClientProvider>
                <SuiClientProvider networks={networks} defaultNetwork="testnet">
                    <WalletProvider autoConnect>
                        <QueryClientProvider client={queryClient}>
                            <SolanaClientProvider>
                                {children}
                            </SolanaClientProvider>
                        </QueryClientProvider>
                    </WalletProvider>
                </SuiClientProvider>
            </WagmiClientProvider>
        </ThemeProvider>
    );
}
