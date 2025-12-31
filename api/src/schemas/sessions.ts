import { z } from 'zod'

// * Create academic session schema
export const createSessionSchema = z.object({
	name: z.string().min(1).max(20),
	startDate: z.string().datetime(),
	endDate: z.string().datetime(),
	isActive: z.boolean()
})

// * List sessions query schema
export const listSessionsQuerySchema = z.object({
	active: z.coerce.boolean().optional()
})

