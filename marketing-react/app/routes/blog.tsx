import { useState, type FormEvent } from "react";
import { useRouteLoaderData } from "react-router";
import { toast } from "sonner";
import { Calendar, Mail, Send, ExternalLink, Search, ChevronDown } from "lucide-react";
import { Seo } from "~/components/seo";
import { PageHeader } from "~/components/layout/PageHeader";
import { Image } from "~/components/ui/image";
import { formatDate } from "~/lib/utils/dates";
import { API_BASE } from "~/lib/api/base";
import type { loader as rootLoader } from "~/root";

interface BlogPost {
	id: number;
	title: string;
	excerpt: string;
	content: string;
	link: string;
	slug: string;
	date: string;
	modified: string;
	featured_image: string;
	categories: string[];
	tags: string[];
}

function safeParse(json: any): any[] {
	try {
		return json ? JSON.parse(json) : [];
	} catch {
		return [];
	}
}

export default function BlogPage() {
	const root = useRouteLoaderData<typeof rootLoader>("root");
	const rawPosts = (root?.site?.posts ?? []) as any[];

	const posts: BlogPost[] = rawPosts.map((p) => ({
		id: p.wpId,
		title: p.title,
		excerpt: p.excerpt,
		content: p.content,
		link: p.link,
		slug: p.slug,
		date: p.wpDate,
		modified: p.wpModified,
		featured_image: p.featuredImage || "",
		categories: safeParse(p.categories),
		tags: safeParse(p.tags),
	}));

	const [email, setEmail] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

	const allCategories = ["All", ...Array.from(new Set(posts.flatMap((p) => p.categories))).sort()];

	const filteredPosts = posts.filter((p) => {
		if (selectedCategory !== "All" && !p.categories?.includes(selectedCategory)) return false;
		if (searchQuery.trim()) {
			const q = searchQuery.trim().toLowerCase();
			return (
				p.title.toLowerCase().includes(q) ||
				p.excerpt.toLowerCase().includes(q) ||
				(p.categories || []).some((c) => c.toLowerCase().includes(q))
			);
		}
		return true;
	});

	const jsonLd = [
		{
			"@type": "WebPage",
			name: "Our Blog | MSSNOAU",
			description: "Welcome to the Muslim Students Society of Nigeria, Great Ifẹ̀ (OAU) Branch.",
			publisher: { "@type": "Organization", name: "MSSNOAU" },
		},
		...posts.map((post) => ({
			"@type": "Article",
			mainEntityOfPage: { "@type": "WebPage", "@id": post.link },
			headline: post.title,
			image: [post.featured_image],
			datePublished: post.date,
			dateModified: post.date,
			author: { "@type": "Organization", name: "MSSN OAU" },
			publisher: {
				"@type": "Organization",
				name: "MSSNOAU",
				logo: { "@type": "ImageObject", url: "https://mssnoau.sirv.com/mssn-logo.png" },
			},
		})),
	];

	return (
		<>
			<Seo
				title="Blog"
				description="Welcome to the Muslim Students Society of Nigeria, Great Ifẹ̀ (OAU) Branch. Discover our programs, events, and resources designed to support Muslim students at Obafemi Awolowo University."
				path="/blog"
				type="WebPage"
				images={[
					{ url: "https://i.ibb.co/zbWfh5B/home.webp", width: 1200, height: 640, alt: "MSSNOAU Blog" },
				]}
				schema={jsonLd}
				keywords={[
					"mssnoau blog",
					"an-nuur press",
					"islamic articles",
					"muslim students oau blog",
					"oau mssn articles",
				]}
			/>

			<PageHeader>
				Our Blog
				<p className="text-neutral-100 text-center font-tertiary sm:text-sm text-xs mt-4">
					Reflective, immersive write-ups, curated by the{" "}
					<a href="https://annuurpress.org.ng/" className="semibold underline">
						An-Nuur Press
					</a>
				</p>
			</PageHeader>

			<section className="py-12 relative overflow-hidden">
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl" />

				<div className="max-w-6xl mx-auto px-5 sm:px-10 relative z-10 space-y-8">
					<BlogFilters
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						selectedCategory={selectedCategory}
						setSelectedCategory={setSelectedCategory}
						showCategoryDropdown={showCategoryDropdown}
						setShowCategoryDropdown={setShowCategoryDropdown}
						categories={allCategories}
					/>

					{filteredPosts.length > 0 ? (
						<div className="grid sm:grid-cols-2 gap-6">
							{filteredPosts.map((post) => (
								<a
									key={post.id}
									href={post.link}
									className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col animate-fade-in"
								>
									<div className="relative h-48 overflow-hidden">
										<Image
											src={post.featured_image}
											alt={post.title}
											width={400}
											height={200}
											loading="lazy"
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
										{post.categories[0] ? (
											<span className="absolute top-3 left-3 px-3 py-1 bg-primary-700 text-white text-[11px] font-semibold rounded-full">
												{post.categories[0]}
											</span>
										) : null}
									</div>

									<div className="p-5 flex flex-col flex-1">
										<div className="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
											<Calendar className="w-3 h-3" />
											<span>{formatDate(post.date).fullDate}</span>
										</div>

										<h3
											className="text-base font-bold text-gray-900 group-hover:text-primary-700 transition-colors leading-snug mb-2 line-clamp-2"
											dangerouslySetInnerHTML={{ __html: post.title }}
										/>

										<div
											className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1"
											dangerouslySetInnerHTML={{ __html: post.excerpt }}
										/>

										<span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-700 group-hover:text-primary-800">
											Read on An-Nuur Press <ExternalLink className="w-3.5 h-3.5" />
										</span>
									</div>
								</a>
							))}
						</div>
					) : (
						<div className="bg-white/80 backdrop-blur-sm rounded-xl border border-primary-100 p-8 shadow-md max-w-lg mx-auto text-center">
							<h3 className="text-xl font-medium text-gray-800 mb-2">No Blog Posts Available</h3>
							<p className="text-gray-500 mb-6">
								We're currently refreshing our content. Please check back soon for new articles and
								updates.
							</p>
							<a
								href="https://annuurpress.org.ng"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-700 text-white hover:bg-primary-800 transition-colors"
							>
								<span>Visit An-Nuur Press</span>
								<ExternalLink className="size-4" />
							</a>
						</div>
					)}

					<NewsletterInline email={email} setEmail={setEmail} />
				</div>
			</section>
		</>
	);
}

