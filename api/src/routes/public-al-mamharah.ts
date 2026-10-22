import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import {
	enterProgrammeSchema,
	forgotPasswordSchema,
	participantLoginSchema,
	resetPasswordSchema,
	submitApplicationSchema,
	verifyEnterCodeSchema
} from '../schemas/al-mamharah'
import { submitApplication } from '../services/al-mamharah/applications'
import { resolveParticipantByName } from '../services/al-mamharah/participants'
import {
	enforceForParticipant,
	setParticipantPassword,
	verifyParticipantPassword
} from '../services/al-mamharah/participant-auth'
import {
	auditAccessGranted,
	createParticipantSession,
	issueVerificationCode,
	sendVerificationEmail,
	verifyParticipantCode
} from '../services/al-mamharah/verification'
import { getSettings } from '../services/al-mamharah/settings'
import { todayInTimeZone } from '../services/al-mamharah/dates'
import { clientKey, rateLimit } from '../services/al-mamharah/rate-limit'

// * Public Al-Mamharah endpoints: application submission, password-based
// * student login (OTP only on the first login to set a password) and the
// * forgotten-password reset.

const publicAlMamharahRoute = new Hono()

// * One indistinguishable response for unknown, pending and rejected names so
// * visitors cannot enumerate which participants are approved.
const NOT_VERIFIED_MESSAGE =
	'Your participation has not yet been verified. Please contact the Programme Manager for assistance.'
const NOT_VERIFIED_MESSAGE_AR =
	'لم يتم التحقق من مشاركتك بعد. يُرجى التواصل مع مدير البرنامج للمساعدة.'

const CODE_EXPIRY_MINUTES = 30

/** GET /public/al-mamharah/info — programme window and current phase. */
publicAlMamharahRoute.get('/info', async c => {
	try {
		const settings = await getSettings()
		const today = todayInTimeZone(settings.timezone)
		const phase = today < settings.start ? 'UPCOMING' : today > settings.end ? 'ENDED' : 'ACTIVE'
		return successResponse(c, {
			start: settings.start,
			end: settings.end,
			timezone: settings.timezone,
			today,
			phase,
			tasks: settings.tasks,
			acceptingApplications: settings.acceptingApplications
		})
	} catch (error) {
		logger.error({ error }, 'Failed to read Al-Mamharah programme info')
		return errorResponse(c, 'Unable to load programme information', 'READ_ERROR', 500)
	}
})

/** POST /public/al-mamharah — submit an application. */
publicAlMamharahRoute.post('/', zValidator('json', submitApplicationSchema), async c => {
	const settings = await getSettings()
	if (!settings.acceptingApplications) {
		return errorResponse(
			c,
			'Applications for this phase of Al-Mamharah are currently closed. Please check back later or contact the Programme Manager.',
			'APPLICATIONS_CLOSED',
			403
		)
	}

	const input = c.req.valid('json')
	const application = await submitApplication({
		fullName: input.fullName,
		email: input.email,
		phone: input.phone || undefined,
		matricNumber: input.matricNumber,
		faculty: input.faculty,
		department: input.department,
		masar: input.masar,
		startSurah: input.startSurah,
		startPage: input.startPage,
		startDirection: input.startDirection,
		confirmedMemorisation: input.confirmedMemorisation,
		confirmedTajweed: input.confirmedTajweed,
		agreedGuidelines: input.agreedGuidelines
	})

	return successResponse(
		c,
		{
			id: application.id,
			fullName: application.fullName,
			masar: application.masar,
			status: application.status,
			submittedAt: application.createdAt,
			message:
				'Your application has been received. The Programme Manager will review it and you will be emailed a verification code once approved.'
		},
		undefined,
		201
	)
})

