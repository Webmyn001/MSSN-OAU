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

export async function loadSiteData(fetch) {
	const [eventsRes, prayerRes, mosquesRes, newsRes, blogRes, programmesRes, advisorsRes, alumniRes, excosRes] =
		await Promise.all([
			safeFetch(fetch, API_URLS.events),
			safeFetch(fetch, API_URLS.prayerTimes),
			safeFetch(fetch, API_URLS.mosques),
			safeFetch(fetch, API_URLS.latestNews),
			safeFetch(fetch, API_URLS.blogPosts),
			safeFetch(fetch, API_URLS.programmes),
			safeFetch(fetch, API_URLS.advisors),
			safeFetch(fetch, API_URLS.alumni),
			safeFetch(fetch, API_URLS.excos)
		]);

	return {
		info: {
			...mockInfo,
			prayer_times: prayerRes?.data?.prayer_times ?? null,
			hijriDate: prayerRes?.data?.hijriDate || mockInfo.hijriDate,
			shortHijriDate: prayerRes?.data?.shortHijriDate || mockInfo.shortHijriDate,
			prayerTimesUpdatedAt: prayerRes?.data?.updatedAt || ''
		},
		events: Array.isArray(eventsRes?.data?.events) ? eventsRes.data.events : [],
		programmes: Array.isArray(programmesRes?.data?.programmes) ? programmesRes.data.programmes : [],
		mosques: Array.isArray(mosquesRes?.data?.mosques) ? mosquesRes.data.mosques : [],
		latestNews: Array.isArray(newsRes?.data?.items) ? newsRes.data.items : [],
		posts: Array.isArray(blogRes?.data?.posts) ? blogRes.data.posts : [],
		advisors: Array.isArray(advisorsRes?.data?.advisors) ? advisorsRes.data.advisors : [],
		alumni: alumniRes?.data?.alumni ?? { sessions: [] },
		excos: excosRes?.data?.excos ?? { sessions: [] }
	};
}
