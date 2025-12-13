import { http, createConfig } from 'wagmi';
import { base, avalanche, lisk } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';

// WalletConnect project ID - replace with your own in production
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '3a8170812b534d0ff9d794f19a901d64';

// Client-side only connector initialization
const getConnectors = () => {
    if (typeof window === 'undefined') return [];
    return [
        walletConnect({
            projectId,
            metadata: {
                name: 'Suinergy',
                description: 'Multichain Yield Optimizer',
                url: 'https://suinergy.io',
                icons: ['https://suinergy.io/icon.png']
            },
            showQrModal: true,
        }),
    ];
};

export const wagmiConfig = createConfig({
    ssr: false,
    chains: [base, avalanche, lisk],
    connectors: getConnectors(),
    transports: {
        [base.id]: http(),
        [avalanche.id]: http(),
        [lisk.id]: http(),
    },
});
