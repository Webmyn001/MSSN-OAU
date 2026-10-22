import { API_BASE } from "./base";

// Client for the Al-Mamharah programme API. Wraps every endpoint used by the
// public page, the participant dashboard and the Programme Manager section.

const PARTICIPANT_TOKEN_KEY = "almh_participant_token";
const PARTICIPANT_INFO_KEY = "almh_participant_info";
const MANAGER_TOKEN_KEY = "almh_manager_token";
const MANAGER_INFO_KEY = "almh_manager_info";

export interface AlMamharahErrorShape {
	message: string;
	code?: string;
	status: number;
}

export class AlMamharahError extends Error implements AlMamharahErrorShape {
	name = "AlMamharahError";
	code?: string;
	status: number;

	constructor(message: string, options: { code?: string; status?: number } = {}) {
		super(message);
		this.code = options.code;
		this.status = options.status ?? 0;
	}
}

/** Standard `{ success, data, meta?, error?, code? }` envelope from the API. */
export interface ApiEnvelope<T = unknown> {
	success: boolean;
	data?: T;
	meta?: Record<string, any>;
	error?: string;
	code?: string;
	[key: string]: any;
}

/**
 * Reads a value from localStorage, safely handling the SSR/no-storage case.
 */
function readStorage(key: string): string | undefined {
	try {
		return globalThis.localStorage?.getItem(key) ?? undefined;
	} catch {
		return undefined;
	}
}

/**
 * Writes a value to localStorage, safely handling the SSR/no-storage case.
 */
function writeStorage(key: string, value: string | null): void {
	try {
		if (value === null) globalThis.localStorage?.removeItem(key);
		else globalThis.localStorage?.setItem(key, value);
	} catch {
		// ignore storage failures (private mode, SSR)
	}
}

function parseJson<T = any>(raw: string): T | null {
	try {
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
}

interface RequestOptions {
	method?: string;
	body?: unknown;
	token?: string | null;
	signal?: AbortSignal;
}

/**
 * Low-level request helper that unwraps the standard API envelope.
 */
async function request<T = any>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
	const headers: Record<string, string> = { Accept: "application/json" };
	if (options.body !== undefined) headers["Content-Type"] = "application/json";
	if (options.token) headers.Authorization = `Bearer ${options.token}`;

	let response: Response;
	try {
		response = await fetch(`${API_BASE}${path}`, {
			method: options.method ?? "GET",
			headers,
			body: options.body === undefined ? undefined : JSON.stringify(options.body),
			signal: options.signal,
		});
	} catch {
		throw new AlMamharahError("Unable to reach the server. Please check your connection and try again.", {
			status: 0,
		});
	}

	const text = await response.text();
	const payload = parseJson<ApiEnvelope<T>>(text);

	if (!response.ok || !payload?.success) {
		throw new AlMamharahError(payload?.error || "Something went wrong. Please try again.", {
			code: payload?.code,
			status: response.status,
		});
	}

	return payload;
}

// * --- Public ---------------------------------------------------------------

export function getProgrammeInfo() {
	return request("/public/al-mamharah/info");
}

export function submitApplication(payload: Record<string, unknown>) {
	return request("/public/al-mamharah", { method: "POST", body: payload });
}

export function enterProgramme(fullName: string) {
	return request("/public/al-mamharah/enter", { method: "POST", body: { fullName } });
}

export function verifyEnterCode(fullName: string, code: string, password?: string) {
	return request("/public/al-mamharah/enter/verify", {
		method: "POST",
		body: { fullName, code, ...(password ? { password } : {}) },
	});
}

export function loginParticipant(fullName: string, password: string) {
	return request("/public/al-mamharah/login", { method: "POST", body: { fullName, password } });
}

export function forgotParticipantPassword(fullName: string) {
	return request("/public/al-mamharah/forgot-password", { method: "POST", body: { fullName } });
}

export function resetParticipantPassword(fullName: string, code: string, password: string) {
	return request("/public/al-mamharah/reset-password", {
		method: "POST",
		body: { fullName, code, password },
	});
}

// * --- Participant session storage ------------------------------------------

export function getParticipantToken(): string | undefined {
	return readStorage(PARTICIPANT_TOKEN_KEY);
}

export function getParticipantInfo<T = any>(): T | null {
	const raw = readStorage(PARTICIPANT_INFO_KEY);
	return raw ? parseJson<T>(raw) : null;
}

export function saveParticipantSession(token: string, participant: Record<string, any>): void {
	writeStorage(PARTICIPANT_TOKEN_KEY, token);
	writeStorage(PARTICIPANT_INFO_KEY, JSON.stringify(participant ?? {}));
}

