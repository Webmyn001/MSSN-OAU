import { pgTable, uuid, varchar, text, timestamp, index, integer } from 'drizzle-orm/pg-core'
import { academicSessions } from './sessions'

// * Exco profiles for public display per academic session (independent of user accounts)
export const excoProfiles = pgTable(
	'exco_profiles',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		sessionId: uuid('session_id')
			.notNull()
			.references(() => academicSessions.id, { onDelete: 'cascade' }),
		committee: varchar('committee', { length: 150 }).notNull().default('Executive Council'),
		name: varchar('name', { length: 255 }).notNull(),
		position: varchar('position', { length: 150 }).notNull(),
		gender: varchar('gender', { length: 10 }).notNull().default('male'),
		phone: varchar('phone', { length: 50 }),
		email: varchar('email', { length: 255 }),
		imageUrl: text('image_url'),
		bio: text('bio'),
		displayOrder: integer('display_order').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		sessionIdx: index('exco_profiles_session_idx').on(table.sessionId),
		committeeIdx: index('exco_profiles_committee_idx').on(table.committee)
	})
)

export type ExcoProfile = typeof excoProfiles.$inferSelect
export type NewExcoProfile = typeof excoProfiles.$inferInsert
