import { and, count, desc, eq, ilike, inArray, isNotNull, or, sql } from 'drizzle-orm'
import { db } from '../../lib/db'
import {
	alMamharahApplications,
	alMamharahCompletions,
	alMamharahParticipantSessions,
	alMamharahParticipants,
	alMamharahVerificationCodes,
	type AlMamharahApplication,
	type AlMamharahMasar,
	type AlMamharahParticipant,
	type AlMamharahParticipantStatus,
	type AlMamharahTaskType
} from '../../db/schema'
import { NotFoundError, ValidationError } from '../../lib/errors'
import { logger } from '../../lib/logger'
import { normalizePersonName } from './applications'
import { recordAudit } from './audit'
import {
	computeStreaks,
	rankEntries,
	todayInTimeZone,
	type ISODate,
	type StreakStats
} from './dates'
import { getSettings, type AlMamharahSettings } from './settings'

// * Participant records, name resolution, monitoring lists and leaderboard.

export type NameResolution =
	| { kind: 'approved'; application: AlMamharahApplication; participant: AlMamharahParticipant }
	| { kind: 'pending' }
	| { kind: 'rejected' }
	| { kind: 'unknown' }

/**
 * Resolves a full name to its application state for the "Enter Programme" flow.
 *
 * Name matching is exact after normalisation (trim + collapse spaces,
 * case-insensitive). Zero matches, multiple matches, or an approved
 * application without a participant row all resolve to 'unknown' so the
 * caller can reply with the generic not-verified response.
 */
export async function resolveParticipantByName(fullName: string): Promise<NameResolution> {
	const normalized = normalizePersonName(fullName).toLowerCase()
	if (normalized.length < 2) return { kind: 'unknown' }

	const matches = await db
		.select()
		.from(alMamharahApplications)
		.where(sql`lower(${alMamharahApplications.fullName}) = ${normalized}`)
		.limit(2)

	if (matches.length !== 1) return { kind: 'unknown' }
	const application = matches[0]

	if (application.status === 'PENDING') return { kind: 'pending' }
	if (application.status === 'REJECTED') return { kind: 'rejected' }

	const [participant] = await db
		.select()
		.from(alMamharahParticipants)
		.where(eq(alMamharahParticipants.applicationId, application.id))
		.limit(1)
	if (!participant) return { kind: 'unknown' }

	return { kind: 'approved', application, participant }
}

/** Normalises a date column value (string or Date) to YYYY-MM-DD. */
export function toISODateValue(value: string | Date): ISODate {
	if (value instanceof Date) {
		const y = value.getUTCFullYear().toString().padStart(4, '0')
		const m = (value.getUTCMonth() + 1).toString().padStart(2, '0')
		const d = value.getUTCDate().toString().padStart(2, '0')
		return `${y}-${m}-${d}`
	}
	return String(value).slice(0, 10)
}

/**
 * Loads completion dates grouped by participant id (optionally restricted to
 * a set of participant ids) so statistics can be computed without N+1 queries.
 */
export async function completionDatesByParticipant(
	participantIds?: string[],
	taskType?: AlMamharahTaskType
): Promise<Map<string, ISODate[]>> {
	// * Guard: an empty id list would generate `IN ('')`, which Postgres rejects
	// * as invalid uuid syntax (22P02) → 500. Return an empty map instead.
	if (participantIds && participantIds.length === 0) return new Map()
	const conditions = []
	if (participantIds) {
		conditions.push(inArray(alMamharahCompletions.participantId, participantIds))
	}
	if (taskType) conditions.push(eq(alMamharahCompletions.taskType, taskType))
	const rows = await db
		.select({
			participantId: alMamharahCompletions.participantId,
			programmeDate: alMamharahCompletions.programmeDate,
			taskType: alMamharahCompletions.taskType
		})
		.from(alMamharahCompletions)
		.where(conditions.length > 0 ? and(...conditions) : undefined)

	const grouped = new Map<string, ISODate[]>()
	for (const row of rows) {
		const list = grouped.get(row.participantId) ?? []
		list.push(toISODateValue(row.programmeDate))
		grouped.set(row.participantId, list)
	}
	return grouped
}

/** First eligible day for a participant: later of programme start and their start date. */
export function participantWindowStart(
	participantStartDate: ISODate,
	settings: AlMamharahSettings
): ISODate {
	return participantStartDate > settings.start ? participantStartDate : settings.start
}

/** Streak/progress statistics for a single participant. */
export function computeParticipantStats(
	completedDates: ISODate[],
	participant: AlMamharahParticipant,
	settings: AlMamharahSettings,
	today: ISODate
): StreakStats {
	const start = participantWindowStart(toISODateValue(participant.startDate), settings)
	return computeStreaks(completedDates, start, settings.end, today)
}

