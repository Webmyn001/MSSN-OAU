const API_BASE = 'http://localhost:3000'
const AUTH_TOKEN_KEY = 'mssn_admin_token'
const AUTH_USER_KEY = 'mssn_admin_user'

export interface AuthUser {
	email: string
	fullName: string
	role: string
}

export function getStoredToken(): string | null {
	if (typeof window === 'undefined') return null
	return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
	if (typeof window === 'undefined') return null
	try {
		const raw = localStorage.getItem(AUTH_USER_KEY)
		return raw ? JSON.parse(raw) : null
	} catch {
		return null
	}
}

export function storeAuth(token: string, user: AuthUser) {
	localStorage.setItem(AUTH_TOKEN_KEY, token)
	localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
	localStorage.removeItem(AUTH_TOKEN_KEY)
	localStorage.removeItem(AUTH_USER_KEY)
}

export function isAuthenticated(): boolean {
	return !!getStoredToken()
}

export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
	const token = getStoredToken()
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...((options.headers as Record<string, string>) || {})
	}
	if (token) {
		headers['Authorization'] = `Bearer ${token}`
	}
	return fetch(`${API_BASE}${path}`, { ...options, headers })
}

export async function login(email: string, password: string) {
	const res = await fetch(`${API_BASE}/admin-auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password })
	})
	return res.json()
}

export async function verifyOTP(email: string, code: string) {
	const res = await fetch(`${API_BASE}/admin-auth/verify-otp`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, code })
	})
	return res.json()
}

export async function validateToken(): Promise<boolean> {
	const token = getStoredToken()
	if (!token) return false
	try {
		const res = await fetch(`${API_BASE}/admin-auth/validate`, {
			headers: { 'Authorization': `Bearer ${token}` }
		})
		const data = await res.json()
		return data.success === true
	} catch {
		return false
	}
}
