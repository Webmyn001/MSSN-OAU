import type { Context } from 'hono'

// * Standard API response types
export interface SuccessResponse<T = unknown> {
	success: true
	data: T
	meta?: ResponseMeta
}

export interface ErrorResponse {
	success: false
	error: string
	code?: string
	details?: unknown
}

export interface ResponseMeta {
	pagination?: PaginationMeta
	timestamp?: string
	[key: string]: unknown
}

export interface PaginationMeta {
	page: number
	limit: number
	total: number
	totalPages: number
}

// * Success response helper
export function successResponse<T>(
	c: Context,
	data: T,
	meta?: ResponseMeta,
	status: 200 | 201 | 202 | 204 = 200
) {
	return c.json<SuccessResponse<T>>(
		{
			success: true,
			data,
			...(meta && { meta })
		},
		status as 200
	)
}

// * Error response helper
export function errorResponse(
	c: Context,
	error: string,
	code?: string,
	status: 400 | 401 | 403 | 404 | 409 | 500 | 501 = 400,
	details?: unknown
) {
	const response: ErrorResponse = {
		success: false,
		error
	}
	if (code) {
		response.code = code
	}
	if (details) {
		response.details = details
	}
	return c.json<ErrorResponse>(response, status as 400)
}

// * Paginated response helper
export function paginatedResponse<T>(
	c: Context,
	items: T[],
	pagination: {
		page: number
		limit: number
		total: number
	}
) {
	const totalPages = Math.ceil(pagination.total / pagination.limit)

	return successResponse(
		c,
		items,
		{
			pagination: {
				page: pagination.page,
				limit: pagination.limit,
				total: pagination.total,
				totalPages
			},
			timestamp: new Date().toISOString()
		},
		200
	)
}
