import type { Context, Next } from 'hono'
import { errorResponse } from '../lib/response'
import { AuthenticationError, AuthorizationError } from '../lib/errors'
import type { AlMamharahManager, AlMamharahParticipant } from '../db/schema'
import { validateParticipantSession } from '../services/al-mamharah/verification'
import { getActiveManager, verifyManagerToken } from '../services/al-mamharah/managers'

// * Al-Mamharah authentication middleware.
// * Participant sessions are database-backed opaque tokens; manager access uses
// * a dedicated JWT secret so tokens can never be replayed as site-admin JWTs.

declare module 'hono' {
	interface ContextVariableMap {
		almamharahParticipant: AlMamharahParticipant
		almamharahParticipantToken: string
		almamharahManager: AlMamharahManager
	}
}

function extractBearerToken(c: Context): string | null {
	const authHeader = c.req.header('Authorization')
	if (authHeader?.startsWith('Bearer ')) return authHeader.substring(7).trim()
	return null
}

/** Requires a valid, active participant session. */
export async function participantAuth(c: Context, next: Next) {
	const token = extractBearerToken(c)
	if (!token) {
		return errorResponse(
			c,
			'Authentication required. Please enter the programme to continue.',
			'AUTHENTICATION_REQUIRED',
			401
		)
	}

	const result = await validateParticipantSession(token)
	if (!result) {
		return errorResponse(
			c,
			'Your session has expired or your access is no longer active. Please enter the programme again.',
			'INVALID_SESSION',
			401
		)
	}

	c.set('almamharahParticipant', result.participant)
	c.set('almamharahParticipantToken', token)
	await next()
}

/** Requires a valid manager JWT whose account is still ACTIVE. */
export async function managerAuth(c: Context, next: Next) {
	const token = extractBearerToken(c)
	if (!token) {
		return errorResponse(c, 'Authentication required', 'AUTHENTICATION_REQUIRED', 401)
	}

	const payload = await verifyManagerToken(token)
	if (!payload) {
		return errorResponse(c, 'Invalid or expired token', 'INVALID_TOKEN', 401)
	}

	// * Re-check the database on every request so revoked managers lose access
	// * immediately, without waiting for the JWT to expire.
	const manager = await getActiveManager(payload.managerId)
	if (!manager) {
		return errorResponse(c, 'Your manager access is no longer active', 'MANAGER_INACTIVE', 403)
	}

	c.set('almamharahManager', manager)
	await next()
}

/** Returns the authenticated participant, throwing an AuthenticationError. */
export function requireParticipant(c: Context): AlMamharahParticipant {
	const participant = c.get('almamharahParticipant')
	if (!participant) {
		throw new AuthenticationError('Authentication required')
	}
	return participant
}

/** Returns the authenticated manager, throwing an AuthenticationError. */
export function requireManager(c: Context): AlMamharahManager {
	const manager = c.get('almamharahManager')
	if (!manager) {
		throw new AuthenticationError('Authentication required')
	}
	return manager
}

/** Returns the manager only when they have the PRIMARY role. */
export function requirePrimaryManager(c: Context): AlMamharahManager {
	const manager = requireManager(c)
	if (manager.role !== 'PRIMARY') {
		throw new AuthorizationError('Only the primary Programme Manager can perform this action')
	}
	return manager
}
