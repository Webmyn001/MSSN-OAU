import { pgTable, pgEnum, uuid, varchar, text, decimal, timestamp, index } from 'drizzle-orm/pg-core'

// * Email status enum
export const emailStatusEnum = pgEnum('email_status', ['PENDING', 'SENT', 'FAILED', 'BOUNCED'])

// * SMS status enum
export const smsStatusEnum = pgEnum('sms_status', ['PENDING', 'SENT', 'FAILED', 'DELIVERED'])

// * Email logs table
export const emailLogs = pgTable(
	'email_logs',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		recipientEmail: varchar('recipient_email', { length: 255 }).notNull(),
		subject: varchar('subject', { length: 500 }),
		templateName: varchar('template_name', { length: 100 }),
		status: emailStatusEnum('status').notNull().default('PENDING'),
		errorMessage: text('error_message'),
		sentAt: timestamp('sent_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		recipientIdx: index('email_logs_recipient_idx').on(table.recipientEmail),
		statusIdx: index('email_logs_status_idx').on(table.status),
		createdAtIdx: index('email_logs_created_at_idx').on(table.createdAt)
	})
)

// * SMS logs table
export const smsLogs = pgTable(
	'sms_logs',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		recipientPhone: varchar('recipient_phone', { length: 20 }).notNull(),
		message: text('message').notNull(),
		status: smsStatusEnum('status').notNull().default('PENDING'),
		errorMessage: text('error_message'),
		cost: decimal('cost', { precision: 10, scale: 2 }),
		sentAt: timestamp('sent_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		recipientIdx: index('sms_logs_recipient_idx').on(table.recipientPhone),
		statusIdx: index('sms_logs_status_idx').on(table.status),
		createdAtIdx: index('sms_logs_created_at_idx').on(table.createdAt)
	})
)

// * Export types
export type EmailLog = typeof emailLogs.$inferSelect
export type NewEmailLog = typeof emailLogs.$inferInsert
export type SmsLog = typeof smsLogs.$inferSelect
export type NewSmsLog = typeof smsLogs.$inferInsert