export interface ParticipantApplicationInfo {
	matricNumber: string
	faculty: string
	department: string
	phone: string | null
	confirmedMemorisation: boolean
	confirmedTajweed: boolean
}

export interface ParticipantWithStats {
	id: string
	displayName: string
	email: string
	masar: AlMamharahMasar
	startDate: string
	status: AlMamharahParticipantStatus
	createdAt: Date
	// * Optional tajweed track (null = muroja'ah only)
	tajweedTrack: string | null
	/** Whether the placement quiz for the track has been passed. */
	tajweedPlacementPassed: boolean
	application: ParticipantApplicationInfo
	stats: StreakStats
}

function mapWithStats(
	participant: AlMamharahParticipant,
	application: AlMamharahApplication | undefined,
	stats: StreakStats
): ParticipantWithStats {
	return {
		id: participant.id,
		displayName: participant.displayName,
		email: participant.email,
		masar: participant.masar,
		startDate: toISODateValue(participant.startDate),
		status: participant.status,
		createdAt: participant.createdAt,
		tajweedTrack: participant.tajweedTrack,
		tajweedPlacementPassed: Boolean(participant.tajweedPlacementPassedAt),
		application: {
			matricNumber: application?.matricNumber ?? '',
			faculty: application?.faculty ?? '',
			department: application?.department ?? '',
			phone: application?.phone ?? null,
			confirmedMemorisation: application?.confirmedMemorisation ?? false,
			confirmedTajweed: application?.confirmedTajweed ?? false
		},
		stats
	}
}

export interface ParticipantFilters {
	search?: string
	status?: AlMamharahParticipantStatus
	masar?: AlMamharahMasar
	page: number
	limit: number
}

export interface ParticipantListResult {
	items: ParticipantWithStats[]
	total: number
	page: number
	limit: number
}

/** Manager view: participants with application details and streak statistics. */
export async function listParticipants(
	filters: ParticipantFilters
): Promise<ParticipantListResult> {
	const settings = await getSettings()
	const today = todayInTimeZone(settings.timezone)

	const conditions = []
	if (filters.status) conditions.push(eq(alMamharahParticipants.status, filters.status))
	if (filters.masar) conditions.push(eq(alMamharahParticipants.masar, filters.masar))
	if (filters.search?.trim()) {
		const q = `%${filters.search.trim()}%`
		conditions.push(
			or(
				ilike(alMamharahParticipants.displayName, q),
				ilike(alMamharahParticipants.email, q),
				ilike(alMamharahApplications.matricNumber, q),
				ilike(alMamharahApplications.faculty, q),
				ilike(alMamharahApplications.department, q)
			)
		)
	}
	const where = conditions.length > 0 ? and(...conditions) : undefined
	const offset = (filters.page - 1) * filters.limit

	const [rows, totalRows] = await Promise.all([
		db
			.select({ participant: alMamharahParticipants, application: alMamharahApplications })
			.from(alMamharahParticipants)
			.innerJoin(
				alMamharahApplications,
				eq(alMamharahParticipants.applicationId, alMamharahApplications.id)
			)
			.where(where)
			.orderBy(desc(alMamharahParticipants.createdAt))
			.limit(filters.limit)
			.offset(offset),
		db
			.select({ total: count() })
			.from(alMamharahParticipants)
			.innerJoin(
				alMamharahApplications,
				eq(alMamharahParticipants.applicationId, alMamharahApplications.id)
			)
			.where(where)
	])

	const ids = rows.map(r => r.participant.id)
	const dates = await completionDatesByParticipant(ids)
	const items = rows.map(row =>
		mapWithStats(
			row.participant,
			row.application,
			computeParticipantStats(dates.get(row.participant.id) ?? [], row.participant, settings, today)
		)
	)

	return { items, total: totalRows[0]?.total ?? 0, page: filters.page, limit: filters.limit }
}

/** Fetches the raw participant row by id. */
export async function getParticipantById(participantId: string): Promise<AlMamharahParticipant> {
	const [participant] = await db
		.select()
		.from(alMamharahParticipants)
		.where(eq(alMamharahParticipants.id, participantId))
		.limit(1)
	if (!participant) throw new NotFoundError('Participant not found')
	return participant
}

export interface ParticipantDetail extends ParticipantWithStats {
	recentCompletions: {
		date: ISODate
		taskType: AlMamharahTaskType
		matn: string | null
		lineNumber: number | null
		verified: boolean
		note: string | null
	}[]
}

