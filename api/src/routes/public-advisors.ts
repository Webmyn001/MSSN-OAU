import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import * as fs from 'fs'
import * as path from 'path'

const ADVISORS_FILE = path.join(process.cwd(), 'data', 'advisors.json')

const defaultData = { advisors: [] }

function ensureDataDir() {
	const dir = path.dirname(ADVISORS_FILE)
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

function readAdvisorsData() {
	try {
		ensureDataDir()
		if (fs.existsSync(ADVISORS_FILE)) {
			const raw = fs.readFileSync(ADVISORS_FILE, 'utf-8')
			const parsed = JSON.parse(raw)
			if (parsed && Array.isArray(parsed.advisors)) {
				return parsed
			}
		}
	} catch (e) {
		logger.error({ e }, 'Failed reading advisors JSON file')
	}
	return defaultData
}

function writeAdvisorsData(data: unknown): boolean {
	try {
		ensureDataDir()
		fs.writeFileSync(ADVISORS_FILE, JSON.stringify(data, null, 2), 'utf-8')
		return true
	} catch (e) {
		logger.error({ e }, 'Failed writing advisors JSON file')
		return false
	}
}

const publicAdvisorsRoute = new Hono()

publicAdvisorsRoute.get('/', c => {
	try {
		const data = readAdvisorsData()
		return successResponse(c, data)
	} catch (error) {
		logger.error({ error }, 'Failed getting advisors data')
		return errorResponse(c, 'Failed to get advisors data', 'READ_ERROR', 500)
	}
})

publicAdvisorsRoute.put('/', async c => {
	try {
		const body = await c.req.json()
		if (!body || !Array.isArray(body.advisors)) {
			return errorResponse(c, 'Invalid advisors data: must contain an "advisors" array', 'VALIDATION_ERROR', 400)
		}

		const saved = writeAdvisorsData(body)
		if (!saved) {
			return errorResponse(c, 'Failed to save advisors data', 'WRITE_ERROR', 500)
		}

		logger.info('Advisors data updated')
		return successResponse(c, { message: 'Advisors data saved successfully' })
	} catch (error) {
		logger.error({ error }, 'Failed saving advisors data')
		return errorResponse(c, 'Failed to save advisors data', 'WRITE_ERROR', 500)
	}
})

export default publicAdvisorsRoute
