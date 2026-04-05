// Simple in-memory rate limiter for development
// For production, use @upstash/ratelimit with Redis

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Global cleanup interval tracker
let globalCleanupInterval: NodeJS.Timeout | null = null
const rateLimiters: InMemoryRateLimiter[] = []

class InMemoryRateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map()
  private limit: number
  private windowMs: number

  constructor(limit: number, windowMs: number) {
    this.limit = limit
    this.windowMs = windowMs
    
    // Register this instance for global cleanup
    rateLimiters.push(this)
    
    // Initialize global cleanup if not already running
    if (!globalCleanupInterval) {
      globalCleanupInterval = setInterval(() => {
        rateLimiters.forEach(limiter => limiter.cleanup())
      }, 5 * 60 * 1000)
    }
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

  public cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetAt) {
        this.storage.delete(key)
      }
    }
  }
}

// Cleanup on process exit (for development hot reloading)
if (typeof process !== 'undefined') {
  const cleanupHandler = () => {
    if (globalCleanupInterval) {
      clearInterval(globalCleanupInterval)
      globalCleanupInterval = null
    }
    rateLimiters.forEach(limiter => limiter.cleanup())
    rateLimiters.length = 0
  }
  
  process.on('beforeExit', cleanupHandler)
  process.on('exit', cleanupHandler)
  process.on('SIGINT', cleanupHandler)
  process.on('SIGTERM', cleanupHandler)
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
