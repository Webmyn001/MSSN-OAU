// Shared copy, labels and helpers for the Al-Mamharah programme UI.
//
// The programme copy here uses sensible defaults (dates, contacts and masār
// descriptions) so the interface is complete; the Programme Manager can
// adjust the live dates from the manager Settings panel without a redeploy.

export interface ProgrammeInfo {
	name: string;
	nameAr: string;
	tagline: string;
	description: string;
	defaultStart: string;
	defaultEnd: string;
	timezone: string;
}

export const PROGRAMME_INFO: ProgrammeInfo = {
	name: "Al-Mamharah",
	nameAr: "الممهرة",
	tagline: "A Qur'an revision & retention programme",
	description:
		"Al-Mamharah (الممهرة) is a structured Qur'an revision and retention programme organised by the Islamic Affairs Board of MSSN-OAU. Participants commit to a daily revision target over the programme window, record their muroja'ah, and are supported by the Programme Manager and instructors.",
	defaultStart: "2026-10-18",
	defaultEnd: "2026-11-18",
	timezone: "Africa/Lagos",
};

// * Arabic labels rendered alongside the English UI.
export const ARABIC = {
	alMamharah: "الممهرة",
	quranRevision: "مراجعة القرآن",
	todaysRevision: "مراجعة اليوم",
	revisionCompleted: "تم إكمال المراجعة",
	myProgress: "إنجازاتي",
	revisionHistory: "سجل المراجعة",
	currentStreak: "سلسلة الإنجاز",
	longestStreak: "أطول سلسلة",
	leaderboard: "لوحة المتصدرين",
	leadingParticipants: "المتصدرون",
	masar: "مساري",
	dashboard: "لوحة التحكم",
	enterProgramme: "الدخول إلى البرنامج",
	programmeManagement: "إدارة البرنامج",
	applicationStatus: "حالة الطلب",
	approved: "مقبول",
	underReview: "قيد المراجعة",
} as const;

export interface ProgrammeContact {
	name: string;
	phone: string;
}

export const PROGRAMME_CONTACTS: ProgrammeContact[] = [
	{ name: "Programme Manager", phone: "09039052468" },
	{ name: "Islamic Affairs Board", phone: "07035199803" },
	{ name: "Support line", phone: "07069638881" },
];

export const PROGRAMME_GUIDELINES: string[] = [
	"Record your daily muroja'ah on the dashboard before the day ends — a day only counts once it is recorded, and your streak counts consecutive recorded days.",
	"Your masār sets your daily muroja'ah target. Choose the pace you can sustain for the whole programme window.",
	"Tajweed is optional: you may study one of the three mutūn (Tuhfatul Atfal, Muqaddimah Al-Jazariyyah or Shaṭibiyyah) and record one line per day alongside your muroja'ah. A missed tajweed line alone never suspends you.",
	"Choosing Al-Jazariyyah or Shaṭibiyyah requires passing a short 2-question placement check (MCQ) on the preceding matn after approval. You may retake it as many times as needed; if you do not pass, we recommend moving down to the lower matn.",
	"Missing 4 programme days in a calendar month leads to automatic suspension. Only a recorded muroja'ah counts as attendance — a tajweed line alone does not keep the day.",
	"Entries are self-reported but monitored by the Programme Manager and instructors. Please be honest.",
	"You may undo today's entry yourself from the dashboard. Older corrections are handled by the Programme Manager.",
	"Consistency is the goal — the programme is about retention and closeness to the Qurʼān, not competition.",
	"Keep your contact details up to date by informing the Programme Manager.",
];

export interface MasarOption {
	value: string;
	label: string;
	labelAr: string;
	daily: string;
	description: string;
}

// * Ordered from the lightest daily load upward. The retired TWO_PAGES masār is
// * no longer offered, but legacy records still display their original label.
export const MASAR_OPTIONS: MasarOption[] = [
	{
		value: "THREE_PAGES",
		label: "3 Pages Daily",
		labelAr: "٣ صفحات",
		daily: "3 pages daily",
		description: "A steady, sustainable pace for steady revision — ideal alongside a full academic load.",
	},
	{
		value: "FOUR_PAGES",
		label: "4 Pages Daily",
		labelAr: "٤ صفحات",
		daily: "4 pages daily",
		description: "A balanced daily target that builds momentum without overwhelming your schedule.",
	},
	{
		value: "ONE_JUZ",
		label: "1 Juz' Daily",
		labelAr: "جزء واحد",
		daily: "1 juz' daily",
		description: "A committed target for strong memorisers completing one juz' each day.",
	},
	{
		value: "THREE_JUZ",
		label: "3 Ajzā' Daily",
		labelAr: "٣ أجزاء",
		daily: "3 ajzā' daily",
		description: "An intensive track for ḥuffāẓ with substantial daily capacity.",
	},
	{
		value: "FIVE_JUZ",
		label: "5 Ajzā' Daily",
		labelAr: "٥ أجزاء",
		daily: "5 ajzā' daily",
		description: "The most demanding track — for those completing a full khatm within the window.",
	},
	{
		value: "KHATM",
		label: "Full Khatm",
		labelAr: "ختم كامل",
		daily: "Full khatm",
		description: "A dedicated track to complete a full reading (khaṭm) of the Qur'ān within the programme window.",
	},
];

