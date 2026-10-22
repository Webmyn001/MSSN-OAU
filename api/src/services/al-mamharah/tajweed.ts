// * Al Mamharah tajweed tracks: three mutūn studied alongside the muroja'ah.
// * The track is optional. JAZARIYYAH and SHAATIBIYYAH require a short
// * placement quiz on the preceding matn before the student may register lines
// * from them.
//
// * Ladder: Tuhfatul Atfal → Muqaddimah Al Jazariyyah → Shaṭibiyyah

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
		label: 'Muqaddimah Al Jazariyyah',
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
			options: ['Sulaymān ibn Ḥusayn al-Jamzūrī', 'Ibn al-Jazarī', 'Al-Shāṭibī', 'Ibn Kathīr'],
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
		},
		{
			id: 'ta-idgham-bighunnah-letters',
			question: 'How many letters of idghām with ghunnah are there?',
			options: ['Two', 'Four', 'Six', 'Fifteen'],
			answer: 1
		},
		{
			id: 'ta-idgham-no-ghunnah-letters',
			question: 'Which letters are merged without ghunnah?',
			options: ['Lām and rāʼ', 'Nūn and mīm', 'Bāʼ and mīm', 'Hamzah and hāʼ'],
			answer: 0
		},
		{
			id: 'ta-ikhfa-letters',
			question: 'How many letters of ikhfāʼ are there?',
			options: ['Six', 'Fifteen', 'Four', 'Two'],
			answer: 1
		},
		{
			id: 'ta-ghunnah-letters',
			question: 'Ghunnah is a characteristic of which two letters?',
			options: ['Nūn and mīm', 'Lām and rāʼ', 'Bāʼ and mīm', 'Wāw and yāʼ'],
			answer: 0
		},
		{
			id: 'ta-iqlab-meaning',
			question: 'What happens in iqlāb?',
			options: [
				'The nūn is changed into a mīm sound before bāʼ',
				'The nūn is merged into the next letter',
				'The nūn is pronounced clearly',
				'The nūn is hidden without ghunnah'
			],
			answer: 0
		},
		{
			id: 'ta-izhar-meaning',
			question: 'What does iẓhār mean?',
			options: [
				'Pronouncing the nūn clearly without ghunnah',
				'Merging the nūn into the next letter',
				'Changing the nūn into a mīm',
				'Hiding the nūn with ghunnah'
			],
			answer: 0
		},
		{
			id: 'ta-idgham-meaning',
			question: 'What does idghām mean?',
			options: [
				'Merging one letter into another',
				'Pronouncing a letter clearly',
				'Lengthening a vowel',
				'Stopping the sound completely'
			],
			answer: 0
		},
		{
			id: 'ta-ikhfa-meaning',
			question: 'What does ikhfāʼ mean?',
			options: [
				'Concealing the nūn with ghunnah',
				'Pronouncing the nūn clearly',
				'Changing the nūn into a mīm',
				'Merging without ghunnah'
			],
			answer: 0
		},
		{
			id: 'ta-mim-rules',
			question: 'How many rules govern the mīm sākinah?',
			options: ['Two', 'Three', 'Four', 'Six'],
			answer: 1
		},
		{
			id: 'ta-ikhfa-shafawi-letter',
			question: 'Ikhfāʼ shafawī occurs when mīm sākinah is followed by…',
			options: ['Bāʼ (ب)', 'Mīm (م)', 'Nūn (ن)', 'Lām (ل)'],
			answer: 0
		},
		{
			id: 'ta-idgham-shafawi-meaning',
			question: 'Idghām shafawī occurs when…',
			options: [
				'Mīm sākinah is followed by mīm',
				'Nūn sākinah is followed by bāʼ',
				'Mīm sākinah is followed by bāʼ',
				'Nūn sākinah is followed by lām'
			],
			answer: 0
		},
		{
			id: 'ta-madd-lazim-count',
			question: 'How many counts is madd lāzim?',
			options: ['Two', 'Four', 'Six', 'Ten'],
			answer: 2
		},
		{
			id: 'ta-madd-muttasil-count',
			question: 'How many counts is madd muttaṣil?',
			options: ['Two', 'Four or five', 'Two, four or six', 'Six only'],
			answer: 1
		},
		{
			id: 'ta-madd-munfasil-count',
			question: 'How many counts is madd munfaṣil?',
			options: ['Two only', 'Four or five', 'Two, four or five', 'Six only'],
			answer: 2
		},
		{
			id: 'ta-madd-arid-count',
			question: 'How many counts may madd ʿāriḍ lil-sukūn be given?',
			options: ['Two only', 'Four only', 'Two, four or six', 'Six only'],
			answer: 2
		},
		{
			id: 'ta-madd-badal-count',
			question: 'How many counts is madd badal?',
			options: ['Two', 'Four', 'Six', 'Ten'],
			answer: 0
		},
		{
			id: 'ta-madd-letters',
			question: 'Which letters are the letters of madd?',
			options: [
				'Alif, wāw and yāʼ',
				'Bāʼ, mīm and nūn',
				'Lām, rāʼ and nūn',
				'Hamzah, hāʼ and ʿayn'
			],
			answer: 0
		},
		{
			id: 'ta-title',
			question: 'What is the full title of Tuhfatul Atfal?',
			options: [
				'Tuhfatul Atfal wa al-Ghilman',
				'Muqaddimah Al Jazariyyah',
				'Al-Shāṭibiyyah',
				'Al-Muqaddimah al-Ashmawiyyah'
			],
			answer: 0
		},
		{
			id: 'ta-madd-asli-definition',
			question: 'Madd aṣlī is the madd that…',
			options: [
				'Has no hamzah or sukūn after it',
				'Is followed by a hamzah',
				'Is followed by a sukūn',
				'Occurs at the end of a verse'
			],
			answer: 0
		},
		{
			id: 'ta-madd-lazim-definition',
			question: 'Madd lāzim occurs when the madd letter is followed by…',
			options: [
				'A permanent sukūn',
				'A hamzah in the same word',
				'The beginning of a sūrah',
				'A temporary sukūn'
			],
			answer: 0
		},
		{
			id: 'ta-qasr-meaning',
			question: 'What does qaṣr mean?',
			options: [
				'Shortening the madd to two counts',
				'Lengthening the madd to six counts',
				'Stopping on a letter',
				'Merging two letters'
			],
			answer: 0
		},
		{
			id: 'ta-tanwin-definition',
			question: 'What is tanwīn?',
			options: [
				'A nūn sākinah added at the end of a noun',
				'A mīm sākinah added at the end of a verb',
				'A permanent nūn in the middle of a word',
				'A shaddah on the final letter'
			],
			answer: 0
		},
		{
			id: 'ta-izhar-letters-list',
			question: 'Which set contains the letters of iẓhār?',
			options: [
				'Hamzah, hāʼ, ʿayn, ḥāʼ, ghayn and khāʼ',
				'Yāʼ, nūn, mīm and wāw',
				'Lām and rāʼ',
				'Bāʼ and mīm'
			],
			answer: 0
		},
		{
			id: 'ta-nun-sakinah-definition',
			question: 'What is nūn sākinah?',
			options: [
				'A nūn with a sukūn',
				'A nūn with a fatḥah',
				'A nūn followed by a shaddah',
				'A nūn at the beginning of a word'
			],
			answer: 0
		}
	],
	JAZARIYYAH: [
		{
			id: 'ja-author',
			question: 'Who authored Muqaddimah Al Jazariyyah?',
			options: ['Muḥammad ibn al-Jazarī', 'Sulaymān al-Jamzūrī', 'Al-Shāṭibī', 'Ibn Kathīr'],
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
			question: 'The opening line of Al Jazariyyah begins with…',
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
			question: 'Muqaddimah Al Jazariyyah is a poem (naẓm) principally about…',
			options: ['Tafsīr', 'Tajwīd', 'Ḥadīth', 'Fiqh'],
			answer: 1
		},
		{
			id: 'ja-jawf-letters',
			question: 'Which letters are articulated from al-jawf (the empty space)?',
			options: ['Alif, wāw and yāʼ', 'Bāʼ, mīm and nūn', 'Lām, rāʼ and nūn', 'Qāf, ṭāʼ and bāʼ'],
			answer: 0
		},
		{
			id: 'ja-halq-parts',
			question: 'How many areas of the throat (al-ḥalq) are there?',
			options: ['Two', 'Three', 'Four', 'Five'],
			answer: 1
		},
		{
			id: 'ja-lisan-makharij',
			question: 'How many specific articulation points are on the tongue (al-lisān)?',
			options: ['Five', 'Six', 'Ten', 'Seventeen'],
			answer: 2
		},
		{
			id: 'ja-shafatayn-makharij',
			question: 'How many specific articulation points do the lips (al-shafatān) have?',
			options: ['Two', 'Three', 'Five', 'Ten'],
			answer: 0
		},
		{
			id: 'ja-khayshum',
			question: 'Al-khayshūm is…',
			options: ['The nasal passage', 'The empty space of the mouth', 'The throat', 'The lips'],
			answer: 0
		},
		{
			id: 'ja-qalqalah-letters',
			question: 'Which letters are the letters of qalqalah?',
			options: [
				'Qāf, ṭāʼ, bāʼ, jīm and dāl',
				'Qāf, kāf, bāʼ, jīm and dāl',
				'Ṣād, ḍād, ṭāʼ, ẓāʼ and qāf',
				'Hamzah, hāʼ, ʿayn, ḥāʼ and khāʼ'
			],
			answer: 0
		},
		{
			id: 'ja-qalqalah-definition',
			question: 'Qalqalah is…',
			options: [
				'An echoing sound when the letter has a sukūn',
				'A nasal sound from the nose',
				'A whispered sound with breath',
				'A lengthened vowel sound'
			],
			answer: 0
		},
		{
			id: 'ja-hams-definition',
			question: 'Al-hams is…',
			options: [
				'A whispered sound accompanied by breath',
				'A voiced sound without breath',
				'A sound held at the makhraj',
				'A sound that bounces'
			],
			answer: 0
		},
		{
			id: 'ja-jahr-definition',
			question: 'Al-jahr is…',
			options: [
				'A voiced sound with the breath withheld',
				'A whispered sound with breath',
				'A nasal sound',
				'A bouncing sound'
			],
			answer: 0
		},
		{
			id: 'ja-shiddah-definition',
			question: 'Al-shiddah is…',
			options: [
				'A sound strongly held at its makhraj',
				'A sound that flows easily',
				'A sound that bounces',
				'A sound produced from the nose'
			],
			answer: 0
		},
		{
			id: 'ja-istila-count',
			question: 'How many letters of istiʿlāʼ are there?',
			options: ['Five', 'Six', 'Seven', 'Ten'],
			answer: 2
		},
		{
			id: 'ja-istila-letters',
			question: 'Which set contains the letters of istiʿlāʼ?',
			options: [
				'Khāʼ, ṣād, ḍād, ghayn, ṭāʼ, qāf and ẓāʼ',
				'Qāf, ṭāʼ, bāʼ, jīm and dāl',
				'Hamzah, hāʼ, ʿayn, ḥāʼ, ghayn and khāʼ',
				'Yāʼ, nūn, mīm and wāw'
			],
			answer: 0
		},
		{
			id: 'ja-lam-qamariyyah-count',
			question: 'How many letters of the lunar lām (al-qamariyyah) are there?',
			options: ['Six', 'Ten', 'Fourteen', 'Twenty-eight'],
			answer: 2
		},
		{
			id: 'ja-lam-shamsiyyah-count',
			question: 'How many letters of the solar lām (al-shamsiyyah) are there?',
			options: ['Six', 'Ten', 'Fourteen', 'Twenty-eight'],
			answer: 2
		},
		{
			id: 'ja-lam-shamsiyyah-rule',
			question: 'With the solar lām, what happens?',
			options: [
				'The lām is merged and the following letter carries a shaddah',
				'The lām is pronounced clearly',
				'The lām is changed into a mīm',
				'The lām is lengthened'
			],
			answer: 0
		},
		{
			id: 'ja-ra-tarqiq',
			question: 'Which case generally makes rāʼ tarqīq (light)?',
			options: [
				'When it carries a kasrah',
				'When it carries a fatḥah',
				'When it carries a ḍammah',
				'When it is preceded by a fatḥah'
			],
			answer: 0
		},
		{
			id: 'ja-madd-asli-count',
			question: 'How many counts is the natural madd (madd aṣlī)?',
			options: ['Two', 'Four', 'Six', 'Ten'],
			answer: 0
		},
		{
			id: 'ja-madd-fari',
			question: 'Madd farʿī is a madd caused by…',
			options: [
				'A hamzah or a sukūn',
				'No hamzah or sukūn',
				'The start of a sūrah',
				'The middle of a word only'
			],
			answer: 0
		},
		{
			id: 'ja-ghunnah-letters',
			question: 'Ghunnah is a characteristic of which two letters?',
			options: ['Nūn and mīm', 'Lām and rāʼ', 'Bāʼ and mīm', 'Wāw and yāʼ'],
			answer: 0
		},
		{
			id: 'ja-sifaat-definition',
			question: 'What are al-ṣifāt?',
			options: [
				'The qualities of the letters',
				'The places of articulation',
				'The lengths of the madd',
				'The types of stopping'
			],
			answer: 0
		},
		{
			id: 'ja-makhraj-definition',
			question: 'What is a makhraj?',
			options: [
				'The point from which a letter is articulated',
				'The quality of a letter',
				'The length of a vowel',
				'The rule of stopping'
			],
			answer: 0
		},
		{
			id: 'ja-madd-definition',
			question: 'What is madd?',
			options: [
				'Lengthening the sound with a madd letter',
				'Stopping the sound completely',
				'Merging two letters',
				'Nasalising a letter'
			],
			answer: 0
		},
		{
			id: 'ja-tanwin-definition',
			question: 'What is tanwīn?',
			options: [
				'A nūn sākinah added at the end of a noun',
				'A mīm sākinah at the end of a verb',
				'A permanent nūn in the middle of a word',
				'A shaddah on the final letter'
			],
			answer: 0
		},
		{
			id: 'ja-hamzat-wasl',
			question: 'Hamzat al-waṣl is…',
			options: [
				'Pronounced at the beginning and dropped in connected recitation',
				'Always pronounced',
				'Always dropped',
				'Changed into a mīm'
			],
			answer: 0
		}
	]
}

