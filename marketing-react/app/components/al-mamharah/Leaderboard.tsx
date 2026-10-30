import { Trophy, Flame } from "lucide-react";
import { tajweedTrackLabel } from "~/lib/data/al-mamharah";

export interface LeaderboardEntry {
	rank: number;
	participantId: string;
	displayName: string;
	current: number;
	longest: number;
	total: number;
	todayCompleted?: boolean;
	tajweedTrack?: string | null;
}

interface LeaderboardProps {
	entries?: LeaderboardEntry[];
	selfId?: string | null;
	emptyText?: string;
	caption?: string;
}

/** 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 11 -> "11th", 22 -> "22nd". */
function ordinal(position: number): string {
	const mod100 = position % 100;
	if (mod100 >= 11 && mod100 <= 13) return `${position}th`;
	switch (position % 10) {
		case 1:
			return `${position}st`;
		case 2:
			return `${position}nd`;
		case 3:
			return `${position}rd`;
		default:
			return `${position}th`;
	}
}

/** Gold, silver and bronze for the podium; the default theme for everyone else. */
function rankStyles(rank: number): string {
	if (rank === 1) {
		return "bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 text-amber-950 border-amber-500 shadow-sm";
	}
	if (rank === 2) {
		return "bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 text-slate-800 border-slate-400 shadow-sm";
	}
	if (rank === 3) {
		return "bg-gradient-to-br from-orange-200 via-orange-400 to-amber-700 text-orange-950 border-orange-500 shadow-sm";
	}
	return "bg-primary-50 text-primary-700 border-primary-100";
}

/** Row background: podium colours come first so a top-three "you" keeps them. */
function rowStyles(rank: number, isSelf: boolean): string {
	if (rank === 1) return isSelf ? "bg-amber-100/80" : "bg-amber-50/50";
	if (rank === 2) return isSelf ? "bg-slate-100" : "bg-slate-50";
	if (rank === 3) return isSelf ? "bg-orange-100/70" : "bg-orange-50/40";
	return isSelf ? "bg-primary-50/70" : "hover:bg-gray-50";
}

/** The "You" chip follows the podium colour when the participant is top three. */
function youStyles(rank: number): string {
	if (rank === 1) return "bg-amber-400/90 text-amber-950 ring-1 ring-amber-600";
	if (rank === 2) return "bg-slate-300 text-slate-900 ring-1 ring-slate-500";
	if (rank === 3) return "bg-orange-400/90 text-orange-950 ring-1 ring-orange-600";
	return "bg-primary-100 text-primary-700";
}

export function Leaderboard({
	entries = [],
	selfId = null,
	emptyText = "No participants are ranked yet.",
	caption = "Ranked by total marks since each participant's start date (½ per task, 1 for both), then current streak.",
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
							<th className="px-3 py-2 font-medium">Participant</th>
							<th className="px-3 py-2 text-center font-medium">Current</th>
							<th className="px-3 py-2 text-center font-medium">Best</th>
							<th className="px-3 py-2 text-center font-medium">Marks</th>
						</tr>
					</thead>
					<tbody>
						{entries.map((entry) => {
							const isSelf = entry.participantId === selfId;
							return (
								<tr
									key={entry.participantId}
									className={`border-b border-gray-100 transition-colors ${rowStyles(
										entry.rank,
										isSelf,
									)}`}
								>
									<td className="px-3 py-2">
										<div className="flex flex-wrap items-center gap-2">
											<span
												className={`inline-flex min-w-9 items-center justify-center rounded-full border px-2 py-0.5 text-xs font-bold ${rankStyles(
													entry.rank,
												)}`}
												title={`Position ${entry.rank}`}
											>
												{ordinal(entry.rank)}
											</span>
											<span className="font-medium text-gray-800">{entry.displayName}</span>
											{isSelf ? (
												<span
													className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${youStyles(
														entry.rank,
													)}`}
												>
													You
												</span>
											) : null}
											{entry.tajweedTrack ? (
												<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
													{tajweedTrackLabel(entry.tajweedTrack)}
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
									<td className="px-3 py-2 text-center font-semibold text-gray-700">
										{entry.total}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			<p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
				<Trophy className="size-3.5 text-amber-500" />
				{caption}
			</p>
		</>
	);
}
