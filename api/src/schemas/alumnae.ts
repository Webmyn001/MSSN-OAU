import { z } from 'zod'

// * List alumnae requests query schema
export const listAlumnaeRequestsQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	status: z.enum(['pending', 'approved', 'rejected']).optional()
})

