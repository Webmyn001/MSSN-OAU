import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Context } from 'hono'
import { errorHandler } from './middleware/error-handler'
import { adminAuthMiddleware } from './middleware/admin-auth'
import { logger } from './lib/logger'
import env from './lib/env'

// * Main Hono application instance
const app = new Hono<{
	Variables: {
		user?: {
			id: string
			email: string
			username: string
			fullName: string
			role: 'MEMBER' | 'EXCO'
			has2FA: boolean
		}
		adminUser?: {
			email: string
			fullName: string
			role: string
		}
	}
}>()

// * Register CORS middleware (early in the chain)
app.use(
	'*',
	cors({
		origin: origin => {
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

// * Admin JWT auth — protects write operations (POST/PUT/PATCH/DELETE)
// * GET requests and public paths are always open
app.use('*', adminAuthMiddleware)

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

// * Register route handlers
import authRoutes from './routes/auth'
import usersRoutes from './routes/users'
import excosRoutes from './routes/excos'
import sessionsRoutes from './routes/sessions'
import alumnaeRoutes from './routes/alumnae'
import webhooksRoutes from './routes/webhooks'
import publicExcosRoute from './routes/public-excos'
import publicPrayerTimesRoute from './routes/public-prayer-times'
import publicEventsRoute from './routes/public-events'
import publicNewsletterRoute from './routes/public-newsletter'
import publicAnnualDuesRoute from './routes/public-annual-dues'
import publicMosquesRoute from './routes/public-mosques'
import publicLatestNewsRoute from './routes/public-latest-news'
import publicBlogPostsRoute from './routes/public-blog-posts'
import publicProgrammesRoute from './routes/public-programmes'
import publicAlumniRoute from './routes/public-alumni'
import publicAdvisorsRoute from './routes/public-advisors'
import publicContactRoute from './routes/public-contact'
import publicSuggestionRoute from './routes/public-suggestions'
import adminAuthRoutes from './routes/admin-auth'

app.route('/admin-auth', adminAuthRoutes)
app.route('/auth', authRoutes)
app.route('/users', usersRoutes)
app.route('/excos', excosRoutes)
app.route('/sessions', sessionsRoutes)
app.route('/alumnae', alumnaeRoutes)
app.route('/webhooks', webhooksRoutes)
app.route('/public/excos', publicExcosRoute)
app.route('/public/prayer-times', publicPrayerTimesRoute)
app.route('/public/events', publicEventsRoute)
app.route('/public/newsletter', publicNewsletterRoute)
app.route('/public/annual-dues', publicAnnualDuesRoute)
app.route('/public/mosques', publicMosquesRoute)
app.route('/public/latest-news', publicLatestNewsRoute)
app.route('/public/blog-posts', publicBlogPostsRoute)
app.route('/public/programmes', publicProgrammesRoute)
app.route('/public/alumni', publicAlumniRoute)
app.route('/public/advisors', publicAdvisorsRoute)
app.route('/public/contact', publicContactRoute)
app.route('/public/suggestions', publicSuggestionRoute)

export default app

