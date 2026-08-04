import { loadSiteData } from '$lib/api/site-data.js';

export const load = async ({ fetch }) => {
	const data = await loadSiteData(fetch, ['advisors']);

	return { advisors: data.advisors || [] };
};
