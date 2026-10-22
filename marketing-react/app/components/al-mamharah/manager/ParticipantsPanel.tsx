import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Loader2,
	AlertCircle,
	Search,
	ChevronLeft,
	ChevronRight,
	UserX,
	UserCheck,
	ChevronDown,
	Download,
	Plus,
	BadgeCheck,
	RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
	listParticipants,
	getParticipantDetail,
	setParticipantStatus,
	suspendInactiveParticipants,
	backfillCompletion,
	setParticipantTajweed,
	fetchCsv,
	AlMamharahError,
} from "~/lib/api/al-mamharah";
import {
	MASAR_OPTIONS,
	TAJWEED_TRACK_OPTIONS,
	masarLabel,
	taskLabel,
	tajweedTrackLabel,
	formatISODate,
	participantStatusLabel,
} from "~/lib/data/al-mamharah";

const selectClass =
	"rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600";
const fieldClass =
	"w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600";

export function ParticipantsPanel({ token, onExpired }: { token: string; onExpired: () => void }) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [items, setItems] = useState<any[]>([]);
	const [meta, setMeta] = useState<any>({ page: 1, total: 0, totalPages: 1 });
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState("");
	const [masar, setMasar] = useState("");
	const [search, setSearch] = useState("");

	const [openId, setOpenId] = useState<string | null>(null);
	const [detail, setDetail] = useState<any>(null);
	const [detailLoading, setDetailLoading] = useState(false);
	const [acting, setActing] = useState<string | null>(null);

	const [bfDate, setBfDate] = useState("");
	const [bfTask, setBfTask] = useState("MUROJAAH");
	const [bfNote, setBfNote] = useState("");
	const [bfBusy, setBfBusy] = useState(false);
	const [sweeping, setSweeping] = useState(false);
	const [tajweedDraft, setTajweedDraft] = useState("");
	const [tajweedBusy, setTajweedBusy] = useState(false);

	async function sweepInactive() {
		if (!window.confirm("Suspend everyone who has missed the monthly limit?")) return;
		setSweeping(true);
		try {
			const result = await suspendInactiveParticipants(token);
			const count = result.data?.suspended?.length ?? 0;
			toast.success(result.data?.message ?? `${count} participant(s) suspended.`);
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Sweep failed.");
		} finally {
			setSweeping(false);
		}
	}

	async function load() {
		setLoading(true);
		setError(null);
		try {
			const result = await listParticipants({ page, limit: 20, status, masar, search }, token);
			setItems(result.data ?? []);
			setMeta(result.meta?.pagination ?? { page: 1, total: 0, totalPages: 1 });
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			if (err instanceof AlMamharahError && (err.status >= 500 || err.status === 0)) {
				setError(
					"Participants aren't available right now. The server may be starting up — please try again in a moment."
				);
				return;
			}
			setError(err instanceof Error ? err.message : "Unable to load participants.");
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

	async function refreshDetail(id: string) {
		setDetailLoading(true);
		try {
			const result = await getParticipantDetail(id, token);
			setDetail(result.data);
			setTajweedDraft(result.data?.tajweedTrack ?? "");
		} catch {
			/* ignore */
		} finally {
			setDetailLoading(false);
		}
	}

	async function toggleDetail(id: string) {
		if (openId === id) {
			setOpenId(null);
			setDetail(null);
			return;
		}
		setOpenId(id);
		setDetail(null);
		setDetailLoading(true);
		setBfDate("");
		setBfTask("MUROJAAH");
		setBfNote("");
		try {
			const result = await getParticipantDetail(id, token);
			setDetail(result.data);
			setTajweedDraft(result.data?.tajweedTrack ?? "");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Unable to load details.");
			setOpenId(null);
		} finally {
			setDetailLoading(false);
		}
	}

	async function saveTajweed(participantId: string) {
		setTajweedBusy(true);
		try {
			await setParticipantTajweed(
				participantId,
				{ track: tajweedDraft || null, skipPlacement: true },
				token,
			);
			toast.success("Tajweed track updated.");
			await load();
			if (openId === participantId) await refreshDetail(participantId);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not update the track.");
		} finally {
			setTajweedBusy(false);
		}
	}

	async function toggleStatus(participant: any) {
		const next = participant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
		setActing(participant.id);
		try {
			await setParticipantStatus(participant.id, next, undefined, token);
			toast.success(next === "SUSPENDED" ? "Participant suspended." : "Participant re-activated.");
			await load();
			if (openId === participant.id) await refreshDetail(participant.id);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Action failed.");
		} finally {
			setActing(null);
		}
	}

	async function submitBackfill(participantId: string) {
		if (!bfDate) {
			toast.error("Choose a date to record.");
			return;
		}
		setBfBusy(true);
		try {
			await backfillCompletion(
				{
					participantId,
					date: bfDate,
					taskType: bfTask,
					verified: true,
					note: bfNote.trim() || undefined,
				},
				token
			);
			toast.success("Completion recorded.");
			setBfDate("");
			setBfNote("");
			await load();
			await refreshDetail(participantId);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not record completion.");
		} finally {
			setBfBusy(false);
		}
	}

	async function exportCsv() {
		try {
			const response = await fetchCsv("participants", token);
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "al-mamharah-participants.csv";
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
					<option value="ACTIVE">Active</option>
					<option value="SUSPENDED">Suspended</option>
				</select>
				<select
					className={selectClass}
					value={masar}
					onChange={(e) => setMasar(e.target.value)}
					onBlur={applyFilters}
				>
					<option value="">All masār</option>
					{MASAR_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				<div className="relative min-w-[200px] flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
					<input
						type="search"
						className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary-600 focus:ring-primary-600"
						placeholder="Search name, email, matric..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onBlur={applyFilters}
					/>
				</div>
				<Button variant="outline" size="sm" onClick={exportCsv}>
					<Download className="size-4" /> CSV
				</Button>
				<Button variant="outline" size="sm" onClick={sweepInactive} disabled={sweeping}>
					{sweeping ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<UserX className="size-4" />
					)}
					Suspend inactive
				</Button>
			</div>

			{loading ? (
				<div className="flex justify-center py-16">
					<Loader2 className="size-8 animate-spin text-primary-600" />
				</div>
			) : error ? (
				<div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					<AlertCircle className="size-4 shrink-0" />
					<p className="min-w-0 flex-1">{error}</p>
					<Button variant="outline" size="sm" onClick={() => load()}>
						<RefreshCw className="size-3.5" /> Retry
					</Button>
				</div>
			) : items.length === 0 ? (
				<p className="py-16 text-center text-sm text-gray-500">No participants found.</p>
			) : (
				<>
					<ul className="space-y-3">
						{items.map((p) => (
							<li
								key={p.id}
								className="rounded-xl border border-primary-100 bg-white/90 p-4 shadow-sm"
							>
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div className="min-w-0">
										<div className="flex flex-wrap items-center gap-2">
											<h3 className="font-secondary text-base font-semibold text-gray-800">
												{p.displayName}
											</h3>
											<span
												className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
													p.status === "ACTIVE"
														? "bg-emerald-100 text-emerald-700"
														: "bg-rose-100 text-rose-700"
												}`}
											>
												{participantStatusLabel(p.status)}
											</span>
											{p.stats.todayCompleted ? (
												<span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-orange-700">
													<BadgeCheck className="size-3" />
													today
												</span>
											) : null}
										</div>
										<p className="mt-1 text-sm text-gray-600">
											{p.application.matricNumber} · {p.application.department},{" "}
											{p.application.faculty}
										</p>
										<p className="text-xs text-primary-600">
											{masarLabel(p.masar)} · started {formatISODate(p.startDate)}
											{p.tajweedTrack
												? ` · Tajweed: ${tajweedTrackLabel(p.tajweedTrack)}`
												: ""}
										</p>
										<div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
											<span>
												Current: <b className="text-primary-700">{p.stats.current}</b>
											</span>
											<span>
												Longest: <b className="text-gray-700">{p.stats.longest}</b>
											</span>
											<span>
												Total: <b className="text-gray-700">{p.stats.total}</b>
											</span>
											<span>
												Missed: <b className="text-gray-700">{p.stats.missedDays}</b>
											</span>
										</div>
									</div>
									<div className="flex shrink-0 gap-2">
										<Button variant="outline" size="sm" onClick={() => toggleDetail(p.id)}>
											<ChevronDown
												className={`size-4 transition-transform ${openId === p.id ? "rotate-180" : ""}`}
											/>
											Details
										</Button>
										<Button
											variant={p.status === "ACTIVE" ? "outline" : "default"}
											size="sm"
											onClick={() => toggleStatus(p)}
											disabled={acting === p.id}
										>
											{acting === p.id ? (
												<Loader2 className="size-4 animate-spin" />
											) : p.status === "ACTIVE" ? (
												<UserX className="size-4" />
											) : (
												<UserCheck className="size-4" />
											)}
											{p.status === "ACTIVE" ? "Suspend" : "Activate"}
										</Button>
									</div>
								</div>

								{openId === p.id ? (
									<div className="mt-4 border-t border-gray-100 pt-4">
										{detailLoading ? (
											<div className="flex justify-center py-6">
												<Loader2 className="size-6 animate-spin text-primary-500" />
											</div>
										) : detail ? (
											<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
												<div>
													<h4 className="mb-2 text-sm font-semibold text-gray-700">
														Recent activity
													</h4>
													{detail.recentCompletions.length === 0 ? (
														<p className="text-sm text-gray-500">No completions recorded.</p>
													) : (
														<ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
															{detail.recentCompletions.map((c: any) => (
																<li
																	key={c.date + c.taskType}
																	className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-1.5 text-xs"
																>
																	<span className="text-gray-700">{formatISODate(c.date)}</span>
																	<span className="text-gray-500">
																		{taskLabel(c.taskType)}
																		{c.taskType === "TAJWEED_QIRAAT" && c.matn
																			? ` · ${tajweedTrackLabel(c.matn)}${
																					c.lineNumber
																						? ` · line ${c.lineNumber}`
																						: ""
																				}`
																			: ""}
																	</span>
																	{c.verified ? (
																		<span className="font-semibold uppercase text-emerald-600">
																			verified
																		</span>
																	) : null}
																</li>
															))}
														</ul>
													)}
												</div>
												<div className="rounded-lg border border-primary-100 bg-primary-50/40 p-4">
													<h4 className="mb-3 text-sm font-semibold text-gray-700">
														Record a completion
													</h4>
													<div className="grid gap-3">
														<div>
															<label
																className="mb-1 block text-xs font-medium text-gray-600"
																htmlFor={`bf-date-${p.id}`}
															>
																Date
															</label>
															<input
																id={`bf-date-${p.id}`}
																type="date"
																className={fieldClass}
																value={bfDate}
																onChange={(e) => setBfDate(e.target.value)}
															/>
														</div>
														<div>
															<label
																className="mb-1 block text-xs font-medium text-gray-600"
																htmlFor={`bf-task-${p.id}`}
															>
																Task
															</label>
															<select
																id={`bf-task-${p.id}`}
																className={fieldClass}
																value={bfTask}
																onChange={(e) => setBfTask(e.target.value)}
															>
																<option value="MUROJAAH">Muroja'ah</option>
																<option value="TAJWEED_QIRAAT">Tajwīd & Qirāʼah</option>
															</select>
														</div>
														<div>
															<label
																className="mb-1 block text-xs font-medium text-gray-600"
																htmlFor={`bf-note-${p.id}`}
															>
																Note
															</label>
															<input
																id={`bf-note-${p.id}`}
																type="text"
																maxLength={500}
																className={fieldClass}
																value={bfNote}
																onChange={(e) => setBfNote(e.target.value)}
																placeholder="Optional"
															/>
														</div>
														<Button size="sm" onClick={() => submitBackfill(p.id)} disabled={bfBusy}>
															{bfBusy ? (
																<Loader2 className="size-4 animate-spin" />
															) : (
																<Plus className="size-4" />
															)}
															Record
														</Button>
													</div>
												</div>
												<div className="rounded-lg border border-gray-200 p-4 lg:col-span-2">
													<h4 className="mb-1 text-sm font-semibold text-gray-700">
														Tajweed track (optional)
													</h4>
													<p className="mb-3 text-xs text-gray-500">
														Setting a track here skips the placement check — use it when
														you have verified the participant&apos;s level yourself.
													</p>
													<div className="flex flex-wrap items-center gap-2">
														<select
															className={`${fieldClass} w-auto`}
															value={tajweedDraft}
															onChange={(e) => setTajweedDraft(e.target.value)}
														>
															<option value="">None — muroja&apos;ah only</option>
															{TAJWEED_TRACK_OPTIONS.map((option) => (
																<option key={option.value} value={option.value}>
																	{option.label}
																</option>
															))}
														</select>
														<Button
															size="sm"
															variant="outline"
															onClick={() => saveTajweed(p.id)}
															disabled={tajweedBusy}
														>
															{tajweedBusy ? (
																<Loader2 className="size-4 animate-spin" />
															) : null}
															Save track
														</Button>
													</div>
												</div>
											</div>
										) : null}
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
