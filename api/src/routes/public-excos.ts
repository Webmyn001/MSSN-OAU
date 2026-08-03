import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { getFormattedExcosData, syncExcosDataToDb } from '../services/exco-profiles'

const publicExcosRoute = new Hono()

// * GET /public/excos - Public endpoint to get all excos data from DB
publicExcosRoute.get('/', async c => {
	try {
		const data = await getFormattedExcosData()
		if (!data || !data.sessions || data.sessions.length === 0) {
			return c.json({ success: false, error: 'No excos data found in database.' }, 404)
		}
		return successResponse(c, { excos: data })
	} catch (error) {
		logger.error({ error }, 'Failed to get public excos from DB')
		return errorResponse(c, 'Failed to get excos data from database', 'READ_ERROR', 500)
	}
})

// * PUT /public/excos - Sync/save full excos dataset to PostgreSQL
publicExcosRoute.put('/', async c => {
	try {
		const adminSecret = process.env.ADMIN_SECRET
		if (adminSecret) {
			const authHeader = c.req.header('x-admin-secret')
			if (authHeader !== adminSecret) {
				return errorResponse(c, 'Unauthorized', 'UNAUTHORIZED', 401)
			}
		}

		const body = await c.req.json()
		if (!body || !Array.isArray(body.sessions)) {
			return errorResponse(c, 'Invalid data: must contain a "sessions" array', 'INVALID_DATA', 400)
		}

		const saved = await syncExcosDataToDb(body)
		if (!saved) {
			return errorResponse(c, 'Failed to save excos data to database', 'WRITE_ERROR', 500)
		}

		return successResponse(c, { message: 'Excos data synced to PostgreSQL database successfully' })
	} catch (error) {
		logger.error({ error }, 'Failed to save public excos to DB')
		return errorResponse(c, 'Failed to save excos data to database', 'WRITE_ERROR', 500)
	}
})

export default publicExcosRoute
