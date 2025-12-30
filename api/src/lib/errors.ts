import { HTTPException } from 'hono/http-exception'

// * Custom error classes extending HTTPException
export class ValidationError extends HTTPException {
	constructor(message: string) {
		super(400, { message })
		Object.setPrototypeOf(this, ValidationError.prototype)
		Object.defineProperty(this, 'name', { value: 'ValidationError' })
	}
}

export class AuthenticationError extends HTTPException {
	constructor(message: string = 'Authentication required') {
		super(401, { message })
		Object.setPrototypeOf(this, AuthenticationError.prototype)
		Object.defineProperty(this, 'name', { value: 'AuthenticationError' })
	}
}

export class AuthorizationError extends HTTPException {
	constructor(message: string = 'Insufficient permissions') {
		super(403, { message })
		Object.setPrototypeOf(this, AuthorizationError.prototype)
		Object.defineProperty(this, 'name', { value: 'AuthorizationError' })
	}
}

export class NotFoundError extends HTTPException {
	constructor(message: string = 'Resource not found') {
		super(404, { message })
		Object.setPrototypeOf(this, NotFoundError.prototype)
		Object.defineProperty(this, 'name', { value: 'NotFoundError' })
	}
}

export class ConflictError extends HTTPException {
	constructor(message: string = 'Resource already exists') {
		super(409, { message })
		Object.setPrototypeOf(this, ConflictError.prototype)
		Object.defineProperty(this, 'name', { value: 'ConflictError' })
	}
}

export class InternalServerError extends HTTPException {
	constructor(message: string = 'Internal server error') {
		super(500, { message })
		Object.setPrototypeOf(this, InternalServerError.prototype)
		Object.defineProperty(this, 'name', { value: 'InternalServerError' })
	}
}

// * Error code constants
export const ERROR_CODES = {
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
	AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
	NOT_FOUND: 'NOT_FOUND',
	CONFLICT: 'CONFLICT',
	INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const

// * Error factory functions
export const createValidationError = (message: string) => new ValidationError(message)
export const createAuthenticationError = (message?: string) => new AuthenticationError(message)
export const createAuthorizationError = (message?: string) => new AuthorizationError(message)
export const createNotFoundError = (message?: string) => new NotFoundError(message)
export const createConflictError = (message?: string) => new ConflictError(message)
export const createInternalServerError = (message?: string) => new InternalServerError(message)
