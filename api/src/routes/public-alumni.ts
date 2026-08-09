import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { getConfigValue, setConfigValue } from '../services/config-store'

const ALUMNI_KEY = 'alumni'

export interface AlumniMember {
	id?: string
	name: string
	position: string
	gender?: string
	session?: string
	department?: string
	phone?: string
	photo?: string
}

export interface AlumniSession {
	session: string
	start_year?: number
	end_year?: number
	members: AlumniMember[]
}

export interface AlumniData {
	sessions: AlumniSession[]
}

const defaultData: AlumniData = { sessions: [] }

const publicAlumniRoute = new Hono()

publicAlumniRoute.get('/', async c => {
	try {
		const data = await getConfigValue<AlumniData>(ALUMNI_KEY, defaultData)
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

		await setConfigValue(ALUMNI_KEY, body)

		logger.info('Alumni data updated')
		return successResponse(c, { message: 'Alumni data saved successfully' })
	} catch (error) {
		logger.error({ error }, 'Failed saving alumni data')
		return errorResponse(c, 'Failed to save alumni data', 'WRITE_ERROR', 500)
	}
})

export default publicAlumniRoute
