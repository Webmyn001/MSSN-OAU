import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { getConfigValue, setConfigValue } from '../services/config-store'

const CONTACT_KEY = 'contacts'

export interface ContactEntry {
	id: string
	fname: string
	lname: string
	email?: string
	phone: string
	message: string
	submittedAt: string
	status: 'new' | 'read' | 'replied' | 'archived'
	notes?: string
}

interface ContactData {
	entries: ContactEntry[]
}

const defaultData: ContactData = { entries: [] }

const publicContactRoute = new Hono()

// GET /public/contact — return all entries
publicContactRoute.get('/', async c => {
	try {
		const data = await getConfigValue<ContactData>(CONTACT_KEY, defaultData)
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

		const data = await getConfigValue<ContactData>(CONTACT_KEY, defaultData)

		const entry: ContactEntry = {
			id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
			fname: fname.trim(),
			lname: lname.trim(),
			email: email?.trim() || undefined,
			phone: phone.trim(),
			message: message.trim(),
			submittedAt: new Date().toISOString(),
			status: 'new'
		}

		data.entries.unshift(entry)
		await setConfigValue(CONTACT_KEY, data)

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

		await setConfigValue(CONTACT_KEY, body)

		logger.info('Contact data updated via admin dashboard')
		return successResponse(c, { message: 'Contact data saved successfully' })
	} catch (error) {
		logger.error({ error }, 'Failed saving contact data')
		return errorResponse(c, 'Failed to save contact data', 'WRITE_ERROR', 500)
	}
})

export default publicContactRoute
