import {
	pgTable,
	pgEnum,
	uuid,
	varchar,
	text,
	boolean,
	timestamp,
	jsonb,
	index
} from 'drizzle-orm/pg-core'

// * User role enum
export const userRoleEnum = pgEnum('user_role', ['MEMBER', 'EXCO'])

// * Users table
export const users = pgTable(
	'users',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		email: varchar('email', { length: 255 }).notNull().unique(),
		username: varchar('username', { length: 100 }).notNull().unique(),
		passwordHash: text('password_hash').notNull(),
		fullName: varchar('full_name', { length: 255 }).notNull(),
		phone: varchar('phone', { length: 20 }),
		matricNumber: varchar('matric_number', { length: 50 }),
		role: userRoleEnum('role').notNull().default('MEMBER'),
		// * 2FA fields
		has2FA: boolean('has_2fa').notNull().default(false),
		twoFASecret: text('two_fa_secret'),
		twoFABackupCodes: jsonb('two_fa_backup_codes').$type<string[]>(),
		// * Note: Dues are tracked per academic session in dues_payments table
		// * Note: Exco status is determined by checking excos table for current session
		// * Timestamps
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	table => ({
		// * Indexes for common queries
		emailIdx: index('users_email_idx').on(table.email),
		usernameIdx: index('users_username_idx').on(table.username),
		matricNumberIdx: index('users_matric_number_idx').on(table.matricNumber),
		roleIdx: index('users_role_idx').on(table.role)
	})
)

// * Export types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
