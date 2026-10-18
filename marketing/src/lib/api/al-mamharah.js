import { API_BASE } from './base.js';

// Client for the Al-Mamharah programme API. Wraps every endpoint used by the
// public page, the participant dashboard and the Programme Manager section.

const PARTICIPANT_TOKEN_KEY = 'almh_participant_token';
const PARTICIPANT_INFO_KEY = 'almh_participant_info';
const MANAGER_TOKEN_KEY = 'almh_manager_token';
const MANAGER_INFO_KEY = 'almh_manager_info';

/**
 * @typedef {Object} AlMamharahErrorShape
 * @property {string} message
 * @property {string} [code]
 * @property {number} status
 */

export class AlMamharahError extends Error {
	/**
	 * @param {string} message
	 * @param {{ code?: string, status?: number }} [options]
	 */
	constructor(message, options = {}) {
		super(message);
		this.name = 'AlMamharahError';
		this.code = options.code;
		this.status = options.status ?? 0;
	}
}

/**
 * Reads a value from localStorage, safely handling the SSR/no-storage case.
 * @param {string} key
 * @returns {string | undefined}
 */
function readStorage(key) {
	try {
		return globalThis.localStorage?.getItem(key) ?? undefined;
	} catch {
		return undefined;
	}
}

/**
 * Writes a value to localStorage, safely handling the SSR/no-storage case.
 * @param {string} key
 * @param {string | null} value
 */
function writeStorage(key, value) {
	try {
		if (value === null) globalThis.localStorage?.removeItem(key);
		else globalThis.localStorage?.setItem(key, value);
	} catch {
		// ignore storage failures (private mode, SSR)
	}
}

/**
 * @param {any} raw
 * @returns {Record<string, any> | null}
 */
