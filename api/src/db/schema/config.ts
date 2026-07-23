import { pgTable, uuid, varchar, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

// * Website configuration table
// * Using key-value approach for flexibility
export const websiteConfig = pgTable('website_config', {
	id: uuid('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	key: varchar('key', { length: 100 }).notNull().unique(),
	value: jsonb('value').notNull().$type<unknown>(),
	description: text('description'),
	updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

// * Export types
export type WebsiteConfig = typeof websiteConfig.$inferSelect
export type NewWebsiteConfig = typeof websiteConfig.$inferInsert
