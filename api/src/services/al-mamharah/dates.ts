// * Date helpers for the Al-Mamharah programme.
// * All programme dates are plain YYYY-MM-DD strings interpreted in the
// * programme timezone (server-side only — clients never submit streak dates).

export type ISODate = string // * YYYY-MM-DD

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Returns true when `value` is a real calendar date in YYYY-MM-DD format. */
export function isValidISODate(value: unknown): value is ISODate {
	if (typeof value !== 'string' || !ISO_DATE_RE.test(value)) return false
	const parsed = parseISO(value)
	return parsed !== null && toISO(parsed) === value
}

/** Parses a YYYY-MM-DD string into a UTC Date at midnight. Returns null if invalid. */
export function parseISO(value: ISODate): Date | null {
	if (!ISO_DATE_RE.test(value)) return null
	const [y, m, d] = value.split('-').map(Number)
	const date = new Date(Date.UTC(y, m - 1, d))
	if (Number.isNaN(date.getTime())) return null
	return date
}

/** Formats a UTC Date as YYYY-MM-DD. */
export function toISO(date: Date): ISODate {
	const y = date.getUTCFullYear().toString().padStart(4, '0')
	const m = (date.getUTCMonth() + 1).toString().padStart(2, '0')
	const d = date.getUTCDate().toString().padStart(2, '0')
	return `${y}-${m}-${d}`
}

/** Adds (or subtracts) whole days from a YYYY-MM-DD date. */
export function addDays(value: ISODate, days: number): ISODate {
	const date = parseISO(value)
	if (!date) throw new Error(`Invalid date: ${value}`)
	date.setUTCDate(date.getUTCDate() + days)
	return toISO(date)
}

/** Signed day difference: `b - a` in whole days. Throws on invalid input. */
export function diffDays(a: ISODate, b: ISODate): number {
	const da = parseISO(a)
	const db = parseISO(b)
	if (!da || !db) throw new Error(`Invalid date(s): ${a}, ${b}`)
	return Math.round((db.getTime() - da.getTime()) / 86_400_000)
}

/** Returns the later of two dates. */
export function maxISO(a: ISODate, b: ISODate): ISODate {
	return a >= b ? a : b
}

/** Returns the earlier of two dates. */
export function minISO(a: ISODate, b: ISODate): ISODate {
	return a <= b ? a : b
}

/**
 * Today's date in the given IANA timezone, as YYYY-MM-DD.
 * Uses the server clock — clients cannot influence this value.
 */
export function todayInTimeZone(timeZone: string): ISODate {
	try {
		// * en-CA formats as YYYY-MM-DD
		return new Intl.DateTimeFormat('en-CA', {
			timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		}).format(new Date())
	} catch {
		return new Intl.DateTimeFormat('en-CA', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		}).format(new Date())
	}
}

/** Returns true when the timezone string is a valid IANA timezone. */
export function isValidTimeZone(timeZone: string): boolean {
	try {
		new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date())
		return true
	} catch {
		return false
	}
}

export interface StreakStats {
	// * Consecutive eligible days completed, counting back from today (or yesterday
	// * when today's task is still outstanding)
	current: number
	// * Longest run of consecutive eligible days completed (preserved after resets)
	longest: number
	// * Total completed eligible days
	total: number
	// * Eligible days so far (from start through min(today, end))
	eligibleDays: number
	// * Eligible days without a completion
	missedDays: number
	// * total / eligibleDays (0 before the programme starts)
	completionRate: number
	// * Whether today (in programme time) already has a completion
	todayCompleted: boolean
	// * Whether today is an eligible programme day at all
	todayEligible: boolean
}

/**
 * Computes streak and progress statistics from saved completion dates.
 *
 * Rules:
 * - Only days within [start, min(today, end)] are eligible; days outside the
 *   participant's approved start or after the programme end never count.
 * - Multiple submissions on the same date count once (input is a set).
 * - The current streak may start yesterday when today is still outstanding.
 * - The longest streak is preserved when the current streak resets.
 * - No grace periods, freezes, bonuses or penalties are applied.
 */
export function computeStreaks(
	completedDates: Iterable<ISODate>,
	start: ISODate,
	end: ISODate,
	today: ISODate
): StreakStats {
	const completed = new Set<ISODate>()
	for (const d of completedDates) {
		if (isValidISODate(d)) completed.add(d)
	}

	const lastEligible = minISO(today, end)

	if (diffDays(start, lastEligible) < 0) {
		// * Programme (or participant) has not started yet
		return {
			current: 0,
			longest: 0,
			total: 0,
			eligibleDays: 0,
			missedDays: 0,
			completionRate: 0,
			todayCompleted: false,
			todayEligible: false
		}
	}

	let total = 0
	let longest = 0
	let run = 0
	let cursor: ISODate = start
	const totalDays = diffDays(start, lastEligible)

	for (let i = 0; i <= totalDays; i++) {
		if (completed.has(cursor)) {
			total++
			run++
			if (run > longest) longest = run
		} else {
			run = 0
		}
		cursor = addDays(cursor, 1)
	}

	// * Current streak: walk back from today when completed, otherwise from
	// * yesterday (today's task may simply not be due yet)
	let current = 0
	const todayEligible = diffDays(today, end) >= 0
	const todayCompleted = todayEligible && completed.has(today)
	if (todayCompleted) {
		let c: ISODate = today
		while (diffDays(start, c) >= 0 && completed.has(c)) {
			current++
			c = addDays(c, -1)
		}
	} else if (diffDays(start, today) > 0 && completed.has(addDays(today, -1))) {
		let c: ISODate = addDays(today, -1)
		while (diffDays(start, c) >= 0 && completed.has(c)) {
			current++
			c = addDays(c, -1)
		}
	}

	const eligibleDays = totalDays + 1
	return {
		current,
		longest,
		total,
		eligibleDays,
		missedDays: eligibleDays - total,
		completionRate: eligibleDays > 0 ? Math.round((total / eligibleDays) * 1000) / 10 : 0,
		todayCompleted,
		todayEligible
	}
}

export interface RankedEntry {
	displayName: string
	current: number
	longest: number
	total: number
}

/**
 * Assigns ranks: primarily by current streak, then longest streak, then total
 * completed days. Equal statistics receive equal (competition-style) ranks;
 * remaining ties are broken alphabetically for stable ordering only.
 */
export function rankEntries<T extends RankedEntry>(entries: T[]): (T & { rank: number })[] {
	const sorted = [...entries].sort((a, b) => {
		if (b.current !== a.current) return b.current - a.current
		if (b.longest !== a.longest) return b.longest - a.longest
		if (b.total !== a.total) return b.total - a.total
		return a.displayName.localeCompare(b.displayName)
	})

	let rank = 0
	let prevKey = ''
	return sorted.map((entry, i) => {
		const key = `${entry.current}:${entry.longest}:${entry.total}`
		if (key !== prevKey) {
			rank = i + 1
			prevKey = key
		}
		return { ...entry, rank }
	})
}
