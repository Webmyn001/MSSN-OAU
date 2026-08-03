import {
	pgTable,
	uuid,
	varchar,
	text,
	timestamp,
	jsonb,
	index
} from 'drizzle-orm/pg-core'

export const programmes = pgTable(
	'programmes',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		title: varchar('title', { length: 255 }).notNull(),
		text: varchar('text', { length: 500 }),
		summary: text('summary'),
		description: text('description'),
		image: text('image'),
		schedule: jsonb('schedule').$type<{ day: string; time: string; location?: string }[]>().default([]),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		titleIdx: index('programmes_title_idx').on(table.title)
	})
)

export type Programme = typeof programmes.$inferSelect
export type NewProgramme = typeof programmes.$inferInsert
