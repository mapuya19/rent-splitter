/**
 * Rate limiter tests
 */

import { vi } from 'vitest';
import { checkRateLimit, getClientIP } from '@/utils/rateLimiter';

describe('Rate Limiter', () => {
  const originalNow = Date.now;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Date.now = originalNow;
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const ip = '127.0.0.1';
      const result = checkRateLimit(ip);

      expect(result.allowed).toBe(true);
      expect(result.retryAfter).toBeUndefined();
    });

    it('should allow multiple requests up to limit', () => {
      const ip = '127.0.0.2';

      for (let i = 0; i < 20; i++) {
        const result = checkRateLimit(ip);
        expect(result.allowed).toBe(true);
      }
    });

    it('should block requests exceeding limit', () => {
      const ip = '127.0.0.3';

      // Make 20 requests (at limit)
      for (let i = 0; i < 20; i++) {
        checkRateLimit(ip);
      }

      // 21st request should be blocked
      const result = checkRateLimit(ip);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should reset after window expires', () => {
      const ip = '127.0.0.4';
      let currentTime = Date.now();

      // Mock Date.now to control time
      Date.now = vi.fn(() => currentTime) as unknown as () => number;

      // Make 20 requests (at limit)
      for (let i = 0; i < 20; i++) {
        checkRateLimit(ip);
      }

      // 21st request should be blocked
      const blockedResult = checkRateLimit(ip);
      expect(blockedResult.allowed).toBe(false);

      // Advance time by 61 seconds (past the 60-second window)
      currentTime += 61000;

      // Request should now be allowed (window reset)
      const result = checkRateLimit(ip);
      expect(result.allowed).toBe(true);
    });

    it('should track requests independently per IP', () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';

      // Make 20 requests from IP1
      for (let i = 0; i < 20; i++) {
        checkRateLimit(ip1);
      }

      // IP1 should be blocked
      expect(checkRateLimit(ip1).allowed).toBe(false);

      // IP2 should still be allowed
      expect(checkRateLimit(ip2).allowed).toBe(true);
    });

    it('should handle new IP after window reset', () => {
      const ip = '10.0.0.1';
      let currentTime = Date.now();

      Date.now = vi.fn(() => currentTime) as unknown as () => number;

      // Make 20 requests
      for (let i = 0; i < 20; i++) {
        checkRateLimit(ip);
      }

      // Advance time past window
      currentTime += 61000;

      // New entry should be created
      const result = checkRateLimit(ip);
      expect(result.allowed).toBe(true);
    });

    it('should calculate retry-after time correctly', () => {
      const ip = '127.0.0.5';

      // Make 20 requests
      for (let i = 0; i < 20; i++) {
        checkRateLimit(ip);
      }

      // Get the blocked result
      const result = checkRateLimit(ip);
      expect(result.allowed).toBe(false);

      // Retry-after should be approximately 60 seconds (within a small margin)
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(60);
    });
  });

  describe('getClientIP', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = {
        headers: {
          get: (key: string) => {
            if (key === 'x-forwarded-for') {
              return '203.0.113.1, 203.0.113.2';
            }
            return null;
          },
        },
      };

      const ip = getClientIP(request);
      expect(ip).toBe('203.0.113.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = {
        headers: {
          get: (key: string) => {
            if (key === 'x-real-ip') {
              return '203.0.113.1';
            }
            if (key === 'x-forwarded-for') {
              return null;
            }
            return null;
          },
        },
      };

      const ip = getClientIP(request);
      expect(ip).toBe('203.0.113.1');
    });

    it('should trim whitespace from IP addresses', () => {
      const request = {
        headers: {
          get: (key: string) => {
            if (key === 'x-forwarded-for') {
              return '  203.0.113.1  ,  203.0.113.2  ';
            }
            return null;
          },
        },
      };

      const ip = getClientIP(request);
      expect(ip).toBe('203.0.113.1');
    });

    it('should return "unknown" when no headers present', () => {
      const request = {
        headers: {
          get: () => null,
        },
      };

      const ip = getClientIP(request);
      expect(ip).toBe('unknown');
    });

    it('should prioritize x-forwarded-for over x-real-ip', () => {
      const request = {
        headers: {
          get: (key: string) => {
            if (key === 'x-forwarded-for') {
              return '203.0.113.1';
            }
            if (key === 'x-real-ip') {
              return '203.0.113.2';
            }
            return null;
          },
        },
      };

      const ip = getClientIP(request);
      expect(ip).toBe('203.0.113.1');
    });

    it('should handle empty x-forwarded-for', () => {
      const request = {
        headers: {
          get: (key: string) => {
            if (key === 'x-forwarded-for') {
              return '';
            }
            if (key === 'x-real-ip') {
              return '203.0.113.1';
            }
            return null;
          },
        },
      };

      const ip = getClientIP(request);
      expect(ip).toBe('203.0.113.1');
    });
  });
});
