import { describe, expect, test } from 'bun:test'
import {
	addDays,
	computeStreaks,
	dateInTimeZone,
	diffDays,
	isValidISODate,
	rankEntries,
	todayInTimeZone
} from '../src/services/al-mamharah/dates'
import {
	dailyTargetFromMasar,
	masarPagesPerDay,
	positionalDailyTarget
} from '../src/services/al-mamharah/progress'
import { clampPage, pageRangeLabel, surahAtPage } from '../src/services/al-mamharah/mushaf'
import { normalizeSettings, DEFAULT_SETTINGS } from '../src/services/al-mamharah/settings'
import { normalizePersonName } from '../src/services/al-mamharah/applications'
import {
	MATN_INFO,
	QUIZ_BANK,
	QUIZ_LENGTH,
	gradeQuiz,
	normalizeTajweedTrack,
	prerequisiteFor,
	sampleQuiz,
	tajweedTrackLabel,
	type QuizAnswer
} from '../src/services/al-mamharah/tajweed'
import { needsPlacementQuiz } from '../src/services/al-mamharah/placement'

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

	test('maps a registration timestamp to the programme calendar day', () => {
		// * 23:30 UTC is already the next day in Lagos (UTC+1).
		expect(dateInTimeZone(new Date('2026-10-17T23:30:00Z'), 'Africa/Lagos')).toBe('2026-10-18')
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

	test('weights each recorded task as half of the day mark', () => {
		const today = '2026-10-20'
		const marksByDate = new Map([
			['2026-10-18', 1],
			['2026-10-19', 0.5],
			['2026-10-20', 0.5]
		])
		const stats = computeStreaks(
			['2026-10-18', '2026-10-19', '2026-10-20'],
			start,
			end,
			today,
			marksByDate
		)
		expect(stats.total).toBe(3)
		expect(stats.marks).toBe(2)
		expect(stats.completionRate).toBe(66.7)
		expect(stats.current).toBe(3)
	})
})

