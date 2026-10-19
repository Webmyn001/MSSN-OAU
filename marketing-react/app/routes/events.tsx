import { useEffect, useMemo, useRef, useState } from "react";
import {
	CalendarDays,
	MapPin,
	Ticket,
	ExternalLink,
	Info,
	UserCircle,
	Tag,
	Users,
	ChevronRight,
	Filter,
	Search,
} from "lucide-react";
import { Seo } from "~/components/seo";
import { PageHeader } from "~/components/layout/PageHeader";
import { ResponsiveModal } from "~/components/layout/ResponsiveModal";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatDate, isPastDate } from "~/lib/utils/dates";
import slugify from "~/lib/utils/slugify";
import { SITE_URL } from "~/lib/config";
import { API_BASE } from "~/lib/api/base";
import { mapEvent, type ApiEvent, type Event } from "~/lib/utils/events";
import { useSiteData } from "~/lib/hooks/useSiteData";

interface ProcessedEvents {
	upcoming: Event[];
	past: Event[];
	excluded: Event[];
}

function processEvents(eventsArray: Event[] | undefined): ProcessedEvents {
	if (!Array.isArray(eventsArray)) {
		return { upcoming: [], past: [], excluded: [] };
	}

	const now = new Date();
	const twelveMonthsAgo = new Date(now);
	twelveMonthsAgo.setMonth(now.getMonth() - 12);

	const dateCache = new Map<string, Date>();

	const getEventDate = (event: Event): Date => {
		if (!dateCache.has(event.date)) {
			dateCache.set(event.date, new Date(event.date));
		}
		return dateCache.get(event.date)!;
	};

	function adjustPeriodicalEvent(event: Event): Event {
		if (!event.periodical) return event;

		const { periodical, day } = event;

		if (!["weekly", "monthly"].includes(periodical)) {
			return event;
		}
		if (
			typeof day !== "number" ||
			day < 0 ||
			(periodical === "weekly" && day > 6) ||
			(periodical === "monthly" && day > 31)
		) {
			return event;
		}

		const newEvent: Event = { ...event, date: new Date(event.date).toISOString() };
		const newEventDate = new Date(newEvent.date);

		if (periodical === "weekly") {
			const currentDay = newEventDate.getDay();
			const daysToAdd = (day! - currentDay + 7) % 7;
			newEventDate.setDate(newEventDate.getDate() + daysToAdd);
			while (newEventDate < now) {
				newEventDate.setDate(newEventDate.getDate() + 7);
			}
		} else if (periodical === "monthly") {
			newEventDate.setDate(day!);
			while (
				newEventDate < now ||
				(newEventDate.getMonth() === now.getMonth() &&
					newEventDate.getFullYear() === now.getFullYear() &&
					newEventDate.getDate() < day! &&
					newEventDate < now)
			) {
				newEventDate.setMonth(newEventDate.getMonth() + 1);
				newEventDate.setDate(day!);
				if (newEventDate.getDate() !== day) {
					newEventDate.setDate(0);
					newEventDate.setDate(day!);
					if (newEventDate < now) {
						newEventDate.setMonth(newEventDate.getMonth() + 1);
						newEventDate.setDate(day!);
					}
				}
			}
		}
		newEvent.date = newEventDate.toISOString();
		return newEvent;
	}

	try {
		const initialAccumulator: ProcessedEvents = { upcoming: [], past: [], excluded: [] };
		const categorizedEvents = eventsArray.reduce((acc, event) => {
			if (!event || typeof event.date !== "string") return acc;
			const adjustedEvent = adjustPeriodicalEvent(event);
			const eventDate = getEventDate(adjustedEvent);
			if (eventDate >= now) {
				acc.upcoming.push(adjustedEvent);
			} else if (eventDate >= twelveMonthsAgo) {
				acc.past.push(adjustedEvent);
			} else {
				acc.excluded.push(adjustedEvent);
			}
			return acc;
		}, initialAccumulator);

		categorizedEvents.upcoming.sort(
			(a, b) => getEventDate(a).getTime() - getEventDate(b).getTime()
		);
		categorizedEvents.past.sort(
			(a, b) => getEventDate(b).getTime() - getEventDate(a).getTime()
		);
		return categorizedEvents;
	} catch {
		return { upcoming: [], past: [], excluded: [] };
	}
}

