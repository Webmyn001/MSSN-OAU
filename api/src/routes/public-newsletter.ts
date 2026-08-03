import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { db } from '../lib/db'
import { newsletterSubscribers } from '../db/schema'
import { eq, desc, count, and } from 'drizzle-orm'
import { sendEmailWithContent } from '../services/email/brevo'

import env from '../lib/env'

const publicNewsletterRoute = new Hono()

// Helper function to safely send email without failing HTTP handler
async function safeSendEmail(options: { to: string; subject: string; html: string }) {
	if (!env.SMTP_USER || env.SMTP_USER === 'test') {
		logger.info({ to: options.to, subject: options.subject }, 'Skipped SMTP email in dev mode (SMTP_USER not configured)')
		return
	}
	try {
		await sendEmailWithContent(options)
	} catch (err) {
		logger.error({ err, recipient: options.to }, 'Failed sending email via SMTP (Brevo)')
	}
}

// ─── POST /public/newsletter/subscribe ─────────────────────────────────────────
// Subscribe a new email to the newsletter
publicNewsletterRoute.post('/subscribe', async c => {
	try {
		const body = await c.req.json()
		const email = String(body.email || '').trim().toLowerCase()
		const name = body.name ? String(body.name).trim() : null

		if (!email || !email.includes('@')) {
			return errorResponse(c, 'Valid email address is required', 'VALIDATION_ERROR', 400)
		}

		// * Check if subscriber already exists
		const [existing] = await db
			.select()
			.from(newsletterSubscribers)
			.where(eq(newsletterSubscribers.email, email))

		if (existing) {
			if (existing.isActive) {
				return successResponse(c, {
					subscriber: existing,
					message: 'You are already subscribed to our newsletter!'
				})
			} else {
				// Reactivate subscription
				const [updated] = await db
					.update(newsletterSubscribers)
					.set({
						isActive: true,
						subscribedAt: new Date(),
						unsubscribedAt: null,
						...(name ? { name } : {})
					})
					.where(eq(newsletterSubscribers.id, existing.id))
					.returning()

				// Send Welcome Email safely
				safeSendEmail({
					to: email,
					subject: 'Welcome Back to MSSN OAU Newsletter!',
					html: `
						<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
							<div style="background-color: #047857; padding: 15px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
								MSSN OAU Newsletter
							</div>
							<div style="padding: 20px; color: #333; line-height: 1.6;">
								<p>Assalamu 'alaykum ${name || 'Dear Brother/Sister'},</p>
								<p>Welcome back to the official <strong>Muslim Students' Society of Nigeria, OAU Branch</strong> newsletter.</p>
								<p>You will receive updates on latest news, Islamic lectures, upcoming programmes, and campus announcements.</p>
								<hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
								<p style="font-size: 12px; color: #777; text-align: center;">MSSN OAU Secretariat, Obafemi Awolowo University, Ile-Ife.</p>
							</div>
						</div>
					`
				})

				return successResponse(c, {
					subscriber: updated,
					message: 'Welcome back! Your subscription has been reactivated.'
				})
			}
		}

		// Create new subscriber
		const [newSubscriber] = await db
			.insert(newsletterSubscribers)
			.values({
				email,
				name,
				isActive: true
			})
			.returning()

		logger.info({ email }, 'New newsletter subscriber registered')

		// Send Welcome Email safely
		safeSendEmail({
			to: email,
			subject: "Welcome to MSSN OAU Newsletter!",
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
					<div style="background-color: #047857; padding: 20px; text-align: center; color: white; font-size: 22px; font-weight: bold; border-radius: 6px 6px 0 0;">
						MSSN OAU Newsletter
					</div>
					<div style="padding: 24px; color: #333; line-height: 1.6;">
						<p style="font-size: 16px;">Assalamu 'alaykum ${name || 'Dear Brother/Sister'},</p>
						<p>Thank you for subscribing to the official <strong>Muslim Students' Society of Nigeria, OAU Branch</strong> newsletter!</p>
						<p>You will now receive direct email notifications whenever new articles, press releases, or event updates are published on our website.</p>
						<div style="margin: 30px 0; text-align: center;">
							<a href="https://mssnoau.org" style="background-color: #047857; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Visit Our Website</a>
						</div>
						<p>Jazakallahu Khayran,<br/><strong>MSSN OAU Editorial & Media Team</strong></p>
						<hr style="border: 0; border-top: 1px solid #eeeeee; margin: 24px 0;" />
						<p style="font-size: 12px; color: #777; text-align: center;">MSSN OAU Secretariat, Fajuyi Hall, Obafemi Awolowo University, Ile-Ife.</p>
					</div>
				</div>
			`
		})

		return successResponse(
			c,
			{
				subscriber: newSubscriber,
				message: 'Successfully subscribed to the newsletter!'
			},
			undefined,
			201
		)
	} catch (error) {
		logger.error({ error }, 'Failed to subscribe to newsletter')
		return errorResponse(c, 'Failed to process subscription', 'SUBSCRIBE_ERROR', 500)
	}
})

// ─── POST /public/newsletter/unsubscribe ───────────────────────────────────────
publicNewsletterRoute.post('/unsubscribe', async c => {
	try {
		const body = await c.req.json()
		const email = String(body.email || '').trim().toLowerCase()

		if (!email) {
			return errorResponse(c, 'Email address is required', 'VALIDATION_ERROR', 400)
		}

		const [subscriber] = await db
			.select()
			.from(newsletterSubscribers)
			.where(eq(newsletterSubscribers.email, email))

		if (!subscriber) {
			return errorResponse(c, 'Subscriber not found', 'NOT_FOUND', 404)
		}

		const [updated] = await db
			.update(newsletterSubscribers)
			.set({
				isActive: false,
				unsubscribedAt: new Date()
			})
			.where(eq(newsletterSubscribers.id, subscriber.id))
			.returning()

		logger.info({ email }, 'Newsletter subscriber unsubscribed')
		return successResponse(c, {
			subscriber: updated,
			message: 'You have been unsubscribed from our newsletter.'
		})
	} catch (error) {
		logger.error({ error }, 'Failed to unsubscribe')
		return errorResponse(c, 'Failed to process unsubscribe request', 'UNSUBSCRIBE_ERROR', 500)
	}
})

// ─── GET /public/newsletter/subscribers ──────────────────────────────────────
// Fetch all subscribers for admin dashboard
publicNewsletterRoute.get('/subscribers', async c => {
	try {
		const subscribers = await db
			.select()
			.from(newsletterSubscribers)
			.orderBy(desc(newsletterSubscribers.subscribedAt))

		const [{ total }] = await db.select({ total: count() }).from(newsletterSubscribers)
		const [{ active }] = await db
			.select({ active: count() })
			.from(newsletterSubscribers)
			.where(eq(newsletterSubscribers.isActive, true))

		const totalCount = Number(total ?? 0)
		const activeCount = Number(active ?? 0)

		return successResponse(c, {
			subscribers,
			stats: {
				total: totalCount,
				active: activeCount,
				unsubscribed: totalCount - activeCount
			}
		})
	} catch (error) {
		logger.error({ error }, 'Failed to fetch subscribers')
		return errorResponse(c, 'Failed to fetch subscribers', 'FETCH_ERROR', 500)
	}
})

// ─── DELETE /public/newsletter/subscribers/:id ───────────────────────────────
publicNewsletterRoute.delete('/subscribers/:id', async c => {
	try {
		const id = c.req.param('id')
		const [existing] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.id, id))

		if (!existing) {
			return errorResponse(c, 'Subscriber not found', 'NOT_FOUND', 404)
		}

		await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id))
		logger.info({ subscriberId: id }, 'Subscriber deleted')

		return successResponse(c, { message: 'Subscriber deleted successfully' })
	} catch (error) {
		logger.error({ error }, 'Failed to delete subscriber')
		return errorResponse(c, 'Failed to delete subscriber', 'DELETE_ERROR', 500)
	}
})

// ─── POST /public/newsletter/send ─────────────────────────────────────────────
// Broadcast custom email newsletter to all active subscribers
publicNewsletterRoute.post('/send', async c => {
	try {
		const body = await c.req.json()
		const { subject, content } = body

		if (!subject || !content) {
			return errorResponse(c, 'subject and content are required', 'VALIDATION_ERROR', 400)
		}

		const activeSubscribers = await db
			.select()
			.from(newsletterSubscribers)
			.where(eq(newsletterSubscribers.isActive, true))

		if (activeSubscribers.length === 0) {
			return errorResponse(c, 'No active subscribers found', 'NO_SUBSCRIBERS', 400)
		}

		let sentCount = 0
		let failCount = 0

		for (const sub of activeSubscribers) {
			try {
				await sendEmailWithContent({
					to: sub.email,
					subject,
					html: `
						<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
							<div style="background-color: #047857; padding: 20px; text-align: center; color: white; font-size: 22px; font-weight: bold; border-radius: 6px 6px 0 0;">
								MSSN OAU Newsletter
							</div>
							<div style="padding: 24px; color: #333; line-height: 1.6;">
								${content}
								<hr style="border: 0; border-top: 1px solid #eeeeee; margin: 24px 0;" />
								<p style="font-size: 11px; color: #777; text-align: center;">
									You are receiving this email because you subscribed to MSSN OAU updates.<br/>
									MSSN OAU Secretariat, Fajuyi Hall, Obafemi Awolowo University, Ile-Ife.
								</p>
							</div>
						</div>
					`
				})
				sentCount++
			} catch (err) {
				logger.error({ err, recipient: sub.email }, 'Failed sending broadcast email to recipient')
				failCount++
			}
		}

		logger.info({ sentCount, failCount, total: activeSubscribers.length }, 'Newsletter broadcast completed')

		return successResponse(c, {
			sentCount,
			failCount,
			total: activeSubscribers.length,
			message: `Broadcast completed. Sent to ${sentCount} subscriber(s).`
		})
	} catch (error) {
		logger.error({ error }, 'Failed to send broadcast newsletter')
		return errorResponse(c, 'Failed to broadcast newsletter', 'BROADCAST_ERROR', 500)
	}
})

// ─── POST /public/newsletter/broadcast-news ───────────────────────────────────
// Notify all subscribers whenever new news / post is published
publicNewsletterRoute.post('/broadcast-news', async c => {
	try {
		const body = await c.req.json()
		const { title, summary, url, imageUrl } = body

		if (!title || !summary) {
			return errorResponse(c, 'title and summary are required', 'VALIDATION_ERROR', 400)
		}

		const activeSubscribers = await db
			.select()
			.from(newsletterSubscribers)
			.where(eq(newsletterSubscribers.isActive, true))

		if (activeSubscribers.length === 0) {
			return errorResponse(c, 'No active subscribers found', 'NO_SUBSCRIBERS', 400)
		}

		const articleUrl = url || 'https://mssnoau.org/blog'
		const emailSubject = `📰 Latest News: ${title}`

		const emailHtml = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
				<div style="background-color: #047857; padding: 20px; text-align: center; color: white; font-size: 22px; font-weight: bold; border-radius: 6px 6px 0 0;">
					MSSN OAU - Latest News
				</div>
				<div style="padding: 24px; color: #333; line-height: 1.6;">
					${imageUrl ? `<img src="${imageUrl}" alt="${title}" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 6px; margin-bottom: 20px;" />` : ''}
					<h2 style="color: #047857; margin-top: 0;">${title}</h2>
					<p style="font-size: 15px; color: #444;">${summary}</p>
					<div style="margin: 28px 0; text-align: center;">
						<a href="${articleUrl}" style="background-color: #047857; color: white; text-decoration: none; padding: 12px 26px; border-radius: 6px; font-weight: bold; display: inline-block;">Read Full Article</a>
					</div>
					<hr style="border: 0; border-top: 1px solid #eeeeee; margin: 24px 0;" />
					<p style="font-size: 11px; color: #777; text-align: center;">
						You are receiving this notification as a subscriber of MSSN OAU News.<br/>
						MSSN OAU Secretariat, Obafemi Awolowo University, Ile-Ife.
					</p>
				</div>
			</div>
		`

		let sentCount = 0
		let failCount = 0

		for (const sub of activeSubscribers) {
			try {
				await sendEmailWithContent({
					to: sub.email,
					subject: emailSubject,
					html: emailHtml
				})
				sentCount++
			} catch (err) {
				logger.error({ err, recipient: sub.email }, 'Failed sending news notification to subscriber')
				failCount++
			}
		}

		logger.info({ title, sentCount, failCount }, 'News alert broadcast completed')

		return successResponse(c, {
			sentCount,
			failCount,
			total: activeSubscribers.length,
			message: `News notification sent to ${sentCount} subscriber(s).`
		})
	} catch (error) {
		logger.error({ error }, 'Failed to broadcast news notification')
		return errorResponse(c, 'Failed to broadcast news notification', 'BROADCAST_ERROR', 500)
	}
})

export default publicNewsletterRoute
