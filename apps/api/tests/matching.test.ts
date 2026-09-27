import { describe, expect, it } from 'vitest';
import { areRequestsCompatible } from '../src/services/matching.service.js';

describe('matching service', () => {
  it('allows compatible Banani to Mohakhali and Banani to Gulshan 1 requests to match', () => {
    const compatible = areRequestsCompatible(
      { pickupAreaName: 'Banani', destinationAreaName: 'Mohakhali', status: 'REQUESTED' },
      { pickupAreaName: 'Banani', destinationAreaName: 'Gulshan 1', status: 'REQUESTED' }
    );
    expect(compatible).toBeTruthy();
  });

  it('rejects clearly incompatible routes', () => {
    const compatible = areRequestsCompatible(
      { pickupAreaName: 'Banani', destinationAreaName: 'Mohakhali', status: 'REQUESTED' },
      { pickupAreaName: 'Banani', destinationAreaName: 'Dhanmondi', status: 'REQUESTED' }
    );
    expect(compatible).toBeFalsy();
  });
});
