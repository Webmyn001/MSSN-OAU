export async function load({ params, parent }) {
	const id = params.id;
	const data = await parent();

	const item = (data.latestNews || []).find(n => n.id === id) || null;
	return { item };
}
