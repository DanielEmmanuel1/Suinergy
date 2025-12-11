import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PriceEngine } from '@/lib/oracle/price-engine';
import { birdeyeProvider } from '@/lib/oracle/providers/birdeye';
import { pythProvider } from '@/lib/oracle/providers/pyth';
import { switchboardProvider } from '@/lib/oracle/providers/switchboard';
import { ORACLE_CONSTANTS } from '@/lib/oracle/constants';

// Mock providers
vi.mock('@/lib/oracle/providers/birdeye', () => ({
    birdeyeProvider: {
        name: 'birdeye',
        getPrice: vi.fn(),
    },
}));

vi.mock('@/lib/oracle/providers/pyth', () => ({
    pythProvider: {
        name: 'pyth',
        getPrice: vi.fn(),
    },
}));

vi.mock('@/lib/oracle/providers/switchboard', () => ({
    switchboardProvider: {
        name: 'switchboard',
        getPrice: vi.fn(),
    },
}));

describe('PriceEngine', () => {
    let priceEngine: PriceEngine;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();
        // Create new instance to clear cache
        priceEngine = new PriceEngine();
    });

    it('should return price from Birdeye if available', async () => {
        const mockPrice = {
            source: 'birdeye',
            symbol: 'SUI',
            priceUsd: 1.5,
            timestamp: Date.now(),
        };

        (birdeyeProvider.getPrice as any).mockResolvedValue(mockPrice);

        const result = await priceEngine.getTokenPrice('SUI');

        expect(result).toEqual(mockPrice);
        expect(birdeyeProvider.getPrice).toHaveBeenCalledWith('SUI');
        expect(pythProvider.getPrice).not.toHaveBeenCalled();
    });

    it('should failover to Pyth if Birdeye fails', async () => {
        (birdeyeProvider.getPrice as any).mockRejectedValue(new Error('API Error'));

        const mockPrice = {
            source: 'pyth',
            symbol: 'SUI',
            priceUsd: 1.5,
            timestamp: Date.now(),
        };
        (pythProvider.getPrice as any).mockResolvedValue(mockPrice);

        const result = await priceEngine.getTokenPrice('SUI');

        expect(result).toEqual(mockPrice);
        expect(birdeyeProvider.getPrice).toHaveBeenCalled();
        expect(pythProvider.getPrice).toHaveBeenCalled();
        expect(switchboardProvider.getPrice).not.toHaveBeenCalled();
    });

    it('should failover to Switchboard if Pyth fails', async () => {
        (birdeyeProvider.getPrice as any).mockResolvedValue(null);
        (pythProvider.getPrice as any).mockResolvedValue(null);

        const mockPrice = {
            source: 'switchboard',
            symbol: 'SUI',
            priceUsd: 1.5,
            timestamp: Date.now(),
        };
        (switchboardProvider.getPrice as any).mockResolvedValue(mockPrice);

        const result = await priceEngine.getTokenPrice('SUI');

        expect(result).toEqual(mockPrice);
        expect(switchboardProvider.getPrice).toHaveBeenCalled();
    });

    it('should return "none" source if all fail', async () => {
        (birdeyeProvider.getPrice as any).mockResolvedValue(null);
        (pythProvider.getPrice as any).mockResolvedValue(null);
        (switchboardProvider.getPrice as any).mockResolvedValue(null);

        const result = await priceEngine.getTokenPrice('SUI');

        expect(result.source).toBe('none');
        expect(result.priceUsd).toBeNull();
    });

    it('should cache results', async () => {
        const mockPrice = {
            source: 'birdeye',
            symbol: 'SUI',
            priceUsd: 1.5,
            timestamp: Date.now(),
        };

        (birdeyeProvider.getPrice as any).mockResolvedValue(mockPrice);

        // First call
        await priceEngine.getTokenPrice('SUI');

        // Second call
        await priceEngine.getTokenPrice('SUI');

        expect(birdeyeProvider.getPrice).toHaveBeenCalledTimes(1);
    });
});
