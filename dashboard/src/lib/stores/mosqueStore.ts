import type { MosqueData } from '$lib/data/sampleMosques';

export type { MosqueEntry, MosqueData } from '$lib/data/sampleMosques';

import { API_BASE } from '$lib/api/base';

const API_URL = `${API_BASE}/public/mosques`;

export async function loadMosqueData(): Promise<MosqueData> {
	try {
		const res = await fetch(API_URL);
		if (res.ok) {
			const json = await res.json();
			if (json?.success && json?.data && Array.isArray(json.data.mosques)) {
				return { mosques: json.data.mosques };
			}
		}
	} catch (e) {
		console.error('Failed to load mosque data from API:', e);
	}
	return { mosques: [] };
}

export async function saveMosqueData(data: MosqueData): Promise<boolean> {
	try {
		const res = await fetch(API_URL, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (res.ok) {
			return true;
		}
		console.error('Failed to save mosque data:', await res.text());
	} catch (e) {
		console.error('Failed to save mosque data to API:', e);
	}
	return false;
}

export async function resetMosqueData(): Promise<MosqueData> {
	const defaultData: MosqueData = {
		mosques: [
			{ id: 'awolowo_hall', label: 'Awolowo Hall', url: '', images: ['https://images.unsplash.com/photo-1609657726788-44564a8f304a?w=600&auto=format&fit=crop&q=60&fm=webp'], address: 'Awolowo Hall of Residence, After Awo Cafe, OAU.', description: 'One of the largest and most active Muslim prayer halls on campus.' },
			{ id: 'fajuyi_hall', label: 'Fajuyi Hall', url: '', images: ['https://images.unsplash.com/photo-1609657726788-44564a8f304a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'], address: 'Fajuyi Hall of Residence, OAU.', description: 'A centrally located prayer hall within Fajuyi Hall of Residence.' },
			{ id: 'central_mosque', label: 'Central Mosque', url: '', images: ['https://images.unsplash.com/photo-1682995759960-531a5ba3a944?w=600&auto=format&fit=crop&q=60&fm=webp'], address: 'Central Mosque, OAU.', description: 'The Central Mosque of Unity — the main and largest mosque on campus.' }
		]
	};
	await saveMosqueData(defaultData);
	return defaultData;
}
