import { mockInfo } from "$lib/mocks/data.js";
import { API_BASE } from "$lib/api/base";

export const API_URLS = {
	events: `${API_BASE}/public/events`,
	prayerTimes: `${API_BASE}/public/prayer-times`,
	mosques: `${API_BASE}/public/mosques`,
	latestNews: `${API_BASE}/public/latest-news`,
	blogPosts: `${API_BASE}/public/blog-posts/approved`,
	programmes: `${API_BASE}/public/programmes`,
	advisors: `${API_BASE}/public/advisors`,
	alumni: `${API_BASE}/public/alumni`,
	excos: `${API_BASE}/public/excos`
};

async function safeFetch(fetch, url) {
	try {
		const res = await fetch(url);
		if (!res.ok) return null;
		return await res.json();
	} catch (err) {
		console.warn(`Failed to fetch ${url}:`, err?.message || err);
		return null;
	}
}

// Maps a data slice key -> the URL to fetch for it
const URL_BY_KEY = {
	info: API_URLS.prayerTimes,
	events: API_URLS.events,
	programmes: API_URLS.programmes,
	mosques: API_URLS.mosques,
	latestNews: API_URLS.latestNews,
	posts: API_URLS.blogPosts,
	advisors: API_URLS.advisors,
	alumni: API_URLS.alumni,
	excos: API_URLS.excos
};

// Maps a data slice key -> extractor turning the raw response into the page-data value
const EXTRACT_BY_KEY = {
	info: (res) => ({
		prayer_times: res?.data?.prayer_times ?? null,
		hijriDate: res?.data?.hijriDate || mockInfo.hijriDate,
		shortHijriDate: res?.data?.shortHijriDate || mockInfo.shortHijriDate,
		prayerTimesUpdatedAt: res?.data?.updatedAt || ''
	}),
	events: (res) => (Array.isArray(res?.data?.events) ? res.data.events : []),
	programmes: (res) => (Array.isArray(res?.data?.programmes) ? res.data.programmes : []),
	mosques: (res) => (Array.isArray(res?.data?.mosques) ? res.data.mosques : []),
	latestNews: (res) => (Array.isArray(res?.data?.items) ? res.data.items : []),
	posts: (res) => (Array.isArray(res?.data?.posts) ? res.data.posts : []),
	advisors: (res) => (Array.isArray(res?.data?.advisors) ? res.data.advisors : []),
	alumni: (res) => res?.data?.alumni ?? { sessions: [] },
	excos: (res) => res?.data?.excos ?? { sessions: [] }
};

export const DEFAULT_KEYS = [
	'info',
	'events',
	'programmes',
	'mosques',
	'latestNews',
	'posts',
	'advisors',
	'alumni',
	'excos'
];

/**
 * Load a subset of site data in parallel. Only fetches the slices listed in
 * `keys` (defaults to everything). This lets heavy, page-specific payloads
 * (e.g. excos) load only where they are needed instead of blocking every page.
 * @param {typeof fetch} fetch
 * @param {string[]} [keys]
 */
export async function loadSiteData(fetch, keys = DEFAULT_KEYS) {
	const entries = await Promise.all(
		keys.map(async (key) => {
			const url = URL_BY_KEY[key];
			const res = url ? await safeFetch(fetch, url) : null;
			return [key, EXTRACT_BY_KEY[key] ? EXTRACT_BY_KEY[key](res) : null];
		})
	);

	const data = Object.fromEntries(entries);

	return {
		info: { ...mockInfo, ...(data.info || {}) },
		events: data.events ?? [],
		programmes: data.programmes ?? [],
		mosques: data.mosques ?? [],
		latestNews: data.latestNews ?? [],
		posts: data.posts ?? [],
		advisors: data.advisors ?? [],
		alumni: data.alumni ?? { sessions: [] },
		excos: data.excos ?? { sessions: [] }
	};
}
