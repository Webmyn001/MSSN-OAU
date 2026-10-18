import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Calendar, ChevronRight, ExternalLink, Link as LinkIcon } from "lucide-react";
import { API_BASE } from "~/lib/api/base";

const BLOG_API = `${API_BASE}/public/blog-posts/approved`;

export interface HomeBlogPost {
	id?: string | number;
	title: string;
	excerpt?: string;
	link?: string;
	date?: string;
	featured_image?: string;
	categories?: string[];
}

interface BlogSectionProps {
	posts?: HomeBlogPost[];
}

function formatDate(dateStr?: string) {
	if (!dateStr) return "";
	return new Date(dateStr).toLocaleDateString("en-NG", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

function safeParse(json: any): string[] {
	try {
		return json ? JSON.parse(json) : [];
	} catch {
		return [];
	}
}

export function BlogSection({ posts: initialPosts = [] }: BlogSectionProps) {
	const [posts, setPosts] = useState<HomeBlogPost[]>(initialPosts);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let active = true;
		if (!posts || posts.length === 0) {
			setLoading(true);
			(async () => {
				try {
					const res = await fetch(BLOG_API, { signal: AbortSignal.timeout(10000) });
					if (res.ok) {
						const json = await res.json();
						if (active && json?.success && Array.isArray(json.data?.posts)) {
							setPosts(
								[...json.data.posts]
									.sort(
										(a: any, b: any) =>
											new Date(b.approvedAt || 0).getTime() -
											new Date(a.approvedAt || 0).getTime()
									)
									.slice(0, 3)
									.map((p: any) => ({
										id: p.wpId,
										title: p.title,
										excerpt: p.excerpt,
										link: p.link,
										date: p.wpDate,
										featured_image: p.featuredImage || "",
										categories: safeParse(p.categories),
									}))
							);
						}
					}
				} catch (err) {
					console.error("Error fetching blog posts:", err);
				} finally {
					if (active) setLoading(false);
				}
			})();
		}
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const hasPosts = Array.isArray(posts) && posts.length > 0;

	return (
		<section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-white via-green-50/30 to-white">
			<div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
				<div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-3xl" />
				<div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-green-700/5 rounded-full blur-3xl" />
			</div>

			<div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="text-center mb-12 animate-fade-in">
					<div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
						<LinkIcon className="w-4 h-4" />
						From Our Blog
					</div>
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-secondary mb-4">
						Press <span className="text-green-700">Releases</span>
					</h2>
					<p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg font-tertiary leading-relaxed">
						Official press releases and featured articles from the An-Nuur Press.
					</p>
				</div>

				{loading ? (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
						{[0, 1, 2].map((i) => (
							<div
								key={i}
								className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse"
							>
								<div className="h-48 bg-gray-200" />
								<div className="p-5 space-y-3">
									<div className="h-3 bg-gray-200 rounded w-1/3" />
									<div className="h-5 bg-gray-200 rounded" />
									<div className="h-4 bg-gray-200 rounded w-3/4" />
								</div>
							</div>
						))}
					</div>
				) : hasPosts ? (
					<>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
							{posts.slice(0, 3).map((post) => (
								<a
									key={post.id || post.title}
									href={post.link}
									target="_blank"
									rel="noopener noreferrer"
									className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col animate-fade-in"
								>
									{post.featured_image ? (
										<div className="relative h-48 overflow-hidden">
											<img
												src={post.featured_image}
												alt={post.title}
												loading="lazy"
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
											<span className="absolute top-3 right-3 px-3 py-1 bg-green-700 text-white text-[11px] font-semibold rounded-full flex items-center gap-1">
												<ExternalLink className="w-3 h-3" /> Read Article
											</span>
										</div>
									) : null}

									<div className="p-5 flex flex-col flex-1">
										<div className="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
											<Calendar className="w-3 h-3" />
											<span>{formatDate(post.date)}</span>
										</div>

										<h3 className="text-base font-bold text-gray-900 group-hover:text-green-700 transition-colors leading-snug mb-2 line-clamp-2">
											{post.title}
										</h3>

										<p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
											{post.excerpt?.replace(/<[^>]+>/g, "")}
										</p>
									</div>
								</a>
							))}
						</div>

						<div className="mt-12 text-center">
							<Link
								to="/blog"
								className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white rounded-xl font-medium text-sm hover:bg-green-800 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
							>
								View All Press Releases
								<ChevronRight className="w-4 h-4" />
							</Link>
						</div>
					</>
				) : null}
			</div>
		</section>
	);
}
