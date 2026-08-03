import slugify from "$lib/utils/slugify.js";

export async function load({ params, parent }) {
	const data = await parent();

	const apiEvents = (data.events || []).map(e => ({
		id: e.id,
		title: e.title,
		summary: e.description || e.title,
		description: e.description || '',
		additional_details: e.description || '',
		image: e.imageUrl || '',
		imageUrl: e.imageUrl,
		date: e.startDate,
		startDate: e.startDate,
		endDate: e.endDate,
		venue: e.venue || 'MSSN OAU Secretariat',
		capacity: e.maxTickets,
		ticketsSold: e.ticketsSold,
		slug: e.id
	}));

	const event = apiEvents.find(e => {
		const eventSlug = slugify(e.title);
		return e.id === params.event_slug || e.slug === params.event_slug || eventSlug === params.event_slug;
	});

	if (event) {
		return {
			event: {
				...event,
				slug: event.slug || slugify(event.title)
			},
			status: 200
		};
	}

	return {
		status: 404,
		error: new Error("Event not found")
	};
}
