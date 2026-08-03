import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {
	registerSchema,
	loginSchema,
	resetPasswordRequestSchema,
	resetPasswordConfirmSchema,
	verify2FASchema
} from '../schemas/auth'
import {
	createUser,
	findUserByEmail,
	findUserById,
	verifyPassword,
	updateUserPassword
} from '../services/user'
import { createSession, validateSession, deleteSession } from '../services/session'
import {
	createPasswordResetToken,
	validatePasswordResetToken,
	markTokenAsUsed
} from '../services/password-reset'
import { sendEmailWithContent } from '../services/email/brevo'
import { generatePasswordResetEmail } from '../templates/password-reset'
import env from '../lib/env'
import { successResponse, errorResponse } from '../lib/response'
import { ConflictError } from '../lib/errors'
import { logger } from '../lib/logger'
import { eq, and } from 'drizzle-orm'
import { db } from '../lib/db'
import { excos } from '../db/schema/excos'
import { academicSessions } from '../db/schema/sessions'
import {
	generateSecret,
	generateQRCode,
	generateBackupCodes,
	store2FASetup,
	getUser2FASecret,
	getUserBackupCodes,
	verifyCode,
	verifyBackupCode
} from '../services/2fa'
import { authMiddleware, requireExco } from '../middleware/auth'

const auth = new Hono()

// * POST /auth/register - User registration
auth.post('/register', zValidator('json', registerSchema), async c => {
	try {
		const data = c.req.valid('json')

		// * Create user
		const user = await createUser({
			email: data.email,
			password: data.password,
			username: data.username,
			fullName: data.fullName
		})

		return successResponse(c, { user }, undefined, 201)
	} catch (error) {
		if (error instanceof ConflictError) {
			return errorResponse(c, error.message, 'EMAIL_ALREADY_EXISTS', 409)
		}
		logger.error({ error }, 'Registration failed')
		return errorResponse(c, 'Registration failed', 'REGISTRATION_ERROR', 500)
	}
})

// * POST /auth/login - User login
auth.post('/login', zValidator('json', loginSchema), async c => {
	try {
		const { email, password } = c.req.valid('json')

		// * Find user by email
		const user = await findUserByEmail(email)
		if (!user) {
			return errorResponse(c, 'Invalid email or password', 'INVALID_CREDENTIALS', 401)
		}

		// * Verify password
		const isValidPassword = await verifyPassword(password, user.passwordHash)
		if (!isValidPassword) {
			return errorResponse(c, 'Invalid email or password', 'INVALID_CREDENTIALS', 401)
		}

		// * Check if user is Exco and has 2FA enabled
		// * Get current active session
		const [activeSession] = await db
			.select()
			.from(academicSessions)
			.where(eq(academicSessions.isActive, true))
			.limit(1)

		if (activeSession) {
			// * Check if user is Exco for current active session
			const [excoRecord] = await db
				.select()
				.from(excos)
				.where(and(eq(excos.userId, user.id), eq(excos.sessionId, activeSession.id)))
				.limit(1)

			if (excoRecord && user.has2FA) {
				// * Exco with 2FA enabled - return requires2FA flag
				// * Create temporary session for 2FA verification (5 minutes)
				const tempSession = await createSession(user.id, 5 * 60 * 1000)

				return successResponse(c, {
					requires2FA: true,
					sessionToken: tempSession.token
				})
			}
		}

		// * Create session
		const session = await createSession(user.id)

		// * Remove sensitive fields from user object
		const { passwordHash: _, twoFASecret: __, twoFABackupCodes: ___, ...userWithoutSecrets } = user

		return successResponse(c, {
			user: userWithoutSecrets,
			sessionToken: session.token,
			expiresAt: session.expiresAt.toISOString()
		})
	} catch (error) {
		logger.error({ error }, 'Login failed')
		return errorResponse(c, 'Login failed', 'LOGIN_ERROR', 500)
	}
})

// * POST /auth/reset-password - Request password reset
auth.post('/reset-password', zValidator('json', resetPasswordRequestSchema), async c => {
	try {
		const { email } = c.req.valid('json')

		// * Find user by email
		const user = await findUserByEmail(email)
		if (!user) {
			// * Don't reveal if email exists (security best practice)
			return successResponse(c, {
				message: 'If the email exists, a password reset link has been sent'
			})
		}

		// * Generate reset token
		const resetToken = await createPasswordResetToken(user.id)

		// * Generate reset link
		const resetLink = `${env.APP_URL}/reset-password?token=${resetToken.token}`

		// * Generate email content
		const emailContent = generatePasswordResetEmail(user.fullName, resetLink)

		// * Send email via Brevo
		await sendEmailWithContent({
			to: user.email,
			subject: emailContent.subject,
			html: emailContent.html,
			text: emailContent.text
		})

		logger.info({ userId: user.id, email }, 'Password reset email sent')

		return successResponse(c, {
			message: 'If the email exists, a password reset link has been sent'
		})
	} catch (error) {
		logger.error({ error }, 'Password reset request failed')
		return errorResponse(c, 'Password reset request failed', 'RESET_ERROR', 500)
	}
})