export function clearParticipantSession(): void {
	writeStorage(PARTICIPANT_TOKEN_KEY, null);
	writeStorage(PARTICIPANT_INFO_KEY, null);
}

// * --- Participant endpoints ------------------------------------------------

export function getParticipantDashboard(token: string | undefined = getParticipantToken()) {
	return request("/al-mamharah/participant", { token });
}

export function recordToday(
	payload: {
		taskType?: string;
		matn?: string;
		lineNumber?: number;
		note?: string;
	} = {},
	token: string | undefined = getParticipantToken(),
) {
	return request("/al-mamharah/participant/complete", { method: "POST", body: payload, token });
}

export function undoToday(completionId: string, token: string | undefined = getParticipantToken()) {
	return request(`/al-mamharah/participant/completions/${completionId}`, {
		method: "DELETE",
		token,
	});
}

export function getParticipantLeaderboard(
	limit = 50,
	token: string | undefined = getParticipantToken(),
	scope: "OVERALL" | "QURAN" | "TAJWEED" = "OVERALL",
) {
	return request(`/al-mamharah/participant/leaderboard?limit=${limit}&scope=${scope}`, { token });
}

export function getTajweedStatus(token: string | undefined = getParticipantToken()) {
	return request("/al-mamharah/participant/tajweed", { token });
}

export function getPlacementQuiz(token: string | undefined = getParticipantToken()) {
	return request("/al-mamharah/participant/tajweed/quiz", { token });
}

export function submitPlacementQuiz(
	answers: { questionId: string; choice: number }[],
	token: string | undefined = getParticipantToken(),
) {
	return request("/al-mamharah/participant/tajweed/quiz", {
		method: "POST",
		body: { answers },
		token,
	});
}

export function chooseTajweedTrack(
	track: string | null,
	token: string | undefined = getParticipantToken(),
) {
	return request("/al-mamharah/participant/tajweed", {
		method: "PUT",
		body: { track },
		token,
	});
}

export async function logoutParticipant(token: string | undefined = getParticipantToken()) {
	const result = await request("/al-mamharah/participant/logout", { method: "POST", token });
	clearParticipantSession();
	return result;
}

// * --- Manager session storage ----------------------------------------------

export function getManagerToken(): string | undefined {
	return readStorage(MANAGER_TOKEN_KEY);
}

export function getManagerInfo<T = any>(): T | null {
	const raw = readStorage(MANAGER_INFO_KEY);
	return raw ? parseJson<T>(raw) : null;
}

export function saveManagerSession(token: string, manager: Record<string, any>): void {
	writeStorage(MANAGER_TOKEN_KEY, token);
	writeStorage(MANAGER_INFO_KEY, JSON.stringify(manager ?? {}));
}

export function clearManagerSession(): void {
	writeStorage(MANAGER_TOKEN_KEY, null);
	writeStorage(MANAGER_INFO_KEY, null);
}

// * --- Manager auth ---------------------------------------------------------

export function managerLogin(email: string, password: string) {
	return request("/al-mamharah/manager/login", {
		method: "POST",
		body: { email, password },
	});
}

export function getManagerMe(token: string | undefined = getManagerToken()) {
	return request("/al-mamharah/manager/me", { token });
}

export function activateManager(token: string, password: string, fullName?: string) {
	return request("/al-mamharah/manager/activate", {
		method: "POST",
		body: fullName ? { token, password, fullName } : { token, password },
	});
}

export function validateActivation(token: string) {
	return request(`/al-mamharah/manager/activate/validate?token=${encodeURIComponent(token)}`);
}

// * --- Manager programme management -----------------------------------------

export function getOverview(token: string | undefined = getManagerToken()) {
	return request("/al-mamharah/manager/overview", { token });
}

export type Query = Record<string, string | number | undefined>;

export function listApplications(query: Query = {}, token: string | undefined = getManagerToken()) {
	return request(`/al-mamharah/manager/applications?${toQueryString(query)}`, { token });
}

export function approveApplication(
	id: string,
	payload: { startDate?: string } = {},
	token: string | undefined = getManagerToken(),
) {
	return request(`/al-mamharah/manager/applications/${id}/approve`, {
		method: "POST",
		body: payload,
		token,
	});
}

export function rejectApplication(
	id: string,
	payload: { notes?: string } = {},
	token: string | undefined = getManagerToken(),
) {
	return request(`/al-mamharah/manager/applications/${id}/reject`, {
		method: "POST",
		body: payload,
		token,
	});
}

