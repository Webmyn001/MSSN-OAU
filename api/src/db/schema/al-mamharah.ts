import {
	pgTable,
	pgEnum,
	uuid,
	varchar,
	text,
	boolean,
	integer,
	date,
	timestamp,
	jsonb,
	index,
	uniqueIndex
} from 'drizzle-orm/pg-core'

// * Al-Mamharah (الممهرة) — Qur'an revision & retention programme
// * Organised by the Islamic Affairs Board (IAB), MSSN-OAU Branch

// * Selected masār (revision targets)
export const alMamharahMasarEnum = pgEnum('al_mamharah_masar', [
	'THREE_PAGES',
	'FOUR_PAGES',
	'ONE_JUZ',
	'THREE_JUZ',
	'FOUR_JUZ',
	'FIVE_JUZ',
	'KHATM'
])

// * Application review status
export const alMamharahApplicationStatusEnum = pgEnum('al_mamharah_application_status', [
	'PENDING',
	'APPROVED',
	'REJECTED'
])

// * Participant access status
export const alMamharahParticipantStatusEnum = pgEnum('al_mamharah_participant_status', [
	'ACTIVE',
	'SUSPENDED'
])

// * Programme manager roles (only one PRIMARY manager exists)
export const alMamharahManagerRoleEnum = pgEnum('al_mamharah_manager_role', ['PRIMARY', 'MANAGER'])

// * Programme manager access status
export const alMamharahManagerStatusEnum = pgEnum('al_mamharah_manager_status', [
	'PENDING',
	'ACTIVE',
	'REVOKED'
])

// * Trackable daily tasks (streak requires the tasks set in programme settings)
export const alMamharahTaskTypeEnum = pgEnum('al_mamharah_task_type', [
	'MUROJAAH',
	'TAJWEED_QIRAAT'
])

// * Applications submitted by prospective participants
export const alMamharahApplications = pgTable(
	'al_mamharah_applications',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		fullName: varchar('full_name', { length: 255 }).notNull(),
		email: varchar('email', { length: 255 }).notNull(),
		phone: varchar('phone', { length: 30 }),
		matricNumber: varchar('matric_number', { length: 50 }).notNull(),
		faculty: varchar('faculty', { length: 150 }).notNull(),
		department: varchar('department', { length: 150 }).notNull(),
		masar: alMamharahMasarEnum('masar').notNull(),
		confirmedMemorisation: boolean('confirmed_memorisation').notNull().default(false),
		confirmedTajweed: boolean('confirmed_tajweed').notNull().default(false),
		agreedGuidelines: boolean('agreed_guidelines').notNull().default(false),
		status: alMamharahApplicationStatusEnum('status').notNull().default('PENDING'),
		reviewNotes: text('review_notes'),
		reviewedBy: varchar('reviewed_by', { length: 255 }),
		reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		emailUnique: uniqueIndex('almh_applications_email_idx').on(table.email),
		matricUnique: uniqueIndex('almh_applications_matric_idx').on(table.matricNumber),
		statusIdx: index('almh_applications_status_idx').on(table.status),
		createdAtIdx: index('almh_applications_created_at_idx').on(table.createdAt)
	})
)

// * Approved participants (created when an application is approved)
export const alMamharahParticipants = pgTable(
	'al_mamharah_participants',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		applicationId: uuid('application_id')
			.notNull()
			.references(() => alMamharahApplications.id, { onDelete: 'cascade' }),
		displayName: varchar('display_name', { length: 255 }).notNull(),
		email: varchar('email', { length: 255 }).notNull(),
		masar: alMamharahMasarEnum('masar').notNull(),
		// * First eligible programme day for this participant
		startDate: date('start_date').notNull(),
		status: alMamharahParticipantStatusEnum('status').notNull().default('ACTIVE'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		applicationUnique: uniqueIndex('almh_participants_application_idx').on(table.applicationId),
		emailIdx: index('almh_participants_email_idx').on(table.email),
		statusIdx: index('almh_participants_status_idx').on(table.status),
		startDateIdx: index('almh_participants_start_date_idx').on(table.startDate)
	})
)

// * Daily task completions (self-reported unless verified by an instructor/manager)
export const alMamharahCompletions = pgTable(
	'al_mamharah_completions',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		participantId: uuid('participant_id')
			.notNull()
			.references(() => alMamharahParticipants.id, { onDelete: 'cascade' }),
		programmeDate: date('programme_date').notNull(),
		taskType: alMamharahTaskTypeEnum('task_type').notNull().default('MUROJAAH'),
		verified: boolean('verified').notNull().default(false),
		verifiedBy: varchar('verified_by', { length: 255 }),
		note: text('note'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		// * One record per participant/day/task — duplicates can never inflate streaks
		dayTaskUnique: uniqueIndex('almh_completions_day_task_idx').on(
			table.participantId,
			table.programmeDate,
			table.taskType
		),
		participantIdx: index('almh_completions_participant_idx').on(table.participantId),
		dateIdx: index('almh_completions_date_idx').on(table.programmeDate)
	})
)

