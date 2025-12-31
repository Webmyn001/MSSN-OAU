import env from '../../lib/env.js'
import { logger } from '../../lib/logger.js'

// * Plunk API base URL
const PLUNK_API_URL = 'https://api.useplunk.com/v1'

/**
 * * Sends an email using Plunk API
 * @param options - Email options
 * @param options.to - Recipient email address
 * @param options.subject - Email subject
 * @param options.body - Email body (HTML or plain text)
 * @param options.from - Optional sender email (defaults to PLUNK_FROM_EMAIL)
 * @returns Promise with Plunk API response
 */
export async function sendEmail({
	to,
	subject,
	body,
	from
}: {
	to: string
	subject: string
	body: string
	from?: string
}): Promise<unknown> {
	logger.info({ to, subject }, 'Sending email via Plunk')

	try {
		const response = await fetch(`${PLUNK_API_URL}/send`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${env.PLUNK_API_KEY}`
			},
			body: JSON.stringify({
				to,
				subject,
				body,
				from: from || env.PLUNK_FROM_EMAIL
			})
		})

		if (!response.ok) {
			const errorData = (await response.json().catch(() => ({}))) as { message?: string }
			logger.error(
				{ status: response.status, error: errorData, to, subject },
				'Plunk API error'
			)
			throw new Error(
				`Plunk API Error: ${response.status} - ${errorData.message || 'Unknown error'}`
			)
		}

		const info = (await response.json()) as { id?: string }
		logger.info({ to, subject, messageId: info.id }, 'Email sent successfully via Plunk')
		return info
	} catch (error) {
		if (error instanceof Error) {
			logger.error({ error: error.message, to, subject }, 'Failed to send email via Plunk')
		} else {
			logger.error({ error, to, subject }, 'Unknown error sending email via Plunk')
		}
		throw error
	}
}

/**
 * * Sends an email with HTML and text content
 * @param options - Email options
 * @param options.to - Recipient email address
 * @param options.subject - Email subject
 * @param options.html - HTML email content
 * @param options.text - Plain text email content (optional)
 * @param options.from - Optional sender email
 * @returns Promise with Plunk API response
 */
export async function sendEmailWithContent({
	to,
	subject,
	html,
	text,
	from
}: {
	to: string
	subject: string
	html: string
	text?: string
	from?: string
}): Promise<unknown> {
	// * Use HTML if available, otherwise use text
	const body = html || text || ''

	return sendEmail({
		to,
		subject,
		body,
		from: from || env.PLUNK_FROM_EMAIL
	})
}