export const TASK_LABELS: Record<string, string> = {
	MUROJAAH: "Muroja'ah",
	TAJWEED_QIRAAT: "Tajwīd & Qirāʼah",
};

export interface StartOption {
	number: number; // surah number (1-114)
	value: string; // surah name
	page: number; // starting page in the standard Hafs mushaf
}

export const TOTAL_MUSHAF_PAGES = 604;

// * All 114 surahs with the page each begins on in the standard Hafs (Madinah)
// * mushaf; mirrors the API's services/al-mamharah/mushaf.ts. The daily target
// * label ("Surat Al-Baqarah · pg 2–4") is derived from these pages.
const SURAH_PAGES: [number, string, number][] = [
	[1, "Al-Fātiḥah", 1],
	[2, "Al-Baqarah", 2],
	[3, "Āl ʿImrān", 50],
	[4, "An-Nisāʾ", 77],
	[5, "Al-Māʾidah", 106],
	[6, "Al-Anʿām", 128],
	[7, "Al-Aʿrāf", 151],
	[8, "Al-Anfāl", 177],
	[9, "At-Tawbah", 187],
	[10, "Yūnus", 208],
	[11, "Hūd", 221],
	[12, "Yūsuf", 235],
	[13, "Ar-Raʿd", 249],
	[14, "Ibrāhīm", 255],
	[15, "Al-Ḥijr", 262],
	[16, "An-Naḥl", 267],
	[17, "Al-Isrāʾ", 282],
	[18, "Al-Kahf", 293],
	[19, "Maryam", 305],
	[20, "Ṭā-Hā", 312],
	[21, "Al-Anbiyāʾ", 322],
	[22, "Al-Ḥajj", 332],
	[23, "Al-Muʾminūn", 342],
	[24, "An-Nūr", 350],
	[25, "Al-Furqān", 359],
	[26, "Ash-Shuʿarāʾ", 367],
	[27, "An-Naml", 377],
	[28, "Al-Qaṣaṣ", 385],
	[29, "Al-ʿAnkabūt", 396],
	[30, "Ar-Rūm", 404],
	[31, "Luqmān", 411],
	[32, "As-Sajdah", 415],
	[33, "Al-Aḥzāb", 418],
	[34, "Sabaʾ", 428],
	[35, "Fāṭir", 434],
	[36, "Yā-Sīn", 440],
	[37, "Aṣ-Ṣāffāt", 446],
	[38, "Ṣād", 453],
	[39, "Az-Zumar", 458],
	[40, "Ghāfir", 467],
	[41, "Fuṣṣilat", 477],
	[42, "Ash-Shūrā", 483],
	[43, "Az-Zukhruf", 489],
	[44, "Ad-Dukhān", 496],
	[45, "Al-Jāthiyah", 499],
	[46, "Al-Aḥqāf", 502],
	[47, "Muḥammad", 507],
	[48, "Al-Fatḥ", 511],
	[49, "Al-Ḥujurāt", 515],
	[50, "Qāf", 518],
	[51, "Adh-Dhāriyāt", 520],
	[52, "Aṭ-Ṭūr", 523],
	[53, "An-Najm", 526],
	[54, "Al-Qamar", 528],
	[55, "Ar-Raḥmān", 531],
	[56, "Al-Wāqiʿah", 534],
	[57, "Al-Ḥadīd", 537],
	[58, "Al-Mujādilah", 542],
	[59, "Al-Ḥashr", 545],
	[60, "Al-Mumtaḥanah", 549],
	[61, "Aṣ-Ṣaff", 551],
	[62, "Al-Jumuʿah", 553],
	[63, "Al-Munāfiqūn", 554],
	[64, "At-Taghābun", 556],
	[65, "Aṭ-Ṭalāq", 558],
	[66, "Aṭ-Ṭaḥrīm", 560],
	[67, "Al-Mulk", 562],
	[68, "Al-Qalam", 564],
	[69, "Al-Ḥāqqah", 566],
	[70, "Al-Maʿārij", 568],
	[71, "Nūḥ", 570],
	[72, "Al-Jinn", 572],
	[73, "Al-Muzzammil", 574],
	[74, "Al-Muddaththir", 575],
	[75, "Al-Qiyāmah", 577],
	[76, "Al-Insān", 578],
	[77, "Al-Mursalāt", 580],
	[78, "An-Nabaʾ", 582],
	[79, "An-Nāziʿāt", 583],
	[80, "ʿAbasa", 585],
	[81, "At-Takwīr", 587],
	[82, "Al-Infiṭār", 587],
	[83, "Al-Muṭaffifīn", 589],
	[84, "Al-Inshiqāq", 591],
	[85, "Al-Burūj", 591],
	[86, "Aṭ-Ṭāriq", 593],
	[87, "Al-Aʿlā", 594],
	[88, "Al-Ghāshiyah", 595],
	[89, "Al-Fajr", 596],
	[90, "Al-Balad", 597],
	[91, "Ash-Shams", 598],
	[92, "Al-Layl", 598],
	[93, "Aḍ-Ḍuḥā", 599],
	[94, "Ash-Sharḥ", 599],
	[95, "At-Tīn", 600],
	[96, "Al-ʿAlaq", 600],
	[97, "Al-Qadr", 601],
	[98, "Al-Bayyinah", 601],
	[99, "Az-Zalzalah", 602],
	[100, "Al-ʿĀdiyāt", 602],
	[101, "Al-Qāriʿah", 603],
	[102, "At-Takāthur", 603],
	[103, "Al-ʿAṣr", 604],
	[104, "Al-Humazah", 604],
	[105, "Al-Fīl", 604],
	[106, "Quraysh", 604],
	[107, "Al-Māʿūn", 604],
	[108, "Al-Kawthar", 604],
	[109, "Al-Kāfirūn", 604],
	[110, "An-Naṣr", 604],
	[111, "Al-Masad", 604],
	[112, "Al-Ikhlāṣ", 604],
	[113, "Al-Falaq", 604],
	[114, "An-Nās", 604],
];