/** Manager view: one participant with recent activity. */
export async function getParticipantDetail(participantId: string): Promise<ParticipantDetail> {
	const settings = await getSettings()
	const today = todayInTimeZone(settings.timezone)

	const [row] = await db
		.select({ participant: alMamharahParticipants, application: alMamharahApplications })
		.from(alMamharahParticipants)
		.innerJoin(
			alMamharahApplications,
			eq(alMamharahParticipants.applicationId, alMamharahApplications.id)
		)
		.where(eq(alMamharahParticipants.id, participantId))
		.limit(1)
	if (!row) throw new NotFoundError('Participant not found')

	const completions = await db
		.select()
		.from(alMamharahCompletions)
		.where(eq(alMamharahCompletions.participantId, participantId))
		.orderBy(desc(alMamharahCompletions.programmeDate))
		.limit(30)

	const dates = completions.map(c => toISODateValue(c.programmeDate))
	const settingsSnapshot = settings
	return {
		...mapWithStats(
			row.participant,
			row.application,
			computeParticipantStats(dates, row.participant, settingsSnapshot, today)
		),
		recentCompletions: completions.map(c => ({
			date: toISODateValue(c.programmeDate),
			taskType: c.taskType,
			matn: c.matn,
			lineNumber: c.lineNumber,
			verified: c.verified,
			note: c.note
		}))
	}
}

/** Updates a participant's status (e.g. suspension) with an audit entry. */
export async function setParticipantStatus(
	participantId: string,
	status: AlMamharahParticipantStatus,
	{ actor, notes }: { actor: string; notes?: string }
): Promise<AlMamharahParticipant> {
	const [updated] = await db
		.update(alMamharahParticipants)
		.set({ status, updatedAt: new Date() })
		.where(eq(alMamharahParticipants.id, participantId))
		.returning()
	if (!updated) throw new NotFoundError('Participant not found')

	await recordAudit({
		actorType: 'MANAGER',
		actor,
		action: status === 'SUSPENDED' ? 'PARTICIPANT_SUSPENDED' : 'PARTICIPANT_ACTIVATED',
		entity: 'participant',
		entityId: participantId,
		details: { notes: notes ?? null }
	})
	logger.info({ participantId, status, actor }, 'Al Mamharah participant status changed')
	return updated
}

export interface DeletedParticipant {
	id: string
	displayName: string
	email: string
	completions: number
	sessions: number
}

/**
 * Permanently removes a suspended participant, their application and their
 * programme data. Accounts must be suspended first so deletion is always a
 * deliberate two-step action, and the audit log keeps a record of what was
 * removed after the rows are gone.
 */
export async function deleteParticipant(
	participantId: string,
	{ actor }: { actor: string }
): Promise<DeletedParticipant> {
	const participant = await getParticipantById(participantId)
	if (participant.status !== 'SUSPENDED') {
		throw new ValidationError('Suspend the participant before deleting them')
	}

	const [completionCount] = await db
		.select({ total: count() })
		.from(alMamharahCompletions)
		.where(eq(alMamharahCompletions.participantId, participantId))
	const [sessionCount] = await db
		.select({ total: count() })
		.from(alMamharahParticipantSessions)
		.where(eq(alMamharahParticipantSessions.participantId, participantId))

	await db.transaction(async tx => {
		await tx
			.delete(alMamharahVerificationCodes)
			.where(eq(alMamharahVerificationCodes.participantId, participantId))
		await tx
			.delete(alMamharahParticipantSessions)
			.where(eq(alMamharahParticipantSessions.participantId, participantId))
		await tx.delete(alMamharahCompletions).where(eq(alMamharahCompletions.participantId, participantId))
		await tx.delete(alMamharahParticipants).where(eq(alMamharahParticipants.id, participantId))
		await tx
			.delete(alMamharahApplications)
			.where(eq(alMamharahApplications.id, participant.applicationId))
	})

	const result: DeletedParticipant = {
		id: participantId,
		displayName: participant.displayName,
		email: participant.email,
		completions: Number(completionCount?.total ?? 0),
		sessions: Number(sessionCount?.total ?? 0)
	}

	await recordAudit({
		actorType: 'MANAGER',
		actor,
		action: 'PARTICIPANT_DELETED',
		entity: 'participant',
		entityId: participantId,
		details: {
			displayName: result.displayName,
			email: result.email,
			applicationId: participant.applicationId,
			applicationDeleted: true,
			completions: result.completions,
			sessions: result.sessions
		}
	})
	logger.info({ participantId, actor }, 'Al Mamharah participant deleted')
	return result
}

export interface ParticipantCounts {
	total: number
	active: number
	suspended: number
}

