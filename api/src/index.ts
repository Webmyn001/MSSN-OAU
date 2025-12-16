import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// * Server setup for production
const port = Number(process.env.PORT) || 3000
const hostname = process.env.HOST || '0.0.0.0'

// * Start server if this is the main module
if (import.meta.main) {
  Bun.serve({
    fetch: app.fetch,
    port,
    hostname
  })
  console.log(`Server running on http://${hostname}:${port}`)
}

export default app
