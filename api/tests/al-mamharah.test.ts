import { beforeAll, describe, expect, test } from 'bun:test'
import app from '../src/app'
import { addDays, todayInTimeZone } from '../src/services/al-mamharah/dates'

// * Integration tests for the Al-Mamharah programme API.
// * These run against a real PostgreSQL database created by
// * `bun scripts/test-cluster.ts` (see package.json `test:al-mamharah`).

const TZ = 'Africa/Lagos'
const today = todayInTimeZone(TZ)
const startDate = addDays(today, -5)
const endDate = addDays(today, 10)

const PRIMARY_EMAIL = 'primary.manager@example.com'
const PRIMARY_PASSWORD = 'primary-password-123'
const INVITED_EMAIL = 'invited.manager@example.com'
const INVITED_PASSWORD = 'invited-password-123'

const PENDING_APPLICANT = 'Zaynab Test Pending'
const APPROVED_APPLICANT = 'Yusuf Test Approved'

interface ApiResult {
	status: number
	body: {
		success: boolean
		data?: Record<string, unknown> | unknown[]
		error?: string
		code?: string
		meta?: Record<string, unknown>
	}
}

async function api(
	path: string,
	init: RequestInit & { token?: string; ip?: string } = {}
): Promise<ApiResult> {
	const { token, ip, headers, ...rest } = init
	const response = await app.request(path, {
		...rest,
		headers: {
			'Content-Type': 'application/json',
			'x-forwarded-for': ip ?? '127.0.0.1',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(headers as Record<string, string> | undefined)
		}
	})
	const text = await response.text()
	let body: ApiResult['body'] = { success: false }
	try {
		body = JSON.parse(text) as ApiResult['body']
	} catch {
		body = { success: false, error: text }
	}
	return { status: response.status, body }
}

function data<T = Record<string, unknown>>(result: ApiResult): T {
	return result.body.data as T
}

const state: {
	invitedToken?: string
	pendingApplicationId?: string
	approvedApplicationId?: string
	participantToken?: string
	participantId?: string
	invitedManagerId?: string
	activationToken?: string
	backfillCompletionId?: string
} = {}

let managerToken = ''

beforeAll(async () => {
	const info = await api('/public/al-mamharah/info')
	expect(info.status).toBe(200)
})

describe('public programme info', () => {
	test('returns the programme window', async () => {
		const result = await api('/public/al-mamharah/info')
		expect(result.status).toBe(200)
		const payload = data<{ start: string; end: string; timezone: string }>(result)
		expect(payload.timezone).toBe(TZ)
		expect(payload.start).toMatch(/^\d{4}-\d{2}-\d{2}$/)
	})
})

describe('applications', () => {
	test('rejects missing eligibility confirmations', async () => {
		const result = await api('/public/al-mamharah', {
			method: 'POST',
			body: JSON.stringify({
				fullName: 'Invalid Applicant',
				email: 'invalid@example.com',
				matricNumber: 'RUN/0000/000',
				faculty: 'Science',
				department: 'Physics',
				masar: 'THREE_PAGES',
				confirmedMemorisation: true,
				confirmedTajweed: true,
				agreedGuidelines: false
			})
		})
		expect(result.status).toBe(400)
	})

	test('accepts a valid application as PENDING', async () => {
		const result = await api('/public/al-mamharah', {
			method: 'POST',
			body: JSON.stringify({
				fullName: PENDING_APPLICANT,
				email: 'pending@example.com',
				phone: '08030000000',
				matricNumber: 'RUN/1000/001',
				faculty: 'Arts',
				department: 'Arabic',
				masar: 'FOUR_PAGES',
				confirmedMemorisation: true,
				confirmedTajweed: true,
				agreedGuidelines: true
			})
		})
		expect(result.status).toBe(201)
		state.pendingApplicationId = data<{ id: string }>(result).id
	})

	test('rejects a duplicate email', async () => {
		const result = await api('/public/al-mamharah', {
			method: 'POST',
			body: JSON.stringify({
				fullName: 'Someone Else',
				email: 'pending@example.com',
				matricNumber: 'RUN/1000/002',
				faculty: 'Arts',
				department: 'Arabic',
				masar: 'ONE_JUZ',
				confirmedMemorisation: true,
				confirmedTajweed: true,
				agreedGuidelines: true
			})
		})
		expect(result.status).toBe(409)
	})

	test('rejects a duplicate matriculation number', async () => {
		const result = await api('/public/al-mamharah', {
			method: 'POST',
			body: JSON.stringify({
				fullName: 'Another Person',
				email: 'another@example.com',
				matricNumber: 'RUN/1000/001',
				faculty: 'Arts',
				department: 'Arabic',
				masar: 'ONE_JUZ',
				confirmedMemorisation: true,
				confirmedTajweed: true,
				agreedGuidelines: true
			})
		})
		expect(result.status).toBe(409)
	})

	test('submits the application that will be approved later', async () => {
		const result = await api('/public/al-mamharah', {
			method: 'POST',
			body: JSON.stringify({
				fullName: APPROVED_APPLICANT,
				email: 'approved@example.com',
				matricNumber: 'RUN/1000/003',
				faculty: 'Education',
				department: 'Islamic Studies',
				masar: 'FIVE_JUZ',
				confirmedMemorisation: true,
				confirmedTajweed: true,
				agreedGuidelines: true
			})
		})
		expect(result.status).toBe(201)
		state.approvedApplicationId = data<{ id: string }>(result).id
	})
})

