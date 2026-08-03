import { samplePressReleaseLinkData, type PressReleaseLinkData } from '$lib/data/samplePressReleaseLinks';

export type { PressReleaseLink, PressReleaseLinkData } from '$lib/data/samplePressReleaseLinks';

const STORAGE_KEY = 'mssn_press_release_links_admin_v1';

export function loadPressReleaseLinks(): PressReleaseLinkData {
	if (typeof window === 'undefined') return samplePressReleaseLinkData;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			if (parsed && Array.isArray(parsed.links)) {
				return parsed;
			}
		}
	} catch (e) {
		console.error('Failed to load press release links from localStorage:', e);
	}
	return samplePressReleaseLinkData;
}

export async function savePressReleaseLinks(data: PressReleaseLinkData): Promise<boolean> {
	if (typeof window !== 'undefined') {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
		} catch (e) {
			console.error('Failed to save press release links to localStorage:', e);
		}
	}
	return true;
}

export async function resetPressReleaseLinks(): Promise<PressReleaseLinkData> {
	await savePressReleaseLinks(samplePressReleaseLinkData);
	return samplePressReleaseLinkData;
}