describe('rankEntries', () => {
	test('ranks by total marks, then current, then longest, with ties sharing a rank', () => {
		const ranked = rankEntries([
			{ displayName: 'Bilal', current: 3, longest: 5, total: 10 },
			{ displayName: 'Aisha', current: 5, longest: 5, total: 12 },
			{ displayName: 'Umar', current: 3, longest: 6, total: 9 },
			{ displayName: 'Zaid', current: 5, longest: 5, total: 12 }
		])
		expect(ranked.map(entry => entry.rank)).toEqual([1, 1, 2, 3])
		expect(ranked[0].displayName).toBe('Aisha')
		expect(ranked[1].displayName).toBe('Zaid')
		expect(ranked[2].displayName).toBe('Bilal')
		expect(ranked[3].displayName).toBe('Umar')
	})

	test('continues with the next ordinal after a shared first place', () => {
		const ranked = rankEntries([
			{ displayName: 'Aisha', current: 5, longest: 5, total: 12 },
			{ displayName: 'Bilal', current: 5, longest: 5, total: 12 },
			{ displayName: 'Umar', current: 5, longest: 5, total: 12 },
			{ displayName: 'Zaid', current: 3, longest: 3, total: 8 },
			{ displayName: 'Maryam', current: 2, longest: 2, total: 6 }
		])
		expect(ranked.map(entry => entry.rank)).toEqual([1, 1, 1, 2, 3])
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
		expect(surahAtPage(1).name).toBe('Al Fātiḥah')
		expect(surahAtPage(2).name).toBe('Al Baqarah')
		expect(surahAtPage(50).name).toBe('Āl ʿImrān')
		expect(surahAtPage(604).name).toBe('An Nās')
	})

	test('clamps pages into the mushaf range', () => {
		expect(clampPage(0)).toBe(1)
		expect(clampPage(999)).toBe(604)
		expect(clampPage(300)).toBe(300)
	})

	test('formats a page range label', () => {
		expect(pageRangeLabel(2, 4)).toBe('Surah Al Baqarah, pages 2 to 4')
		expect(pageRangeLabel(440, 440)).toBe('Surah Yā Sīn, page 440')
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
				startSurah: 'Al Baqarah',
				startPage: 2,
				startDirection: 'KAHF_UPWARD',
				startDate: '2026-10-18'
			},
			settings,
			'2026-10-18'
		)
		expect(target.fromPage).toBe(2)
		expect(target.toPage).toBe(4)
		expect(target.surah).toBe('Al Baqarah')
		expect(target.label).toContain('Surah Al Baqarah, pages 2 to 4')
	})

	test('moves forward on later days', () => {
		const target = positionalDailyTarget(
			{
				masar: 'TWO_PAGES',
				startSurah: 'Al Fātiḥah',
				startPage: 1,
				startDirection: 'KAHF_UPWARD',
				startDate: '2026-10-18'
			},
			settings,
			'2026-10-19'
		)
		// * day index 1 → pages 3–4 (still Al Baqarah)
		expect(target.fromPage).toBe(3)
		expect(target.toPage).toBe(4)
	})

	test('counts pages downward for the Kahf downward track', () => {
		const day0 = positionalDailyTarget(
			{
				masar: 'THREE_PAGES',
				startSurah: 'Al Kahf',
				startPage: 293,
				startDirection: 'KAHF_DOWNWARD',
				startDate: '2026-10-18'
			},
			settings,
			'2026-10-18'
		)
		expect(day0.fromPage).toBe(291)
		expect(day0.toPage).toBe(293)

		const day2 = positionalDailyTarget(
			{
				masar: 'THREE_PAGES',
				startSurah: 'Al Kahf',
				startPage: 293,
				startDirection: 'KAHF_DOWNWARD',
				startDate: '2026-10-18'
			},
			settings,
			'2026-10-20'
		)
		expect(day2.fromPage).toBe(285)
		expect(day2.toPage).toBe(287)
	})

	test('counts pages downward for the Baqarah downward track', () => {
		const target = positionalDailyTarget(
			{
				masar: 'THREE_PAGES',
				startSurah: 'Al Baqarah',
				startPage: 2,
				startDirection: 'BAQARAH_DOWNWARD',
				startDate: '2026-10-18'
			},
			settings,
			'2026-10-18'
		)
		// * clamped at the first page of the mushaf
		expect(target.fromPage).toBe(1)
		expect(target.toPage).toBe(2)
	})

	test('advances for the An Nās upward track', () => {
		const target = positionalDailyTarget(
			{
				masar: 'TWO_PAGES',
				startSurah: 'An Nās',
				startPage: 600,
				startDirection: 'NAS_UPWARD',
				startDate: '2026-10-18'
			},
			settings,
			'2026-10-18'
		)
		expect(target.fromPage).toBe(600)
		expect(target.toPage).toBe(601)
	})

	test('defaults to Al Fātiḥah when no start page is recorded', () => {
		const target = positionalDailyTarget(
			{
				masar: 'THREE_PAGES',
				startSurah: null,
				startPage: null,
				startDirection: null,
				startDate: '2026-10-18'
			},
			settings,
			'2026-10-18'
		)
		expect(target.fromPage).toBe(1)
		expect(target.toPage).toBe(3)
		expect(target.label).toContain('Surah Al Fātiḥah, pages 1 to 3')
	})

	test('keeps the plain label for khatm (no fixed page count)', () => {
		const target = positionalDailyTarget(
			{
				masar: 'KHATM',
				startSurah: 'Al Baqarah',
				startPage: 2,
				startDirection: 'KAHF_UPWARD',
				startDate: '2026-10-18'
			},
			settings,
			'2026-10-18'
		)
		expect(target.fromPage).toBeUndefined()
		expect(target.label).toBe('Full khatm')
	})
})

