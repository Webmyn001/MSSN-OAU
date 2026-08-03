import type { Context, Next } from 'hono'
import { verifyJWT } from '../services/admin-auth'
import { errorResponse } from '../lib/response'

/**
 * Admin JWT authentication middleware.
 * - GET requests are ALWAYS public (no token required)
 * - POST/PUT/PATCH/DELETE require a valid JWT token
 * - /public/* routes are always public
 * - /admin-auth/* routes are always public
 * - /health and / are always public
 */
export async function adminAuthMiddleware(c: Context, next: Next) {
	const method = c.req.method
	const path = c.req.path

	// Public paths — never require auth
	if (
		path === '/' ||
		path === '/health' ||
		path.startsWith('/public/') ||
		path.startsWith('/admin-auth/') ||
		path.startsWith('/auth/')
	) {
		return next()
	}

	// GET requests are always public (read-only)
	if (method === 'GET') {
		return next()
	}

	// Write operations require JWT
	const authHeader = c.req.header('Authorization')
	const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

	if (!token) {
		return errorResponse(
			c,
			'Authentication required for this operation',
			'AUTHENTICATION_REQUIRED',
			401
		)
	}

	const user = await verifyJWT(token)
	if (!user) {
		return errorResponse(c, 'Invalid or expired token', 'INVALID_TOKEN', 401)
	}

	// Attach user info to context for downstream use
	c.set('adminUser', user)

	return next()
}
