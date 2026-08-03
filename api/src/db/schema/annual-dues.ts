import { pgTable, uuid, decimal, timestamp, varchar, index, text } from 'drizzle-orm/pg-core'
import { pgEnum } from 'drizzle-orm/pg-core'

export const annualDuesStatusEnum = pgEnum('annual_dues_status', [
	'PENDING',
	'COMPLETED',
	'FAILED',
	'CANCELLED'
])

// * Public annual dues payments — stores student info + payment details
// * Separate from dues_payments (which requires a registered user account)
export const annualDuesPayments = pgTable(
	'annual_dues_payments',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		// * Student info
		fullName: varchar('full_name', { length: 255 }).notNull(),
		email: varchar('email', { length: 255 }).notNull(),
		department: varchar('department', { length: 255 }).notNull(),
		faculty: varchar('faculty', { length: 255 }).notNull(),
		level: varchar('level', { length: 50 }).notNull(),
		// * Payment info
		amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
		sessionName: varchar('session_name', { length: 20 }).notNull(), // e.g. "2024/2025"
		paymentReference: varchar('payment_reference', { length: 100 }).notNull(),
		status: annualDuesStatusEnum('status').notNull().default('PENDING'),
		receiptNumber: varchar('receipt_number', { length: 50 }).notNull(), // unique receipt id
		paystackAccessCode: varchar('paystack_access_code', { length: 100 }),
		paidAt: timestamp('paid_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		emailIdx: index('annual_dues_email_idx').on(table.email),
		statusIdx: index('annual_dues_status_idx').on(table.status),
		paymentRefIdx: index('annual_dues_payment_ref_idx').on(table.paymentReference),
		receiptIdx: index('annual_dues_receipt_idx').on(table.receiptNumber),
		sessionIdx: index('annual_dues_session_idx').on(table.sessionName),
		createdAtIdx: index('annual_dues_created_at_idx').on(table.createdAt)
	})
)

// * Export types
export type AnnualDuesPayment = typeof annualDuesPayments.$inferSelect
export type NewAnnualDuesPayment = typeof annualDuesPayments.$inferInsert