export const START_OPTIONS: StartOption[] = SURAH_PAGES.map(([number, value, page]) => ({
	number,
	value,
	page,
}));

/** Starting page for a surah name (undefined if the name is unknown). */
export function startPageForSurah(name: string): number | undefined {
	return START_OPTIONS.find((o) => o.value === name)?.page;
}

// * --- Revision direction ----------------------------------------------------
//
// * The revision track must be one of these four paths. `upward` advances
// * toward the end of the mushaf; `downward` walks back toward the beginning,
// * so the daily target counts pages down.

export type StartDirectionValue =
	| "BAQARAH_DOWNWARD"
	| "KAHF_UPWARD"
	| "KAHF_DOWNWARD"
	| "NAS_UPWARD";

export interface StartDirectionOption {
	value: StartDirectionValue;
	label: string;
	direction: "UP" | "DOWN";
}

export const START_DIRECTION_OPTIONS: StartDirectionOption[] = [
	{ value: "BAQARAH_DOWNWARD", label: "From Al-Baqarah downward", direction: "DOWN" },
	{ value: "KAHF_UPWARD", label: "From Al-Kahf upward", direction: "UP" },
	{ value: "KAHF_DOWNWARD", label: "From Al-Kahf downward", direction: "DOWN" },
	{ value: "NAS_UPWARD", label: "From An-Nās upward", direction: "UP" },
];

export function startDirectionOption(value: string | null | undefined) {
	return START_DIRECTION_OPTIONS.find((o) => o.value === value);
}

export function startDirectionLabel(value: string | null | undefined): string {
	return startDirectionOption(value)?.label ?? "";
}

// * --- Optional tajweed track ------------------------------------------------
// * Ladder: Tuhfatul Atfal → Muqaddimah Al-Jazariyyah → Shaṭibiyyah. Students
// * record one line per day from their matn, alongside the muroja'ah.

export type TajweedTrackValue = "TUHFATUL_ATFAL" | "JAZARIYYAH" | "SHAATIBIYYAH";

export interface TajweedTrackOption {
	value: TajweedTrackValue;
	label: string;
	arabic: string;
	lines: number;
	prerequisite: TajweedTrackValue | null;
}

