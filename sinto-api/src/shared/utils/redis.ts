/**
 * MODULE: Redis client
 * Singleton ioredis client. Used for refresh token blacklist, rate limiting, and job queues.
 *
 * Exports: redis
 * Depends on: ioredis, REDIS_URL
 */

import Redis from 'ioredis'
import { env } from '../../config/env'

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
})

redis.on('error', (err) => {
  console.error('Redis error:', err.message)
})
