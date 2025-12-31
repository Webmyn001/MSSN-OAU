import { z } from 'zod'

// * User registration schema
export const registerSchema = z.object({
	email: z.string().email('Invalid email format').max(255, 'Email too long'),
	password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
	username: z.string().min(3, 'Username must be at least 3 characters').max(100, 'Username too long').optional(),
	fullName: z.string().min(2, 'Full name must be at least 2 characters').max(255, 'Full name too long').optional()
})

export type RegisterInput = z.infer<typeof registerSchema>

// * User login schema
export const loginSchema = z.object({
	email: z.string().email('Invalid email format'),
	password: z.string().min(1, 'Password is required')
})

export type LoginInput = z.infer<typeof loginSchema>

// * Password reset request schema
export const resetPasswordRequestSchema = z.object({
	email: z.string().email('Invalid email format')
})

export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>

// * Password reset confirmation schema
export const resetPasswordConfirmSchema = z.object({
	token: z.string().min(1, 'Token is required'),
	newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long')
})

export type ResetPasswordConfirmInput = z.infer<typeof resetPasswordConfirmSchema>

// * 2FA verification schema
export const verify2FASchema = z.object({
	code: z.string().length(6, '2FA code must be 6 digits').regex(/^\d+$/, '2FA code must be numeric'),
	sessionToken: z.string().optional(), // * For login verification
	setupToken: z.string().optional() // * For setup verification
})

export type Verify2FAInput = z.infer<typeof verify2FASchema>

