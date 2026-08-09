import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import { websiteConfig } from '../db/schema'
import { logger } from '../lib/logger'

/**
 * Read a JSON value from the website_config table (key/value JSONB store).
 * Returns `fallback` when the key is missing or the DB read fails, so the
 * public endpoints degrade gracefully (e.g. empty lists) instead of crashing.
 */
export async function getConfigValue<T>(key: string, fallback: T): Promise<T> {
	try {
		const rows = await db.select().from(websiteConfig).where(eq(websiteConfig.key, key)).limit(1)
		if (rows.length > 0 && rows[0].value != null) {
			return rows[0].value as T
		}
	} catch (e) {
		logger.error({ e, key }, 'Failed reading config value from DB')
	}
	return fallback
}

/**
 * Upsert a JSON value into the website_config table so data survives deploys
 * (unlike JSON files on an ephemeral filesystem).
 */
export async function setConfigValue(key: string, value: unknown): Promise<void> {
	const now = new Date()
	try {
		await db
			.insert(websiteConfig)
			.values({ key, value })
			.onConflictDoUpdate({ target: websiteConfig.key, set: { value, updatedAt: now } })
	} catch (e) {
		logger.error({ e, key }, 'Failed writing config value to DB')
		throw e
	}
}
