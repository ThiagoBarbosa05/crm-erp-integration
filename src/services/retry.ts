import { logger } from '../utils/logger.js'

export async function retryWithBackOff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
): Promise<T> {
  let attempt = 0
  while (attempt < retries) {
    try {
      return await fn()
    } catch (err) {
      attempt++
      if (attempt >= retries) throw err
      const backoff = delay * 2 ** (attempt - 1)
      logger.warn(`Retrying in ${backoff}ms (attempt ${attempt})`)
      await new Promise((resolve) => setTimeout(resolve, backoff))
    }
  }
  throw new Error('Retries exhausted')
}
