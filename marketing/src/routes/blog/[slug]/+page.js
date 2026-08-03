import { redirect } from '@sveltejs/kit';

export const load = async ({ params, parent }) => {
	const { slug } = params;
	const data = await parent();

	const found = (data.posts || []).find(p => p.slug === slug);
	if (found?.link) {
		throw redirect(307, found.link);
	}

	throw redirect(307, 'https://annuurpress.org.ng');
};
