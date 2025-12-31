import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core'
import { users } from './users.js'

// * Articles table
export const articles = pgTable(
	'article',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		title: varchar('title', { length: 255 }).notNull(),
		slug: varchar('slug', { length: 255 }).notNull().unique(),
		content: text('content').notNull(),
		excerpt: text('excerpt'),
		featuredImageUrl: text('featured_image_url'), // * R2 URL
		tags: jsonb('tags').$type<string[]>(),
		category: varchar('category', { length: 100 }),
		isPublished: boolean('is_published').notNull().default(false),
		publishedAt: timestamp('published_at', { withTimezone: true }),
		viewCount: integer('view_count').notNull().default(0),
		createdBy: uuid('created_by')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		// * Indexes for search and filtering
		slugIdx: index('articles_slug_idx').on(table.slug),
		categoryIdx: index('articles_category_idx').on(table.category),
		publishedIdx: index('articles_published_idx').on(table.isPublished, table.publishedAt),
		// * Full-text search indexes will be created via migration (pg_trgm)
		titleIdx: index('articles_title_idx').on(table.title),
		contentIdx: index('articles_content_idx').on(table.content)
	})
)

// * Export types
export type Article = typeof articles.$inferSelect
export type NewArticle = typeof articles.$inferInsert
