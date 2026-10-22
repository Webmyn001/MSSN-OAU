import { and, count, eq, sql } from 'drizzle-orm'
import { db } from '../../lib/db'
import {
	alMamharahCompletions,
	alMamharahParticipants,
	type AlMamharahParticipant
} from '../../db/schema'
import { ValidationError } from '../../lib/errors'
import { logger } from '../../lib/logger'
import { recordAudit } from './audit'
import { getSettings, type AlMamharahSettings } from './settings'
import { todayInTimeZone, type ISODate } from './dates'
import {
	MATN_INFO,
	QUIZ_LENGTH,
	gradeQuiz,
	normalizeTajweedTrack,
	prerequisiteFor,
	sampleQuiz,
	tajweedTrackRank,
	type QuizAnswer,
	type TajweedTrack
} from './tajweed'

// * Optional tajweed track: status, placement quiz and daily line register.

export interface TajweedLineStats {
	lastLine: number
	completedLines: number
	todayLine: number | null
}

/** Line-register statistics for one participant. */
export async function tajweedLineStats(
	participantId: string,
	today?: ISODate
): Promise<TajweedLineStats> {
	const [aggregate] = await db
		.select({
			lastLine: sql<number | null>`max(${alMamharahCompletions.lineNumber})`,
			completedLines: count()
		})
		.from(alMamharahCompletions)
		.where(
			and(
				eq(alMamharahCompletions.participantId, participantId),
				eq(alMamharahCompletions.taskType, 'TAJWEED_QIRAAT')
			)
		)

	let todayLine: number | null = null
	if (today) {
		const [row] = await db
			.select({ lineNumber: alMamharahCompletions.lineNumber })
			.from(alMamharahCompletions)
			.where(
				and(
					eq(alMamharahCompletions.participantId, participantId),
					eq(alMamharahCompletions.taskType, 'TAJWEED_QIRAAT'),
					eq(alMamharahCompletions.programmeDate, today)
				)
			)
			.limit(1)
		todayLine = row?.lineNumber ?? null
	}

	return {
		lastLine: Number(aggregate?.lastLine ?? 0),
		completedLines: Number(aggregate?.completedLines ?? 0),
		todayLine
	}
}

export interface TajweedStatus {
	track: TajweedTrack | null
	label: string | null
	arabic: string | null
	prerequisite: { track: TajweedTrack; label: string } | null
	requiresPlacement: boolean
	placementPassed: boolean
	totalLines: number | null
	completedLines: number
	nextLine: number | null
	todayLine: number | null
	todayRecorded: boolean
	completed: boolean
}

/** True when the participant must pass a placement quiz before registering lines. */
export function needsPlacementQuiz(
	participant: Pick<AlMamharahParticipant, 'tajweedTrack' | 'tajweedPlacementPassedAt'>
): boolean {
	const track = normalizeTajweedTrack(participant.tajweedTrack)
	if (!track) return false
	if (!prerequisiteFor(track)) return false
	return !participant.tajweedPlacementPassedAt
}

export async function getTajweedStatus(
	participant: AlMamharahParticipant,
	settings?: AlMamharahSettings,
	todayOverride?: ISODate
): Promise<TajweedStatus> {
	const resolvedSettings = settings ?? (await getSettings())
	const today = todayOverride ?? todayInTimeZone(resolvedSettings.timezone)
	const track = normalizeTajweedTrack(participant.tajweedTrack)

	if (!track) {
		return {
			track: null,
			label: null,
			arabic: null,
			prerequisite: null,
			requiresPlacement: false,
			placementPassed: false,
			totalLines: null,
			completedLines: 0,
			nextLine: null,
			todayLine: null,
			todayRecorded: false,
			completed: false
		}
	}

	const info = MATN_INFO[track]
	const prerequisite = prerequisiteFor(track)
	const stats = await tajweedLineStats(participant.id, today)
	const completed = stats.lastLine >= info.lines

	return {
		track,
		label: info.label,
		arabic: info.arabic,
		prerequisite: prerequisite
			? { track: prerequisite, label: MATN_INFO[prerequisite].label }
			: null,
		requiresPlacement: prerequisite !== null,
		placementPassed: prerequisite === null || Boolean(participant.tajweedPlacementPassedAt),
		totalLines: info.lines,
		completedLines: stats.completedLines,
		nextLine: completed ? null : Math.min(info.lines, stats.lastLine + 1),
		todayLine: stats.todayLine,
		todayRecorded: stats.todayLine !== null,
		completed
	}
}

export interface PlacementQuiz {
	track: TajweedTrack
	prerequisite: { track: TajweedTrack; label: string }
	heading: string
	questions: Array<{ id: string; question: string; options: string[] }>
	length: number
}

interface PlacementTarget {
	prerequisite: 'TUHFATUL_ATFAL' | 'JAZARIYYAH'
	track: TajweedTrack
}

function placementTarget(participant: AlMamharahParticipant): PlacementTarget {
	const track = normalizeTajweedTrack(participant.tajweedTrack)
	if (!track) throw new ValidationError('Choose a tajweed track first')
	const prerequisite = prerequisiteFor(track)
	if (!prerequisite) {
		throw new ValidationError('This matn does not require a placement check')
	}
	return { prerequisite: prerequisite as 'TUHFATUL_ATFAL' | 'JAZARIYYAH', track }
}

