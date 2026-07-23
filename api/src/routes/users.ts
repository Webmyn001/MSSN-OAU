import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware, requireAuth, requireExco } from '../middleware/auth'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { findUserById, findUserByEmail } from '../services/user'
import { getActiveSession } from '../services/academic-session'
import { hasPaidDues } from '../services/dues'
import { isExcoForSession } from '../services/exco'
import {
	updateProfileSchema,
	duesPaymentSchema,
	listUsersQuerySchema,
	updateUserSchema
} from '../schemas/users'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import { users } from '../db/schema/users'
import { ConflictError } from '../lib/errors'
import { getSessionById } from '../services/academic-session'
import { createExco, deleteExco } from '../services/exco'

const usersRoute = new Hono()

// * GET /users/me - Get current user profile
usersRoute.get('/me', authMiddleware, async c => {
	try {
		const user = requireAuth(c)

		// * Get full user record
		const fullUser = await findUserById(user.id)
		if (!fullUser) {
			return errorResponse(c, 'User not found', 'USER_NOT_FOUND', 404)
		}

		// * Get current active session
		const activeSession = await getActiveSession()

		// * Compute duesPaid and role
		let duesPaid = false
		let role: 'member' | 'exco' = 'member'

		if (activeSession) {
			duesPaid = await hasPaidDues(user.id, activeSession.id)
			const excoRecord = await isExcoForSession(user.id, activeSession.id)
			if (excoRecord) {
				role = 'exco'
			}
		}

		// * Remove sensitive fields
		const { passwordHash: _, twoFASecret: __, twoFABackupCodes: ___, ...userProfile } = fullUser

		return successResponse(c, {
			...userProfile,
			duesPaid,
			role,
			has2FA: fullUser.has2FA
		})
	} catch (error) {
		if (error instanceof Error && error.message.includes('Authentication required')) {
			return errorResponse(c, 'Authentication required', 'AUTHENTICATION_REQUIRED', 401)
		}
		logger.error({ error }, 'Failed to get user profile')
		return errorResponse(c, 'Failed to get user profile', 'PROFILE_ERROR', 500)
	}
})

// * PATCH /users/me - Update current user profile
usersRoute.patch('/me', authMiddleware, zValidator('json', updateProfileSchema), async c => {
	try {
		const user = requireAuth(c)
		const updates = c.req.valid('json')

		// * Check if email is being changed and if it already exists
		if (updates.email && updates.email !== user.email) {
			const existingUser = await findUserByEmail(updates.email)
			if (existingUser) {
				return errorResponse(c, 'Email already in use', 'EMAIL_EXISTS', 409)
			}
		}

		// * Update user
		const [updatedUser] = await db
			.update(users)
			.set({ ...updates, updatedAt: new Date() })
			.where(eq(users.id, user.id))
			.returning()

		if (!updatedUser) {
			return errorResponse(c, 'User not found', 'USER_NOT_FOUND', 404)
		}

		// * Remove sensitive fields
		const { passwordHash: _, twoFASecret: __, twoFABackupCodes: ___, ...userProfile } = updatedUser

		return successResponse(c, {
			user: userProfile,
			message: 'Profile updated successfully'
		})
	} catch (error) {
		if (error instanceof ConflictError) {
			return errorResponse(c, error.message, 'CONFLICT', 409)
		}
		logger.error({ error }, 'Failed to update user profile')
		return errorResponse(c, 'Failed to update user profile', 'UPDATE_ERROR', 500)
	}
})

// * PATCH /users/me/pay - Pay for dues (placeholder - requires Paystack integration)
usersRoute.patch('/me/pay', authMiddleware, zValidator('json', duesPaymentSchema), async c => {
	try {
		const user = requireAuth(c)
		const { amount: _amount, currency: _currency, sessionId } = c.req.valid('json')

		// * Get session (use provided or current active)
		const session = sessionId ? await getSessionById(sessionId) : await getActiveSession()
		if (!session) {
			return errorResponse(c, 'No active session found', 'NO_SESSION', 400)
		}

		// * Check if user already paid
		const alreadyPaid = await hasPaidDues(user.id, session.id)
		if (alreadyPaid) {
			return errorResponse(c, 'Dues already paid for this session', 'ALREADY_PAID', 400)
		}

		// * TODO: Integrate Paystack payment initialization
		// * For now, return error
		return errorResponse(c, 'Payment integration not yet implemented', 'NOT_IMPLEMENTED', 501)
	} catch (error) {
		logger.error({ error }, 'Failed to initiate dues payment')
		return errorResponse(c, 'Failed to initiate dues payment', 'PAYMENT_ERROR', 500)
	}
})

