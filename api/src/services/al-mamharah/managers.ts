import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { SignJWT, jwtVerify } from 'jose'
import { and, desc, eq, isNull, gt, sql } from 'drizzle-orm'
import { db } from '../../lib/db'
import env from '../../lib/env'
import { JWT_SECRET } from '../../config/admin-users'
import { logger } from '../../lib/logger'
import { AuthorizationError, ConflictError, NotFoundError } from '../../lib/errors'
import {
	alMamharahManagerTokens,
	alMamharahManagers,
	type AlMamharahManager,
	type AlMamharahManagerRole,
	type AlMamharahManagerStatus
} from '../../db/schema'
import { recordAudit } from './audit'
import { sendEmailWithContent } from '../email/brevo'
import { brandEmail, emailButton } from '../email/template'

// * Al-Mamharah Programme Manager authentication.
// *
// * Manager JWTs are signed with a DEDICATED secret (derived from JWT_SECRET
// * unless AL_MAMHARAH_MANAGER_JWT_SECRET is set) so they can never be replayed
// * against the site-admin routes, which share the base JWT_SECRET. The
// * additional `scope` claim is checked as defence in depth.

const MANAGER_JWT_EXPIRY = '8h'
const ACTIVATION_TTL_MS = 7 * 24 * 60 * 60 * 1000
const MANAGER_SCOPE = 'almamharah'
const BCRYPT_ROUNDS = 10

export interface ManagerTokenPayload {
	managerId: string
	email: string
	role: AlMamharahManagerRole
	scope: typeof MANAGER_SCOPE
}

function managerJwtSecret(): Uint8Array {
	const base = env.AL_MAMHARAH_MANAGER_JWT_SECRET || `${JWT_SECRET}::al-mamharah-manager`
	return new TextEncoder().encode(base)
}

function generateActivationToken(): string {
	return crypto.randomBytes(32).toString('hex')
}

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase()
}

/**
 * Bootstraps the primary manager from environment variables when no primary
 * manager exists yet. Runs lazily (called before login attempts) so deploys
 * without the env vars keep working.
 */
export async function ensurePrimaryManager(): Promise<void> {
	const [existing] = await db
		.select({ id: alMamharahManagers.id })
		.from(alMamharahManagers)
		.where(eq(alMamharahManagers.role, 'PRIMARY'))
		.limit(1)
	if (existing) return

	const email = env.AL_MAMHARAH_MANAGER_EMAIL ? normalizeEmail(env.AL_MAMHARAH_MANAGER_EMAIL) : null
	const password = env.AL_MAMHARAH_MANAGER_PASSWORD
	if (!email || !password) {
		logger.warn(
			'Al-Mamharah primary manager not configured (set AL_MAMHARAH_MANAGER_EMAIL/PASSWORD or seed a PRIMARY manager)'
		)
		return
	}

	const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
	await db
		.insert(alMamharahManagers)
		.values({
			email,
			fullName: 'Programme Manager',
			role: 'PRIMARY',
			status: 'ACTIVE',
			passwordHash
		})
		.onConflictDoNothing({ target: alMamharahManagers.email })

	logger.info({ email }, 'Al-Mamharah primary manager bootstrapped from environment')
	await recordAudit({
		actorType: 'SYSTEM',
		action: 'PRIMARY_MANAGER_BOOTSTRAPPED',
		entity: 'manager',
		details: { email }
	})
}

/** True when at least one usable manager (primary) exists. */
export async function isManagerLoginAvailable(): Promise<boolean> {
	await ensurePrimaryManager()
	const [row] = await db
		.select({ total: sql<number>`count(*)::int` })
		.from(alMamharahManagers)
		.where(
			and(
				eq(alMamharahManagers.status, 'ACTIVE'),
				sql`${alMamharahManagers.passwordHash} is not null`
			)
		)
	return (row?.total ?? 0) > 0
}

/** Verifies email + password for an ACTIVE manager. */
export async function authenticateManager(
	email: string,
	password: string
): Promise<AlMamharahManager | null> {
	await ensurePrimaryManager()
	const [manager] = await db
		.select()
		.from(alMamharahManagers)
		.where(eq(sql`lower(${alMamharahManagers.email})`, normalizeEmail(email)))
		.limit(1)

	if (!manager || manager.status !== 'ACTIVE' || !manager.passwordHash) {
		logger.warn({ email }, 'Al-Mamharah manager login failed: no active manager')
		return null
	}

	const valid = await bcrypt.compare(password, manager.passwordHash)
	if (!valid) {
		logger.warn({ email }, 'Al-Mamharah manager login failed: wrong password')
		return null
	}
	return manager
}

