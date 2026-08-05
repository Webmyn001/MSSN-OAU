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
import { brandEmail } from '../services/email/template'
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
				html: brandEmail(
					'Admin Login Verification',
					`
						<p style="margin:0 0 16px;">Assalamu 'alaykum,</p>
						<p style="margin:0 0 16px;">You requested to sign in to the <strong>MSSN OAU Admin Dashboard</strong>. Use the code below to complete your login:</p>
						<div style="text-align:center; margin:28px 0;">
							<span style="display:inline-block; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:32px; font-weight:700; letter-spacing:10px; color:#115F34; background:#f0f7f2; border:1px solid #e3ece6; border-radius:10px; padding:14px 24px;">${otp}</span>
						</div>
						<p style="margin:0 0 16px; color:#6b7280; font-size:13px;">This code expires in <strong>60 seconds</strong>. If you didn't request this, you can safely ignore this email.</p>
						<p style="margin:0; color:#6b7280; font-size:13px;">Trouble logging in? Contact the MSSN OAU secretariat or reply to this email.</p>
					`
				),
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
