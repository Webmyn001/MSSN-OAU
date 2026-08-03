import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import * as fs from 'fs'
import * as path from 'path'

const SUGGESTION_FILE = path.join(process.cwd(), 'data', 'suggestions.json')

const defaultData = { suggestions: [] }

function ensureDataDir() {
	const dir = path.dirname(SUGGESTION_FILE)
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
}

function readSuggestionData() {
	try {
		ensureDataDir()
		if (fs.existsSync(SUGGESTION_FILE)) {
			const raw = fs.readFileSync(SUGGESTION_FILE, 'utf-8')
			const parsed = JSON.parse(raw)
			if (parsed && Array.isArray(parsed.suggestions)) {
				return parsed
			}
		}
	} catch (e) {
		logger.error({ e }, 'Failed reading suggestion JSON file')
	}
	return defaultData
}

function writeSuggestionData(data: unknown): boolean {
	try {
		ensureDataDir()
		fs.writeFileSync(SUGGESTION_FILE, JSON.stringify(data, null, 2), 'utf-8')
		return true
	} catch (e) {
		logger.error({ e }, 'Failed writing suggestion JSON file')
		return false
	}
}

const publicSuggestionRoute = new Hono()

// GET /public/suggestions — return all suggestions
publicSuggestionRoute.get('/', c => {
	try {
		const data = readSuggestionData()
		return successResponse(c, data)
	} catch (error) {
		logger.error({ error }, 'Failed getting suggestion data')
		return errorResponse(c, 'Failed to get suggestion data', 'READ_ERROR', 500)
	}
})

// PUT /public/suggestions — replace all suggestions (admin dashboard)
publicSuggestionRoute.put('/', async c => {
	try {
		const body = await c.req.json()
		if (!body || !Array.isArray(body.suggestions)) {
			return errorResponse(c, 'Invalid data: must contain a "suggestions" array', 'VALIDATION_ERROR', 400)
		}

		const saved = writeSuggestionData(body)
		if (!saved) {
			return errorResponse(c, 'Failed to save suggestion data', 'WRITE_ERROR', 500)
		}

		logger.info('Suggestion data updated via admin dashboard')
		return successResponse(c, { message: 'Suggestion data saved successfully' })
	} catch (error) {
		logger.error({ error }, 'Failed saving suggestion data')
		return errorResponse(c, 'Failed to save suggestion data', 'WRITE_ERROR', 500)
	}
})

export default publicSuggestionRoute
