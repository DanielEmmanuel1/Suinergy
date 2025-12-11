import { useTokenBalances } from '../use-token-balances';
import { useMultipleTokenPrices } from './use-token-price';
import { SUPPORTED_TOKENS } from '@/lib/oracle/constants';
import { calculateUsdValue, convertRawAmount } from '@/lib/oracle/conversion';
import { TokenPriceResult } from '@/lib/oracle/types';

export function useWalletBalancesWithUsd() {
    const { data: balances, isLoading: isBalancesLoading } = useTokenBalances();
    const { data: prices, isLoading: isPricesLoading } = useMultipleTokenPrices(SUPPORTED_TOKENS);

    const isLoading = isBalancesLoading || isPricesLoading;

    if (isLoading || !balances || !prices) {
        return {
            isLoading: true,
            data: null,
        };
    }

    const result: Record<string, TokenPriceResult> = {};
    let totalUsdValue = 0;

    SUPPORTED_TOKENS.forEach((symbol) => {
        const rawBalance = balances[symbol.toLowerCase() as keyof typeof balances];
        const priceData = prices[symbol];

        // Handle case where balance might be undefined if not fetched yet
        const rawBalanceStr = rawBalance ? rawBalance.toString() : '0';

        const humanAmount = convertRawAmount(symbol, rawBalanceStr);
        const usdValue = calculateUsdValue(symbol, rawBalanceStr, priceData.priceUsd);

        totalUsdValue += usdValue;

        result[symbol] = {
            ...priceData,
            amountRaw: rawBalanceStr,
            amountReadable: humanAmount,
            usdValue,
        };
    });

    return {
        isLoading: false,
        data: result,
        totalUsdValue,
    };
}
