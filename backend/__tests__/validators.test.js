const { validateEmail, validatePassword, validateName, validatePhone, validateUUID } = require('../utils/validators');

describe('Validators', () => {
  describe('validateEmail', () => {
    it('accepts valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@uni.edu')).toBe(true);
    });
    it('rejects invalid emails', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('notanemail')).toBe(false);
      expect(validateEmail('@no-user.com')).toBe(false);
      expect(validateEmail(null)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('accepts strong passwords', () => {
      expect(validatePassword('Strong1Pass')).toBe(true);
    });
    it('rejects weak passwords', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('nouppercase1')).toBe(false);
      expect(validatePassword('NOLOWERCASE1')).toBe(false);
      expect(validatePassword('NoNumbers')).toBe(false);
    });
  });

  describe('validateName', () => {
    it('accepts valid names', () => {
      expect(validateName('John')).toBe(true);
      expect(validateName('A'.repeat(100))).toBe(true);
    });
    it('rejects invalid names', () => {
      expect(validateName('')).toBe(false);
      expect(validateName('A')).toBe(false);
      expect(validateName('A'.repeat(101))).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('accepts valid phones', () => {
      expect(validatePhone('1234567890')).toBe(true);
      expect(validatePhone('+123456789012345')).toBe(true);
    });
    it('allows empty phone', () => {
      expect(validatePhone(null)).toBe(true);
      expect(validatePhone('')).toBe(true);
    });
    it('rejects short phones', () => {
      expect(validatePhone('123')).toBe(false);
    });
  });

  describe('validateUUID', () => {
    it('accepts valid UUIDs', () => {
      expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });
    it('rejects invalid UUIDs', () => {
      expect(validateUUID('not-a-uuid')).toBe(false);
      expect(validateUUID('550e8400')).toBe(false);
    });
  });
});
