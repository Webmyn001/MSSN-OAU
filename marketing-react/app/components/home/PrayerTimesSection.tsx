import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, MapPin, MapPinned, Moon, MousePointerClick } from "lucide-react";
import { PrayerTimeCard } from "./PrayerTimeCard";
import { ResponsiveModal } from "~/components/layout/ResponsiveModal";
import { Button } from "~/components/ui/button";
import { API_BASE } from "~/lib/api/base";
import { formatTime, getSolahPeriod, type PrayerTimesData } from "~/lib/utils/prayer";
import {
	getFormattedDateVerbose,
	getFormattedDateVerboseShort,
} from "~/lib/utils/dateFormatting";

export interface MosqueData {
	id: string;
	label: string;
	url?: string;
	images?: string[];
	address?: string;
	description?: string;
	name?: string;
	prayerTimes?: Record<string, string>;
}

interface PrayerTimesSectionProps {
	prayerTimes?: PrayerTimesData | null;
	prayerTimesUpdatedAt?: string;
	hijriDate?: string;
	shortHijriDate?: string;
	mosques?: MosqueData[];
}

const PRAYER_META = [
	{ key: "subhi", name: "Fajr", background: "/images/midnight.webp", color: "from-indigo-500/80 to-purple-600/80", icon: "🌅" },
	{ key: "dhuhr", name: "Dhuhr", background: "/images/noon.webp", color: "from-amber-500/80 to-orange-600/80", icon: "☀️" },
	{ key: "asr", name: "Asr", background: "/images/evening.webp", color: "from-orange-400/80 to-rose-600/80", icon: "🌇" },
	{ key: "maghrib", name: "Maghrib", background: "/images/late-evening.webp", color: "from-rose-500/80 to-purple-700/80", icon: "🌆" },
	{ key: "isha", name: "Isha", background: "/images/night.webp", color: "from-blue-600/80 to-indigo-900/80", icon: "🌙" },
] as const;

function buildPrayerData(pt?: PrayerTimesData | null) {
	if (!pt || typeof pt !== "object") return [];
	return PRAYER_META.map((meta) => {
		const entry = pt[meta.key];
		if (!entry || typeof entry !== "object") return null;
		return {
			name: meta.name,
			background: meta.background,
			color: meta.color,
			icon: meta.icon,
			adhan: entry.adhan || "",
			iqamah: entry.iqamah || "",
		};
	}).filter(Boolean) as {
		name: string;
		background: string;
		color: string;
		icon: string;
		adhan: string | number;
		iqamah: string | number;
	}[];
}

