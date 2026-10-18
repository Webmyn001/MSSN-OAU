import { useEffect, useState } from "react";
import { StatCard } from "~/components/al-mamharah/StatCard";
import { Loader2, AlertCircle, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { getOverview, AlMamharahError } from "~/lib/api/al-mamharah";
import { formatISODate } from "~/lib/data/al-mamharah";

export function OverviewPanel({ token, onExpired }: { token: string; onExpired: () => void }) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<any>(null);

	async function load() {
		setLoading(true);
		setError(null);
		try {
			const result = await getOverview(token);
			setData(result.data);
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			const message = err instanceof Error ? err.message : "Unable to load overview.";
			setError(message);
			toast.error(message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (loading) {
		return (
			<div className="flex justify-center py-16">
				<Loader2 className="size-8 animate-spin text-primary-600" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
				<AlertCircle className="size-4" />
				<p>{error}</p>
			</div>
		);
	}

	if (!data) return null;

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-primary-100 bg-white/90 p-4 shadow-sm">
				<div className="flex items-center gap-2 text-sm text-primary-700">
					<CalendarDays className="size-4" />
					<span>
						Programme window: {formatISODate(data.programme.start)} – {formatISODate(data.programme.end)}
					</span>
				</div>
			</div>

			<div>
				<h3 className="mb-3 font-secondary text-sm font-semibold uppercase tracking-wide text-gray-500">
					Applications
				</h3>
				<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
					<StatCard label="Total" value={data.applications.total} tone="primary" />
					<StatCard label="Pending" value={data.applications.pending} tone="amber" />
					<StatCard label="Approved" value={data.applications.approved} tone="emerald" />
					<StatCard label="Rejected" value={data.applications.rejected} tone="rose" />
				</div>
			</div>

			<div>
				<h3 className="mb-3 font-secondary text-sm font-semibold uppercase tracking-wide text-gray-500">
					Participants
				</h3>
				<div className="grid grid-cols-3 gap-4">
					<StatCard label="Total" value={data.participants.total} tone="primary" />
					<StatCard label="Active" value={data.participants.active} tone="emerald" />
					<StatCard label="Suspended" value={data.participants.suspended} tone="rose" />
				</div>
			</div>

			<div>
				<h3 className="mb-3 font-secondary text-sm font-semibold uppercase tracking-wide text-gray-500">
					Today · {formatISODate(data.today.date)}
				</h3>
				<div className="grid grid-cols-3 gap-4">
					<StatCard label="Expected" value={data.today.total} tone="slate" />
					<StatCard label="Completed" value={data.today.completed} tone="emerald" />
					<StatCard label="Not yet" value={data.today.notCompleted} tone="amber" />
				</div>
			</div>

			<div>
				<h3 className="mb-3 font-secondary text-sm font-semibold uppercase tracking-wide text-gray-500">
					Managers
				</h3>
				<div className="grid grid-cols-3 gap-4">
					<StatCard label="Total" value={data.managers.total} tone="primary" />
					<StatCard label="Active" value={data.managers.active} tone="emerald" />
					<StatCard label="Pending" value={data.managers.pending} tone="amber" />
				</div>
			</div>
		</div>
	);
}