describe('enter programme flow', () => {
	test('responds not_verified for an unknown name', async () => {
		const result = await api('/public/al-mamharah/enter', {
			method: 'POST',
			body: JSON.stringify({ fullName: 'Complete Stranger' })
		})
		expect(result.status).toBe(200)
		const payload = data<{ status: string; message: string }>(result)
		expect(payload.status).toBe('not_verified')
		expect(payload.message).toContain('has not yet been verified')
	})

	test('responds not_verified for a pending application', async () => {
		const result = await api('/public/al-mamharah/enter', {
			method: 'POST',
			body: JSON.stringify({ fullName: PENDING_APPLICANT })
		})
		expect(result.status).toBe(200)
		expect(data<{ status: string }>(result).status).toBe('not_verified')
	})
})

describe('manager authentication', () => {
	test('rejects a wrong password', async () => {
		const result = await api('/al-mamharah/manager/login', {
			method: 'POST',
			body: JSON.stringify({ email: PRIMARY_EMAIL, password: 'wrong-password' })
		})
		expect(result.status).toBe(401)
	})

	test('logs in the primary manager (bootstrapped from env)', async () => {
		const result = await api('/al-mamharah/manager/login', {
			method: 'POST',
			body: JSON.stringify({ email: PRIMARY_EMAIL, password: PRIMARY_PASSWORD })
		})
		expect(result.status).toBe(200)
		const payload = data<{ token: string; manager: { role: string } }>(result)
		expect(payload.manager.role).toBe('PRIMARY')
		managerToken = payload.token
	})

	test('rejects unauthenticated manager access', async () => {
		const result = await api('/al-mamharah/manager/overview')
		expect(result.status).toBe(401)
	})

	test('does not accept participant-issued tokens for manager routes', async () => {
		const result = await api('/al-mamharah/manager/overview', { token: 'not-a-real-token' })
		expect(result.status).toBe(401)
	})
})

describe('manager programme management', () => {
	test('returns an overview', async () => {
		const result = await api('/al-mamharah/manager/overview', { token: managerToken })
		expect(result.status).toBe(200)
		const payload = data<{ applications: { pending: number } }>(result)
		expect(payload.applications.pending).toBeGreaterThanOrEqual(2)
	})

	test('updates programme settings to an active window', async () => {
		const result = await api('/al-mamharah/manager/settings', {
			method: 'PUT',
			token: managerToken,
			body: JSON.stringify({
				start: startDate,
				end: endDate,
				timezone: TZ,
				tasks: ['MUROJAAH'],
				streakTasks: ['MUROJAAH']
			})
		})
		expect(result.status).toBe(200)
		const payload = data<{ start: string; end: string }>(result)
		expect(payload.start).toBe(startDate)
		expect(payload.end).toBe(endDate)
	})

	test('lists applications with search and pagination', async () => {
		const result = await api(
			`/al-mamharah/manager/applications?search=${encodeURIComponent('Test')}&page=1&limit=10`,
			{ token: managerToken }
		)
		expect(result.status).toBe(200)
		expect(Array.isArray(result.body.data)).toBe(true)
	})

	test('approves a pending application and creates a participant', async () => {
		const result = await api(
			`/al-mamharah/manager/applications/${state.approvedApplicationId}/approve`,
			{ method: 'POST', token: managerToken, body: JSON.stringify({ startDate }) }
		)
		expect(result.status).toBe(200)
		const payload = data<{ participantId: string }>(result)
		state.participantId = payload.participantId
	})

	test('refuses to approve the same application twice', async () => {
		const result = await api(
			`/al-mamharah/manager/applications/${state.approvedApplicationId}/approve`,
			{ method: 'POST', token: managerToken, body: JSON.stringify({}) }
		)
		expect(result.status).toBe(409)
	})

	test('rejects a pending application', async () => {
		const result = await api(
			`/al-mamharah/manager/applications/${state.pendingApplicationId}/reject`,
			{ method: 'POST', token: managerToken, body: JSON.stringify({ notes: 'Denied' }) }
		)
		expect(result.status).toBe(200)
		const payload = data<{ application: { status: string } }>(result)
		expect(payload.application.status).toBe('REJECTED')
	})
})

