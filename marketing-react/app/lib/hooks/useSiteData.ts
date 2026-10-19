import { useEffect, useState } from "react";
import { API_BASE } from "~/lib/api/base";

const API_URLS = {
	info: `${API_BASE}/public/prayer-times`,
	events: `${API_BASE}/public/events`,
	programmes: `${API_BASE}/public/programmes`,
	mosques: `${API_BASE}/public/mosques`,
	latestNews: `${API_BASE}/public/latest-news`,
	posts: `${API_BASE}/public/blog-posts/approved`,
	advisors: `${API_BASE}/public/advisors`,
	alumni: `${API_BASE}/public/alumni`,
} as const;

export type SiteDataKey = keyof typeof API_URLS;

async function fetchKey(key: SiteDataKey): Promise<any> {
	try {
		const res = await fetch(API_URLS[key]);
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

const EXTRACT: Record<SiteDataKey, (res: any) => any> = {
	info: (res) => ({
		prayer_times: res?.data?.prayer_times ?? null,
		hijriDate: res?.data?.hijriDate || "",
		shortHijriDate: res?.data?.shortHijriDate || "",
		prayerTimesUpdatedAt: res?.data?.updatedAt || "",
	}),
	events: (res) => (Array.isArray(res?.data?.events) ? res.data.events : []),
	programmes: (res) => (Array.isArray(res?.data?.programmes) ? res.data.programmes : []),
	mosques: (res) => (Array.isArray(res?.data?.mosques) ? res.data.mosques : []),
	latestNews: (res) => (Array.isArray(res?.data?.items) ? res.data.items : []),
	posts: (res) => (Array.isArray(res?.data?.posts) ? res.data.posts : []),
	advisors: (res) => (Array.isArray(res?.data?.advisors) ? res.data.advisors : []),
	alumni: (res) => res?.data?.alumni ?? { sessions: [] },
};

export function useSiteData<T = any>(
	key: SiteDataKey,
	initial: T
): [T, boolean] {
	const [data, setData] = useState<T>(initial);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		let cancelled = false;
		fetchKey(key).then((res) => {
			if (cancelled) return;
			const extracted = res ? EXTRACT[key](res) : initial;
			if (extracted !== undefined && extracted !== null) {
				setData(extracted);
			}
			setLoaded(true);
		});
		return () => {
			cancelled = true;
		};
	}, [key]);

	return [data, loaded];
}

export function useMultipleSiteData(
	keys: SiteDataKey[],
	initializers: Record<string, any>
): [Record<string, any>, boolean] {
	const [data, setData] = useState<Record<string, any>>(initializers);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		let cancelled = false;
		Promise.all(keys.map((key) => fetchKey(key))).then((results) => {
			if (cancelled) return;
			const next = { ...initializers };
			keys.forEach((key, i) => {
				const res = results[i];
				if (res) {
					const extracted = EXTRACT[key](res);
					if (extracted !== undefined && extracted !== null) {
						next[key] = extracted;
					}
				}
			});
			setData(next);
			setLoaded(true);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	return [data, loaded];
}
