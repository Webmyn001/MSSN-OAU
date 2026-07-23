import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware, requireExco } from '../middleware/auth'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { listAlumnaeRequestsQuerySchema } from '../schemas/alumnae'

const alumnaeRoute = new Hono()

// * GET /alumnae/requests - List alumnae requests (Exco only)
alumnaeRoute.get(
	'/requests',
	authMiddleware,
	zValidator('query', listAlumnaeRequestsQuerySchema),
	async c => {
		try {
			await requireExco(c)
			const { page, limit, status: _status } = c.req.valid('query')

			// * TODO: Alumnae requests are stored in users table with a status field
			// * For now, this is a placeholder implementation
			// * In the future, this may be a separate table

			// * Build query
			// * Note: Assuming there's an alumnae_request_status field in users table
			// * For now, return empty array as placeholder
			const requests: any[] = []

			// * Apply pagination
			const total = requests.length
			const totalPages = Math.ceil(total / limit)
			const offset = (page - 1) * limit
			const paginatedRequests = requests.slice(offset, offset + limit)

			return successResponse(c, {
				requests: paginatedRequests,
				pagination: {
					page,
					limit,
					total,
					totalPages
				}
			})
		} catch (error) {
			if (error instanceof Error && error.message.includes('Exco access required')) {
				return errorResponse(c, 'Exco access required', 'AUTHORIZATION_ERROR', 403)
			}
			logger.error({ error }, 'Failed to list alumnae requests')
			return errorResponse(c, 'Failed to list alumnae requests', 'LIST_ERROR', 500)
		}
	}
)

export default alumnaeRoute