describe('participant dashboard', () => {
	test('rejects an invalid verification code for an approved name', async () => {
		const issued = await api('/public/al-mamharah/enter', {
			method: 'POST',
			body: JSON.stringify({ fullName: APPROVED_APPLICANT })
		})
		expect(issued.status).toBe(200)
		expect(data<{ status: string }>(issued).status).toBe('code_sent')

		const result = await api('/public/al-mamharah/enter/verify', {
			method: 'POST',
			body: JSON.stringify({ fullName: APPROVED_APPLICANT, code: '000000' })
		})
		expect(result.status).toBe(401)
		expect(result.body.code).toBe('INVALID_CODE')
	})

	test('enters the programme with an emailed code', async () => {
		const issued = await api('/public/al-mamharah/enter', {
			method: 'POST',
			body: JSON.stringify({ fullName: APPROVED_APPLICANT })
		})
		expect(issued.status).toBe(200)
		const payload = data<{ status: string; devCode?: string }>(issued)
		expect(payload.status).toBe('code_sent')
		// * devCode is present because NODE_ENV=test (mirrors the admin OTP dev behaviour)
		expect(payload.devCode).toBeTruthy()

		const verified = await api('/public/al-mamharah/enter/verify', {
			method: 'POST',
			body: JSON.stringify({ fullName: APPROVED_APPLICANT, code: payload.devCode })
		})
		expect(verified.status).toBe(200)
		const session = data<{ token: string; participant: { id: string } }>(verified)
		state.participantToken = session.token
		expect(session.participant.id).toBe(state.participantId)
	})

	test('fetches the dashboard report', async () => {
		const result = await api('/al-mamharah/participant', { token: state.participantToken })
		expect(result.status).toBe(200)
		const payload = data<{
			programme: { start: string }
			stats: { current: number }
			tasks: unknown[]
		}>(result)
		expect(payload.programme.start).toBe(startDate)
		expect(payload.stats.current).toBe(0)
		expect(payload.tasks.length).toBe(1)
	})

	test("records today's muroja'ah only once", async () => {
		const first = await api('/al-mamharah/participant/complete', {
			method: 'POST',
			token: state.participantToken,
			body: JSON.stringify({ taskType: 'MUROJAAH' })
		})
		expect(first.status).toBe(201)
		expect(data<{ alreadyRecorded: boolean }>(first).alreadyRecorded).toBe(false)

		const second = await api('/al-mamharah/participant/complete', {
			method: 'POST',
			token: state.participantToken,
			body: JSON.stringify({ taskType: 'MUROJAAH' })
		})
		expect(second.status).toBe(200)
		expect(data<{ alreadyRecorded: boolean }>(second).alreadyRecorded).toBe(true)
	})

	test('rejects tasks that are not part of the programme', async () => {
		const result = await api('/al-mamharah/participant/complete', {
			method: 'POST',
			token: state.participantToken,
			body: JSON.stringify({ taskType: 'TAJWEED_QIRAAT' })
		})
		expect(result.status).toBe(400)
	})

	test('updates the streak after recording today', async () => {
		const result = await api('/al-mamharah/participant', { token: state.participantToken })
		const payload = data<{ stats: { current: number; total: number; todayCompleted: boolean } }>(
			result
		)
		expect(payload.stats.current).toBe(1)
		expect(payload.stats.total).toBe(1)
		expect(payload.stats.todayCompleted).toBe(true)
	})

	test('returns a leaderboard containing the participant', async () => {
		const result = await api('/al-mamharah/participant/leaderboard', {
			token: state.participantToken
		})
		expect(result.status).toBe(200)
		const payload = data<{
			entries: { participantId: string; rank: number }[]
			self: { participantId: string; rank: number } | null
		}>(result)
		expect(payload.self?.participantId).toBe(state.participantId)
		expect(payload.entries.some(entry => entry.participantId === state.participantId)).toBe(true)
		expect(payload.self?.rank).toBe(1)
	})

	test('exposes no personal contact details on the leaderboard', async () => {
		const result = await api('/al-mamharah/participant/leaderboard', {
			token: state.participantToken
		})
		const serialized = JSON.stringify(result.body)
		expect(serialized).not.toContain('approved@example.com')
		expect(serialized).not.toContain('RUN/1000/003')
	})
})

