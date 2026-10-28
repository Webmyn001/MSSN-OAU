import { and, count, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from '../../lib/db'
import {
	alMamharahApplications,
	alMamharahParticipants,
	type AlMamharahApplication,
	type AlMamharahMasar
} from '../../db/schema'
import { ConflictError, NotFoundError, ValidationError } from '../../lib/errors'
import { isUniqueViolation } from '../../lib/pg-error'
import { recordAudit } from './audit'
import { getSettings } from './settings'
import { dateInTimeZone, isValidISODate, maxISO } from './dates'
import { logger } from '../../lib/logger'

// * Application review and approval (Programme Manager actions).

export interface ApplicationInput {
	fullName: string
	email: string
	phone?: string
	matricNumber: string
	faculty: string
	department: string
	masar: AlMamharahMasar
	startSurah?: string
	startPage?: number
	startDirection?: string
	// * Tajweed track (TUHFATUL_ATFAL | JAZARIYYAH | SHAATIBIYYAH) — compulsory.
	tajweedTrack: string
	confirmedMemorisation: boolean
	confirmedTajweed: boolean
	agreedGuidelines: boolean
}

/** Trims and collapses internal whitespace. */
export function normalizePersonName(value: string): string {
	return value.trim().replace(/\s+/g, ' ')
}

/** Submits a new application. Throws ConflictError on duplicate email/matric. */
export async function submitApplication(input: ApplicationInput): Promise<AlMamharahApplication> {
	if (!input.tajweedTrack?.trim()) {
		throw new ValidationError('Please choose a tajweed track')
	}

	const values = {
		fullName: normalizePersonName(input.fullName),
		email: input.email.trim().toLowerCase(),
		phone: input.phone?.trim() || null,
		matricNumber: input.matricNumber.trim().toUpperCase(),
		faculty: input.faculty.trim(),
		department: input.department.trim(),
		masar: input.masar,
		startSurah: input.startSurah?.trim() || null,
		startPage: input.startPage ?? null,
		startDirection: input.startDirection?.trim() || null,
		tajweedTrack: input.tajweedTrack?.trim() || null,
		confirmedMemorisation: true,
		confirmedTajweed: true,
		agreedGuidelines: true,
		status: 'PENDING' as const
	}

	if (!values.confirmedMemorisation || !values.confirmedTajweed || !values.agreedGuidelines) {
		throw new ValidationError('All eligibility confirmations are required')
	}

	try {
		const [application] = await db.insert(alMamharahApplications).values(values).returning()
		logger.info({ applicationId: application.id }, 'New Al-Mamharah application submitted')
		await recordAudit({
			actorType: 'SYSTEM',
			action: 'APPLICATION_SUBMITTED',
			entity: 'application',
			entityId: application.id,
			details: { masar: values.masar }
		})
		return application
	} catch (error) {
		if (isUniqueViolation(error)) {
			throw new ConflictError(
				'An application with this email address or matriculation number already exists. Please contact the Programme Manager if you need to update your application.'
			)
		}
		throw error
	}
}

export interface ApplicationFilters {
	status?: 'PENDING' | 'APPROVED' | 'REJECTED'
	search?: string
	page: number
	limit: number
}

export interface ApplicationListResult {
	items: AlMamharahApplication[]
	total: number
	page: number
	limit: number
}

/** Lists applications with optional status filter, search and pagination. */
export async function listApplications(
	filters: ApplicationFilters
): Promise<ApplicationListResult> {
	const conditions = []
	if (filters.status) conditions.push(eq(alMamharahApplications.status, filters.status))
	if (filters.search?.trim()) {
		const q = `%${filters.search.trim()}%`
		conditions.push(
			or(
				ilike(alMamharahApplications.fullName, q),
				ilike(alMamharahApplications.email, q),
				ilike(alMamharahApplications.matricNumber, q),
				ilike(alMamharahApplications.faculty, q),
				ilike(alMamharahApplications.department, q)
			)
		)
	}
	const where = conditions.length > 0 ? and(...conditions) : undefined
	const offset = (filters.page - 1) * filters.limit

	const [items, totalRows] = await Promise.all([
		db
			.select()
			.from(alMamharahApplications)
			.where(where)
			.orderBy(desc(alMamharahApplications.createdAt))
			.limit(filters.limit)
			.offset(offset),
		db.select({ total: count() }).from(alMamharahApplications).where(where)
	])

	return {
		items,
		total: totalRows[0]?.total ?? 0,
		page: filters.page,
		limit: filters.limit
	}
}

/** Fetches a single application by id. */
export async function getApplication(id: string): Promise<AlMamharahApplication> {
	const [application] = await db
		.select()
		.from(alMamharahApplications)
		.where(eq(alMamharahApplications.id, id))
		.limit(1)
	if (!application) throw new NotFoundError('Application not found')
	return application
}

/**
 * Corrects an application on the applicant's behalf (manager only).
 *
 * Applications are often submitted with typos or the wrong track, so the
 * manager can reopen the original form and save the corrected answers. When the
 * application has already been approved the linked participant is kept in sync
 * (name, email, masār and start position). Changing the tajweed track clears the
 * old placement pass because the new matn needs its own placement check.
 */
export async function updateApplication(
	applicationId: string,
	input: ApplicationInput,
	options: { updatedBy: string }
): Promise<AlMamharahApplication> {
	if (!input.tajweedTrack?.trim()) {
		throw new ValidationError('Please choose a tajweed track')
	}

	const values = {
		fullName: normalizePersonName(input.fullName),
		email: input.email.trim().toLowerCase(),
		phone: input.phone?.trim() || null,
		matricNumber: input.matricNumber.trim().toUpperCase(),
		faculty: input.faculty.trim(),
		department: input.department.trim(),
		masar: input.masar,
		startSurah: input.startSurah?.trim() || null,
		startPage: input.startPage ?? null,
		startDirection: input.startDirection?.trim() || null,
		tajweedTrack: input.tajweedTrack.trim(),
		confirmedMemorisation: true,
		confirmedTajweed: true,
		agreedGuidelines: true
	}

	try {
		const result = await db.transaction(async tx => {
			const [existing] = await tx
				.select()
				.from(alMamharahApplications)
				.where(eq(alMamharahApplications.id, applicationId))
				.for('update')
			if (!existing) throw new NotFoundError('Application not found')

			const [updated] = await tx
				.update(alMamharahApplications)
				.set({ ...values, updatedAt: new Date() })
				.where(eq(alMamharahApplications.id, applicationId))
				.returning()

			const [participant] = await tx
				.select()
				.from(alMamharahParticipants)
				.where(eq(alMamharahParticipants.applicationId, applicationId))
				.limit(1)

			if (participant) {
				const trackChanged = (participant.tajweedTrack ?? null) !== values.tajweedTrack
				await tx
					.update(alMamharahParticipants)
					.set({
						displayName: values.fullName,
						email: values.email,
						masar: values.masar,
						startSurah: values.startSurah,
						startPage: values.startPage,
						startDirection: values.startDirection,
						tajweedTrack: values.tajweedTrack,
						...(trackChanged ? { tajweedPlacementPassedAt: null } : {}),
						updatedAt: new Date()
					})
					.where(eq(alMamharahParticipants.id, participant.id))
			}

			return { updated, existing, participantSynced: Boolean(participant) }
		})

		const changedFields = Object.keys(values).filter(
			key => (result.existing as Record<string, unknown>)[key] !== values[key as keyof typeof values]
		)

		await recordAudit({
			actorType: 'MANAGER',
			actor: options.updatedBy,
			action: 'APPLICATION_UPDATED',
			entity: 'application',
			entityId: applicationId,
			details: {
				changedFields,
				participantSynced: result.participantSynced
			}
		})

		return result.updated
	} catch (error) {
		if (isUniqueViolation(error)) {
			throw new ConflictError(
				'Another application already uses this email address or matriculation number.'
			)
		}
		throw error
	}
}

export interface ApproveResult {
	application: AlMamharahApplication
	participantId: string
}

/**
 * Approves a pending application and creates the participant record.
 * The participant's first eligible day defaults to the day they registered
 * (never earlier than the programme start), so a new sign-up never begins
 * with days counted as missed.
 */
export async function approveApplication(
	applicationId: string,
	options: { reviewedBy: string; startDate?: string }
): Promise<ApproveResult> {
	const settings = await getSettings()
	const requestedStart = options.startDate
	if (requestedStart !== undefined && !isValidISODate(requestedStart)) {
		throw new ValidationError('Invalid start date')
	}
	if (requestedStart !== undefined && requestedStart > settings.end) {
		throw new ValidationError('Start date cannot be after the programme end date')
	}

	const result = await db.transaction(async tx => {
		const [application] = await tx
			.select()
			.from(alMamharahApplications)
			.where(eq(alMamharahApplications.id, applicationId))
			.for('update')
		if (!application) throw new NotFoundError('Application not found')
		if (application.status !== 'PENDING') {
			throw new ConflictError(
				`Only pending applications can be approved (current: ${application.status})`
			)
		}

		const registeredOn = dateInTimeZone(application.createdAt, settings.timezone)
		let startDate = requestedStart ?? maxISO(registeredOn, settings.start)
		if (startDate < settings.start) startDate = settings.start
		if (startDate > settings.end) {
			throw new ValidationError('Start date cannot be after the programme end date')
		}

		const [updated] = await tx
			.update(alMamharahApplications)
			.set({
				status: 'APPROVED',
				reviewedBy: options.reviewedBy,
				reviewedAt: new Date(),
				reviewNotes: null,
				updatedAt: new Date()
			})
			.where(eq(alMamharahApplications.id, applicationId))
			.returning()

		const [participant] = await tx
			.insert(alMamharahParticipants)
			.values({
				applicationId: application.id,
				displayName: application.fullName,
				email: application.email,
				masar: application.masar,
				startDate,
				startSurah: application.startSurah,
				startPage: application.startPage,
				startDirection: application.startDirection,
				tajweedTrack: application.tajweedTrack,
				status: 'ACTIVE'
			})
			.returning()

		return { application: updated, participantId: participant.id, startDate }
	})

	await recordAudit({
		actorType: 'MANAGER',
		actor: options.reviewedBy,
		action: 'APPLICATION_APPROVED',
		entity: 'application',
		entityId: applicationId,
		details: { participantId: result.participantId, startDate: result.startDate }
	})

	return result
}

/** Rejects a pending application (never deletes data). */
export async function rejectApplication(
	applicationId: string,
	options: { reviewedBy: string; notes?: string }
): Promise<AlMamharahApplication> {
	const application = await getApplication(applicationId)
	if (application.status !== 'PENDING') {
		throw new ConflictError(
			'Only pending applications can be rejected. Suspend the participant instead if access must be withdrawn.'
		)
	}

	const [updated] = await db
		.update(alMamharahApplications)
		.set({
			status: 'REJECTED',
			reviewedBy: options.reviewedBy,
			reviewedAt: new Date(),
			reviewNotes: options.notes?.trim() || null,
			updatedAt: new Date()
		})
		.where(eq(alMamharahApplications.id, applicationId))
		.returning()

	await recordAudit({
		actorType: 'MANAGER',
		actor: options.reviewedBy,
		action: 'APPLICATION_REJECTED',
		entity: 'application',
		entityId: applicationId,
		details: { notes: options.notes ?? null }
	})

	return updated
}

/** Returns counts by status for the manager overview. */
export async function applicationCounts(): Promise<{
	total: number
	pending: number
	approved: number
	rejected: number
}> {
	const rows = await db
		.select({ status: alMamharahApplications.status, total: count() })
		.from(alMamharahApplications)
		.groupBy(alMamharahApplications.status)

	const result = { total: 0, pending: 0, approved: 0, rejected: 0 }
	for (const row of rows) {
		result.total += row.total
		if (row.status === 'PENDING') result.pending = row.total
		if (row.status === 'APPROVED') result.approved = row.total
		if (row.status === 'REJECTED') result.rejected = row.total
	}
	return result
}

/** Exported for CSV reports. */
export async function listApplicationsForExport(status?: string): Promise<AlMamharahApplication[]> {
	const where = status
		? eq(alMamharahApplications.status, status as AlMamharahApplication['status'])
		: undefined
	return db
		.select()
		.from(alMamharahApplications)
		.where(where)
		.orderBy(desc(alMamharahApplications.createdAt))
}
