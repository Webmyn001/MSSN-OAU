import { Hono } from 'hono'
import { successResponse, errorResponse } from '../lib/response'
import { logger } from '../lib/logger'
import { db } from '../lib/db'
import { newsletterSubscribers } from '../db/schema'
import { eq, desc, count, and } from 'drizzle-orm'
import { sendEmailWithContent } from '../services/email/brevo'
import { brandEmail, emailButton, EMAIL_SITE_URL } from '../services/email/template'

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
					html: brandEmail(
						'Welcome Back',
						`
							<p style="margin:0 0 16px;">Assalamu 'alaykum ${name || 'Dear Brother/Sister'},</p>
							<p style="margin:0 0 16px;">Welcome back to the official <strong>Muslim Students' Society of Nigeria, OAU Branch</strong> newsletter.</p>
							<p style="margin:0 0 16px;">You will receive updates on latest news, Islamic lectures, upcoming programmes, and campus announcements.</p>
							${emailButton('Visit Our Website', EMAIL_SITE_URL)}
						`
					)
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
			html: brandEmail(
				'Welcome to the MSSN OAU Newsletter',
				`
					<p style="margin:0 0 16px;">Assalamu 'alaykum ${name || 'Dear Brother/Sister'},</p>
					<p style="margin:0 0 16px;">Thank you for subscribing to the official <strong>Muslim Students' Society of Nigeria, OAU Branch</strong> newsletter!</p>
					<p style="margin:0 0 16px;">You will now receive direct email notifications whenever new articles, press releases, or event updates are published on our website.</p>
					${emailButton('Visit Our Website', EMAIL_SITE_URL)}
					<p style="margin:0 0 4px;">Jazakallahu Khayran,</p>
					<p style="margin:0;"><strong>MSSN OAU Editorial &amp; Media Team</strong></p>
				`
			)
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
				html: brandEmail(
					subject,
					`
						${content}
					`
				)
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

		const emailHtml = brandEmail(
			'Latest News',
			`
				${imageUrl ? `<img src="${imageUrl}" alt="${title}" style="width:100%; max-height:280px; object-fit:cover; border-radius:8px; margin-bottom:20px;" />` : ''}
				<h2 style="margin:0 0 12px; color:#115F34; font-size:20px; line-height:1.3;">${title}</h2>
				<p style="margin:0 0 16px; color:#444; font-size:15px;">${summary}</p>
				${emailButton('Read Full Article', articleUrl)}
			`
		)

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
