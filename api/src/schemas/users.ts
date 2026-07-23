import { z } from 'zod'

// * Update current user profile schema
export const updateProfileSchema = z.object({
	fullName: z.string().min(1).max(255).optional(),
	phone: z.string().max(20).optional(),
	email: z.string().email().optional()
})

// * Dues payment schema
export const duesPaymentSchema = z.object({
	amount: z.number().positive().optional(),
	currency: z.string().default('NGN'),
	sessionId: z.string().uuid().optional()
})

// * List users query schema (Exco only)
export const listUsersQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	search: z.string().optional(),
	role: z.enum(['member', 'exco']).optional(),
	duesPaid: z.coerce.boolean().optional(),
	sessionId: z.string().uuid().optional()
})

// * Update user schema (Exco only)
export const updateUserSchema = z.object({
	fullName: z.string().min(1).max(255).optional(),
	email: z.string().email().optional(),
	phone: z.string().max(20).optional(),
	role: z.enum(['member', 'exco']).optional(),
	duesPaid: z.boolean().optional() // * Manual override (Exco only)
})
