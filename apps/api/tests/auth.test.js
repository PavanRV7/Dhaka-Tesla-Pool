import { describe, expect, it } from 'vitest';
import { createJwtToken } from '../src/services/auth.service.js';
describe('auth service', () => {
    it('creates a JWT token with request payload data', () => {
        const token = createJwtToken({ id: 7, email: 'jashim@example.com', name: 'Jashim', role: 'DRIVER' });
        expect(token).toBeTypeOf('string');
        expect(token.length).toBeGreaterThan(20);
    });
});
