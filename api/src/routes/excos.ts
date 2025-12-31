import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware, requireExco } from '../middleware/auth.js'
import { successResponse, errorResponse } from '../lib/response.js'
import { logger } from '../lib/logger.js'
import { findUserByEmail, findUserById } from '../services/user.js'
import { getActiveSession, getSessionById } from '../services/academic-session.js'
import {
	createExco,
	getExcosForSession,
	getExcoById,
	updateExco,
	deleteExco,
	isExcoForSession
} from '../services/exco.js'
import { inviteExcoSchema, listExcosQuerySchema, updateExcoSchema } from '../schemas/excos.js'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db.js'
import { users } from '../db/schema/users.js'
import { ConflictError } from '../lib/errors.js'
import { sendEmailWithContent } from '../services/email/plunk.js'

const excosRoute = new Hono()

// * POST /excos/invite - Invite Exco member
excosRoute.post(
	'/invite',
	authMiddleware,
	zValidator('json', inviteExcoSchema),
	async (c) => {
		try {
			await requireExco(c)
			const { email, fullName, position, phone, sessionId } = c.req.valid('json')

			// * Get session (use provided or current active)
			let session = sessionId ? await getSessionById(sessionId) : await getActiveSession()
			if (!session) {
				return errorResponse(c, 'No active session found', 'NO_SESSION', 400)
			}

			// * Check if user exists (by email)
			let user = await findUserByEmail(email)
			if (!user) {
				// * User doesn't exist - could create user or return error
				// * For now, return error (user must register first)
				return errorResponse(
					c,
					'User with this email does not exist. User must register first.',
					'USER_NOT_FOUND',
					404
				)
			}

			// * Check if already exco for this session
			const existingExco = await isExcoForSession(user.id, session.id)
			if (existingExco) {
				return errorResponse(
					c,
					'User is already an Exco for this session',
					'ALREADY_EXCO',
					409
				)
			}

			// * Create exco record
			const exco = await createExco({
				userId: user.id,
				sessionId: session.id,
				position,
				imageUrl: null
			})

			// * TODO: Send invitation email via Plunk
			// * For now, just log
			logger.info({ excoId: exco.id, email, sessionId: session.id }, 'Exco invited')

			return successResponse(c, {
				message: 'Invitation sent successfully',
				inviteToken: exco.id // * Using exco ID as token for now
			})
		} catch (error) {
			if (error instanceof Error && error.message.includes('Exco access required')) {
				return errorResponse(c, 'Exco access required', 'AUTHORIZATION_ERROR', 403)
			}
			if (error instanceof ConflictError) {
				return errorResponse(c, error.message, 'CONFLICT', 409)
			}
			logger.error({ error }, 'Failed to invite exco')
			return errorResponse(c, 'Failed to invite exco', 'INVITE_ERROR', 500)
		}
	}
)

// * GET /excos - List all Excos
excosRoute.get('/', authMiddleware, zValidator('query', listExcosQuerySchema), async (c) => {
	try {
		await requireExco(c)
		const { sessionId } = c.req.valid('query')

		// * Get session (use provided or current active)
		let session = sessionId ? await getSessionById(sessionId) : await getActiveSession()
		if (!session) {
			return errorResponse(c, 'No active session found', 'NO_SESSION', 400)
		}

		// * Get excos for session
		const excosList = await getExcosForSession(session.id)

		// * Get user details for each exco
		const excosWithDetails = await Promise.all(
			excosList.map(async (exco) => {
				const user = await findUserById(exco.userId)
				if (!user) {
					return null
				}

				return {
					id: exco.id,
					userId: exco.userId,
					sessionId: exco.sessionId,
					sessionName: session.name,
					fullName: user.fullName,
					position: exco.position,
					email: user.email,
					phone: user.phone,
					imageUrl: exco.imageUrl,
					createdAt: exco.createdAt
				}
			})
		)

		// * Filter out nulls
		const validExcos = excosWithDetails.filter((exco) => exco !== null)

		return successResponse(c, {
			excos: validExcos
		})
	} catch (error) {
		if (error instanceof Error && error.message.includes('Exco access required')) {
			return errorResponse(c, 'Exco access required', 'AUTHORIZATION_ERROR', 403)
		}
		logger.error({ error }, 'Failed to list excos')
		return errorResponse(c, 'Failed to list excos', 'LIST_ERROR', 500)
	}
})

// * PATCH /excos/{excoId} - Update Exco details
excosRoute.patch(
	'/:excoId',
	authMiddleware,
	zValidator('json', updateExcoSchema),
	async (c) => {
		try {
			await requireExco(c)
			const excoId = c.req.param('excoId')
			const updates = c.req.valid('json')

			// * Check if exco exists
			const exco = await getExcoById(excoId)
			if (!exco) {
				return errorResponse(c, 'Exco not found', 'EXCO_NOT_FOUND', 404)
			}

			// * Update exco
			const updatedExco = await updateExco(excoId, updates)
			if (!updatedExco) {
				return errorResponse(c, 'Failed to update exco', 'UPDATE_ERROR', 500)
			}

			// * Get user details
			const user = await findUserById(updatedExco.userId)
			if (!user) {
				return errorResponse(c, 'User not found', 'USER_NOT_FOUND', 404)
			}

			return successResponse(c, {
				exco: {
					...updatedExco,
					fullName: user.fullName,
					email: user.email,
					phone: user.phone
				},
				message: 'Exco updated successfully'
			})
		} catch (error) {
			if (error instanceof Error && error.message.includes('Exco access required')) {
				return errorResponse(c, 'Exco access required', 'AUTHORIZATION_ERROR', 403)
			}
			logger.error({ error }, 'Failed to update exco')
			return errorResponse(c, 'Failed to update exco', 'UPDATE_ERROR', 500)
		}
	}
)

// * DELETE /excos/{excoId} - Remove Exco member
excosRoute.delete('/:excoId', authMiddleware, async (c) => {
	try {
		await requireExco(c)
		const excoId = c.req.param('excoId')

		// * Check if exco exists
		const exco = await getExcoById(excoId)
		if (!exco) {
			return errorResponse(c, 'Exco not found', 'EXCO_NOT_FOUND', 404)
		}

		// * Delete exco
		const deleted = await deleteExco(excoId)
		if (!deleted) {
			return errorResponse(c, 'Failed to delete exco', 'DELETE_ERROR', 500)
		}

		return successResponse(c, {
			message: 'Exco removed successfully'
		})
	} catch (error) {
		if (error instanceof Error && error.message.includes('Exco access required')) {
			return errorResponse(c, 'Exco access required', 'AUTHORIZATION_ERROR', 403)
		}
		logger.error({ error }, 'Failed to delete exco')
		return errorResponse(c, 'Failed to delete exco', 'DELETE_ERROR', 500)
	}
})

export default excosRoute

