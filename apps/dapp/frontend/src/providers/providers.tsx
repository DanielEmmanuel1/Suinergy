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

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networks} defaultNetwork="testnet">
                <WalletProvider autoConnect>{children}</WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    );
}
