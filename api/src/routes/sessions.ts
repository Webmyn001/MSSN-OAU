import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware, requireExco } from '../middleware/auth.js'
import { successResponse, errorResponse } from '../lib/response.js'
import { logger } from '../lib/logger.js'
import {
	getSessions,
	getActiveSession,
	createSession as createAcademicSession,
	getSessionById
} from '../services/academic-session.js'
import { createSessionSchema, listSessionsQuerySchema } from '../schemas/sessions.js'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db.js'
import { academicSessions } from '../db/schema/sessions.js'
import { ConflictError } from '../lib/errors.js'

const sessionsRoute = new Hono()

// * GET /sessions - List all academic sessions (Exco only)
sessionsRoute.get('/', authMiddleware, zValidator('query', listSessionsQuerySchema), async (c) => {
	try {
		await requireExco(c)
		const { active } = c.req.valid('query')

		// * Get sessions
		const sessions = await getSessions(active)

		return successResponse(c, {
			sessions
		})
	} catch (error) {
		if (error instanceof Error && error.message.includes('Exco access required')) {
			return errorResponse(c, 'Exco access required', 'AUTHORIZATION_ERROR', 403)
		}
		logger.error({ error }, 'Failed to list sessions')
		return errorResponse(c, 'Failed to list sessions', 'LIST_ERROR', 500)
	}
})

// * POST /sessions - Create new academic session (Exco only)
sessionsRoute.post(
	'/',
	authMiddleware,
	zValidator('json', createSessionSchema),
	async (c) => {
		try {
			await requireExco(c)
			const { name, startDate, endDate, isActive } = c.req.valid('json')

			// * Check if session name already exists
			const [existingSession] = await db
				.select()
				.from(academicSessions)
				.where(eq(academicSessions.name, name))
				.limit(1)

			if (existingSession) {
				return errorResponse(c, 'Session name already exists', 'DUPLICATE_NAME', 409)
			}

			// * Create session
			const session = await createAcademicSession(
				{
					name,
					startDate: new Date(startDate),
					endDate: new Date(endDate),
					isActive
				},
				true // * Deactivate previous active session
			)

			return successResponse(c, {
				session
			})
		} catch (error) {
			if (error instanceof Error && error.message.includes('Exco access required')) {
				return errorResponse(c, 'Exco access required', 'AUTHORIZATION_ERROR', 403)
			}
			if (error instanceof ConflictError) {
				return errorResponse(c, error.message, 'CONFLICT', 409)
			}
			logger.error({ error }, 'Failed to create session')
			return errorResponse(c, 'Failed to create session', 'CREATE_ERROR', 500)
		}
	}
)

// * GET /sessions/current - Get current active session (Public)
sessionsRoute.get('/current', async (c) => {
	try {
		const session = await getActiveSession()
		if (!session) {
			return errorResponse(c, 'No active session found', 'NO_ACTIVE_SESSION', 404)
		}

		return successResponse(c, {
			session
		})
	} catch (error) {
		logger.error({ error }, 'Failed to get current session')
		return errorResponse(c, 'Failed to get current session', 'GET_ERROR', 500)
	}
})

export default sessionsRoute

