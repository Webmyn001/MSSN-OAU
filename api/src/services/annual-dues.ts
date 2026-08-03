import { eq, desc, like, or, and, sql } from 'drizzle-orm'
import { db } from '../lib/db'
import {
	annualDuesPayments,
	type AnnualDuesPayment,
	type NewAnnualDuesPayment
} from '../db/schema/annual-dues'
import { logger } from '../lib/logger'

const DUES_AMOUNT = 3000
const CURRENT_SESSION = '2024/2025'

/**
 * Generate a unique receipt number: MSSN-AD-YYYYMMDD-XXXX
 */
function generateReceiptNumber(): string {
	const now = new Date()
	const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
	const randomPart = Math.floor(1000 + Math.random() * 9000)
	return `MSSN-AD-${datePart}-${randomPart}`
}

/**
 * Generate a unique payment reference for Paystack
 */
export function generatePaymentReference(): string {
	const timestamp = Date.now().toString(36).toUpperCase()
	const random = Math.floor(1000 + Math.random() * 9000).toString(36).toUpperCase()
	return `AD-${timestamp}-${random}`
}

/**
 * Create a new annual dues payment record (PENDING status)
 */
export async function createAnnualDuesPayment(
	data: Omit<NewAnnualDuesPayment, 'receiptNumber' | 'sessionName' | 'amount'>
): Promise<AnnualDuesPayment> {
	const receiptNumber = generateReceiptNumber()

	const [payment] = await db
		.insert(annualDuesPayments)
		.values({
			...data,
			amount: String(DUES_AMOUNT),
			sessionName: CURRENT_SESSION,
			receiptNumber,
			status: 'PENDING'
		})
		.returning()

	logger.info(
		{ paymentId: payment.id, receiptNumber, email: data.email },
		'Annual dues payment record created'
	)
	return payment
}

/**
 * Update a payment record after Paystack verification
 */
export async function updateAnnualDuesPayment(
	paymentReference: string,
	updates: Partial<AnnualDuesPayment>
): Promise<AnnualDuesPayment | null> {
	const [payment] = await db
		.update(annualDuesPayments)
		.set({ ...updates, updatedAt: new Date() })
		.where(eq(annualDuesPayments.paymentReference, paymentReference))
		.returning()

	if (payment) {
		logger.info({ paymentReference, status: payment.status }, 'Annual dues payment updated')
	}
	return payment || null
}

/**
 * Get a payment by reference
 */
export async function getAnnualDuesPaymentByReference(
	paymentReference: string
): Promise<AnnualDuesPayment | null> {
	const [payment] = await db
		.select()
		.from(annualDuesPayments)
		.where(eq(annualDuesPayments.paymentReference, paymentReference))
		.limit(1)

	return payment || null
}

/**
 * Get a payment by receipt number
 */
export async function getAnnualDuesPaymentByReceipt(
	receiptNumber: string
): Promise<AnnualDuesPayment | null> {
	const [payment] = await db
		.select()
		.from(annualDuesPayments)
		.where(eq(annualDuesPayments.receiptNumber, receiptNumber))
		.limit(1)

	return payment || null
}

/**
 * Get a payment by ID
 */
export async function getAnnualDuesPaymentById(
	id: string
): Promise<AnnualDuesPayment | null> {
	const [payment] = await db
		.select()
		.from(annualDuesPayments)
		.where(eq(annualDuesPayments.id, id))
		.limit(1)

	return payment || null
}

/**
 * List all payments with optional search/filter
 */
export async function listAnnualDuesPayments(options: {
	page?: number
	limit?: number
	search?: string
	status?: string
	sessionName?: string
} = {}): Promise<{ payments: AnnualDuesPayment[]; total: number }> {
	const { page = 1, limit = 50, search, status, sessionName } = options
	const offset = (page - 1) * limit

	const conditions = []

	if (status) {
		conditions.push(eq(annualDuesPayments.status, status as 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'))
	}

	if (sessionName) {
		conditions.push(eq(annualDuesPayments.sessionName, sessionName))
	}

	if (search) {
		const searchPattern = `%${search}%`
		conditions.push(
			or(
				like(annualDuesPayments.fullName, searchPattern),
				like(annualDuesPayments.email, searchPattern),
				like(annualDuesPayments.department, searchPattern),
				like(annualDuesPayments.faculty, searchPattern),
				like(annualDuesPayments.level, searchPattern),
				like(annualDuesPayments.receiptNumber, searchPattern),
				like(annualDuesPayments.paymentReference, searchPattern)
			)
		)
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined

	const [payments, countResult] = await Promise.all([
		db
			.select()
			.from(annualDuesPayments)
			.where(whereClause)
			.orderBy(desc(annualDuesPayments.createdAt))
			.limit(limit)
			.offset(offset),
		db
			.select({ count: sql<number>`count(*)::int` })
			.from(annualDuesPayments)
			.where(whereClause)
	])

	return {
		payments,
		total: Number(countResult[0]?.count ?? 0)
	}
}

/**
 * Get payment statistics
 */
export async function getAnnualDuesStats(): Promise<{
	total: number
	completed: number
	pending: number
	failed: number
	totalAmount: number
}> {
	const [stats] = await db
		.select({
			total: sql<number>`count(*)::int`,
			completed: sql<number>`count(*) filter (where status = 'COMPLETED')::int`,
			pending: sql<number>`count(*) filter (where status = 'PENDING')::int`,
			failed: sql<number>`count(*) filter (where status = 'FAILED' or status = 'CANCELLED')::int`,
			totalAmount: sql<number>`coalesce(sum(case when status = 'COMPLETED' then amount::numeric else 0 end), 0)::numeric`
		})
		.from(annualDuesPayments)

	return {
		total: Number(stats?.total ?? 0),
		completed: Number(stats?.completed ?? 0),
		pending: Number(stats?.pending ?? 0),
		failed: Number(stats?.failed ?? 0),
		totalAmount: Number(stats?.totalAmount ?? 0)
	}
}

/**
 * Delete a payment record by ID
 */
export async function deleteAnnualDuesPayment(id: string): Promise<boolean> {
	const deleted = await db
		.delete(annualDuesPayments)
		.where(eq(annualDuesPayments.id, id))
		.returning({ id: annualDuesPayments.id })

	if (deleted.length > 0) {
		logger.info({ paymentId: id }, 'Annual dues payment deleted')
		return true
	}
	return false
}

export { DUES_AMOUNT, CURRENT_SESSION }
