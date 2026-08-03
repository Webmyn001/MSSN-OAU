export const load = async ({ parent }) => {
	const data = await parent();

	return {
		events: (data.events || []).slice(0, 3).map(e => ({
			id: e.id,
			title: e.title,
			summary: e.description || e.title,
			description: e.description || '',
			image: e.imageUrl || '',
			imageUrl: e.imageUrl,
			paid: parseFloat(e.ticketPrice || '0') > 0,
			price: parseFloat(e.ticketPrice || '0') > 0 ? `₦${parseFloat(e.ticketPrice).toLocaleString()}` : 'Free',
			ticketPrice: e.ticketPrice,
			date: e.startDate,
			startDate: e.startDate,
			endDate: e.endDate,
			venue: e.venue || 'MSSN OAU Secretariat',
			location: e.venue || 'MSSN OAU Secretariat',
			capacity: e.maxTickets,
			ticketsSold: e.ticketsSold,
			slug: e.id
		})),
		latestNews: (data.latestNews || []).slice(0, 3),
		blogPosts: [...(data.posts || [])]
			.sort((a, b) => new Date(b.approvedAt || 0) - new Date(a.approvedAt || 0))
			.slice(0, 3)
			.map(p => mapPost(p)),
		programmes: (data.programmes || []).slice(0, 4),
		mosques: data.mosques || [],
		info: data.info
	};
};

function mapPost(p) {
	return {
		title: p.title,
		excerpt: p.excerpt,
		link: p.link,
		slug: p.slug,
		featured_image: p.featuredImage || '',
		date: p.wpDate,
		author: p.authorName ? { name: p.authorName, picture: p.authorAvatar || '' } : null,
		authors: p.authorName ? [{ name: p.authorName, avatar_urls: { '48': p.authorAvatar || '', '96': p.authorAvatar || '' } }] : [],
		categories: (() => { try { return p.categories ? JSON.parse(p.categories) : []; } catch { return []; } })()
	};
}
