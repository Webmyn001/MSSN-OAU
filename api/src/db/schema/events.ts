import {
	pgTable,
	pgEnum,
	uuid,
	varchar,
	text,
	decimal,
	integer,
	boolean,
	timestamp,
	index
} from 'drizzle-orm/pg-core'
import { users } from './users'

// * Ticket status enum (must be defined before use)
export const ticketStatusEnum = pgEnum('ticket_status', [
	'PENDING',
	'CONFIRMED',
	'USED',
	'CANCELLED'
])

// * Events table
export const events = pgTable(
	'events',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		title: varchar('title', { length: 255 }).notNull(),
		description: text('description'),
		startDate: timestamp('start_date', { withTimezone: true }).notNull(),
		endDate: timestamp('end_date', { withTimezone: true }).notNull(),
		venue: varchar('venue', { length: 255 }),
		imageUrl: text('image_url'), // * R2 URL
		ticketPrice: decimal('ticket_price', { precision: 10, scale: 2 }).notNull().default('0'),
		maxTickets: integer('max_tickets'),
		ticketsSold: integer('tickets_sold').notNull().default(0),
		isPublic: boolean('is_public').notNull().default(true),
		createdBy: uuid('created_by')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		// * Indexes for common queries
		startDateIdx: index('events_start_date_idx').on(table.startDate),
		isPublicIdx: index('events_is_public_idx').on(table.isPublic),
		createdByIdx: index('events_created_by_idx').on(table.createdBy)
	})
)

// * Tickets table
export const tickets = pgTable(
	'tickets',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		eventId: uuid('event_id')
			.notNull()
			.references(() => events.id, { onDelete: 'cascade' }),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		ticketCode: varchar('ticket_code', { length: 50 }).notNull().unique(), // * For QR code generation
		quantity: integer('quantity').notNull().default(1),
		totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
		status: ticketStatusEnum('status').notNull().default('PENDING'),
		// * Attendee information (for tickets purchased for others)
		attendeeName: varchar('attendee_name', { length: 255 }),
		attendeeEmail: varchar('attendee_email', { length: 255 }),
		attendeePhone: varchar('attendee_phone', { length: 20 }),
		purchasedAt: timestamp('purchased_at', { withTimezone: true }),
		usedAt: timestamp('used_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		// * Composite indexes for common queries
		eventStatusIdx: index('tickets_event_status_idx').on(table.eventId, table.status),
		userStatusIdx: index('tickets_user_status_idx').on(table.userId, table.status),
		ticketCodeIdx: index('tickets_ticket_code_idx').on(table.ticketCode)
	})
)

// * Export types
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type Ticket = typeof tickets.$inferSelect
export type NewTicket = typeof tickets.$inferInsert