// * Participant sessions issued after secure "Enter Programme" verification
export const alMamharahParticipantSessions = pgTable(
	'al_mamharah_participant_sessions',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		participantId: uuid('participant_id')
			.notNull()
			.references(() => alMamharahParticipants.id, { onDelete: 'cascade' }),
		token: text('token').notNull().unique(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		lastUsedAt: timestamp('last_used_at', { withTimezone: true })
	},
	table => ({
		participantIdx: index('almh_participant_sessions_participant_idx').on(table.participantId),
		expiresAtIdx: index('almh_participant_sessions_expires_at_idx').on(table.expiresAt)
	})
)

// * One-time verification codes for the "Enter Programme" popup
// * Codes are stored hashed; a name alone never grants access.
export const alMamharahVerificationCodes = pgTable(
	'al_mamharah_verification_codes',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		participantId: uuid('participant_id')
			.notNull()
			.references(() => alMamharahParticipants.id, { onDelete: 'cascade' }),
		codeHash: text('code_hash').notNull(),
		purpose: varchar('purpose', { length: 50 }).notNull().default('ENTER_PROGRAMME'),
		attempts: integer('attempts').notNull().default(0),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		usedAt: timestamp('used_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		participantIdx: index('almh_verification_codes_participant_idx').on(table.participantId),
		expiresAtIdx: index('almh_verification_codes_expires_at_idx').on(table.expiresAt)
	})
)

// * Programme managers (primary manager is bootstrapped from server configuration)
export const alMamharahManagers = pgTable(
	'al_mamharah_managers',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		email: varchar('email', { length: 255 }).notNull(),
		fullName: varchar('full_name', { length: 255 }),
		role: alMamharahManagerRoleEnum('role').notNull().default('MANAGER'),
		status: alMamharahManagerStatusEnum('status').notNull().default('PENDING'),
		passwordHash: text('password_hash'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		emailUnique: uniqueIndex('almh_managers_email_idx').on(table.email),
		statusIdx: index('almh_managers_status_idx').on(table.status)
	})
)

// * Manager account activation links (single use, expiring)
export const alMamharahManagerTokens = pgTable(
	'al_mamharah_manager_tokens',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		managerId: uuid('manager_id')
			.notNull()
			.references(() => alMamharahManagers.id, { onDelete: 'cascade' }),
		token: text('token').notNull().unique(),
		type: varchar('type', { length: 30 }).notNull().default('ACTIVATION'),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		usedAt: timestamp('used_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		managerIdx: index('almh_manager_tokens_manager_idx').on(table.managerId),
		expiresAtIdx: index('almh_manager_tokens_expires_at_idx').on(table.expiresAt)
	})
)

// * Audit trail for important administrative and access events
export const alMamharahAuditLog = pgTable(
	'al_mamharah_audit_log',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		actorType: varchar('actor_type', { length: 20 }).notNull(),
		actor: varchar('actor', { length: 255 }),
		action: varchar('action', { length: 100 }).notNull(),
		entity: varchar('entity', { length: 50 }),
		entityId: varchar('entity_id', { length: 100 }),
		details: jsonb('details').$type<Record<string, unknown>>().default({}),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		actionIdx: index('almh_audit_log_action_idx').on(table.action),
		createdAtIdx: index('almh_audit_log_created_at_idx').on(table.createdAt)
	})
)

// * Export types
export type AlMamharahMasar = (typeof alMamharahMasarEnum.enumValues)[number]
export type AlMamharahApplicationStatus =
	(typeof alMamharahApplicationStatusEnum.enumValues)[number]
export type AlMamharahParticipantStatus =
	(typeof alMamharahParticipantStatusEnum.enumValues)[number]
export type AlMamharahManagerRole = (typeof alMamharahManagerRoleEnum.enumValues)[number]
export type AlMamharahManagerStatus = (typeof alMamharahManagerStatusEnum.enumValues)[number]
export type AlMamharahTaskType = (typeof alMamharahTaskTypeEnum.enumValues)[number]
export type AlMamharahApplication = typeof alMamharahApplications.$inferSelect
export type NewAlMamharahApplication = typeof alMamharahApplications.$inferInsert
export type AlMamharahParticipant = typeof alMamharahParticipants.$inferSelect
export type NewAlMamharahParticipant = typeof alMamharahParticipants.$inferInsert
export type AlMamharahCompletion = typeof alMamharahCompletions.$inferSelect
export type NewAlMamharahCompletion = typeof alMamharahCompletions.$inferInsert
export type AlMamharahParticipantSession = typeof alMamharahParticipantSessions.$inferSelect
export type AlMamharahVerificationCode = typeof alMamharahVerificationCodes.$inferSelect
export type AlMamharahManager = typeof alMamharahManagers.$inferSelect
export type NewAlMamharahManager = typeof alMamharahManagers.$inferInsert
export type AlMamharahManagerToken = typeof alMamharahManagerTokens.$inferSelect
export type AlMamharahAuditEntry = typeof alMamharahAuditLog.$inferSelect
