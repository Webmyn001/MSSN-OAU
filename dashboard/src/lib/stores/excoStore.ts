import { sampleExcosData, type ExcosData } from '$lib/data/sampleExcos';

export type { ExcosData, ExecutiveMember, ExecutiveSession, ExecutiveCommittee } from '$lib/data/sampleExcos';

import { API_BASE } from '$lib/api/base';

const STORAGE_KEY = 'mssn_excos_admin_data_v2';
const API_URL = `${API_BASE}/public/excos`;

// Fetch remote source of truth from API (PostgreSQL database)
export async function fetchExcosDataFromApi(): Promise<ExcosData | null> {
	try {
		const res = await fetch(API_URL);
		if (res.ok) {
			const body = await res.json();
			if (body && body.success && body.data && body.data.excos && body.data.excos.sessions && body.data.excos.sessions.length > 0) {
				// Cache into localStorage
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(body.data.excos, null, 2));
				}
				return body.data.excos;
			}
		}
	} catch (e) {
		console.warn('Could not fetch excos from DB API, using local storage fallback:', e);
	}
	return null;
}

// Helper to safely load data from localStorage or fallback to sampleExcosData
export function loadExcosData(): ExcosData {
	if (typeof window === 'undefined') return sampleExcosData;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			if (parsed && Array.isArray(parsed.sessions) && parsed.sessions.length > 0) {
				return parsed;
			}
		}
	} catch (e) {
		console.error('Failed to load excos data from localStorage:', e);
	}
	return sampleExcosData;
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

// Reset data to initial sample dataset
export async function resetExcosDataToSample(): Promise<ExcosData> {
	await saveExcosData(sampleExcosData);
	return sampleExcosData;
}
