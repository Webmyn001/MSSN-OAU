export const load = async ({ parent }) => {
	const data = await parent();

	return {
		events: (data.events || []).map(e => ({
			id: e.id,
			title: e.title,
			summary: e.description || e.title,
			description: e.description || '',
			image: e.imageUrl || '',
			imageUrl: e.imageUrl,
			date: e.startDate,
			startDate: e.startDate,
			endDate: e.endDate,
			venue: e.venue || 'MSSN OAU Secretariat',
			capacity: e.maxTickets,
			ticketsSold: e.ticketsSold,
			slug: e.id
		}))
	};
};
