import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import env from './env'
import * as schema from '../db/schema/index'

// * Create PostgreSQL connection
const connectionString = env.DATABASE_URL

// * Enable SSL when the connection string requests it (e.g. Neon, production Postgres)
const sslMode = new URL(connectionString).searchParams.get('sslmode')

// * Create postgres client
const client = postgres(connectionString, {
	max: 10,
	idle_timeout: 20,
	connect_timeout: 10,
	...(sslMode === 'require' ? { ssl: 'require' } : {})
})

// * Create Drizzle database instance
export const db = drizzle(client, { schema })

// * Export schema for use in queries
export { schema }

// * Export postgres client for raw queries if needed
export { client as postgresClient }
