import { TOKENS } from './constants';
import { TokenSymbol } from './types';

/**
 * Converts a raw amount (string/bigint) to a human-readable number based on token decimals.
 * @param token The token symbol (SUI, USDC, USDT)
 * @param rawAmount The raw amount as a string or bigint
 * @returns The human-readable amount or 0 if invalid
 */
export function convertRawAmount(token: TokenSymbol, rawAmount: string | bigint | number): number {
    if (!rawAmount) return 0;

    const decimals = TOKENS[token]?.decimals;
    if (decimals === undefined) {
        console.warn(`Decimals not found for token: ${token}`);
        return 0;
    }

    try {
        const amountBigInt = BigInt(rawAmount);
        // Use string arithmetic to avoid precision loss for large numbers before division
        const divisor = BigInt(10 ** decimals);

        // For display purposes, standard number precision is usually sufficient
        // If we need exact precision, we should use a library like bignumber.js
        // But for this requirement "human = raw / 10^decimals", native JS number is standard for UI
        return Number(amountBigInt) / Number(divisor);
    } catch (error) {
        console.error(`Error converting raw amount for ${token}:`, error);
        return 0;
    }
}

/**
 * Calculates the USD value given a token, raw amount, and price.
 * @param token The token symbol
 * @param rawAmount The raw amount
 * @param priceUsd The price of the token in USD
 * @returns The USD value or 0
 */
export function calculateUsdValue(token: TokenSymbol, rawAmount: string | bigint | number, priceUsd: number | null): number {
    if (priceUsd === null || priceUsd === undefined) return 0;

    const humanAmount = convertRawAmount(token, rawAmount);
    return humanAmount * priceUsd;
}