function BlogFilters({
	searchQuery,
	setSearchQuery,
	selectedCategory,
	setSelectedCategory,
	showCategoryDropdown,
	setShowCategoryDropdown,
	categories,
}: {
	searchQuery: string;
	setSearchQuery: (v: string) => void;
	selectedCategory: string;
	setSelectedCategory: (v: string) => void;
	showCategoryDropdown: boolean;
	setShowCategoryDropdown: (v: boolean) => void;
	categories: string[];
}) {
	return (
		<>
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
					<input
						type="search"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search articles..."
						className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-primary-500 text-sm"
					/>
				</div>

				<div className="relative">
					<button
						type="button"
						onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
						className="w-full sm:w-auto px-4 py-3 rounded-lg border border-gray-200 text-sm flex items-center justify-between sm:justify-start gap-2 hover:bg-gray-50"
					>
						{selectedCategory}
						<ChevronDown
							className={`w-4 h-4 transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`}
						/>
					</button>

					{showCategoryDropdown ? (
						<div className="absolute right-0 mt-2 w-full sm:w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-64 overflow-y-auto">
							{categories.map((cat) => (
								<button
									key={cat}
									type="button"
									onClick={() => {
										setSelectedCategory(cat);
										setShowCategoryDropdown(false);
									}}
									className={`w-full text-left px-4 py-2 text-sm transition-colors ${
										selectedCategory === cat
											? "bg-primary-50 text-primary-700 font-medium"
											: "text-gray-600 hover:bg-gray-50"
									}`}
								>
									{cat}
								</button>
							))}
						</div>
					) : null}
				</div>
			</div>

			{showCategoryDropdown ? (
				<button
					type="button"
					className="fixed inset-0 z-40"
					onClick={() => setShowCategoryDropdown(false)}
					aria-label="Close category filter"
				/>
			) : null}
		</>
	);
}

function NewsletterInline({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
	const [submitting, setSubmitting] = useState(false);

	async function handleSubscribe(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const trimmedEmail = email.trim().toLowerCase();
		if (!trimmedEmail || !trimmedEmail.includes("@")) {
			toast.error("Please enter a valid email address");
			return;
		}
		setSubmitting(true);
		try {
			const res = await fetch(`${API_BASE}/public/newsletter/subscribe`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: trimmedEmail }),
			});
			const json = await res.json();
			if (json.success) {
				toast.success(json.data?.message || "Successfully subscribed to our newsletter!");
				setEmail("");
			} else {
				toast.error(json.error || "Subscription failed. Please try again.");
			}
		} catch {
			toast.error("Unable to connect to subscription server.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div
			id="newsletter"
			className="p-6 sm:p-8 rounded-xl bg-white/80 backdrop-blur-sm border border-primary-100 shadow-md relative overflow-hidden"
		>
			<div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
				<div className="flex items-center gap-3 shrink-0">
					<div className="inline-flex items-center justify-center size-12 rounded-full bg-primary-100 text-primary-700">
						<Mail className="size-6" />
					</div>
					<div>
						<h3 className="font-bold text-gray-900 text-lg font-secondary">Join our Newsletter</h3>
						<p className="text-gray-500 text-xs font-tertiary">Events, Blog Posts and Press Releases.</p>
					</div>
				</div>

				<form className="flex w-full sm:flex-1 gap-2" onSubmit={handleSubscribe}>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="py-2.5 px-4 rounded-lg text-gray-800 bg-white border border-gray-200 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 flex-1 text-sm placeholder:text-gray-400 transition-all"
						placeholder="ali@example.com"
					/>
					<button
						type="submit"
						disabled={submitting}
						className="py-2.5 px-5 rounded-lg bg-primary-700 text-white font-medium text-sm flex items-center gap-2 hover:bg-primary-800 transition-all shrink-0 disabled:opacity-60"
					>
						Subscribe
						<Send className="size-3.5" />
					</button>
				</form>
			</div>
		</div>
	);
}
