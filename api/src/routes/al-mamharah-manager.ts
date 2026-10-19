import type { Context } from 'hono'
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { successResponse, errorResponse, paginatedResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { managerAuth, requireManager, requirePrimaryManager } from '../middleware/al-mamharah'
import {
	activateManagerSchema,
	approveApplicationSchema,
	auditQuerySchema,
	dailyProgressQuerySchema,
	deleteCompletionSchema,
	exportQuerySchema,
	inviteManagerSchema,
	listApplicationsQuerySchema,
	listParticipantsQuerySchema,
	managerCompletionSchema,
	managerLoginSchema,
	programmeSettingsSchema,
	rejectApplicationSchema,
	updateParticipantStatusSchema
} from '../schemas/al-mamharah'
import {
	applicationCounts,
	approveApplication,
	listApplications,
	listApplicationsForExport,
	rejectApplication
} from '../services/al-mamharah/applications'
import {
	getDailyProgress,
	getLeaderboard,
	getParticipantById,
	getParticipantDetail,
	listParticipants,
	participantCounts,
	setParticipantStatus
} from '../services/al-mamharah/participants'
import { deleteCompletion, recordCompletion } from '../services/al-mamharah/progress'
import { listAudit, recordAudit } from '../services/al-mamharah/audit'
import { getSettings, saveSettings } from '../services/al-mamharah/settings'
import { isValidISODate, todayInTimeZone } from '../services/al-mamharah/dates'
import {
	activateManager,
	authenticateManager,
	deleteManager,
	generateManagerToken,
	isManagerLoginAvailable,
	inviteManager,
	listManagers,
	managerActivationLink,
	resendManagerInvite,
	revokeManager,
	sendManagerActivationEmail,
	validateActivationToken
} from '../services/al-mamharah/managers'
import { clientKey, rateLimit } from '../services/al-mamharah/rate-limit'

// * Programme Manager endpoints. `/login` and `/activate*` are public; every
// * other route requires the manager JWT (enforced with managerAuth below).

const alMamharahManagerRoute = new Hono()

// * --- Public: login & activation -------------------------------------------

/** POST /login — email + password → 8h manager JWT. */
alMamharahManagerRoute.post('/login', zValidator('json', managerLoginSchema), async c => {
	if (!rateLimit(clientKey(c.req, 'almh-manager-login'), 10, 10 * 60 * 1000)) {
		return errorResponse(
			c,
			'Too many login attempts. Please wait a few minutes and try again.',
			'RATE_LIMITED',
			400
		)
	}

	if (!(await isManagerLoginAvailable())) {
		return errorResponse(
			c,
			'Manager login is not configured yet. Please contact the site administrator.',
			'NOT_CONFIGURED',
			501
		)
	}

	const { email, password } = c.req.valid('json')
	const manager = await authenticateManager(email, password)
	if (!manager) {
		return errorResponse(c, 'Invalid email or password', 'INVALID_CREDENTIALS', 401)
	}

	const token = await generateManagerToken(manager)
	await recordAudit({
		actorType: 'MANAGER',
		actor: manager.email,
		action: 'MANAGER_LOGIN',
		entity: 'manager',
		entityId: manager.id
	})

	return successResponse(c, {
		token,
		expiresIn: '8h',
		manager: {
			id: manager.id,
			email: manager.email,
			fullName: manager.fullName,
			role: manager.role
		}
	})
})

/** GET /activate/validate — check an activation link (public). */
alMamharahManagerRoute.get(
	'/activate/validate',
	zValidator('query', z.object({ token: z.string().min(20) })),
	async c => {
		const { token } = c.req.valid('query')
		const found = await validateActivationToken(token)
		if (!found || found.manager.status !== 'PENDING') {
			return successResponse(c, { valid: false })
		}
		return successResponse(c, {
			valid: true,
			email: found.manager.email,
			fullName: found.manager.fullName
		})
	}
)

/** POST /activate — set a password for a pending manager (public). */
alMamharahManagerRoute.post('/activate', zValidator('json', activateManagerSchema), async c => {
	const { token, password, fullName } = c.req.valid('json')
	const result = await activateManager({ token, password, fullName })
	return successResponse(c, {
		message: 'Your account is now active. You can sign in with your email and password.',
		manager: {
			id: result.manager.id,
			email: result.manager.email,
			fullName: result.manager.fullName
		}
	})
})

// * --- Authenticated manager routes ----------------------------------------

alMamharahManagerRoute.use('*', managerAuth)

/** GET /me — current manager profile. */
alMamharahManagerRoute.get('/me', c => {
	const manager = requireManager(c)
	return successResponse(c, {
		id: manager.id,
		email: manager.email,
		fullName: manager.fullName,
		role: manager.role
	})
})

/** GET /overview — headline numbers for the manager landing view. */
alMamharahManagerRoute.get('/overview', async c => {
	const settings = await getSettings()
	const today = todayInTimeZone(settings.timezone)
	const [applications, participants, progress, managers] = await Promise.all([
		applicationCounts(),
		participantCounts(),
		getDailyProgress(today),
		listManagers()
	])

	return successResponse(c, {
		applications,
		participants,
		today: {
			date: today,
			total: progress.total,
			completed: progress.completed,
			notCompleted: progress.notCompleted
		},
		programme: settings,
		managers: {
			total: managers.length,
			active: managers.filter(m => m.status === 'ACTIVE').length,
			pending: managers.filter(m => m.status === 'PENDING').length
		}
	})
})

/** GET /applications — paginated application list. */
alMamharahManagerRoute.get(
	'/applications',
	zValidator('query', listApplicationsQuerySchema),
	async c => {
		const result = await listApplications(c.req.valid('query'))
		return paginatedResponse(c, result.items, {
			page: result.page,
			limit: result.limit,
			total: result.total
		})
	}
)

/** POST /applications/:id/approve */
alMamharahManagerRoute.post(
	'/applications/:id/approve',
	zValidator('json', approveApplicationSchema),
	async c => {
		const manager = requireManager(c)
		const { startDate } = c.req.valid('json')
		const result = await approveApplication(c.req.param('id'), {
			reviewedBy: manager.email,
			startDate
		})
		return successResponse(c, {
			application: result.application,
			participantId: result.participantId,
			message: 'Application approved. The participant can now enter the programme.'
		})
	}
)

/** POST /applications/:id/reject */
alMamharahManagerRoute.post(
	'/applications/:id/reject',
	zValidator('json', rejectApplicationSchema),
	async c => {
		const manager = requireManager(c)
		const { notes } = c.req.valid('json')
		const application = await rejectApplication(c.req.param('id'), {
			reviewedBy: manager.email,
			notes
		})
		return successResponse(c, { application, message: 'Application rejected.' })
	}
)

/** GET /participants — paginated participants with streak stats. */
alMamharahManagerRoute.get(
	'/participants',
	zValidator('query', listParticipantsQuerySchema),
	async c => {
		const result = await listParticipants(c.req.valid('query'))
		return paginatedResponse(c, result.items, {
			page: result.page,
			limit: result.limit,
			total: result.total
		})
	}
)

/** GET /participants/:id — one participant with recent activity. */
alMamharahManagerRoute.get('/participants/:id', async c => {
	const detail = await getParticipantDetail(c.req.param('id'))
	return successResponse(c, detail)
})

/** POST /participants/:id/status — activate / suspend a participant. */
alMamharahManagerRoute.post(
	'/participants/:id/status',
	zValidator('json', updateParticipantStatusSchema),
	async c => {
		const manager = requireManager(c)
		const { status, notes } = c.req.valid('json')
		const participant = await setParticipantStatus(c.req.param('id'), status, {
			actor: manager.email,
			notes
		})
		return successResponse(c, {
			participant: { id: participant.id, status: participant.status },
			message:
				status === 'SUSPENDED'
					? 'Participant suspended. Their dashboard access is now blocked.'
					: 'Participant re-activated.'
		})
	}
)

/** GET /daily-progress — completion status for a given day. */
alMamharahManagerRoute.get(
	'/daily-progress',
	zValidator('query', dailyProgressQuerySchema),
	async c => {
		const settings = await getSettings()
		const { date } = c.req.valid('query')
		const target = date && isValidISODate(date) ? date : todayInTimeZone(settings.timezone)
		const progress = await getDailyProgress(target)
		return successResponse(c, progress)
	}
)

/** POST /completions — manager backfill / correction. */
alMamharahManagerRoute.post(
	'/completions',
	zValidator('json', managerCompletionSchema),
	async c => {
		const manager = requireManager(c)
		const input = c.req.valid('json')
		const participant = await getParticipantById(input.participantId)
		const result = await recordCompletion(
			participant,
			{
				date: input.date,
				taskType: input.taskType,
				note: input.note,
				verified: input.verified ?? true
			},
			{ allowPast: true, manager: manager.email }
		)
		await recordAudit({
			actorType: 'MANAGER',
			actor: manager.email,
			action: result.alreadyRecorded ? 'COMPLETION_ALREADY_RECORDED' : 'COMPLETION_RECORDED',
			entity: 'completion',
			entityId: result.completion.id,
			details: { participantId: input.participantId, date: result.date }
		})
		return successResponse(c, result, undefined, result.alreadyRecorded ? 200 : 201)
	}
)

/** DELETE /completions/:id — remove a completion (with reason). */
alMamharahManagerRoute.delete(
	'/completions/:id',
	zValidator('json', deleteCompletionSchema),
	async c => {
		const manager = requireManager(c)
		const { reason } = c.req.valid('json')
		await deleteCompletion(c.req.param('id'), { actor: manager.email, reason })
		return successResponse(c, { message: 'Completion removed.' })
	}
)

/** GET /leaderboard — same ranking participants see (for manager auditing). */
alMamharahManagerRoute.get('/leaderboard', async c => {
	const leaderboard = await getLeaderboard(null, { limit: 200 })
	return successResponse(c, leaderboard)
})

/** GET /managers — list managers (never exposes hashes). */
alMamharahManagerRoute.get('/managers', async c => {
	return successResponse(c, await listManagers())
})

/** POST /managers — invite a new manager (primary only). */
alMamharahManagerRoute.post('/managers', zValidator('json', inviteManagerSchema), async c => {
	const primary = requirePrimaryManager(c)
	const { email, fullName } = c.req.valid('json')
	const result = await inviteManager({ email, fullName, invitedBy: primary.email })
	await sendInviteEmailSafely(
		result.manager.email,
		result.manager.fullName,
		result.token,
		primary.email
	)

	return successResponse(
		c,
		{
			manager: {
				id: result.manager.id,
				email: result.manager.email,
				status: result.manager.status,
				role: result.manager.role
			},
			details: result.details,
			activationLink: nonProductionLink(result.token),
			message: 'Invitation sent. The new manager must set a password via the emailed link.'
		},
		undefined,
		201
	)
})

/** POST /managers/:id/resend-invite — resend activation email (primary only). */
alMamharahManagerRoute.post('/managers/:id/resend-invite', async c => {
	const primary = requirePrimaryManager(c)
	const result = await resendManagerInvite(c.req.param('id'), primary.email)
	await sendInviteEmailSafely(
		result.manager.email,
		result.manager.fullName,
		result.token,
		primary.email
	)
	return successResponse(c, {
		details: result.details,
		activationLink: nonProductionLink(result.token),
		message: 'Invitation email re-sent.'
	})
})

/** POST /managers/:id/revoke — revoke a manager (primary only). */
alMamharahManagerRoute.post('/managers/:id/revoke', async c => {
	const primary = requirePrimaryManager(c)
	const manager = await revokeManager(c.req.param('id'), primary.email)
	return successResponse(c, {
		manager: { id: manager.id, email: manager.email, status: manager.status },
		message: 'Manager access revoked.'
	})
})

/** DELETE /managers/:id — permanently delete a REVOKED manager (primary only). */
alMamharahManagerRoute.delete('/managers/:id', async c => {
	const primary = requirePrimaryManager(c)
	await deleteManager(c.req.param('id'), {
		managerId: primary.id,
		role: primary.role,
		email: primary.email
	})
	return successResponse(c, { message: 'Manager deleted permanently.' })
})

/** GET /settings — programme settings. */
alMamharahManagerRoute.get('/settings', async c => {
	return successResponse(c, await getSettings())
})

/** PUT /settings — update programme settings. */
alMamharahManagerRoute.put('/settings', zValidator('json', programmeSettingsSchema), async c => {
	const manager = requireManager(c)
	const input = c.req.valid('json')
	if (input.end < input.start) {
		return errorResponse(c, 'End date cannot be before the start date', 'VALIDATION_ERROR', 400)
	}
	const previous = await getSettings()
	const saved = await saveSettings(input)
	await recordAudit({
		actorType: 'MANAGER',
		actor: manager.email,
		action: 'SETTINGS_UPDATED',
		entity: 'settings',
		details: { previous, next: saved }
	})
	return successResponse(c, saved)
})

/** GET /audit — paginated audit trail. */
alMamharahManagerRoute.get('/audit', zValidator('query', auditQuerySchema), async c => {
	const result = await listAudit(c.req.valid('query'))
	return paginatedResponse(c, result.items, {
		page: result.page,
		limit: result.limit,
		total: result.total
	})
})

/** GET /export/applications.csv */
alMamharahManagerRoute.get(
	'/export/applications.csv',
	zValidator('query', exportQuerySchema),
	async c => {
		const { status } = c.req.valid('query')
		const rows = await listApplicationsForExport(status)
		const header = [
			'Full Name',
			'Email',
			'Phone',
			'Matric Number',
			'Faculty',
			'Department',
			'Masar',
			'Status',
			'Reviewed By',
			'Reviewed At',
			'Submitted At'
		]
		const body = rows.map(row =>
			[
				row.fullName,
				row.email,
				row.phone ?? '',
				row.matricNumber,
				row.faculty,
				row.department,
				row.masar,
				row.status,
				row.reviewedBy ?? '',
				row.reviewedAt ? row.reviewedAt.toISOString() : '',
				row.createdAt.toISOString()
			]
				.map(csvCell)
				.join(',')
		)
		return csvResponse(c, 'al-mamharah-applications.csv', [header.join(','), ...body].join('\r\n'))
	}
)

/** GET /export/participants.csv */
alMamharahManagerRoute.get('/export/participants.csv', async c => {
	const settings = await getSettings()
	const today = todayInTimeZone(settings.timezone)
	const result = await listParticipants({ page: 1, limit: 200 })
	const header = [
		'Full Name',
		'Email',
		'Matric Number',
		'Faculty',
		'Department',
		'Masar',
		'Status',
		'Start Date',
		'Current Streak',
		'Longest Streak',
		'Total Days',
		'Today Completed'
	]
	const body = result.items.map(item =>
		[
			item.displayName,
			item.email,
			item.application.matricNumber,
			item.application.faculty,
			item.application.department,
			item.masar,
			item.status,
			item.startDate,
			item.stats.current,
			item.stats.longest,
			item.stats.total,
			item.stats.todayCompleted ? 'yes' : 'no'
		]
			.map(csvCell)
			.join(',')
	)
	return csvResponse(
		c,
		`al-mamharah-participants-${today}.csv`,
		[header.join(','), ...body].join('\r\n')
	)
})

// * --- helpers --------------------------------------------------------------

function nonProductionLink(token: string): string | null {
	return process.env.NODE_ENV !== 'production' ? managerActivationLink(token) : null
}

async function sendInviteEmailSafely(
	email: string,
	fullName: string | null,
	token: string,
	invitedBy: string
): Promise<void> {
	try {
		await sendManagerActivationEmail(email, { token, invitedBy, fullName })
	} catch (error) {
		logger.error({ error, email }, 'Failed to send Al-Mamharah manager invitation email')
	}
}

function csvCell(value: unknown): string {
	const text = value == null ? '' : String(value)
	return `"${text.replace(/"/g, '""')}"`
}

function csvResponse(c: Context, filename: string, csv: string) {
	return c.body(csv, 200, {
		'Content-Type': 'text/csv; charset=utf-8',
		'Content-Disposition': `attachment; filename="${filename}"`
	})
}

export default alMamharahManagerRoute
