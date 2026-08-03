import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { db } from '../lib/db'
import env from '../lib/env'
import { events, tickets } from '../db/schema'
import { eq, desc, count, and } from 'drizzle-orm'

const publicEventsRoute = new Hono()

// ─── GET /public/events/config ────────────────────────────────────────────────
publicEventsRoute.get('/config', c => {
	return successResponse(c, {
		cloudName: env.CLOUDINARY_CLOUD_NAME,
		uploadPreset: env.CLOUDINARY_UPLOAD_PRESET
	})
})

// ─── GET /public/events/config/cloudinary (kept for legacy) ───────────────────
publicEventsRoute.get('/config/cloudinary', c => {
	return successResponse(c, {
		cloudName: env.CLOUDINARY_CLOUD_NAME,
		uploadPreset: env.CLOUDINARY_UPLOAD_PRESET
	})
})

// ─── GET /public/events ──────────────────────────────────────────────────────
publicEventsRoute.get('/', async c => {
	try {
		const allEvents = await db
			.select()
			.from(events)
			.where(eq(events.isPublic, true))
			.orderBy(desc(events.startDate))

		return successResponse(c, { events: allEvents })
	} catch (error) {
		logger.error({ error }, 'Failed to fetch public events')
		return errorResponse(c, 'Failed to fetch events', 'FETCH_ERROR', 500)
	}
})

// ─── GET /public/events/admin ─────────────────────────────────────────────────
publicEventsRoute.get('/admin', async c => {
	try {
		const allEvents = await db.select().from(events).orderBy(desc(events.startDate))

		const enriched = await Promise.all(
			allEvents.map(async event => {
				const [stats] = await db
					.select({ total: count() })
					.from(tickets)
					.where(eq(tickets.eventId, event.id))

				const [confirmed] = await db
					.select({ total: count() })
					.from(tickets)
					.where(and(eq(tickets.eventId, event.id), eq(tickets.status, 'CONFIRMED')))

				const [checkedIn] = await db
					.select({ total: count() })
					.from(tickets)
					.where(and(eq(tickets.eventId, event.id), eq(tickets.status, 'USED')))

				return {
					...event,
					stats: {
						totalRegistered: Number(stats?.total ?? 0),
						confirmed: Number(confirmed?.total ?? 0),
						checkedIn: Number(checkedIn?.total ?? 0),
					}
				}
			})
		)

		return successResponse(c, { events: enriched })
	} catch (error) {
		logger.error({ error }, 'Failed to fetch admin events')
		return errorResponse(c, 'Failed to fetch events', 'FETCH_ERROR', 500)
	}
})

// ─── GET /public/events/:id ───────────────────────────────────────────────────
publicEventsRoute.get('/:id', async c => {
	try {
		const id = c.req.param('id')
		const [event] = await db.select().from(events).where(eq(events.id, id))

		if (!event) {
			return errorResponse(c, 'Event not found', 'NOT_FOUND', 404)
		}

		return successResponse(c, { event })
	} catch (error) {
		logger.error({ error }, 'Failed to fetch event')
		return errorResponse(c, 'Failed to fetch event', 'FETCH_ERROR', 500)
	}
})

// ─── POST /public/events ──────────────────────────────────────────────────────
publicEventsRoute.post('/', async c => {
	try {
		const body = await c.req.json()

		const {
			title,
			description,
			startDate,
			endDate,
			venue,
			imageUrl,
			maxTickets,
			isPublic = true,
		} = body

		if (!title || !startDate || !endDate) {
			return errorResponse(c, 'title, startDate, and endDate are required', 'VALIDATION_ERROR', 400)
		}

		const [newEvent] = await db
			.insert(events)
			.values({
				title,
				description: description || null,
				startDate: new Date(startDate),
				endDate: new Date(endDate),
				venue: venue || null,
				imageUrl: imageUrl || null,
				ticketPrice: '0',
				maxTickets: maxTickets ? Number(maxTickets) : null,
				isPublic: Boolean(isPublic),
			})
			.returning()

		logger.info({ eventId: newEvent.id }, 'Event created')
		return successResponse(c, { event: newEvent, message: 'Event created successfully' }, undefined, 201)
	} catch (error) {
		logger.error({ error }, 'Failed to create event')
		return errorResponse(c, 'Failed to create event', 'CREATE_ERROR', 500)
	}
})

// ─── PUT /public/events/:id ───────────────────────────────────────────────────
publicEventsRoute.put('/:id', async c => {
	try {
		const id = c.req.param('id')
		const body = await c.req.json()

		const [existing] = await db.select().from(events).where(eq(events.id, id))
		if (!existing) {
			return errorResponse(c, 'Event not found', 'NOT_FOUND', 404)
		}

		const updateData: Record<string, unknown> = {
			updatedAt: new Date(),
		}

		if (body.title !== undefined) updateData.title = body.title
		if (body.description !== undefined) updateData.description = body.description
		if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate)
		if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate)
		if (body.venue !== undefined) updateData.venue = body.venue
		if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
		if (body.maxTickets !== undefined) updateData.maxTickets = body.maxTickets ? Number(body.maxTickets) : null
		if (body.isPublic !== undefined) updateData.isPublic = Boolean(body.isPublic)

		const [updated] = await db
			.update(events)
			.set(updateData)
			.where(eq(events.id, id))
			.returning()

		logger.info({ eventId: id }, 'Event updated')
		return successResponse(c, { event: updated, message: 'Event updated successfully' })
	} catch (error) {
		logger.error({ error }, 'Failed to update event')
		return errorResponse(c, 'Failed to update event', 'UPDATE_ERROR', 500)
	}
})

