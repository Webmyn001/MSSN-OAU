import bcrypt from 'bcrypt'
import { SignJWT, jwtVerify } from 'jose'
import { ADMIN_USERS, JWT_SECRET, JWT_EXPIRY, OTP_EXPIRY_MS, OTP_LENGTH, type AdminUser } from '../config/admin-users'
import { getConfigValue, setConfigValue } from './config-store'
import { logger } from '../lib/logger'

interface PendingOTP {
	code: string
	email: string
	expiresAt: number
}

const otpStore = new Map<string, PendingOTP>()

/** DB key for admin emails added via the dashboard (same shared password). */
const EXTRA_ADMIN_EMAILS_KEY = 'admin_extra_emails'

/** Password hash shared by all admins (used for emails added via the dashboard). */
const SHARED_ADMIN_PASSWORD_HASH = '$2b$10$annSLz7Qc09G2i439kjpEOWVqCySyEtHAJSDGueXJTyeyVw34jaZ2'

/** Resolve an admin user from the built-in config or DB-added extra emails. */
export async function getAdminUserByEmail(email: string): Promise<AdminUser | null> {
	const normalized = email.toLowerCase()
	const base = ADMIN_USERS.find(u => u.email.toLowerCase() === normalized)
	if (base) return base

	const extras = await getConfigValue<string[]>(EXTRA_ADMIN_EMAILS_KEY, [])
	if (extras.includes(normalized)) {
		return {
			email: normalized,
			passwordHash: SHARED_ADMIN_PASSWORD_HASH,
			fullName: 'MSSN Admin',
			role: 'admin'
		}
	}
	return null
}

/** All admin emails (built-in + DB-added). */
export async function getAllAdminEmails(): Promise<string[]> {
	const extras = await getConfigValue<string[]>(EXTRA_ADMIN_EMAILS_KEY, [])
	return [...new Set([...ADMIN_USERS.map(u => u.email.toLowerCase()), ...extras])]
}

/** Add an admin by email (uses the shared password). Returns false if already present. */
export async function addAdminEmail(email: string): Promise<boolean> {
	const normalized = email.toLowerCase()
	const extras = await getConfigValue<string[]>(EXTRA_ADMIN_EMAILS_KEY, [])
	if (extras.includes(normalized) || ADMIN_USERS.some(u => u.email.toLowerCase() === normalized)) {
		return false
	}
	extras.push(normalized)
	await setConfigValue(EXTRA_ADMIN_EMAILS_KEY, extras)
	return true
}

/** Remove a DB-added admin by email. Returns false if it's a built-in or not found. */
export async function removeAdminEmail(email: string): Promise<boolean> {
	const normalized = email.toLowerCase()
	if (ADMIN_USERS.some(u => u.email.toLowerCase() === normalized)) {
		return false
	}
	const extras = await getConfigValue<string[]>(EXTRA_ADMIN_EMAILS_KEY, [])
	const next = extras.filter(e => e !== normalized)
	if (next.length === extras.length) {
		return false
	}
	await setConfigValue(EXTRA_ADMIN_EMAILS_KEY, next)
	return true
}

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
	const user = await getAdminUserByEmail(email)
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
