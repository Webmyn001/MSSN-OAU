import { Hono } from 'hono'
import { successResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { getDuesPaymentByReference, updateDuesPayment, createDuesPayment } from '../services/dues'

const webhooksRoute = new Hono()

// * POST /webhooks/paystack - Paystack webhook handler
webhooksRoute.post('/paystack', async c => {
	try {
		// * TODO: Verify webhook signature
		// * For now, accept all requests (should verify in production)

		const body = await c.req.json()
		const { event, data } = body

		logger.info({ event, reference: data?.reference }, 'Paystack webhook received')

		// * Handle different event types
		if (event === 'charge.success') {
			const { reference, amount, metadata } = data

			// * Check if payment already processed
			const existingPayment = await getDuesPaymentByReference(reference)
			if (existingPayment && existingPayment.paidAt) {
				// * Already processed - idempotent
				return successResponse(c, { message: 'Payment already processed' })
			}

			// * Extract metadata
			const userId = metadata?.userId
			const sessionId = metadata?.sessionId
			const paymentType = metadata?.type // * "dues" or other types

			if (paymentType === 'dues' && userId && sessionId) {
				// * Create or update dues payment record
				if (existingPayment) {
					// * Update existing pending payment
					await updateDuesPayment(reference, {
						paidAt: new Date(),
						amount: amount.toString()
					})
				} else {
					// * Create new payment record
					await createDuesPayment({
						userId,
						sessionId,
						amount: amount.toString(),
						paymentReference: reference,
						paidAt: new Date()
					})
				}

				logger.info({ reference, userId, sessionId }, 'Dues payment processed')
			}
		} else if (event === 'charge.failed') {
			const { reference } = data
			logger.warn({ reference }, 'Payment failed')
			// * Could update payment status to failed if needed
		}

		// * Always return 200 to Paystack
		return successResponse(c, { message: 'Webhook processed' })
	} catch (error) {
		logger.error({ error }, 'Webhook processing failed')
		// * Still return 200 to prevent Paystack from retrying
		return successResponse(c, { message: 'Webhook received' })
	}
})

export default webhooksRoute
