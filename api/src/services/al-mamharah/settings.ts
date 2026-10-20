import { getConfigValue, setConfigValue } from '../config-store'
import { isValidISODate, isValidTimeZone, type ISODate } from './dates'

// * Programme settings are stored in the existing website_config key/value
// * store so managers can update them without a redeploy.

export const AL_MAMHARAH_SETTINGS_KEY = 'al_mamharah_settings'

export type AlMamharahTaskType = 'MUROJAAH' | 'TAJWEED_QIRAAT'

export interface AlMamharahSettings {
	// * Initial phase of the programme
	start: ISODate
	end: ISODate
	// * IANA timezone used for "today" and streak calculations
	timezone: string
	// * Daily tasks participants can record
	tasks: AlMamharahTaskType[]
	// * Tasks that must be completed for a day to count toward the streak
	streakTasks: AlMamharahTaskType[]
	// * Whether new applications are accepted (managers toggle this)
	acceptingApplications: boolean
	// * Auto-suspend a participant once they miss this many days in a calendar month
	maxMissedDaysPerMonth: number
}

// * Official programme information (initial phase: 18 Oct – 18 Nov 2026)
export const DEFAULT_SETTINGS: AlMamharahSettings = {
	start: '2026-10-18',
	end: '2026-11-18',
	timezone: 'Africa/Lagos',
	tasks: ['MUROJAAH'],
	streakTasks: ['MUROJAAH'],
	acceptingApplications: true,
	maxMissedDaysPerMonth: 4
}

const TASK_TYPES: AlMamharahTaskType[] = ['MUROJAAH', 'TAJWEED_QIRAAT']

/** Validates and normalises a partial settings object; fills defaults. */
export function normalizeSettings(
	input: Partial<AlMamharahSettings> | null | undefined
): AlMamharahSettings {
	const merged: AlMamharahSettings = { ...DEFAULT_SETTINGS, ...(input ?? {}) }

	if (!isValidISODate(merged.start)) merged.start = DEFAULT_SETTINGS.start
	if (!isValidISODate(merged.end)) merged.end = DEFAULT_SETTINGS.end
	if (merged.end < merged.start) merged.end = merged.start
	if (typeof merged.timezone !== 'string' || !isValidTimeZone(merged.timezone)) {
		merged.timezone = DEFAULT_SETTINGS.timezone
	}
	const filterTasks = (tasks: unknown): AlMamharahTaskType[] =>
		Array.isArray(tasks)
			? [
					...new Set(
						tasks.filter((t): t is AlMamharahTaskType =>
							TASK_TYPES.includes(t as AlMamharahTaskType)
						)
					)
				]
			: []
	merged.tasks = filterTasks(merged.tasks)
	if (merged.tasks.length === 0) merged.tasks = [...DEFAULT_SETTINGS.tasks]
	merged.streakTasks = filterTasks(merged.streakTasks).filter(t => merged.tasks.includes(t))
	if (merged.streakTasks.length === 0) merged.streakTasks = [...merged.tasks]
	merged.acceptingApplications =
		typeof merged.acceptingApplications === 'boolean'
			? merged.acceptingApplications
			: DEFAULT_SETTINGS.acceptingApplications
	const missed = Number(merged.maxMissedDaysPerMonth)
	merged.maxMissedDaysPerMonth =
		Number.isFinite(missed) && missed >= 1 && missed <= 31
			? Math.floor(missed)
			: DEFAULT_SETTINGS.maxMissedDaysPerMonth
	return merged
}

/** Reads programme settings, degrading to defaults if unavailable. */
export async function getSettings(): Promise<AlMamharahSettings> {
	const stored = await getConfigValue<Partial<AlMamharahSettings> | null>(
		AL_MAMHARAH_SETTINGS_KEY,
		null
	)
	return normalizeSettings(stored)
}

/** Upserts programme settings and returns the normalised value. */
export async function saveSettings(
	input: Partial<AlMamharahSettings>
): Promise<AlMamharahSettings> {
	const normalized = normalizeSettings(input)
	await setConfigValue(AL_MAMHARAH_SETTINGS_KEY, normalized)
	return normalized
}
