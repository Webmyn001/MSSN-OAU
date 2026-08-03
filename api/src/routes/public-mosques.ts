import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import * as fs from 'fs'
import * as path from 'path'

const MOSQUES_FILE = path.join(process.cwd(), 'data', 'mosques.json')

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

function ensureDataDir() {
	const dir = path.dirname(MOSQUES_FILE)
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

function readMosquesData(): MosquesPayload {
	try {
		ensureDataDir()
		if (fs.existsSync(MOSQUES_FILE)) {
			const raw = fs.readFileSync(MOSQUES_FILE, 'utf-8')
			const parsed = JSON.parse(raw)
			if (parsed && Array.isArray(parsed.mosques)) {
				return parsed
			}
		}
	} catch (e) {
		logger.error({ e }, 'Failed reading mosques JSON file')
	}
	return defaultMosques
}

function writeMosquesData(data: MosquesPayload): boolean {
	try {
		ensureDataDir()
		fs.writeFileSync(MOSQUES_FILE, JSON.stringify(data, null, 2), 'utf-8')
		return true
	} catch (e) {
		logger.error({ e }, 'Failed writing mosques JSON file')
		return false
	}
}

const publicMosquesRoute = new Hono()

// GET /public/mosques
publicMosquesRoute.get('/', c => {
	try {
		const data = readMosquesData()
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

		const saved = writeMosquesData(body)
		if (!saved) {
			return errorResponse(c, 'Failed to save mosques', 'WRITE_ERROR', 500)
		}

		logger.info('Mosques updated via admin dashboard')
		return successResponse(c, { message: 'Mosques updated successfully', data: body })
	} catch (error) {
		logger.error({ error }, 'Failed updating mosques')
		return errorResponse(c, 'Failed to update mosques', 'WRITE_ERROR', 500)
	}
})

export default publicMosquesRoute
