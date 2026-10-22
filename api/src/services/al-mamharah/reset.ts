import { count } from 'drizzle-orm'
import { db } from '../../lib/db'
import {
	alMamharahCompletions,
	alMamharahParticipantSessions,
	alMamharahParticipants,
	alMamharahVerificationCodes
} from '../../db/schema'
import { addDays, todayInTimeZone, type ISODate } from './dates'
import { DEFAULT_SETTINGS, saveSettings, type AlMamharahSettings } from './settings'

// * "Reset programme" wipes every recorded reading and restarts the programme
// * from today. Student accounts, applications and passwords are kept so
// * participants only need to sign in again.

export interface ProgrammeResetResult {
	completionsDeleted: number
	sessionsDeleted: number
	codesDeleted: number
	participantsReset: number
	settings: AlMamharahSettings
	start: ISODate
	end: ISODate
}

/** Same length as the official window (18 Oct – 18 Nov 2026). */
const PROGRAMME_WINDOW_DAYS = 31

/**
 * Deletes all completions, sessions and pending login codes, returns every
 * participant to ACTIVE with a fresh start date, and resets programme
 * settings to their defaults with the window starting today.
 */
export async function resetProgramme(): Promise<ProgrammeResetResult> {
	const start = todayInTimeZone(DEFAULT_SETTINGS.timezone)
	const end = addDays(start, PROGRAMME_WINDOW_DAYS)

	const counts = await db.transaction(async tx => {
		const [completionRow] = await tx
			.select({ value: count() })
			.from(alMamharahCompletions)
		const [sessionRow] = await tx
			.select({ value: count() })
			.from(alMamharahParticipantSessions)
		const [codeRow] = await tx.select({ value: count() }).from(alMamharahVerificationCodes)

		await tx.delete(alMamharahCompletions)
		await tx.delete(alMamharahParticipantSessions)
		await tx.delete(alMamharahVerificationCodes)

		const reset = await tx
			.update(alMamharahParticipants)
			.set({ status: 'ACTIVE', startDate: start, updatedAt: new Date() })
			.returning({ id: alMamharahParticipants.id })

		return {
			completionsDeleted: completionRow?.value ?? 0,
			sessionsDeleted: sessionRow?.value ?? 0,
			codesDeleted: codeRow?.value ?? 0,
			participantsReset: reset.length
		}
	})

	const settings = await saveSettings({
		...DEFAULT_SETTINGS,
		start,
		end,
		acceptingApplications: true
	})

	return { ...counts, settings, start, end }
}
