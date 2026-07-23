import app from './app'
import env from './lib/env'

// * Server setup for production
const port = env.PORT
const hostname = env.HOST

// * Start server — export for Bun --hot HMR support
const server = Bun.serve({
	fetch: app.fetch,
	port,
	hostname
})

console.log(`🚀 MSSN API Server running on http://${hostname}:${port}`)

export default server