/** Signs an 8-hour manager JWT. */
export async function generateManagerToken(manager: AlMamharahManager): Promise<string> {
	const payload: ManagerTokenPayload = {
		managerId: manager.id,
		email: manager.email,
		role: manager.role,
		scope: MANAGER_SCOPE
	}
	return new SignJWT({ ...payload })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(MANAGER_JWT_EXPIRY)
		.sign(managerJwtSecret())
}

/** Verifies a manager JWT signature, expiry and scope. */
export async function verifyManagerToken(token: string): Promise<ManagerTokenPayload | null> {
	try {
		const { payload } = await jwtVerify(token, managerJwtSecret())
		if (payload.scope !== MANAGER_SCOPE) return null
		if (typeof payload.managerId !== 'string' || typeof payload.email !== 'string') return null
		return {
			managerId: payload.managerId,
			email: payload.email,
			role: payload.role as AlMamharahManagerRole,
			scope: MANAGER_SCOPE
		}
	} catch {
		return null
	}
}

/** Loads a manager and returns it only while ACTIVE (immediate revocation). */
export async function getActiveManager(managerId: string): Promise<AlMamharahManager | null> {
	const [manager] = await db
		.select()
		.from(alMamharahManagers)
		.where(eq(alMamharahManagers.id, managerId))
		.limit(1)
	if (!manager || manager.status !== 'ACTIVE') return null
	return manager
}

export interface InviteResult {
	manager: AlMamharahManager
	token: string
	details: 'INVITED' | 'REINVITED' | 'INVITE_RESENT'
}

async function createActivationToken(managerId: string): Promise<string> {
	// * Invalidate outstanding activation tokens for this manager
	await db
		.delete(alMamharahManagerTokens)
		.where(
			and(
				eq(alMamharahManagerTokens.managerId, managerId),
				eq(alMamharahManagerTokens.type, 'ACTIVATION'),
				isNull(alMamharahManagerTokens.usedAt)
			)
		)

	const token = generateActivationToken()
	await db.insert(alMamharahManagerTokens).values({
		managerId,
		token,
		type: 'ACTIVATION',
		expiresAt: new Date(Date.now() + ACTIVATION_TTL_MS)
	})
	return token
}

/** Invites a new manager, or re-invites a REVOKED one, by email. */
export async function inviteManager(options: {
	email: string
	invitedBy: string
	fullName?: string
}): Promise<InviteResult> {
	const email = normalizeEmail(options.email)
	const [existing] = await db
		.select()
		.from(alMamharahManagers)
		.where(eq(sql`lower(${alMamharahManagers.email})`, email))
		.limit(1)

	if (existing?.status === 'ACTIVE') {
		throw new ConflictError('An active manager with this email already exists')
	}

	let manager: AlMamharahManager
	let details: InviteResult['details'] = 'INVITED'

	if (existing) {
		const [updated] = await db
			.update(alMamharahManagers)
			.set({
				status: 'PENDING',
				role: 'MANAGER',
				fullName: options.fullName?.trim() || existing.fullName,
				passwordHash: null,
				updatedAt: new Date()
			})
			.where(eq(alMamharahManagers.id, existing.id))
			.returning()
		manager = updated
		details = existing.status === 'PENDING' ? 'INVITE_RESENT' : 'REINVITED'
	} else {
		const [inserted] = await db
			.insert(alMamharahManagers)
			.values({
				email,
				fullName: options.fullName?.trim() || null,
				role: 'MANAGER',
				status: 'PENDING'
			})
			.returning()
		manager = inserted
	}

	const token = await createActivationToken(manager.id)
	await recordAudit({
		actorType: 'MANAGER',
		actor: options.invitedBy,
		action: details === 'INVITED' ? 'MANAGER_INVITED' : 'MANAGER_REINVITED',
		entity: 'manager',
		entityId: manager.id,
		details: { email }
	})
	return { manager, token, details }
}

