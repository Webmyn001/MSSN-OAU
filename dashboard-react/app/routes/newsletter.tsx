import { useEffect, useState } from "react";
import { toast } from "~/lib/stores/toast";
import { ConfirmDialog } from "~/components/ConfirmDialog";
import { API_BASE } from "~/lib/api/base";
import {
	Mail,
	Users,
	UserCheck,
	UserX,
	Search,
	X,
	Trash2,
	Eye,
	ExternalLink,
	Send,
	Newspaper,
	Loader2,
	Clock,
} from "lucide-react";

const API = `${API_BASE}/public/newsletter`;

interface Subscriber {
	id: string;
	email: string;
	name: string | null;
	isActive: boolean;
	subscribedAt: string;
	unsubscribedAt: string | null;
}

interface Stats {
	total: number;
	active: number;
	unsubscribed: number;
}

interface ConfirmState {
	open: boolean;
	title: string;
	message: string;
	action: () => Promise<void>;
}

export default function Newsletter() {
	const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
	const [stats, setStats] = useState<Stats>({ total: 0, active: 0, unsubscribed: 0 });
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(true);

	// Broadcast state
	const [broadcastSubject, setBroadcastSubject] = useState("");
	const [broadcastContent, setBroadcastContent] = useState("");
	const [isBroadcasting, setIsBroadcasting] = useState(false);
	const [broadcastResult, setBroadcastResult] = useState<{ sent: number; failed: number } | null>(null);

	// News Alert state
	const [newsTitle, setNewsTitle] = useState("");
	const [newsSummary, setNewsSummary] = useState("");
	const [newsImageUrl, setNewsImageUrl] = useState("");
	const [newsUrl, setNewsUrl] = useState("");
	const [isSendingNews, setIsSendingNews] = useState(false);
	const [newsResult, setNewsResult] = useState<{ sent: number; failed: number } | null>(null);

	// Detail modal
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [activeSubscriber, setActiveSubscriber] = useState<Subscriber | null>(null);

	const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

	async function fetchSubscribers() {
		setIsLoading(true);
		try {
			const res = await fetch(`${API}/subscribers`);
			const json = await res.json();
			if (json.success) {
				setSubscribers(json.data.subscribers);
				setStats(json.data.stats);
			} else {
				toast("error", json.error || "Failed to fetch subscribers");
			}
		} catch {
			toast("error", "Could not connect to API server");
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		fetchSubscribers();
	}, []);

	function displayedSubscribers() {
		let list = subscribers;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(
				(s) => s.email.toLowerCase().includes(q) || (s.name && s.name.toLowerCase().includes(q))
			);
		}
		return list;
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString("en-NG", {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	function openDetail(sub: Subscriber) {
		setActiveSubscriber(sub);
		setIsDetailModalOpen(true);
	}

	function deleteSubscriber(id: string, email: string) {
		setConfirmState({
			open: true,
			title: "Delete Subscriber?",
			message: `Delete subscriber "${email}"? This cannot be undone.`,
			action: async () => {
				try {
					const res = await fetch(`${API}/subscribers/${id}`, { method: "DELETE" });
					const json = await res.json();
					if (json.success) {
						setSubscribers((prev) => prev.filter((s) => s.id !== id));
						setStats((prev) => ({ ...prev, total: prev.total - 1 }));
						if (activeSubscriber?.id === id) setIsDetailModalOpen(false);
						toast("success", `Deleted ${email}`);
					} else {
						toast("error", json.error || "Failed to delete");
					}
				} catch {
					toast("error", "Failed to delete subscriber");
				}
			},
		});
	}

	async function handleBroadcast() {
		if (!broadcastSubject.trim() || !broadcastContent.trim()) {
			toast("error", "Subject and content are required");
			return;
		}
		setIsBroadcasting(true);
		setBroadcastResult(null);
		try {
			const res = await fetch(`${API}/send`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ subject: broadcastSubject.trim(), content: broadcastContent.trim() }),
			});
			const json = await res.json();
			if (json.success) {
				setBroadcastResult({ sent: json.data.sentCount, failed: json.data.failCount });
				toast("success", json.data.message);
				setBroadcastSubject("");
				setBroadcastContent("");
			} else {
				toast("error", json.error || "Broadcast failed");
			}
		} catch {
			toast("error", "Failed to send broadcast");
		} finally {
			setIsBroadcasting(false);
		}
	}

	async function handleNewsAlert() {
		if (!newsTitle.trim() || !newsSummary.trim()) {
			toast("error", "Title and summary are required");
			return;
		}
		setIsSendingNews(true);
		setNewsResult(null);
		try {
			const res = await fetch(`${API}/broadcast-news`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: newsTitle.trim(),
					summary: newsSummary.trim(),
					imageUrl: newsImageUrl.trim() || undefined,
					url: newsUrl.trim() || undefined,
				}),
			});
			const json = await res.json();
			if (json.success) {
				setNewsResult({ sent: json.data.sentCount, failed: json.data.failCount });
				toast("success", json.data.message);
				setNewsTitle("");
				setNewsSummary("");
				setNewsImageUrl("");
				setNewsUrl("");
			} else {
				toast("error", json.error || "News alert failed");
			}
		} catch {
			toast("error", "Failed to send news alert");
		} finally {
			setIsSendingNews(false);
		}
	}

	return (
		<>
			<div className="space-y-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
					<div>
						<h2 className="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
							<Mail className="w-7 h-7 text-green-700" />
							Newsletter
						</h2>
						<p className="text-xs sm:text-sm text-gray-600 mt-1">Manage subscribers and send email broadcasts.</p>
					</div>
					<button
						onClick={fetchSubscribers}
						className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
					>
						<Loader2 className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
						<span className="hidden sm:inline">Refresh</span>
					</button>
				</div>

				<div className="grid grid-cols-3 gap-3">
					<div className="bg-white border border-green-100 rounded-xl p-4 shadow-sm text-center">
						<p className="text-2xl font-extrabold text-green-950">{stats.total}</p>
						<p className="text-[11px] text-gray-500 font-medium">Total Subscribers</p>
					</div>
					<div className="bg-white border border-green-100 rounded-xl p-4 shadow-sm text-center">
						<p className="text-2xl font-extrabold text-green-700">{stats.active}</p>
						<p className="text-[11px] text-gray-500 font-medium">Active</p>
					</div>
					<div className="bg-white border border-rose-100 rounded-xl p-4 shadow-sm text-center">
						<p className="text-2xl font-extrabold text-rose-700">{stats.unsubscribed}</p>
						<p className="text-[11px] text-gray-500 font-medium">Unsubscribed</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<div className="bg-white border border-green-100 rounded-2xl p-5 shadow-sm space-y-4">
						<h3 className="text-sm font-bold text-green-950 flex items-center gap-2">
							<Send className="w-4 h-4 text-green-700" />
							Send Newsletter Broadcast
						</h3>
						<p className="text-[11px] text-gray-500">
							Send a custom email to all {stats.active} active subscribers.
						</p>

						<div className="space-y-3">
							<div>
								<label htmlFor="broadcast-subject" className="block text-[11px] font-semibold text-gray-700 mb-1">
									Subject
								</label>
								<input
									id="broadcast-subject"
									type="text"
									value={broadcastSubject}
									onChange={(e) => setBroadcastSubject(e.target.value)}
									placeholder="e.g. Ramadan Lecture Series 2025"
									className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
								/>
							</div>
							<div>
								<label htmlFor="broadcast-content" className="block text-[11px] font-semibold text-gray-700 mb-1">
									Content (HTML supported)
								</label>
								<textarea
									id="broadcast-content"
									rows={5}
									value={broadcastContent}
									onChange={(e) => setBroadcastContent(e.target.value)}
									placeholder="<p>Assalamu 'alaykum,</p><p>We are excited to announce...</p>"
									className="w-full bg-green-50/50 border border-green-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600 font-mono"
								/>
							</div>
							<button
								onClick={handleBroadcast}
								disabled={isBroadcasting}
								className="w-full px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
							>
								{isBroadcasting ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" /> Sending...
									</>
								) : (
									<>
										<Send className="w-4 h-4" /> Broadcast to All Subscribers
									</>
								)}
							</button>
						</div>

						{broadcastResult ? (
							<div className="bg-green-50 border border-green-200 rounded-xl p-3 text-[11px] text-green-800">
								Sent: <strong>{broadcastResult.sent}</strong> | Failed:{" "}
								<strong>{broadcastResult.failed}</strong>
							</div>
						) : null}
					</div>

					<div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm space-y-4">
						<h3 className="text-sm font-bold text-green-950 flex items-center gap-2">
							<Newspaper className="w-4 h-4 text-amber-600" />
							Send News Alert
						</h3>
						<p className="text-[11px] text-gray-500">Notify subscribers when a new article or post is published.</p>

						<div className="space-y-3">
							<div>
								<label htmlFor="news-title" className="block text-[11px] font-semibold text-gray-700 mb-1">
									Title *
								</label>
								<input
									id="news-title"
									type="text"
									value={newsTitle}
									onChange={(e) => setNewsTitle(e.target.value)}
									placeholder="Article or news title"
									className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
								/>
							</div>
							<div>
								<label htmlFor="news-summary" className="block text-[11px] font-semibold text-gray-700 mb-1">
									Summary *
								</label>
								<textarea
									id="news-summary"
									rows={3}
									value={newsSummary}
									onChange={(e) => setNewsSummary(e.target.value)}
									placeholder="Brief summary of the news..."
									className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
								/>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<div>
									<label htmlFor="news-image" className="block text-[11px] font-semibold text-gray-700 mb-1">
										Image URL
									</label>
									<input
										id="news-image"
										type="url"
										value={newsImageUrl}
										onChange={(e) => setNewsImageUrl(e.target.value)}
										placeholder="https://..."
										className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
									/>
								</div>
								<div>
									<label htmlFor="news-link" className="block text-[11px] font-semibold text-gray-700 mb-1">
										Article Link
									</label>
									<input
										id="news-link"
										type="url"
										value={newsUrl}
										onChange={(e) => setNewsUrl(e.target.value)}
										placeholder="https://..."
										className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
									/>
								</div>
							</div>
							<button
								onClick={handleNewsAlert}
								disabled={isSendingNews}
								className="w-full px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
							>
								{isSendingNews ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" /> Sending...
									</>
								) : (
									<>
										<Newspaper className="w-4 h-4" /> Send News Alert
									</>
								)}
							</button>
						</div>

						{newsResult ? (
							<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800">
								Sent: <strong>{newsResult.sent}</strong> | Failed: <strong>{newsResult.failed}</strong>
							</div>
						) : null}
					</div>
				</div>

				<div className="relative">
					<Search className="w-4 h-4 text-green-700 absolute left-3 top-2.5" />
					<input
						type="text"
						placeholder="Search by name or email..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-white border border-green-200 rounded-xl pl-9 pr-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
					/>
				</div>

				{isLoading ? (
					<div className="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
						<Loader2 className="w-8 h-8 text-green-700 animate-spin mx-auto" />
						<p className="text-xs text-gray-500">Loading subscribers...</p>
					</div>
				) : displayedSubscribers().length === 0 ? (
					<div className="bg-white border border-green-100 rounded-2xl p-12 text-center space-y-3">
						<div className="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto">
							<Users className="w-6 h-6" />
						</div>
						<h3 className="text-base font-semibold text-green-950">No Subscribers Found</h3>
						<p className="text-xs text-gray-500">No subscribers match your search.</p>
					</div>
				) : (
					<div className="bg-white border border-green-100 rounded-2xl overflow-hidden shadow-sm">
						<div className="overflow-x-auto">
							<table className="w-full text-xs">
								<thead>
									<tr className="bg-green-50/80 border-b border-green-100 text-left">
										<th className="px-4 py-3 font-semibold text-green-900">Email</th>
										<th className="px-4 py-3 font-semibold text-green-900">Name</th>
										<th className="px-4 py-3 font-semibold text-green-900">Status</th>
										<th className="px-4 py-3 font-semibold text-green-900">Subscribed</th>
										<th className="px-4 py-3 font-semibold text-green-900 text-right">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{displayedSubscribers().map((sub) => (
										<tr key={sub.id} className="hover:bg-green-50/30 transition-colors">
											<td className="px-4 py-3 font-medium text-green-950 flex items-center gap-2">
												<Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
												{sub.email}
											</td>
											<td className="px-4 py-3 text-gray-600">{sub.name || "—"}</td>
											<td className="px-4 py-3">
												{sub.isActive ? (
													<span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800 flex items-center gap-1 w-fit">
														<UserCheck className="w-3 h-3" /> Active
													</span>
												) : (
													<span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
														<UserX className="w-3 h-3" /> Unsubscribed
													</span>
												)}
											</td>
											<td className="px-4 py-3 text-gray-500 flex items-center gap-1">
												<Clock className="w-3 h-3" /> {formatDate(sub.subscribedAt)}
											</td>
											<td className="px-4 py-3 text-right">
												<div className="flex items-center justify-end gap-1">
													<button
														onClick={() => openDetail(sub)}
														className="p-1.5 rounded-lg text-gray-400 hover:text-green-700 hover:bg-green-100 transition-colors"
														title="View"
													>
														<Eye className="w-4 h-4" />
													</button>
													<a
														href={`mailto:${sub.email}`}
														className="p-1.5 rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-100 transition-colors"
														title="Email"
													>
														<ExternalLink className="w-4 h-4" />
													</a>
													<button
														onClick={() => deleteSubscriber(sub.id, sub.email)}
														className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-100 transition-colors"
														title="Delete"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>

			{isDetailModalOpen && activeSubscriber ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
					<div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
						<div className="flex items-center justify-between pb-3 border-b border-gray-100">
							<div>
								<h3 className="text-base font-bold text-green-950">{activeSubscriber.name || "Subscriber"}</h3>
								<p className="text-[11px] text-gray-500">{activeSubscriber.email}</p>
							</div>
							<button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-700">
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="space-y-3">
							<div className="grid grid-cols-2 gap-2 text-xs">
								<div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
									<p className="text-[10px] text-gray-400 font-medium">Status</p>
									{activeSubscriber.isActive ? (
										<span className="inline-flex items-center gap-1 text-green-700 font-semibold mt-1">
											<UserCheck className="w-3.5 h-3.5" /> Active
										</span>
									) : (
										<span className="inline-flex items-center gap-1 text-rose-700 font-semibold mt-1">
											<UserX className="w-3.5 h-3.5" /> Unsubscribed
										</span>
									)}
								</div>
								<div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
									<p className="text-[10px] text-gray-400 font-medium">Subscribed</p>
									<p className="text-green-950 font-medium mt-1">{formatDate(activeSubscriber.subscribedAt)}</p>
								</div>
							</div>

							{activeSubscriber.unsubscribedAt ? (
								<div className="bg-rose-50 p-3 rounded-lg border border-rose-100 text-xs text-rose-800">
									Unsubscribed: {formatDate(activeSubscriber.unsubscribedAt)}
								</div>
							) : null}

							<div className="bg-green-50/50 p-3 rounded-lg border border-green-100 text-xs text-green-800 flex items-center gap-2">
								<Mail className="w-4 h-4 shrink-0" />
								<span>{activeSubscriber.email}</span>
							</div>
						</div>

						<div className="flex items-center gap-2 pt-3 border-t border-gray-100">
							<a
								href={`mailto:${activeSubscriber.email}`}
								className="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
								title="Email"
							>
								<Mail className="w-4 h-4" />
							</a>
							<div className="flex-1" />
							<button
								onClick={() => setIsDetailModalOpen(false)}
								className="px-4 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			) : null}

			<ConfirmDialog
				open={confirmState?.open ?? false}
				title={confirmState?.title ?? "Are you sure?"}
				message={confirmState?.message ?? ""}
				confirmLabel="Yes, Delete"
				cancelLabel="No, Cancel"
				onconfirm={() => {
					const action = confirmState?.action;
					setConfirmState(null);
					action?.();
				}}
				oncancel={() => {
					setConfirmState(null);
				}}
			/>
		</>
	);
}
