import { useEffect, useState } from "react";
import { API_BASE } from "~/lib/api/base";
import { Seo } from "~/components/seo";
import { SITE_URL } from "~/lib/config";
import { mapHomeEvent } from "~/lib/utils/events";
import { HeroSection } from "~/components/home/HeroSection";
import { Programmes } from "~/components/home/Programmes";
import { PrayerTimesSection } from "~/components/home/PrayerTimesSection";
import { LatestNewsSection } from "~/components/home/LatestNewsSection";
import { UpcomingEvents } from "~/components/home/UpcomingEvents";
import { BlogSection } from "~/components/home/BlogSection";
import { AlumniSection } from "~/components/home/AlumniSection";
import { SuggestionsSection } from "~/components/home/SuggestionsSection";
import { ImagePreloader } from "~/components/home/ImagePreloader";

function safeParse(json: any): string[] {
	try {
		return json ? JSON.parse(json) : [];
	} catch {
		return [];
	}
}

function mapPost(p: any) {
	return {
		title: p.title,
		excerpt: p.excerpt,
		link: p.link,
		date: p.wpDate,
		featured_image: p.featuredImage || "",
		categories: safeParse(p.categories),
	};
}

export default function Home() {
	const [events, setEvents] = useState<any[]>([]);
	const [latestNews, setLatestNews] = useState<any[]>([]);
	const [posts, setPosts] = useState<any[]>([]);
	const [programmes, setProgrammes] = useState<any[]>([]);
	const [mosques, setMosques] = useState<any[]>([]);
	const [alumniSessions, setAlumniSessions] = useState<any[]>([]);
	const [prayerInfo, setPrayerInfo] = useState<any>(null);
	const [prayerTimesUpdatedAt, setPrayerTimesUpdatedAt] = useState("");
	const [hijriDate, setHijriDate] = useState("");
	const [shortHijriDate, setShortHijriDate] = useState("");
	const [isDataLoaded, setIsDataLoaded] = useState(false);

	useEffect(() => {
		let cancelled = false;
		async function fetchHomeData() {
			const [eventsRes, newsRes, postsRes, programmesRes, mosquesRes, alumniRes, prayerRes] =
				await Promise.allSettled([
					fetch(`${API_BASE}/public/events`),
					fetch(`${API_BASE}/public/latest-news`),
					fetch(`${API_BASE}/public/blog-posts/approved`),
					fetch(`${API_BASE}/public/programmes`),
					fetch(`${API_BASE}/public/mosques`),
					fetch(`${API_BASE}/public/alumni`),
					fetch(`${API_BASE}/public/prayer-times`),
				]);

			if (cancelled) return;

			if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
				const body = await eventsRes.value.json();
				if (!cancelled && body?.data?.events) setEvents(body.data.events);
			}
			if (newsRes.status === "fulfilled" && newsRes.value.ok) {
				const body = await newsRes.value.json();
				if (!cancelled && body?.data?.items) setLatestNews(body.data.items);
			}
			if (postsRes.status === "fulfilled" && postsRes.value.ok) {
				const body = await postsRes.value.json();
				if (!cancelled && body?.data?.posts) setPosts(body.data.posts);
			}
			if (programmesRes.status === "fulfilled" && programmesRes.value.ok) {
				const body = await programmesRes.value.json();
				if (!cancelled && body?.data?.programmes) setProgrammes(body.data.programmes);
			}
			if (mosquesRes.status === "fulfilled" && mosquesRes.value.ok) {
				const body = await mosquesRes.value.json();
				if (!cancelled && body?.data?.mosques) setMosques(body.data.mosques);
			}
			if (alumniRes.status === "fulfilled" && alumniRes.value.ok) {
				const body = await alumniRes.value.json();
				if (!cancelled && body?.data?.alumni?.sessions) setAlumniSessions(body.data.alumni.sessions);
			}
			if (prayerRes.status === "fulfilled" && prayerRes.value.ok) {
				const body = await prayerRes.value.json();
				if (!cancelled && body?.data) {
					setPrayerInfo(body.data.prayer_times ?? null);
					setPrayerTimesUpdatedAt(body.data.updatedAt || "");
					setHijriDate(body.data.hijriDate || "");
					setShortHijriDate(body.data.shortHijriDate || "");
				}
			}
			if (!cancelled) setIsDataLoaded(true);
		}
		fetchHomeData();
		return () => {
			cancelled = true;
		};
	}, []);

	const mappedEvents = events.slice(0, 3).map(mapHomeEvent);
	const mappedPosts = [...posts]
		.sort((a, b) => new Date(b.approvedAt || 0).getTime() - new Date(a.approvedAt || 0).getTime())
		.slice(0, 3)
		.map(mapPost);
	const slicedProgrammes = programmes.slice(0, 4);
	const slicedLatestNews = latestNews.slice(0, 3);

	const homeImages = [
		"/images/bg-1.webp",
		"/images/pattern.svg",
		"/images/man_1.webp",
		"/images/woman_1.webp",
		"/images/man_2.webp",
		"/images/woman_2.webp",
		"/images/man_3.webp",
		"/images/woman_3.webp",
		"/images/man_4.webp",
		"/images/woman_4.webp",
		"/images/man_5.webp",
		"/images/woman_5.webp",
		"/images/man_6.webp",
		"/images/woman_6.webp",
		"/images/man_7.webp",
		"/images/woman_7.webp",
		...slicedProgrammes.map((p) => p.image).filter(Boolean),
		...events.map((e) => e.image || e.imageUrl).filter(Boolean),
		...slicedLatestNews.map((n) => n.image).filter(Boolean),
		...mappedPosts.map((p) => p.featured_image).filter(Boolean),
		...mosques.flatMap((m) => (m.images || []).slice(0, 1)),
		...alumniSessions.flatMap((s) => [s.ameer?.photo, s.ameerah?.photo]).filter(Boolean),
	];

	return (
		<>
			<Seo
				path="/"
				title="MSSNOAU - Great Ìfẹ́'s Student Muslim Community"
				description="Welcome to the Muslim Students Society of Nigeria, OAU Branch – the official community of Muslim students at Obafemi Awolowo University. Join us for academic excellence, Islamic education, and community engagement."
				images={[
					{
						url: "/images/bg-1.webp",
						width: 1200,
						height: 630,
						alt: "MSSNOAU - Muslim Students Society of Nigeria, OAU Branch",
					},
				]}
				keywords="MSSN, MSSNOAU, Muslim Students Society, Obafemi Awolowo University, OAU, Islamic organization, Muslim community, prayer times, Islamic events, donate to MSSN, Great Ifẹ̀"
				schema={{
					"@type": "WebPage",
					"@id": `${SITE_URL}/#webpage`,
					url: `${SITE_URL}/`,
					name: "Muslim Students Society of Nigeria, OAU Branch | MSSNOAU",
					isPartOf: { "@id": `${SITE_URL}/#website` },
					about: { "@id": `${SITE_URL}/#organization` },
					primaryImageOfPage: { "@type": "ImageObject", url: "/images/bg-1.webp" },
					inLanguage: "en-US",
				}}
			/>

			<HeroSection />

			<Programmes programmes={slicedProgrammes} />

			<PrayerTimesSection
				prayerTimes={prayerInfo}
				prayerTimesUpdatedAt={prayerTimesUpdatedAt}
				hijriDate={hijriDate}
				shortHijriDate={shortHijriDate}
				mosques={mosques}
			/>

			<LatestNewsSection items={slicedLatestNews} />

			<UpcomingEvents events={mappedEvents} />

			<BlogSection posts={mappedPosts} />

			<AlumniSection sessions={alumniSessions} />

			<SuggestionsSection />

			<ImagePreloader images={homeImages} />
		</>
	);
}
