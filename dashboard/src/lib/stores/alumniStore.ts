import type { AlumniData } from '$lib/data/sampleAlumni';

export type { AlumniData, Alumnus, AlumniSession } from '$lib/data/sampleAlumni';

const STORAGE_KEY = 'mssn_alumni_admin_data_v1';
const API_URL = 'http://localhost:3000/public/alumni';

const emptyData: AlumniData = { sessions: [] };

export async function fetchAlumniDataFromApi(): Promise<AlumniData | null> {
	try {
		const res = await fetch(API_URL);
		if (res.ok) {
			const body = await res.json();
			if (body && body.success && body.data && body.data.alumni && Array.isArray(body.data.alumni.sessions)) {
				if (typeof window !== 'undefined') {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(body.data.alumni, null, 2));
				}
				return body.data.alumni;
			}
		}
	} catch (e) {
		console.warn('Could not fetch alumni from API:', e);
	}
	return null;
}

export function loadAlumniData(): AlumniData {
	if (typeof window === 'undefined') return emptyData;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			if (parsed && Array.isArray(parsed.sessions)) {
				return parsed;
			}
		}
	} catch (e) {
		console.error('Failed to load alumni data from localStorage:', e);
	}
	return emptyData;
}

export async function saveAlumniData(data: AlumniData): Promise<boolean> {
	if (typeof window !== 'undefined') {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
		} catch (e) {
			console.error('Failed to save alumni data to localStorage:', e);
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
		console.error('Failed to push alumni data to API:', e);
		return true;
	}
}

export async function clearAlumniData(): Promise<AlumniData> {
	await saveAlumniData(emptyData);
	return emptyData;
}
