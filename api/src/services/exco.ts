import { eq, and } from 'drizzle-orm'
import { db } from '../lib/db.js'
import { excos, type Exco, type NewExco } from '../db/schema/excos.js'
import { logger } from '../lib/logger.js'

/**
 * * Checks if a user is an Exco for a specific academic session
 * @param userId - User ID
 * @param sessionId - Academic session ID
 * @returns Exco record or null
 */
export async function isExcoForSession(
	userId: string,
	sessionId: string
): Promise<Exco | null> {
	try {
		const [exco] = await db
			.select()
			.from(excos)
			.where(and(eq(excos.userId, userId), eq(excos.sessionId, sessionId)))
			.limit(1)

		return exco || null
	} catch (error) {
		logger.error({ error, userId, sessionId }, 'Failed to check exco status')
		return null
	}
}

/**
 * * Gets all Excos for a specific academic session
 * @param sessionId - Academic session ID
 * @returns Array of Exco records
 */
export async function getExcosForSession(sessionId: string): Promise<Exco[]> {
	try {
		return await db.select().from(excos).where(eq(excos.sessionId, sessionId))
	} catch (error) {
		logger.error({ error, sessionId }, 'Failed to get excos for session')
		throw error
	}
}

/**
 * * Gets an Exco by ID
 * @param excoId - Exco ID
 * @returns Exco record or null
 */
export async function getExcoById(excoId: string): Promise<Exco | null> {
	try {
		const [exco] = await db.select().from(excos).where(eq(excos.id, excoId)).limit(1)
		return exco || null
	} catch (error) {
		logger.error({ error, excoId }, 'Failed to get exco by ID')
		return null
	}
}

/**
 * * Creates a new Exco record
 * @param excoData - Exco data
 * @returns Created Exco record
 */
export async function createExco(excoData: NewExco): Promise<Exco> {
	try {
		const [exco] = await db.insert(excos).values(excoData).returning()
		logger.info({ excoId: exco.id, userId: exco.userId, sessionId: exco.sessionId }, 'Exco created')
		return exco
	} catch (error) {
		logger.error({ error, excoData }, 'Failed to create exco')
		throw error
	}
}

/**
 * * Updates an Exco record
 * @param excoId - Exco ID
 * @param updates - Fields to update
 * @returns Updated Exco record or null
 */
export async function updateExco(
	excoId: string,
	updates: Partial<Exco>
): Promise<Exco | null> {
	try {
		const [exco] = await db
			.update(excos)
			.set({ ...updates, updatedAt: new Date() })
			.where(eq(excos.id, excoId))
			.returning()

		if (exco) {
			logger.info({ excoId }, 'Exco updated')
		}
		return exco || null
	} catch (error) {
		logger.error({ error, excoId }, 'Failed to update exco')
		return null
	}
}

/**
 * * Deletes an Exco record
 * @param excoId - Exco ID
 * @returns True if deleted, false otherwise
 */
export async function deleteExco(excoId: string): Promise<boolean> {
	try {
		const result = await db.delete(excos).where(eq(excos.id, excoId))
		logger.info({ excoId }, 'Exco deleted')
		return result.count > 0
	} catch (error) {
		logger.error({ error, excoId }, 'Failed to delete exco')
		return false
	}
}