// * GET /users - List all users (Exco only)
usersRoute.get('/', authMiddleware, zValidator('query', listUsersQuerySchema), async c => {
	try {
		await requireExco(c)
		const { page, limit, search, role, duesPaid, sessionId } = c.req.valid('query')

		// * Get session (use provided or current active)
		const session = sessionId ? await getSessionById(sessionId) : await getActiveSession()
		if (!session) {
			return errorResponse(c, 'No active session found', 'NO_SESSION', 400)
		}

		// * Get all users (we'll filter in memory for now due to Drizzle limitations)
		const allUsers = await db.select().from(users)

		// * Filter and compute role/duesPaid
		let filteredUsers = allUsers.map(u => ({
			...u,
			duesPaid: false,
			role: 'member' as 'member' | 'exco'
		}))

		// * Compute duesPaid and role for each user
		for (const user of filteredUsers) {
			user.duesPaid = await hasPaidDues(user.id, session.id)
			const excoRecord = await isExcoForSession(user.id, session.id)
			if (excoRecord) {
				user.role = 'exco'
			}
		}

		// * Apply filters
		if (role) {
			filteredUsers = filteredUsers.filter(u => u.role === role)
		}
		if (duesPaid !== undefined) {
			filteredUsers = filteredUsers.filter(u => u.duesPaid === duesPaid)
		}
		if (search) {
			const searchLower = search.toLowerCase()
			filteredUsers = filteredUsers.filter(
				u =>
					u.fullName.toLowerCase().includes(searchLower) ||
					u.email.toLowerCase().includes(searchLower) ||
					(u.matricNumber && u.matricNumber.toLowerCase().includes(searchLower))
			)
		}

		// * Apply pagination
		const total = filteredUsers.length
		const totalPages = Math.ceil(total / limit)
		const offset = (page - 1) * limit
		const paginatedUsers = filteredUsers.slice(offset, offset + limit)

		// * Remove sensitive fields
		const sanitizedUsers = paginatedUsers.map(u => {
			const { passwordHash: _, twoFASecret: __, twoFABackupCodes: ___, ...sanitized } = u
			return sanitized
		})

		return successResponse(c, {
			users: sanitizedUsers,
			pagination: {
				page,
				limit,
				total,
				totalPages
			}
		})
	} catch (error) {
		if (error instanceof Error && error.message.includes('Exco access required')) {
			return errorResponse(c, 'Exco access required', 'AUTHORIZATION_ERROR', 403)
		}
		logger.error({ error }, 'Failed to list users')
		return errorResponse(c, 'Failed to list users', 'LIST_ERROR', 500)
	}
})

// * GET /users/{userId} - Get specific user (Exco only)
usersRoute.get('/:userId', authMiddleware, async c => {
	try {
		await requireExco(c)
		const userId = c.req.param('userId')

		const user = await findUserById(userId)
		if (!user) {
			return errorResponse(c, 'User not found', 'USER_NOT_FOUND', 404)
		}

		// * Get current active session
		const activeSession = await getActiveSession()

		// * Compute duesPaid and role
		let duesPaid = false
		let role: 'member' | 'exco' = 'member'

		if (activeSession) {
			duesPaid = await hasPaidDues(user.id, activeSession.id)
			const excoRecord = await isExcoForSession(user.id, activeSession.id)
			if (excoRecord) {
				role = 'exco'
			}
		}

		// * Remove sensitive fields
		const { passwordHash: _, twoFASecret: __, twoFABackupCodes: ___, ...userProfile } = user

		return successResponse(c, {
			user: {
				...userProfile,
				duesPaid,
				role
			}
		})
	} catch (error) {
		if (error instanceof Error && error.message.includes('Exco access required')) {
			return errorResponse(c, 'Exco access required', 'AUTHORIZATION_ERROR', 403)
		}
		logger.error({ error }, 'Failed to get user')
		return errorResponse(c, 'Failed to get user', 'GET_ERROR', 500)
	}
})

