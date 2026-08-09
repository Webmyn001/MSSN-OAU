import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { getConfigValue, setConfigValue } from '../services/config-store'

const MOSQUES_KEY = 'mosques'

export interface MosqueEntry {
	id: string
	label: string
	url: string
	images: string[]
	address: string
	description: string
}

export interface MosquesPayload {
	mosques: MosqueEntry[]
	updatedAt?: string
}

const defaultMosques: MosquesPayload = {
	mosques: [],
	updatedAt: ''
}

const publicMosquesRoute = new Hono()

// GET /public/mosques
publicMosquesRoute.get('/', async c => {
	try {
		const data = await getConfigValue<MosquesPayload>(MOSQUES_KEY, defaultMosques)
		return successResponse(c, data)
	} catch (error) {
		logger.error({ error }, 'Failed getting mosques')
		return errorResponse(c, 'Failed to get mosques', 'READ_ERROR', 500)
	}
})

// PUT /public/mosques (admin only — protected by global middleware)
publicMosquesRoute.put('/', async c => {
	try {
		const body = await c.req.json()
		if (!body || !Array.isArray(body.mosques)) {
			return errorResponse(c, 'Invalid mosques payload', 'INVALID_DATA', 400)
		}

		body.updatedAt = new Date().toISOString()

		await setConfigValue(MOSQUES_KEY, body)

		logger.info('Mosques updated via admin dashboard')
		return successResponse(c, { message: 'Mosques updated successfully', data: body })
	} catch (error) {
		logger.error({ error }, 'Failed updating mosques')
		return errorResponse(c, 'Failed to update mosques', 'WRITE_ERROR', 500)
	}
})

export default publicMosquesRoute
