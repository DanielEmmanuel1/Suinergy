import axios from 'axios';
import { ORACLE_CONSTANTS, TOKENS } from '../constants';
import { OraclePrice, PriceProvider, TokenSymbol } from '../types';

interface PythPrice {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
}

interface PythResponse {
    parsed: Array<{
        id: string;
        price: PythPrice;
    }>;
}

export class PythProvider implements PriceProvider {
    name = 'pyth' as const;

    async getPrice(symbol: TokenSymbol): Promise<OraclePrice | null> {
        const config = TOKENS[symbol];
        if (!config) return null;

        try {
            const response = await axios.get<PythResponse>(ORACLE_CONSTANTS.PYTH_HERMES_URL, {
                params: {
                    'ids[]': config.pythPriceId,
                },
                timeout: 5000,
            });

            if (!response.data.parsed || response.data.parsed.length === 0) {
                return null;
            }

            const priceData = response.data.parsed[0].price;

            // Check staleness
            const currentTime = Date.now();
            const publishTime = priceData.publish_time * 1000;
            if (currentTime - publishTime > ORACLE_CONSTANTS.STALE_PRICE_THRESHOLD_MS) {
                console.warn(`Pyth price for ${symbol} is stale`);
                return null;
            }

            // Calculate price: price * 10^expo
            const price = Number(priceData.price) * (10 ** priceData.expo);

            if (price <= 0) return null;

            return {
                source: 'pyth',
                symbol,
                priceUsd: price,
                timestamp: publishTime,
            };
        } catch (error) {
            console.error(`Pyth fetch failed for ${symbol}:`, error);
            return null;
        }
    }
}

export const pythProvider = new PythProvider();