// * POST /auth/reset-password/confirm - Confirm password reset
auth.post('/reset-password/confirm', zValidator('json', resetPasswordConfirmSchema), async c => {
	try {
		const { token, newPassword } = c.req.valid('json')

		// * Validate reset token
		const resetToken = await validatePasswordResetToken(token)
		if (!resetToken) {
			return errorResponse(c, 'Invalid or expired reset token', 'INVALID_RESET_TOKEN', 400)
		}

		// * Update user password
		await updateUserPassword(resetToken.userId, newPassword)

		// * Mark token as used
		await markTokenAsUsed(token)

		logger.info({ userId: resetToken.userId }, 'Password reset completed')

		return successResponse(c, {
			message: 'Password has been reset successfully'
		})
	} catch (error) {
		logger.error({ error }, 'Password reset confirmation failed')
		return errorResponse(c, 'Password reset confirmation failed', 'RESET_CONFIRM_ERROR', 500)
	}
})

// * POST /auth/2fa/setup - Setup 2FA (Exco only)
auth.post('/2fa/setup', authMiddleware, async c => {
	try {
		const user = await requireExco(c)

		// * Check if 2FA is already enabled
		if (user.has2FA) {
			return errorResponse(c, '2FA is already enabled', '2FA_ALREADY_ENABLED', 400)
		}

		// * Get full user record
		const fullUser = await findUserByEmail(user.email)
		if (!fullUser) {
			return errorResponse(c, 'User not found', 'USER_NOT_FOUND', 404)
		}

		// * Generate 2FA secret
		const secret = generateSecret(user.email)

		// * Generate QR code
		const qrCode = await generateQRCode(secret.otpauth_url || '')

		// * Generate backup codes
		const backupCodes = generateBackupCodes(8)

		// * Store secret and backup codes (not enabled yet)
		await store2FASetup(user.id, secret.base32 || '', backupCodes)

		return successResponse(c, {
			qrCode,
			backupCodes,
			secret: secret.base32 // * For manual entry if QR code doesn't work
		})
	} catch (error) {
		if (error instanceof Error && error.message.includes('Insufficient permissions')) {
			return errorResponse(c, 'Exco access required', 'AUTHORIZATION_ERROR', 403)
		}
		logger.error({ error }, '2FA setup failed')
		return errorResponse(c, '2FA setup failed', '2FA_SETUP_ERROR', 500)
	}
})

// * POST /auth/2fa/verify - Verify 2FA code
auth.post('/2fa/verify', zValidator('json', verify2FASchema), async c => {
	try {
		const { code, sessionToken, setupToken } = c.req.valid('json')

		// * If setupToken provided, verify during setup
		if (setupToken) {
			// * TODO: Implement setup token validation
			// * For now, we'll use a different approach - require authentication
			return errorResponse(
				c,
				'Setup token verification not yet implemented',
				'NOT_IMPLEMENTED',
				501
			)
		}

		// * If sessionToken provided, verify during login
		if (sessionToken) {
			// * Validate temporary session
			const session = await validateSession(sessionToken)
			if (!session) {
				return errorResponse(c, 'Invalid or expired session', 'INVALID_SESSION', 401)
			}

			// * Get user
			const user = await findUserById(session.userId)
			if (!user) {
				return errorResponse(c, 'User not found', 'USER_NOT_FOUND', 404)
			}

			// * Get 2FA secret
			const secret = await getUser2FASecret(user.id)
			if (!secret) {
				return errorResponse(c, '2FA not set up', '2FA_NOT_SETUP', 400)
			}

			// * Verify code
			let isValid = verifyCode(secret, code)

			// * If main code fails, try backup codes
			if (!isValid) {
				const backupCodes = await getUserBackupCodes(user.id)
				if (backupCodes) {
					isValid = verifyBackupCode(backupCodes, code)
					// * TODO: Remove used backup code from array
				}
			}

			if (!isValid) {
				return errorResponse(c, 'Invalid 2FA code', 'INVALID_2FA_CODE', 401)
			}

			// * Delete temporary session
			await deleteSession(sessionToken)

			// * Create final session
			const finalSession = await createSession(user.id)

			// * Remove sensitive fields from user object
			const {
				passwordHash: _,
				twoFASecret: __,
				twoFABackupCodes: ___,
				...userWithoutSecrets
			} = user

			return successResponse(c, {
				user: userWithoutSecrets,
				sessionToken: finalSession.token,
				expiresAt: finalSession.expiresAt.toISOString()
			})
		}

		// * No token provided
		return errorResponse(c, 'Session token or setup token required', 'TOKEN_REQUIRED', 400)
	} catch (error) {
		logger.error({ error }, '2FA verification failed')
		return errorResponse(c, '2FA verification failed', '2FA_VERIFY_ERROR', 500)
	}
})

// * POST /auth/logout - Logout (delete session)
auth.post('/logout', async c => {
	try {
		const token = c.req.header('Authorization')?.replace('Bearer ', '')

		if (!token) {
			return errorResponse(c, 'No session token provided', 'NO_TOKEN', 401)
		}

		await deleteSession(token)

		return successResponse(c, { message: 'Logged out successfully' })
	} catch (error) {
		logger.error({ error }, 'Logout failed')
		return errorResponse(c, 'Logout failed', 'LOGOUT_ERROR', 500)
	}
})

export default auth
