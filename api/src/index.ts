import app from './app.js'
import env from './lib/env.js'

// * Server setup for production
const port = env.PORT
const hostname = env.HOST

// * Start server if this is the main module
if (import.meta.main) {
	Bun.serve({
		fetch: app.fetch,
		port,
		hostname
	})
	console.log(`🚀 MSSN API Server running on http://${hostname}:${port}`)
}

export default app
