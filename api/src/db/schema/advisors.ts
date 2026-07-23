import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core'
import { academicSessions } from './sessions'

// * Advisors per academic session
// * Advisors are not necessarily users in the system, so no user_id reference
export const advisors = pgTable(
	'advisors',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sessionId: uuid('session_id')
			.notNull()
			.references(() => academicSessions.id, { onDelete: 'cascade' }),
		name: varchar('name', { length: 255 }).notNull(),
		position: varchar('position', { length: 100 }).notNull(), // * "Chief Advisor", "Financial Advisor", etc.
		email: varchar('email', { length: 255 }),
		phone: varchar('phone', { length: 20 }),
		imageUrl: text('image_url'), // * R2 URL for advisor photo
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		// * Index for querying advisors by session
		sessionIdx: index('advisors_session_idx').on(table.sessionId)
	})
)

// * Export types
export type Advisor = typeof advisors.$inferSelect
export type NewAdvisor = typeof advisors.$inferInsert
