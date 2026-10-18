import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, AlertCircle, Check, X, ChevronLeft, ChevronRight, Search, Download } from "lucide-react";
import { toast } from "sonner";
import {
	listApplications,
	approveApplication,
	rejectApplication,
	fetchCsv,
	AlMamharahError,
} from "~/lib/api/al-mamharah";
import {
	masarLabel,
	formatDateTime,
	applicationStatusLabel,
} from "~/lib/data/al-mamharah";

const selectClass =
	"rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600";
const inputClass =
	"w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary-600 focus:ring-primary-600";

export function ApplicationsPanel({ token, onExpired }: { token: string; onExpired: () => void }) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [items, setItems] = useState<any[]>([]);
	const [meta, setMeta] = useState<any>({ page: 1, total: 0, totalPages: 1 });
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState("");
	const [search, setSearch] = useState("");
	const [action, setAction] = useState<{ id: string; type: "approve" | "reject" } | null>(null);
	const [actionStart, setActionStart] = useState("");
	const [actionNotes, setActionNotes] = useState("");
	const [acting, setActing] = useState(false);

	async function load() {
		setLoading(true);
		setError(null);
		try {
			const result = await listApplications({ page, limit: 20, status, search }, token);
			setItems(result.data ?? []);
			setMeta(result.meta?.pagination ?? { page: 1, total: 0, totalPages: 1 });
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			setError(err instanceof Error ? err.message : "Unable to load applications.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function applyFilters() {
		setPage(1);
		load();
	}

	function openAction(id: string, type: "approve" | "reject") {
		setAction({ id, type });
		setActionStart("");
		setActionNotes("");
	}

	async function confirmAction() {
		if (!action) return;
		setActing(true);
		try {
			if (action.type === "approve") {
				await approveApplication(
					action.id,
					actionStart ? { startDate: actionStart } : {},
					token
				);
				toast.success("Application approved.");
			} else {
				await rejectApplication(action.id, actionNotes ? { notes: actionNotes } : {}, token);
				toast.success("Application rejected.");
			}
			setAction(null);
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Action failed.");
		} finally {
			setActing(false);
		}
	}

	async function exportCsv() {
		try {
			const response = await fetchCsv("applications", token);
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "al-mamharah-applications.csv";
			a.click();
			URL.revokeObjectURL(url);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Download failed.");
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-3">
				<select
					className={selectClass}
					value={status}
					onChange={(e) => setStatus(e.target.value)}
					onBlur={applyFilters}
				>
					<option value="">All statuses</option>
					<option value="PENDING">Pending</option>
					<option value="APPROVED">Approved</option>
					<option value="REJECTED">Rejected</option>
				</select>
				<div className="relative min-w-[200px] flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
					<input
						type="search"
						className={inputClass}
						placeholder="Search name, email, matric, faculty..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onBlur={applyFilters}
					/>
				</div>
				<Button variant="outline" size="sm" onClick={exportCsv}>
					<Download className="size-4" />
					CSV
				</Button>
			</div>

			{loading ? (
				<div className="flex justify-center py-16">
					<Loader2 className="size-8 animate-spin text-primary-600" />
				</div>
			) : error ? (
				<div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					<AlertCircle className="size-4" />
					<p>{error}</p>
				</div>
			) : items.length === 0 ? (
				<p className="py-16 text-center text-sm text-gray-500">No applications found.</p>
			) : (
				<>
					<ul className="space-y-3">
						{items.map((item) => (
							<li
								key={item.id}
								className="rounded-xl border border-primary-100 bg-white/90 p-4 shadow-sm"
							>
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div className="min-w-0">
										<div className="flex flex-wrap items-center gap-2">
											<h3 className="font-secondary text-base font-semibold text-gray-800">
												{item.fullName}
											</h3>
											<span
												className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
													item.status === "PENDING"
														? "bg-amber-100 text-amber-700"
														: item.status === "APPROVED"
															? "bg-emerald-100 text-emerald-700"
															: "bg-rose-100 text-rose-700"
												}`}
											>
												{applicationStatusLabel(item.status)}
											</span>
										</div>
										<p className="mt-1 text-sm text-gray-600">
											{item.email} {item.phone ? `· ${item.phone}` : ""}
										</p>
										<p className="text-sm text-gray-600">
											{item.matricNumber} · {item.department}, {item.faculty}
										</p>
										<p className="mt-1 text-xs text-primary-600">{masarLabel(item.masar)}</p>
										<p className="mt-1 text-xs text-gray-400">
											Submitted {formatDateTime(item.createdAt)}
											{item.reviewedBy
												? `· Reviewed by ${item.reviewedBy} (${formatDateTime(item.reviewedAt)})`
												: ""}
										</p>
										{item.reviewNotes ? (
											<p className="mt-1 text-xs text-gray-500">Note: {item.reviewNotes}</p>
										) : null}
									</div>

									{item.status === "PENDING" ? (
										<div className="flex shrink-0 gap-2">
											<Button size="sm" onClick={() => openAction(item.id, "approve")}>
												<Check className="size-4" /> Approve
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => openAction(item.id, "reject")}
											>
												<X className="size-4" /> Reject
											</Button>
										</div>
									) : null}
								</div>

								{action && action.id === item.id ? (
									<div className="mt-4 rounded-lg border border-primary-100 bg-primary-50/40 p-4">
										{action.type === "approve" ? (
											<>
												<label
													className="block text-sm font-medium text-gray-700"
													htmlFor={`almh-start-${item.id}`}
												>
													Start date (optional — defaults to the programme start)
												</label>
												<input
													id={`almh-start-${item.id}`}
													type="date"
													className="mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600"
													value={actionStart}
													onChange={(e) => setActionStart(e.target.value)}
												/>
											</>
										) : (
											<>
												<label
													className="block text-sm font-medium text-gray-700"
													htmlFor={`almh-notes-${item.id}`}
												>
													Reason / notes (optional)
												</label>
												<textarea
													id={`almh-notes-${item.id}`}
													rows={2}
													className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600"
													value={actionNotes}
													onChange={(e) => setActionNotes(e.target.value)}
													placeholder="Shared with the applicant in follow-up."
												/>
											</>
										)}
										<div className="mt-3 flex gap-2">
											<Button size="sm" onClick={confirmAction} disabled={acting}>
												{acting ? <Loader2 className="size-4 animate-spin" /> : null}
												Confirm {action.type === "approve" ? "approval" : "rejection"}
											</Button>
											<Button variant="ghost" size="sm" onClick={() => setAction(null)}>
												Cancel
											</Button>
										</div>
									</div>
								) : null}
							</li>
						))}
					</ul>

					<div className="flex items-center justify-between">
						<p className="text-xs text-gray-500">
							Page {meta.page} of {meta.totalPages} · {meta.total} total
						</p>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={meta.page <= 1}
								onClick={() => {
									setPage(meta.page - 1);
									load();
								}}
							>
								<ChevronLeft className="size-4" /> Prev
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={meta.page >= meta.totalPages}
								onClick={() => {
									setPage(meta.page + 1);
									load();
								}}
							>
								Next <ChevronRight className="size-4" />
							</Button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
