import { writable, derived } from 'svelte/store';

/**
 * @typedef {Object} PrayerTime
 * @property {number | string} adhan - The adhan (call to prayer) time
 * @property {number | string} iqamah - The iqamah (start of prayer) time
 */

/**
 * @typedef {Object} PrayerTimes
 * @property {PrayerTime} subhi - Fajr prayer times
 * @property {PrayerTime} dhuhr - Dhuhr prayer times
 * @property {PrayerTime} asr - Asr prayer times
 * @property {PrayerTime} maghrib - Maghrib prayer times
 * @property {PrayerTime} isha - Isha prayer times
 */

/**
 * Prayer times store — populated from API only, no dummy fallback.
 * @type {import('svelte/store').Writable<PrayerTimes | null>}
 */
export const prayerTimes = writable(null);

/**
 * @type {import('svelte/store').Readable<string>}
 */
export const upcomingPrayer = derived(prayerTimes, ($prayerTimes) => {
    if (!$prayerTimes) return 'fajr';
    return getSolahPeriod($prayerTimes);
});

/**
 * Checks if a string is already in "H:MM AM/PM" format
 * @param {string} s
 * @returns {boolean}
 */
function isFormattedTime(s) {
    return /^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(s.trim());
}

/**
 * Converts any input to a Date object
 * @param {any} val
 * @returns {Date | null}
 */
function toDate(val) {
    if (val == null) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    if (typeof val === 'number') {
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
    }
    if (typeof val === 'string') {
        if (isFormattedTime(val)) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
}

/**
 * Formats a date or timestamp into a 12-hour time string
 * @param {any} dateInput - The date or timestamp to format
 * @returns {string} Formatted time string in 12-hour format (e.g., "5:30 PM")
 */
export function formatTime(dateInput) {
    if (dateInput == null || dateInput === '') return '--:--';

    if (typeof dateInput === 'string' && isFormattedTime(dateInput)) {
        return dateInput.trim();
    }

    const date = toDate(dateInput);
    if (!date) return '--:--';

    const hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const minuteFormatted = String(minutes).padStart(2, '0');

    return `${hour12}:${minuteFormatted} ${ampm}`;
}

/**
 * Determines which prayer time is next based on current time
 * @param {PrayerTimes} times - The prayer times object
 * @returns {string} The name of the next prayer
 */
export function getSolahPeriod(times) {
    if (!times?.subhi?.adhan || !times?.dhuhr?.adhan || !times?.asr?.adhan || !times?.maghrib?.adhan || !times?.isha?.adhan) return 'fajr';
    /**
     * Converts a date or formatted "H:MM AM/PM" string to minutes since midnight
     * @param {number|Date|string|undefined} date - The date or formatted time to convert
     * @returns {number} Minutes since midnight
     */
    const toMinutes = (date) => {
        if (typeof date === 'string' && isFormattedTime(date)) {
            const m = date.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
            if (!m) return NaN;
            let hours = parseInt(m[1], 10) % 12;
            if (m[3].toUpperCase() === 'PM') hours += 12;
            return hours * 60 + parseInt(m[2], 10);
        }
        const tempdate = new Date(date ?? new Date());
        if (isNaN(tempdate.getTime())) return NaN;
        const hours = tempdate.getHours();
        const minutes = tempdate.getMinutes();
        return hours * 60 + minutes;
    };
    
    // Define time thresholds in "minutes since midnight"
    const prayerTimeMinutes = {
        fajr: toMinutes(times.subhi.adhan),
        dhuhr: toMinutes(times.dhuhr.adhan),
        asr: toMinutes(times.asr.adhan),
        maghrib: toMinutes(times.maghrib.adhan),
        isha: toMinutes(times.isha.adhan)
    };
    
    const currentTime = toMinutes(new Date());
    
    // Determine upcoming prayer based on current time
    if (currentTime < prayerTimeMinutes.fajr) return 'fajr';
    if (currentTime < prayerTimeMinutes.dhuhr) return 'dhuhr';
    if (currentTime < prayerTimeMinutes.asr) return 'asr';
    if (currentTime < prayerTimeMinutes.maghrib) return 'maghrib';
    if (currentTime < prayerTimeMinutes.isha) return 'isha';
    
    // If after isha, the next prayer is fajr tomorrow
    return 'fajr';
}

/**
 * @type {Record<string, string>}
 */
export const prayerBackgrounds = {
    fajr: '/images/midnight.webp',
    dhuhr: '/images/noon.webp',
    asr: '/images/evening.webp',
    maghrib: '/images/late-evening.webp',
    isha: '/images/night.webp'
};
