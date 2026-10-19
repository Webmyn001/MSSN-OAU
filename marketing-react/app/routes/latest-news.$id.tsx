import { Link, useParams } from "react-router";
import { Seo } from "~/components/seo";
import { PageHeader } from "~/components/layout/PageHeader";
import { Calendar, User, Tag, ArrowLeft } from "lucide-react";
import { formatNewsDate } from "./latest-news";
import { useSiteData } from "~/lib/hooks/useSiteData";

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

export default function LatestNewsDetailPage() {
	const { id } = useParams();
	const [items] = useSiteData<NewsItem[]>("latestNews", []);
	const item = items.find((n) => n.id === id) || null;

	if (!item) {
		return (
			<>
				<PageHeader>Not Found</PageHeader>
				<div className="py-20 text-center">
					<p className="text-gray-500 mb-4">This news item could not be found.</p>
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
				path={`/latest-news/${id}`}
				type="Article"
				images={item.image ? [{ url: item.image, width: 1200, height: 630, alt: item.title }] : []}
			/>

			<PageHeader subtitle="Stay up to date with announcements, updates and stories from across the MSSN OAU community.">
				Latest News
			</PageHeader>

			<article className="py-12 sm:py-16 relative overflow-hidden">
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl" />

				<div className="max-w-3xl mx-auto px-5 sm:px-10 relative z-10">
					<div className="animate-fade-in">
						<Link
							to="/#latest-news"
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
									<User className="w-3.5 h-3.5" /> {item.author}
								</span>
							) : null}
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

						{item.image2 ? (
							<div className="relative rounded-2xl overflow-hidden mb-8 shadow-lg">
								<img
									src={item.image2}
									alt={item.title}
									className="w-full h-auto max-h-[350px] object-cover"
								/>
							</div>
						) : null}

						{item.content ? (
							<div
								className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-green-700 prose-img:rounded-xl"
								dangerouslySetInnerHTML={{ __html: item.content }}
							/>
						) : null}
					</div>
				</div>
			</article>
		</>
	);
}
