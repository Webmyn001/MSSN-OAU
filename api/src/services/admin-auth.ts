import bcrypt from 'bcrypt'
import { SignJWT, jwtVerify } from 'jose'
import { ADMIN_USERS, JWT_SECRET, JWT_EXPIRY, OTP_EXPIRY_MS, OTP_LENGTH, type AdminUser } from '../config/admin-users'
import { logger } from '../lib/logger'

interface PendingOTP {
	code: string
	email: string
	expiresAt: number
}

const otpStore = new Map<string, PendingOTP>()

function generateOTP(): string {
	const digits = '0123456789'
	let code = ''
	for (let i = 0; i < OTP_LENGTH; i++) {
		code += digits[Math.floor(Math.random() * 10)]
	}
	return code
}

export async function verifyAdminCredentials(
	email: string,
	password: string
): Promise<Omit<AdminUser, 'passwordHash'> | null> {
	const user = ADMIN_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())
	if (!user) {
		logger.warn({ email }, 'Login attempt with unknown email')
		return null
	}

	const valid = await bcrypt.compare(password, user.passwordHash)
	if (!valid) {
		logger.warn({ email }, 'Login attempt with wrong password')
		return null
	}

	return { email: user.email, fullName: user.fullName, role: user.role }
}

export function createOTP(email: string): string {
	const code = generateOTP()
	const record: PendingOTP = {
		code,
		email: email.toLowerCase(),
		expiresAt: Date.now() + OTP_EXPIRY_MS
	}
	otpStore.set(email.toLowerCase(), record)

	// Clean expired OTPs
	for (const [key, val] of otpStore) {
		if (val.expiresAt < Date.now()) otpStore.delete(key)
	}

	logger.info({ email }, 'OTP created')
	return code
}

export function verifyOTP(email: string, code: string): boolean {
	const record = otpStore.get(email.toLowerCase())
	if (!record) {
		logger.warn({ email }, 'OTP verification failed: no pending OTP')
		return false
	}

	if (record.expiresAt < Date.now()) {
		otpStore.delete(email.toLowerCase())
		logger.warn({ email }, 'OTP verification failed: expired')
		return false
	}

	if (record.code !== code) {
		logger.warn({ email }, 'OTP verification failed: wrong code')
		return false
	}

	otpStore.delete(email.toLowerCase())
	logger.info({ email }, 'OTP verified successfully')
	return true
}

export async function generateJWT(payload: {
	email: string
	fullName: string
	role: string
}): Promise<string> {
	const secret = new TextEncoder().encode(JWT_SECRET)
	const token = await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(JWT_EXPIRY)
		.sign(secret)
	return token
}

export async function verifyJWT(token: string): Promise<{
	email: string
	fullName: string
	role: string
} | null> {
	try {
		const secret = new TextEncoder().encode(JWT_SECRET)
		const { payload } = await jwtVerify(token, secret)
		return {
			email: payload.email as string,
			fullName: payload.fullName as string,
			role: payload.role as string
		}
	} catch {
		return null
	}
}
