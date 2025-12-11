import { useMultipleTokenPrices, useTokenPrice } from './use-token-price';
import { calculateUsdValue } from '@/lib/oracle/conversion';
import { TokenSymbol } from '@/lib/oracle/types';
import { useMemo } from 'react';

export function useVaultDepositModalPricing(token: TokenSymbol, rawAmount: string) {
    const { data: priceData, isLoading } = useTokenPrice(token);

    const usdValue = useMemo(() => {
        if (!priceData || !rawAmount) return null;
        return calculateUsdValue(token, rawAmount, priceData.priceUsd);
    }, [token, rawAmount, priceData]);

    return {
        usdValue,
        isLoading,
        pricePerToken: priceData?.priceUsd ?? null,
    };
}

export interface AssetBreakdown {
    symbol: TokenSymbol;
    rawAmount: string;
}

export function useVaultStrategyUsdBreakdown(assets: AssetBreakdown[]) {
    const symbols = useMemo(() =>
        Array.from(new Set(assets.map(a => a.symbol))),
        [assets]
    );

    const { data: prices, isLoading } = useMultipleTokenPrices(symbols);

    const breakdown = useMemo(() => {
        if (!prices || isLoading) return null;

        let totalUsd = 0;
        const items = assets.map(asset => {
            const price = prices[asset.symbol];
            const usdValue = calculateUsdValue(asset.symbol, asset.rawAmount, price?.priceUsd ?? null);
            totalUsd += usdValue;
            return {
                ...asset,
                usdValue,
                pricePerToken: price?.priceUsd ?? null,
            };
        });

        return {
            totalUsd,
            items,
        };
    }, [assets, prices, isLoading]);

    return {
        data: breakdown,
        isLoading,
    };
}
