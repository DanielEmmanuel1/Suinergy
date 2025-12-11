import { useQuery } from '@tanstack/react-query';
import { priceEngine } from '@/lib/oracle/price-engine';
import { TokenSymbol } from '@/lib/oracle/types';

export function useTokenPrice(symbol: TokenSymbol) {
    return useQuery({
        queryKey: ['token-price', symbol],
        queryFn: () => priceEngine.getTokenPrice(symbol),
        refetchInterval: 30000, // Refresh every 30s
        staleTime: 10000,
    });
}

export function useMultipleTokenPrices(symbols: TokenSymbol[]) {
    return useQuery({
        queryKey: ['token-prices', symbols.join(',')],
        queryFn: () => priceEngine.getMultipleTokenPrices(symbols),
        refetchInterval: 30000,
        staleTime: 10000,
    });
}
