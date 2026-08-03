import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { db } from '../lib/db'
import { latestNews } from '../db/schema'
import { desc } from 'drizzle-orm'
import crypto from 'crypto'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function validId(id: string): string {
	return UUID_REGEX.test(id) ? id : crypto.randomUUID()
}

const publicLatestNewsRoute = new Hono()

// GET /public/latest-news
publicLatestNewsRoute.get('/', async c => {
	try {
		const items = await db
			.select()
			.from(latestNews)
			.orderBy(desc(latestNews.date))

		return successResponse(c, { items })
	} catch (error) {
		logger.error({ error }, 'Failed getting latest news')
		return errorResponse(c, 'Failed to get latest news', 'READ_ERROR', 500)
	}
})

// PUT /public/latest-news (admin — protected by global middleware)
publicLatestNewsRoute.put('/', async c => {
	try {
		const body = await c.req.json()
		if (!body || !Array.isArray(body.items)) {
			return errorResponse(c, 'Invalid news payload', 'INVALID_DATA', 400)
		}

		const mapped = body.items.map((item: Record<string, any>) => ({
			id: validId(item.id || crypto.randomUUID()),
			title: item.title,
			summary: item.summary,
			content: item.content || null,
			image: item.image,
			image2: item.image2 || null,
			date: new Date(item.date),
			author: item.author || null,
			category: item.category || null
		}))

		await db.transaction(async (tx) => {
			await tx.delete(latestNews)
			if (mapped.length > 0) {
				await tx.insert(latestNews).values(mapped)
			}
		})

		logger.info({ count: mapped.length }, 'Latest news updated via admin dashboard')
		return successResponse(c, { message: 'Latest news updated successfully' })
	} catch (error) {
		logger.error({ error }, 'Failed updating latest news')
		return errorResponse(c, 'Failed to update latest news', 'WRITE_ERROR', 500)
	}
})

export default publicLatestNewsRoute
