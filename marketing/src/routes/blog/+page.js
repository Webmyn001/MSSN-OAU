export const load = async ({ parent }) => {
	const data = await parent();

	return {
		posts: (data.posts || []).map(p => ({
			id: p.wpId,
			title: p.title,
			excerpt: p.excerpt,
			content: p.content,
			link: p.link,
			slug: p.slug,
			date: p.wpDate,
			modified: p.wpModified,
			featured_image: p.featuredImage || '',
			categories: safeParse(p.categories),
			tags: safeParse(p.tags),
			author: p.authorName ? { name: p.authorName, picture: p.authorAvatar || '' } : null,
			authors: p.authorName ? [{ name: p.authorName, avatar_urls: { '96': p.authorAvatar || '' } }] : []
		}))
	};
};

function safeParse(json) {
	try { return json ? JSON.parse(json) : []; } catch { return []; }
}
