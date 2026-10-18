import { count, desc, ilike } from 'drizzle-orm'
import { db } from '../../lib/db'
import { alMamharahAuditLog, type AlMamharahAuditEntry } from '../../db/schema'
import { logger } from '../../lib/logger'

// * Audit trail for important Al-Mamharah administrative and access events.

export interface AuditInput {
	actorType: 'MANAGER' | 'SYSTEM' | 'PARTICIPANT'
	// * Manager email, participant id, or 'system'
	actor?: string
	action: string
	entity?: string
	entityId?: string
	details?: Record<string, unknown>
}

/**
 * Records an audit entry. Never throws — audit failures must not break the
 * operation being audited (they are logged instead).
 */
export async function recordAudit(input: AuditInput): Promise<void> {
	try {
		await db.insert(alMamharahAuditLog).values({
			actorType: input.actorType,
			actor: input.actor ?? null,
			action: input.action,
			entity: input.entity ?? null,
			entityId: input.entityId ?? null,
			details: input.details ?? {}
		})
	} catch (error) {
		logger.error({ error, input }, 'Failed writing Al-Mamharah audit entry')
	}
}

export interface AuditListResult {
	items: AlMamharahAuditEntry[]
	total: number
	page: number
	limit: number
}

/** Paginated audit trail for managers. */
export async function listAudit(options: {
	page: number
	limit: number
	action?: string
}): Promise<AuditListResult> {
	const where = options.action ? ilike(alMamharahAuditLog.action, `%${options.action}%`) : undefined
	const offset = (options.page - 1) * options.limit

	const [items, totalRows] = await Promise.all([
		db
			.select()
			.from(alMamharahAuditLog)
			.where(where)
			.orderBy(desc(alMamharahAuditLog.createdAt))
			.limit(options.limit)
			.offset(offset),
		db.select({ total: count() }).from(alMamharahAuditLog).where(where)
	])

	return { items, total: totalRows[0]?.total ?? 0, page: options.page, limit: options.limit }
}
