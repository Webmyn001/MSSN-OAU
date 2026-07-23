import { eq, and, gt, lt, isNull } from 'drizzle-orm'
import { db } from '../lib/db'
import {
	passwordResetTokens,
	type PasswordResetToken,
	type NewPasswordResetToken
} from '../db/schema/password-reset-tokens'
import { logger } from '../lib/logger'
import { createId } from '@paralleldrive/cuid2'

// * Password reset token expiration time (15 minutes in milliseconds)
const RESET_TOKEN_EXPIRATION_MS = 15 * 60 * 1000

/**
 * * Creates a new password reset token for a user
 * @param userId - User ID
 * @param expiresIn - Optional expiration time in milliseconds (defaults to 15 minutes)
 * @returns Created token object
 */
export async function createPasswordResetToken(
	userId: string,
	expiresIn: number = RESET_TOKEN_EXPIRATION_MS
): Promise<PasswordResetToken> {
	const token = createId()
	const expiresAt = new Date(Date.now() + expiresIn)

	// * Invalidate any existing tokens for this user
	await db
		.update(passwordResetTokens)
		.set({ usedAt: new Date() })
		.where(and(eq(passwordResetTokens.userId, userId), isNull(passwordResetTokens.usedAt)))

	const newToken: NewPasswordResetToken = {
		userId,
		token,
		expiresAt
	}

	try {
		const [resetToken] = await db.insert(passwordResetTokens).values(newToken).returning()
		logger.info({ userId, tokenId: resetToken.id }, 'Password reset token created')
		return resetToken
	} catch (error) {
		logger.error({ error, userId }, 'Failed to create password reset token')
		throw error
	}
}

/**
 * * Validates a password reset token and returns it if valid
 * @param token - Reset token
 * @returns Token object if valid, null if invalid or expired
 */
export async function validatePasswordResetToken(
	token: string
): Promise<PasswordResetToken | null> {
	try {
		const [resetToken] = await db
			.select()
			.from(passwordResetTokens)
			.where(
				and(
					eq(passwordResetTokens.token, token),
					gt(passwordResetTokens.expiresAt, new Date()),
					isNull(passwordResetTokens.usedAt)
				)
			)
			.limit(1)

		if (!resetToken) {
			return null
		}

		return resetToken
	} catch (error) {
		logger.error({ error, token }, 'Failed to validate password reset token')
		return null
	}
}

/**
 * * Marks a password reset token as used
 * @param token - Reset token
 */
export async function markTokenAsUsed(token: string): Promise<void> {
	try {
		await db
			.update(passwordResetTokens)
			.set({ usedAt: new Date() })
			.where(eq(passwordResetTokens.token, token))
		logger.info({ token }, 'Password reset token marked as used')
	} catch (error) {
		logger.error({ error, token }, 'Failed to mark password reset token as used')
		throw error
	}
}

/**
 * * Cleans up expired password reset tokens (can be run as a background job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
	try {
		// * Note: Drizzle doesn't return rowCount directly
		// * We'll need to count before deletion or use a different approach
		await db
			.delete(passwordResetTokens)
			.where(and(lt(passwordResetTokens.expiresAt, new Date()), isNull(passwordResetTokens.usedAt)))
		// * For now, return 0 as we can't get the count from Drizzle
		// * TODO: Use raw query if we need exact count
		const deletedCount = 0
		logger.info({ deletedCount }, 'Expired password reset tokens cleaned up')
		return deletedCount
	} catch (error) {
		logger.error({ error }, 'Failed to cleanup expired password reset tokens')
		return 0
	}
}
