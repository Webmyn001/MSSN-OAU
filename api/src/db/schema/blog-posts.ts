import {
	pgTable,
	uuid,
	varchar,
	text,
	boolean,
	timestamp,
	index,
	bigint
} from 'drizzle-orm/pg-core'

export const blogPosts = pgTable(
	'blog_posts',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		wpId: bigint('wp_id', { mode: 'number' }).notNull().unique(),
		title: text('title').notNull(),
		excerpt: text('excerpt'),
		content: text('content'),
		link: text('link').notNull(),
		slug: varchar('slug', { length: 255 }).notNull(),
		featuredImage: text('featured_image'),
		authorName: varchar('author_name', { length: 255 }),
		authorAvatar: text('author_avatar'),
		categories: text('categories'),
		tags: text('tags'),
		wpDate: timestamp('wp_date', { withTimezone: true }).notNull(),
		wpModified: timestamp('wp_modified', { withTimezone: true }),
		approved: boolean('approved').notNull().default(false),
		approvedAt: timestamp('approved_at', { withTimezone: true }),
		syncedAt: timestamp('synced_at', { withTimezone: true }).notNull().defaultNow(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		wpIdIdx: index('blog_posts_wp_id_idx').on(table.wpId),
		approvedIdx: index('blog_posts_approved_idx').on(table.approved),
		slugIdx: index('blog_posts_slug_idx').on(table.slug)
	})
)

export type BlogPost = typeof blogPosts.$inferSelect
export type NewBlogPost = typeof blogPosts.$inferInsert