/** POST /public/al-mamharah/enter — step 1: name → password prompt or email code. */
publicAlMamharahRoute.post('/enter', zValidator('json', enterProgrammeSchema), async c => {
	if (!rateLimit(clientKey(c.req, 'almh-enter'), 5, 10 * 60 * 1000)) {
		return errorResponse(
			c,
			'Too many attempts. Please wait a few minutes and try again.',
			'RATE_LIMITED',
			400
		)
	}

	const { fullName } = c.req.valid('json')
	const resolution = await resolveParticipantByName(fullName)

	if (resolution.kind !== 'approved') {
		return successResponse(c, {
			status: 'not_verified',
			message: NOT_VERIFIED_MESSAGE,
			messageAr: NOT_VERIFIED_MESSAGE_AR
		})
	}

	// * Auto-suspend check before granting anything (self-check on sign-in).
	const participant = await enforceForParticipant(resolution.participant)
	if (participant.status !== 'ACTIVE') {
		return successResponse(c, {
			status: 'not_verified',
			message: NOT_VERIFIED_MESSAGE,
			messageAr: NOT_VERIFIED_MESSAGE_AR
		})
	}

	// * Returning students sign in with their password — no OTP is sent.
	if (participant.passwordHash) {
		return successResponse(c, {
			status: 'password_required',
			message: 'Enter your password to access your dashboard.'
		})
	}

	// * First login: email a code so the student can set their password.
	let code: string
	try {
		code = await issueVerificationCode(participant.id, 'ENTER_PROGRAMME')
	} catch (error) {
		logger.error({ error }, 'Failed to issue Al-Mamharah verification code')
		return errorResponse(
			c,
			'We could not generate a verification code right now. Please try again shortly.',
			'CODE_ERROR',
			500
		)
	}

	try {
		await sendVerificationEmail(resolution.application.email, participant.displayName, code)
	} catch (error) {
		if (process.env.NODE_ENV === 'production') {
			logger.error({ error }, 'Failed to send Al-Mamharah verification email')
			return errorResponse(
				c,
				'We could not send the verification email right now. Please try again in a moment.',
				'EMAIL_SEND_FAILED',
				500
			)
		}
		// * Outside production there is no real mailbox; fall back to the dev code.
		logger.warn({ error }, 'Al-Mamharah verification email failed (non-production)')
	}

	return successResponse(c, {
		status: 'code_sent',
		message: 'A 6-digit verification code has been sent to the email address on your application.',
		expiresInMinutes: CODE_EXPIRY_MINUTES,
		// * Development/testing convenience only — never exposed in production
		...(process.env.NODE_ENV !== 'production' && { devCode: code })
	})
})

/** POST /public/al-mamharah/enter/verify — first login: name + code + new password → session. */
publicAlMamharahRoute.post(
	'/enter/verify',
	zValidator('json', verifyEnterCodeSchema),
	async c => {
		if (!rateLimit(clientKey(c.req, 'almh-verify'), 10, 10 * 60 * 1000)) {
			return errorResponse(
				c,
				'Too many attempts. Please wait a few minutes and try again.',
				'RATE_LIMITED',
				400
			)
		}

		const { fullName, code, password } = c.req.valid('json')
		const resolution = await resolveParticipantByName(fullName)

		const invalid = () =>
			errorResponse(
				c,
				'Invalid name or code. Please check your details and try again.',
				'INVALID_CREDENTIALS',
				401
			)

		if (resolution.kind !== 'approved') return invalid()
		const participant = await enforceForParticipant(resolution.participant)
		if (participant.status !== 'ACTIVE') {
			return errorResponse(
				c,
				'Your access is currently inactive. Please contact the Programme Manager for assistance.',
				'PARTICIPANT_INACTIVE',
				403
			)
		}

		const valid = await verifyParticipantCode(participant.id, code, 'ENTER_PROGRAMME')
		if (!valid) {
			return errorResponse(
				c,
				'That code is invalid or has expired. Please request a new code.',
				'INVALID_CODE',
				401
			)
		}

		// * First login sets the password the student will use from now on.
		if (!participant.passwordHash) {
			if (!password) {
				return errorResponse(
					c,
					'Choose a password (at least 8 characters) to secure your account.',
					'PASSWORD_REQUIRED',
					400
				)
			}
			await setParticipantPassword(participant.id, password)
		}

		const session = await createParticipantSession(participant.id)
		await auditAccessGranted(participant.id, participant.displayName)

		return successResponse(c, {
			token: session.token,
			expiresAt: session.expiresAt,
			participant: {
				id: participant.id,
				displayName: participant.displayName,
				masar: participant.masar
			}
		})
	}
)

