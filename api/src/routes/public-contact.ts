import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import * as fs from 'fs'
import * as path from 'path'

const CONTACT_FILE = path.join(process.cwd(), 'data', 'contacts.json')

const defaultData = { entries: [] }

function ensureDataDir() {
	const dir = path.dirname(CONTACT_FILE)
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

function readContactData() {
	try {
		ensureDataDir()
		if (fs.existsSync(CONTACT_FILE)) {
			const raw = fs.readFileSync(CONTACT_FILE, 'utf-8')
			const parsed = JSON.parse(raw)
			if (parsed && Array.isArray(parsed.entries)) {
				return parsed
			}
		}
	} catch (e) {
		logger.error({ e }, 'Failed reading contact JSON file')
	}
	return defaultData
}

function writeContactData(data: unknown): boolean {
	try {
		ensureDataDir()
		fs.writeFileSync(CONTACT_FILE, JSON.stringify(data, null, 2), 'utf-8')
		return true
	} catch (e) {
		logger.error({ e }, 'Failed writing contact JSON file')
		return false
	}
}

const publicContactRoute = new Hono()

// GET /public/contact — return all entries
publicContactRoute.get('/', c => {
	try {
		const data = readContactData()
		return successResponse(c, data)
	} catch (error) {
		logger.error({ error }, 'Failed getting contact data')
		return errorResponse(c, 'Failed to get contact data', 'READ_ERROR', 500)
	}
})

// POST /public/contact — create a new entry (from marketing form)
publicContactRoute.post('/', async c => {
	try {
		const body = await c.req.json()
		const { fname, lname, email, phone, message } = body

		if (!fname?.trim() || !lname?.trim() || !phone?.trim() || !message?.trim()) {
			return errorResponse(c, 'First name, last name, phone, and message are required', 'VALIDATION_ERROR', 400)
		}

		const data = readContactData()

		const entry = {
			id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
			fname: fname.trim(),
			lname: lname.trim(),
			email: email?.trim() || undefined,
			phone: phone.trim(),
			message: message.trim(),
			submittedAt: new Date().toISOString(),
			status: 'new' as const
		}

		data.entries.unshift(entry)
		writeContactData(data)

		logger.info({ id: entry.id }, 'New contact form submission')
		return successResponse(c, { entry, message: 'Your message has been sent successfully. We will get back to you soon.' })
	} catch (error) {
		logger.error({ error }, 'Failed saving contact submission')
		return errorResponse(c, 'Failed to save your message', 'WRITE_ERROR', 500)
	}
})

// PUT /public/contact — update entries (status, notes) from dashboard
publicContactRoute.put('/', async c => {
	try {
		const body = await c.req.json()
		if (!body || !Array.isArray(body.entries)) {
			return errorResponse(c, 'Invalid data: must contain an "entries" array', 'VALIDATION_ERROR', 400)
		}

		const saved = writeContactData(body)
		if (!saved) {
			return errorResponse(c, 'Failed to save contact data', 'WRITE_ERROR', 500)
		}

		logger.info('Contact data updated via admin dashboard')
		return successResponse(c, { message: 'Contact data saved successfully' })
	} catch (error) {
		logger.error({ error }, 'Failed saving contact data')
		return errorResponse(c, 'Failed to save contact data', 'WRITE_ERROR', 500)
	}
})

export default publicContactRoute
