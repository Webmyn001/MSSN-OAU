import { useEffect, useState } from "react";
import { Leaderboard } from "~/components/al-mamharah/Leaderboard";
import { Loader2, AlertCircle } from "lucide-react";
import { getManagerLeaderboard, AlMamharahError } from "~/lib/api/al-mamharah";

type Scope = "OVERALL" | "QURAN" | "TAJWEED";

const TABS: { value: Scope; label: string }[] = [
	{ value: "OVERALL", label: "Overall" },
	{ value: "QURAN", label: "Qur'an" },
	{ value: "TAJWEED", label: "Tajweed" },
];

export function LeaderboardPanel({ token, onExpired }: { token: string; onExpired: () => void }) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<any>(null);
	const [scope, setScope] = useState<Scope>("OVERALL");

	async function load(nextScope: Scope) {
		setLoading(true);
		setError(null);
		try {
			const result = await getManagerLeaderboard(nextScope, token);
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
		load(scope);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [scope]);

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
			<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
				<div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
					{TABS.map((tab) => (
						<button
							key={tab.value}
							type="button"
							onClick={() => setScope(tab.value)}
							className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
								scope === tab.value
									? "bg-white text-primary-700 shadow-sm"
									: "text-gray-500 hover:text-gray-700"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
				<p className="text-sm text-gray-500">
					{data.totalParticipants}{" "}
					{scope === "TAJWEED" ? "on a tajweed track" : "active participants"} · {data.today}
				</p>
			</div>
			<Leaderboard
				entries={data.entries ?? []}
				caption={
					scope === "TAJWEED"
						? "Ranked by total tajweed lines recorded since each participant's start date, then current streak."
						: "Ranked by total marks since each participant's start date, then current streak."
				}
				emptyText={
					scope === "TAJWEED"
						? "No tajweed lines recorded yet."
						: scope === "QURAN"
							? "No muroja'ah records yet."
							: "No rankings yet."
				}
			/>
		</div>
	);
}
