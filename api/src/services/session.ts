import { eq, and, lt, gt } from 'drizzle-orm'
import { db } from '../lib/db'
import { authSessions, type AuthSession, type NewAuthSession } from '../db/schema/auth-sessions'
import { logger } from '../lib/logger'
import { createId } from '@paralleldrive/cuid2'

// * Session expiration time (14 days in milliseconds)
const SESSION_EXPIRATION_MS = 14 * 24 * 60 * 60 * 1000

/**
 * * Creates a new authentication session for a user
 * @param userId - User ID
 * @param expiresIn - Optional expiration time in milliseconds (defaults to 14 days)
 * @returns Created session object
 */
export async function createSession(
	userId: string,
	expiresIn: number = SESSION_EXPIRATION_MS
): Promise<AuthSession> {
	const token = createId()
	const expiresAt = new Date(Date.now() + expiresIn)

	const newSession: NewAuthSession = {
		userId,
		token,
		expiresAt
	}

	try {
		const [session] = await db.insert(authSessions).values(newSession).returning()
		logger.info({ userId, sessionId: session.id }, 'Session created')
		return session
	} catch (error) {
		logger.error({ error, userId }, 'Failed to create session')
		throw error
	}
}

/**
 * * Validates a session token and returns the session if valid
 * @param token - Session token
 * @returns Session object if valid, null if invalid or expired
 */
export async function validateSession(token: string): Promise<AuthSession | null> {
	try {
		const [session] = await db
			.select()
			.from(authSessions)
			.where(and(eq(authSessions.token, token), gt(authSessions.expiresAt, new Date())))
			.limit(1)

		// * Check if session exists and is not expired
		if (!session) {
			return null
		}

		if (session.expiresAt < new Date()) {
			// * Session expired, delete it
			await deleteSession(token)
			return null
		}

		// * Update last used timestamp
		await db
			.update(authSessions)
			.set({ lastUsedAt: new Date() })
			.where(eq(authSessions.token, token))

		return session
	} catch (error) {
		logger.error({ error, token }, 'Failed to validate session')
		return null
	}
}

/**
 * * Deletes a session by token
 * @param token - Session token
 */
export async function deleteSession(token: string): Promise<void> {
	try {
		await db.delete(authSessions).where(eq(authSessions.token, token))
		logger.info({ token }, 'Session deleted')
	} catch (error) {
		logger.error({ error, token }, 'Failed to delete session')
		throw error
	}
}

/**
 * * Deletes all sessions for a user
 * @param userId - User ID
 */
export async function deleteUserSessions(userId: string): Promise<void> {
	try {
		await db.delete(authSessions).where(eq(authSessions.userId, userId))
		logger.info({ userId }, 'All user sessions deleted')
	} catch (error) {
		logger.error({ error, userId }, 'Failed to delete user sessions')
		throw error
	}
}

/**
 * * Refreshes a session by extending its expiration
 * @param token - Session token
 * @param expiresIn - Optional expiration time in milliseconds (defaults to 14 days)
 * @returns Updated session object
 */
export async function refreshSession(
	token: string,
	expiresIn: number = SESSION_EXPIRATION_MS
): Promise<AuthSession | null> {
	const expiresAt = new Date(Date.now() + expiresIn)

	try {
		const [session] = await db
			.update(authSessions)
			.set({ expiresAt, lastUsedAt: new Date() })
			.where(eq(authSessions.token, token))
			.returning()

		if (!session) {
			return null
		}

		logger.info({ token, sessionId: session.id }, 'Session refreshed')
		return session
	} catch (error) {
		logger.error({ error, token }, 'Failed to refresh session')
		return null
	}
}

/**
 * * Cleans up expired sessions (can be run as a background job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
	try {
		// * Note: Drizzle doesn't return rowCount directly
		// * We'll need to count before deletion or use a different approach
		await db.delete(authSessions).where(lt(authSessions.expiresAt, new Date()))
		// * For now, return 0 as we can't get the count from Drizzle
		// * TODO: Use raw query if we need exact count
		const deletedCount = 0
		logger.info({ deletedCount }, 'Expired sessions cleaned up')
		return deletedCount
	} catch (error) {
		logger.error({ error }, 'Failed to cleanup expired sessions')
		return 0
	}
}
