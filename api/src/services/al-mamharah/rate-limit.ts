// * Minimal in-memory sliding-window rate limiter for sensitive public
// * Al-Mamharah endpoints (name verification, code checks, manager login).
// * Sufficient for a single-instance deployment; keys expire automatically.

const buckets = new Map<string, number[]>()
const MAX_BUCKETS = 10_000

/**
 * Returns true when the request is allowed under `limit` occurrences per
 * `windowMs` for the given key, recording this occurrence.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
	const now = Date.now()

	if (buckets.size > MAX_BUCKETS) {
		// * Opportunistic cleanup of stale buckets
		for (const [k, hits] of buckets) {
			if (hits.length === 0 || hits[hits.length - 1] < now - windowMs) buckets.delete(k)
		}
	}

	const hits = (buckets.get(key) ?? []).filter(t => t > now - windowMs)
	if (hits.length >= limit) {
		buckets.set(key, hits)
		return false
	}
	hits.push(now)
	buckets.set(key, hits)
	return true
}

/** Extracts a stable client identifier for rate limiting. */
export function clientKey(
	headers: { header: (name: string) => string | undefined },
	scope: string
): string {
	const forwarded = headers.header('x-forwarded-for')
	const ip = forwarded?.split(',')[0]?.trim() || headers.header('x-real-ip') || 'unknown'
	return `${scope}:${ip}`
}
