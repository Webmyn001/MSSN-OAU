import crypto from 'crypto'
import { and, desc, eq, gt, isNull } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { db } from '../../lib/db'
import {
	alMamharahParticipantSessions,
	alMamharahParticipants,
	alMamharahVerificationCodes,
	type AlMamharahParticipant,
	type AlMamharahParticipantSession
} from '../../db/schema'
import { logger } from '../../lib/logger'
import { recordAudit } from './audit'
import { sendEmailWithContent } from '../email/brevo'
import { brandEmail } from '../email/template'

// * "Enter Programme" verification codes and participant sessions.
// * Codes are stored hashed (SHA-256) and expire; sessions are 30-day
// * database-backed tokens granted only after a successful code check.

const CODE_EXPIRY_MS = 10 * 60 * 1000
const MAX_CODE_ATTEMPTS = 5
const PARTICIPANT_SESSION_MS = 30 * 24 * 60 * 60 * 1000

function hashCode(code: string): string {
	return crypto.createHash('sha256').update(code).digest('hex')
}

function generateCode(): string {
	// * 6 digits, no leading zero
	return crypto.randomInt(100_000, 1_000_000).toString()
}

/**
 * Issues a fresh verification code for a participant, invalidating any
 * previous unused code. Returns the plain code (for emailing) — only the
 * hash is persisted.
 */
export async function issueVerificationCode(participantId: string): Promise<string> {
	await db
		.update(alMamharahVerificationCodes)
		.set({ usedAt: new Date() })
		.where(
			and(
				eq(alMamharahVerificationCodes.participantId, participantId),
				eq(alMamharahVerificationCodes.purpose, 'ENTER_PROGRAMME'),
				isNull(alMamharahVerificationCodes.usedAt)
			)
		)

	const code = generateCode()
	await db.insert(alMamharahVerificationCodes).values({
		participantId,
		codeHash: hashCode(code),
		purpose: 'ENTER_PROGRAMME',
		expiresAt: new Date(Date.now() + CODE_EXPIRY_MS)
	})

	logger.info({ participantId }, 'Al-Mamharah verification code issued')
	return code
}

/**
 * Checks a verification code. Failed attempts are counted (max 5, after which
 * the code is burned). A used or expired code always fails.
 */
export async function verifyParticipantCode(participantId: string, code: string): Promise<boolean> {
	const [record] = await db
		.select()
		.from(alMamharahVerificationCodes)
		.where(
			and(
				eq(alMamharahVerificationCodes.participantId, participantId),
				eq(alMamharahVerificationCodes.purpose, 'ENTER_PROGRAMME'),
				isNull(alMamharahVerificationCodes.usedAt),
				gt(alMamharahVerificationCodes.expiresAt, new Date())
			)
		)
		.orderBy(desc(alMamharahVerificationCodes.createdAt))
		.limit(1)

	if (!record) return false

	if (record.attempts >= MAX_CODE_ATTEMPTS) {
		await db
			.update(alMamharahVerificationCodes)
			.set({ usedAt: new Date() })
			.where(eq(alMamharahVerificationCodes.id, record.id))
		return false
	}

	const expected = Buffer.from(record.codeHash, 'hex')
	const actual = Buffer.from(hashCode(code.trim()), 'hex')
	const matches = expected.length === actual.length && crypto.timingSafeEqual(expected, actual)

	if (!matches) {
		const attempts = record.attempts + 1
		await db
			.update(alMamharahVerificationCodes)
			.set({ attempts, usedAt: attempts >= MAX_CODE_ATTEMPTS ? new Date() : null })
			.where(eq(alMamharahVerificationCodes.id, record.id))
		return false
	}

	await db
		.update(alMamharahVerificationCodes)
		.set({ usedAt: new Date() })
		.where(eq(alMamharahVerificationCodes.id, record.id))
	return true
}

export interface ParticipantSessionResult {
	token: string
	expiresAt: Date
}