/**
 * Serves a random placement quiz on the matn that precedes the chosen track.
 * Previously served question ids can be excluded so a retry gets a fresh set.
 */
export function buildPlacementQuiz(
	participant: AlMamharahParticipant,
	exclude: string[] = []
): PlacementQuiz {
	const { prerequisite, track } = placementTarget(participant)
	const questions = sampleQuiz(prerequisite, QUIZ_LENGTH, exclude).map(
		({ id, question, options }) => ({
			id,
			question,
			options
		})
	)
	return {
		track,
		prerequisite: { track: prerequisite, label: MATN_INFO[prerequisite].label },
		heading: `To study ${MATN_INFO[track].label}, you must have mastered ${MATN_INFO[prerequisite].label}.`,
		questions,
		length: QUIZ_LENGTH
	}
}

export interface PlacementResult {
	passed: boolean
	correct: number
	total: number
	recommendation: { track: TajweedTrack; label: string; message: string } | null
}

/** Grades a placement attempt; passing unlocks line registration. */
export async function submitPlacementQuiz(
	participant: AlMamharahParticipant,
	answers: QuizAnswer[]
): Promise<PlacementResult> {
	const { prerequisite, track } = placementTarget(participant)
	if (participant.tajweedPlacementPassedAt) {
		return { passed: true, correct: QUIZ_LENGTH, total: QUIZ_LENGTH, recommendation: null }
	}

	const grade = gradeQuiz(prerequisite, answers)

	if (!grade.passed) {
		await recordAudit({
			actorType: 'PARTICIPANT',
			actor: participant.email,
			action: 'TAJWEED_PLACEMENT_FAILED',
			entity: 'participant',
			entityId: participant.id,
			details: { track, prerequisite, correct: grade.correct, total: grade.total }
		})
		return {
			passed: false,
			correct: grade.correct,
			total: grade.total,
			recommendation: {
				track: prerequisite,
				label: MATN_INFO[prerequisite].label,
				message: `You scored ${grade.correct}/${grade.total}. We recommend starting with ${MATN_INFO[prerequisite].label} before ${MATN_INFO[track].label}.`
			}
		}
	}

	await db
		.update(alMamharahParticipants)
		.set({ tajweedPlacementPassedAt: new Date(), updatedAt: new Date() })
		.where(eq(alMamharahParticipants.id, participant.id))

	await recordAudit({
		actorType: 'PARTICIPANT',
		actor: participant.email,
		action: 'TAJWEED_PLACEMENT_PASSED',
		entity: 'participant',
		entityId: participant.id,
		details: { track, prerequisite, correct: grade.correct, total: grade.total }
	})
	logger.info({ participantId: participant.id, track }, 'Tajweed placement passed')

	return { passed: true, correct: grade.correct, total: grade.total, recommendation: null }
}

/**
 * Change the participant's own track.
 * - Moving down the ladder grants placement (they are being placed there).
 * - Choosing a matn that needs a prerequisite clears any previous pass so the
 *   placement quiz must be taken for that track.
 */
export async function chooseTajweedTrack(
	participant: AlMamharahParticipant,
	track: TajweedTrack | null
): Promise<TajweedStatus> {
	const current = normalizeTajweedTrack(participant.tajweedTrack)
	if (current === track) return getTajweedStatus(participant)

	const isDowngrade =
		current !== null && track !== null && tajweedTrackRank(track) < tajweedTrackRank(current)

	// * Moving down is a placement, so it grants the pass; any other change
	// * clears the previous pass and requires the quiz for the new track.
	const passedAt = isDowngrade ? new Date() : null

	await db
		.update(alMamharahParticipants)
		.set({ tajweedTrack: track, tajweedPlacementPassedAt: passedAt, updatedAt: new Date() })
		.where(eq(alMamharahParticipants.id, participant.id))

	await recordAudit({
		actorType: 'PARTICIPANT',
		actor: participant.email,
		action: 'TAJWEED_TRACK_CHANGED',
		entity: 'participant',
		entityId: participant.id,
		details: { from: current, to: track, placementBypassed: isDowngrade }
	})

	const updated: AlMamharahParticipant = {
		...participant,
		tajweedTrack: track,
		tajweedPlacementPassedAt: passedAt
	}
	return getTajweedStatus(updated)
}

/** Manager override: set any track and skip the placement check. */
export async function setTajweedTrackByManager(
	participant: AlMamharahParticipant,
	track: TajweedTrack | null,
	actor: string,
	options: { skipPlacement?: boolean } = {}
): Promise<AlMamharahParticipant> {
	const current = normalizeTajweedTrack(participant.tajweedTrack)
	const requiresPlacement = track !== null && prerequisiteFor(track) !== null
	const passedAt = requiresPlacement ? (options.skipPlacement === false ? null : new Date()) : null

	const [updated] = await db
		.update(alMamharahParticipants)
		.set({ tajweedTrack: track, tajweedPlacementPassedAt: passedAt, updatedAt: new Date() })
		.where(eq(alMamharahParticipants.id, participant.id))
		.returning()

	await recordAudit({
		actorType: 'MANAGER',
		actor,
		action: 'TAJWEED_TRACK_SET',
		entity: 'participant',
		entityId: participant.id,
		details: { from: current, to: track, placementSkipped: options.skipPlacement !== false }
	})

	return updated
}
