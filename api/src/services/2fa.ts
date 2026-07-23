import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import { users } from '../db/schema/users'
import { logger } from '../lib/logger'

// * 2FA service name for QR code
const SERVICE_NAME = 'MSSN Website'

/**
 * * Generates a 2FA secret for a user
 * @param userEmail - User email address
 * @returns 2FA secret object
 */
export function generateSecret(userEmail: string): speakeasy.GeneratedSecret {
	return speakeasy.generateSecret({
		name: `${SERVICE_NAME} (${userEmail})`,
		issuer: SERVICE_NAME,
		length: 32
	})
}

/**
 * * Generates a QR code data URL for 2FA setup
 * @param secret - 2FA secret (otpauth URL)
 * @returns QR code data URL
 */
export async function generateQRCode(secret: string): Promise<string> {
	try {
		const qrCodeDataUrl = await QRCode.toDataURL(secret)
		return qrCodeDataUrl
	} catch (error) {
		logger.error({ error }, 'Failed to generate QR code')
		throw new Error('Failed to generate QR code')
	}
}

/**
 * * Generates backup codes for 2FA
 * @param count - Number of backup codes to generate (default: 8)
 * @returns Array of backup codes
 */
export function generateBackupCodes(count: number = 8): string[] {
	const codes: string[] = []
	for (let i = 0; i < count; i++) {
		// * Generate 8-digit backup code
		const code = Math.floor(10000000 + Math.random() * 90000000).toString()
		codes.push(code)
	}
	return codes
}

/**
 * * Encrypts a 2FA secret (simple base64 encoding for now)
 * @param secret - Plain text secret
 * @returns Encrypted secret
 */
export function encryptSecret(secret: string): string {
	// * TODO: Use proper encryption (e.g., crypto.createCipheriv)
	// * For now, using base64 encoding (not secure, but works for development)
	// * In production, use proper encryption with environment variable key
	return Buffer.from(secret).toString('base64')
}

/**
 * * Decrypts a 2FA secret
 * @param encryptedSecret - Encrypted secret
 * @returns Plain text secret
 */
export function decryptSecret(encryptedSecret: string): string {
	// * TODO: Use proper decryption
	return Buffer.from(encryptedSecret, 'base64').toString('utf-8')
}

/**
 * * Verifies a 2FA code against a secret
 * @param secret - 2FA secret
 * @param code - 6-digit code from authenticator app
 * @returns True if code is valid, false otherwise
 */
export function verifyCode(secret: string, code: string): boolean {
	try {
		return speakeasy.totp.verify({
			secret,
			encoding: 'base32',
			token: code,
			window: 2 // * Allow 2 time steps (60 seconds) of tolerance
		})
	} catch (error) {
		logger.error({ error }, 'Failed to verify 2FA code')
		return false
	}
}

/**
 * * Verifies a backup code
 * @param backupCodes - Array of backup codes
 * @param code - Code to verify
 * @returns True if code is valid, false otherwise
 */
export function verifyBackupCode(backupCodes: string[], code: string): boolean {
	return backupCodes.includes(code)
}

/**
 * * Stores 2FA secret and backup codes for a user (pending setup)
 * @param userId - User ID
 * @param secret - 2FA secret
 * @param backupCodes - Backup codes
 */
export async function store2FASetup(
	userId: string,
	secret: string,
	backupCodes: string[]
): Promise<void> {
	const encryptedSecret = encryptSecret(secret)

	try {
		await db
			.update(users)
			.set({
				twoFASecret: encryptedSecret,
				twoFABackupCodes: backupCodes,
				has2FA: false, // * Not enabled until verified
				updatedAt: new Date()
			})
			.where(eq(users.id, userId))

		logger.info({ userId }, '2FA setup stored (pending verification)')
	} catch (error) {
		logger.error({ error, userId }, 'Failed to store 2FA setup')
		throw error
	}
}

/**
 * * Enables 2FA for a user after successful verification
 * @param userId - User ID
 */
export async function enable2FA(userId: string): Promise<void> {
	try {
		await db
			.update(users)
			.set({
				has2FA: true,
				updatedAt: new Date()
			})
			.where(eq(users.id, userId))

		logger.info({ userId }, '2FA enabled')
	} catch (error) {
		logger.error({ error, userId }, 'Failed to enable 2FA')
		throw error
	}
}

/**
 * * Gets user's 2FA secret (decrypted)
 * @param userId - User ID
 * @returns Decrypted secret or null if not set
 */
export async function getUser2FASecret(userId: string): Promise<string | null> {
	try {
		const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

		if (!user || !user.twoFASecret) {
			return null
		}

		return decryptSecret(user.twoFASecret)
	} catch (error) {
		logger.error({ error, userId }, 'Failed to get user 2FA secret')
		return null
	}

	return null
}

/**
 * * Gets user's backup codes
 * @param userId - User ID
 * @returns Array of backup codes or null if not set
 */
export async function getUserBackupCodes(userId: string): Promise<string[] | null> {
	try {
		const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

		if (!user || !user.twoFABackupCodes) {
			return null
		}

		return user.twoFABackupCodes
	} catch (error) {
		logger.error({ error, userId }, 'Failed to get user backup codes')
		return null
	}
}
