// Simple in-memory rate limiter for development
// For production, use @upstash/ratelimit with Redis

interface RateLimitEntry {
  count: number
  resetAt: number
}

// Use Symbol for HMR-safe global tracking
const CLEANUP_INTERVAL_SYMBOL = Symbol.for('__RATE_LIMIT_CLEANUP_INTERVAL__') as any;
const RATE_LIMITERS_SYMBOL = Symbol.for('__RATE_LIMITERS__') as any;

// Setup generic global access to prevent TS errors on symbol indexing
const g = global as any;

class InMemoryRateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map()
  private limit: number
  private windowMs: number
  private maxStorageSize: number = 10000 // Prevent unbounded growth

  constructor(limit: number, windowMs: number) {
    this.limit = limit
    this.windowMs = windowMs
    
    // Use global symbol to survive HMR
    if (!g[RATE_LIMITERS_SYMBOL]) {
      g[RATE_LIMITERS_SYMBOL] = []
    }
    
    // Only register if not already in the array (prevent duplicates on HMR)
    const existingIndex = g[RATE_LIMITERS_SYMBOL]!.findIndex(
      (limiter: InMemoryRateLimiter) => limiter.limit === this.limit && limiter.windowMs === this.windowMs
    )
    
    if (existingIndex === -1) {
      g[RATE_LIMITERS_SYMBOL]!.push(this)
    } else {
      // Reuse existing instance storage to maintain rate limits across HMR
      this.storage = g[RATE_LIMITERS_SYMBOL]![existingIndex].storage
    }
    
    // Initialize global cleanup if not already running (HMR-safe)
    if (!g[CLEANUP_INTERVAL_SYMBOL]) {
      g[CLEANUP_INTERVAL_SYMBOL] = setInterval(() => {
        const limiters = g[RATE_LIMITERS_SYMBOL] || []
        limiters.forEach((limiter: InMemoryRateLimiter) => limiter.cleanup())
      }, 5 * 60 * 1000) // Cleanup every 5 minutes
      
      // Unref so it doesn't keep process alive
      g[CLEANUP_INTERVAL_SYMBOL]!.unref()
    }
  }

  async check(identifier: string): Promise<{ success: boolean; remaining: number }> {
    const now = Date.now()
    const entry = this.storage.get(identifier)

    // Prevent memory overflow: cleanup if storage is too large
    if (this.storage.size > this.maxStorageSize) {
      this.cleanup()
    }

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
    let deletedCount = 0
    
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetAt) {
        this.storage.delete(key)
        deletedCount++
      }
    }
    
    // Log cleanup in dev mode for monitoring
    if (deletedCount > 0 && process.env.NODE_ENV === 'development') {
      console.log(`🧹 Rate limiter cleaned ${deletedCount} expired entries`)
    }
  }
  
  // Get current storage size (for debugging)
  public getStorageSize(): number {
    return this.storage.size
  }
}

// Cleanup on process exit
if (typeof process !== 'undefined') {
  const cleanupHandler = () => {
    if (g[CLEANUP_INTERVAL_SYMBOL]) {
      clearInterval(g[CLEANUP_INTERVAL_SYMBOL])
      g[CLEANUP_INTERVAL_SYMBOL] = undefined
    }
    
    const limiters = g[RATE_LIMITERS_SYMBOL] || []
    limiters.forEach((limiter: InMemoryRateLimiter) => limiter.cleanup())
    
    if (g[RATE_LIMITERS_SYMBOL]) {
      g[RATE_LIMITERS_SYMBOL] = undefined
    }
  }
  
  process.once('beforeExit', cleanupHandler)
  process.once('SIGINT', cleanupHandler)
  process.once('SIGTERM', cleanupHandler)
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
