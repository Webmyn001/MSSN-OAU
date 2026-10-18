import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { getAudit, AlMamharahError } from "~/lib/api/al-mamharah";
import { formatDateTime } from "~/lib/data/al-mamharah";

export function AuditPanel({ token, onExpired }: { token: string; onExpired: () => void }) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [items, setItems] = useState<any[]>([]);
	const [meta, setMeta] = useState<any>({ page: 1, total: 0, totalPages: 1 });
	const [page, setPage] = useState(1);
	const [action, setAction] = useState("");

	async function load() {
		setLoading(true);
		setError(null);
		try {
			const result = await getAudit({ page, limit: 30, action }, token);
			setItems(result.data ?? []);
			setMeta(result.meta?.pagination ?? { page: 1, total: 0, totalPages: 1 });
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			setError(err instanceof Error ? err.message : "Unable to load the audit trail.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function onActionChange(e: React.ChangeEvent<HTMLInputElement>) {
		setAction(e.target.value);
	}

	function applyFilter() {
		setPage(1);
		load();
	}

	return (
		<div className="space-y-4">
			<div className="relative max-w-sm">
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
				<input
					type="search"
					className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary-600 focus:ring-primary-600"
					placeholder="Filter by action..."
					value={action}
					onChange={onActionChange}
					onBlur={applyFilter}
				/>
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
				<p className="py-16 text-center text-sm text-gray-500">No audit entries found.</p>
			) : (
				<>
					<ul className="space-y-2">
						{items.map((entry) => (
							<li key={entry.id} className="rounded-lg border border-gray-100 bg-white/90 px-4 py-2.5">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<div className="flex flex-wrap items-center gap-2">
										<span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700">
											{entry.action}
										</span>
										<span className="text-xs text-gray-500">
											{entry.actorType}
											{entry.actor ? ` · ${entry.actor}` : ""}
										</span>
									</div>
									<span className="text-xs text-gray-400">{formatDateTime(entry.createdAt)}</span>
								</div>
								{entry.entity ? (
									<p className="mt-1 text-xs text-gray-500">
										{entry.entity}
										{entry.entityId ? `: ${entry.entityId}` : ""}
									</p>
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
