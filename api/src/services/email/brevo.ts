import nodemailer from 'nodemailer'
import env from '../../lib/env'
import { logger } from '../../lib/logger'

// * Brevo SMTP relay — create a shared transporter
const transporter = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: env.SMTP_PORT,
	secure: env.SMTP_SECURE,
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASS
	}
})

/**
 * * Sends an email using SMTP (Brevo relay)
 * @param options - Email options
 * @param options.to - Recipient email address
 * @param options.subject - Email subject
 * @param options.body - Email body (HTML or plain text)
 * @param options.from - Optional sender (defaults to SMTP_FROM)
 * @returns Promise with SMTP response
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
	logger.info({ to, subject }, 'Sending email via SMTP (Brevo)')

	try {
		const info = await transporter.sendMail({
			from: from || env.SMTP_FROM,
			to,
			subject,
			html: body
		})

		logger.info({ to, subject, messageId: info.messageId }, 'Email sent successfully via SMTP (Brevo)')
		return info
	} catch (error) {
		if (error instanceof Error) {
			logger.error({ error: error.message, to, subject }, 'Failed to send email via SMTP (Brevo)')
		} else {
			logger.error({ error, to, subject }, 'Unknown error sending email via SMTP (Brevo)')
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
 * @param options.from - Optional sender
 * @returns Promise with SMTP response
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
		from: from || env.SMTP_FROM
	})
}
