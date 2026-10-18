<script>
	import Leaderboard from '$lib/components/al-mamharah/Leaderboard.svelte';
	import { onMount } from 'svelte';
	import { Loader2, AlertCircle } from '@lucide/svelte';
	import { getManagerLeaderboard, AlMamharahError } from '$lib/api/al-mamharah.js';

	/** @type {{ token: string, onExpired: () => void }} */
	let { token, onExpired } = $props();

	let loading = $state(true);
	let error = $state(/** @type {string | null} */ (null));
	let data = $state(/** @type {any} */ (null));

	async function load() {
		loading = true;
		error = null;
		try {
			const result = await getManagerLeaderboard(token);
			data = result.data;
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			error = err instanceof Error ? err.message : 'Unable to load the leaderboard.';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		load();
	});
</script>

{#if loading}
	<div class="flex justify-center py-16">
		<Loader2 class="size-8 animate-spin text-primary-600" />
	</div>
{:else if error}
	<div class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
		<AlertCircle class="size-4" /><p>{error}</p>
	</div>
{:else if data}
	<div class="rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm">
		<p class="mb-3 text-sm text-gray-500">
			{data.totalParticipants} active participants · {data.today}
		</p>
		<Leaderboard entries={data.entries ?? []} emptyText="No rankings yet." />
	</div>
{/if}
