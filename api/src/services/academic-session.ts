import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import {
	academicSessions,
	type AcademicSession,
	type NewAcademicSession
} from '../db/schema/sessions'
import { logger } from '../lib/logger'

/**
 * * Gets the current active academic session
 * @returns Active session or null if none exists
 */
export async function getActiveSession(): Promise<AcademicSession | null> {
	try {
		const [session] = await db
			.select()
			.from(academicSessions)
			.where(eq(academicSessions.isActive, true))
			.limit(1)

		return session || null
	} catch (error) {
		logger.error({ error }, 'Failed to get active session')
		return null
	}
}

/**
 * * Gets all academic sessions, optionally filtered by active status
 * @param active - Optional filter for active status
 * @returns Array of academic sessions
 */
export async function getSessions(active?: boolean): Promise<AcademicSession[]> {
	try {
		if (active !== undefined) {
			return await db.select().from(academicSessions).where(eq(academicSessions.isActive, active))
		}
		return await db.select().from(academicSessions)
	} catch (error) {
		logger.error({ error, active }, 'Failed to get sessions')
		throw error
	}
}

/**
 * * Gets an academic session by ID
 * @param sessionId - Session ID
 * @returns Session or null if not found
 */
export async function getSessionById(sessionId: string): Promise<AcademicSession | null> {
	try {
		const [session] = await db
			.select()
			.from(academicSessions)
			.where(eq(academicSessions.id, sessionId))
			.limit(1)

		return session || null
	} catch (error) {
		logger.error({ error, sessionId }, 'Failed to get session by ID')
		return null
	}
}

/**
 * * Deactivates the current active session
 */
export async function deactivateActiveSession(): Promise<void> {
	try {
		await db
			.update(academicSessions)
			.set({ isActive: false, updatedAt: new Date() })
			.where(eq(academicSessions.isActive, true))
		logger.info('Deactivated active session')
	} catch (error) {
		logger.error({ error }, 'Failed to deactivate active session')
		throw error
	}
}

/**
 * * Creates a new academic session
 * @param sessionData - Session data
 * @param deactivatePrevious - Whether to deactivate previous active session (default: true)
 * @returns Created session
 */
export async function createSession(
	sessionData: NewAcademicSession,
	deactivatePrevious: boolean = true
): Promise<AcademicSession> {
	try {
		// * If this session should be active, deactivate the previous one
		if (sessionData.isActive && deactivatePrevious) {
			await deactivateActiveSession()
		}

		const [session] = await db.insert(academicSessions).values(sessionData).returning()
		logger.info({ sessionId: session.id, name: session.name }, 'Academic session created')
		return session
	} catch (error) {
		logger.error({ error, sessionData }, 'Failed to create academic session')
		throw error
	}
}
