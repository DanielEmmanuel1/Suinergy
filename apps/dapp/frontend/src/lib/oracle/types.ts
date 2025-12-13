export type TokenSymbol = 'SUI' | 'USDC';
export type PriceSource = 'birdeye' | 'pyth' | 'switchboard' | 'none';

export interface OraclePrice {
    source: PriceSource;
    symbol: TokenSymbol;
    priceUsd: number | null;
    timestamp: number;
}

export interface TokenPriceResult extends OraclePrice {
    amountRaw: string;
    amountReadable: number | null;
    usdValue: number | null;
}

export interface PriceProvider {
    name: PriceSource;
    getPrice(symbol: TokenSymbol): Promise<OraclePrice | null>;
}

export interface TokenConfig {
    symbol: TokenSymbol;
    decimals: number;
    coinType: string;
    birdeyeAddress: string;
    pythPriceId: string;
    switchboardFeedId: string;
}
