import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { db } from '../../lib/db'
import {
	alMamharahCompletions,
	type AlMamharahCompletion,
	type AlMamharahMasar,
	type AlMamharahParticipant,
	type AlMamharahTaskType
} from '../../db/schema'
import { NotFoundError, ValidationError } from '../../lib/errors'
import { recordAudit } from './audit'
import { diffDays, isValidISODate, todayInTimeZone, type ISODate, type StreakStats } from './dates'
import { computeParticipantStats, participantWindowStart, toISODateValue } from './participants'
import { clampPage, pageRangeLabel, surahAtPage } from './mushaf'
import { getSettings, type AlMamharahSettings } from './settings'

// * Daily Muroja'ah recording and participant-facing progress reports.

export interface DailyTarget {
	label: string
	pages: number | null
	juz: number | null
	// * Positional details (present when the participant has a start position)
	surah?: string | null
	fromPage?: number | null
	toPage?: number | null
}

/** Pages covered per day by a masār (juz-based masār use ~20 pages per juz). */
export function masarPagesPerDay(masar: AlMamharahMasar): number | null {
	switch (masar) {
		case 'TWO_PAGES':
			return 2
		case 'THREE_PAGES':
			return 3
		case 'FOUR_PAGES':
			return 4
		case 'ONE_JUZ':
			return 20
		case 'THREE_JUZ':
			return 60
		case 'FIVE_JUZ':
			return 100
		case 'KHATM':
			return null
		default:
			return null
	}
}

/** Derives the daily memorisation target from the participant's selected masār. */
export function dailyTargetFromMasar(masar: AlMamharahMasar): DailyTarget {
	switch (masar) {
		case 'THREE_PAGES':
			return { label: '3 pages daily', pages: 3, juz: null }
		case 'TWO_PAGES':
			return { label: '2 pages daily', pages: 2, juz: null }
		case 'FOUR_PAGES':
			return { label: '4 pages daily', pages: 4, juz: null }
		case 'ONE_JUZ':
			return { label: '1 juzʼ daily', pages: null, juz: 1 }
		case 'THREE_JUZ':
			return { label: '3 ajzāʼ daily', pages: null, juz: 3 }
		case 'FIVE_JUZ':
			return { label: '5 ajzāʼ daily', pages: null, juz: 5 }
		case 'KHATM':
			return { label: 'Full khatm', pages: null, juz: null }
		default:
			return { label: "Daily muroja'ah", pages: null, juz: null }
	}
}

/**
 * Builds the participant's positional daily target, e.g. "Al-Baqarah · pg 2–4",
 * by advancing from their chosen start page by the masār's daily page count.
 * Falls back to the plain masār label when no start position is recorded.
 */
export function positionalDailyTarget(
	participant: Pick<AlMamharahParticipant, 'masar' | 'startSurah' | 'startPage' | 'startDate'>,
	settings: AlMamharahSettings,
	today: ISODate
): DailyTarget {
	const base = dailyTargetFromMasar(participant.masar)
	const pagesPerDay = masarPagesPerDay(participant.masar)
	if (!participant.startPage || !pagesPerDay) return base

	const windowStart = participantWindowStart(toISODateValue(participant.startDate), settings)
	// * Day index counts from the participant's first eligible day up to today.
	const dayIndex = Math.max(0, diffDays(windowStart, today))
	const fromPage = clampPage(participant.startPage + dayIndex * pagesPerDay)
	const toPage = clampPage(fromPage + pagesPerDay - 1)

	return {
		...base,
		surah: surahAtPage(fromPage).name,
		fromPage,
		toPage,
		label: `${base.label} · ${pageRangeLabel(fromPage, toPage)}`
	}
}

export interface RecordCompletionInput {
	// * Defaults to "today" in the programme timezone
	date?: string
	taskType?: AlMamharahTaskType
	note?: string
	verified?: boolean
	verifiedBy?: string
}

export interface RecordCompletionResult {
	completion: AlMamharahCompletion
	alreadyRecorded: boolean
	date: ISODate
	stats: StreakStats
}

/**
 * Records a daily task completion.
 *
 * - Self-service entries must be for the current programme day; managers may
 *   backfill any eligible date (corrections).
 * - Only dates within the participant's window [start, programme end] and not
 *   in the future are accepted.
 * - Duplicate (participant, date, task) submissions are idempotent.
 */
export async function recordCompletion(
	participant: AlMamharahParticipant,
	input: RecordCompletionInput,
	options: { allowPast: boolean; manager?: string }
): Promise<RecordCompletionResult> {
	const settings = await getSettings()
	const today = todayInTimeZone(settings.timezone)
	const start = participantWindowStart(toISODateValue(participant.startDate), settings)

	const date = input.date ?? today
	if (!isValidISODate(date)) throw new ValidationError('Invalid date')
	if (date > today) throw new ValidationError('Future dates cannot be recorded')
	if (date < start) throw new ValidationError('This date is before your programme start date')
	if (date > settings.end) throw new ValidationError('The programme has ended')
	if (!options.allowPast && date !== today) {
		throw new ValidationError("You can only record today's muroja'ah from your dashboard")
	}

	const taskType = input.taskType ?? 'MUROJAAH'
	if (!settings.tasks.includes(taskType)) {
		throw new ValidationError('This task is not part of the programme')
	}

	const inserted = await db
		.insert(alMamharahCompletions)
		.values({
			participantId: participant.id,
			programmeDate: date,
			taskType,
			verified: input.verified ?? false,
			verifiedBy: input.verifiedBy ?? options.manager ?? null,
			note: input.note?.trim() || null
		})
		.onConflictDoNothing({
			target: [
				alMamharahCompletions.participantId,
				alMamharahCompletions.programmeDate,
				alMamharahCompletions.taskType
			]
		})
		.returning()

	let completion = inserted[0]
	const alreadyRecorded = !completion
	if (!completion) {
		const [existing] = await db
			.select()
			.from(alMamharahCompletions)
			.where(
				and(
					eq(alMamharahCompletions.participantId, participant.id),
					eq(alMamharahCompletions.programmeDate, date),
					eq(alMamharahCompletions.taskType, taskType)
				)
			)
			.limit(1)
		if (!existing) throw new NotFoundError('Completion not found')
		completion = existing
	}

	const dates = await getCompletionDates(participant.id)
	return {
		completion,
		alreadyRecorded,
		date,
		stats: computeParticipantStats(dates, participant, settings, today)
	}
}

