import { describe, expect, test } from 'bun:test'
import {
	addDays,
	computeStreaks,
	diffDays,
	isValidISODate,
	rankEntries,
	todayInTimeZone
} from '../src/services/al-mamharah/dates'
import { dailyTargetFromMasar, masarPagesPerDay, positionalDailyTarget } from '../src/services/al-mamharah/progress'
import { clampPage, pageRangeLabel, surahAtPage } from '../src/services/al-mamharah/mushaf'
import { normalizeSettings, DEFAULT_SETTINGS } from '../src/services/al-mamharah/settings'
import { normalizePersonName } from '../src/services/al-mamharah/applications'

// * Pure-function tests — no database required.

describe('date helpers', () => {
	test('validates ISO dates', () => {
		expect(isValidISODate('2026-10-18')).toBe(true)
		expect(isValidISODate('2026-02-30')).toBe(false)
		expect(isValidISODate('18-10-2026')).toBe(false)
		expect(isValidISODate('')).toBe(false)
	})

	test('adds and diffs days across month boundaries', () => {
		expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
		expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
		expect(diffDays('2026-10-18', '2026-11-18')).toBe(31)
	})

	test('resolves today in a timezone', () => {
		expect(todayInTimeZone('Africa/Lagos')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
	})
})

describe('computeStreaks', () => {
	const start = '2026-10-18'
	const end = '2026-11-18'

	test('counts a run ending today', () => {
		const today = '2026-10-21'
		const stats = computeStreaks(
			['2026-10-18', '2026-10-19', '2026-10-20', '2026-10-21'],
			start,
			end,
			today
		)
		expect(stats.current).toBe(4)
		expect(stats.longest).toBe(4)
		expect(stats.total).toBe(4)
		expect(stats.eligibleDays).toBe(4)
		expect(stats.missedDays).toBe(0)
		expect(stats.completionRate).toBe(100)
		expect(stats.todayCompleted).toBe(true)
	})

	test('allows the current streak to end yesterday when today is outstanding', () => {
		const today = '2026-10-21'
		const stats = computeStreaks(['2026-10-19', '2026-10-20'], start, end, today)
		expect(stats.current).toBe(2)
		expect(stats.todayCompleted).toBe(false)
		expect(stats.eligibleDays).toBe(4)
		expect(stats.missedDays).toBe(2)
	})

	test('breaks the current streak on a missed day but preserves the longest', () => {
		const today = '2026-10-24'
		const stats = computeStreaks(
			['2026-10-18', '2026-10-19', '2026-10-20', '2026-10-23', '2026-10-24'],
			start,
			end,
			today
		)
		expect(stats.current).toBe(2)
		expect(stats.longest).toBe(3)
		expect(stats.total).toBe(5)
		expect(stats.missedDays).toBe(2)
	})

	test('ignores completions outside the programme window and duplicates', () => {
		const today = '2026-10-20'
		const stats = computeStreaks(
			['2026-10-17', '2026-10-18', '2026-10-18', '2026-10-19', '2026-10-20'],
			start,
			end,
			today
		)
		expect(stats.total).toBe(3)
		expect(stats.current).toBe(3)
		expect(stats.longest).toBe(3)
	})

	test('returns zeroes before the participant window starts', () => {
		const stats = computeStreaks(['2026-10-25'], '2026-10-26', end, '2026-10-25')
		expect(stats.current).toBe(0)
		expect(stats.eligibleDays).toBe(0)
		expect(stats.completionRate).toBe(0)
	})

	test('stops counting at the programme end date', () => {
		const stats = computeStreaks(
			['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19'],
			start,
			end,
			'2026-11-25'
		)
		expect(stats.total).toBe(3)
		expect(stats.todayEligible).toBe(false)
		expect(stats.todayCompleted).toBe(false)
		expect(stats.current).toBe(0)
		expect(stats.longest).toBe(3)
	})
})

describe('rankEntries', () => {
	test('ranks by current, then longest, then total, with ties sharing a rank', () => {
		const ranked = rankEntries([
			{ displayName: 'Bilal', current: 3, longest: 5, total: 10 },
			{ displayName: 'Aisha', current: 5, longest: 5, total: 12 },
			{ displayName: 'Umar', current: 3, longest: 6, total: 9 },
			{ displayName: 'Zaid', current: 5, longest: 5, total: 12 }
		])
		expect(ranked.map(entry => entry.rank)).toEqual([1, 1, 3, 4])
		expect(ranked[0].displayName).toBe('Aisha')
		expect(ranked[1].displayName).toBe('Zaid')
		expect(ranked[2].displayName).toBe('Umar')
	})
})

describe('dailyTargetFromMasar', () => {
	test('maps each masār to its daily target', () => {
		expect(dailyTargetFromMasar('THREE_PAGES').pages).toBe(3)
		expect(dailyTargetFromMasar('TWO_PAGES').pages).toBe(2)
		expect(dailyTargetFromMasar('FOUR_PAGES').pages).toBe(4)
		expect(dailyTargetFromMasar('ONE_JUZ').juz).toBe(1)
		expect(dailyTargetFromMasar('THREE_JUZ').juz).toBe(3)
		expect(dailyTargetFromMasar('FIVE_JUZ').juz).toBe(5)
		expect(dailyTargetFromMasar('KHATM').label).toBe('Full khatm')
	})
})

describe('normalizeSettings', () => {
	test('fills defaults for invalid input', () => {
		const settings = normalizeSettings({
			start: 'nonsense',
			end: 'also-nonsense',
			timezone: 'Mars/Olympus'
		})
		expect(settings.start).toBe(DEFAULT_SETTINGS.start)
		expect(settings.end).toBe(DEFAULT_SETTINGS.end)
		expect(settings.timezone).toBe(DEFAULT_SETTINGS.timezone)
		expect(settings.tasks).toEqual(DEFAULT_SETTINGS.tasks)
	})

	test('keeps streak tasks inside configured tasks', () => {
		const settings = normalizeSettings({
			...DEFAULT_SETTINGS,
			tasks: ['TAJWEED_QIRAAT'],
			streakTasks: ['MUROJAAH']
		})
		expect(settings.streakTasks).toEqual(['TAJWEED_QIRAAT'])
	})

	test('never lets the end date precede the start date', () => {
		const settings = normalizeSettings({
			...DEFAULT_SETTINGS,
			start: '2026-11-18',
			end: '2026-10-18'
		})
		expect(settings.end).toBe('2026-11-18')
	})

	test('defaults acceptingApplications and clamps maxMissedDaysPerMonth', () => {
		const settings = normalizeSettings({
			...DEFAULT_SETTINGS,
			maxMissedDaysPerMonth: 0
		})
		expect(settings.acceptingApplications).toBe(true)
		expect(settings.maxMissedDaysPerMonth).toBe(4)

		const closed = normalizeSettings({
			...DEFAULT_SETTINGS,
			acceptingApplications: false,
			maxMissedDaysPerMonth: 7
		})
		expect(closed.acceptingApplications).toBe(false)
		expect(closed.maxMissedDaysPerMonth).toBe(7)
	})
})

describe('normalizePersonName', () => {
	test('trims and collapses whitespace', () => {
		expect(normalizePersonName('  Abdur  Rahmān   Bello ')).toBe('Abdur Rahmān Bello')
	})
})

describe('mushaf page map', () => {
	test('resolves the surah containing a page', () => {
		expect(surahAtPage(1).name).toBe('Al-Fātiḥah')
		expect(surahAtPage(2).name).toBe('Al-Baqarah')
		expect(surahAtPage(50).name).toBe('Āl ʿImrān')
		expect(surahAtPage(604).name).toBe('An-Nās')
	})

	test('clamps pages into the mushaf range', () => {
		expect(clampPage(0)).toBe(1)
		expect(clampPage(999)).toBe(604)
		expect(clampPage(300)).toBe(300)
	})

	test('formats a page range label', () => {
		expect(pageRangeLabel(2, 4)).toBe('Al-Baqarah · pg 2–4')
		expect(pageRangeLabel(440, 440)).toBe('Yā-Sīn · pg 440')
	})
})

describe('masarPagesPerDay', () => {
	test('maps masār to pages per day', () => {
		expect(masarPagesPerDay('TWO_PAGES')).toBe(2)
		expect(masarPagesPerDay('ONE_JUZ')).toBe(20)
		expect(masarPagesPerDay('FIVE_JUZ')).toBe(100)
		expect(masarPagesPerDay('KHATM')).toBeNull()
	})
})

describe('positionalDailyTarget', () => {
	const settings = { ...DEFAULT_SETTINGS }

	test('advances from the start page by the daily page count', () => {
		const target = positionalDailyTarget(
			{
				masar: 'THREE_PAGES',
				startSurah: 'Al-Baqarah',
				startPage: 2,
				startDate: '2026-10-18'
			},
			settings,
			'2026-10-18'
		)
		expect(target.fromPage).toBe(2)
		expect(target.toPage).toBe(4)
		expect(target.surah).toBe('Al-Baqarah')
		expect(target.label).toContain('Al-Baqarah · pg 2–4')
	})

	test('moves forward on later days', () => {
		const target = positionalDailyTarget(
			{
				masar: 'TWO_PAGES',
				startSurah: 'Al-Fātiḥah',
				startPage: 1,
				startDate: '2026-10-18'
			},
			settings,
			'2026-10-19'
		)
		// * day index 1 → pages 3–4 (still Al-Baqarah)
		expect(target.fromPage).toBe(3)
		expect(target.toPage).toBe(4)
	})

	test('falls back to the plain masār label without a start page', () => {
		const target = positionalDailyTarget(
			{ masar: 'THREE_PAGES', startSurah: null, startPage: null, startDate: '2026-10-18' },
			settings,
			'2026-10-18'
		)
		expect(target.fromPage).toBeUndefined()
		expect(target.label).toBe('3 pages daily')
	})
})
