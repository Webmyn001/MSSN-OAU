import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core'
import { users } from './users'
import { academicSessions } from './sessions'

// * Exco positions per academic session
// * Links users to their exco positions for specific academic sessions
export const excos = pgTable(
	'excos',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		sessionId: uuid('session_id')
			.notNull()
			.references(() => academicSessions.id, { onDelete: 'cascade' }),
		position: varchar('position', { length: 100 }).notNull(), // * "President", "Secretary", "Treasurer", etc.
		imageUrl: text('image_url'), // * R2 URL for exco photo
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		// * Composite index for checking exco status for a user in a session
		userSessionIdx: index('excos_user_session_idx').on(table.userId, table.sessionId),
		sessionIdx: index('excos_session_idx').on(table.sessionId)
	})
)

// * Export types
export type Exco = typeof excos.$inferSelect
export type NewExco = typeof excos.$inferInsert