/** All completion dates for a participant. */
export async function getCompletionDates(participantId: string): Promise<ISODate[]> {
	const rows = await db
		.select({ programmeDate: alMamharahCompletions.programmeDate })
		.from(alMamharahCompletions)
		.where(eq(alMamharahCompletions.participantId, participantId))
	return rows.map(r => toISODateValue(r.programmeDate))
}

export interface CompletionEntry {
	id: string
	date: ISODate
	taskType: AlMamharahTaskType
	verified: boolean
	verifiedBy: string | null
	note: string | null
	createdAt: Date
}

/** Lists a participant's completions (most recent first). */
export async function listCompletions(
	participantId: string,
	options: { from?: ISODate; to?: ISODate; limit?: number } = {}
): Promise<CompletionEntry[]> {
	const conditions = [eq(alMamharahCompletions.participantId, participantId)]
	if (options.from) conditions.push(gte(alMamharahCompletions.programmeDate, options.from))
	if (options.to) conditions.push(lte(alMamharahCompletions.programmeDate, options.to))

	const rows = await db
		.select()
		.from(alMamharahCompletions)
		.where(and(...conditions))
		.orderBy(desc(alMamharahCompletions.programmeDate))
		.limit(options.limit ?? 60)

	return rows.map(row => ({
		id: row.id,
		date: toISODateValue(row.programmeDate),
		taskType: row.taskType,
		verified: row.verified,
		verifiedBy: row.verifiedBy,
		note: row.note,
		createdAt: row.createdAt
	}))
}

export interface TaskStatus {
	taskType: AlMamharahTaskType
	completedToday: boolean
	requiredForStreak: boolean
}

export interface ParticipantReport {
	participant: {
		id: string
		displayName: string
		masar: AlMamharahMasar
		startDate: ISODate
		status: AlMamharahParticipant['status']
	}
	programme: {
		start: ISODate
		end: ISODate
		timezone: string
		tasks: AlMamharahTaskType[]
		streakTasks: AlMamharahTaskType[]
	}
	today: ISODate
	todayEligible: boolean
	dailyTarget: DailyTarget
	stats: StreakStats
	tasks: TaskStatus[]
	completions: CompletionEntry[]
}

/** Full dashboard payload for an authenticated participant. */
export async function getParticipantReport(
	participant: AlMamharahParticipant,
	options: { completionLimit?: number } = {}
): Promise<ParticipantReport> {
	const settings: AlMamharahSettings = await getSettings()
	const today = todayInTimeZone(settings.timezone)
	const dates = await getCompletionDates(participant.id)
	const stats = computeParticipantStats(dates, participant, settings, today)
	const completions = await listCompletions(participant.id, {
		limit: options.completionLimit ?? 60
	})

	const todayTasks = new Set(completions.filter(c => c.date === today).map(c => c.taskType))

	return {
		participant: {
			id: participant.id,
			displayName: participant.displayName,
			masar: participant.masar,
			startDate: toISODateValue(participant.startDate),
			status: participant.status
		},
		programme: {
			start: settings.start,
			end: settings.end,
			timezone: settings.timezone,
			tasks: settings.tasks,
			streakTasks: settings.streakTasks
		},
		today,
		todayEligible:
			today >= participantWindowStart(toISODateValue(participant.startDate), settings) &&
			today <= settings.end,
		dailyTarget: positionalDailyTarget(participant, settings, today),
		stats,
		tasks: settings.tasks.map(taskType => ({
			taskType,
			completedToday: todayTasks.has(taskType),
			requiredForStreak: settings.streakTasks.includes(taskType)
		})),
		completions
	}
}

/** Deletes a completion (manager correction) with an audit entry. */
export async function deleteCompletion(
	completionId: string,
	options: { actor: string; reason?: string }
): Promise<void> {
	const [deleted] = await db
		.delete(alMamharahCompletions)
		.where(eq(alMamharahCompletions.id, completionId))
		.returning()
	if (!deleted) throw new NotFoundError('Completion not found')

	await recordAudit({
		actorType: 'MANAGER',
		actor: options.actor,
		action: 'COMPLETION_DELETED',
		entity: 'completion',
		entityId: completionId,
		details: {
			participantId: deleted.participantId,
			date: toISODateValue(deleted.programmeDate),
			taskType: deleted.taskType,
			reason: options.reason ?? null
		}
	})
}
