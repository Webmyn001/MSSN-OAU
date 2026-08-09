import type { ExcosData } from '$lib/data/sampleExcos';

export type { ExcosData, ExecutiveMember, ExecutiveSession, ExecutiveCommittee } from '$lib/data/sampleExcos';

import { API_BASE } from '$lib/api/base';

const STORAGE_KEY = 'mssn_excos_admin_data_v2';
const API_URL = `${API_BASE}/public/excos`;

export const emptyExcosData: ExcosData = { sessions: [] };

// Fetch remote source of truth from API (database-backed store)
export async function fetchExcosDataFromApi(): Promise<ExcosData | null> {
	try {
		const res = await fetch(API_URL);
		if (res.ok) {
			const body = await res.json();
			if (body && body.success && body.data && body.data.excos && Array.isArray(body.data.excos.sessions)) {
				// Cache into localStorage
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(body.data.excos, null, 2));
				}
				return body.data.excos;
			}
		}
	} catch (e) {
		console.warn('Could not fetch excos from API, using local storage fallback:', e);
	}
	return null;
}

// Helper to safely load data from localStorage or fallback to empty data
export function loadExcosData(): ExcosData {
	if (typeof window === 'undefined') return emptyExcosData;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			if (parsed && Array.isArray(parsed.sessions)) {
				return parsed;
			}
		}
	} catch (e) {
		console.error('Failed to load excos data from localStorage:', e);
	}
	return emptyExcosData;
}

// Save data to localStorage AND push to the shared API (PostgreSQL DB)
export async function saveExcosData(data: ExcosData): Promise<boolean> {
	if (typeof window !== 'undefined') {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
		} catch (e) {
			console.error('Failed to save excos data to localStorage:', e);
		}
	}

	try {
		const res = await fetch(API_URL, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (!res.ok) {
			console.warn('API save returned non-OK:', res.status, await res.text());
			return false;
		}
		return true;
	} catch (e) {
		console.error('Failed to push excos data to API:', e);
		return true;
	}
}

// Synchronous version kept for compatibility
export function saveExcosDataSync(data: ExcosData): boolean {
	saveExcosData(data);
	return true;
}

// Reset data to empty state
export async function resetExcosDataToEmpty(): Promise<ExcosData> {
	await saveExcosData(emptyExcosData);
	return emptyExcosData;
}
