import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { getConfigValue, setConfigValue } from '../services/config-store'

const SUGGESTION_KEY = 'suggestions'

interface SuggestionEntry {
	id: string
	title: string
	description: string
	status: string
	submittedAt: string
}

interface SuggestionData {
	suggestions: SuggestionEntry[]
}

const defaultData: SuggestionData = { suggestions: [] }

const publicSuggestionRoute = new Hono()

// GET /public/suggestions — return all suggestions
publicSuggestionRoute.get('/', async c => {
	try {
		const data = await getConfigValue<SuggestionData>(SUGGESTION_KEY, defaultData)
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

		await setConfigValue(SUGGESTION_KEY, body)

		logger.info('Suggestion data updated via admin dashboard')
		return successResponse(c, { message: 'Suggestion data saved successfully' })
	} catch (error) {
		logger.error({ error }, 'Failed saving suggestion data')
		return errorResponse(c, 'Failed to save suggestion data', 'WRITE_ERROR', 500)
	}
})

export default publicSuggestionRoute
