import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Context } from 'hono'
import { errorHandler } from './middleware/error-handler.js'
import { logger } from './lib/logger.js'
import env from './lib/env.js'

// * Main Hono application instance
const app = new Hono<{
	Variables: {
		// * Variables that can be set via c.set() and accessed via c.get()
		// * Add custom variables here as needed
	}
}>()

// * Register CORS middleware (early in the chain)
app.use(
	'*',
	cors({
		origin: (origin) => {
			// * Allow requests from the app URL
			if (origin === env.APP_URL) {
				return origin
			}
			// * In development, allow localhost
			if (env.NODE_ENV === 'development' && origin?.includes('localhost')) {
				return origin
			}
			// * Default: allow all origins (can be restricted in production)
			return origin || '*'
		},
		allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
		exposeHeaders: ['Content-Length', 'X-Request-Id'],
		credentials: true,
		maxAge: 86400 // * 24 hours
	})
)

// * Register global error handler
app.onError(errorHandler)

// * Request logging middleware
app.use('*', async (c, next) => {
	const start = Date.now()
	await next()
	const duration = Date.now() - start

	logger.info(
		{
			method: c.req.method,
			path: c.req.path,
			status: c.res.status,
			duration: `${duration}ms`
		},
		'Request completed'
	)
})

// * Health check endpoint
app.get('/', (c: Context) => {
	return c.json({
		success: true,
		message: 'MSSN API Server',
		timestamp: new Date().toISOString()
	})
})

// * Health check endpoint
app.get('/health', (c: Context) => {
	return c.json({
		success: true,
		status: 'healthy',
		timestamp: new Date().toISOString()
	})
})

export default app
