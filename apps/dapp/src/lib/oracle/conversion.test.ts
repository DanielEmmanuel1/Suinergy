import { describe, it, expect } from 'vitest';
import { convertRawAmount, calculateUsdValue } from './conversion';

describe('convertRawAmount', () => {
    it('should correctly convert SUI (9 decimals)', () => {
        const raw = '1500000000'; // 1.5 SUI
        const result = convertRawAmount('SUI', raw);
        expect(result).toBe(1.5);
    });

    it('should correctly convert USDC (6 decimals)', () => {
        const raw = '1500000'; // 1.5 USDC
        const result = convertRawAmount('USDC', raw);
        expect(result).toBe(1.5);
    });

    it('should handle zero', () => {
        expect(convertRawAmount('SUI', '0')).toBe(0);
    });

    it('should handle invalid input gracefully', () => {
        expect(convertRawAmount('SUI', 'invalid')).toBe(0);
    });
});

describe('calculateUsdValue', () => {
    it('should calculate correct USD value', () => {
        const raw = '2000000000'; // 2 SUI
        const price = 1.5;
        const result = calculateUsdValue('SUI', raw, price);
        expect(result).toBe(3.0);
    });

    it('should return 0 if price is null', () => {
        const raw = '2000000000';
        const result = calculateUsdValue('SUI', raw, null);
        expect(result).toBe(0);
    });
});