describe('manager monitoring', () => {
	test('shows daily progress with the participant marked complete', async () => {
		const result = await api('/al-mamharah/manager/daily-progress', { token: managerToken })
		expect(result.status).toBe(200)
		const payload = data<{
			date: string
			completed: number
			entries: { participantId: string; completed: boolean }[]
		}>(result)
		expect(payload.date).toBe(today)
		const entry = payload.entries.find(item => item.participantId === state.participantId)
		expect(entry?.completed).toBe(true)
	})

	test('lists participants with statistics', async () => {
		const response = await api('/al-mamharah/manager/participants?limit=50', {
			token: managerToken
		})
		expect(response.status).toBe(200)
		const items = response.body.data as {
			participantId?: string
			id: string
			stats: { current: number }
			application: { matricNumber: string }
		}[]
		const record = items.find(item => item.id === state.participantId)
		expect(record).toBeTruthy()
		expect(record?.application.matricNumber).toBe('RUN/1000/003')
	})

	test('allows a manager backfill for a past eligible date', async () => {
		const result = await api('/al-mamharah/manager/completions', {
			method: 'POST',
			token: managerToken,
			body: JSON.stringify({
				participantId: state.participantId,
				date: addDays(today, -2),
				taskType: 'MUROJAAH',
				verified: true,
				note: 'Verified in person'
			})
		})
		expect(result.status).toBe(201)
		state.backfillCompletionId = data<{ completion: { id: string } }>(result).completion.id
	})

	test('removes a completion with a reason', async () => {
		const result = await api(`/al-mamharah/manager/completions/${state.backfillCompletionId}`, {
			method: 'DELETE',
			token: managerToken,
			body: JSON.stringify({ reason: 'Recorded twice' })
		})
		expect(result.status).toBe(200)
	})

	test('suspends and re-activates a participant', async () => {
		const suspended = await api(`/al-mamharah/manager/participants/${state.participantId}/status`, {
			method: 'POST',
			token: managerToken,
			body: JSON.stringify({ status: 'SUSPENDED', notes: 'Testing suspension' })
		})
		expect(suspended.status).toBe(200)

		const blocked = await api('/al-mamharah/participant', { token: state.participantToken })
		expect(blocked.status).toBe(401)

		const active = await api(`/al-mamharah/manager/participants/${state.participantId}/status`, {
			method: 'POST',
			token: managerToken,
			body: JSON.stringify({ status: 'ACTIVE' })
		})
		expect(active.status).toBe(200)

		const restored = await api('/al-mamharah/participant', { token: state.participantToken })
		expect(restored.status).toBe(200)
	})

	test('exports applications as CSV', async () => {
		const response = await app.request('/al-mamharah/manager/export/applications.csv', {
			headers: { Authorization: `Bearer ${managerToken}` }
		})
		expect(response.status).toBe(200)
		expect(response.headers.get('content-type')).toContain('text/csv')
		const csv = await response.text()
		expect(csv).toContain('Full Name')
		expect(csv).toContain(APPROVED_APPLICANT)
	})

	test('records audit entries for approvals and suspensions', async () => {
		const result = await api('/al-mamharah/manager/audit?limit=100', { token: managerToken })
		expect(result.status).toBe(200)
		const items = result.body.data as { action: string }[]
		const actions = items.map(item => item.action)
		expect(actions).toContain('APPLICATION_APPROVED')
		expect(actions).toContain('PARTICIPANT_SUSPENDED')
		expect(actions).toContain('MANAGER_LOGIN')
	})
})

