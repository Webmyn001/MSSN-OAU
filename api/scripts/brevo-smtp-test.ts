import nodemailer from 'nodemailer'
import env from '../src/lib/env'

const transporter = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: env.SMTP_PORT,
	secure: env.SMTP_SECURE,
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASS
	}
})

try {
	const ok = await transporter.verify()
	console.log('SMTP_CONNECTION_OK:', ok, '| user:', env.SMTP_USER)
} catch (err) {
	console.error('SMTP_CONNECTION_FAILED:', err instanceof Error ? err.message : err)
	process.exit(1)
}
