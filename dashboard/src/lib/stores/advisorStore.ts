import type { AdvisorData } from '$lib/data/sampleAdvisors';

export type { AdvisorData, Advisor } from '$lib/data/sampleAdvisors';

import { API_BASE } from '$lib/api/base';

const STORAGE_KEY = 'mssn_advisor_admin_data_v1';
const API_URL = `${API_BASE}/public/advisors`;

const emptyData: AdvisorData = { advisors: [] };

export function fetchAdvisorsDataFromApi(): Promise<AdvisorData | null> {
	if (typeof window === 'undefined') return Promise.resolve(null);
	return fetch(API_URL)
		.then(res => res.ok ? res.json() : null)
		.then(body => {
			if (body && body.success && body.data && Array.isArray(body.data.advisors)) {
				const data = { advisors: body.data.advisors } as AdvisorData;
				localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
				return data;
			}
			return null;
		})
		.catch(e => {
			console.warn('Could not fetch advisors from API:', e);
			return null;
		});
}

export function loadAdvisorData(): AdvisorData {
	if (typeof window === 'undefined') return emptyData;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			if (parsed && Array.isArray(parsed.advisors)) {
				return parsed;
			}
		}
	} catch (e) {
		console.error('Failed to load advisor data from localStorage:', e);
	}
	return emptyData;
}

export async function saveAdvisorData(data: AdvisorData): Promise<boolean> {
	if (typeof window !== 'undefined') {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
		} catch (e) {
			console.error('Failed to save advisor data to localStorage:', e);
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
		console.error('Failed to push advisors data to API:', e);
		return true;
	}
}

export async function clearAdvisorData(): Promise<AdvisorData> {
	await saveAdvisorData(emptyData);
	return emptyData;
}
