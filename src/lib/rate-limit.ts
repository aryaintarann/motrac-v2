// Simple in-memory rate limiter for development
// For production, use @upstash/ratelimit with Redis

interface RateLimitEntry {
  count: number
  resetAt: number
}

class InMemoryRateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map()
  private limit: number
  private windowMs: number

  constructor(limit: number, windowMs: number) {
    this.limit = limit
    this.windowMs = windowMs
    
    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  async check(identifier: string): Promise<{ success: boolean; remaining: number }> {
    const now = Date.now()
    const entry = this.storage.get(identifier)

    if (!entry || now > entry.resetAt) {
      // Create new entry
      this.storage.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs
      })
      return { success: true, remaining: this.limit - 1 }
    }

    if (entry.count >= this.limit) {
      return { success: false, remaining: 0 }
    }

    entry.count++
    return { success: true, remaining: this.limit - entry.count }
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetAt) {
        this.storage.delete(key)
      }
    }
  }
}

// Rate limiters for different endpoints
export const apiRateLimiter = new InMemoryRateLimiter(100, 60 * 1000) // 100 req/min
export const loginRateLimiter = new InMemoryRateLimiter(5, 60 * 60 * 1000) // 5 req/hour
export const aiRateLimiter = new InMemoryRateLimiter(20, 60 * 1000) // 20 req/min

export async function rateLimit(
  identifier: string,
  limiter: InMemoryRateLimiter = apiRateLimiter
): Promise<{ success: boolean; remaining: number }> {
  return await limiter.check(identifier)
}
