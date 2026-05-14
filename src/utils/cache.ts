/**
 * In-memory TTL cache with LRU eviction.
 */
interface CacheEntry<T> {
  value: T
  expiresAt: number
  lastAccessed: number
}

export class TTLCache<K, V> {
  private store = new Map<K, CacheEntry<V>>()

  constructor(
    private readonly ttlMs: number,
    private readonly maxSize: number = 1000
  ) {}

  set(key: K, value: V): void {
    if (this.store.size >= this.maxSize) this.evictOldest()
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
      lastAccessed: Date.now(),
    })
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return undefined }
    entry.lastAccessed = Date.now()
    return entry.value
  }

  has(key: K): boolean { return this.get(key) !== undefined }

  delete(key: K): boolean { return this.store.delete(key) }

  private evictOldest(): void {
    let oldest: K | undefined
    let oldestTime = Infinity
    for (const [k, v] of this.store) {
      if (v.lastAccessed < oldestTime) { oldestTime = v.lastAccessed; oldest = k }
    }
    if (oldest !== undefined) this.store.delete(oldest)
  }

  get size(): number { return this.store.size }
}
