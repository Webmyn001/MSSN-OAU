import { eq, asc } from 'drizzle-orm'
import { db } from '../lib/db'
import { excoProfiles, type ExcoProfile } from '../db/schema/exco-profiles'
import { academicSessions, type AcademicSession } from '../db/schema/sessions'
import { logger } from '../lib/logger'
import * as fs from 'fs'
import * as path from 'path'

export interface MemberPayload {
	id?: string
	name: string
	position: string
	gender?: string
	phone?: string
	email?: string
	photo?: string
	bio?: string
}

export interface CommitteePayload {
	committee: string
	members: MemberPayload[]
}

export interface SessionPayload {
	session: string
	start_year?: number
	end_year?: number
	executives: CommitteePayload[]
}

export interface ExcosDataPayload {
	sessions: SessionPayload[]
}

const FALLBACK_FILE = path.join(process.cwd(), 'data', 'excos.json')

function readFallbackFile(): ExcosDataPayload | null {
	try {
		if (fs.existsSync(FALLBACK_FILE)) {
			const raw = fs.readFileSync(FALLBACK_FILE, 'utf-8')
			return JSON.parse(raw)
		}
	} catch (e) {
		logger.error({ e }, 'Failed reading fallback JSON file')
	}
	return null
}

function writeFallbackFile(payload: ExcosDataPayload) {
	try {
		const dir = path.dirname(FALLBACK_FILE)
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
		fs.writeFileSync(FALLBACK_FILE, JSON.stringify(payload, null, 2), 'utf-8')
	} catch (e) {
		logger.error({ e }, 'Failed writing fallback JSON file')
	}
}

/**
 * Get all exco profiles grouped by session and committee formatted for UI consumption
 */
export async function getFormattedExcosData(): Promise<ExcosDataPayload> {
	try {
		const sessionsList = await db.select().from(academicSessions).orderBy(asc(academicSessions.name))
		const allProfiles = await db.select().from(excoProfiles).orderBy(asc(excoProfiles.displayOrder), asc(excoProfiles.createdAt))

		if (sessionsList.length === 0 || allProfiles.length === 0) {
			const fallback = readFallbackFile()
			if (fallback) return fallback
			return { sessions: [] }
		}

		const sessionGroupMap = new Map<string, Map<string, ExcoProfile[]>>()

		for (const profile of allProfiles) {
			if (!sessionGroupMap.has(profile.sessionId)) {
				sessionGroupMap.set(profile.sessionId, new Map())
			}
			const committeeMap = sessionGroupMap.get(profile.sessionId)!
			if (!committeeMap.has(profile.committee)) {
				committeeMap.set(profile.committee, [])
			}
			committeeMap.get(profile.committee)!.push(profile)
		}

		const formattedSessions: SessionPayload[] = []

		for (const session of sessionsList) {
			const committeeMap = sessionGroupMap.get(session.id)
			if (!committeeMap || committeeMap.size === 0) continue

			const startYear = parseInt(session.name.split('/')[0]) || session.startDate.getFullYear()
			const endYear = parseInt(session.name.split('/')[1]) || session.endDate.getFullYear()

			const executives: CommitteePayload[] = []
			for (const [committeeName, members] of committeeMap.entries()) {
				executives.push({
					committee: committeeName,
					members: members.map(m => ({
						id: m.id,
						name: m.name,
						position: m.position,
						gender: m.gender || 'male',
						phone: m.phone || undefined,
						email: m.email || undefined,
						photo: m.imageUrl || undefined,
						bio: m.bio || undefined
					}))
				})
			}

			formattedSessions.push({
				session: session.name,
				start_year: startYear,
				end_year: endYear,
				executives
			})
		}

		return { sessions: formattedSessions }
	} catch (error) {
		logger.warn({ error }, 'Database query failed for exco profiles, utilizing JSON storage fallback')
		const fallback = readFallbackFile()
		return fallback || { sessions: [] }
	}
}

/**
 * Bulk save/sync exco profiles dataset into PostgreSQL (with JSON file fallback)
 */
export async function syncExcosDataToDb(payload: ExcosDataPayload): Promise<boolean> {
	if (!payload || !Array.isArray(payload.sessions)) return false

	// Always write local storage fallback file
	writeFallbackFile(payload)

	try {
		const payloadNames = new Set(payload.sessions.map(s => s.session))
		const dbSessions = await db.select().from(academicSessions)

		for (const dbSession of dbSessions) {
			if (payloadNames.has(dbSession.name)) continue
			// Session was removed from the dataset — purge its profiles from the DB
			await db.delete(excoProfiles).where(eq(excoProfiles.sessionId, dbSession.id))
			await db.delete(academicSessions).where(eq(academicSessions.id, dbSession.id))
			logger.info({ session: dbSession.name }, 'Removed deleted exco session from DB')
		}

		for (const sess of payload.sessions) {
			let [dbSession] = await db
				.select()
				.from(academicSessions)
				.where(eq(academicSessions.name, sess.session))
				.limit(1)

			if (!dbSession) {
				const startYear = sess.start_year || parseInt(sess.session.split('/')[0]) || new Date().getFullYear()
				const endYear = sess.end_year || startYear + 1
				const [created] = await db
					.insert(academicSessions)
					.values({
						name: sess.session,
						startDate: new Date(`${startYear}-09-01`),
						endDate: new Date(`${endYear}-07-31`),
						isActive: sess.session === '2024/2025'
					})
					.returning()
				dbSession = created
			}

			if (!dbSession) continue

			await db.delete(excoProfiles).where(eq(excoProfiles.sessionId, dbSession.id))

			let orderCounter = 0
			for (const comm of sess.executives || []) {
				for (const member of comm.members || []) {
					orderCounter++
					await db.insert(excoProfiles).values({
						sessionId: dbSession.id,
						committee: comm.committee || 'Executive Council',
						name: member.name,
						position: member.position,
						gender: member.gender || 'male',
						phone: member.phone || null,
						email: member.email || null,
						imageUrl: member.photo || null,
						bio: member.bio || null,
						displayOrder: orderCounter
					})
				}
			}
		}

		logger.info('Synced exco profiles dataset into PostgreSQL successfully')
		return true
	} catch (error) {
		logger.warn({ error }, 'DB sync encountered warning/fallback, saved fallback storage file')
		return true
	}
}
