import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTokenPrice } from './use-token-price';
import { priceEngine } from '@/lib/oracle/price-engine';

// Mock price engine
vi.mock('@/lib/oracle/price-engine', () => ({
    priceEngine: {
        getTokenPrice: vi.fn(),
        getMultipleTokenPrices: vi.fn(),
    },
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('useTokenPrice', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch and return token price', async () => {
        const mockPrice = {
            source: 'birdeye',
            symbol: 'SUI',
            priceUsd: 1.5,
            timestamp: Date.now(),
        };

        (priceEngine.getTokenPrice as any).mockResolvedValue(mockPrice);

        const { result } = renderHook(() => useTokenPrice('SUI'), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockPrice);
        expect(priceEngine.getTokenPrice).toHaveBeenCalledWith('SUI');
    });
});
