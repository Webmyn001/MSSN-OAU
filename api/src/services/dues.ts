import { eq, and } from 'drizzle-orm'
import { db } from '../lib/db'
import { duesPayments, type DuesPayment, type NewDuesPayment } from '../db/schema/dues'
import { logger } from '../lib/logger'

/**
 * * Checks if a user has paid dues for a specific academic session
 * @param userId - User ID
 * @param sessionId - Academic session ID
 * @returns True if user has paid, false otherwise
 */
export async function hasPaidDues(userId: string, sessionId: string): Promise<boolean> {
	try {
		const [payment] = await db
			.select()
			.from(duesPayments)
			.where(and(eq(duesPayments.userId, userId), eq(duesPayments.sessionId, sessionId)))
			.limit(1)

		return !!payment
	} catch (error) {
		logger.error({ error, userId, sessionId }, 'Failed to check dues payment')
		return false
	}
}

/**
 * * Gets a dues payment by payment reference
 * @param paymentReference - Paystack payment reference
 * @returns Payment record or null
 */
export async function getDuesPaymentByReference(
	paymentReference: string
): Promise<DuesPayment | null> {
	try {
		const [payment] = await db
			.select()
			.from(duesPayments)
			.where(eq(duesPayments.paymentReference, paymentReference))
			.limit(1)

		return payment || null
	} catch (error) {
		logger.error({ error, paymentReference }, 'Failed to get dues payment by reference')
		return null
	}
}

/**
 * * Creates a new dues payment record
 * @param paymentData - Payment data
 * @returns Created payment record
 */
export async function createDuesPayment(paymentData: NewDuesPayment): Promise<DuesPayment> {
	try {
		const [payment] = await db.insert(duesPayments).values(paymentData).returning()
		logger.info(
			{ paymentId: payment.id, userId: payment.userId, sessionId: payment.sessionId },
			'Dues payment created'
		)
		return payment
	} catch (error) {
		logger.error({ error, paymentData }, 'Failed to create dues payment')
		throw error
	}
}

/**
 * * Updates a dues payment record
 * @param paymentReference - Payment reference
 * @param updates - Fields to update
 * @returns Updated payment record or null
 */
export async function updateDuesPayment(
	paymentReference: string,
	updates: Partial<DuesPayment>
): Promise<DuesPayment | null> {
	try {
		const [payment] = await db
			.update(duesPayments)
			.set(updates)
			.where(eq(duesPayments.paymentReference, paymentReference))
			.returning()

		if (payment) {
			logger.info({ paymentReference }, 'Dues payment updated')
		}
		return payment || null
	} catch (error) {
		logger.error({ error, paymentReference }, 'Failed to update dues payment')
		return null
	}
}
