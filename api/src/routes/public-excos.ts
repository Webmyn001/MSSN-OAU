import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { getConfigValue, setConfigValue } from '../services/config-store'

const EXCOS_KEY = 'excos'

export interface ExcoMember {
	id?: string
	name: string
	position: string
	gender?: string
	phone?: string
	email?: string
	photo?: string
	bio?: string
}

export interface ExcoCommittee {
	committee: string
	members: ExcoMember[]
}

export interface ExcoSession {
	session: string
	start_year?: number
	end_year?: number
	executives: ExcoCommittee[]
}

export interface ExcosData {
	sessions: ExcoSession[]
}

const defaultData: ExcosData = { sessions: [] }

const publicExcosRoute = new Hono()

// * GET /public/excos - Public endpoint to get all excos data
publicExcosRoute.get('/', async c => {
	try {
		const data = await getConfigValue<ExcosData>(EXCOS_KEY, defaultData)
		return successResponse(c, { excos: data })
	} catch (error) {
		logger.error({ error }, 'Failed getting excos data')
		return errorResponse(c, 'Failed to get excos data', 'READ_ERROR', 500)
	}
})

// * PUT /public/excos - Save/sync full excos dataset
publicExcosRoute.put('/', async c => {
	try {
		const body = await c.req.json()
		if (!body || !Array.isArray(body.sessions)) {
			return errorResponse(c, 'Invalid data: must contain a "sessions" array', 'INVALID_DATA', 400)
		}

		await setConfigValue(EXCOS_KEY, body)

		logger.info('Excos data updated')
		return successResponse(c, { message: 'Excos data saved successfully' })
	} catch (error) {
		logger.error({ error }, 'Failed saving excos data')
		return errorResponse(c, 'Failed to save excos data', 'WRITE_ERROR', 500)
	}
})

export default publicExcosRoute
