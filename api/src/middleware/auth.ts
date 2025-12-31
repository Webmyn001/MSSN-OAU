import type { Context, Next } from 'hono'
import { validateSession } from '../services/session.js'
import { findUserById } from '../services/user.js'
import { AuthenticationError } from '../lib/errors.js'
import { errorResponse } from '../lib/response.js'
import { getActiveSession } from '../services/academic-session.js'
import { isExcoForSession } from '../services/exco.js'

// * Extend Hono context to include user
declare module 'hono' {
	interface ContextVariableMap {
		user: {
			id: string
			email: string
			username: string
			fullName: string
			role: 'MEMBER' | 'EXCO'
			has2FA: boolean
		}
	}
}

/**
 * * Extracts session token from request
 * @param c - Hono context
 * @returns Session token or null
 */
function extractToken(c: Context): string | null {
	// * Try Authorization header first
	const authHeader = c.req.header('Authorization')
	if (authHeader?.startsWith('Bearer ')) {
		return authHeader.substring(7)
	}

	// * Try cookie (if cookie middleware is installed)
	// * For now, we'll only use Authorization header
	// * TODO: Add cookie support when cookie middleware is installed

	return null
}

/**
 * * Authentication middleware - validates session and attaches user to context
 */
export async function authMiddleware(c: Context, next: Next) {
	const token = extractToken(c)

	if (!token) {
		return errorResponse(c, 'Authentication required', 'AUTHENTICATION_REQUIRED', 401)
	}

	// * Validate session
	const session = await validateSession(token)
	if (!session) {
		return errorResponse(c, 'Invalid or expired session', 'INVALID_SESSION', 401)
	}

	// * Get user
	const user = await findUserById(session.userId)
	if (!user) {
		return errorResponse(c, 'User not found', 'USER_NOT_FOUND', 401)
	}

	// * Attach user to context (without sensitive fields)
	c.set('user', {
		id: user.id,
		email: user.email,
		username: user.username,
		fullName: user.fullName,
		role: user.role,
		has2FA: user.has2FA
	})

	await next()
}

/**
 * * Helper function to require authentication in route handlers
 * @param c - Hono context
 * @returns User object from context
 * @throws AuthenticationError if user not found in context
 */
export function requireAuth(c: Context) {
	const user = c.get('user')
	if (!user) {
		throw new AuthenticationError('Authentication required')
	}
	return user
}

/**
 * * Helper function to require Exco role
 * @param c - Hono context
 * @returns User object from context
 * @throws AuthenticationError if user not authenticated
 * @throws AuthorizationError if user is not Exco
 */
export async function requireExco(c: Context) {
	const user = requireAuth(c)

	// * Get current active session
	const activeSession = await getActiveSession()
	if (!activeSession) {
		const { AuthorizationError } = await import('../lib/errors.js')
		throw new AuthorizationError('No active academic session')
	}

	// * Check if user is Exco for current active session
	const excoRecord = await isExcoForSession(user.id, activeSession.id)
	if (!excoRecord) {
		const { AuthorizationError } = await import('../lib/errors.js')
		throw new AuthorizationError('Exco access required')
	}

	return user
}

