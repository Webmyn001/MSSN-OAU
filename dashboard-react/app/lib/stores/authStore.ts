import { API_BASE } from "~/lib/api/base";

const AUTH_TOKEN_KEY = "mssn_admin_token";
const AUTH_USER_KEY = "mssn_admin_user";

export interface AuthUser {
	email: string;
	fullName: string;
	role: string;
}

/** Network-level statuses returned by Render's proxy while a cold-starting instance boots. */
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 4000;

/**
 * Fetch that transparently retries transient failures (Render free-tier cold
 * starts, temporary network blips). Calls `onRetry` between attempts so the UI
 * can show a "server is waking up" message. Throws the original error if it
 * still fails after all attempts.
 */
export async function fetchWithRetry(
	url: string,
	init: RequestInit = {},
	onRetry?: () => void
): Promise<Response> {
	let lastError: unknown;
	for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
		try {
			const res = await fetch(url, init);
			if (!RETRYABLE_STATUSES.has(res.status)) return res;
			lastError = new Error(`Server responded with ${res.status}`);
		} catch (err) {
			lastError = err;
		}
		if (attempt < RETRY_ATTEMPTS) {
			onRetry?.();
			await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
		}
	}
	throw lastError;
}

export function getStoredToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(AUTH_USER_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

export function storeAuth(token: string, user: AuthUser) {
	localStorage.setItem(AUTH_TOKEN_KEY, token);
	localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
	localStorage.removeItem(AUTH_TOKEN_KEY);
	localStorage.removeItem(AUTH_USER_KEY);
}

function decodeTokenPayload(token: string): any {
	try {
		const payload = token.split(".")[1];
		const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
		return JSON.parse(decoded);
	} catch {
		return null;
	}
}

export function getTokenExpiry(): number | null {
	const token = getStoredToken();
	if (!token) return null;
	const payload = decodeTokenPayload(token);
	const exp = typeof payload?.exp === "number" ? payload.exp : null;
	return exp ? exp * 1000 : null;
}

export function isTokenExpired(): boolean {
	const expiry = getTokenExpiry();
	if (expiry === null) return false;
	return Date.now() >= expiry;
}

export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
	const token = getStoredToken();
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...((init.headers as Record<string, string>) || {}),
	};
	if (token) headers["Authorization"] = `Bearer ${token}`;
	return fetch(`${API_BASE}${path}`, { ...init, headers });
}

export async function login(email: string, password: string, onRetry?: () => void) {
	const res = await fetchWithRetry(
		`${API_BASE}/admin-auth/login`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		},
		onRetry
	);
	return res.json();
}

export async function verifyOTP(email: string, code: string, onRetry?: () => void) {
	const res = await fetchWithRetry(
		`${API_BASE}/admin-auth/verify-otp`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, code }),
		},
		onRetry
	);
	return res.json();
}

export async function validateToken(): Promise<boolean> {
	const res = await authFetch("/admin-auth/validate");
	if (!res.ok) return false;
	try {
		const json = await res.json();
		return json.success === true;
	} catch {
		return false;
	}
}
