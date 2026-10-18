<script>
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import StatCard from '$lib/components/al-mamharah/StatCard.svelte';
	import { Loader2, AlertCircle, CheckCircle2, Circle } from '@lucide/svelte';
	import { getDailyProgress, AlMamharahError } from '$lib/api/al-mamharah.js';
	import { masarLabel, formatISODate } from '$lib/data/al-mamharah.js';

	/** @type {{ token: string, onExpired: () => void }} */
	let { token, onExpired } = $props();

	let loading = $state(true);
	let error = $state(/** @type {string | null} */ (null));
	let date = $state('');
	let data = $state(/** @type {any} */ (null));
	let filter = $state(/** @type {'all' | 'completed' | 'missing'} */ ('all'));

	async function load() {
		loading = true;
		error = null;
		try {
			const result = await getDailyProgress(date || undefined, token);
			data = result.data;
			date = data.date;
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			error = err instanceof Error ? err.message : 'Unable to load daily progress.';
		} finally {
			loading = false;
		}
	}

	const entries = $derived(
		(data?.entries ?? []).filter((/** @type {any} */ e) =>
			filter === 'completed' ? e.completed : filter === 'missing' ? !e.completed : true
		)
	);

	onMount(() => {
		load();
	});
</script>

<div class="space-y-4">
	<div class="flex flex-wrap items-center gap-3">
		<input
			type="date"
			class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600"
			bind:value={date}
			onchange={load}
		/>
		<Button
			variant="outline"
			size="sm"
			onclick={() => {
				date = '';
				load();
			}}
		>
			Today
		</Button>
		<div class="ml-auto flex gap-1 rounded-lg border border-gray-200 p-1">
			{#each [['all', 'All'], ['completed', 'Completed'], ['missing', 'Missing']] as [value, label] (value)}
				<button
					type="button"
					class="rounded-md px-3 py-1 text-xs font-medium transition-colors {filter === value
						? 'bg-primary-600 text-white'
						: 'text-gray-600 hover:bg-gray-100'}"
					onclick={() => (filter = /** @type {any} */ (value))}
				>
					{label}
				</button>
			{/each}
		</div>
	</div>

	{#if loading}
		<div class="flex justify-center py-16">
			<Loader2 class="size-8 animate-spin text-primary-600" />
		</div>
	{:else if error}
		<div class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
			<AlertCircle class="size-4" /><p>{error}</p>
		</div>
	{:else if data}
		<p class="text-sm text-gray-600">Progress for {formatISODate(data.date)}</p>
		<div class="grid grid-cols-3 gap-4">
			<StatCard label="Expected" value={data.total} tone="slate" />
			<StatCard label="Completed" value={data.completed} tone="emerald" />
			<StatCard label="Not yet" value={data.notCompleted} tone="amber" />
		</div>

		{#if entries.length === 0}
			<p class="py-12 text-center text-sm text-gray-500">No participants to show for this filter.</p>
		{:else}
			<ul class="space-y-2">
				{#each entries as entry (entry.participantId)}
					<li class="flex items-center justify-between rounded-lg border border-gray-100 bg-white/90 px-4 py-2.5">
						<div class="flex items-center gap-3">
							{#if entry.completed}
								<CheckCircle2 class="size-5 text-emerald-600" />
							{:else}
								<Circle class="size-5 text-gray-300" />
							{/if}
							<div>
								<p class="text-sm font-medium text-gray-800">{entry.displayName}</p>
								<p class="text-xs text-primary-600">{masarLabel(entry.masar)}</p>
							</div>
						</div>
						<div class="flex gap-4 text-xs text-gray-500">
							<span>Cur <b class="text-primary-700">{entry.current}</b></span>
							<span>Long <b class="text-gray-700">{entry.longest}</b></span>
							<span>Total <b class="text-gray-700">{entry.total}</b></span>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</div>