export function listParticipants(query: Query = {}, token: string | undefined = getManagerToken()) {
	return request(`/al-mamharah/manager/participants?${toQueryString(query)}`, { token });
}

export function getParticipantDetail(id: string, token: string | undefined = getManagerToken()) {
	return request(`/al-mamharah/manager/participants/${id}`, { token });
}

export function setParticipantStatus(
	id: string,
	status: "ACTIVE" | "SUSPENDED",
	notes?: string,
	token: string | undefined = getManagerToken(),
) {
	return request(`/al-mamharah/manager/participants/${id}/status`, {
		method: "POST",
		body: notes ? { status, notes } : { status },
		token,
	});
}

export function suspendInactiveParticipants(token: string | undefined = getManagerToken()) {
	return request("/al-mamharah/manager/participants/suspend-inactive", {
		method: "POST",
		token,
	});
}

export function deleteParticipant(id: string, token: string | undefined = getManagerToken()) {
	return request(`/al-mamharah/manager/participants/${id}`, {
		method: "DELETE",
		token,
	});
}

export function getDailyProgress(date?: string, token: string | undefined = getManagerToken()) {
	const query = date ? `?date=${encodeURIComponent(date)}` : "";
	return request(`/al-mamharah/manager/daily-progress${query}`, { token });
}

export function backfillCompletion(
	payload: Record<string, unknown>,
	token: string | undefined = getManagerToken(),
) {
	return request("/al-mamharah/manager/completions", { method: "POST", body: payload, token });
}

export function deleteCompletion(
	id: string,
	reason: string,
	token: string | undefined = getManagerToken(),
) {
	return request(`/al-mamharah/manager/completions/${id}`, {
		method: "DELETE",
		body: { reason },
		token,
	});
}

export function getManagerLeaderboard(
	scope: "OVERALL" | "QURAN" | "TAJWEED" = "OVERALL",
	token: string | undefined = getManagerToken(),
) {
	return request(`/al-mamharah/manager/leaderboard?limit=200&scope=${scope}`, { token });
}

export function setParticipantTajweed(
	id: string,
	payload: { track: string | null; skipPlacement?: boolean },
	token: string | undefined = getManagerToken(),
) {
	return request(`/al-mamharah/manager/participants/${id}/tajweed`, {
		method: "PUT",
		body: payload,
		token,
	});
}

export function listManagers(token: string | undefined = getManagerToken()) {
	return request("/al-mamharah/manager/managers", { token });
}

export function inviteManager(
	payload: { email: string; fullName?: string },
	token: string | undefined = getManagerToken(),
) {
	return request("/al-mamharah/manager/managers", { method: "POST", body: payload, token });
}

export function resendManagerInvite(id: string, token: string | undefined = getManagerToken()) {
	return request(`/al-mamharah/manager/managers/${id}/resend-invite`, {
		method: "POST",
		token,
	});
}

export function revokeManager(id: string, token: string | undefined = getManagerToken()) {
	return request(`/al-mamharah/manager/managers/${id}/revoke`, { method: "POST", token });
}

export function deleteManager(id: string, token: string | undefined = getManagerToken()) {
	return request(`/al-mamharah/manager/managers/${id}`, { method: "DELETE", token });
}

export function getSettings(token: string | undefined = getManagerToken()) {
	return request("/al-mamharah/manager/settings", { token });
}

export function updateSettings(
	payload: Record<string, unknown>,
	token: string | undefined = getManagerToken(),
) {
	return request("/al-mamharah/manager/settings", { method: "PUT", body: payload, token });
}

export function resetProgramme(token: string | undefined = getManagerToken()) {
	return request("/al-mamharah/manager/reset", {
		method: "POST",
		body: { confirmation: "RESET" },
		token,
	});
}

export function getAudit(query: Query = {}, token: string | undefined = getManagerToken()) {
	return request(`/al-mamharah/manager/audit?${toQueryString(query)}`, { token });
}

/**
 * CSV endpoints are downloads, so they need an authenticated fetch rather than
 * a plain anchor. Returns the raw Response for the caller to stream to disk.
 */
export async function fetchCsv(
	kind: "applications" | "participants",
	token: string | undefined = getManagerToken(),
): Promise<Response> {
	const response = await fetch(`${API_BASE}/al-mamharah/manager/export/${kind}.csv`, {
		headers: token ? { Authorization: `Bearer ${token}` } : {},
	});
	if (!response.ok) {
		throw new AlMamharahError("Unable to download the report.", { status: response.status });
	}
	return response;
}

// * --- helpers --------------------------------------------------------------

function toQueryString(query: Query): string {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
	}
	return params.toString();
}
