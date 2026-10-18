import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Button } from "~/components/ui/button";
import { StatCard } from "~/components/al-mamharah/StatCard";
import { Loader2, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import { getDailyProgress, AlMamharahError } from "~/lib/api/al-mamharah";
import { masarLabel, formatISODate } from "~/lib/data/al-mamharah";

const FILTERS: Array<["all" | "completed" | "missing", string]> = [
	["all", "All"],
	["completed", "Completed"],
	["missing", "Missing"],
];

export function DailyPanel({ token, onExpired }: { token: string; onExpired: () => void }) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [date, setDate] = useState("");
	const [data, setData] = useState<any>(null);
	const [filter, setFilter] = useState<"all" | "completed" | "missing">("all");

	async function load() {
		setLoading(true);
		setError(null);
		try {
			const result = await getDailyProgress(date || undefined, token);
			setData(result.data);
			setDate(result.data.date);
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			setError(err instanceof Error ? err.message : "Unable to load daily progress.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function onDateChange(e: ChangeEvent<HTMLInputElement>) {
		setDate(e.target.value);
	}

	function resetToday() {
		setDate("");
		load();
	}

	const entries = (data?.entries ?? []).filter((e: any) =>
		filter === "completed" ? e.completed : filter === "missing" ? !e.completed : true
	);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-3">
				<input
					type="date"
					className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600"
					value={date}
					onChange={onDateChange}
					onBlur={load}
				/>
				<Button variant="outline" size="sm" onClick={resetToday}>
					Today
				</Button>
				<div className="ml-auto flex gap-1 rounded-lg border border-gray-200 p-1">
					{FILTERS.map(([value, label]) => (
						<button
							key={value}
							type="button"
							className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
								filter === value ? "bg-primary-600 text-white" : "text-gray-600 hover:bg-gray-100"
							}`}
							onClick={() => setFilter(value)}
						>
							{label}
						</button>
					))}
				</div>
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
			) : data ? (
				<>
					<p className="text-sm text-gray-600">Progress for {formatISODate(data.date)}</p>
					<div className="grid grid-cols-3 gap-4">
						<StatCard label="Expected" value={data.total} tone="slate" />
						<StatCard label="Completed" value={data.completed} tone="emerald" />
						<StatCard label="Not yet" value={data.notCompleted} tone="amber" />
					</div>

					{entries.length === 0 ? (
						<p className="py-12 text-center text-sm text-gray-500">
							No participants to show for this filter.
						</p>
					) : (
						<ul className="space-y-2">
							{entries.map((entry: any) => (
								<li
									key={entry.participantId}
									className="flex items-center justify-between rounded-lg border border-gray-100 bg-white/90 px-4 py-2.5"
								>
									<div className="flex items-center gap-3">
										{entry.completed ? (
											<CheckCircle2 className="size-5 text-emerald-600" />
										) : (
											<Circle className="size-5 text-gray-300" />
										)}
										<div>
											<p className="text-sm font-medium text-gray-800">{entry.displayName}</p>
											<p className="text-xs text-primary-600">{masarLabel(entry.masar)}</p>
										</div>
									</div>
									<div className="flex gap-4 text-xs text-gray-500">
										<span>
											Cur <b className="text-primary-700">{entry.current}</b>
										</span>
										<span>
											Long <b className="text-gray-700">{entry.longest}</b>
										</span>
										<span>
											Total <b className="text-gray-700">{entry.total}</b>
										</span>
									</div>
								</li>
							))}
						</ul>
					)}
				</>
			) : null}
		</div>
	);
}
