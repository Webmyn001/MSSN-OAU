import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db.js'
import { users, type User, type NewUser } from '../db/schema/users.js'
import { logger } from '../lib/logger.js'
import { ConflictError, NotFoundError } from '../lib/errors.js'

// * Password hashing salt rounds
const SALT_ROUNDS = 10

/**
 * * Hashes a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * * Verifies a password against a hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return await bcrypt.compare(password, hash)
}

/**
 * * Creates a new user
 * @param userData - User data to create
 * @returns Created user object (without password hash)
 */
export async function createUser(userData: {
	email: string
	password: string
	username?: string
	fullName?: string
}): Promise<Omit<User, 'passwordHash' | 'twoFASecret' | 'twoFABackupCodes'>> {
	// * Check if email already exists
	const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1)

	if (existingUser.length > 0) {
		throw new ConflictError('Email already registered')
	}

	// * Generate username if not provided
	const username = userData.username || userData.email.split('@')[0]

	// * Check if username already exists
	const existingUsername = await db.select().from(users).where(eq(users.username, username)).limit(1)

	if (existingUsername.length > 0) {
		// * Append random number to username
		const uniqueUsername = `${username}${Math.floor(Math.random() * 10000)}`
		userData.username = uniqueUsername
	} else {
		userData.username = username
	}

	// * Hash password
	const passwordHash = await hashPassword(userData.password)

	// * Create user
	const newUser: NewUser = {
		email: userData.email,
		username: userData.username,
		passwordHash,
		fullName: userData.fullName || userData.username
	}

	try {
		const [createdUser] = await db.insert(users).values(newUser).returning()

		// * Remove sensitive fields from response
		const { passwordHash: _, twoFASecret: __, twoFABackupCodes: ___, ...userWithoutSecrets } =
			createdUser

		logger.info({ userId: createdUser.id, email: createdUser.email }, 'User created')
		return userWithoutSecrets
	} catch (error) {
		logger.error({ error, email: userData.email }, 'Failed to create user')
		throw error
	}
}

/**
 * * Finds a user by email
 * @param email - User email
 * @returns User object if found, null otherwise
 */
export async function findUserByEmail(email: string): Promise<User | null> {
	try {
		const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
		return user || null
	} catch (error) {
		logger.error({ error, email }, 'Failed to find user by email')
		return null
	}
}

/**
 * * Finds a user by ID
 * @param userId - User ID
 * @returns User object if found, null otherwise
 */
export async function findUserById(userId: string): Promise<User | null> {
	try {
		const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
		return user || null
	} catch (error) {
		logger.error({ error, userId }, 'Failed to find user by ID')
		return null
	}
}

/**
 * * Updates a user's password
 * @param userId - User ID
 * @param newPassword - New plain text password
 */
export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
	const passwordHash = await hashPassword(newPassword)

	try {
		await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId))
		logger.info({ userId }, 'User password updated')
	} catch (error) {
		logger.error({ error, userId }, 'Failed to update user password')
		throw error
	}
}

