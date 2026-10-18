import { Trophy, Flame, Medal } from "lucide-react";

export interface LeaderboardEntry {
	rank: number;
	participantId: string;
	displayName: string;
	current: number;
	longest: number;
	total: number;
	todayCompleted?: boolean;
}

interface LeaderboardProps {
	entries?: LeaderboardEntry[];
	selfId?: string | null;
	emptyText?: string;
}

function rankStyles(rank: number): string {
	if (rank === 1) return "bg-amber-100 text-amber-700 border-amber-200";
	if (rank === 2) return "bg-slate-100 text-slate-700 border-slate-200";
	if (rank === 3) return "bg-orange-100 text-orange-700 border-orange-200";
	return "bg-primary-50 text-primary-700 border-primary-100";
}

export function Leaderboard({
	entries = [],
	selfId = null,
	emptyText = "No participants are ranked yet.",
}: LeaderboardProps) {
	if (entries.length === 0) {
		return <p className="py-8 text-center text-sm text-gray-500">{emptyText}</p>;
	}

	return (
		<>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr className="border-b border-primary-100 text-left text-xs uppercase tracking-wide text-gray-500">
							<th className="px-3 py-2 font-medium">#</th>
							<th className="px-3 py-2 font-medium">Participant</th>
							<th className="px-3 py-2 text-center font-medium">Current</th>
							<th className="px-3 py-2 text-center font-medium">Longest</th>
							<th className="px-3 py-2 text-center font-medium">Total</th>
						</tr>
					</thead>
					<tbody>
						{entries.map((entry) => (
							<tr
								key={entry.participantId}
								className={`border-b border-gray-100 transition-colors ${
									entry.participantId === selfId ? "bg-primary-50/70" : "hover:bg-gray-50"
								}`}
							>
								<td className="px-3 py-2">
									<span
										className={`inline-flex size-7 items-center justify-center rounded-full border text-xs font-semibold ${rankStyles(
											entry.rank,
										)}`}
									>
										{entry.rank <= 3 ? <Medal className="size-3.5" /> : entry.rank}
									</span>
								</td>
								<td className="px-3 py-2">
									<div className="flex items-center gap-2">
										<span className="font-medium text-gray-800">{entry.displayName}</span>
										{entry.participantId === selfId ? (
											<span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700">
												You
											</span>
										) : null}
										{entry.todayCompleted ? (
											<Flame className="size-3.5 text-orange-500" aria-label="Completed today" />
										) : null}
									</div>
								</td>
								<td className="px-3 py-2 text-center font-semibold text-primary-700">
									{entry.current}
								</td>
								<td className="px-3 py-2 text-center text-gray-600">{entry.longest}</td>
								<td className="px-3 py-2 text-center text-gray-600">{entry.total}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
				<Trophy className="size-3.5 text-amber-500" />
				Ranked by current streak, then longest streak, then total days.
			</p>
		</>
	);
}