/** Resends an activation link for a PENDING (or REVOKED) manager. */
export async function resendManagerInvite(
	managerId: string,
	invitedBy: string
): Promise<InviteResult> {
	const [manager] = await db
		.select()
		.from(alMamharahManagers)
		.where(eq(alMamharahManagers.id, managerId))
		.limit(1)
	if (!manager) throw new NotFoundError('Manager not found')
	if (manager.status === 'ACTIVE') {
		throw new ConflictError('This manager is already active and does not need an invitation')
	}

	if (manager.status === 'REVOKED') {
		await db
			.update(alMamharahManagers)
			.set({ status: 'PENDING', updatedAt: new Date() })
			.where(eq(alMamharahManagers.id, managerId))
	}

	const token = await createActivationToken(manager.id)
	await recordAudit({
		actorType: 'MANAGER',
		actor: invitedBy,
		action: 'MANAGER_INVITE_RESENT',
		entity: 'manager',
		entityId: managerId,
		details: { email: manager.email }
	})
	return { manager: { ...manager, status: 'PENDING' }, token, details: 'INVITE_RESENT' }
}

/** Revokes a manager's access. The PRIMARY manager can never be revoked. */
export async function revokeManager(
	managerId: string,
	actorEmail: string
): Promise<AlMamharahManager> {
	const [manager] = await db
		.select()
		.from(alMamharahManagers)
		.where(eq(alMamharahManagers.id, managerId))
		.limit(1)
	if (!manager) throw new NotFoundError('Manager not found')
	if (manager.role === 'PRIMARY') {
		throw new AuthorizationError('The primary Programme Manager cannot be revoked')
	}

	const [updated] = await db
		.update(alMamharahManagers)
		.set({ status: 'REVOKED', passwordHash: null, updatedAt: new Date() })
		.where(eq(alMamharahManagers.id, managerId))
		.returning()

	await db.delete(alMamharahManagerTokens).where(eq(alMamharahManagerTokens.managerId, managerId))
	await recordAudit({
		actorType: 'MANAGER',
		actor: actorEmail,
		action: 'MANAGER_REVOKED',
		entity: 'manager',
		entityId: managerId,
		details: { email: manager.email }
	})
	logger.warn({ managerId, actorEmail }, 'Al-Mamharah manager revoked')
	return updated
}

/**
 * Permanently deletes a manager. Only the PRIMARY manager may do this, and
 * only REVOKED managers can be deleted (revoke first). Tokens are cascade-
 * deleted via the FK, but we clear them explicitly for clarity.
 */
export async function deleteManager(
	managerId: string,
	actor: { managerId: string; role: AlMamharahManagerRole; email: string }
): Promise<void> {
	if (actor.role !== 'PRIMARY') {
		throw new AuthorizationError('Only the primary Programme Manager can delete managers')
	}

	const [manager] = await db
		.select()
		.from(alMamharahManagers)
		.where(eq(alMamharahManagers.id, managerId))
		.limit(1)
	if (!manager) throw new NotFoundError('Manager not found')
	if (manager.role === 'PRIMARY') {
		throw new AuthorizationError('The primary Programme Manager cannot be deleted')
	}
	if (manager.status !== 'REVOKED') {
		throw new ConflictError('Revoke this manager before deleting them')
	}

	await db.delete(alMamharahManagerTokens).where(eq(alMamharahManagerTokens.managerId, managerId))
	await db.delete(alMamharahManagers).where(eq(alMamharahManagers.id, managerId))

	await recordAudit({
		actorType: 'MANAGER',
		actor: actor.email,
		action: 'MANAGER_DELETED',
		entity: 'manager',
		entityId: managerId,
		details: { email: manager.email }
	})
	logger.warn({ managerId, actorEmail: actor.email }, 'Al-Mamharah manager deleted')
}

export interface ManagerListItem {
	id: string
	email: string
	fullName: string | null
	role: AlMamharahManagerRole
	status: AlMamharahManagerStatus
	createdAt: Date
	updatedAt: Date
	hasPassword: boolean
}

/** Safe manager list (never returns password hashes). */
export async function listManagers(): Promise<ManagerListItem[]> {
	const rows = await db
		.select()
		.from(alMamharahManagers)
		.orderBy(desc(alMamharahManagers.createdAt))
	return rows.map(row => ({
		id: row.id,
		email: row.email,
		fullName: row.fullName,
		role: row.role,
		status: row.status,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		hasPassword: Boolean(row.passwordHash)
	}))
}