export default function EventsPage() {
	const [rawEvents] = useSiteData<ApiEvent[]>("events", []);

	const allEvents = useMemo(() => processEvents(rawEvents.map(mapEvent)), [rawEvents]);
	const [mode, setMode] = useState<"upcoming" | "past">("upcoming");
	const events = allEvents[mode];

	const [open, setOpen] = useState(false);
	const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState("all");
	const filterButtonRef = useRef<HTMLDivElement>(null);
	const filterPanelRef = useRef<HTMLDivElement>(null);

	const [regName, setRegName] = useState("");
	const [regEmail, setRegEmail] = useState("");
	const [regPhone, setRegPhone] = useState("");
	const [regLoading, setRegLoading] = useState(false);
	const [regSuccess, setRegSuccess] = useState<any | null>(null);
	const [regError, setRegError] = useState("");

	const categories = useMemo(
		() => [
			"all",
			...Array.from(
				new Set((events || []).filter((e) => e.category).map((e) => e.category as string))
			),
		],
		[events]
	);

	const filteredEvents = useMemo(() => {
		let result = [...(events || [])];
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(event) =>
					event.title.toLowerCase().includes(query) ||
					event.summary.toLowerCase().includes(query) ||
					(event.tags && event.tags.some((tag) => tag.toLowerCase().includes(query)))
			);
		}
		if (selectedCategory !== "all") {
			result = result.filter((event) => event.category === selectedCategory);
		}
		return result;
	}, [events, searchQuery, selectedCategory]);

	const jsonLd = useMemo(() => {
		const schemaEvents = (allEvents.upcoming || []).map((event) => {
			const eventSlug = event.slug || slugify(event.title);
			let schemaEventUrl = `${SITE_URL}/events/${eventSlug}`;
			if (event.url && (event.url.startsWith("http://") || event.url.startsWith("https://"))) {
				schemaEventUrl = event.url;
			}
			const schemaEvent: Record<string, any> = {
				"@type": "Event",
				name: event.title,
				startDate: event.date,
				endDate: event.date,
				url: schemaEventUrl,
				description: event.summary,
				eventStatus: isPastDate(event.date)
					? "https://schema.org/EventCancelled"
					: "https://schema.org/EventScheduled",
				location: {
					"@type": "Place",
					name: event.venue || "Obafemi Awolowo University",
					address: {
						"@type": "PostalAddress",
						streetAddress: "Obafemi Awolowo University",
						addressLocality: "Ilé-Ifẹ̀",
						addressRegion: "Osun",
						postalCode: "200211",
						addressCountry: "NG",
					},
				},
				organizer: { "@type": "Organization", name: event.host || "MSSN OAU" },
				eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
				offers: {
					"@type": "Offer",
					price: "0",
					priceCurrency: "NGN",
					url: schemaEventUrl,
					availability: "https://schema.org/InStock",
					validFrom: event.registration_deadline || new Date().toISOString(),
				},
			};
			if (event.image) schemaEvent.image = [event.image];
			return schemaEvent;
		});

		return {
			"@context": "https://schema.org",
			"@graph": [
				{
					"@type": "WebPage",
					name: "MSSN OAU Events",
					description: "Upcoming and past events organized by MSSN OAU.",
					url: `${SITE_URL}/events`,
				},
				...schemaEvents,
			],
		};
	}, [allEvents]);

	useEffect(() => {
		if (!showFilters) return;
		function onDocClick(e: MouseEvent) {
			const target = e.target as Node;
			if (
				filterButtonRef.current &&
				!filterButtonRef.current.contains(target) &&
				filterPanelRef.current &&
				!filterPanelRef.current.contains(target)
			) {
				setShowFilters(false);
			}
		}
		document.addEventListener("mousedown", onDocClick);
		return () => document.removeEventListener("mousedown", onDocClick);
	}, [showFilters]);

	function openEventDetails(event: Event) {
		setCurrentEvent(event);
		setRegSuccess(null);
		setRegError("");
		setOpen(true);
	}

	function closeEventDetails() {
		setOpen(false);
		setTimeout(() => {
			setCurrentEvent(null);
			setRegSuccess(null);
			setRegError("");
		}, 300);
	}

	function resetFilters() {
		setSearchQuery("");
		setSelectedCategory("all");
	}

	async function submitRegistration(eventId?: string) {
		if (!regName.trim() || !regEmail.trim()) {
			setRegError("Please enter your Name and Email.");
			return;
		}
		setRegLoading(true);
		setRegError("");
		setRegSuccess(null);
		try {
			const res = await fetch(`${API_BASE}/public/events/${eventId}/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: regName.trim(),
					email: regEmail.trim(),
					phone: regPhone.trim() || null,
				}),
			});
			const json = await res.json();
			if (json.success) {
				setRegSuccess(json.data);
				setRegName("");
				setRegEmail("");
				setRegPhone("");
			} else {
				setRegError(json.error || "Registration failed");
			}
		} catch {
			setRegError("Unable to complete registration. Please try again.");
		} finally {
			setRegLoading(false);
		}
	}

	return (
		<>
			<PageHeader subtitle="Mark your calendar — from Islamic lectures and Jihad Week to community outreaches and fun-filled socials.">
				<div className="animate-fade-in">
					Our Events
					<br />
					<Tabs value={mode} onValueChange={(v) => setMode(v as "upcoming" | "past")} className="mt-4">
						<TabsList className="grid w-full grid-cols-2 mx-auto max-w-xs rounded-lg bg-primary-50/50 p-0.5 backdrop-blur-sm sm:p-1">
							<TabsTrigger value="upcoming" className="min-h-[44px] text-xs whitespace-nowrap sm:text-sm">
								Upcoming
							</TabsTrigger>
							<TabsTrigger value="past" className="min-h-[44px] text-xs whitespace-nowrap sm:text-sm">
								Last 12 Months
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</PageHeader>

			<Seo
				title="Our Events"
				description="Muslim Students' Society of Nigeria at Obafemi Awolowo University (OAU) is a vibrant student organization dedicated to promoting Islamic values and fostering a sense of community among Muslim students on campus."
				path="/events"
				images={[
					{
						url: rawEvents?.[0]?.imageUrl || "/images/bg-1.webp",
						width: 1200,
						height: 630,
						alt: "MSSNOAU Events",
					},
				]}
				schema={jsonLd}
			/>

			<div className="py-12 relative overflow-hidden">
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
				<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>

				<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="mb-10 md:mb-16 space-y-4">
						<h2 className="mb-4 text-center text-2xl font-bold text-primary-800 md:mb-6 lg:text-3xl font-primary">
							{mode === "upcoming" ? "Upcoming Events" : "Past Events"}
						</h2>

						<p className="mx-auto max-w-screen-md text-center text-neutral-600 md:text-lg font-secondary">
							{mode === "upcoming"
								? "Join us for our upcoming programmes and activities. We look forward to seeing you!"
								: "A look back at some of our memorable events from the past year."}
						</p>

						{mode === "upcoming" ? (
							<p className="mx-auto max-w-screen-md text-center text-sm text-primary-700">
								All events are free to attend. Register directly on the event page!
							</p>
						) : null}

						<div className="mt-8 max-w-2xl mx-auto">
							<div className="flex flex-col sm:flex-row gap-4">
								<form
									className="relative flex-grow"
									onSubmit={(e) => e.preventDefault()}
								>
									<input
										type="text"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Search events..."
										className="w-full py-2 pl-4 pr-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
									/>
									<button
										type="submit"
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-700"
									>
										<Search className="size-5" />
									</button>
								</form>

								<div className="relative" ref={filterButtonRef}>
									<Button
										variant="outline"
										className="flex items-center gap-2 w-full sm:w-auto"
										onClick={() => setShowFilters(!showFilters)}
									>
										<Filter className="size-4" />
										Filter
									</Button>

									{showFilters ? (
										<div
											ref={filterPanelRef}
											className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-10 animate-fade-in"
										>
											<h3 className="font-medium text-gray-900 mb-2">Categories</h3>
											<div className="space-y-2">
												{categories.map((category) => (
													<label key={category} className="flex items-center gap-2 cursor-pointer">
														<input
															type="radio"
															name="category"
															value={category}
															checked={selectedCategory === category}
															onChange={() => setSelectedCategory(category)}
															className="text-primary-600 focus:ring-primary-500"
														/>
														<span className="text-sm text-gray-700 capitalize">{category}</span>
													</label>
												))}
											</div>

											<div className="mt-4 flex justify-end">
												<Button variant="ghost" size="sm" onClick={resetFilters}>
													Reset
												</Button>
											</div>
										</div>
									) : null}
								</div>
							</div>

							{searchQuery || selectedCategory !== "all" ? (
								<div className="mt-4 flex items-center justify-between">
									<p className="text-sm text-gray-600">
										Showing {filteredEvents.length} of {events.length} events
									</p>
									<Button variant="ghost" size="sm" onClick={resetFilters} className="text-sm">
										Clear Filters
									</Button>
								</div>
							) : null}
						</div>
					</div>

					{filteredEvents.length > 0 ? (
						<div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
							{filteredEvents.map((event) => {
								const eventDateDetails = formatDate(event.date);
								const dateParts = [
									eventDateDetails?.weekday,
									eventDateDetails?.month &&
									eventDateDetails?.day &&
									eventDateDetails?.daySuffix
										? `${eventDateDetails.month} ${eventDateDetails.day}${eventDateDetails.daySuffix}`
										: null,
								];
								return (
									<div
										key={event.title + event.date}
										className="group flex flex-col overflow-hidden rounded-xl border bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300"
									>
										<button
											type="button"
											onClick={() => openEventDetails(event)}
											className="group relative block h-48 overflow-hidden bg-neutral-100 md:h-64 focus:outline-none"
										>
											<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
											<img
												src={
													event.image ||
													"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='sans-serif' font-size='18'%3ENo Image%3C/text%3E%3C/svg%3E"
												}
												loading="lazy"
												alt={`Flyer for ${event.title}`}
												className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-110"
											/>

											{mode === "upcoming" && !isPastDate(event.date) ? (
												<div className="absolute top-3 right-3 z-20">
													<span className="rounded-full bg-primary-700/90 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold tracking-wider text-white shadow-sm">
														{eventDateDetails?.month && eventDateDetails?.day
															? `${eventDateDetails.month} ${eventDateDetails.day}`
															: event.date}
													</span>
												</div>
											) : null}

											{event.category ? (
												<div className="absolute bottom-3 left-3 z-20">
													<span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-primary-800 shadow-sm">
														{event.category}
													</span>
												</div>
											) : null}
										</button>

										<div className="flex flex-1 flex-col p-4 sm:p-6 relative z-10">
											<h3 className="mb-2 text-lg font-semibold text-primary-800 font-secondary">
												<button
													type="button"
													onClick={() => openEventDetails(event)}
													className="transition duration-100 hover:text-primary-700 active:text-primary-800 text-left"
												>
													{event.title}
												</button>
											</h3>

											<p className="mb-4 text-neutral-600 font-tertiary text-sm leading-relaxed line-clamp-3">
												{event.summary || "More details coming soon."}
											</p>

											<div className="mt-auto flex items-end justify-between">
												<div className="flex items-center gap-2">
													<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
														<CalendarDays className="h-5 w-5" />
													</div>
													<div>
														<div className="text-xs font-semibold text-primary-700">
															{dateParts.filter(Boolean).join(", ") || "Date not available"}
														</div>
														<p className="text-xs text-neutral-600">
															{eventDateDetails?.year && eventDateDetails?.time
																? `${eventDateDetails.year} at ${eventDateDetails.time}`
																: eventDateDetails?.year ||
																	eventDateDetails?.time ||
																	"Time not available"}
														</p>
													</div>
												</div>

												<span className="rounded-full border border-green-500 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
													Free
												</span>
											</div>

											<div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
												<button
													type="button"
													onClick={() => openEventDetails(event)}
													className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-700 text-white hover:bg-primary-800 transition-colors"
												>
													View Details
													<ChevronRight className="size-4" />
												</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="text-center py-12 px-4">
							<div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-8 shadow-sm w-full max-w-md text-center mx-auto">
								<div className="mb-6 bg-primary-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
									<Info className="size-10 text-primary-400" />
								</div>
								<h3 className="text-xl font-medium text-primary-800 mb-3">No Events Found</h3>
								<p className="text-gray-600 mb-6">
									{searchQuery || selectedCategory !== "all"
										? "No events match your current search or filter criteria. Try adjusting your filters or search terms."
										: `There are currently no ${mode} events scheduled or listed. Please check back later or contact us for more information.`}
								</p>

								{searchQuery || selectedCategory !== "all" ? (
									<Button variant="outline" onClick={resetFilters} className="mt-2">
										Clear Filters
									</Button>
								) : null}
							</div>
						</div>
					)}
				</div>
			</div>

			{currentEvent ? (
				<ResponsiveModal
					open={open}
					onOpenChange={(val) => {
						if (!val) closeEventDetails();
					}}
					title={currentEvent.title}
					description={currentEvent.host ? `Hosted by: ${currentEvent.host}` : undefined}
					contentClass="max-h-[90dvh]"
					side="bottom"
					footer={
						<div className="space-y-2 w-full">
							{currentEvent.url ? (
								<Button asChild className="w-full bg-primary-700 hover:bg-primary-800">
									<a href={currentEvent.url} target="_blank" rel="noopener noreferrer">
										Register / View Details <ExternalLink className="ml-2 h-4 w-4" />
									</a>
								</Button>
							) : null}

							{currentEvent.image ? (
								<Button asChild variant="outline" className="w-full">
									<a href={currentEvent.image} target="_blank" rel="noopener noreferrer">
										View / Download Flyer <ExternalLink className="ml-2 h-4 w-4" />
									</a>
								</Button>
							) : null}

							{!currentEvent.url ? (
								<Button onClick={closeEventDetails} variant="outline" className="w-full">
									Close
								</Button>
							) : null}
						</div>
					}
				>
					<EventDetails
						currentEvent={currentEvent}
						regName={regName}
						setRegName={setRegName}
						regEmail={regEmail}
						setRegEmail={setRegEmail}
						regPhone={regPhone}
						setRegPhone={setRegPhone}
						regLoading={regLoading}
						regSuccess={regSuccess}
						regError={regError}
						submitRegistration={submitRegistration}
					/>
				</ResponsiveModal>
			) : null}
		</>
	);
}

function EventDetails({
	currentEvent,
	regName,
	setRegName,
	regEmail,
	setRegEmail,
	regPhone,
	setRegPhone,
	regLoading,
	regSuccess,
	regError,
	submitRegistration,
}: {
	currentEvent: Event;
	regName: string;
	setRegName: (v: string) => void;
	regEmail: string;
	setRegEmail: (v: string) => void;
	regPhone: string;
	setRegPhone: (v: string) => void;
	regLoading: boolean;
	regSuccess: any | null;
	regError: string;
	submitRegistration: (id?: string) => void;
}) {
	const eventDateDetailsModal = formatDate(currentEvent.date);

	return (
		<>
			{currentEvent.image ? (
				<div className="relative rounded-lg overflow-hidden mb-4 border border-gray-100 shadow-sm">
					<img
						src={
							currentEvent.image ||
							"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect fill='%23f3f4f6' width='800' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='sans-serif' font-size='24'%3ENo Image Available%3C/text%3E%3C/svg%3E"
						}
						alt={`Flyer for ${currentEvent.title}`}
						className="w-full object-cover aspect-[16/9]"
					/>

					{currentEvent.category ? (
						<div className="absolute top-3 right-3">
							<span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-primary-800 shadow-sm">
								{currentEvent.category}
							</span>
						</div>
					) : null}
				</div>
			) : null}

			<div className="bg-primary-50/50 backdrop-blur-sm rounded-lg p-4 mb-4">
				<p
					className="text-sm text-gray-700 leading-relaxed"
					dangerouslySetInnerHTML={{
						__html: currentEvent.summary || "Detailed information will be available soon.",
					}}
				/>
			</div>

			{currentEvent.additional_details ? (
				<div
					className="prose prose-sm max-w-none text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 mb-4 [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2"
					dangerouslySetInnerHTML={{ __html: currentEvent.additional_details }}
				/>
			) : null}

			<div className="space-y-3 text-sm mt-5 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
				<div className="flex items-start">
					<CalendarDays className="h-4 w-4 text-primary-600 mr-3 mt-0.5 shrink-0" />
					<span className="text-gray-700">
						{eventDateDetailsModal?.fullDate || ""} at {eventDateDetailsModal?.time || ""}
					</span>
				</div>

				<div className="flex items-start">
					<MapPin className="h-4 w-4 text-primary-600 mr-3 mt-0.5 shrink-0" />
					<span className="text-gray-700">{currentEvent.venue}</span>
				</div>

				<div className="flex items-start">
					<Ticket className="h-4 w-4 text-primary-600 mr-3 mt-0.5 shrink-0" />
					<span className="text-gray-700">Free Admission</span>
				</div>

				{currentEvent.contact ? (
					<div className="flex items-start">
						<UserCircle className="h-4 w-4 text-primary-600 mr-3 mt-0.5 shrink-0" />
						<span className="text-gray-700">Contact: {currentEvent.contact}</span>
					</div>
				) : null}

				{currentEvent.capacity ? (
					<div className="flex items-start">
						<Users className="h-4 w-4 text-primary-600 mr-3 mt-0.5 shrink-0" />
						<span className="text-gray-700">Capacity: {currentEvent.capacity} attendees</span>
					</div>
				) : null}

				{currentEvent.tags && currentEvent.tags.length > 0 ? (
					<div className="flex items-start">
						<Tag className="h-4 w-4 text-primary-600 mr-3 mt-0.5 shrink-0" />
						<div className="flex flex-wrap gap-2">
							{currentEvent.tags.map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700"
								>
									{tag}
								</span>
							))}
						</div>
					</div>
				) : null}
			</div>

			{!isPastDate(currentEvent.date) ? (
				<div className="mt-5 rounded-xl border border-primary-100 bg-gradient-to-b from-primary-50/80 to-white p-4 shadow-sm">
					<div className="flex items-center justify-between mb-3">
						<h4 className="font-bold text-primary-900 text-sm flex items-center gap-2">
							<Ticket className="h-4 w-4 text-primary-600" />
							Event Registration
						</h4>
						<span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
							Free Event
						</span>
					</div>

					{regSuccess ? (
						<div className="rounded-lg bg-green-50 p-4 border border-green-200 text-green-900 space-y-2">
							<div className="flex items-center gap-2 font-bold text-sm text-green-800">
								<span>✓ {regSuccess.message}</span>
							</div>
							<p className="text-xs">
								Your Ticket Code:{" "}
								<code className="bg-green-100 px-2 py-0.5 rounded font-mono font-bold text-green-900">
									{regSuccess.ticket?.ticketCode ?? ""}
								</code>
							</p>
							<p className="text-[11px] text-gray-500">
								Screenshot or save your ticket code — you will need it for check-in at the venue.
							</p>
						</div>
					) : (
						<>
							{regError ? (
								<div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
									{regError}
								</div>
							) : null}
							<div className="space-y-3">
								<div>
									<label className="block text-xs font-semibold text-gray-700 mb-1">
										Full Name *
									</label>
									<input
										type="text"
										value={regName}
										onChange={(e) => setRegName(e.target.value)}
										placeholder="Your full name"
										className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
									/>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
										<input
											type="email"
											value={regEmail}
											onChange={(e) => setRegEmail(e.target.value)}
											placeholder="student@example.com"
											className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
										/>
									</div>
									<div>
										<label className="block text-xs font-semibold text-gray-700 mb-1">
											Phone Number
										</label>
										<input
											type="tel"
											value={regPhone}
											onChange={(e) => setRegPhone(e.target.value)}
											placeholder="08012345678"
											className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
										/>
									</div>
								</div>
								<Button
									onClick={() => submitRegistration(currentEvent.id)}
									disabled={regLoading}
									className="w-full font-bold text-xs py-2.5 rounded-lg shadow-sm text-white bg-primary-700 hover:bg-primary-800"
								>
									{regLoading ? "Registering..." : "Register for Event"}
								</Button>
							</div>
						</>
					)}
				</div>
			) : null}
		</>
	);
}
