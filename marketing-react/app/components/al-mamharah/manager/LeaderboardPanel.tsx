import { useEffect, useState } from "react";
import { Leaderboard } from "~/components/al-mamharah/Leaderboard";
import { Loader2, AlertCircle } from "lucide-react";
import { getManagerLeaderboard, AlMamharahError } from "~/lib/api/al-mamharah";

export function LeaderboardPanel({ token, onExpired }: { token: string; onExpired: () => void }) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<any>(null);

	async function load() {
		setLoading(true);
		setError(null);
		try {
			const result = await getManagerLeaderboard(token);
			setData(result.data);
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			setError(err instanceof Error ? err.message : "Unable to load the leaderboard.");
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
		<div className="rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm">
			<p className="mb-3 text-sm text-gray-500">
				{data.totalParticipants} active participants · {data.today}
			</p>
			<Leaderboard entries={data.entries ?? []} emptyText="No rankings yet." />
		</div>
	);
}
