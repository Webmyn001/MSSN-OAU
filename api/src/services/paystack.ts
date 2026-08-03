import env from '../lib/env'
import { logger } from '../lib/logger'

const PAYSTACK_BASE_URL = 'https://api.paystack.co'

interface PaystackInitializeResponse {
	status: boolean
	data: {
		authorization_url: string
		access_code: string
		reference: string
	}
}

interface PaystackVerifyResponse {
	status: boolean
	data: {
		status: string
		reference: string
		amount: number
		metadata: Record<string, unknown>
		channel: string
		created_at: string
		transaction_date: string
		gateway_response: string
	}
}

/**
 * Initialize a Paystack transaction
 */
export async function initializePayment(params: {
	email: string
	amount: number // in Naira (will be converted to kobo)
	reference: string
	metadata?: Record<string, unknown>
	callbackUrl?: string
}): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> {
	const { email, amount, reference, metadata = {}, callbackUrl } = params

	const amountKobo = Math.round(amount * 100)

	const body: Record<string, unknown> = {
		email,
		amount: amountKobo,
		reference,
		metadata: {
			...metadata,
			custom_fields: [
				{
					display_name: 'Student',
					variable_name: 'student_name',
					value: metadata.studentName || ''
				},
				{
					display_name: 'Session',
					variable_name: 'session_name',
					value: metadata.sessionName || ''
				}
			]
		}
	}

	if (callbackUrl) {
		body.callback_url = callbackUrl
	}

	const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
			'Content-Type': 'application/json'
		},
		signal: AbortSignal.timeout(15000),
		body: JSON.stringify(body)
	})

	const data = (await response.json()) as PaystackInitializeResponse

	if (!data.status) {
		logger.error({ paystackResponse: data }, 'Paystack initialization failed')
		throw new Error('Payment initialization failed')
	}

	return {
		authorizationUrl: data.data.authorization_url,
		accessCode: data.data.access_code,
		reference: data.data.reference
	}
}

/**
 * Verify a Paystack transaction by reference
 */
export async function verifyPayment(
	reference: string
): Promise<{ paid: boolean; status: string; amount?: number; transactionDate?: string }> {
	const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
		headers: {
			Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`
		}
	})

	const data = (await response.json()) as PaystackVerifyResponse

	if (!data.status) {
		logger.error({ paystackResponse: data }, 'Paystack verification failed')
		return { paid: false, status: 'verification_failed' }
	}

	const paid = data.data.status === 'success'

	return {
		paid,
		status: data.data.status,
		amount: data.data.amount ? data.data.amount / 100 : undefined,
		transactionDate: data.data.transaction_date
	}
}

/**
 * Verify Paystack webhook signature (HMAC-SHA512)
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
	try {
		const crypto = require('crypto') as typeof import('crypto')
		const hmac = crypto.createHmac('sha512', env.PAYSTACK_SECRET_KEY)
		const digest = hmac.update(payload).digest('hex')
		return digest === signature
	} catch (error) {
		logger.error({ error }, 'Webhook signature verification failed')
		return false
	}
}
