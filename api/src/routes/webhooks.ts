import { Hono } from 'hono'
import { successResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { getDuesPaymentByReference, updateDuesPayment, createDuesPayment } from '../services/dues'
import { getAnnualDuesPaymentByReference, updateAnnualDuesPayment } from '../services/annual-dues'
import { db } from '../lib/db'
import { events, tickets } from '../db/schema'
import { eq } from 'drizzle-orm'

const webhooksRoute = new Hono()

// * POST /webhooks/paystack - Paystack webhook handler
webhooksRoute.post('/paystack', async c => {
	try {
		const body = await c.req.json()
		const { event, data } = body

		logger.info({ event, reference: data?.reference }, 'Paystack webhook received')

		if (event === 'charge.success') {
			const { reference, amount, metadata } = data
			const paymentType = metadata?.type // "dues" or "event_ticket"

			// ── Event Ticket Payment ──────────────────────────────────────────
			if (paymentType === 'event_ticket') {
				const ticketId = metadata?.ticketId
				if (ticketId) {
					const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId))
					if (ticket && ticket.status === 'PENDING') {
						const [updated] = await db
							.update(tickets)
							.set({ status: 'CONFIRMED', purchasedAt: new Date(), updatedAt: new Date() })
							.where(eq(tickets.id, ticketId))
							.returning()

						// * Increment ticketsSold on the event
						const [eventRow] = await db.select().from(events).where(eq(events.id, updated.eventId))
						if (eventRow) {
							await db
								.update(events)
								.set({ ticketsSold: (eventRow.ticketsSold ?? 0) + Number(updated.quantity), updatedAt: new Date() })
								.where(eq(events.id, updated.eventId))
						}

						logger.info({ ticketId, eventId: updated.eventId, reference }, 'Event ticket payment confirmed via webhook')
					} else {
						logger.info({ ticketId, status: ticket?.status }, 'Ticket already processed or not found')
					}
				}
				return successResponse(c, { message: 'Event payment processed' })
			}

			// ── Dues Payment ──────────────────────────────────────────────────
			const existingPayment = await getDuesPaymentByReference(reference)
			if (existingPayment && existingPayment.paidAt) {
				return successResponse(c, { message: 'Payment already processed' })
			}

			const userId = metadata?.userId
			const sessionId = metadata?.sessionId

			if (paymentType === 'dues' && userId && sessionId) {
				if (existingPayment) {
					await updateDuesPayment(reference, {
						paidAt: new Date(),
						amount: amount.toString()
					})
				} else {
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

			// ── Annual Dues Payment (public, no user account required) ──────
			if (paymentType === 'annual_dues') {
				const existingAnnualPayment = await getAnnualDuesPaymentByReference(reference)
				if (existingAnnualPayment && existingAnnualPayment.status === 'COMPLETED') {
					return successResponse(c, { message: 'Annual dues payment already processed' })
				}

				await updateAnnualDuesPayment(reference, {
					status: 'COMPLETED',
					paidAt: new Date()
				})
				logger.info({ reference }, 'Annual dues payment processed via webhook')
			}
		} else if (event === 'charge.failed') {
			const { reference } = data
			logger.warn({ reference }, 'Payment failed')
		}

		return successResponse(c, { message: 'Webhook processed' })
	} catch (error) {
		logger.error({ error }, 'Webhook processing failed')
		return successResponse(c, { message: 'Webhook received' })
	}
})

export default webhooksRoute
