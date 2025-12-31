import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core'
import { users } from './users.js'

// * Password reset tokens table
export const passwordResetTokens = pgTable(
	'password_reset_tokens',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		token: text('token').notNull().unique(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		usedAt: timestamp('used_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		// * Indexes for common queries
		userIdIdx: index('password_reset_tokens_user_id_idx').on(table.userId),
		tokenIdx: index('password_reset_tokens_token_idx').on(table.token),
		expiresAtIdx: index('password_reset_tokens_expires_at_idx').on(table.expiresAt)
	})
)

// * Export types
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert

