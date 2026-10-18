import { useState } from "react";
import { Link, useParams, useRouteLoaderData } from "react-router";
import { toast } from "sonner";
import {
	ArrowLeft,
	Calendar,
	Clock,
	MapPin,
	Users,
	ChevronRight,
	Ticket,
	User,
	Phone,
	AlertCircle,
} from "lucide-react";
import { Seo } from "~/components/seo";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { API_BASE } from "~/lib/api/base";
import { mapEventDetail, type ApiEvent, type Event } from "~/lib/utils/events";
import slugify from "~/lib/utils/slugify";
import type { loader as rootLoader } from "~/root";

function formatEventDate(dateString: string) {
	const date = new Date(dateString);
	const time = date.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
	const full = `${date.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	})} ${time}`;
	return { full, time, relative: relativeTime(date) };
}

function relativeTime(date: Date): string {
	const diffMs = date.getTime() - Date.now();
	const abs = Math.abs(diffMs);
	const future = diffMs >= 0;
	const wrap = (value: string) => (future ? `in ${value}` : `${value} ago`);
	const mins = abs / 60000;
	const hours = abs / 3600000;
	const days = abs / 86400000;

	if (abs < 45000) return "less than a minute";
	if (abs < 90000) return wrap("1 minute");
	if (mins < 45) return wrap(`${Math.round(mins)} minutes`);
	if (mins < 90) return wrap("about 1 hour");
	if (hours < 22) return wrap(`about ${Math.round(hours)} hours`);
	if (hours < 36) return wrap("1 day");
	if (days < 25) return wrap(`${Math.round(days)} days`);
	if (days < 45) return wrap("about 1 month");
	if (days < 345) return wrap(`${Math.round(days / 30)} months`);
	return wrap(`${Math.round(days / 365)} years`);
}

