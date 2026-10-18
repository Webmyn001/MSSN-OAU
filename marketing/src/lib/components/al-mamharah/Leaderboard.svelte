<script>
	import { Trophy, Flame, Medal } from '@lucide/svelte';

	/**
	 * @type {{
	 *   entries: Array<{ rank: number, participantId: string, displayName: string, current: number, longest: number, total: number, todayCompleted?: boolean }>,
	 *   selfId?: string | null,
	 *   emptyText?: string
	 * }}
	 */
	let {
		entries = [],
		selfId = null,
		emptyText = 'No participants are ranked yet.'
	} = $props();

	/** @param {number} rank */
	function rankStyles(rank) {
		if (rank === 1) return 'bg-amber-100 text-amber-700 border-amber-200';
		if (rank === 2) return 'bg-slate-100 text-slate-700 border-slate-200';
		if (rank === 3) return 'bg-orange-100 text-orange-700 border-orange-200';
		return 'bg-primary-50 text-primary-700 border-primary-100';
	}
</script>

{#if entries.length === 0}
	<p class="py-8 text-center text-sm text-gray-500">{emptyText}</p>
{:else}
	<div class="overflow-x-auto">
		<table class="w-full border-collapse text-sm">
			<thead>
				<tr class="border-b border-primary-100 text-left text-xs uppercase tracking-wide text-gray-500">
					<th class="px-3 py-2 font-medium">#</th>
					<th class="px-3 py-2 font-medium">Participant</th>
					<th class="px-3 py-2 text-center font-medium">Current</th>
					<th class="px-3 py-2 text-center font-medium">Longest</th>
					<th class="px-3 py-2 text-center font-medium">Total</th>
				</tr>
			</thead>
			<tbody>
				{#each entries as entry (entry.participantId)}
					<tr
						class="border-b border-gray-100 transition-colors {entry.participantId === selfId
							? 'bg-primary-50/70'
							: 'hover:bg-gray-50'}"
					>
						<td class="px-3 py-2">
							<span
								class="inline-flex size-7 items-center justify-center rounded-full border text-xs font-semibold {rankStyles(
									entry.rank
								)}"
							>
								{#if entry.rank <= 3}
									<Medal class="size-3.5" />
								{:else}
									{entry.rank}
								{/if}
							</span>
						</td>
						<td class="px-3 py-2">
							<div class="flex items-center gap-2">
								<span class="font-medium text-gray-800">{entry.displayName}</span>
								{#if entry.participantId === selfId}
									<span class="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700">You</span>
								{/if}
								{#if entry.todayCompleted}
									<Flame class="size-3.5 text-orange-500" aria-label="Completed today" />
								{/if}
							</div>
						</td>
						<td class="px-3 py-2 text-center font-semibold text-primary-700">{entry.current}</td>
						<td class="px-3 py-2 text-center text-gray-600">{entry.longest}</td>
						<td class="px-3 py-2 text-center text-gray-600">{entry.total}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
		<Trophy class="size-3.5 text-amber-500" />
		Ranked by current streak, then longest streak, then total days.
	</p>
{/if}
