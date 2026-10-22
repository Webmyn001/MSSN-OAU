// * Al-Mamharah tajweed tracks: three mutūn studied alongside the muroja'ah.
// * The track is optional. JAZARIYYAH and SHAATIBIYYAH require a short
// * placement quiz on the preceding matn before the student may register lines
// * from them.
//
// * Ladder: Tuhfatul Atfal → Muqaddimah Al-Jazariyyah → Shaṭibiyyah

export const TAJWEED_TRACKS = ['TUHFATUL_ATFAL', 'JAZARIYYAH', 'SHAATIBIYYAH'] as const

export type TajweedTrack = (typeof TAJWEED_TRACKS)[number]

export interface MatnInfo {
	label: string
	arabic: string
	/** Number of lines (verses) in the matn. */
	lines: number
	/** Matn that must be mastered first, if any. */
	prerequisite: TajweedTrack | null
}

export const MATN_INFO: Record<TajweedTrack, MatnInfo> = {
	TUHFATUL_ATFAL: {
		label: 'Tuhfatul Atfal',
		arabic: 'تحفة الأطفال',
		lines: 61,
		prerequisite: null
	},
	JAZARIYYAH: {
		label: 'Muqaddimah Al-Jazariyyah',
		arabic: 'المقدمة الجزرية',
		lines: 107,
		prerequisite: 'TUHFATUL_ATFAL'
	},
	SHAATIBIYYAH: {
		label: 'Shaṭibiyyah',
		arabic: 'الشاطبية',
		lines: 1173,
		prerequisite: 'JAZARIYYAH'
	}
}

export const TAJWEED_TRACK_LABELS: Record<TajweedTrack, string> = {
	TUHFATUL_ATFAL: MATN_INFO.TUHFATUL_ATFAL.label,
	JAZARIYYAH: MATN_INFO.JAZARIYYAH.label,
	SHAATIBIYYAH: MATN_INFO.SHAATIBIYYAH.label
}

/** Ranking used to recognise a downgrade (which bypasses the placement quiz). */
export function tajweedTrackRank(track: TajweedTrack): number {
	return TAJWEED_TRACKS.indexOf(track)
}

/** Returns the matn that must be mastered before `track`, if any. */
export function prerequisiteFor(track: TajweedTrack | null | undefined): TajweedTrack | null {
	if (!track) return null
	return MATN_INFO[track]?.prerequisite ?? null
}

/** Narrows an arbitrary string to a known track. */
export function normalizeTajweedTrack(value: string | null | undefined): TajweedTrack | null {
	if (!value) return null
	return (TAJWEED_TRACKS as readonly string[]).includes(value) ? (value as TajweedTrack) : null
}

export function tajweedTrackLabel(value: string | null | undefined): string | null {
	const track = normalizeTajweedTrack(value)
	return track ? MATN_INFO[track].label : null
}

// * --- Placement quiz --------------------------------------------------------

export interface QuizQuestion {
	id: string
	question: string
	options: string[]
	/** Index into `options`. Never sent to the client. */
	answer: number
}

/** Number of questions served per attempt. */
export const QUIZ_LENGTH = 2
/** Questions that must be answered correctly to pass. */
export const QUIZ_PASS_MARK = 2