export const TAJWEED_TRACK_OPTIONS: TajweedTrackOption[] = [
	{
		value: "TUHFATUL_ATFAL",
		label: "Tuhfatul Atfal",
		arabic: "تحفة الأطفال",
		lines: 61,
		prerequisite: null,
	},
	{
		value: "JAZARIYYAH",
		label: "Muqaddimah Al-Jazariyyah",
		arabic: "المقدمة الجزرية",
		lines: 107,
		prerequisite: "TUHFATUL_ATFAL",
	},
	{
		value: "SHAATIBIYYAH",
		label: "Shaṭibiyyah",
		arabic: "الشاطبية",
		lines: 1173,
		prerequisite: "JAZARIYYAH",
	},
];

export function tajweedTrackOption(value: string | null | undefined) {
	return TAJWEED_TRACK_OPTIONS.find((o) => o.value === value);
}

export function tajweedTrackLabel(value: string | null | undefined): string {
	return tajweedTrackOption(value)?.label ?? "";
}

export function tajweedPrerequisiteLabel(value: string | null | undefined): string {
	const option = tajweedTrackOption(value);
	return option?.prerequisite ? tajweedTrackLabel(option.prerequisite) : "";
}

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
	PENDING: "Under Review",
	APPROVED: "Approved",
	REJECTED: "Rejected",
};

export const APPLICATION_STATUS_ARABIC: Record<string, string> = {
	PENDING: "قيد المراجعة",
	APPROVED: "مقبول",
	REJECTED: "مرفوض",
};

export function applicationStatusArabic(value: string | null | undefined): string {
	return APPLICATION_STATUS_ARABIC[value ?? ""] ?? "";
}

export const PARTICIPANT_STATUS_LABELS: Record<string, string> = {
	ACTIVE: "Active",
	SUSPENDED: "Suspended",
};

export const MANAGER_STATUS_LABELS: Record<string, string> = {
	PENDING: "Pending activation",
	ACTIVE: "Active",
	REVOKED: "Revoked",
};

export const MANAGER_ROLE_LABELS: Record<string, string> = {
	PRIMARY: "Primary manager",
	MANAGER: "Manager",
};

// * Labels for masār values that are no longer offered but may exist on records
// * created before they were retired (never shown in selectors).
const LEGACY_MASAR_LABELS: Record<string, string> = {
	TWO_PAGES: "2 Pages Daily",
};

const LEGACY_MASAR_DAILY: Record<string, string> = {
	TWO_PAGES: "2 pages daily",
};

export function masarOption(value: string): MasarOption | undefined {
	return MASAR_OPTIONS.find((option) => option.value === value);
}

export function masarLabel(value: string | null | undefined): string {
	return (
		masarOption(value ?? "")?.label ?? LEGACY_MASAR_LABELS[value ?? ""] ?? "Muroja'ah"
	);
}

export function masarDaily(value: string | null | undefined): string {
	return (
		masarOption(value ?? "")?.daily ?? LEGACY_MASAR_DAILY[value ?? ""] ?? "Daily muroja'ah"
	);
}

export function taskLabel(value: string | null | undefined): string {
	return TASK_LABELS[value ?? ""] ?? value ?? "";
}

export function applicationStatusLabel(value: string | null | undefined): string {
	return APPLICATION_STATUS_LABELS[value ?? ""] ?? value ?? "";
}

export function participantStatusLabel(value: string | null | undefined): string {
	return PARTICIPANT_STATUS_LABELS[value ?? ""] ?? value ?? "";
}

export function managerStatusLabel(value: string | null | undefined): string {
	return MANAGER_STATUS_LABELS[value ?? ""] ?? value ?? "";
}

export function managerRoleLabel(value: string | null | undefined): string {
	return MANAGER_ROLE_LABELS[value ?? ""] ?? value ?? "";
}

/** Formats an ISO date (YYYY-MM-DD) without timezone drift. */
export function formatISODate(iso: string | null | undefined): string {
	if (!iso) return "";
	const [y, m, d] = iso.split("-").map(Number);
	if (!y || !m || !d) return iso;
	return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	});
}

/** Formats an ISO datetime string for display. */
export function formatDateTime(value: string | Date | null | undefined): string {
	if (!value) return "";
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function phaseLabel(phase: string | null | undefined): string {
	if (phase === "UPCOMING") return "Starts soon";
	if (phase === "ENDED") return "Ended";
	return "In progress";
}
