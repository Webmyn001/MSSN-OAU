import {
	pgTable,
	uuid,
	varchar,
	text,
	timestamp,
	index
} from 'drizzle-orm/pg-core'

export const latestNews = pgTable(
	'latest_news',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		title: varchar('title', { length: 255 }).notNull(),
		summary: text('summary').notNull(),
		content: text('content'),
		image: text('image').notNull(),
		image2: text('image2'),
		date: timestamp('date', { withTimezone: true }).notNull().defaultNow(),
		author: varchar('author', { length: 255 }),
		category: varchar('category', { length: 100 }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		dateIdx: index('latest_news_date_idx').on(table.date),
		categoryIdx: index('latest_news_category_idx').on(table.category)
	})
)

export type LatestNews = typeof latestNews.$inferSelect
export type NewLatestNews = typeof latestNews.$inferInsert
