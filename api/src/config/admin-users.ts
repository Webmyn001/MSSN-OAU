export interface AdminUser {
	email: string
	passwordHash: string
	fullName: string
	role: 'admin' | 'editor'
}

/**
 * Hardcoded admin users.
 * Passwords are bcrypt-hashed. To add a new user:
 * 1. Run: node -e "require('bcrypt').hash('your-password', 10).then(h => console.log(h))"
 * 2. Add the email + hash below
 */
export const ADMIN_USERS: AdminUser[] = [
	{
		email: 'bellomuhyideen0001@gmail.com',
		passwordHash: '$2b$10$annSLz7Qc09G2i439kjpEOWVqCySyEtHAJSDGueXJTyeyVw34jaZ2',
		fullName: 'MSSN Admin',
		role: 'admin'
	},
	{
		email: 'abdmuizzyekeen@gmail.com',
		passwordHash: '$2b$10$annSLz7Qc09G2i439kjpEOWVqCySyEtHAJSDGueXJTyeyVw34jaZ2',
		fullName: 'MSSN Admin',
		role: 'admin'
	}
]

export const JWT_SECRET = process.env.JWT_SECRET || 'mssn-oau-admin-jwt-secret-2024'
export const JWT_EXPIRY = '30m'
export const OTP_EXPIRY_MS = 60 * 1000 // 60 seconds
export const OTP_LENGTH = 6