// * Basic, well-known facts about each matn — enough to confirm the previous
// * matn was actually studied, not a full examination.
export const QUIZ_BANK: Record<'TUHFATUL_ATFAL' | 'JAZARIYYAH', QuizQuestion[]> = {
	TUHFATUL_ATFAL: [
		{
			id: 'ta-author',
			question: 'Who authored Tuhfatul Atfal?',
			options: [
				'Sulaymān ibn Ḥusayn al-Jamzūrī',
				'Ibn al-Jazarī',
				'Al-Shāṭibī',
				'Ibn Kathīr'
			],
			answer: 0
		},
		{
			id: 'ta-nun-rules',
			question: 'How many rules govern the nūn sākinah and tanwīn?',
			options: ['Two', 'Four', 'Six', 'Fifteen'],
			answer: 1
		},
		{
			id: 'ta-not-nun-rule',
			question: 'Which of these is NOT one of the nūn sākinah rules?',
			options: ['Al-iẓhār', 'Al-idghām', 'Al-iqlāb', 'Al-madd al-lāzim'],
			answer: 3
		},
		{
			id: 'ta-izhar-letters',
			question: 'How many letters of iẓhār are there?',
			options: ['Four', 'Six', 'Fifteen', 'Two'],
			answer: 1
		},
		{
			id: 'ta-iqlab-letter',
			question: 'The letter of iqlāb is…',
			options: ['Bāʼ (ب)', 'Mīm (م)', 'Nūn (ن)', 'Lām (ل)'],
			answer: 0
		},
		{
			id: 'ta-madd-asli',
			question: 'How many counts (ḥarakāt) is the natural madd (madd aṣlī)?',
			options: ['One', 'Two', 'Four', 'Six'],
			answer: 1
		}
	],
	JAZARIYYAH: [
		{
			id: 'ja-author',
			question: 'Who authored Muqaddimah Al-Jazariyyah?',
			options: [
				'Muḥammad ibn al-Jazarī',
				'Sulaymān al-Jamzūrī',
				'Al-Shāṭibī',
				'Ibn Kathīr'
			],
			answer: 0
		},
		{
			id: 'ja-makharij-areas',
			question: 'How many main areas of articulation (makhārij) are there?',
			options: ['Three', 'Five', 'Six', 'Seventeen'],
			answer: 1
		},
		{
			id: 'ja-not-makhraj',
			question: 'Which of these is NOT one of the five general makhārij?',
			options: ['Al-jawf', 'Al-ḥalq', 'Al-lisān', 'Al-qalb'],
			answer: 3
		},
		{
			id: 'ja-specific-makharij',
			question: 'How many specific articulation points (makhārij) are commonly counted?',
			options: ['Five', 'Six', 'Seventeen', 'Twenty-nine'],
			answer: 2
		},
		{
			id: 'ja-opening',
			question: 'The opening line of Al-Jazariyyah begins with…',
			options: [
				'Yaqūlu rājī raḥmata l-ghafūr',
				'Al-ḥamdu lillāhi rabbi l-ʿālamīn',
				'Bismillāhi r-raḥmāni r-raḥīm',
				'Aqūlu qawlī hādhā'
			],
			answer: 0
		},
		{
			id: 'ja-subject',
			question: 'Muqaddimah Al-Jazariyyah is a poem (naẓm) principally about…',
			options: ['Tafsīr', 'Tajwīd', 'Ḥadīth', 'Fiqh'],
			answer: 1
		}
	]
}

/** Picks `count` random questions about the prerequisite matn. */
export function sampleQuiz(
	prerequisite: 'TUHFATUL_ATFAL' | 'JAZARIYYAH',
	count: number = QUIZ_LENGTH
): QuizQuestion[] {
	const pool = [...QUIZ_BANK[prerequisite]]
	for (let i = pool.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[pool[i], pool[j]] = [pool[j], pool[i]]
	}
	return pool.slice(0, Math.min(count, pool.length))
}

export interface QuizAnswer {
	questionId: string
	choice: number
}

export interface QuizGrade {
	passed: boolean
	correct: number
	total: number
}

/**
 * Grades an attempt. Every served question must be answered; the attempt
 * passes only when all of them are correct.
 */
export function gradeQuiz(
	prerequisite: 'TUHFATUL_ATFAL' | 'JAZARIYYAH',
	answers: QuizAnswer[]
): QuizGrade {
	const bank = QUIZ_BANK[prerequisite]
	const total = QUIZ_LENGTH
	const seen = new Set<string>()
	let correct = 0

	for (const answer of answers) {
		if (seen.has(answer.questionId)) continue
		seen.add(answer.questionId)
		const question = bank.find(item => item.id === answer.questionId)
		if (!question) continue
		if (answer.choice === question.answer) correct++
	}

	return { passed: seen.size === total && correct >= QUIZ_PASS_MARK, correct, total }
}
