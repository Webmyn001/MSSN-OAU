// * Standard Hafs (Madinah) mushaf page map: the page each of the 114 surahs
// * begins on. Used to turn a numeric page position into a human label like
// * "Surah Al Baqarah, pages 2 to 4" for the daily revision target.

export interface SurahStart {
	number: number
	name: string
	startPage: number
}

export const TOTAL_MUSHAF_PAGES = 604

export const SURAHS: SurahStart[] = [
	{ number: 1, name: 'Al Fātiḥah', startPage: 1 },
	{ number: 2, name: 'Al Baqarah', startPage: 2 },
	{ number: 3, name: 'Āl ʿImrān', startPage: 50 },
	{ number: 4, name: 'An Nisāʾ', startPage: 77 },
	{ number: 5, name: 'Al Māʾidah', startPage: 106 },
	{ number: 6, name: 'Al Anʿām', startPage: 128 },
	{ number: 7, name: 'Al Aʿrāf', startPage: 151 },
	{ number: 8, name: 'Al Anfāl', startPage: 177 },
	{ number: 9, name: 'At Tawbah', startPage: 187 },
	{ number: 10, name: 'Yūnus', startPage: 208 },
	{ number: 11, name: 'Hūd', startPage: 221 },
	{ number: 12, name: 'Yūsuf', startPage: 235 },
	{ number: 13, name: 'Ar Raʿd', startPage: 249 },
	{ number: 14, name: 'Ibrāhīm', startPage: 255 },
	{ number: 15, name: 'Al Ḥijr', startPage: 262 },
	{ number: 16, name: 'An Naḥl', startPage: 267 },
	{ number: 17, name: 'Al Isrāʾ', startPage: 282 },
	{ number: 18, name: 'Al Kahf', startPage: 293 },
	{ number: 19, name: 'Maryam', startPage: 305 },
	{ number: 20, name: 'Ṭā Hā', startPage: 312 },
	{ number: 21, name: 'Al Anbiyāʾ', startPage: 322 },
	{ number: 22, name: 'Al Ḥajj', startPage: 332 },
	{ number: 23, name: 'Al Muʾminūn', startPage: 342 },
	{ number: 24, name: 'An Nūr', startPage: 350 },
	{ number: 25, name: 'Al Furqān', startPage: 359 },
	{ number: 26, name: 'Ash Shuʿarāʾ', startPage: 367 },
	{ number: 27, name: 'An Naml', startPage: 377 },
	{ number: 28, name: 'Al Qaṣaṣ', startPage: 385 },
	{ number: 29, name: 'Al ʿAnkabūt', startPage: 396 },
	{ number: 30, name: 'Ar Rūm', startPage: 404 },
	{ number: 31, name: 'Luqmān', startPage: 411 },
	{ number: 32, name: 'As Sajdah', startPage: 415 },
	{ number: 33, name: 'Al Aḥzāb', startPage: 418 },
	{ number: 34, name: 'Sabaʾ', startPage: 428 },
	{ number: 35, name: 'Fāṭir', startPage: 434 },
	{ number: 36, name: 'Yā Sīn', startPage: 440 },
	{ number: 37, name: 'Aṣ Ṣāffāt', startPage: 446 },
	{ number: 38, name: 'Ṣād', startPage: 453 },
	{ number: 39, name: 'Az Zumar', startPage: 458 },
	{ number: 40, name: 'Ghāfir', startPage: 467 },
	{ number: 41, name: 'Fuṣṣilat', startPage: 477 },
	{ number: 42, name: 'Ash Shūrā', startPage: 483 },
	{ number: 43, name: 'Az Zukhruf', startPage: 489 },
	{ number: 44, name: 'Ad Dukhān', startPage: 496 },
	{ number: 45, name: 'Al Jāthiyah', startPage: 499 },
	{ number: 46, name: 'Al Aḥqāf', startPage: 502 },
	{ number: 47, name: 'Muḥammad', startPage: 507 },
	{ number: 48, name: 'Al Fatḥ', startPage: 511 },
	{ number: 49, name: 'Al Ḥujurāt', startPage: 515 },
	{ number: 50, name: 'Qāf', startPage: 518 },
	{ number: 51, name: 'Adh Dhāriyāt', startPage: 520 },
	{ number: 52, name: 'Aṭ Ṭūr', startPage: 523 },
	{ number: 53, name: 'An Najm', startPage: 526 },
	{ number: 54, name: 'Al Qamar', startPage: 528 },
	{ number: 55, name: 'Ar Raḥmān', startPage: 531 },
	{ number: 56, name: 'Al Wāqiʿah', startPage: 534 },
	{ number: 57, name: 'Al Ḥadīd', startPage: 537 },
	{ number: 58, name: 'Al Mujādilah', startPage: 542 },
	{ number: 59, name: 'Al Ḥashr', startPage: 545 },
	{ number: 60, name: 'Al Mumtaḥanah', startPage: 549 },
	{ number: 61, name: 'Aṣ Ṣaff', startPage: 551 },
	{ number: 62, name: 'Al Jumuʿah', startPage: 553 },
	{ number: 63, name: 'Al Munāfiqūn', startPage: 554 },
	{ number: 64, name: 'At Taghābun', startPage: 556 },
	{ number: 65, name: 'Aṭ Ṭalāq', startPage: 558 },
	{ number: 66, name: "Aṭ Ṭaḥrīm", startPage: 560 },
	{ number: 67, name: 'Al Mulk', startPage: 562 },
	{ number: 68, name: 'Al Qalam', startPage: 564 },
	{ number: 69, name: 'Al Ḥāqqah', startPage: 566 },
	{ number: 70, name: 'Al Maʿārij', startPage: 568 },
	{ number: 71, name: 'Nūḥ', startPage: 570 },
	{ number: 72, name: 'Al Jinn', startPage: 572 },
	{ number: 73, name: 'Al Muzzammil', startPage: 574 },
	{ number: 74, name: 'Al Muddaththir', startPage: 575 },
	{ number: 75, name: 'Al Qiyāmah', startPage: 577 },
	{ number: 76, name: 'Al Insān', startPage: 578 },
	{ number: 77, name: 'Al Mursalāt', startPage: 580 },
	{ number: 78, name: 'An Nabaʾ', startPage: 582 },
	{ number: 79, name: "An Nāziʿāt", startPage: 583 },
	{ number: 80, name: 'ʿAbasa', startPage: 585 },
	{ number: 81, name: 'At Takwīr', startPage: 587 },
	{ number: 82, name: 'Al Infiṭār', startPage: 587 },
	{ number: 83, name: 'Al Muṭaffifīn', startPage: 589 },
	{ number: 84, name: 'Al Inshiqāq', startPage: 591 },
	{ number: 85, name: 'Al Burūj', startPage: 591 },
	{ number: 86, name: 'Aṭ Ṭāriq', startPage: 593 },
	{ number: 87, name: "Al Aʿlā", startPage: 594 },
	{ number: 88, name: 'Al Ghāshiyah', startPage: 595 },
	{ number: 89, name: 'Al Fajr', startPage: 596 },
	{ number: 90, name: 'Al Balad', startPage: 597 },
	{ number: 91, name: 'Ash Shams', startPage: 598 },
	{ number: 92, name: 'Al Layl', startPage: 598 },
	{ number: 93, name: 'Aḍ Ḍuḥā', startPage: 599 },
	{ number: 94, name: 'Ash Sharḥ', startPage: 599 },
	{ number: 95, name: 'At Tīn', startPage: 600 },
	{ number: 96, name: 'Al ʿAlaq', startPage: 600 },
	{ number: 97, name: 'Al Qadr', startPage: 601 },
	{ number: 98, name: 'Al Bayyinah', startPage: 601 },
	{ number: 99, name: 'Az Zalzalah', startPage: 602 },
	{ number: 100, name: 'Al ʿĀdiyāt', startPage: 602 },
	{ number: 101, name: 'Al Qāriʿah', startPage: 603 },
	{ number: 102, name: 'At Takāthur', startPage: 603 },
	{ number: 103, name: 'Al ʿAṣr', startPage: 604 },
	{ number: 104, name: 'Al Humazah', startPage: 604 },
	{ number: 105, name: 'Al Fīl', startPage: 604 },
	{ number: 106, name: 'Quraysh', startPage: 604 },
	{ number: 107, name: "Al Māʿūn", startPage: 604 },
	{ number: 108, name: 'Al Kawthar', startPage: 604 },
	{ number: 109, name: 'Al Kāfirūn', startPage: 604 },
	{ number: 110, name: 'An Naṣr', startPage: 604 },
	{ number: 111, name: 'Al Masad', startPage: 604 },
	{ number: 112, name: 'Al Ikhlāṣ', startPage: 604 },
	{ number: 113, name: 'Al Falaq', startPage: 604 },
	{ number: 114, name: 'An Nās', startPage: 604 }
]

/** Finds the surah that contains the given 1-based page number. */
export function surahAtPage(page: number): SurahStart {
	const clamped = Math.min(Math.max(1, Math.floor(page)), TOTAL_MUSHAF_PAGES)
	let found = SURAHS[0]
	for (const surah of SURAHS) {
		if (surah.startPage <= clamped) found = surah
		else break
	}
	return found
}

/** Clamps a page into the valid mushaf range. */
export function clampPage(page: number): number {
	return Math.min(Math.max(1, Math.floor(page)), TOTAL_MUSHAF_PAGES)
}

/**
 * Builds a display label for a page range, e.g. "Surah Al Baqarah, pages 2 to 4".
 * A single page renders as "Surah Al Baqarah, page 2".
 */
export function pageRangeLabel(fromPage: number, toPage: number): string {
	const from = clampPage(fromPage)
	const to = clampPage(Math.max(fromPage, toPage))
	const surah = surahAtPage(from)
	return from === to
		? `Surah ${surah.name}, page ${from}`
		: `Surah ${surah.name}, pages ${from} to ${to}`
}
