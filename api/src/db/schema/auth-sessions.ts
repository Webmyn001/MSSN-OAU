import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core'
import { users } from './users'

// * Authentication sessions table
export const authSessions = pgTable(
	'auth_sessions',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		token: text('token').notNull().unique(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		lastUsedAt: timestamp('last_used_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		// * Indexes for common queries
		userIdIdx: index('auth_sessions_user_id_idx').on(table.userId),
		tokenIdx: index('auth_sessions_token_idx').on(table.token),
		expiresAtIdx: index('auth_sessions_expires_at_idx').on(table.expiresAt)
	})
)

// * Export types
export type AuthSession = typeof authSessions.$inferSelect
export type NewAuthSession = typeof authSessions.$inferInsert