/** Validates an activation token and returns the pending manager. */
export async function validateActivationToken(
	token: string
): Promise<{ manager: AlMamharahManager; tokenId: string } | null> {
	const [row] = await db
		.select({ tokenRow: alMamharahManagerTokens, manager: alMamharahManagers })
		.from(alMamharahManagerTokens)
		.innerJoin(alMamharahManagers, eq(alMamharahManagerTokens.managerId, alMamharahManagers.id))
		.where(
			and(
				eq(alMamharahManagerTokens.token, token),
				eq(alMamharahManagerTokens.type, 'ACTIVATION'),
				isNull(alMamharahManagerTokens.usedAt),
				gt(alMamharahManagerTokens.expiresAt, new Date())
			)
		)
		.limit(1)

	if (!row) return null
	if (row.manager.status !== 'PENDING') return { manager: row.manager, tokenId: row.tokenRow.id }
	return { manager: row.manager, tokenId: row.tokenRow.id }
}

export interface ActivateResult {
	manager: AlMamharahManager
}

/** Sets a password for a PENDING manager and activates the account. */
export async function activateManager(options: {
	token: string
	password: string
	fullName?: string
}): Promise<ActivateResult> {
	const found = await validateActivationToken(options.token)
	if (!found) throw new NotFoundError('This activation link is invalid or has expired')
	if (found.manager.status === 'REVOKED') {
		throw new AuthorizationError('This manager account has been revoked')
	}
	if (found.manager.role === 'PRIMARY' && found.manager.status === 'ACTIVE') {
		throw new ConflictError('This account is already active')
	}

	const passwordHash = await bcrypt.hash(options.password, BCRYPT_ROUNDS)
	const [manager] = await db
		.update(alMamharahManagers)
		.set({
			passwordHash,
			status: 'ACTIVE',
			fullName: options.fullName?.trim() || found.manager.fullName,
			updatedAt: new Date()
		})
		.where(eq(alMamharahManagers.id, found.manager.id))
		.returning()

	await db
		.update(alMamharahManagerTokens)
		.set({ usedAt: new Date() })
		.where(eq(alMamharahManagerTokens.id, found.tokenId))

	await recordAudit({
		actorType: 'MANAGER',
		actor: manager.email,
		action: 'MANAGER_ACTIVATED',
		entity: 'manager',
		entityId: manager.id
	})
	logger.info({ managerId: manager.id }, 'Al-Mamharah manager activated')
	return { manager }
}

/** Builds the public activation link. */
export function managerActivationLink(token: string): string {
	const base = env.AL_MAMHARAH_SITE_URL.replace(/\/+$/, '')
	return `${base}/al-mamharah/manager/activate/?token=${encodeURIComponent(token)}`
}

/** Sends the manager activation email. Throws if SMTP fails. */
export async function sendManagerActivationEmail(
	to: string,
	options: { token: string; invitedBy: string; fullName?: string | null }
): Promise<void> {
	const link = managerActivationLink(options.token)
	const subject = 'Al-Mamharah — Set up your Programme Manager account'
	const content = `
		<p style="margin:0 0 12px;">Assalāmu ʿalaykum${options.fullName ? ` ${options.fullName}` : ''},</p>
		<p style="margin:0 0 8px;">You have been invited as a Programme Manager for Al-Mamharah (الممهرة), the Qur'an revision and retention programme.</p>
		<p style="margin:0 0 8px;">Click the button below to set your password and activate your account. The link expires in 7 days.</p>
		${emailButton('Activate my account', link)}
		<p style="margin:12px 0 8px; color:#6b7280; font-size:12px;">Or copy this link into your browser:<br/>${link}</p>
		<p style="margin:0; color:#6b7280; font-size:12px;">Invited by ${options.invitedBy}. If you were not expecting this, you can ignore this email.</p>
	`
	await sendEmailWithContent({ to, subject, html: brandEmail(subject, content) })
}

/** True when a manager JWT payload comes from a primary manager. */
export function isPrimaryPayload(payload: ManagerTokenPayload): boolean {
	return payload.role === 'PRIMARY'
}
