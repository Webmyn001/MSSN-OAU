import { Hono } from 'hono'
import { z } from 'zod'
import { successResponse, errorResponse, paginatedResponse } from '../lib/response'
import { logger } from '../lib/logger'
import env from '../lib/env'
import {
	createAnnualDuesPayment,
	generatePaymentReference,
	getAnnualDuesPaymentByReference,
	getAnnualDuesPaymentByReceipt,
	getAnnualDuesPaymentById,
	updateAnnualDuesPayment,
	listAnnualDuesPayments,
	getAnnualDuesStats,
	deleteAnnualDuesPayment,
	DUES_AMOUNT,
	CURRENT_SESSION
} from '../services/annual-dues'
import { initializePayment as initPaystackPayment, verifyPayment as verifyPaystackPayment } from '../services/paystack'

const publicAnnualDuesRoute = new Hono()

// * Validation schema for payment initiation
const initiatePaymentSchema = z.object({
	fullName: z.string().min(2, 'Full name is required').max(255),
	email: z.string().email('Valid email is required'),
	department: z.string().min(1, 'Department is required').max(255),
	faculty: z.string().min(1, 'Faculty is required').max(255),
	level: z.string().min(1, 'Level is required').max(50)
})

// ─── GET /public/annual-dues/config ──────────────────────────────────────────
// Return Paystack public key and current session/amount info
publicAnnualDuesRoute.get('/config', c => {
	return successResponse(c, {
		paystackPublicKey: env.PAYSTACK_PUBLIC_KEY,
		amount: DUES_AMOUNT,
		sessionName: CURRENT_SESSION,
		currency: 'NGN'
	})
})

// ─── POST /public/annual-dues/initiate-payment ───────────────────────────────
// Create a PENDING payment record + initialize Paystack transaction
publicAnnualDuesRoute.post('/initiate-payment', async c => {
	try {
		const body = await c.req.json()
		const parsed = initiatePaymentSchema.safeParse(body)

		if (!parsed.success) {
			return errorResponse(
				c,
				parsed.error.issues.map(i => i.message).join(', '),
				'VALIDATION_ERROR',
				400
			)
		}

		const { fullName, email, department, faculty, level } = parsed.data

		// * Generate unique payment reference
		const paymentReference = generatePaymentReference()

		// * Create PENDING payment record
		const payment = await createAnnualDuesPayment({
			fullName,
			email,
			department,
			faculty,
			level,
			paymentReference,
			paystackAccessCode: null,
			paidAt: null
		})

		// * Initialize Paystack transaction
		const callbackUrl = `${env.APP_URL}/public/annual-dues/verify-payment?ref=${paymentReference}`

		const paystackResult = await initPaystackPayment({
			email,
			amount: DUES_AMOUNT,
			reference: paymentReference,
			metadata: {
				type: 'annual_dues',
				paymentId: payment.id,
				receiptNumber: payment.receiptNumber,
				studentName: fullName,
				sessionName: CURRENT_SESSION,
				department,
				faculty,
				level
			},
			callbackUrl
		})

		// * Store access code in the payment record
		await updateAnnualDuesPayment(paymentReference, {
			paystackAccessCode: paystackResult.accessCode
		})

		logger.info({ paymentId: payment.id, paymentReference }, 'Annual dues payment initiated')

		return successResponse(c, {
			paymentId: payment.id,
			receiptNumber: payment.receiptNumber,
			paymentReference,
			authorizationUrl: paystackResult.authorizationUrl,
			accessCode: paystackResult.accessCode,
			amount: DUES_AMOUNT,
			sessionName: CURRENT_SESSION,
			message: 'Payment initiated — complete payment to confirm your dues.'
		})
	} catch (error) {
		logger.error({ error }, 'Failed to initiate annual dues payment')
		return errorResponse(c, 'Failed to initiate payment. Please try again.', 'PAYMENT_ERROR', 500)
	}
})

