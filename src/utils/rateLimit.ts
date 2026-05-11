/**
 * Token bucket rate limiter for controlling request frequency.
 */
export class RateLimiter {
  private tokens: number
  private lastRefill: number

  constructor(
    private readonly capacity: number,
    private readonly refillPerSecond: number
  ) {
    this.tokens = capacity
    this.lastRefill = Date.now()
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillPerSecond)
    this.lastRefill = now
  }

  async acquire(cost = 1): Promise<void> {
    this.refill()
    if (this.tokens >= cost) {
      this.tokens -= cost
      return
    }
    const waitMs = ((cost - this.tokens) / this.refillPerSecond) * 1000
    await new Promise(r => setTimeout(r, waitMs))
    this.tokens = 0
  }

  get available(): number {
    this.refill()
    return Math.floor(this.tokens)
  }
}
