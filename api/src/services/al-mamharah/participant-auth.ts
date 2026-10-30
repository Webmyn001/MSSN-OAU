import bcrypt from 'bcrypt'
import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '../../lib/db'
import {
	alMamharahAuditLog,
	alMamharahCompletions,
	alMamharahParticipants,
	type AlMamharahParticipant
} from '../../db/schema'
import { logger } from '../../lib/logger'
import { recordAudit } from './audit'
import { getSettings, type AlMamharahSettings } from './settings'
import { todayInTimeZone, type ISODate } from './dates'
import { toISODateValue } from './participants'

// * Password-based access for Al-Mamharah participants.
// * A participant's passwordHash is NULL until they set one via the OTP
// * "enter programme" flow; afterwards they sign in with name + password and
// * only use OTP again through the forgotten-password reset.

const BCRYPT_ROUNDS = 10

/** Hashes a participant password with bcrypt. */
export async function hashParticipantPassword(password: string): Promise<string> {
	return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/** Constant-time bcrypt comparison; false when the participant has no password. */
export async function verifyParticipantPassword(
	participant: Pick<AlMamharahParticipant, 'passwordHash'>,
	password: string
): Promise<boolean> {
	if (!participant.passwordHash) return false
	return bcrypt.compare(password, participant.passwordHash)
}

/** Persists a new password hash for a participant. */
export async function setParticipantPassword(
	participantId: string,
	password: string
): Promise<void> {
	const passwordHash = await hashParticipantPassword(password)
	await db
		.update(alMamharahParticipants)
		.set({ passwordHash, updatedAt: new Date() })
		.where(eq(alMamharahParticipants.id, participantId))
	logger.info({ participantId }, 'Al-Mamharah participant password set')
}

// * --- Auto-suspension for missed days --------------------------------------

/**
 * Counts eligible programme days elapsed so far this calendar month for a
 * participant, and how many of those days they completed. A day is "eligible"
 * once the participant's window has started and it is not after today.
 */
export async function monthMissedDays(
	participant: AlMamharahParticipant,
	settings: AlMamharahSettings,
	today: ISODate
): Promise<{ elapsed: number; completed: number; missed: number }> {
	const todayDate = new Date(`${today}T12:00:00Z`)
	const year = todayDate.getUTCFullYear()
	const month = todayDate.getUTCMonth()
	const monthStart: ISODate = `${year}-${String(month + 1).padStart(2, '0')}-01`
	const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

	const windowStart =
		toISODateValue(participant.startDate) > settings.start
			? toISODateValue(participant.startDate)
			: settings.start

	let elapsed = 0
	for (let day = 1; day <= daysInMonth; day++) {
		const date: ISODate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
		if (date < monthStart || date > today) continue
		if (date < windowStart) continue
		elapsed++
	}

	if (elapsed === 0) return { elapsed: 0, completed: 0, missed: 0 }

	const rows = await db
		.select({ programmeDate: alMamharahCompletions.programmeDate })
		.from(alMamharahCompletions)
		.where(
			and(
				eq(alMamharahCompletions.participantId, participant.id),
				// * Only the core muroja'ah keeps a day "present": the optional
				// * tajweed line must not rescue a missed muroja'ah day.
				eq(alMamharahCompletions.taskType, 'MUROJAAH'),
				sql`${alMamharahCompletions.programmeDate} >= ${monthStart}`,
				sql`${alMamharahCompletions.programmeDate} <= ${today}`
			)
		)
	const completedDays = new Set(rows.map(row => toISODateValue(row.programmeDate)))
	return {
		elapsed,
		completed: completedDays.size,
		missed: Math.max(0, elapsed - completedDays.size)
	}
}

/**
 * Suspends a single participant if they have missed at least
 * `settings.maxMissedDaysPerMonth` eligible days this calendar month.
 * Returns the participant's up-to-date row.
 */
export async function enforceForParticipant(
	participant: AlMamharahParticipant,
	settings?: AlMamharahSettings,
	todayOverride?: ISODate
): Promise<AlMamharahParticipant> {
	if (participant.status !== 'ACTIVE') return participant
	const resolvedSettings = settings ?? (await getSettings())
	const today = todayOverride ?? todayInTimeZone(resolvedSettings.timezone)
	const threshold = resolvedSettings.maxMissedDaysPerMonth

	const { missed } = await monthMissedDays(participant, resolvedSettings, today)
	if (missed < threshold) return participant

	const [updated] = await db
		.update(alMamharahParticipants)
		.set({ status: 'SUSPENDED', updatedAt: new Date() })
		.where(
			and(
				eq(alMamharahParticipants.id, participant.id),
				eq(alMamharahParticipants.status, 'ACTIVE')
			)
		)
		.returning()
	if (!updated) return participant

	await recordAudit({
		actorType: 'SYSTEM',
		action: 'PARTICIPANT_SUSPENDED',
		entity: 'participant',
		entityId: participant.id,
		details: { reason: 'MISSED_DAYS', missedDays: missed, threshold }
	})
	logger.info(
		{ participantId: participant.id, missedDays: missed, threshold },
		'Al-Mamharah participant auto-suspended for missed days'
	)
	return updated
}

/**
 * Suspends every ACTIVE participant who has missed at least
 * `settings.maxMissedDaysPerMonth` eligible days this calendar month.
 * Used on the manager sweep endpoint.
 */
export async function enforceMissedDaySuspension(
	settings?: AlMamharahSettings,
	todayOverride?: ISODate
): Promise<{ checked: number; suspended: AlMamharahParticipant[] }> {
	const resolvedSettings = settings ?? (await getSettings())
	const today = todayOverride ?? todayInTimeZone(resolvedSettings.timezone)

	const active = await db
		.select()
		.from(alMamharahParticipants)
		.where(eq(alMamharahParticipants.status, 'ACTIVE'))

	const suspended: AlMamharahParticipant[] = []
	for (const participant of active) {
		const updated = await enforceForParticipant(participant, resolvedSettings, today)
		if (updated.status === 'SUSPENDED' && participant.status === 'ACTIVE') {
			suspended.push(updated)
		}
	}

	if (suspended.length > 0) {
		logger.info(
			{ count: suspended.length },
			'Al-Mamharah participants auto-suspended for missed days'
		)
	}
	return { checked: active.length, suspended }
}

// * --- Suspension notices ----------------------------------------------------

export type SuspensionReason = 'MISSED_DAYS' | 'MANUAL'

export interface ParticipantSuspension {
	suspended: boolean
	reason: SuspensionReason | null
	missedDays: number | null
	threshold: number | null
}

/**
 * Explains why a suspended participant is blocked.
 *
 * The most recent `PARTICIPANT_SUSPENDED` audit entry records whether the
 * system auto-suspended the account for missed days (`reason: MISSED_DAYS`) or
 * a manager suspended it manually. Accounts suspended before the audit entry
 * existed fall back to the manual wording.
 */
export async function getParticipantSuspension(
	participant: Pick<AlMamharahParticipant, 'id' | 'status'>
): Promise<ParticipantSuspension> {
	if (participant.status !== 'SUSPENDED') {
		return { suspended: false, reason: null, missedDays: null, threshold: null }
	}

	let details: Record<string, unknown> = {}
	try {
		const [entry] = await db
			.select({ details: alMamharahAuditLog.details })
			.from(alMamharahAuditLog)
			.where(
				and(
					eq(alMamharahAuditLog.entityId, participant.id),
					eq(alMamharahAuditLog.action, 'PARTICIPANT_SUSPENDED')
				)
			)
			.orderBy(desc(alMamharahAuditLog.createdAt))
			.limit(1)
		details = entry?.details ?? {}
	} catch (error) {
		logger.error({ error, participantId: participant.id }, 'Failed reading suspension reason')
	}

	const auto = details.reason === 'MISSED_DAYS'
	return {
		suspended: true,
		reason: auto ? 'MISSED_DAYS' : 'MANUAL',
		missedDays: typeof details.missedDays === 'number' ? details.missedDays : null,
		threshold: typeof details.threshold === 'number' ? details.threshold : null
	}
}

/**
 * Login notice shown when a suspended participant tries to sign in. Missed-day
 * suspensions name the threshold so the student understands why the account
 * was blocked; every notice tells them to contact the admin for support.
 */
export function suspendedAccountNotice(
	reason: SuspensionReason,
	threshold: number
): { code: 'ACCOUNT_SUSPENDED'; message: string; messageAr: string } {
	if (reason === 'MISSED_DAYS') {
		return {
			code: 'ACCOUNT_SUSPENDED',
			message: `Your account has been suspended because you missed ${threshold} days of recording in a month. Please contact the admin for support.`,
			messageAr: `تم تعليق حسابك لأنك فاتتك ${threshold} أيام من التسجيل في شهر واحد. يُرجى التواصل مع الإدارة للحصول على الدعم.`
		}
	}
	return {
		code: 'ACCOUNT_SUSPENDED',
		message: 'Your account has been suspended. Please contact the admin for support.',
		messageAr: 'تم تعليق حسابك. يُرجى التواصل مع الإدارة للحصول على الدعم.'
	}
}
