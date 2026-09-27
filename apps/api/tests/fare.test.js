import { describe, expect, it } from 'vitest';
import { calculateEstimate } from '../src/services/fare.service.js';
describe('fare service', () => {
    it('calculates Nusrat Banani to Mohakhali pooled fare', () => {
        const estimate = calculateEstimate('Banani', 'Mohakhali');
        expect(estimate.soloFarePaisa).toBe(11000);
        expect(estimate.pooledFarePaisa).toBe(8800);
    });
    it('calculates Rafiq Banani to Gulshan 1 pooled fare', () => {
        const estimate = calculateEstimate('Banani', 'Gulshan 1');
        expect(estimate.soloFarePaisa).toBe(13000);
        expect(estimate.pooledFarePaisa).toBe(10400);
    });
});
