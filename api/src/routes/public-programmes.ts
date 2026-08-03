import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { db } from '../lib/db'
import { programmes } from '../db/schema'

const publicProgrammesRoute = new Hono()

// GET /public/programmes
publicProgrammesRoute.get('/', async c => {
	try {
		c.header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
		c.header('Pragma', 'no-cache')
		c.header('Expires', '0')
		const items = await db.select().from(programmes)
		return successResponse(c, { programmes: items })
	} catch (error) {
		logger.error({ error }, 'Failed getting programmes')
		return errorResponse(c, 'Failed to get programmes', 'READ_ERROR', 500)
	}
})

// PUT /public/programmes (admin — protected by global middleware)
publicProgrammesRoute.put('/', async c => {
	try {
		const body = await c.req.json()
		if (!body || !Array.isArray(body.programmes)) {
			return errorResponse(c, 'Invalid programmes payload', 'INVALID_DATA', 400)
		}

		const mapped = body.programmes.map((item: Record<string, any>) => ({
			id: item.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(item.id))
				? item.id
				: crypto.randomUUID(),
			title: item.title,
			text: item.text || null,
			summary: item.summary || null,
			description: item.description || null,
			image: item.image || null,
			schedule: Array.isArray(item.schedule) ? item.schedule : []
		}))

		await db.transaction(async (tx) => {
			await tx.delete(programmes)
			if (mapped.length > 0) {
				await tx.insert(programmes).values(mapped)
			}
		})

		logger.info({ count: mapped.length }, 'Programmes updated via admin dashboard')
		return successResponse(c, { message: 'Programmes updated successfully' })
	} catch (error) {
		logger.error({ error }, 'Failed updating programmes')
		return errorResponse(c, `Failed to update programmes: ${error instanceof Error ? error.message : String(error)}`, 'WRITE_ERROR', 500)
	}
})

export default publicProgrammesRoute
