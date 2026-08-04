import { defineConfig } from 'drizzle-kit'
import env from './src/lib/env'

const url = new URL(env.DATABASE_URL)

export default defineConfig({
	schema: './src/db/schema/index.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		host: url.hostname,
		port: Number(url.port || 5432),
		user: decodeURIComponent(url.username),
		password: decodeURIComponent(url.password),
		database: url.pathname.slice(1),
		ssl: url.searchParams.get('sslmode') === 'require' ? 'require' : false
	},
	verbose: true,
	strict: true
})