// ─── DELETE /public/events/:id ────────────────────────────────────────────────
publicEventsRoute.delete('/:id', async c => {
	try {
		const id = c.req.param('id')

		const [existing] = await db.select().from(events).where(eq(events.id, id))
		if (!existing) {
			return errorResponse(c, 'Event not found', 'NOT_FOUND', 404)
		}

		await db.delete(events).where(eq(events.id, id))
		logger.info({ eventId: id }, 'Event deleted')
		return successResponse(c, { message: 'Event deleted successfully' })
	} catch (error) {
		logger.error({ error }, 'Failed to delete event')
		return errorResponse(c, 'Failed to delete event', 'DELETE_ERROR', 500)
	}
})

// ─── GET /public/events/:id/attendees ─────────────────────────────────────────
publicEventsRoute.get('/:id/attendees', async c => {
	try {
		const eventId = c.req.param('id')

		const [event] = await db.select().from(events).where(eq(events.id, eventId))
		if (!event) {
			return errorResponse(c, 'Event not found', 'NOT_FOUND', 404)
		}

		const attendees = await db
			.select()
			.from(tickets)
			.where(eq(tickets.eventId, eventId))
			.orderBy(desc(tickets.createdAt))

		return successResponse(c, { attendees, event })
	} catch (error) {
		logger.error({ error }, 'Failed to fetch attendees')
		return errorResponse(c, 'Failed to fetch attendees', 'FETCH_ERROR', 500)
	}
})

// ─── POST /public/events/:id/register ─────────────────────────────────────────
// All events are free — register directly, no payment needed
publicEventsRoute.post('/:id/register', async c => {
	try {
		const eventId = c.req.param('id')
		const body = await c.req.json()
		const { name, email, phone, quantity = 1 } = body

		if (!name || !email) {
			return errorResponse(c, 'name and email are required', 'VALIDATION_ERROR', 400)
		}

		const [event] = await db.select().from(events).where(eq(events.id, eventId))
		if (!event) {
			return errorResponse(c, 'Event not found', 'NOT_FOUND', 404)
		}

		// * Check capacity
		if (event.maxTickets !== null) {
			const [{ total }] = await db
				.select({ total: count() })
				.from(tickets)
				.where(eq(tickets.eventId, eventId))
			if (Number(total) + quantity > event.maxTickets) {
				return errorResponse(c, 'Event is fully booked', 'CAPACITY_EXCEEDED', 400)
			}
		}

		const ticketCode = `MSSN-${eventId.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

		const [ticket] = await db
			.insert(tickets)
			.values({
				eventId,
				ticketCode,
				quantity: Number(quantity),
				totalAmount: '0',
				status: 'CONFIRMED',
				attendeeName: name,
				attendeeEmail: email,
				attendeePhone: phone || null,
				purchasedAt: new Date(),
			})
			.returning()

		// * Update tickets sold count
		await db
			.update(events)
			.set({ ticketsSold: (event.ticketsSold ?? 0) + Number(quantity), updatedAt: new Date() })
			.where(eq(events.id, eventId))

		logger.info({ ticketId: ticket.id, eventId }, 'Registration successful')
		return successResponse(
			c,
			{ ticket, message: 'Registration successful! Your spot is confirmed.' },
			undefined,
			201
		)
	} catch (error) {
		logger.error({ error }, 'Failed to register for event')
		return errorResponse(c, 'Failed to register', 'REGISTER_ERROR', 500)
	}
})

// ─── PATCH /public/events/:id/attendees/:ticketId ─────────────────────────────
publicEventsRoute.patch('/:id/attendees/:ticketId', async c => {
	try {
		const { id: eventId, ticketId } = c.req.param()
		const body = await c.req.json()
		const { status } = body

		if (!status || !['CONFIRMED', 'USED', 'CANCELLED'].includes(status)) {
			return errorResponse(c, 'Valid status is required: CONFIRMED, USED, CANCELLED', 'VALIDATION_ERROR', 400)
		}

		const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId))
		if (!ticket || ticket.eventId !== eventId) {
			return errorResponse(c, 'Ticket not found', 'NOT_FOUND', 404)
		}

		const updateData: Record<string, unknown> = {
			status,
			updatedAt: new Date(),
		}

		if (status === 'USED') {
			updateData.usedAt = new Date()
		}

		const [updated] = await db
			.update(tickets)
			.set(updateData)
			.where(eq(tickets.id, ticketId))
			.returning()

		logger.info({ ticketId, status }, 'Ticket status updated')
		return successResponse(c, { ticket: updated, message: `Status updated to ${status}` })
	} catch (error) {
		logger.error({ error }, 'Failed to update ticket status')
		return errorResponse(c, 'Failed to update status', 'UPDATE_ERROR', 500)
	}
})

// ─── DELETE /public/events/:id/attendees/:ticketId ────────────────────────────
publicEventsRoute.delete('/:id/attendees/:ticketId', async c => {
	try {
		const { id: eventId, ticketId } = c.req.param()

		const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId))
		if (!ticket || ticket.eventId !== eventId) {
			return errorResponse(c, 'Ticket not found', 'NOT_FOUND', 404)
		}

		await db.delete(tickets).where(eq(tickets.id, ticketId))
		logger.info({ ticketId }, 'Ticket deleted')
		return successResponse(c, { message: 'Registration removed' })
	} catch (error) {
		logger.error({ error }, 'Failed to delete ticket')
		return errorResponse(c, 'Failed to delete registration', 'DELETE_ERROR', 500)
	}
})

export default publicEventsRoute
