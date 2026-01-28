// * WordPress API endpoint
const WORDPRESS_API_URL = 'https://annuurpress.org.ng/wp-json';

/**
 * * Fetches data from WordPress REST API
 * @param {string} endpoint - API endpoint (e.g., 'posts', 'posts/123')
 * @param {Object} params - Query parameters
 * @returns {Promise<any>} API response
 */
async function wpFetch(endpoint, params = {}) {
	const url = new URL(`${WORDPRESS_API_URL}/wp/v2/${endpoint}`);

	// * Add query parameters
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

/**
 * * Fetches blog posts from WordPress API
 * @param {Object} options - Fetch options
 * @param {number} [options.per_page=10] - Number of posts per page
 * @param {number} [options.page=1] - Page number
 * @param {string} [options.search] - Search query
 * @param {string} [options.orderby='date'] - Order by field
 * @param {string} [options.order='desc'] - Order direction
 * @returns {Promise<Array>} Array of WordPress posts
 */
export async function fetchPosts(options = {}) {
	try {
		const {
			per_page = 10,
			page = 1,
			search,
			orderby = 'date',
			order = 'desc'
		} = options;

		const params = {
			per_page,
			page,
			orderby,
			order,
			status: 'publish',
			_embed: true
		};

		if (search) {
			params.search = search;
		}

		const posts = await wpFetch('posts', params);

		// * Transform posts to match expected format
		return posts.map(post => transformPost(post));
	} catch (error) {
		console.error('Error fetching WordPress posts:', error);
		return [];
	}
}

/**
 * * Fetches a single post by slug
 * @param {string} slug - Post slug
 * @returns {Promise<Object|null>} WordPress post or null
 */
export async function fetchPostBySlug(slug) {
	try {
		const posts = await wpFetch('posts', {
			slug,
			per_page: 1,
			status: 'publish',
			_embed: true
		});

		if (posts && posts.length > 0) {
			return transformPost(posts[0]);
		}

		return null;
	} catch (error) {
		console.error('Error fetching WordPress post by slug:', error);
		return null;
	}
}

/**
 * * Transforms WordPress API post to match expected format
 * @param {Object} wpPost - Raw WordPress post from API
 * @returns {Object} Transformed post
 */
function transformPost(wpPost) {
	const embedded = wpPost._embedded || {};
	const author = embedded.author?.[0];
	const featuredMedia = embedded['wp:featuredmedia']?.[0];

	return {
		id: wpPost.id,
		title: wpPost.title?.rendered || '',
		excerpt: wpPost.excerpt?.rendered || '',
		content: wpPost.content?.rendered || '',
		link: wpPost.link || '',
		slug: wpPost.slug || '',
		date: wpPost.date || '',
		modified: wpPost.modified || '',
		featured_image: featuredMedia?.source_url || featuredMedia?.media_details?.sizes?.large?.source_url || '',
		categories: embedded['wp:term']?.flat().filter(term => term.taxonomy === 'category').map(cat => cat.name) || [],
		tags: embedded['wp:term']?.flat().filter(term => term.taxonomy === 'post_tag').map(tag => tag.name) || [],
		authors: author ? [{
			name: author.name || '',
			avatar_urls: author.avatar_urls || {
				'48': '',
				'96': ''
			}
		}] : [],
		author: author ? {
			name: author.name || '',
			picture: author.avatar_urls?.['96'] || author.avatar_urls?.['48'] || ''
		} : null
	};
}
