import { z } from 'zod'

// * Validation schemas for the Al-Mamharah programme API.

export const alMamharahMasarSchema = z.enum([
	'THREE_PAGES',
	'FOUR_PAGES',
	'ONE_JUZ',
	'THREE_JUZ',
	'FIVE_JUZ'
])

export const alMamharahTaskTypeSchema = z.enum(['MUROJAAH', 'TAJWEED_QIRAAT'])

export const alMamharahParticipantStatusSchema = z.enum(['ACTIVE', 'SUSPENDED'])

export const alMamharahApplicationStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED'])

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected a YYYY-MM-DD date')

const requiredConfirmation = (message: string) =>
	z.boolean().refine(value => value === true, { message })

// * --- Public ---------------------------------------------------------------

export const submitApplicationSchema = z.object({
	fullName: z.string().trim().min(2, 'Full name is required').max(255),
	email: z.string().trim().email('Enter a valid email address').max(255),
	phone: z.string().trim().min(7, 'Enter a valid phone number').max(30).optional(),
	matricNumber: z.string().trim().min(4, 'Enter your matriculation number').max(50),
	faculty: z.string().trim().min(2, 'Faculty is required').max(150),
	department: z.string().trim().min(2, 'Department is required').max(150),
	masar: alMamharahMasarSchema,
	confirmedMemorisation: requiredConfirmation("Please confirm that you have memorised the Qur'an"),
	confirmedTajweed: requiredConfirmation('Please confirm that you have studied tajwīd'),
	agreedGuidelines: requiredConfirmation('Please agree to the programme guidelines')
})

export const enterProgrammeSchema = z.object({
	fullName: z.string().trim().min(2, 'Enter your full name').max(255)
})

export const verifyEnterCodeSchema = z.object({
	fullName: z.string().trim().min(2, 'Enter your full name').max(255),
	code: z
		.string()
		.trim()
		.regex(/^\d{6}$/, 'Enter the 6-digit code from your email')
})

// * --- Participant ----------------------------------------------------------

export const recordCompletionSchema = z.object({
	taskType: alMamharahTaskTypeSchema.optional(),
	note: z.string().trim().max(500).optional()
})

export const deleteOwnCompletionSchema = z.object({
	completionId: z.string().uuid()
})

// * --- Manager --------------------------------------------------------------

export const managerLoginSchema = z.object({
	email: z.string().trim().email('Enter a valid email address'),
	password: z.string().min(1, 'Password is required')
})

export const activateManagerSchema = z.object({
	token: z.string().trim().min(20, 'Invalid activation token'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.max(128, 'Password is too long'),
	fullName: z.string().trim().min(2).max(255).optional()
})

export const inviteManagerSchema = z.object({
	email: z.string().trim().email('Enter a valid email address'),
	fullName: z.string().trim().min(2).max(255).optional()
})

export const approveApplicationSchema = z.object({
	startDate: isoDateSchema.optional()
})

export const rejectApplicationSchema = z.object({
	notes: z.string().trim().max(1000).optional()
})

export const updateParticipantStatusSchema = z.object({
	status: alMamharahParticipantStatusSchema,
	notes: z.string().trim().max(500).optional()
})

export const managerCompletionSchema = z.object({
	participantId: z.string().uuid(),
	date: isoDateSchema,
	taskType: alMamharahTaskTypeSchema.optional(),
	verified: z.boolean().optional(),
	note: z.string().trim().max(500).optional()
})

export const deleteCompletionSchema = z.object({
	reason: z.string().trim().min(3, 'Give a short reason').max(500)
})

export const programmeSettingsSchema = z.object({
	start: isoDateSchema,
	end: isoDateSchema,
	timezone: z.string().trim().min(1).max(64),
	tasks: z.array(alMamharahTaskTypeSchema).min(1),
	streakTasks: z.array(alMamharahTaskTypeSchema).min(1)
})

export const listApplicationsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	status: alMamharahApplicationStatusSchema.optional(),
	search: z.string().trim().optional()
})

export const listParticipantsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(200).default(50),
	status: alMamharahParticipantStatusSchema.optional(),
	masar: alMamharahMasarSchema.optional(),
	search: z.string().trim().optional()
})

export const leaderboardQuerySchema = z.object({
	limit: z.coerce.number().int().positive().max(200).default(50)
})

export const dailyProgressQuerySchema = z.object({
	date: isoDateSchema.optional()
})

export const auditQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(200).default(50),
	action: z.string().trim().max(100).optional()
})

export const exportQuerySchema = z.object({
	status: alMamharahApplicationStatusSchema.optional()
})
