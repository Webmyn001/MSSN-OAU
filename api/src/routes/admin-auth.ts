import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import {
	verifyAdminCredentials,
	createOTP,
	verifyOTP,
	generateJWT,
	verifyJWT
} from '../services/admin-auth'
import { sendEmailWithContent } from '../services/email/brevo'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'

const adminAuth = new Hono()

const loginSchema = z.object({
	email: z.string().email('Invalid email format'),
	password: z.string().min(1, 'Password is required')
})

const verifyOtpSchema = z.object({
	email: z.string().email('Invalid email format'),
	code: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric')
})

// POST /admin-auth/login — validate email+password, send OTP
adminAuth.post('/login', zValidator('json', loginSchema), async c => {
	try {
		const { email, password } = c.req.valid('json')

		const user = await verifyAdminCredentials(email, password)
		if (!user) {
			return errorResponse(c, 'Invalid email or password', 'INVALID_CREDENTIALS', 401)
		}

		const otp = createOTP(email)

		// Send OTP via Brevo (non-blocking in dev if Brevo isn't configured)
		try {
			await sendEmailWithContent({
				to: email,
				subject: 'MSSN OAU Admin — Your Login Code',
				html: `
					<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
						<div style="text-align:center;margin-bottom:24px;">
							<h1 style="color:#003a1c;font-size:20px;margin:0;">MSSN OAU Admin</h1>
						</div>
						<div style="background:#f8faf9;border:1px solid #e2e8f0;border-radius:12px;padding:32px;text-align:center;">
							<p style="color:#475569;font-size:14px;margin:0 0 16px;">Your verification code is</p>
							<p style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#003a1c;margin:0 0 16px;">${otp}</p>
							<p style="color:#94a3b8;font-size:12px;margin:0;">This code expires in 60 seconds.</p>
						</div>
						<p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:24px;">If you didn't request this, ignore this email.</p>
					</div>
				`,
				text: `Your MSSN OAU Admin login code is: ${otp}. It expires in 60 seconds.`
			})
			logger.info({ email }, 'OTP sent via Brevo')
		} catch (emailErr) {
			logger.warn({ emailErr, email }, 'Brevo email failed — OTP returned in response for dev')
		}

		return successResponse(c, {
			message: 'OTP sent to your email',
			email,
			// In development, include OTP in response for testing
			...(process.env.NODE_ENV === 'development' && { otp })
		})
	} catch (error) {
		logger.error({ error }, 'Admin login failed')
		return errorResponse(c, 'Login failed', 'LOGIN_ERROR', 500)
	}
})

// POST /admin-auth/verify-otp — verify OTP and return JWT
adminAuth.post('/verify-otp', zValidator('json', verifyOtpSchema), async c => {
	try {
		const { email, code } = c.req.valid('json')

		const valid = verifyOTP(email, code)
		if (!valid) {
			return errorResponse(c, 'Invalid or expired OTP code', 'INVALID_OTP', 401)
		}

		// Find user info for JWT
		const { ADMIN_USERS } = await import('../config/admin-users')
		const user = ADMIN_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())
		if (!user) {
			return errorResponse(c, 'User not found', 'USER_NOT_FOUND', 404)
		}

		const token = await generateJWT({
			email: user.email,
			fullName: user.fullName,
			role: user.role
		})

		logger.info({ email }, 'Admin authenticated successfully')

		return successResponse(c, {
			token,
			user: {
				email: user.email,
				fullName: user.fullName,
				role: user.role
			}
		})
	} catch (error) {
		logger.error({ error }, 'OTP verification failed')
		return errorResponse(c, 'Verification failed', 'VERIFY_ERROR', 500)
	}
})

// GET /admin-auth/validate — check if token is valid
adminAuth.get('/validate', async c => {
	const authHeader = c.req.header('Authorization')
	const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

	if (!token) {
		return errorResponse(c, 'No token provided', 'NO_TOKEN', 401)
	}

	const user = await verifyJWT(token)
	if (!user) {
		return errorResponse(c, 'Invalid or expired token', 'INVALID_TOKEN', 401)
	}

	return successResponse(c, { user })
})

export default adminAuth
