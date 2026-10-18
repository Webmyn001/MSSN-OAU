import { exampleInfo } from "~/lib/mocks/info";
import type { SiteInfo } from "~/lib/mocks/info";
import { API_BASE } from "~/lib/api/base";

export const API_URLS = {
	events: `${API_BASE}/public/events`,
	prayerTimes: `${API_BASE}/public/prayer-times`,
	mosques: `${API_BASE}/public/mosques`,
	latestNews: `${API_BASE}/public/latest-news`,
	blogPosts: `${API_BASE}/public/blog-posts/approved`,
	programmes: `${API_BASE}/public/programmes`,
	advisors: `${API_BASE}/public/advisors`,
	alumni: `${API_BASE}/public/alumni`,
	excos: `${API_BASE}/public/excos`,
} as const;

type FetchFn = typeof fetch;

async function safeFetch(fetchFn: FetchFn, url: string) {
	try {
		const res = await fetchFn(url);
		if (!res.ok) return null;
		return await res.json();
	} catch (err: any) {
		console.warn(`Failed to fetch ${url}:`, err?.message || err);
		return null;
	}
}

const URL_BY_KEY: Record<string, string | undefined> = {
	info: API_URLS.prayerTimes,
	events: API_URLS.events,
	programmes: API_URLS.programmes,
	mosques: API_URLS.mosques,
	latestNews: API_URLS.latestNews,
	posts: API_URLS.blogPosts,
	advisors: API_URLS.advisors,
	alumni: API_URLS.alumni,
	excos: API_URLS.excos,
};

const EXTRACT_BY_KEY: Record<string, (res: any) => any> = {
	info: (res) => ({
		prayer_times: res?.data?.prayer_times ?? null,
		hijriDate: res?.data?.hijriDate || exampleInfo.hijriDate,
		shortHijriDate: res?.data?.shortHijriDate || exampleInfo.shortHijriDate,
		prayerTimesUpdatedAt: res?.data?.updatedAt || "",
	}),
	events: (res) => (Array.isArray(res?.data?.events) ? res.data.events : []),
	programmes: (res) => (Array.isArray(res?.data?.programmes) ? res.data.programmes : []),
	mosques: (res) => (Array.isArray(res?.data?.mosques) ? res.data.mosques : []),
	latestNews: (res) => (Array.isArray(res?.data?.items) ? res.data.items : []),
	posts: (res) => (Array.isArray(res?.data?.posts) ? res.data.posts : []),
	advisors: (res) => (Array.isArray(res?.data?.advisors) ? res.data.advisors : []),
	alumni: (res) => res?.data?.alumni ?? { sessions: [] },
	excos: (res) => res?.data?.excos ?? { sessions: [] },
};

export const DEFAULT_KEYS = [
	"info",
	"events",
	"programmes",
	"mosques",
	"latestNews",
	"posts",
	"advisors",
	"alumni",
	"excos",
];

export type SiteDataKey = (typeof DEFAULT_KEYS)[number];

export interface SiteData {
	info: SiteInfo;
	events: any[];
	programmes: any[];
	mosques: any[];
	latestNews: any[];
	posts: any[];
	advisors: any[];
	alumni: { sessions: any[] };
	excos: { sessions: any[] };
}

export async function loadSiteData(
	fetchFn: FetchFn,
	keys: string[] = DEFAULT_KEYS
): Promise<SiteData> {
	const entries = await Promise.all(
		keys.map(async (key) => {
			const url = URL_BY_KEY[key];
			const res = url ? await safeFetch(fetchFn, url) : null;
			return [key, EXTRACT_BY_KEY[key] ? EXTRACT_BY_KEY[key](res) : null];
		})
	);

	const data = Object.fromEntries(entries);

	return {
		info: { ...exampleInfo, ...(data.info || {}) } as SiteInfo,
		events: data.events ?? [],
		programmes: data.programmes ?? [],
		mosques: data.mosques ?? [],
		latestNews: data.latestNews ?? [],
		posts: data.posts ?? [],
		advisors: data.advisors ?? [],
		alumni: data.alumni ?? { sessions: [] },
		excos: data.excos ?? { sessions: [] },
	};
}