describe('manager invitations and revocation', () => {
	test('invites a new manager and returns an activation link in non-production', async () => {
		const result = await api('/al-mamharah/manager/managers', {
			method: 'POST',
			token: managerToken,
			body: JSON.stringify({ email: INVITED_EMAIL, fullName: 'Invited Manager' })
		})
		expect(result.status).toBe(201)
		const payload = data<{ manager: { id: string }; activationLink: string | null }>(result)
		state.invitedManagerId = payload.manager.id
		expect(payload.activationLink).toBeTruthy()
		state.activationToken =
			new URL(payload.activationLink as string).searchParams.get('token') ?? undefined
		expect(state.activationToken).toBeTruthy()
	})

	test('validates and consumes the activation token', async () => {
		const validation = await api(
			`/al-mamharah/manager/activate/validate?token=${state.activationToken}`
		)
		expect(validation.status).toBe(200)
		expect(data<{ valid: boolean }>(validation).valid).toBe(true)

		const activated = await api('/al-mamharah/manager/activate', {
			method: 'POST',
			body: JSON.stringify({ token: state.activationToken, password: INVITED_PASSWORD })
		})
		expect(activated.status).toBe(200)
	})

	test('lets the invited manager log in', async () => {
		const result = await api('/al-mamharah/manager/login', {
			method: 'POST',
			body: JSON.stringify({ email: INVITED_EMAIL, password: INVITED_PASSWORD })
		})
		expect(result.status).toBe(200)
		const payload = data<{ token: string; manager: { role: string } }>(result)
		expect(payload.manager.role).toBe('MANAGER')
		state.invitedToken = payload.token
	})

	test('prevents a non-primary manager from managing managers', async () => {
		const result = await api('/al-mamharah/manager/managers', {
			method: 'POST',
			token: state.invitedToken,
			body: JSON.stringify({ email: 'another.manager@example.com' })
		})
		expect(result.status).toBe(403)
	})

	test('rejects a reused activation token', async () => {
		const result = await api('/al-mamharah/manager/activate', {
			method: 'POST',
			body: JSON.stringify({ token: state.activationToken, password: 'yet-another-password' })
		})
		expect(result.status).toBe(404)
	})

	test('revokes a manager and blocks their existing token immediately', async () => {
		const revoked = await api(`/al-mamharah/manager/managers/${state.invitedManagerId}/revoke`, {
			method: 'POST',
			token: managerToken
		})
		expect(revoked.status).toBe(200)

		const blocked = await api('/al-mamharah/manager/me', { token: state.invitedToken })
		expect(blocked.status).toBe(403)
		expect(blocked.body.code).toBe('MANAGER_INACTIVE')

		const login = await api('/al-mamharah/manager/login', {
			method: 'POST',
			body: JSON.stringify({ email: INVITED_EMAIL, password: INVITED_PASSWORD })
		})
		expect(login.status).toBe(401)
	})

	test('refuses to revoke the primary manager', async () => {
		const me = await api('/al-mamharah/manager/me', { token: managerToken })
		const managerId = data<{ id: string }>(me).id
		const result = await api(`/al-mamharah/manager/managers/${managerId}/revoke`, {
			method: 'POST',
			token: managerToken
		})
		expect(result.status).toBe(403)
	})
})

describe('token isolation', () => {
	test('rejects a manager JWT on site-admin write routes', async () => {
		const result = await api('/excos/invite', {
			method: 'POST',
			token: managerToken,
			body: JSON.stringify({ email: 'escalation@example.com' })
		})
		expect(result.status).toBe(401)
	})

	test('rejects a participant session token on manager routes', async () => {
		const result = await api('/al-mamharah/manager/me', { token: state.participantToken })
		expect(result.status).toBe(401)
	})
})

describe('participant logout', () => {
	test('revokes the session on logout', async () => {
		const logout = await api('/al-mamharah/participant/logout', {
			method: 'POST',
			token: state.participantToken
		})
		expect(logout.status).toBe(200)

		const after = await api('/al-mamharah/participant', { token: state.participantToken })
		expect(after.status).toBe(401)
	})
})