// ─── GET /public/annual-dues/verify-payment ──────────────────────────────────
// Verify payment after Paystack redirect
publicAnnualDuesRoute.get('/verify-payment', async c => {
	try {
		const ref = c.req.query('ref')
		if (!ref) {
			return errorResponse(c, 'Payment reference is required', 'VALIDATION_ERROR', 400)
		}

		const payment = await getAnnualDuesPaymentByReference(ref)
		if (!payment) {
			return errorResponse(c, 'Payment record not found', 'NOT_FOUND', 404)
		}

		// * If already completed, return existing record
		if (payment.status === 'COMPLETED') {
			return successResponse(c, {
				paid: true,
				status: 'completed',
				payment
			})
		}

		// * Verify with Paystack
		const verification = await verifyPaystackPayment(ref)

		if (verification.paid) {
			// * Update payment record
			const updated = await updateAnnualDuesPayment(ref, {
				status: 'COMPLETED',
				paidAt: new Date()
			})

			logger.info({ paymentReference: ref, receiptNumber: payment.receiptNumber }, 'Annual dues payment confirmed')

			return successResponse(c, {
				paid: true,
				status: 'completed',
				payment: updated || payment
			})
		}

		// * Not confirmed yet — only finalise on terminal statuses, otherwise keep PENDING
		const terminalStatuses: Record<string, 'FAILED' | 'CANCELLED'> = {
			failed: 'FAILED',
			reversed: 'FAILED',
			abandoned: 'CANCELLED'
		}
		const nextStatus = terminalStatuses[verification.status]

		if (!nextStatus) {
			// * Still processing (pending/processing/attempts/unknown) — do NOT fail the record
			logger.info({ paymentReference: ref, paystackStatus: verification.status }, 'Annual dues payment awaiting confirmation')

			return successResponse(c, {
				paid: false,
				status: 'pending',
				payment
			})
		}

		// * Payment ended in a terminal failed/cancelled state
		const updated = await updateAnnualDuesPayment(ref, {
			status: nextStatus
		})

		return successResponse(c, {
			paid: false,
			status: verification.status,
			payment: updated || payment
		})
	} catch (error) {
		logger.error({ error }, 'Failed to verify annual dues payment')
		return errorResponse(c, 'Payment verification failed', 'VERIFY_ERROR', 500)
	}
})

// ─── GET /public/annual-dues/payment/:id ─────────────────────────────────────
// Get payment by ID (for receipt display)
publicAnnualDuesRoute.get('/payment/:id', async c => {
	try {
		const id = c.req.param('id')
		const payment = await getAnnualDuesPaymentById(id)

		if (!payment) {
			return errorResponse(c, 'Payment not found', 'NOT_FOUND', 404)
		}

		return successResponse(c, { payment })
	} catch (error) {
		logger.error({ error }, 'Failed to fetch payment')
		return errorResponse(c, 'Failed to fetch payment', 'FETCH_ERROR', 500)
	}
})

// ─── GET /public/annual-dues/receipt/:receiptNumber ──────────────────────────
// Get payment by receipt number (for receipt lookup)
publicAnnualDuesRoute.get('/receipt/:receiptNumber', async c => {
	try {
		const receiptNumber = c.req.param('receiptNumber')
		const payment = await getAnnualDuesPaymentByReceipt(receiptNumber)

		if (!payment) {
			return errorResponse(c, 'Receipt not found', 'NOT_FOUND', 404)
		}

		return successResponse(c, { payment })
	} catch (error) {
		logger.error({ error }, 'Failed to fetch receipt')
		return errorResponse(c, 'Failed to fetch receipt', 'FETCH_ERROR', 500)
	}
})

// ─── GET /public/annual-dues/admin/payments ──────────────────────────────────
// List all payments (for dashboard — no auth in dev)
publicAnnualDuesRoute.get('/admin/payments', async c => {
	try {
		const page = Number(c.req.query('page') || '1')
		const limit = Number(c.req.query('limit') || '50')
		const search = c.req.query('search') || undefined
		const status = c.req.query('status') || undefined
		const sessionName = c.req.query('session') || undefined

		const { payments, total } = await listAnnualDuesPayments({
			page,
			limit,
			search,
			status,
			sessionName
		})

		return paginatedResponse(c, payments, { page, limit, total })
	} catch (error) {
		logger.error({ error }, 'Failed to list annual dues payments')
		return errorResponse(c, 'Failed to fetch payments', 'FETCH_ERROR', 500)
	}
})

// ─── GET /public/annual-dues/admin/stats ─────────────────────────────────────
// Get payment statistics (for dashboard)
publicAnnualDuesRoute.get('/admin/stats', async c => {
	try {
		const stats = await getAnnualDuesStats()
		return successResponse(c, {
			...stats,
			amount: DUES_AMOUNT,
			sessionName: CURRENT_SESSION
		})
	} catch (error) {
		logger.error({ error }, 'Failed to fetch annual dues stats')
		return errorResponse(c, 'Failed to fetch stats', 'FETCH_ERROR', 500)
	}
})

// ─── DELETE /public/annual-dues/admin/payments/:id ──────────────────────────
// Delete a payment record (admin)
publicAnnualDuesRoute.delete('/admin/payments/:id', async c => {
	try {
		const id = c.req.param('id')
		const deleted = await deleteAnnualDuesPayment(id)

		if (!deleted) {
			return errorResponse(c, 'Payment not found', 'NOT_FOUND', 404)
		}

		logger.info({ paymentId: id }, 'Annual dues payment deleted via admin')

		return successResponse(c, { message: 'Payment deleted successfully' })
	} catch (error) {
		logger.error({ error }, 'Failed to delete annual dues payment')
		return errorResponse(c, 'Failed to delete payment', 'DELETE_ERROR', 500)
	}
})

export default publicAnnualDuesRoute
