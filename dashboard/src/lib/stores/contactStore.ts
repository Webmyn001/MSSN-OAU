import type { ContactData } from '$lib/data/sampleContacts';

export type { ContactData, ContactEntry } from '$lib/data/sampleContacts';

const API_URL = 'http://localhost:3000/public/contact';

export async function loadContactData(): Promise<ContactData> {
	try {
		const res = await fetch(API_URL);
		if (res.ok) {
			const json = await res.json();
			if (json?.success && Array.isArray(json.data?.entries)) {
				return { entries: json.data.entries };
			}
		}
	} catch (e) {
		console.error('Failed to load contact data from API:', e);
	}
	return { entries: [] };
}

export async function saveContactData(data: ContactData): Promise<boolean> {
	try {
		const res = await fetch(API_URL, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (res.ok) {
			return true;
		}
		console.error('Failed to save contact data:', await res.text());
	} catch (e) {
		console.error('Failed to save contact data to API:', e);
	}
	return false;
}
