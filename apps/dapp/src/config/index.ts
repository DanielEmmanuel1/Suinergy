export const siteConfig = {
    name: 'Suinergy dApp',
    description: 'Sui-based yield aggregator for maximizing DeFi returns',
    url: 'https://app.suinergy.app',
    colors: {
        neutral: '#f4f3f0',
        black: '#000000',
        white: '#FFFFFF',
        blue: '#1055C9',
    },
};

export const suiConfig = {
    network: (process.env.NEXT_PUBLIC_SUI_NETWORK as 'mainnet' | 'testnet' | 'devnet') || 'testnet',
    rpcUrl: process.env.NEXT_PUBLIC_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443',
};

export const apiConfig = {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
};
