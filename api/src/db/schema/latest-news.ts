import {
	pgTable,
	uuid,
	varchar,
	text,
	timestamp,
	integer,
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
		content2: text('content2'),
		content3: text('content3'),
		image: text('image').notNull(),
		image2: text('image2'),
		date: timestamp('date', { withTimezone: true }).notNull().defaultNow(),
		author: varchar('author', { length: 255 }),
		category: varchar('category', { length: 100 }),
		views: integer('views').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		dateIdx: index('latest_news_date_idx').on(table.date),
		categoryIdx: index('latest_news_category_idx').on(table.category)
	})
)

export const latestNewsComments = pgTable(
	'latest_news_comments',
	{
		id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
		latestNewsId: uuid('latest_news_id')
			.notNull()
			.references(() => latestNews.id, { onDelete: 'cascade' }),
		name: varchar('name', { length: 100 }).notNull(),
		comment: varchar('comment', { length: 500 }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		newsCreatedIdx: index('latest_news_comments_news_created_idx').on(
			table.latestNewsId,
			table.createdAt
		)
	})
)

export type LatestNews = typeof latestNews.$inferSelect
export type NewLatestNews = typeof latestNews.$inferInsert
export type LatestNewsComment = typeof latestNewsComments.$inferSelect
export type NewLatestNewsComment = typeof latestNewsComments.$inferInsert
