import { pgTable, uuid, decimal, timestamp, varchar, index } from 'drizzle-orm/pg-core'
import { users } from './users.js'
import { academicSessions } from './sessions.js'

// * Dues payments per academic session
// * Tracks which users have paid dues for which academic sessions
export const duesPayments = pgTable(
	'dues_payments',
	{
	id: uuid('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	sessionId: uuid('session_id')
		.notNull()
		.references(() => academicSessions.id, { onDelete: 'restrict' }),
	amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
	paymentReference: varchar('payment_reference', { length: 100 }), // * Paystack reference
	paidAt: timestamp('paid_at', { withTimezone: true }).notNull().defaultNow(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		// * Composite index for checking if user has paid for a session
		userSessionIdx: index('dues_payments_user_session_idx').on(table.userId, table.sessionId),
		sessionIdx: index('dues_payments_session_idx').on(table.sessionId),
		paymentRefIdx: index('dues_payments_payment_ref_idx').on(table.paymentReference)
	})
)

// * Export types
export type DuesPayment = typeof duesPayments.$inferSelect
export type NewDuesPayment = typeof duesPayments.$inferInsert
