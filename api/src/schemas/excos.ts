import { z } from 'zod'

// * Invite Exco schema
export const inviteExcoSchema = z.object({
	email: z.string().email(),
	fullName: z.string().min(1).max(255),
	position: z.string().min(1).max(100),
	phone: z.string().max(20).optional(),
	sessionId: z.string().uuid().optional()
})

// * List Excos query schema
export const listExcosQuerySchema = z.object({
	sessionId: z.string().uuid().optional()
})

// * Update Exco schema
export const updateExcoSchema = z.object({
	position: z.string().min(1).max(100).optional(),
	phone: z.string().max(20).optional(),
	imageUrl: z.string().url().optional()
})
