/**
 * Rate Limiting Service
 * Prevents API abuse and manages request throttling
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests: number = 60, windowMs: number = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  /**
   * Check if request is allowed
   * @param identifier - Usually IP address or user ID
   * @returns true if allowed, false if rate limited
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.limits.get(identifier)

    // No previous requests or window expired
    if (!entry || now > entry.resetTime) {
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      }
    }

    // Within rate limit
    if (entry.count < this.maxRequests) {
      entry.count++
      return {
        allowed: true,
        remaining: this.maxRequests - entry.count,
        resetTime: entry.resetTime
      }
    }

    // Rate limited
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.limits.delete(identifier)
  }

  /**
   * Clear all rate limits
   */
  clear(): void {
    this.limits.clear()
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key)
      }
    }
  }
}

// Export singleton instance
// 60 requests per minute per IP
export const rateLimiter = new RateLimiter(60, 60000)

// Cleanup every minute
if (typeof window === 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup()
  }, 60000)
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for proxied requests)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  // Fallback to a generic identifier
  return 'unknown'
}
