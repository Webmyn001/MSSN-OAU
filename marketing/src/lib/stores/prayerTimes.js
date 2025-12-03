import { writable, derived } from 'svelte/store';

/**
 * @typedef {Object} PrayerTime
 * @property {number} adhan - The adhan (call to prayer) time in milliseconds
 * @property {number} iqamah - The iqamah (start of prayer) time in milliseconds
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
 * @type {import('svelte/store').Writable<PrayerTimes>}
 */
export const prayerTimes = writable({
    subhi: {
        adhan: new Date().setHours(5, 0, 0),
        iqamah: new Date().setHours(5, 30, 0)
    },
    dhuhr: {
        adhan: new Date().setHours(13, 0, 0),
        iqamah: new Date().setHours(13, 30, 0)
    },
    asr: {
        adhan: new Date().setHours(16, 0, 0),
        iqamah: new Date().setHours(16, 30, 0)
    },
    maghrib: {
        adhan: new Date().setHours(18, 30, 0),
        iqamah: new Date().setHours(18, 45, 0)
    },
    isha: {
        adhan: new Date().setHours(19, 30, 0),
        iqamah: new Date().setHours(19, 45, 0)
    }
});

/**
 * @type {import('svelte/store').Readable<string>}
 */
export const upcomingPrayer = derived(prayerTimes, ($prayerTimes) => {
    return getSolahPeriod($prayerTimes);
});

/**
 * Formats a date or timestamp into a 12-hour time string
 * @param {number|Date|undefined} dateInput - The date or timestamp to format
 * @returns {string} Formatted time string in 12-hour format (e.g., "1:30 PM")
 */
export function formatTime(dateInput) {
    if (!dateInput) return "00:00 AM";
    
    const date = new Date(dateInput);
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12; // Convert hour to 12-hour format
    const minuteFormatted = minutes < 10 ? '0' + minutes : minutes; // Add leading zero for minutes
    
    return `${hour12}:${minuteFormatted} ${ampm}`;
}

/**
 * Determines which prayer time is next based on current time
 * @param {PrayerTimes} times - The prayer times object
 * @returns {string} The name of the next prayer
 */
function getSolahPeriod(times) {
    /**
     * Converts a date to minutes since midnight
     * @param {number|Date|undefined} date - The date to convert
     * @returns {number} Minutes since midnight
     */
    const toMinutes = (date) => {
        const tempdate = new Date(date ?? new Date());
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