function parseJson(raw) {
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

/**
 * Low-level request helper that unwraps the standard API envelope.
 * @param {string} path
 * @param {{ method?: string, body?: unknown, token?: string | null, signal?: AbortSignal }} [options]
 * @returns {Promise<any>}
 */
async function request(path, options = {}) {
	/** @type {Record<string, string>} */
	const headers = { Accept: 'application/json' };
	if (options.body !== undefined) headers['Content-Type'] = 'application/json';
	if (options.token) headers.Authorization = `Bearer ${options.token}`;

	let response;
	try {
		response = await fetch(`${API_BASE}${path}`, {
			method: options.method ?? 'GET',
			headers,
			body: options.body === undefined ? undefined : JSON.stringify(options.body),
			signal: options.signal
		});
	} catch (error) {
		throw new AlMamharahError(
			'Unable to reach the server. Please check your connection and try again.',
			{ status: 0 }
		);
	}

	const text = await response.text();
	const payload = parseJson(text);

	if (!response.ok || !payload?.success) {
		throw new AlMamharahError(payload?.error || 'Something went wrong. Please try again.', {
			code: payload?.code,
			status: response.status
		});
	}

	return payload;
}

// * --- Public ---------------------------------------------------------------

export function getProgrammeInfo() {
	return request('/public/al-mamharah/info');
}

/** @param {Record<string, unknown>} payload */
export function submitApplication(payload) {
	return request('/public/al-mamharah', { method: 'POST', body: payload });
}

/** @param {string} fullName */
export function enterProgramme(fullName) {
	return request('/public/al-mamharah/enter', { method: 'POST', body: { fullName } });
}

/**
 * @param {string} fullName
 * @param {string} code
 */
export function verifyEnterCode(fullName, code) {
	return request('/public/al-mamharah/enter/verify', {
		method: 'POST',
		body: { fullName, code }
	});
}

// * --- Participant session storage ------------------------------------------

export function getParticipantToken() {
	return readStorage(PARTICIPANT_TOKEN_KEY);
}

/** @returns {Record<string, any> | null} */
export function getParticipantInfo() {
	const raw = readStorage(PARTICIPANT_INFO_KEY);
	return raw ? parseJson(raw) : null;
}

/**
 * @param {string} token
 * @param {Record<string, any>} participant
 */
export function saveParticipantSession(token, participant) {
	writeStorage(PARTICIPANT_TOKEN_KEY, token);
	writeStorage(PARTICIPANT_INFO_KEY, JSON.stringify(participant ?? {}));
}

export function clearParticipantSession() {
	writeStorage(PARTICIPANT_TOKEN_KEY, null);
	writeStorage(PARTICIPANT_INFO_KEY, null);
}

// * --- Participant endpoints ------------------------------------------------

export function getParticipantDashboard(token = getParticipantToken()) {
	return request('/al-mamharah/participant', { token });
}

/**
 * @param {{ taskType?: string, note?: string }} payload
 * @param {string} [token]
 */
export function recordToday(payload = {}, token = getParticipantToken()) {
	return request('/al-mamharah/participant/complete', {
		method: 'POST',
		body: payload,
		token
	});
}

/**
 * @param {string} completionId
 * @param {string} [token]
 */
export function undoToday(completionId, token = getParticipantToken()) {
	return request(`/al-mamharah/participant/completions/${completionId}`, {
		method: 'DELETE',
		token
	});
}

/**
 * @param {number} [limit]
 * @param {string} [token]
 */
export function getParticipantLeaderboard(limit = 50, token = getParticipantToken()) {
	return request(`/al-mamharah/participant/leaderboard?limit=${limit}`, { token });
}

export async function logoutParticipant(token = getParticipantToken()) {
	const result = await request('/al-mamharah/participant/logout', { method: 'POST', token });
	clearParticipantSession();
	return result;
}

// * --- Manager session storage ----------------------------------------------

export function getManagerToken() {
	return readStorage(MANAGER_TOKEN_KEY);
}

/** @returns {Record<string, any> | null} */
export function getManagerInfo() {
	const raw = readStorage(MANAGER_INFO_KEY);
	return raw ? parseJson(raw) : null;
}

/**
 * @param {string} token
 * @param {Record<string, any>} manager
 */
export function saveManagerSession(token, manager) {
	writeStorage(MANAGER_TOKEN_KEY, token);
	writeStorage(MANAGER_INFO_KEY, JSON.stringify(manager ?? {}));
}

export function clearManagerSession() {
	writeStorage(MANAGER_TOKEN_KEY, null);
	writeStorage(MANAGER_INFO_KEY, null);
}

// * --- Manager auth ---------------------------------------------------------

/**
 * @param {string} email
 * @param {string} password
 */
export function managerLogin(email, password) {
	return request('/al-mamharah/manager/login', {
		method: 'POST',
		body: { email, password }
	});
}

/** @param {string} [token] */
export function getManagerMe(token = getManagerToken()) {
	return request('/al-mamharah/manager/me', { token });
}

/**
 * @param {string} token
 * @param {string} password
 * @param {string} [fullName]
 */
export function activateManager(token, password, fullName) {
	return request('/al-mamharah/manager/activate', {
		method: 'POST',
		body: fullName ? { token, password, fullName } : { token, password }
	});
}

/** @param {string} token */
export function validateActivation(token) {
	return request(`/al-mamharah/manager/activate/validate?token=${encodeURIComponent(token)}`);
}

// * --- Manager programme management -----------------------------------------

/** @param {string} [token] */
export function getOverview(token = getManagerToken()) {
	return request('/al-mamharah/manager/overview', { token });
}

/**
 * @param {Record<string, string | number | undefined>} [query]
 * @param {string} [token]
 */
export function listApplications(query = {}, token = getManagerToken()) {
	return request(`/al-mamharah/manager/applications?${toQueryString(query)}`, { token });
}

/**
 * @param {string} id
 * @param {{ startDate?: string }} [payload]
 * @param {string} [token]
 */
export function approveApplication(id, payload = {}, token = getManagerToken()) {
	return request(`/al-mamharah/manager/applications/${id}/approve`, {
		method: 'POST',
		body: payload,
		token
	});
}

/**
 * @param {string} id
 * @param {{ notes?: string }} [payload]
 * @param {string} [token]
 */
export function rejectApplication(id, payload = {}, token = getManagerToken()) {
	return request(`/al-mamharah/manager/applications/${id}/reject`, {
		method: 'POST',
		body: payload,
		token
	});
}

/**
 * @param {Record<string, string | number | undefined>} [query]
 * @param {string} [token]
 */
export function listParticipants(query = {}, token = getManagerToken()) {
	return request(`/al-mamharah/manager/participants?${toQueryString(query)}`, { token });
}

/**
 * @param {string} id
 * @param {string} [token]
 */
export function getParticipantDetail(id, token = getManagerToken()) {
	return request(`/al-mamharah/manager/participants/${id}`, { token });
}

/**
 * @param {string} id
 * @param {'ACTIVE' | 'SUSPENDED'} status
 * @param {string} [notes]
 * @param {string} [token]
 */
export function setParticipantStatus(id, status, notes, token = getManagerToken()) {
	return request(`/al-mamharah/manager/participants/${id}/status`, {
		method: 'POST',
		body: notes ? { status, notes } : { status },
		token
	});
}

/**
 * @param {string} [date]
 * @param {string} [token]
 */
export function getDailyProgress(date, token = getManagerToken()) {
	const query = date ? `?date=${encodeURIComponent(date)}` : '';
	return request(`/al-mamharah/manager/daily-progress${query}`, { token });
}

/**
 * @param {Record<string, unknown>} payload
 * @param {string} [token]
 */
export function backfillCompletion(payload, token = getManagerToken()) {
	return request('/al-mamharah/manager/completions', { method: 'POST', body: payload, token });
}

/**
 * @param {string} id
 * @param {string} reason
 * @param {string} [token]
 */
export function deleteCompletion(id, reason, token = getManagerToken()) {
	return request(`/al-mamharah/manager/completions/${id}`, {
		method: 'DELETE',
		body: { reason },
		token
	});
}

/** @param {string} [token] */
export function getManagerLeaderboard(token = getManagerToken()) {
	return request('/al-mamharah/manager/leaderboard', { token });
}

/** @param {string} [token] */
export function listManagers(token = getManagerToken()) {
	return request('/al-mamharah/manager/managers', { token });
}

/**
 * @param {{ email: string, fullName?: string }} payload
 * @param {string} [token]
 */
export function inviteManager(payload, token = getManagerToken()) {
	return request('/al-mamharah/manager/managers', { method: 'POST', body: payload, token });
}

/**
 * @param {string} id
 * @param {string} [token]
 */
export function resendManagerInvite(id, token = getManagerToken()) {
	return request(`/al-mamharah/manager/managers/${id}/resend-invite`, { method: 'POST', token });
}

/**
 * @param {string} id
 * @param {string} [token]
 */
export function revokeManager(id, token = getManagerToken()) {
	return request(`/al-mamharah/manager/managers/${id}/revoke`, { method: 'POST', token });
}

/** @param {string} [token] */
export function getSettings(token = getManagerToken()) {
	return request('/al-mamharah/manager/settings', { token });
}

/**
 * @param {Record<string, unknown>} payload
 * @param {string} [token]
 */
export function updateSettings(payload, token = getManagerToken()) {
	return request('/al-mamharah/manager/settings', { method: 'PUT', body: payload, token });
}

/**
 * @param {Record<string, string | number | undefined>} [query]
 * @param {string} [token]
 */
export function getAudit(query = {}, token = getManagerToken()) {
	return request(`/al-mamharah/manager/audit?${toQueryString(query)}`, { token });
}

/**
 * CSV endpoints are downloads, so they need an authenticated fetch rather than
 * a plain anchor. Returns the raw Response for the caller to stream to disk.
 * @param {'applications' | 'participants'} kind
 * @param {string} [token]
 */
export async function fetchCsv(kind, token = getManagerToken()) {
	const response = await fetch(`${API_BASE}/al-mamharah/manager/export/${kind}.csv`, {
		headers: token ? { Authorization: `Bearer ${token}` } : {}
	});
	if (!response.ok) {
		throw new AlMamharahError('Unable to download the report.', { status: response.status });
	}
	return response;
}

// * --- helpers --------------------------------------------------------------

/**
 * @param {Record<string, string | number | undefined>} query
 * @returns {string}
 */
function toQueryString(query) {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
	}
	return params.toString();
}
