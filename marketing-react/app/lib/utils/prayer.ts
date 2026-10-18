export interface PrayerTimeEntry {
	adhan: string | number;
	iqamah: string | number;
}

export type PrayerTimesData = Record<string, PrayerTimeEntry>;

function isFormattedTime(s: string): boolean {
	return /^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(s.trim());
}

function toDate(val: unknown): Date | null {
	if (val == null) return null;
	if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
	if (typeof val === "number") {
		const d = new Date(val);
		return isNaN(d.getTime()) ? null : d;
	}
	if (typeof val === "string") {
		if (isFormattedTime(val)) return null;
		const d = new Date(val);
		return isNaN(d.getTime()) ? null : d;
	}
	return null;
}

export function formatTime(dateInput: unknown): string {
	if (dateInput == null || dateInput === "") return "--:--";

	if (typeof dateInput === "string" && isFormattedTime(dateInput)) {
		return dateInput.trim();
	}

	const date = toDate(dateInput);
	if (!date) return "--:--";

	const hours = date.getHours();
	const minutes = date.getMinutes();
	const ampm = hours >= 12 ? "PM" : "AM";
	const hour12 = hours % 12 || 12;

	return `${hour12}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

export function getSolahPeriod(times: PrayerTimesData | null | undefined): string {
	if (
		!times?.subhi?.adhan ||
		!times?.dhuhr?.adhan ||
		!times?.asr?.adhan ||
		!times?.maghrib?.adhan ||
		!times?.isha?.adhan
	) {
		return "fajr";
	}

	const toMinutes = (date: unknown): number => {
		if (typeof date === "string" && isFormattedTime(date)) {
			const m = date.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
			if (!m) return NaN;
			let hours = parseInt(m[1], 10) % 12;
			if (m[3].toUpperCase() === "PM") hours += 12;
			return hours * 60 + parseInt(m[2], 10);
		}
		const tempdate = new Date((date as any) ?? new Date());
		if (isNaN(tempdate.getTime())) return NaN;
		return tempdate.getHours() * 60 + tempdate.getMinutes();
	};

	const prayerTimeMinutes = {
		fajr: toMinutes(times.subhi.adhan),
		dhuhr: toMinutes(times.dhuhr.adhan),
		asr: toMinutes(times.asr.adhan),
		maghrib: toMinutes(times.maghrib.adhan),
		isha: toMinutes(times.isha.adhan),
	};

	const currentTime = toMinutes(new Date());

	if (currentTime < prayerTimeMinutes.fajr) return "fajr";
	if (currentTime < prayerTimeMinutes.dhuhr) return "dhuhr";
	if (currentTime < prayerTimeMinutes.asr) return "asr";
	if (currentTime < prayerTimeMinutes.maghrib) return "maghrib";
	if (currentTime < prayerTimeMinutes.isha) return "isha";

	return "fajr";
}
