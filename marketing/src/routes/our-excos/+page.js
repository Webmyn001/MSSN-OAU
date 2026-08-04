import { loadSiteData } from '$lib/api/site-data.js';

export const load = async ({ fetch }) => {
	const data = await loadSiteData(fetch, ['excos']);

	return { excos: data.excos || { sessions: [] } };
};