function NotFound() {
	return (
		<section className="py-12 relative overflow-hidden min-h-[80vh]">
			<div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
			<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<Link
					to="/events"
					className="inline-flex items-center gap-2 text-sm text-primary-700 hover:text-primary-900 transition-colors mb-8"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to all events
				</Link>
				<div className="animate-fade-in">
					<div className="flex flex-col items-center justify-center py-12">
						<div className="bg-white/80 backdrop-blur-sm rounded-xl border border-primary-100 shadow p-8 text-center max-w-md w-full mx-auto">
							<div className="mb-6 bg-red-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto">
								<AlertCircle className="size-10 text-red-500" />
							</div>
							<h3 className="text-xl font-medium text-primary-800 mb-3">Event Not Found</h3>
							<p className="text-gray-600 mb-6">
								We couldn&apos;t find the event you&apos;re looking for. It may have been
								removed or the URL might be incorrect.
							</p>
							<Button asChild variant="outline">
								<Link to="/events">Browse All Events</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default function EventDetailPage() {
	const { slug } = useParams();
	const root = useRouteLoaderData<typeof rootLoader>("root");
	const rawEvents = (root?.site?.events ?? []) as ApiEvent[];
	const events = rawEvents.map(mapEventDetail);
	const eventData: Event | null =
		events.find((e) => e.id === slug || e.slug === slug || slugify(e.title) === slug) ?? null;

	const [regName, setRegName] = useState("");
	const [regEmail, setRegEmail] = useState("");
	const [regPhone, setRegPhone] = useState("");
	const [regLoading, setRegLoading] = useState(false);
	const [regSuccess, setRegSuccess] = useState<any | null>(null);
	const [regError, setRegError] = useState("");

	async function submitRegistration() {
		if (!eventData) return;
		if (!regName.trim() || !regEmail.trim()) {
			setRegError("Please enter your Name and Email.");
			return;
		}

		setRegLoading(true);
		setRegError("");
		setRegSuccess(null);
		try {
			const res = await fetch(`${API_BASE}/public/events/${eventData.id}/register`, {
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
				toast.success("Registration completed successfully!");
				setRegName("");
				setRegEmail("");
				setRegPhone("");
			} else {
				setRegError(json.error || "Registration failed");
			}
		} catch {
			setRegError("Unable to connect to registration server.");
		} finally {
			setRegLoading(false);
		}
	}

	if (!eventData) return <NotFound />;

	const formattedEventDate = eventData.date ? formatEventDate(eventData.date) : null;
	const formattedEndDate = eventData.endDate ? formatEventDate(eventData.endDate) : null;

	const isEventPast = (() => {
		if (!eventData.endDate && !eventData.date) return true;
		return new Date(eventData.endDate || eventData.date) < new Date();
	})();

	const status = (() => {
		const endDate = new Date(eventData.endDate || eventData.date);
		const startDate = new Date(eventData.date);
		if (endDate < new Date())
			return { label: "Past Event", className: "", variant: "destructive" as const, Icon: Calendar };
		const daysUntil = Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
		if (daysUntil <= 3 && daysUntil >= 0)
			return {
				label: "Coming Soon",
				className: "bg-amber-100 text-amber-800 border-amber-200",
				variant: "outline" as const,
				Icon: Clock,
			};
		return { label: "Upcoming", className: "", variant: "default" as const, Icon: Calendar };
	})();

	return (
		<>
			<Seo
				title={eventData.title}
				description={eventData.summary}
				path={`/events/${eventData.slug || slug}`}
				type="event"
				images={
					eventData.image
						? [{ url: eventData.image, width: 1200, height: 630, alt: eventData.title }]
						: []
				}
			/>

			<section className="py-12 relative overflow-hidden min-h-[80vh]">
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
				<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl"></div>

				<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<Link
						to="/events"
						className="inline-flex items-center gap-2 text-sm text-primary-700 hover:text-primary-900 transition-colors mb-8"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to all events
					</Link>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2 space-y-8">
							<div className="space-y-4 animate-fade-in">
								<div className="flex flex-wrap items-center gap-3">
									<Badge
										variant={status.variant}
										className={`flex items-center gap-1.5 ${status.className}`}
									>
										<status.Icon className="h-3.5 w-3.5" />
										{status.label}
									</Badge>
								</div>
								<h1 className="text-3xl md:text-4xl font-bold text-primary-800 font-primary">
									{eventData.title}
								</h1>
								<p className="text-gray-700 font-tertiary leading-relaxed">{eventData.summary}</p>
							</div>

							<div className="rounded-xl overflow-hidden border border-primary-100 shadow-sm">
								<img
									src={
										eventData.image ||
										"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect fill='%23f3f4f6' width='800' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='sans-serif' font-size='24'%3ENo Image Available%3C/text%3E%3C/svg%3E"
									}
									alt={eventData.title}
									className="w-full h-auto object-cover aspect-video"
								/>
							</div>

							<div className="space-y-6">
								<h2 className="text-2xl font-semibold text-primary-800 font-primary relative inline-block">
									About This Event
									<span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-primary-600/70 rounded-full"></span>
								</h2>
								{eventData.additional_details ? (
									<div className="bg-white/40 backdrop-blur-sm rounded-xl border border-primary-100/50 p-6 shadow-sm">
										<p className="text-gray-700 whitespace-pre-line">
											{eventData.additional_details}
										</p>
									</div>
								) : null}
								{eventData.tags && eventData.tags.length > 0 ? (
									<div className="space-y-2">
										<h3 className="text-lg font-semibold text-primary-800 font-secondary">
											Topics
										</h3>
										<div className="flex flex-wrap gap-2">
											{eventData.tags.map((tag) => (
												<Badge
													key={tag}
													variant="outline"
													className="bg-white/80 backdrop-blur-sm capitalize"
												>
													{tag}
												</Badge>
											))}
										</div>
									</div>
								) : null}
							</div>

							<div className="mt-12 pt-8 border-t border-gray-200">
								<div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-primary-50/50 backdrop-blur-sm rounded-xl p-6 border border-primary-100">
									<div>
										<h3 className="text-lg font-semibold text-primary-800">
											Discover More Events
										</h3>
										<p className="text-primary-700">
											Check out our upcoming events and activities
										</p>
									</div>
									<Button
										asChild
										className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white"
									>
										<Link to="/events">
											See All Events
											<ChevronRight className="h-4 w-4" />
										</Link>
									</Button>
								</div>
							</div>
						</div>

						<div className="lg:col-span-1">
							<div className="sticky top-24 space-y-6">
								<div className="bg-white/60 backdrop-blur-sm rounded-xl border border-primary-100 shadow-lg overflow-hidden">
									<div className="bg-primary-700 p-6 text-white">
										<h2 className="text-xl font-semibold font-secondary">Event Details</h2>
									</div>
									<div className="p-6 space-y-6">
										{formattedEventDate ? (
											<div className="flex items-start gap-3">
												<Calendar className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
												<div>
													<h3 className="text-sm font-medium text-gray-900">
														Date &amp; Time
													</h3>
													<p className="text-gray-700">
														<span className="font-semibold">Start:</span>{" "}
														{formattedEventDate.full}
													</p>
													<p className="text-sm text-gray-500 mt-0.5">
														{formattedEventDate.relative}
													</p>
													{formattedEndDate ? (
														<>
															<p className="text-gray-700 mt-1">
																<span className="font-semibold">End:</span>{" "}
																{formattedEndDate.full}
															</p>
															<p className="text-sm text-gray-500 mt-0.5">
																{formattedEndDate.relative}
															</p>
														</>
													) : null}
												</div>
											</div>
										) : null}

										<div className="flex items-start gap-3">
											<MapPin className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
											<div>
												<h3 className="text-sm font-medium text-gray-900">Location</h3>
												<p className="text-gray-700">{eventData.venue}</p>
											</div>
										</div>

										{eventData.host ? (
											<div className="flex items-start gap-3">
												<User className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
												<div>
													<h3 className="text-sm font-medium text-gray-900">Organizer</h3>
													<p className="text-gray-700">{eventData.host}</p>
												</div>
											</div>
										) : null}

										{eventData.contact ? (
											<div className="flex items-start gap-3">
												<Phone className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
												<div>
													<h3 className="text-sm font-medium text-gray-900">Contact</h3>
													<p className="text-gray-700 break-words">{eventData.contact}</p>
												</div>
											</div>
										) : null}

										{eventData.capacity ? (
											<div className="flex items-start gap-3">
												<Users className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
												<div>
													<h3 className="text-sm font-medium text-gray-900">Capacity</h3>
													<p className="text-gray-700">{eventData.capacity} attendees</p>
												</div>
											</div>
										) : null}

										{!isEventPast ? (
											regSuccess ? (
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
														Screenshot or save your ticket code — you will need it for
														check-in at the venue.
													</p>
												</div>
											) : (
												<div className="mt-4 rounded-xl border border-primary-100 bg-gradient-to-b from-primary-50/80 to-white p-4 shadow-sm">
													<div className="flex items-center justify-between mb-3">
														<h4 className="font-bold text-primary-900 text-sm flex items-center gap-2">
															<Ticket className="h-4 w-4 text-primary-600" />
															Register
														</h4>
														<span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
															Free
														</span>
													</div>
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
																<label className="block text-xs font-semibold text-gray-700 mb-1">
																	Email
																</label>
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
															onClick={submitRegistration}
															disabled={regLoading}
															className="w-full font-bold text-xs py-2.5 rounded-lg shadow-sm text-white bg-primary-700 hover:bg-primary-800"
														>
															{regLoading ? "Registering..." : "Register for Event"}
														</Button>
													</div>
												</div>
											)
										) : null}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
