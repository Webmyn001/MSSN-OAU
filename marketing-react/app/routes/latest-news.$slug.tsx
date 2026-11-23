import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLoaderData } from "react-router";
import { Seo } from "~/components/seo";
import { PageHeader } from "~/components/layout/PageHeader";
import {
	Calendar,
	User,
	Tag,
	ArrowLeft,
	Eye,
	MessageCircle,
	Send,
} from "lucide-react";
import { formatNewsDate } from "./latest-news";
import { findPostBySlug, postSlug } from "~/lib/utils/posts";
import { loadSiteData } from "~/lib/api/site-data";
import { API_BASE } from "~/lib/api/base";
import type { Route } from "./+types/latest-news.$slug";

interface NewsItem {
	id: string;
	title: string;
	summary?: string;
	content?: string;
	content2?: string;
	content3?: string;
	image?: string;
	image2?: string;
	category?: string;
	author?: string;
	date?: string;
	views?: number;
}

interface ArticleComment {
	id: string;
	name: string;
	comment: string;
	createdAt: string;
}

function formatCommentDate(dateStr: string): string {
	const date = new Date(dateStr);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

// * Loaded on the server so social-media crawlers receive the post's title,
// * description and main image in the initial HTML (before React hydrates).
export async function loader({ params }: Route.LoaderArgs): Promise<{ item: NewsItem | null }> {
	const data = await loadSiteData(fetch, ["latestNews"]);
	return { item: findPostBySlug(data.latestNews as NewsItem[], params.slug) };
}

export default function LatestNewsDetailPage() {
	const { item } = useLoaderData<typeof loader>();
	const articleId = item?.id;

	const [views, setViews] = useState(item?.views ?? 0);
	const [comments, setComments] = useState<ArticleComment[]>([]);
	const [commentName, setCommentName] = useState("");
	const [commentText, setCommentText] = useState("");
	const [commentError, setCommentError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const countedId = useRef<string | null>(null);

	useEffect(() => {
		if (!articleId) return;

		// * Count one view per article visit; Strict Mode re-runs won't double it.
		if (countedId.current !== articleId) {
			countedId.current = articleId;
			fetch(`${API_BASE}/public/latest-news/${articleId}/view`, { method: "POST" })
				.then((res) => (res.ok ? res.json() : null))
				.then((json) => {
					if (typeof json?.data?.views === "number") setViews(json.data.views);
				})
				.catch(() => {});
		}

		fetch(`${API_BASE}/public/latest-news/${articleId}/comments`)
			.then((res) => (res.ok ? res.json() : null))
			.then((json) => {
				if (Array.isArray(json?.data?.comments)) setComments(json.data.comments);
			})
			.catch(() => {});
	}, [articleId]);

	async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!articleId) return;

		const name = commentName.trim();
		const comment = commentText.trim();
		if (!name || !comment) return;

		setSubmitting(true);
		setCommentError("");
		try {
			const res = await fetch(`${API_BASE}/public/latest-news/${articleId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, comment }),
			});
			const json = await res.json().catch(() => null);
			if (!res.ok || !json?.success) {
				setCommentError(json?.error || "Could not post your comment. Please try again.");
				return;
			}
			setComments((prev) => [...prev, json.data.comment]);
			setCommentText("");
		} catch {
			setCommentError("Could not post your comment. Please try again.");
		} finally {
			setSubmitting(false);
		}
	}

	if (!item) {
		return (
			<>
				<PageHeader>Not Found</PageHeader>
				<div className="py-20 text-center">
					<p className="text-gray-500 mb-4">This post could not be found.</p>
					<Link to="/" className="text-green-700 hover:text-green-800 font-medium text-sm">
						Return to Home
					</Link>
				</div>
			</>
		);
	}

	return (
		<>
			<Seo
				title={item.title}
				description={item.summary}
				path={`/latest-updates/${postSlug(item)}`}
				type="article"
				images={item.image ? [{ url: item.image, width: 1200, height: 630, alt: item.title }] : undefined}
			/>

			<PageHeader subtitle="Articles, announcements, and updates from MSSN OAU committees and the wider community.">
				Latest Updates
			</PageHeader>

			<article className="py-12 sm:py-16 relative overflow-hidden">
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl" />

				<div className="max-w-3xl mx-auto px-5 sm:px-10 relative z-10">
					<div className="animate-fade-in">
						<Link
							to="/#latest-updates"
							className="inline-flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-800 font-medium mb-6 transition-colors"
						>
							<ArrowLeft className="w-4 h-4" /> Back to Home
						</Link>

						<div className="flex items-center gap-3 flex-wrap mb-4">
							{item.category ? (
								<span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
									<Tag className="w-3 h-3" /> {item.category}
								</span>
							) : null}
							<span className="inline-flex items-center gap-1 text-xs text-gray-400">
								<Calendar className="w-3.5 h-3.5" /> {formatNewsDate(item.date)}
							</span>
							{item.author ? (
								<span className="inline-flex items-center gap-1 text-xs text-gray-400">
									<User className="w-3 h-3" /> {item.author}
								</span>
							) : null}
							<span className="inline-flex items-center gap-1 text-xs text-gray-400">
								<Eye className="w-3.5 h-3.5" /> {views.toLocaleString()} views
							</span>
						</div>

						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-secondary leading-tight mb-6">
							{item.title}
						</h1>

						{item.image ? (
							<div className="relative rounded-2xl overflow-hidden mb-8 shadow-lg">
								<img
									src={item.image}
									alt={item.title}
									className="w-full h-auto max-h-[400px] object-cover"
								/>
							</div>
						) : null}

						<div className="bg-green-50/50 border border-green-100 rounded-xl p-5 mb-8">
							<p className="text-sm text-gray-700 leading-relaxed font-medium">{item.summary}</p>
						</div>

						{item.content ? (
							<div
								className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-green-700 prose-img:rounded-xl mb-8"
								dangerouslySetInnerHTML={{ __html: item.content }}
							/>
						) : null}

						{item.content2 ? (
							<div
								className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-green-700 prose-img:rounded-xl mb-8"
								dangerouslySetInnerHTML={{ __html: item.content2 }}
							/>
						) : null}

						{item.image2 ? (
							<div className="relative rounded-2xl overflow-hidden mb-8 shadow-lg">
								<img
									src={item.image2}
									alt={item.title}
									className="w-full h-auto max-h-[350px] object-cover"
								/>
							</div>
						) : null}

						{item.content3 ? (
							<div
								className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-green-700 prose-img:rounded-xl"
								dangerouslySetInnerHTML={{ __html: item.content3 }}
							/>
						) : null}

						<section className="mt-10 border-t border-green-100 pt-8">
							<div className="flex items-center gap-2 mb-5">
								<MessageCircle className="w-5 h-5 text-green-700" />
								<h2 className="text-lg font-bold text-gray-900 font-secondary">Comments</h2>
								<span className="text-xs text-gray-500">({comments.length})</span>
							</div>

							{comments.length > 0 ? (
								<div className="space-y-3 mb-6">
									{comments.map((entry) => (
										<div
											key={entry.id}
											className="bg-green-50/50 border border-green-100 rounded-xl p-4"
										>
											<div className="flex items-center justify-between gap-3 mb-1">
												<span className="text-sm font-semibold text-green-900">
													{entry.name}
												</span>
												<span className="text-[11px] text-gray-400">
													{formatCommentDate(entry.createdAt)}
												</span>
											</div>
											<p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
												{entry.comment}
											</p>
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-gray-500 mb-6">
									No comments yet. Be the first to share a thought.
								</p>
							)}

							<form
								onSubmit={handleCommentSubmit}
								className="bg-white border border-green-100 rounded-xl p-4 space-y-3"
							>
								<div>
									<label
										htmlFor="comment-name"
										className="block text-[11px] font-semibold text-gray-700 mb-1"
									>
										Your name
									</label>
									<input
										id="comment-name"
										type="text"
										value={commentName}
										onChange={(e) => setCommentName(e.target.value)}
										placeholder="e.g. Aisha"
										maxLength={100}
										required
										className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>
								<div>
									<label
										htmlFor="comment-text"
										className="block text-[11px] font-semibold text-gray-700 mb-1"
									>
										Comment
									</label>
									<textarea
										id="comment-text"
										rows={3}
										value={commentText}
										onChange={(e) => setCommentText(e.target.value)}
										placeholder="Write a short comment..."
										maxLength={500}
										required
										className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
									/>
								</div>
								{commentError ? (
									<p className="text-xs text-rose-600">{commentError}</p>
								) : null}
								<button
									type="submit"
									disabled={submitting || !commentName.trim() || !commentText.trim()}
									className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-700 hover:bg-green-800 disabled:bg-green-300 text-white text-xs font-bold shadow-md transition-colors"
								>
									<Send className="w-3.5 h-3.5" />
									{submitting ? "Posting..." : "Post Comment"}
								</button>
							</form>
						</section>
					</div>
				</div>
			</article>
		</>
	);
}
