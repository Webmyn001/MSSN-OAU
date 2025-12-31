import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import env from './env.js'
import * as schema from '../db/schema/index.js'

// * Create PostgreSQL connection
const connectionString = env.DATABASE_URL

// * Create postgres client
const client = postgres(connectionString, {
	max: 10,
	idle_timeout: 20,
	connect_timeout: 10
})

// * Create Drizzle database instance
export const db = drizzle(client, { schema })

// * Export schema for use in queries
export { schema }

// * Export postgres client for raw queries if needed
export { client as postgresClient }
