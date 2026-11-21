import slugify from "./slugify";

interface SluggablePost {
	id: string | number;
	title: string;
	category?: string;
}

/** Builds a readable post URL, e.g. giving-good-deeds-islamic-affairs-board. */
export function postSlug(post: SluggablePost): string {
	const title = slugify(post.title);
	const category = post.category ? slugify(post.category) : "";
	return `${title}${category ? `-${category}` : ""}` || String(post.id);
}

/**
 * Resolves a URL slug to a post. IDs are still accepted so old links and
 * bookmarks keep working after the switch to readable URLs.
 */
export function findPostBySlug<T extends SluggablePost>(posts: T[], slug?: string): T | null {
	if (!slug) return null;
	return (
		posts.find(post => post.id === slug || postSlug(post) === slug || slugify(post.title) === slug) ??
		null
	);
}
