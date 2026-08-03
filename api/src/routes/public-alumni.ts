import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import * as fs from 'fs'
import * as path from 'path'

const ALUMNI_FILE = path.join(process.cwd(), 'data', 'alumni.json')

const defaultData = { sessions: [] }

function ensureDataDir() {
	const dir = path.dirname(ALUMNI_FILE)
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

function readAlumniData() {
	try {
		ensureDataDir()
		if (fs.existsSync(ALUMNI_FILE)) {
			const raw = fs.readFileSync(ALUMNI_FILE, 'utf-8')
			const parsed = JSON.parse(raw)
			if (parsed && Array.isArray(parsed.sessions)) {
				return parsed
			}
		}
	} catch (e) {
		logger.error({ e }, 'Failed reading alumni JSON file')
	}
	return defaultData
}

function writeAlumniData(data: unknown): boolean {
	try {
		ensureDataDir()
		fs.writeFileSync(ALUMNI_FILE, JSON.stringify(data, null, 2), 'utf-8')
		return true
	} catch (e) {
		logger.error({ e }, 'Failed writing alumni JSON file')
		return false
	}
}

const publicAlumniRoute = new Hono()

publicAlumniRoute.get('/', c => {
	try {
		const data = readAlumniData()
		return successResponse(c, { alumni: data })
	} catch (error) {
		logger.error({ error }, 'Failed getting alumni data')
		return errorResponse(c, 'Failed to get alumni data', 'READ_ERROR', 500)
	}
})

publicAlumniRoute.put('/', async c => {
	try {
		const body = await c.req.json()
		if (!body || !body.sessions) {
			return errorResponse(c, 'Invalid alumni data: must contain a "sessions" array', 'VALIDATION_ERROR', 400)
		}

		const saved = writeAlumniData(body)
		if (!saved) {
			return errorResponse(c, 'Failed to save alumni data', 'WRITE_ERROR', 500)
		}

		logger.info('Alumni data updated')
		return successResponse(c, { message: 'Alumni data saved successfully' })
	} catch (error) {
		logger.error({ error }, 'Failed saving alumni data')
		return errorResponse(c, 'Failed to save alumni data', 'WRITE_ERROR', 500)
	}
})

export default publicAlumniRoute
