import {
	pgTable,
	uuid,
	varchar,
	boolean,
	timestamp,
	index
} from 'drizzle-orm/pg-core'

// * Newsletter subscribers table
export const newsletterSubscribers = pgTable(
	'newsletter_subscribers',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		email: varchar('email', { length: 255 }).notNull().unique(),
		name: varchar('name', { length: 255 }),
		isActive: boolean('is_active').notNull().default(true),
		subscribedAt: timestamp('subscribed_at', { withTimezone: true }).notNull().defaultNow(),
		unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true })
	},
	table => ({
		emailIdx: index('newsletter_subscribers_email_idx').on(table.email),
		isActiveIdx: index('newsletter_subscribers_is_active_idx').on(table.isActive)
	})
)

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect
export type NewNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert
