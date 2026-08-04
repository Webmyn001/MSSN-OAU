import { defineConfig } from 'drizzle-kit'
import env from './src/lib/env'

export default defineConfig({
	schema: './src/db/schema/index.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: env.DATABASE_URL,
		...(env.DATABASE_URL.includes('sslmode=require')
			? { ssl: { rejectUnauthorized: false } }
			: {})
	},
	verbose: true,
	strict: true
})
