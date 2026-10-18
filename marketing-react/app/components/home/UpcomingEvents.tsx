import { Link } from "react-router";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { Image } from "~/components/ui/image";
import slugify from "~/lib/utils/slugify";
import type { Event } from "~/lib/utils/events";

interface UpcomingEventsProps {
	events?: Event[];
}

function formatDisplayDate(dateString?: string) {
	if (!dateString) return "";

	const knownPatterns = [/every/i, /last .* of every month/i, /first .* of every month/i];
	if (knownPatterns.some((pattern) => pattern.test(dateString))) {
		return dateString;
	}

	const dateObj = new Date(dateString);
	if (!isNaN(dateObj.getTime())) {
		return dateObj.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	}
	return dateString;
}

export function UpcomingEvents({ events = [] }: UpcomingEventsProps) {
	if (!events || events.length === 0) return null;

	return (
		<div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto relative overflow-hidden">
			<div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
			<div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl" />

			<div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between mb-10 lg:mb-14 relative z-10">
				<div className="text-center sm:text-left animate-fade-in">
					<h2 className="text-2xl font-bold font-primary md:text-4xl md:leading-tight relative inline-block">
						Upcoming Events
						<span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary-700 rounded-full" />
					</h2>
					<p className="mt-4 text-primary-800 font-secondary">
						More info and registration for some of our upcoming community events.
					</p>
				</div>

				<div className="mt-6 sm:mt-0">
					<Link
						className="py-3 text-nowrap px-4 inline-flex items-center gap-x-1 text-sm font-medium rounded-xl border border-primary-200 bg-white/80 backdrop-blur-sm text-primary-800 shadow-sm hover:bg-primary-50 hover:-translate-y-1 focus:outline-none focus:bg-primary-50 transition-all duration-300"
						to="/events"
					>
						All Events
						<ChevronRight className="shrink-0 size-4" />
					</Link>
				</div>
			</div>

			<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
				{events.map((event) => {
					const href = `/events/${event.slug || slugify(event.title)}`;
					return (
						<Link
							key={event.id || event.title}
							to={href}
							className="group flex flex-col h-full focus:outline-none rounded-xl overflow-hidden backdrop-blur-sm bg-white/30 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-in"
						>
							<div className="relative pt-[50%] sm:pt-[70%] overflow-hidden">
								<Image
									loading="lazy"
									className="size-full absolute top-0 start-0 object-cover transition-transform duration-700 ease-in-out rounded-t-xl group-hover:scale-110"
									src={event.image || "/images/placeholder.webp"}
									alt={event.title}
									width={400}
									height={300}
								/>

								<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

								{event.paid && event.price && event.price.length > 0 ? (
									<span className="font-tertiary absolute top-0 end-0 rounded-bl-xl text-xs font-medium bg-primary-800/90 backdrop-blur-sm text-white py-1.5 px-3 shadow-lg">
										Paid - {event.price}
									</span>
								) : null}
							</div>

							<div className="p-5 flex-grow flex flex-col">
								<h3 className="text-xl font-secondary font-semibold text-gray-800 group-hover:text-primary-700 transition-colors duration-300">
									{event.title}
								</h3>

								<div className="mt-3 space-y-2">
									<div className="flex items-center gap-2">
										<CalendarDays className="shrink-0 size-4 text-primary-700/70" />
										<span className="text-sm text-gray-600">
											{formatDisplayDate(event.date)}
										</span>
									</div>

									{event.venue ? (
										<div className="flex items-center gap-2">
											<MapPin className="shrink-0 size-4 text-primary-700/70" />
											<span className="text-sm text-gray-600">{event.venue}</span>
										</div>
									) : null}
								</div>

								<p className="mt-3 font-tertiary text-gray-600 line-clamp-2 text-ellipsis">
									{event.summary}
								</p>

								<div className="mt-auto pt-4">
									<span className="inline-flex items-center gap-x-1 text-sm text-primary-700 font-medium font-secondary group-hover:text-primary-800 transition-colors duration-300">
										<span className="relative">
											More Info
											<span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
										</span>
										<ChevronRight className="shrink-0 size-4 transition-transform duration-300 group-hover:translate-x-1" />
									</span>
								</div>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
