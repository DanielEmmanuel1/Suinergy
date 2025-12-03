import { ORACLE_CONSTANTS } from './constants';
import { birdeyeProvider } from './providers/birdeye';
import { pythProvider } from './providers/pyth';
import { switchboardProvider } from './providers/switchboard';
import { OraclePrice, TokenSymbol } from './types';

interface CacheEntry {
    price: OraclePrice;
    timestamp: number;
}

export class PriceEngine {
    private cache: Map<TokenSymbol, CacheEntry> = new Map();
    private providers = [birdeyeProvider, pythProvider, switchboardProvider];

    /**
     * Fetches the price for a token, trying providers in order.
     * Returns cached data if valid to reduce API calls.
     */
    async getTokenPrice(symbol: TokenSymbol): Promise<OraclePrice> {
        // Check cache first
        const cached = this.cache.get(symbol);
        const now = Date.now();
        if (cached && (now - cached.timestamp < ORACLE_CONSTANTS.CACHE_DURATION_MS)) {
            return cached.price;
        }

        // Try providers in order
        for (const provider of this.providers) {
            try {
                const price = await provider.getPrice(symbol);
                if (price) {
                    // Update cache
                    this.cache.set(symbol, {
                        price,
                        timestamp: now,
                    });
                    return price;
                }
            } catch (error) {
                console.warn(`Provider ${provider.name} failed for ${symbol}`, error);
                // Continue to next provider
            }
        }

        // All providers failed
        return {
            source: 'none',
            symbol,
            priceUsd: null,
            timestamp: now,
        };
    }

    /**
     * Fetches prices for multiple tokens in parallel.
     */
    async getMultipleTokenPrices(symbols: TokenSymbol[]): Promise<Record<TokenSymbol, OraclePrice>> {
        const promises = symbols.map(async (symbol) => {
            const price = await this.getTokenPrice(symbol);
            return { symbol, price };
        });

        const results = await Promise.all(promises);

        return results.reduce((acc, { symbol, price }) => {
            acc[symbol] = price;
            return acc;
        }, {} as Record<TokenSymbol, OraclePrice>);
    }
}

export const priceEngine = new PriceEngine();