/** POST /public/al-mamharah/login — returning student: name + password → session. */
publicAlMamharahRoute.post('/login', zValidator('json', participantLoginSchema), async c => {
	if (!rateLimit(clientKey(c.req, 'almh-login'), 10, 10 * 60 * 1000)) {
		return errorResponse(
			c,
			'Too many attempts. Please wait a few minutes and try again.',
			'RATE_LIMITED',
			400
		)
	}

	const { fullName, password } = c.req.valid('json')
	const resolution = await resolveParticipantByName(fullName)

	const invalid = () =>
		errorResponse(c, 'Incorrect name or password. Please try again.', 'INVALID_CREDENTIALS', 401)

	if (resolution.kind !== 'approved') return invalid()
	const participant = await enforceForParticipant(resolution.participant)
	if (participant.status !== 'ACTIVE') {
		return errorResponse(
			c,
			'Your access is currently inactive. Please contact the Programme Manager for assistance.',
			'PARTICIPANT_INACTIVE',
			403
		)
	}

	// * No password set yet — send them through the first-login code flow.
	if (!participant.passwordHash) {
		return errorResponse(
			c,
			'No password has been set for this account yet. Please use "Enter programme" to set one.',
			'PASSWORD_NOT_SET',
			400
		)
	}

	const valid = await verifyParticipantPassword(participant, password)
	if (!valid) return invalid()

	const session = await createParticipantSession(participant.id)
	await auditAccessGranted(participant.id, participant.displayName)

	return successResponse(c, {
		token: session.token,
		expiresAt: session.expiresAt,
		participant: {
			id: participant.id,
			displayName: participant.displayName,
			masar: participant.masar
		}
	})
})

/** POST /public/al-mamharah/forgot-password — email a reset code. */
publicAlMamharahRoute.post(
	'/forgot-password',
	zValidator('json', forgotPasswordSchema),
	async c => {
		if (!rateLimit(clientKey(c.req, 'almh-forgot'), 5, 10 * 60 * 1000)) {
			return errorResponse(
				c,
				'Too many attempts. Please wait a few minutes and try again.',
				'RATE_LIMITED',
				400
			)
		}

		const { fullName } = c.req.valid('json')
		const resolution = await resolveParticipantByName(fullName)

		// * Same generic response for every case — never reveal which names exist.
		const generic = successResponse(c, {
			status: 'code_sent',
			message:
				'If that name is on the approved list, a 6-digit reset code has been emailed to you.',
			expiresInMinutes: CODE_EXPIRY_MINUTES
		})

		if (resolution.kind !== 'approved' || resolution.participant.status !== 'ACTIVE') {
			return generic
		}

		let code: string
		try {
			code = await issueVerificationCode(resolution.participant.id, 'RESET_PASSWORD')
		} catch (error) {
			logger.error({ error }, 'Failed to issue Al-Mamharah password-reset code')
			return generic
		}

		try {
			await sendVerificationEmail(
				resolution.application.email,
				resolution.participant.displayName,
				code
			)
		} catch (error) {
			logger.error({ error }, 'Failed to send Al-Mamharah password-reset email')
			return generic
		}

		return successResponse(c, {
			status: 'code_sent',
			message: 'A 6-digit reset code has been sent to your email address.',
			expiresInMinutes: CODE_EXPIRY_MINUTES,
			...(process.env.NODE_ENV !== 'production' && { devCode: code })
		})
	}
)

/** POST /public/al-mamharah/reset-password — name + code + new password → session. */
publicAlMamharahRoute.post(
	'/reset-password',
	zValidator('json', resetPasswordSchema),
	async c => {
		if (!rateLimit(clientKey(c.req, 'almh-reset'), 10, 10 * 60 * 1000)) {
			return errorResponse(
				c,
				'Too many attempts. Please wait a few minutes and try again.',
				'RATE_LIMITED',
				400
			)
		}

		const { fullName, code, password } = c.req.valid('json')
		const resolution = await resolveParticipantByName(fullName)

		const invalid = () =>
			errorResponse(
				c,
				'Invalid name or code. Please check your details and try again.',
				'INVALID_CREDENTIALS',
				401
			)

		if (resolution.kind !== 'approved') return invalid()
		if (resolution.participant.status !== 'ACTIVE') {
			return errorResponse(
				c,
				'Your access is currently inactive. Please contact the Programme Manager for assistance.',
				'PARTICIPANT_INACTIVE',
				403
			)
		}

		const valid = await verifyParticipantCode(resolution.participant.id, code, 'RESET_PASSWORD')
		if (!valid) {
			return errorResponse(
				c,
				'That code is invalid or has expired. Please request a new code.',
				'INVALID_CODE',
				401
			)
		}

		await setParticipantPassword(resolution.participant.id, password)
		const session = await createParticipantSession(resolution.participant.id)
		await auditAccessGranted(resolution.participant.id, resolution.participant.displayName)

		return successResponse(c, {
			token: session.token,
			expiresAt: session.expiresAt,
			participant: {
				id: resolution.participant.id,
				displayName: resolution.participant.displayName,
				masar: resolution.participant.masar
			}
		})
	}
)

export default publicAlMamharahRoute
