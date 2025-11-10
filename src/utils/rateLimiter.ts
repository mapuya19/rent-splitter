/**
 * Simple in-memory rate limiter for API requests per IP
 * Note: In serverless environments, this is per-instance, not global
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute per IP

// In-memory store (per serverless instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up old entries periodically
 */
function cleanup() {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}

/**
 * Check if an IP address has exceeded the rate limit
 * @param ip IP address to check
 * @returns Object with allowed flag and retryAfter seconds if rate limited
 */
export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  // Cleanup old entries periodically (every 10th request)
  if (Math.random() < 0.1) {
    cleanup();
  }

  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    // New entry or expired - reset
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true };
  }

  // Check if limit exceeded
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Increment count
  entry.count++;
  return { allowed: true };
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: { headers: Headers | { get: (key: string) => string | null } }): string {
  // Try various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take the first IP in the chain
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  // Fallback (won't work in serverless, but good for local dev)
  return 'unknown';
}