/** Participant counts by status for the manager overview. */
export async function participantCounts(): Promise<ParticipantCounts> {
	const rows = await db
		.select({ status: alMamharahParticipants.status, total: count() })
		.from(alMamharahParticipants)
		.groupBy(alMamharahParticipants.status)

	const result: ParticipantCounts = { total: 0, active: 0, suspended: 0 }
	for (const row of rows) {
		result.total += row.total
		if (row.status === 'ACTIVE') result.active = row.total
		if (row.status === 'SUSPENDED') result.suspended = row.total
	}
	return result
}

export interface LeaderboardEntry {
	rank: number
	participantId: string
	displayName: string
	current: number
	longest: number
	total: number
	todayCompleted: boolean
	/** Set on the tajweed board so students can see each other's matn. */
	tajweedTrack?: string | null
}

/** Which activity the leaderboard ranks. */
export type LeaderboardScope = 'OVERALL' | 'QURAN' | 'TAJWEED'

export interface LeaderboardResult {
	entries: LeaderboardEntry[]
	self: LeaderboardEntry | null
	today: ISODate
	totalParticipants: number
	scope: LeaderboardScope
}

const SCOPE_TASK: Record<LeaderboardScope, AlMamharahTaskType | undefined> = {
	OVERALL: undefined,
	QURAN: 'MUROJAAH',
	TAJWEED: 'TAJWEED_QIRAAT'
}

/**
 * Leaderboard for authenticated participants: ranked by total marks recorded
 * since each participant's start date, then current streak, then longest
 * streak. Only display names and streak statistics are exposed — no emails,
 * phones or matriculation numbers.
 *
 * Scopes: OVERALL counts every recorded day, QURAN ranks the muroja'ah alone
 * and TAJWEED ranks only participants with a tajweed track by their line
 * register (each line is one mark).
 */
export async function getLeaderboard(
	selfParticipantId: string | null,
	options: { limit?: number; scope?: LeaderboardScope } = {}
): Promise<LeaderboardResult> {
	const settings = await getSettings()
	const today = todayInTimeZone(settings.timezone)
	const scope: LeaderboardScope = options.scope ?? 'OVERALL'

	const participants = await db
		.select()
		.from(alMamharahParticipants)
		.where(
			scope === 'TAJWEED'
				? and(
						eq(alMamharahParticipants.status, 'ACTIVE'),
						isNotNull(alMamharahParticipants.tajweedTrack)
					)
				: eq(alMamharahParticipants.status, 'ACTIVE')
		)

	const dates = await completionDatesByParticipant(
		participants.map(p => p.id),
		SCOPE_TASK[scope]
	)

	const ranked = rankEntries(
		participants.map(p => {
			const stats = computeParticipantStats(dates.get(p.id) ?? [], p, settings, today)
			return {
				participantId: p.id,
				displayName: p.displayName,
				current: stats.current,
				longest: stats.longest,
				total: stats.total,
				todayCompleted: stats.todayCompleted,
				tajweedTrack: p.tajweedTrack
			}
		})
	)

	const limit = options.limit && options.limit > 0 ? options.limit : 50
	const entries: LeaderboardEntry[] = ranked.slice(0, limit)
	const selfEntry = ranked.find(e => e.participantId === selfParticipantId) ?? null

	return {
		entries,
		self: selfEntry,
		today,
		totalParticipants: participants.length,
		scope
	}
}

export interface DailyProgressEntry {
	participantId: string
	displayName: string
	masar: AlMamharahMasar
	completed: boolean
	current: number
	longest: number
	total: number
}

export interface DailyProgressResult {
	date: ISODate
	total: number
	completed: number
	notCompleted: number
	entries: DailyProgressEntry[]
}

/** Manager view: who completed (streak-required tasks) on a given day. */
export async function getDailyProgress(date: ISODate): Promise<DailyProgressResult> {
	const settings = await getSettings()
	const today = todayInTimeZone(settings.timezone)

	const participants = await db
		.select()
		.from(alMamharahParticipants)
		.where(eq(alMamharahParticipants.status, 'ACTIVE'))

	const dates = await completionDatesByParticipant(participants.map(p => p.id))

	const entries: DailyProgressEntry[] = participants.map(p => {
		const stats = computeParticipantStats(dates.get(p.id) ?? [], p, settings, today)
		const completed = (dates.get(p.id) ?? []).includes(date)
		return {
			participantId: p.id,
			displayName: p.displayName,
			masar: p.masar,
			completed,
			current: stats.current,
			longest: stats.longest,
			total: stats.total
		}
	})

	entries.sort(
		(a, b) =>
			Number(b.completed) - Number(a.completed) || a.displayName.localeCompare(b.displayName)
	)

	const completed = entries.filter(e => e.completed).length
	return {
		date,
		total: entries.length,
		completed,
		notCompleted: entries.length - completed,
		entries
	}
}
