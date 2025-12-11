import axios from 'axios';
import { ORACLE_CONSTANTS, TOKENS } from '../constants';
import { OraclePrice, PriceProvider, TokenSymbol } from '../types';

interface BirdeyeResponse {
    data: {
        value: number;
        updateUnixTime: number;
        updateHumanTime: string;
    };
    success: boolean;
}

export class BirdeyeProvider implements PriceProvider {
    name = 'birdeye' as const;

    async getPrice(symbol: TokenSymbol): Promise<OraclePrice | null> {
        const config = TOKENS[symbol];
        if (!config) return null;

        try {
            // Birdeye now requires authentication - skip if no API key
            const apiKey = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY;
            if (!apiKey) {
                console.warn(`Birdeye API key not configured for ${symbol}, skipping...`);
                return null;
            }

            const response = await axios.get<BirdeyeResponse>(ORACLE_CONSTANTS.BIRDEYE_API_URL, {
                params: {
                    address: config.birdeyeAddress,
                },
                headers: {
                    'X-API-KEY': apiKey,
                    'x-chain': 'sui'
                },
                timeout: 5000,
            });

            if (!response.data.success || !response.data.data) {
                console.warn(`Birdeye API error for ${symbol}:`, response.data);
                return null;
            }

            const { value, updateUnixTime } = response.data.data;

            // Basic validation
            if (value <= 0) return null;

            return {
                source: 'birdeye',
                symbol,
                priceUsd: value,
                timestamp: updateUnixTime * 1000, // Convert to ms
            };
        } catch (error) {
            console.error(`Birdeye fetch failed for ${symbol}:`, error);
            return null;
        }
    }
}

export const birdeyeProvider = new BirdeyeProvider();