function MosqueCarousel({ images, label }: { images: string[]; label: string }) {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		if (images.length <= 1) return;
		const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 3000);
		return () => clearInterval(id);
	}, [images.length]);

	if (images.length === 0) return null;

	return (
		<div className="relative w-full max-w-xl mx-auto rounded-lg overflow-hidden shadow-lg">
			<div className="relative h-80">
				{images.map((image, i) => (
					<img
						key={image + i}
						src={image}
						alt={`${label} - Image ${i + 1}`}
						className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
							i === index ? "opacity-100" : "opacity-0"
						}`}
					/>
				))}
			</div>
			{images.length > 1 ? (
				<>
					<button
						type="button"
						onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
						className="absolute left-2 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-black/40 text-white flex items-center justify-center"
						aria-label="Previous image"
					>
						‹
					</button>
					<button
						type="button"
						onClick={() => setIndex((i) => (i + 1) % images.length)}
						className="absolute right-2 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-black/40 text-white flex items-center justify-center"
						aria-label="Next image"
					>
						›
					</button>
				</>
			) : null}
		</div>
	);
}

export function PrayerTimesSection({
	prayerTimes,
	prayerTimesUpdatedAt = "",
	hijriDate,
	shortHijriDate,
	mosques = [],
}: PrayerTimesSectionProps) {
	const [apiPrayerTimes, setApiPrayerTimes] = useState<PrayerTimesData | null>(prayerTimes ?? null);
	const [hijrahDate, setHijrahDate] = useState(hijriDate || "");
	const [shortHijrahDate, setShortHijrahDate] = useState(shortHijriDate || "");
	const [selectedMosque, setSelectedMosque] = useState("");
	const [showMosqueModal, setShowMosqueModal] = useState(false);
	const [expandedMosqueId, setExpandedMosqueId] = useState("");

	const formattedUpdatedAt = useMemo(() => {
		if (!prayerTimesUpdatedAt) return "";
		try {
			return new Date(prayerTimesUpdatedAt).toLocaleString("en-NG", {
				dateStyle: "medium",
				timeStyle: "short",
			});
		} catch {
			return "";
		}
	}, [prayerTimesUpdatedAt]);

	useEffect(() => {
		let active = true;

		(async () => {
			if (!apiPrayerTimes) {
				try {
					const res = await fetch(`${API_BASE}/public/prayer-times`);
					if (res.ok) {
						const body = await res.json();
						if (active && body?.success && body?.data) {
							if (body.data.prayer_times) setApiPrayerTimes(body.data.prayer_times);
							if (body.data.hijriDate && !hijrahDate) setHijrahDate(body.data.hijriDate);
							if (body.data.shortHijriDate && !shortHijrahDate)
								setShortHijrahDate(body.data.shortHijriDate);
						}
					}
				} catch (err) {
					console.warn("Could not fetch prayer times from API server:", err);
				}
			}
		})();

		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const prayerData = buildPrayerData(apiPrayerTimes);
	const hasPrayerTimes = prayerData.length > 0;

	const upcomingIndex = useMemo(() => {
		const period = getSolahPeriod(apiPrayerTimes || ({} as PrayerTimesData));
		const order = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
		const idx = order.indexOf(period);
		return idx === -1 ? 0 : idx;
	}, [apiPrayerTimes]);

	const selectedMosqueObject = mosques.find((m) => m.id === selectedMosque);
	const expandedMosqueObject = mosques.find((m) => m.id === expandedMosqueId);

	function toggleMosque(id: string) {
		setExpandedMosqueId((prev) => (prev === id ? "" : id));
	}

	function handleBadgeClick(id: string) {
		setSelectedMosque(id);
		setShowMosqueModal(true);
	}

	const jumuah = apiPrayerTimes?.jumuah;

	return (
		<section
			id="prayer-times"
			className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 overflow-hidden"
		>
			<div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
			<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/20 rounded-full blur-3xl" />

			<div className="relative z-10 space-y-12">
				<div className="backdrop-blur-xl bg-white/30 rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
						<div className="space-y-2">
							<h1 className="font-primary font-bold text-3xl sm:text-4xl lg:text-5xl text-primary-900 tracking-tight">
								Prayer Times
							</h1>
							<p className="text-primary-700 font-secondary text-lg">
								For all musollahs at OAU, Ilé-Ifẹ̀.
							</p>
						</div>

						<div className="flex items-center gap-4">
							<div className="backdrop-blur-md bg-white/40 p-4 rounded-xl border border-white/30 shadow-lg">
								<div className="flex items-center gap-2 mb-2">
									<Calendar className="h-4 w-4 text-primary-700" />
									<p className="text-primary-800 font-tertiary text-sm sm:text-base">
										<span className="hidden sm:inline">{getFormattedDateVerbose()}</span>
										<span className="sm:hidden">{getFormattedDateVerboseShort()}</span>
									</p>
								</div>
								<div className="flex items-center gap-2">
									<Moon className="h-4 w-4 text-primary-700" />
									<p className="text-primary-900 font-tertiary font-semibold text-sm sm:text-base">
										<span className="hidden sm:inline">{hijrahDate}</span>
										<span className="sm:hidden">{shortHijrahDate}</span>
									</p>
								</div>
								{formattedUpdatedAt ? (
									<div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/20">
										<Clock className="h-3.5 w-3.5 text-primary-600" />
										<p className="text-primary-700 font-tertiary text-xs">
											Updated: {formattedUpdatedAt}
										</p>
									</div>
								) : null}
							</div>
						</div>
					</div>
				</div>

				{hasPrayerTimes ? (
					<>
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
							{prayerData.map((prayer, index) => (
								<div
									key={prayer.name}
									className={`h-full ${
										index === prayerData.length - 1 ? "col-span-2 sm:col-span-1" : ""
									}`}
								>
									<PrayerTimeCard
										prayerName={prayer.name}
										adhanTime={prayer.adhan}
										iqamahTime={prayer.iqamah}
										background={prayer.background}
										isUpcoming={upcomingIndex === index}
										gradientColor={prayer.color}
										icon={prayer.icon}
									/>
								</div>
							))}
						</div>

						{jumuah ? (
							<div className="flex justify-center items-center w-full">
								<div className="relative w-full max-w-3xl overflow-hidden rounded-2xl shadow-xl group">
									<div className="absolute inset-0">
										<img
											src="/images/bg-1.webp"
											alt="Central Mosque of Unity, OAU Ilé-Ifẹ̀"
											loading="lazy"
											className="w-full h-full object-cover object-center"
										/>
										<div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40" />
										<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
									</div>

									<div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 p-7 sm:p-9">
										<div className="shrink-0 relative">
											<div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/40 text-amber-200 shadow-lg">
												<Moon className="w-8 h-8" strokeWidth={2} />
											</div>
										</div>

										<div className="flex-1 text-center sm:text-left">
											<p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300 mb-1">
												Friday Congregation
											</p>
											<h3 className="font-primary font-bold text-2xl sm:text-3xl text-white drop-shadow tracking-tight">
												Jumu&apos;ah Prayer
											</h3>
											<p className="font-tertiary text-gray-100/90 text-sm mt-1.5">
												Gather early, the Khutbah begins before the congregational Salah.
											</p>
										</div>

										<div className="flex items-center gap-3 shrink-0">
											<div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/25 px-4 py-3 text-center">
												<p className="text-[9px] font-semibold uppercase tracking-widest text-gray-300 mb-0.5">
													Khutbah
												</p>
												<p className="text-white font-primary font-bold text-lg sm:text-xl tabular-nums whitespace-nowrap leading-none">
													{formatTime(jumuah.adhan)}
												</p>
											</div>
											<div className="h-10 w-px bg-white/25 hidden sm:block" />
											<div className="rounded-xl bg-amber-400/90 px-4 py-3 text-center">
												<p className="text-[9px] font-semibold uppercase tracking-widest text-amber-950 mb-0.5">
													Salah
												</p>
												<p className="text-amber-950 font-primary font-bold text-lg sm:text-xl tabular-nums whitespace-nowrap leading-none">
													{formatTime(jumuah.iqamah)}
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						) : null}
					</>
				) : (
					<div className="text-center py-12">
						<Clock className="h-12 w-12 text-primary-300 mx-auto mb-4" />
						<p className="text-primary-600 font-secondary text-lg">
							Prayer times are currently unavailable.
						</p>
						<p className="text-primary-400 font-tertiary text-sm mt-1">
							Please check back later or contact the secretariat.
						</p>
					</div>
				)}

				<div className="backdrop-blur-xl bg-white/30 rounded-2xl shadow-xl border border-white/20 p-5 sm:p-6">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-2">
							<MapPin className="h-5 w-5 text-primary-700" />
							<h3 className="font-secondary font-semibold text-primary-800 text-base sm:text-lg">
								Mosque &amp; Musollah Finder
							</h3>
						</div>
						{mosques.length > 0 ? (
							<span className="text-xs font-tertiary text-primary-600">
								{mosques.length} locations
							</span>
						) : null}
					</div>
					{mosques.length > 0 ? (
						<p className="flex items-center gap-1.5 text-[11px] sm:text-xs font-tertiary text-primary-600 mb-3">
							<MousePointerClick className="w-3.5 h-3.5 shrink-0" />
							Tap a photo to view details &amp; photos
						</p>
					) : null}

					{mosques.length > 0 ? (
						<>
							<div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x -mx-1 px-1">
								{mosques.map((mosque) => (
									<button
										key={mosque.id}
										type="button"
										onClick={() => toggleMosque(mosque.id)}
										aria-expanded={expandedMosqueId === mosque.id}
										aria-label={`Toggle details for ${mosque.label}`}
										className={`snap-start shrink-0 w-28 rounded-xl overflow-hidden border-2 transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 ${
											expandedMosqueId === mosque.id
												? "border-primary-600 ring-2 ring-primary-300 scale-[1.02] shadow-lg"
												: "border-white/30 hover:border-primary-300"
										}`}
									>
										<div className="relative h-24">
											<img
												src={mosque.images?.[0] || "/images/placeholder.webp"}
												alt={mosque.label}
												loading="lazy"
												className="w-full h-full object-cover"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
											<span className="absolute bottom-1.5 left-2 right-2 text-white text-[11px] font-medium truncate drop-shadow">
												{mosque.label}
											</span>
										</div>
									</button>
								))}
							</div>

							{expandedMosqueObject ? (
								<div className="mt-4 pt-4 border-t border-white/20">
									<div className="flex flex-col sm:flex-row gap-4">
										<div className="sm:w-2/5 shrink-0">
											<img
												src={expandedMosqueObject.images?.[0] || "/images/placeholder.webp"}
												alt={expandedMosqueObject.label}
												loading="lazy"
												className="w-full h-40 sm:h-56 object-cover rounded-xl"
											/>
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
												<div className="min-w-0">
													<h4 className="font-secondary font-semibold text-primary-900 text-base">
														{expandedMosqueObject.label}
													</h4>
													{expandedMosqueObject.address ? (
														<p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
															<MapPinned className="w-3 h-3 shrink-0" />
															<span className="truncate min-w-0">
																{expandedMosqueObject.address}
															</span>
														</p>
													) : null}
												</div>
												{expandedMosqueObject.images && expandedMosqueObject.images.length > 1 ? (
													<button
														type="button"
														onClick={() => handleBadgeClick(expandedMosqueObject.id)}
														className="text-xs font-semibold text-primary-700 hover:underline shrink-0 mt-1 inline-flex items-center gap-1"
													>
														View photos →
													</button>
												) : null}
											</div>
											{expandedMosqueObject.description ? (
												<p className="mt-3 text-sm text-primary-800/80 leading-relaxed">
													{expandedMosqueObject.description}
												</p>
											) : null}
										</div>
									</div>
								</div>
							) : null}
						</>
					) : (
						<p className="text-sm text-primary-600/70 font-tertiary">
							Mosque and musollah locations coming soon.
						</p>
					)}
				</div>
			</div>

			{selectedMosqueObject ? (
				<ResponsiveModal
					open={showMosqueModal}
					onOpenChange={(open) => setShowMosqueModal(open)}
					title={selectedMosqueObject.name || selectedMosqueObject.label}
					description={selectedMosqueObject.address}
					contentClass="sm:max-w-2xl"
					footer={
						<Button variant="outline" onClick={() => setShowMosqueModal(false)}>
							Close
						</Button>
					}
				>
					<div className="py-2 space-y-4">
						{selectedMosqueObject.images && selectedMosqueObject.images.length > 0 ? (
							<MosqueCarousel
								images={selectedMosqueObject.images}
								label={selectedMosqueObject.name || selectedMosqueObject.label}
							/>
						) : null}

						{selectedMosqueObject.description ? (
							<p className="text-sm text-gray-600 leading-relaxed">
								{selectedMosqueObject.description}
							</p>
						) : null}

						{selectedMosqueObject.prayerTimes &&
						Object.keys(selectedMosqueObject.prayerTimes).length > 0 ? (
							<div className="pt-2 border-t">
								<h4 className="text-sm font-semibold text-gray-900 mb-2">Prayer Times</h4>
								<div className="grid grid-cols-2 gap-2 text-sm">
									{Object.entries(selectedMosqueObject.prayerTimes).map(([key, value]) => (
										<div key={key} className="flex items-center justify-between">
											<span className="capitalize text-gray-500">{key}</span>
											<span className="font-medium text-gray-800">{formatTime(value)}</span>
										</div>
									))}
								</div>
							</div>
						) : null}

						{selectedMosqueObject.url ? (
							<a
								href={selectedMosqueObject.url}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:underline"
							>
								<MapPinned className="size-4" /> View on Maps
							</a>
						) : null}
					</div>
				</ResponsiveModal>
			) : null}
		</section>
	);
}
