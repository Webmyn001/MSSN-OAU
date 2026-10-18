<script>
	import StatCard from '$lib/components/al-mamharah/StatCard.svelte';
	import { onMount } from 'svelte';
	import { Loader2, AlertCircle, CalendarDays } from '@lucide/svelte';
	import { getOverview, AlMamharahError } from '$lib/api/al-mamharah.js';
	import { formatISODate } from '$lib/data/al-mamharah.js';
	import { toast } from 'svelte-sonner';

	/** @type {{ token: string, onExpired: () => void }} */
	let { token, onExpired } = $props();

	let loading = $state(true);
	let error = $state(/** @type {string | null} */ (null));
	let data = $state(/** @type {any} */ (null));

	async function load() {
		loading = true;
		error = null;
		try {
			const result = await getOverview(token);
			data = result.data;
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			error = err instanceof Error ? err.message : 'Unable to load overview.';
			toast.error(error);
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
		<AlertCircle class="size-4" />
		<p>{error}</p>
	</div>
{:else if data}
	<div class="space-y-6">
		<div class="rounded-xl border border-primary-100 bg-white/90 p-4 shadow-sm">
			<div class="flex items-center gap-2 text-sm text-primary-700">
				<CalendarDays class="size-4" />
				<span>
					Programme window: {formatISODate(data.programme.start)} – {formatISODate(data.programme.end)}
				</span>
			</div>
		</div>

		<div>
			<h3 class="mb-3 font-secondary text-sm font-semibold uppercase tracking-wide text-gray-500">Applications</h3>
			<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<StatCard label="Total" value={data.applications.total} tone="primary" />
				<StatCard label="Pending" value={data.applications.pending} tone="amber" />
				<StatCard label="Approved" value={data.applications.approved} tone="emerald" />
				<StatCard label="Rejected" value={data.applications.rejected} tone="rose" />
			</div>
		</div>

		<div>
			<h3 class="mb-3 font-secondary text-sm font-semibold uppercase tracking-wide text-gray-500">Participants</h3>
			<div class="grid grid-cols-3 gap-4">
				<StatCard label="Total" value={data.participants.total} tone="primary" />
				<StatCard label="Active" value={data.participants.active} tone="emerald" />
				<StatCard label="Suspended" value={data.participants.suspended} tone="rose" />
			</div>
		</div>

		<div>
			<h3 class="mb-3 font-secondary text-sm font-semibold uppercase tracking-wide text-gray-500">
				Today · {formatISODate(data.today.date)}
			</h3>
			<div class="grid grid-cols-3 gap-4">
				<StatCard label="Expected" value={data.today.total} tone="slate" />
				<StatCard label="Completed" value={data.today.completed} tone="emerald" />
				<StatCard label="Not yet" value={data.today.notCompleted} tone="amber" />
			</div>
		</div>

		<div>
			<h3 class="mb-3 font-secondary text-sm font-semibold uppercase tracking-wide text-gray-500">Managers</h3>
			<div class="grid grid-cols-3 gap-4">
				<StatCard label="Total" value={data.managers.total} tone="primary" />
				<StatCard label="Active" value={data.managers.active} tone="emerald" />
				<StatCard label="Pending" value={data.managers.pending} tone="amber" />
			</div>
		</div>
	</div>
{/if}