describe('tajweed tracks', () => {
	test('exposes the three mutūn with their lengths and prerequisites', () => {
		expect(MATN_INFO.TUHFATUL_ATFAL.lines).toBe(61)
		expect(MATN_INFO.JAZARIYYAH.lines).toBe(107)
		expect(MATN_INFO.SHAATIBIYYAH.lines).toBe(1173)
		expect(MATN_INFO.TUHFATUL_ATFAL.prerequisite).toBeNull()
		expect(MATN_INFO.JAZARIYYAH.prerequisite).toBe('TUHFATUL_ATFAL')
		expect(MATN_INFO.SHAATIBIYYAH.prerequisite).toBe('JAZARIYYAH')
	})

	test('normalises and labels tracks', () => {
		expect(normalizeTajweedTrack('JAZARIYYAH')).toBe('JAZARIYYAH')
		expect(normalizeTajweedTrack('nope')).toBeNull()
		expect(normalizeTajweedTrack(null)).toBeNull()
		expect(tajweedTrackLabel('SHAATIBIYYAH')).toBe(MATN_INFO.SHAATIBIYYAH.label)
		expect(tajweedTrackLabel(null)).toBeNull()
		expect(prerequisiteFor('JAZARIYYAH')).toBe('TUHFATUL_ATFAL')
		expect(prerequisiteFor('TUHFATUL_ATFAL')).toBeNull()
	})

	test('requires a placement quiz only for the upper two matns', () => {
		expect(needsPlacementQuiz({ tajweedTrack: null, tajweedPlacementPassedAt: null })).toBe(false)
		expect(
			needsPlacementQuiz({ tajweedTrack: 'TUHFATUL_ATFAL', tajweedPlacementPassedAt: null })
		).toBe(false)
		expect(needsPlacementQuiz({ tajweedTrack: 'JAZARIYYAH', tajweedPlacementPassedAt: null })).toBe(
			true
		)
		expect(
			needsPlacementQuiz({
				tajweedTrack: 'JAZARIYYAH',
				tajweedPlacementPassedAt: new Date()
			})
		).toBe(false)
		expect(
			needsPlacementQuiz({ tajweedTrack: 'SHAATIBIYYAH', tajweedPlacementPassedAt: null })
		).toBe(true)
	})

	test('serves two distinct questions from the correct bank', () => {
		const quiz = sampleQuiz('TUHFATUL_ATFAL')
		expect(quiz).toHaveLength(QUIZ_LENGTH)
		expect(new Set(quiz.map(q => q.id)).size).toBe(QUIZ_LENGTH)
		for (const question of quiz) {
			expect(QUIZ_BANK.TUHFATUL_ATFAL.some(q => q.id === question.id)).toBe(true)
			expect(question.options.length).toBeGreaterThanOrEqual(2)
		}
	})

	test('both banks hold at least thirty valid, unique questions', () => {
		for (const track of ['TUHFATUL_ATFAL', 'JAZARIYYAH'] as const) {
			const bank = QUIZ_BANK[track]
			expect(bank.length).toBeGreaterThanOrEqual(30)
			expect(new Set(bank.map(q => q.id)).size).toBe(bank.length)
			for (const question of bank) {
				expect(question.answer).toBeGreaterThanOrEqual(0)
				expect(question.answer).toBeLessThan(question.options.length)
			}
		}
	})

	test('a retry never repeats the questions already answered', () => {
		const first = sampleQuiz('TUHFATUL_ATFAL')
		const next = sampleQuiz(
			'TUHFATUL_ATFAL',
			QUIZ_LENGTH,
			first.map(q => q.id)
		)
		expect(next).toHaveLength(QUIZ_LENGTH)
		const previous = new Set(first.map(q => q.id))
		for (const question of next) {
			expect(previous.has(question.id)).toBe(false)
		}
	})
})

describe('placement grading', () => {
	const correctAnswers = (prerequisite: 'TUHFATUL_ATFAL' | 'JAZARIYYAH'): QuizAnswer[] =>
		QUIZ_BANK[prerequisite].slice(0, QUIZ_LENGTH).map(q => ({
			questionId: q.id,
			choice: q.answer
		}))

	test('passes only when both answers are correct', () => {
		expect(gradeQuiz('TUHFATUL_ATFAL', correctAnswers('TUHFATUL_ATFAL'))).toEqual({
			passed: true,
			correct: 2,
			total: 2
		})

		const wrong = correctAnswers('TUHFATUL_ATFAL')
		wrong[1] = { ...wrong[1], choice: (wrong[1].choice + 1) % 4 }
		expect(gradeQuiz('TUHFATUL_ATFAL', wrong)).toEqual({
			passed: false,
			correct: 1,
			total: 2
		})
	})

	test('cannot be passed with a single answer', () => {
		const answers = correctAnswers('JAZARIYYAH')
		expect(gradeQuiz('JAZARIYYAH', answers.slice(0, 1)).passed).toBe(false)
	})

	test('ignores duplicate or unknown question ids', () => {
		const answers = correctAnswers('JAZARIYYAH')
		const duplicated: QuizAnswer[] = [answers[0], answers[0]]
		expect(gradeQuiz('JAZARIYYAH', duplicated).passed).toBe(false)

		const unknown: QuizAnswer[] = [answers[0], { questionId: 'does-not-exist', choice: 0 }]
		expect(gradeQuiz('JAZARIYYAH', unknown).passed).toBe(false)
	})
})
