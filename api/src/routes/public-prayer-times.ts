import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { getConfigValue, setConfigValue } from '../services/config-store'

const PRAYER_TIMES_KEY = 'prayer_times'

export interface PrayerTimeItem {
	adhan: string
	iqamah: string
}

export interface PrayerTimesPayload {
	hijriDate?: string
	shortHijriDate?: string
	isCustomHijri?: boolean
	updatedAt?: string
	prayer_times: {
		subhi: PrayerTimeItem
		dhuhr: PrayerTimeItem
		asr: PrayerTimeItem
		maghrib: PrayerTimeItem
		isha: PrayerTimeItem
		jumuah: PrayerTimeItem
	}
}

const defaultPrayerTimes: PrayerTimesPayload = {
	hijriDate: "18 Ṣafar, 1448AH",
	shortHijriDate: "18/02/1448AH",
	isCustomHijri: false,
	prayer_times: {
		subhi: { adhan: "05:20 AM", iqamah: "05:40 AM" },
		dhuhr: { adhan: "01:00 PM", iqamah: "01:15 PM" },
		asr: { adhan: "04:15 PM", iqamah: "04:25 PM" },
		maghrib: { adhan: "07:00 PM", iqamah: "07:05 PM" },
		isha: { adhan: "08:15 PM", iqamah: "08:25 PM" },
		jumuah: { adhan: "01:00 PM", iqamah: "02:15 PM" }
	}
}

const publicPrayerTimesRoute = new Hono()

// GET /public/prayer-times
publicPrayerTimesRoute.get('/', async c => {
	try {
		const data = await getConfigValue<PrayerTimesPayload>(PRAYER_TIMES_KEY, defaultPrayerTimes)
		return successResponse(c, data)
	} catch (error) {
		logger.error({ error }, 'Failed getting prayer times')
		return errorResponse(c, 'Failed to get prayer times', 'READ_ERROR', 500)
	}
})

// PUT /public/prayer-times
publicPrayerTimesRoute.put('/', async c => {
	try {
		const body = await c.req.json()
		if (!body || !body.prayer_times) {
			return errorResponse(c, 'Invalid prayer times payload', 'INVALID_DATA', 400)
		}

		body.updatedAt = new Date().toISOString()

		await setConfigValue(PRAYER_TIMES_KEY, body)

		logger.info('Prayer times updated via admin dashboard')
		return successResponse(c, body)
	} catch (error) {
		logger.error({ error }, 'Failed updating prayer times')
		return errorResponse(c, 'Failed to update prayer times', 'WRITE_ERROR', 500)
	}
})

export default publicPrayerTimesRoute
