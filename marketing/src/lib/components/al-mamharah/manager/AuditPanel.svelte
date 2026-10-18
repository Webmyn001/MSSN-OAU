<script>
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Search } from '@lucide/svelte';
	import { getAudit, AlMamharahError } from '$lib/api/al-mamharah.js';
	import { formatDateTime } from '$lib/data/al-mamharah.js';

	/** @type {{ token: string, onExpired: () => void }} */
	let { token, onExpired } = $props();

	let loading = $state(true);
	let error = $state(/** @type {string | null} */ (null));
	let items = $state(/** @type {any[]} */ ([]));
	let meta = $state(/** @type {any} */ ({ page: 1, total: 0, totalPages: 1 }));
	let page = $state(1);
	let action = $state('');

	async function load() {
		loading = true;
		error = null;
		try {
			const result = await getAudit({ page, limit: 30, action }, token);
			items = result.data ?? [];
			meta = result.meta?.pagination ?? { page: 1, total: 0, totalPages: 1 };
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			error = err instanceof Error ? err.message : 'Unable to load the audit trail.';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		load();
	});
</script>

<div class="space-y-4">
	<div class="relative max-w-sm">
		<Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
		<input
			type="search"
			class="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary-600 focus:ring-primary-600"
			placeholder="Filter by action..."
			bind:value={action}
			onchange={() => {
				page = 1;
				load();
			}}
		/>
	</div>

	{#if loading}
		<div class="flex justify-center py-16">
			<Loader2 class="size-8 animate-spin text-primary-600" />
		</div>
	{:else if error}
		<div class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
			<AlertCircle class="size-4" /><p>{error}</p>
		</div>
	{:else if items.length === 0}
		<p class="py-16 text-center text-sm text-gray-500">No audit entries found.</p>
	{:else}
		<ul class="space-y-2">
			{#each items as entry (entry.id)}
				<li class="rounded-lg border border-gray-100 bg-white/90 px-4 py-2.5">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<div class="flex flex-wrap items-center gap-2">
							<span class="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700">
								{entry.action}
							</span>
							<span class="text-xs text-gray-500">
								{entry.actorType}{entry.actor ? ` · ${entry.actor}` : ''}
							</span>
						</div>
						<span class="text-xs text-gray-400">{formatDateTime(entry.createdAt)}</span>
					</div>
					{#if entry.entity}
						<p class="mt-1 text-xs text-gray-500">
							{entry.entity}{entry.entityId ? `: ${entry.entityId}` : ''}
						</p>
					{/if}
				</li>
			{/each}
		</ul>

		<div class="flex items-center justify-between">
			<p class="text-xs text-gray-500">Page {meta.page} of {meta.totalPages} · {meta.total} total</p>
			<div class="flex gap-2">
				<Button variant="outline" size="sm" disabled={meta.page <= 1} onclick={() => { page = meta.page - 1; load(); }}>
					<ChevronLeft class="size-4" /> Prev
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={meta.page >= meta.totalPages}
					onclick={() => { page = meta.page + 1; load(); }}
				>
					Next <ChevronRight class="size-4" />
				</Button>
			</div>
		</div>
	{/if}
</div>
