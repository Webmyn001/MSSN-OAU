/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
	const data = await parent();

	return { items: data.latestNews || [] };
}
