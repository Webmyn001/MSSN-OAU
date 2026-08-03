import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { db } from '../lib/db'
import { blogPosts } from '../db/schema'
import { desc, eq } from 'drizzle-orm'

const WORDPRESS_API_URL = 'https://annuurpress.org.ng/wp-json/wp/v2/posts?_embed'

const publicBlogPostsRoute = new Hono()

async function fetchWordPressPosts(perPage = 20): Promise<Record<string, any>[]> {
	try {
		const res = await fetch(`${WORDPRESS_API_URL}&per_page=${perPage}&status=publish&orderby=date&order=desc`, {
			signal: AbortSignal.timeout(15000)
		})
		if (!res.ok) throw new Error(`WordPress API ${res.status}`)
		const data = await res.json() as Record<string, any>[]
		return data
	} catch (err) {
		logger.error({ err }, 'Failed to fetch WordPress posts')
		return []
	}
}

function transformWpPost(wp: any) {
	const embedded = wp._embedded || {}
	const author = embedded.author?.[0]
	const media = embedded['wp:featuredmedia']?.[0]
	const terms = embedded['wp:term']?.flat() || []

	return {
		wpId: wp.id,
		title: wp.title?.rendered || '',
		excerpt: wp.excerpt?.rendered || '',
		content: wp.content?.rendered || '',
		link: wp.link || '',
		slug: wp.slug || '',
		featuredImage: media?.source_url || media?.media_details?.sizes?.large?.source_url || null,
		authorName: author?.name || null,
		authorAvatar: author?.avatar_urls?.['96'] || author?.avatar_urls?.['48'] || null,
		categories: JSON.stringify(terms.filter((t: Record<string, any>) => t.taxonomy === 'category').map((c: Record<string, any>) => c.name)),
		tags: JSON.stringify(terms.filter((t: Record<string, any>) => t.taxonomy === 'post_tag').map((t: Record<string, any>) => t.name)),
		wpDate: new Date(wp.date),
		wpModified: wp.modified ? new Date(wp.modified) : null
	}
}

// GET /public/blog-posts — list all synced posts (dashboard uses this)
publicBlogPostsRoute.get('/', async c => {
	try {
		const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.wpDate))
		return successResponse(c, { posts })
	} catch (error) {
		logger.error({ error }, 'Failed to fetch blog posts')
		return errorResponse(c, 'Failed to fetch blog posts', 'FETCH_ERROR', 500)
	}
})

// GET /public/blog-posts/approved — list approved posts (marketing uses this)
publicBlogPostsRoute.get('/approved', async c => {
	try {
		const posts = await db
			.select()
			.from(blogPosts)
			.where(eq(blogPosts.approved, true))
			.orderBy(desc(blogPosts.wpDate))
		return successResponse(c, { posts })
	} catch (error) {
		logger.error({ error }, 'Failed to fetch approved blog posts')
		return errorResponse(c, 'Failed to fetch approved blog posts', 'FETCH_ERROR', 500)
	}
})

// POST /public/blog-posts/sync — fetch from WordPress and upsert into DB
publicBlogPostsRoute.post('/sync', async c => {
	try {
		const wpPosts = await fetchWordPressPosts(50)
		if (wpPosts.length === 0) {
			return successResponse(c, { message: 'No posts fetched from WordPress', synced: 0 })
		}

		let synced = 0
		for (const wp of wpPosts) {
			const transformed = transformWpPost(wp)

			const existing = await db.select().from(blogPosts).where(eq(blogPosts.wpId, transformed.wpId))

			if (existing.length > 0) {
				await db
					.update(blogPosts)
					.set({
						title: transformed.title,
						excerpt: transformed.excerpt,
						content: transformed.content,
						featuredImage: transformed.featuredImage,
						authorName: transformed.authorName,
						authorAvatar: transformed.authorAvatar,
						categories: transformed.categories,
						tags: transformed.tags,
						wpModified: transformed.wpModified,
						syncedAt: new Date(),
						updatedAt: new Date()
					})
					.where(eq(blogPosts.wpId, transformed.wpId))
			} else {
				await db.insert(blogPosts).values({
					wpId: transformed.wpId,
					title: transformed.title,
					excerpt: transformed.excerpt,
					content: transformed.content,
					link: transformed.link,
					slug: transformed.slug,
					featuredImage: transformed.featuredImage,
					authorName: transformed.authorName,
					authorAvatar: transformed.authorAvatar,
					categories: transformed.categories,
					tags: transformed.tags,
					wpDate: transformed.wpDate,
					wpModified: transformed.wpModified
				})
			}
			synced++
		}

		logger.info({ synced }, 'Blog posts synced from WordPress')
		return successResponse(c, { message: `Synced ${synced} posts from WordPress`, synced })
	} catch (error) {
		logger.error({ error }, 'Failed to sync blog posts')
		return errorResponse(c, 'Failed to sync blog posts', 'SYNC_ERROR', 500)
	}
})

// PATCH /public/blog-posts/:id/approve — toggle approval
publicBlogPostsRoute.patch('/:id/approve', async c => {
	try {
		const id = c.req.param('id')
		const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id))
		if (!post) {
			return errorResponse(c, 'Post not found', 'NOT_FOUND', 404)
		}

		const newApproved = !post.approved
		await db
			.update(blogPosts)
			.set({ approved: newApproved, approvedAt: newApproved ? new Date() : null, updatedAt: new Date() })
			.where(eq(blogPosts.id, id))

		return successResponse(c, { message: newApproved ? 'Post approved' : 'Post unapproved', approved: newApproved })
	} catch (error) {
		logger.error({ error }, 'Failed to toggle blog post approval')
		return errorResponse(c, 'Failed to update approval', 'UPDATE_ERROR', 500)
	}
})

export default publicBlogPostsRoute
