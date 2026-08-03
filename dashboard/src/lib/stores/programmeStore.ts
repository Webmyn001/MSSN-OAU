import type { ProgrammeData } from '$lib/data/sampleProgrammes';

export type { ProgrammeData, Programme, ProgrammeScheduleItem } from '$lib/data/sampleProgrammes';

const API_URL = 'http://localhost:3000/public/programmes';

export async function loadProgrammeData(): Promise<ProgrammeData> {
	try {
		const res = await fetch(API_URL);
		if (res.ok) {
			const json = await res.json();
			if (json?.success && Array.isArray(json.data?.programmes)) {
				return { programmes: json.data.programmes };
			}
		}
	} catch (e) {
		console.error('Failed to load programme data from API:', e);
	}
	return { programmes: [] };
}

export async function saveProgrammeData(data: ProgrammeData): Promise<boolean> {
	try {
		const res = await fetch(API_URL, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (res.ok) {
			return true;
		}
		console.error('Failed to save programme data:', await res.text());
	} catch (e) {
		console.error('Failed to save programme data to API:', e);
	}
	return false;
}

export async function resetProgrammeDataToSample(): Promise<ProgrammeData> {
	const { sampleProgrammeData } = await import('$lib/data/sampleProgrammes');
	await saveProgrammeData(sampleProgrammeData);
	return sampleProgrammeData;
}