/**
 * Picks `count` random questions from an arbitrary bank.
 * `exclude` drops questions from the previous attempt so a retry never
 * repeats the same set.
 */
export function sampleQuizFromBank(
	bank: QuizQuestion[],
	count: number = QUIZ_LENGTH,
	exclude: string[] = []
): QuizQuestion[] {
	const excluded = new Set(exclude)
	let pool = bank.filter(question => !excluded.has(question.id))
	if (pool.length < count) pool = [...bank]
	for (let i = pool.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[pool[i], pool[j]] = [pool[j], pool[i]]
	}
	return pool.slice(0, Math.min(count, pool.length))
}

/**
 * Picks `count` random questions about the prerequisite matn.
 * `exclude` drops questions from the previous attempt so a retry never
 * repeats the same set.
 */
export function sampleQuiz(
	prerequisite: 'TUHFATUL_ATFAL' | 'JAZARIYYAH',
	count: number = QUIZ_LENGTH,
	exclude: string[] = []
): QuizQuestion[] {
	return sampleQuizFromBank(QUIZ_BANK[prerequisite], count, exclude)
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
 * Grades an attempt against an arbitrary bank. Every served question must be
 * answered; the attempt passes only when all of them are correct.
 */
export function gradeQuizFromBank(bank: QuizQuestion[], answers: QuizAnswer[]): QuizGrade {
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

/**
 * Grades an attempt. Every served question must be answered; the attempt
 * passes only when all of them are correct.
 */
export function gradeQuiz(
	prerequisite: 'TUHFATUL_ATFAL' | 'JAZARIYYAH',
	answers: QuizAnswer[]
): QuizGrade {
	return gradeQuizFromBank(QUIZ_BANK[prerequisite], answers)
}
