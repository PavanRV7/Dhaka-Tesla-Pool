import { describe, expect, it } from 'vitest';
import { validateStatusTransition } from '../src/services/ride.service.js';
import { InvalidStateTransitionError } from '../src/utils/errors.js';
describe('ride state transitions', () => {
    it('allows a valid transition', () => {
        expect(() => validateStatusTransition('REQUESTED', 'MATCHED')).not.toThrow();
    });
    it('rejects invalid transitions', () => {
        expect(() => validateStatusTransition('REQUESTED', 'COMPLETED')).toThrow(InvalidStateTransitionError);
    });
    it('allows cancellation before trip start', () => {
        expect(() => validateStatusTransition('REQUESTED', 'CANCELLED')).not.toThrow();
    });
    it('rejects cancellation after completion', () => {
        expect(() => validateStatusTransition('COMPLETED', 'CANCELLED')).toThrow(InvalidStateTransitionError);
    });
});
