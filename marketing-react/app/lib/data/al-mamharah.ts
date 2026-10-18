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
	"Record your daily muroja'ah on the dashboard before the day ends — a day only counts once it is recorded.",
	"Your current streak counts consecutive days on which the required daily task is completed.",
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

export const MASAR_OPTIONS: MasarOption[] = [
	{
		value: "THREE_PAGES",
		label: "3 Pages Daily",
		labelAr: "ثلاث صفحات",
		daily: "3 pages daily",
		description:
			"A steady, sustainable pace for steady revision — ideal alongside a full academic load.",
	},
	{
		value: "FOUR_PAGES",
		label: "4 Pages Daily",
		labelAr: "أربع صفحات",
		daily: "4 pages daily",
		description:
			"A balanced daily target that builds momentum without overwhelming your schedule.",
	},
	{
		value: "ONE_JUZ",
		label: "1 Juzʼ Daily",
		labelAr: "جزء واحد",
		daily: "1 juzʼ daily",
		description: "A committed target for strong memorisers completing one juzʼ each day.",
	},
	{
		value: "THREE_JUZ",
		label: "3 Ajzāʼ Daily",
		labelAr: "ثلاثة أجزاء",
		daily: "3 ajzāʼ daily",
		description: "An intensive track for huffāẓ with substantial daily capacity.",
	},
	{
		value: "FIVE_JUZ",
		label: "5 Ajzāʼ Daily",
		labelAr: "خمسة أجزاء",
		daily: "5 ajzāʼ daily",
		description: "The most demanding track — for those completing a full khatm within the window.",
	},
];

export const TASK_LABELS: Record<string, string> = {
	MUROJAAH: "Muroja'ah",
	TAJWEED_QIRAAT: "Tajwīd & Qirāʼah",
};

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

export function masarOption(value: string): MasarOption | undefined {
	return MASAR_OPTIONS.find((option) => option.value === value);
}

export function masarLabel(value: string | null | undefined): string {
	return masarOption(value ?? "")?.label ?? "Muroja'ah";
}

export function masarDaily(value: string | null | undefined): string {
	return masarOption(value ?? "")?.daily ?? "Daily muroja'ah";
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
