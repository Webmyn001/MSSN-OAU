import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core'
import { users } from './users.js'

// * Forms table
export const forms = pgTable(
	'forms',
	{
	id: uuid('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	// * Form fields definition (JSON)
	fields: jsonb('fields').notNull().$type<
		Array<{
			name: string
			label: string
			type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date'
			required?: boolean
			options?: string[] // * For select, radio, checkbox
			placeholder?: string
			validation?: {
				min?: number
				max?: number
				pattern?: string
			}
		}>
	>(),
	isPublic: boolean('is_public').notNull().default(true),
	allowMultipleSubmissions: boolean('allow_multiple_submissions').notNull().default(false),
	submissionCount: integer('submission_count').notNull().default(0),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id, { onDelete: 'restrict' }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		// * Indexes for common queries
		isPublicIdx: index('forms_is_public_idx').on(table.isPublic),
		createdByIdx: index('forms_created_by_idx').on(table.createdBy)
	})
)

// * Form submissions table
export const formSubmissions = pgTable(
	'form_submissions',
	{
	id: uuid('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	formId: uuid('form_id')
		.notNull()
		.references(() => forms.id, { onDelete: 'cascade' }),
	submittedBy: uuid('submitted_by').references(() => users.id, { onDelete: 'set null' }), // * Nullable for anonymous submissions
	// * Form responses (JSON matching form fields)
	responses: jsonb('responses').notNull().$type<Record<string, unknown>>(),
	submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => ({
		// * Indexes for common queries
		formIdIdx: index('form_submissions_form_id_idx').on(table.formId),
		submittedByIdx: index('form_submissions_submitted_by_idx').on(table.submittedBy),
		submittedAtIdx: index('form_submissions_submitted_at_idx').on(table.submittedAt)
	})
)

// * Export types
export type Form = typeof forms.$inferSelect
export type NewForm = typeof forms.$inferInsert
export type FormSubmission = typeof formSubmissions.$inferSelect
export type NewFormSubmission = typeof formSubmissions.$inferInsert
