/**
 * PostgreSQL error helpers.
 *
 * Drizzle wraps the underlying `postgres-js` error in a `DrizzleQueryError`,
 * so the SQLSTATE code (e.g. `23505` for a unique violation) lives on the
 * `cause` chain rather than on the thrown error itself.
 */

const SQLSTATE_PATTERN = /^[0-9A-Z]{5}$/

/** Returns the PostgreSQL SQLSTATE code from a possibly wrapped error. */
export function getPostgresErrorCode(error: unknown): string | undefined {
	let current = error as { code?: unknown; cause?: unknown } | undefined
	const seen = new Set<unknown>()
	while (current && typeof current === 'object' && !seen.has(current)) {
		seen.add(current)
		if (typeof current.code === 'string' && SQLSTATE_PATTERN.test(current.code)) {
			return current.code
		}
		current = current.cause as typeof current
	}
	return undefined
}

/** True when the error is a PostgreSQL unique-violation (SQLSTATE 23505). */
export function isUniqueViolation(error: unknown): boolean {
	return getPostgresErrorCode(error) === '23505'
}
