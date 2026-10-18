import { Link } from "react-router";
import { Calendar, Newspaper, ArrowRight } from "lucide-react";

export interface LatestNewsItem {
	id: string | number;
	title: string;
	summary?: string;
	image?: string;
	category?: string;
	author?: string;
	date?: string;
}

interface LatestNewsSectionProps {
	items?: LatestNewsItem[];
}

function formatDate(dateStr?: string) {
	if (!dateStr) return "";
	return new Date(dateStr).toLocaleDateString("en-NG", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

export function LatestNewsSection({ items = [] }: LatestNewsSectionProps) {
	return (
		<section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-white via-green-50/30 to-white">
			<div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
				<div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-3xl" />
				<div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-green-700/5 rounded-full blur-3xl" />
			</div>

			<div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="text-center mb-12 animate-fade-in">
					<div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
						<Newspaper className="w-4 h-4" />
						Latest Updates
					</div>
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-secondary mb-4">
						Latest <span className="text-green-700">News</span>
					</h2>
					<p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg font-tertiary leading-relaxed">
						Official announcements, event reports, and updates from MSSN OAU.
					</p>
				</div>

				{items.length > 0 ? (
					<>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
							{items.map((item) => (
								<Link
									key={item.id}
									to={`/latest-news/${item.id}`}
									className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col animate-fade-in"
								>
									{item.image ? (
										<div className="relative h-48 overflow-hidden">
											<img
												src={item.image}
												alt={item.title}
												loading="lazy"
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
											{item.category ? (
												<span className="absolute top-3 left-3 px-3 py-1 bg-green-700 text-white text-[11px] font-semibold rounded-full">
													{item.category}
												</span>
											) : null}
										</div>
									) : null}

									<div className="p-5 flex flex-col flex-1">
										<div className="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
											<Calendar className="w-3 h-3" />
											<span>{formatDate(item.date)}</span>
											{item.author ? (
												<>
													<span>•</span>
													<span>{item.author}</span>
												</>
											) : null}
										</div>

										<h3 className="text-base font-bold text-gray-900 group-hover:text-green-700 transition-colors leading-snug mb-2 line-clamp-2">
											{item.title}
										</h3>

										<p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
											{item.summary}
										</p>

										<span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-green-700 group-hover:text-green-800">
											Read More
											<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
										</span>
									</div>
								</Link>
							))}
						</div>

						<div className="text-center mt-10">
							<Link
								to="/latest-news"
								className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-700 hover:bg-green-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
							>
								View All News <ArrowRight className="w-4 h-4" />
							</Link>
						</div>
					</>
				) : (
					<div className="text-center py-12">
						<p className="text-gray-400 text-sm">No news items yet. Check back later.</p>
					</div>
				)}
			</div>
		</section>
	);
}
