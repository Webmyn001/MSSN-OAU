import type { Context, ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { logger } from '../lib/logger.js'
import env from '../lib/env.js'

// * Global error handler middleware
export const errorHandler: ErrorHandler = (error: Error, c: Context) => {
	// * Handle HTTPException (our custom errors)
	if (error instanceof HTTPException) {
		logger.warn(
			{
				status: error.status,
				message: error.message,
				path: c.req.path,
				method: c.req.method
			},
			'HTTP Exception'
		)

		return c.json(
			{
				success: false,
				error: error.message,
				code: getErrorCode(error.status)
			},
			error.status
		)
	}

	// * Handle validation errors (Zod)
	if (error.name === 'ZodError') {
		logger.warn(
			{
				error: error.message,
				path: c.req.path,
				method: c.req.method
			},
			'Validation Error'
		)

		return c.json(
			{
				success: false,
				error: 'Validation failed',
				code: 'VALIDATION_ERROR',
				details: error.message
			},
			400
		)
	}

	// * Handle unknown errors
	logger.error(
		{
			error: error.message,
			stack: error.stack,
			path: c.req.path,
			method: c.req.method
		},
		'Unhandled Error'
	)

	// * Don't expose internal errors in production
	const isDev = env.NODE_ENV === 'development'
	const message = isDev ? error.message : 'Internal server error'

	return c.json(
		{
			success: false,
			error: message,
			code: 'INTERNAL_SERVER_ERROR',
			...(isDev && { stack: error.stack })
		},
		500
	)
}

// * Map HTTP status codes to error codes
function getErrorCode(status: number): string {
	switch (status) {
		case 400:
			return 'VALIDATION_ERROR'
		case 401:
			return 'AUTHENTICATION_ERROR'
		case 403:
			return 'AUTHORIZATION_ERROR'
		case 404:
			return 'NOT_FOUND'
		case 409:
			return 'CONFLICT'
		case 500:
			return 'INTERNAL_SERVER_ERROR'
		default:
			return 'UNKNOWN_ERROR'
	}
}
