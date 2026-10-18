import { useRouteLoaderData } from "react-router";
import type { loader as rootLoader } from "~/root";
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
	const root = useRouteLoaderData<typeof rootLoader>("root");
	const site = root?.site;

	const events = ((site?.events ?? []) as any[]).slice(0, 3).map(mapHomeEvent);
	const latestNews = ((site?.latestNews ?? []) as any[]).slice(0, 3);
	const posts = [...((site?.posts ?? []) as any[])]
		.sort((a, b) => new Date(b.approvedAt || 0).getTime() - new Date(a.approvedAt || 0).getTime())
		.slice(0, 3)
		.map(mapPost);
	const programmes = ((site?.programmes ?? []) as any[]).slice(0, 4);
	const mosques = (site?.mosques ?? []) as any[];
	const info = site?.info;

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
		...programmes.map((p) => p.image).filter(Boolean),
		...((site?.events ?? []) as any[]).map((e) => e.image || e.imageUrl).filter(Boolean),
		...latestNews.map((n) => n.image).filter(Boolean),
		...posts.map((p) => p.featured_image).filter(Boolean),
		...mosques.flatMap((m) => (m.images || []).slice(0, 1)),
		...(((site?.alumni?.sessions ?? []) as any[]) || [])
			.flatMap((s) => [s.ameer?.photo, s.ameerah?.photo])
			.filter(Boolean),
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

			<Programmes programmes={programmes} />

			<PrayerTimesSection
				prayerTimes={info?.prayer_times ?? null}
				prayerTimesUpdatedAt={info?.prayerTimesUpdatedAt ?? ""}
				hijriDate={info?.hijriDate ?? ""}
				shortHijriDate={info?.shortHijriDate ?? ""}
				mosques={mosques}
			/>

			<LatestNewsSection items={latestNews} />

			<UpcomingEvents events={events} />

			<BlogSection posts={posts} />

			<AlumniSection sessions={(site?.alumni?.sessions ?? []) as any[]} />

			<SuggestionsSection />

			<ImagePreloader images={homeImages} />
		</>
	);
}
