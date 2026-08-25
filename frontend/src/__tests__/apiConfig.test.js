import { describe, it, expect } from 'vitest';
import API_URL from '../apiConfig';

describe('apiConfig', () => {
  it('returns a valid URL string', () => {
    expect(typeof API_URL).toBe('string');
    expect(API_URL).toMatch(/^https?:\/\//);
  });
});
