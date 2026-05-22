/**
 * Retries an async function with exponential backoff.
 * Useful for network requests and flaky external APIs.
 */
export interface RetryOptions {
  attempts: number
  baseDelayMs: number
  maxDelayMs: number
  shouldRetry?: (error: unknown) => boolean
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { attempts, baseDelayMs, maxDelayMs, shouldRetry } = options
  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (shouldRetry && !shouldRetry(err)) throw err
      if (attempt < attempts - 1) {
        const delay = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs)
        const jitter = Math.random() * delay * 0.2
        await new Promise(r => setTimeout(r, delay + jitter))
      }
    }
  }
  throw lastError
}
