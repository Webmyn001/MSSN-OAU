import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import * as fs from 'fs'
import * as path from 'path'

const PRAYER_TIMES_FILE = path.join(process.cwd(), 'data', 'prayer-times.json')

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
	hijriDate: "27 Muharram, 1446AH",
	shortHijriDate: "27/01/1446AH",
	isCustomHijri: false,
	prayer_times: {
		subhi: { adhan: "05:15 AM", iqamah: "05:35 AM" },
		dhuhr: { adhan: "01:00 PM", iqamah: "01:25 PM" },
		asr: { adhan: "04:15 PM", iqamah: "04:30 PM" },
		maghrib: { adhan: "06:45 PM", iqamah: "06:50 PM" },
		isha: { adhan: "08:00 PM", iqamah: "08:15 PM" },
		jumuah: { adhan: "01:00 PM", iqamah: "01:45 PM" }
	}
}

function ensureDataDir() {
	const dir = path.dirname(PRAYER_TIMES_FILE)
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

function readPrayerTimesData(): PrayerTimesPayload {
	try {
		ensureDataDir()
		if (fs.existsSync(PRAYER_TIMES_FILE)) {
			const raw = fs.readFileSync(PRAYER_TIMES_FILE, 'utf-8')
			const parsed = JSON.parse(raw)
			if (parsed && parsed.prayer_times) {
				return parsed
			}
		}
	} catch (e) {
		logger.error({ e }, 'Failed reading prayer times JSON file')
	}
	return defaultPrayerTimes
}

function writePrayerTimesData(data: PrayerTimesPayload): boolean {
	try {
		ensureDataDir()
		fs.writeFileSync(PRAYER_TIMES_FILE, JSON.stringify(data, null, 2), 'utf-8')
		return true
	} catch (e) {
		logger.error({ e }, 'Failed writing prayer times JSON file')
		return false
	}
}

const publicPrayerTimesRoute = new Hono()

// GET /public/prayer-times
publicPrayerTimesRoute.get('/', c => {
	try {
		const data = readPrayerTimesData()
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

		const saved = writePrayerTimesData(body)
		if (!saved) {
			return errorResponse(c, 'Failed to save prayer times', 'WRITE_ERROR', 500)
		}

		logger.info('Prayer times updated via admin dashboard')
		return successResponse(c, body)
	} catch (error) {
		logger.error({ error }, 'Failed updating prayer times')
		return errorResponse(c, 'Failed to update prayer times', 'WRITE_ERROR', 500)
	}
})

export default publicPrayerTimesRoute
