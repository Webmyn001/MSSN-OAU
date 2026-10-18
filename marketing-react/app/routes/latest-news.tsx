import { Link, useRouteLoaderData } from "react-router";
import { Seo } from "~/components/seo";
import { PageHeader } from "~/components/layout/PageHeader";
import { Image } from "~/components/ui/image";
import { Calendar, ArrowRight } from "lucide-react";
import type { loader as rootLoader } from "~/root";

interface NewsItem {
	id: string;
	title: string;
	summary?: string;
	content?: string;
	image?: string;
	image2?: string;
	category?: string;
	author?: string;
	date?: string;
}

export function formatNewsDate(dateStr?: string): string {
	if (!dateStr) return "";
	const d = new Date(dateStr);
	return d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

export default function LatestNewsPage() {
	const root = useRouteLoaderData<typeof rootLoader>("root");
	const items = (root?.site?.latestNews ?? []) as NewsItem[];

	return (
		<>
			<Seo
				title="Latest News"
				description="Official announcements, event reports, and updates from MSSN OAU."
				path="/latest-news"
			/>

			<PageHeader subtitle="Stay up to date with announcements, updates and stories from across the MSSN OAU community.">
				Latest News
			</PageHeader>

			<section className="py-12 sm:py-16 relative overflow-hidden">
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-green-700/10 rounded-full blur-3xl" />

				<div className="max-w-6xl mx-auto px-5 sm:px-10 relative z-10">
					{items.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{items.map((item) => (
								<Link
									key={item.id}
									to={`/latest-news/${item.id}`}
									className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col animate-fade-in"
								>
									{item.image ? (
										<div className="relative h-48 overflow-hidden">
											<Image
												src={item.image}
												alt={item.title}
												width={400}
												height={200}
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
											<span>{formatNewsDate(item.date)}</span>
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
											Read More{" "}
											<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
										</span>
									</div>
								</Link>
							))}
						</div>
					) : (
						<div className="text-center py-20">
							<p className="text-gray-400 text-sm">No news items yet. Check back later.</p>
						</div>
					)}
				</div>
			</section>
		</>
	);
}
