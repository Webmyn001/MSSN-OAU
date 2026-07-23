import { pgTable, uuid, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core'

// * Academic sessions table (e.g., "2023/2024", "2024/2025")
export const academicSessions = pgTable(
	'academic_sessions',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		name: varchar('name', { length: 20 }).notNull().unique(), // * "2023/2024", "2024/2025"
		startDate: timestamp('start_date', { withTimezone: true }).notNull(),
		endDate: timestamp('end_date', { withTimezone: true }).notNull(),
		isActive: boolean('is_active').notNull().default(false), // * Current active session
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		// * Indexes for common queries
		isActiveIdx: index('academic_sessions_is_active_idx').on(table.isActive),
		nameIdx: index('academic_sessions_name_idx').on(table.name)
	})
)

// * Export types
export type AcademicSession = typeof academicSessions.$inferSelect
export type NewAcademicSession = typeof academicSessions.$inferInsert