/** Creates a 30-day participant session token. */
export async function createParticipantSession(
	participantId: string
): Promise<ParticipantSessionResult> {
	const token = createId()
	const expiresAt = new Date(Date.now() + PARTICIPANT_SESSION_MS)
	await db.insert(alMamharahParticipantSessions).values({ participantId, token, expiresAt })
	logger.info({ participantId }, 'Al-Mamharah participant session created')
	return { token, expiresAt }
}

/** Resolves a session token to an active participant, or null. */
export async function validateParticipantSession(
	token: string
): Promise<{ session: AlMamharahParticipantSession; participant: AlMamharahParticipant } | null> {
	try {
		const [row] = await db
			.select({ session: alMamharahParticipantSessions, participant: alMamharahParticipants })
			.from(alMamharahParticipantSessions)
			.innerJoin(
				alMamharahParticipants,
				eq(alMamharahParticipantSessions.participantId, alMamharahParticipants.id)
			)
			.where(
				and(
					eq(alMamharahParticipantSessions.token, token),
					gt(alMamharahParticipantSessions.expiresAt, new Date()),
					eq(alMamharahParticipants.status, 'ACTIVE')
				)
			)
			.limit(1)

		if (!row) return null

		await db
			.update(alMamharahParticipantSessions)
			.set({ lastUsedAt: new Date() })
			.where(eq(alMamharahParticipantSessions.id, row.session.id))

		return row
	} catch (error) {
		logger.error({ error }, 'Failed to validate Al-Mamharah participant session')
		return null
	}
}

/** Revokes a single participant session token. */
export async function revokeParticipantSession(token: string): Promise<void> {
	await db
		.delete(alMamharahParticipantSessions)
		.where(eq(alMamharahParticipantSessions.token, token))
}

/** Revokes all sessions for a participant (used when suspended). */
export async function revokeAllParticipantSessions(participantId: string): Promise<void> {
	await db
		.delete(alMamharahParticipantSessions)
		.where(eq(alMamharahParticipantSessions.participantId, participantId))
}

/** Email content for the enter-programme verification code. */
export function verificationEmailHtml(options: {
	fullName: string
	code: string
	expiresMinutes: number
}): { subject: string; html: string; text: string } {
	const subject = 'Al-Mamharah — Your verification code'
	const content = `
		<p style="margin:0 0 12px;">Assalāmu ʿalaykum ${options.fullName},</p>
		<p style="margin:0 0 16px;">Use the code below to enter the Al-Mamharah programme dashboard. It expires in ${options.expiresMinutes} minutes.</p>
		<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
			<tr>
				<td style="background-color:#f0f7f2; border:1px solid #e3ece6; border-radius:10px; padding:14px 28px;">
					<div style="font-family:'Courier New',Courier,monospace; font-size:32px; font-weight:700; letter-spacing:10px; color:#115F34;">${options.code}</div>
				</td>
			</tr>
		</table>
		<p style="margin:0 0 8px; color:#6b7280; font-size:12px;">If you did not request this code, you can safely ignore this email. Never share this code with anyone.</p>
		<p style="margin:0; color:#6b7280; font-size:12px;">If you need help, contact the Programme Manager: 09039052468, 07035199803, 07069638881.</p>
	`
	const html = brandEmail(subject, content)
	const text = `Assalamu alaykum ${options.fullName},\n\nYour Al-Mamharah verification code is ${options.code}. It expires in ${options.expiresMinutes} minutes.\n\nIf you did not request this code, ignore this email.`
	return { subject, html, text }
}

/** Sends the verification code email. Throws if SMTP fails. */
export async function sendVerificationEmail(
	to: string,
	fullName: string,
	code: string
): Promise<void> {
	const { subject, html, text } = verificationEmailHtml({
		fullName,
		code,
		expiresMinutes: Math.round(CODE_EXPIRY_MS / 60_000)
	})
	await sendEmailWithContent({ to, subject, html, text })
}

/** Audit helper for successful programme entry. */
export async function auditAccessGranted(participantId: string, name: string): Promise<void> {
	await recordAudit({
		actorType: 'PARTICIPANT',
		actor: participantId,
		action: 'PARTICIPANT_ENTERED',
		entity: 'participant',
		entityId: participantId,
		details: { name }
	})
}
