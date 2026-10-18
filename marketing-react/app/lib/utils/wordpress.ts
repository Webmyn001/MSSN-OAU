const WORDPRESS_API_URL = "https://annuurpress.org.ng/wp-json";

export interface WordPressPost {
	id: number;
	title: string;
	excerpt: string;
	content: string;
	link: string;
	slug: string;
	date: string;
	modified: string;
	featured_image: string;
	categories: string[];
	tags: string[];
	author: { name: string; picture: string } | null;
	authors: { name: string; avatar_urls: Record<string, string> }[];
}

async function wpFetch(endpoint: string, params: Record<string, any> = {}): Promise<any> {
	const url = new URL(`${WORDPRESS_API_URL}/wp/v2/${endpoint}`);

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			url.searchParams.append(key, String(value));
		}
	});

	const response = await fetch(url.toString());

	if (!response.ok) {
		throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
	}

	return await response.json();
}

export async function fetchPosts(
	options: {
		per_page?: number;
		page?: number;
		search?: string;
		orderby?: string;
		order?: string;
	} = {}
): Promise<WordPressPost[]> {
	try {
		const { per_page = 10, page = 1, search, orderby = "date", order = "desc" } = options;

		const params: Record<string, any> = {
			per_page,
			page,
			orderby,
			order,
			status: "publish",
			_embed: true,
		};

		if (search) {
			params.search = search;
		}

		const posts = await wpFetch("posts", params);
		return posts.map(transformPost);
	} catch (error) {
		console.error("Error fetching WordPress posts:", error);
		return [];
	}
}

export async function fetchPostBySlug(slug: string): Promise<WordPressPost | null> {
	try {
		const posts = await wpFetch("posts", {
			slug,
			per_page: 1,
			status: "publish",
			_embed: true,
		});

		if (posts && posts.length > 0) {
			return transformPost(posts[0]);
		}

		return null;
	} catch (error) {
		console.error("Error fetching WordPress post by slug:", error);
		return null;
	}
}

export function transformPost(wpPost: any): WordPressPost {
	const embedded = wpPost._embedded || {};
	const author = embedded.author?.[0];
	const featuredMedia = embedded["wp:featuredmedia"]?.[0];

	return {
		id: wpPost.id,
		title: wpPost.title?.rendered || "",
		excerpt: wpPost.excerpt?.rendered || "",
		content: wpPost.content?.rendered || "",
		link: wpPost.link || "",
		slug: wpPost.slug || "",
		date: wpPost.date || "",
		modified: wpPost.modified || "",
		featured_image:
			featuredMedia?.source_url || featuredMedia?.media_details?.sizes?.large?.source_url || "",
		categories: (embedded["wp:term"]?.flat() || [])
			.filter((term: any) => term.taxonomy === "category")
			.map((term: any) => term.name),
		tags: (embedded["wp:term"]?.flat() || [])
			.filter((term: any) => term.taxonomy === "post_tag")
			.map((term: any) => term.name),
		author: author
			? { name: author.name || "", picture: author.avatar_urls?.["96"] || "" }
			: null,
		authors: author
			? [{ name: author.name || "", avatar_urls: author.avatar_urls || { "96": "" } }]
			: [],
	};
}
