import { authenticate } from '../src/auth';

describe('Authentication', () => {
    it('should return true for valid credentials', () => {
        expect(authenticate('validUser', 'validPassword')).toBe(true);
    });

    it('should return false for invalid credentials', () => {
        expect(authenticate('invalidUser', 'invalidPassword')).toBe(false);
    });
});