import { Redis } from 'ioredis'
import { REDIS_URI } from '$env/static/private'

// * Configure Redis to fail fast in dev when connection is unstable/unavailable
export const redis = new Redis(REDIS_URI, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 500,
    commandTimeout: 700,
    retryStrategy: () => null,
    reconnectOnError: () => false,
})

// Attempt initial connect, but do not crash if it fails
redis.connect().catch(() => {
    // * Silently continue; API routes will guard redis usage
})

