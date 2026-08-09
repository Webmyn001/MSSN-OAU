import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { getConfigValue, setConfigValue } from '../services/config-store'

const ADVISORS_KEY = 'advisors'

export interface AdvisorEntry {
	id?: string
	name: string
	title: string
	bio?: string
	photo?: string | null
	priority?: number
}

export interface AdvisorsData {
	advisors: AdvisorEntry[]
}

const defaultData: AdvisorsData = { advisors: [] }

const publicAdvisorsRoute = new Hono()

publicAdvisorsRoute.get('/', async c => {
	try {
		const data = await getConfigValue<AdvisorsData>(ADVISORS_KEY, defaultData)
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

		await setConfigValue(ADVISORS_KEY, body)

		logger.info('Advisors data updated')
		return successResponse(c, { message: 'Advisors data saved successfully' })
	} catch (error) {
		logger.error({ error }, 'Failed saving advisors data')
		return errorResponse(c, 'Failed to save advisors data', 'WRITE_ERROR', 500)
	}
})

export default publicAdvisorsRoute
