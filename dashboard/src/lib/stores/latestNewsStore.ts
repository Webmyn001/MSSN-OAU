import type { LatestNewsData } from '$lib/data/sampleLatestNews';

export type { LatestNews, LatestNewsData } from '$lib/data/sampleLatestNews';

import { API_BASE } from '$lib/api/base';

const API_URL = `${API_BASE}/public/latest-news`;

export async function loadLatestNewsData(): Promise<LatestNewsData> {
	try {
		const res = await fetch(API_URL);
		if (res.ok) {
			const json = await res.json();
			if (json?.success && json?.data && Array.isArray(json.data.items)) {
				return json.data;
			}
		}
	} catch (e) {
		console.error('Failed to load latest news from API:', e);
	}
	return { items: [] };
}

export async function saveLatestNewsData(data: LatestNewsData): Promise<boolean> {
	try {
		const res = await fetch(API_URL, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (res.ok) return true;
		console.error('Failed to save latest news:', await res.text());
	} catch (e) {
		console.error('Failed to save latest news to API:', e);
	}
	return false;
}
