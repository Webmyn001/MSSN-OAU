import { Hono } from 'hono'
import { asc, count, desc, eq, inArray, sql } from 'drizzle-orm'
import crypto from 'crypto'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { db } from '../lib/db'
import { latestNews, latestNewsComments, type NewLatestNews } from '../db/schema'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_NAME_LENGTH = 100
const MAX_COMMENT_LENGTH = 500

type MappedNews = NewLatestNews & { id: string }

function validId(id: string): string {
	return UUID_REGEX.test(id) ? id : crypto.randomUUID()
}

function parseDate(value: unknown): Date {
	const parsed = new Date(value as string)
	return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

const publicLatestNewsRoute = new Hono()

// GET /public/latest-news
publicLatestNewsRoute.get('/', async c => {
	try {
		const items = await db.select().from(latestNews).orderBy(desc(latestNews.date))
		const counts = await db
			.select({ latestNewsId: latestNewsComments.latestNewsId, total: count() })
			.from(latestNewsComments)
			.groupBy(latestNewsComments.latestNewsId)
		const countMap = new Map(counts.map(row => [row.latestNewsId, Number(row.total)]))

		return successResponse(c, {
			items: items.map(item => ({
				...item,
				commentCount: countMap.get(item.id) ?? 0
			}))
		})
	} catch (error) {
		logger.error({ error }, 'Failed getting latest news')
		return errorResponse(c, 'Failed to get latest news', 'READ_ERROR', 500)
	}
})

// POST /public/latest-news/:id/view — public view counter
publicLatestNewsRoute.post('/:id/view', async c => {
	try {
		const id = c.req.param('id')
		if (!UUID_REGEX.test(id)) {
			return errorResponse(c, 'Invalid post id', 'INVALID_ID', 400)
		}

		const [updated] = await db
			.update(latestNews)
			.set({ views: sql`${latestNews.views} + 1` })
			.where(eq(latestNews.id, id))
			.returning({ views: latestNews.views })

		if (!updated) {
			return errorResponse(c, 'Post not found', 'NOT_FOUND', 404)
		}

		return successResponse(c, { views: updated.views })
	} catch (error) {
		logger.error({ error }, 'Failed recording latest news view')
		return errorResponse(c, 'Failed to record view', 'WRITE_ERROR', 500)
	}
})

// GET /public/latest-news/:id/comments
publicLatestNewsRoute.get('/:id/comments', async c => {
	try {
		const id = c.req.param('id')
		if (!UUID_REGEX.test(id)) {
			return errorResponse(c, 'Invalid post id', 'INVALID_ID', 400)
		}

		const comments = await db
			.select({
				id: latestNewsComments.id,
				name: latestNewsComments.name,
				comment: latestNewsComments.comment,
				createdAt: latestNewsComments.createdAt
			})
			.from(latestNewsComments)
			.where(eq(latestNewsComments.latestNewsId, id))
			.orderBy(asc(latestNewsComments.createdAt))
			.limit(200)

		return successResponse(c, { comments })
	} catch (error) {
		logger.error({ error }, 'Failed getting latest news comments')
		return errorResponse(c, 'Failed to get comments', 'READ_ERROR', 500)
	}
})

// POST /public/latest-news/:id/comments — name + short comment, no account needed
publicLatestNewsRoute.post('/:id/comments', async c => {
	try {
		const id = c.req.param('id')
		if (!UUID_REGEX.test(id)) {
			return errorResponse(c, 'Invalid post id', 'INVALID_ID', 400)
		}

		const body = await c.req.json()
		const name = typeof body?.name === 'string' ? body.name.trim() : ''
		const comment = typeof body?.comment === 'string' ? body.comment.trim() : ''

		if (!name || name.length > MAX_NAME_LENGTH) {
			return errorResponse(c, 'Please enter a name (max 100 characters)', 'INVALID_NAME', 400)
		}
		if (!comment || comment.length > MAX_COMMENT_LENGTH) {
			return errorResponse(c, 'Please enter a comment (max 500 characters)', 'INVALID_COMMENT', 400)
		}

		const [post] = await db
			.select({ id: latestNews.id })
			.from(latestNews)
			.where(eq(latestNews.id, id))
			.limit(1)
		if (!post) {
			return errorResponse(c, 'Post not found', 'NOT_FOUND', 404)
		}

		const [created] = await db
			.insert(latestNewsComments)
			.values({ latestNewsId: id, name, comment })
			.returning()

		return successResponse(c, { comment: created }, undefined, 201)
	} catch (error) {
		logger.error({ error }, 'Failed adding latest news comment')
		return errorResponse(c, 'Failed to add comment', 'WRITE_ERROR', 500)
	}
})

// PUT /public/latest-news (admin — protected by global middleware)
publicLatestNewsRoute.put('/', async c => {
	try {
		const body = await c.req.json()
		if (!body || !Array.isArray(body.items)) {
			return errorResponse(c, 'Invalid news payload', 'INVALID_DATA', 400)
		}

		const seenIds = new Set<string>()
		const mapped: MappedNews[] = body.items
			.map((item: Record<string, any>): MappedNews => ({
				id: validId(item.id || crypto.randomUUID()),
				title: item.title,
				summary: item.summary,
				content: item.content || null,
				content2: item.content2 || null,
				content3: item.content3 || null,
				image: item.image,
				image2: item.image2 || null,
				date: parseDate(item.date),
				author: item.author || null,
				category: item.category || null
			}))
			.filter((item: MappedNews) => {
				if (seenIds.has(item.id)) return false
				seenIds.add(item.id)
				return true
			})

		await db.transaction(async tx => {
			// * Upsert instead of delete-all so views and comments survive edits.
			if (mapped.length > 0) {
				await tx
					.insert(latestNews)
					.values(mapped)
					.onConflictDoUpdate({
						target: latestNews.id,
						set: {
							title: sql`excluded.title`,
							summary: sql`excluded.summary`,
							content: sql`excluded.content`,
							content2: sql`excluded.content2`,
							content3: sql`excluded.content3`,
							image: sql`excluded.image`,
							image2: sql`excluded.image2`,
							date: sql`excluded.date`,
							author: sql`excluded.author`,
							category: sql`excluded.category`,
							updatedAt: new Date()
						}
					})
			}

			const keptIds = new Set(mapped.map(item => item.id))
			const existing = await tx.select({ id: latestNews.id }).from(latestNews)
			const removedIds = existing.map(row => row.id).filter(id => !keptIds.has(id))
			if (removedIds.length > 0) {
				await tx.delete(latestNews).where(inArray(latestNews.id, removedIds))
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