// * PATCH /users/{userId} - Update specific user (Exco only)
usersRoute.patch('/:userId', authMiddleware, zValidator('json', updateUserSchema), async c => {
	try {
		await requireExco(c)
		const userId = c.req.param('userId')
		const updates = c.req.valid('json')

		// * Check if user exists
		const existingUser = await findUserById(userId)
		if (!existingUser) {
			return errorResponse(c, 'User not found', 'USER_NOT_FOUND', 404)
		}

		// * Check if email is being changed and if it already exists
		if (updates.email && updates.email !== existingUser.email) {
			const emailUser = await findUserByEmail(updates.email)
			if (emailUser) {
				return errorResponse(c, 'Email already in use', 'EMAIL_EXISTS', 409)
			}
		}

		// * Convert role to uppercase if provided
		const dbUpdates: any = { ...updates, updatedAt: new Date() }
		if (updates.role) {
			dbUpdates.role = updates.role.toUpperCase() as 'MEMBER' | 'EXCO'
		}
		// * Remove duesPaid from updates (it's computed, not stored)
		delete dbUpdates.duesPaid

		// * Update user
		const [updatedUser] = await db
			.update(users)
			.set(dbUpdates)
			.where(eq(users.id, userId))
			.returning()

		if (!updatedUser) {
			return errorResponse(c, 'User not found', 'USER_NOT_FOUND', 404)
		}

		// * Handle role change (add/remove from excos table)
		const activeSession = await getActiveSession()
		if (activeSession && updates.role !== undefined) {
			const currentExco = await isExcoForSession(userId, activeSession.id)
			if (updates.role === 'exco' && !currentExco) {
				// * Add to excos table
				await createExco({
					userId,
					sessionId: activeSession.id,
					position: 'Member' // * Default position
				})
			} else if (updates.role === 'member' && currentExco) {
				// * Remove from excos table
				await deleteExco(currentExco.id)
			}
		}

		// * Remove sensitive fields
		const { passwordHash: _, twoFASecret: __, twoFABackupCodes: ___, ...userProfile } = updatedUser

		return successResponse(c, {
			user: userProfile,
			message: 'User updated successfully'
		})
	} catch (error) {
		if (error instanceof Error && error.message.includes('Exco access required')) {
			return errorResponse(c, 'Exco access required', 'AUTHORIZATION_ERROR', 403)
		}
		logger.error({ error }, 'Failed to update user')
		return errorResponse(c, 'Failed to update user', 'UPDATE_ERROR', 500)
	}
})

// * DELETE /users/{userId} - Delete user (Exco only)
usersRoute.delete('/:userId', authMiddleware, async c => {
	try {
		await requireExco(c)
		const userId = c.req.param('userId')

		// * Prevent self-deletion
		const currentUser = requireAuth(c)
		if (userId === currentUser.id) {
			return errorResponse(c, 'Cannot delete your own account', 'SELF_DELETE', 400)
		}

		// * Check if user exists
		const user = await findUserById(userId)
		if (!user) {
			return errorResponse(c, 'User not found', 'USER_NOT_FOUND', 404)
		}

		// * Delete user (cascade will handle related records)
		await db.delete(users).where(eq(users.id, userId))

		return successResponse(c, {
			message: 'User deleted successfully'
		})
	} catch (error) {
		if (error instanceof Error && error.message.includes('Exco access required')) {
			return errorResponse(c, 'Exco access required', 'AUTHORIZATION_ERROR', 403)
		}
		logger.error({ error }, 'Failed to delete user')
		return errorResponse(c, 'Failed to delete user', 'DELETE_ERROR', 500)
	}
})

export default usersRoute
