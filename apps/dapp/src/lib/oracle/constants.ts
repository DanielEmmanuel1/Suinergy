import { TokenConfig, TokenSymbol } from './types';

export const ORACLE_CONSTANTS = {
    BIRDEYE_API_URL: 'https://public-api.birdeye.so/defi/price',
    PYTH_HERMES_URL: 'https://hermes.pyth.network/v2/updates/price/latest',
    PYTH_REST_URL: 'https://api.pyth.network/v2/price_feeds/latest', // Alternative REST API
    SWITCHBOARD_API_URL: 'https://crossbar.switchboard.xyz', // Example, will verify
    CACHE_DURATION_MS: 30000, // 30 seconds
    STALE_PRICE_THRESHOLD_MS: 60000, // 1 minute
};

export const TOKENS: Record<TokenSymbol, TokenConfig> = {
    SUI: {
        symbol: 'SUI',
        decimals: 9,
        coinType: '0x2::sui::SUI',
        birdeyeAddress: '0x2::sui::SUI',
        pythPriceId: '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744', // SUI/USD
        switchboardFeedId: '0x...', // TODO: Fill with actual ID
    },
    USDC: {
        symbol: 'USDC',
        decimals: 6,
        coinType: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN', // Wormhole USDC
        birdeyeAddress: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
        pythPriceId: '0x41f3625971ca2ed2263e78573fe5ce23e13d40375caf505848f2099015f8e7db', // USDC/USD
        switchboardFeedId: '0x...',
    },
    USDT: {
        symbol: 'USDT',
        decimals: 6,
        coinType: '0xc060006111016b8a020ad5b338349841437d1d2b27158774c98517d92c31332c::coin::COIN', // Wormhole USDT
        birdeyeAddress: '0xc060006111016b8a020ad5b338349841437d1d2b27158774c98517d92c31332c::coin::COIN',
        pythPriceId: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b', // USDT/USD
        switchboardFeedId: '0x...',
    },
};

export const SUPPORTED_TOKENS = Object.keys(TOKENS) as TokenSymbol[];
