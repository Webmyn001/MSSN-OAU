<script>
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import { Loader2, AlertCircle, Check, X, ChevronLeft, ChevronRight, Search, Download } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import {
		listApplications,
		approveApplication,
		rejectApplication,
		fetchCsv,
		AlMamharahError
	} from '$lib/api/al-mamharah.js';
	import {
		masarLabel,
		formatISODate,
		formatDateTime,
		applicationStatusLabel
	} from '$lib/data/al-mamharah.js';

	/** @type {{ token: string, onExpired: () => void }} */
	let { token, onExpired } = $props();

	let loading = $state(true);
	let error = $state(/** @type {string | null} */ (null));
	let items = $state(/** @type {any[]} */ ([]));
	let meta = $state(/** @type {any} */ ({ page: 1, total: 0, totalPages: 1 }));
	let page = $state(1);
	let status = $state('');
	let search = $state('');
	let action = $state(/** @type {{ id: string, type: 'approve' | 'reject' } | null} */ (null));
	let actionStart = $state('');
	let actionNotes = $state('');
	let acting = $state(false);

	async function load() {
		loading = true;
		error = null;
		try {
			const result = await listApplications({ page, limit: 20, status, search }, token);
			items = result.data ?? [];
			meta = result.meta?.pagination ?? { page: 1, total: 0, totalPages: 1 };
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			error = err instanceof Error ? err.message : 'Unable to load applications.';
		} finally {
			loading = false;
		}
	}

	function applyFilters() {
		page = 1;
		load();
	}

	function openAction(/** @type {string} */ id, /** @type {'approve' | 'reject'} */ type) {
		action = { id, type };
		actionStart = '';
		actionNotes = '';
	}

	async function confirmAction() {
		if (!action) return;
		acting = true;
		try {
			if (action.type === 'approve') {
				await approveApplication(
					action.id,
					actionStart ? { startDate: actionStart } : {},
					token
				);
				toast.success('Application approved.');
			} else {
				await rejectApplication(action.id, actionNotes ? { notes: actionNotes } : {}, token);
				toast.success('Application rejected.');
			}
			action = null;
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Action failed.');
		} finally {
			acting = false;
		}
	}

	async function exportCsv() {
		try {
			const response = await fetchCsv('applications', token);
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'al-mamharah-applications.csv';
			a.click();
			URL.revokeObjectURL(url);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Download failed.');
		}
	}

	const selectClass =
		'rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600';

	onMount(() => {
		load();
	});
</script>

<div class="space-y-4">
	<div class="flex flex-wrap items-center gap-3">
		<select class={selectClass} bind:value={status} onchange={applyFilters}>
			<option value="">All statuses</option>
			<option value="PENDING">Pending</option>
			<option value="APPROVED">Approved</option>
			<option value="REJECTED">Rejected</option>
		</select>
		<div class="relative flex-1 min-w-[200px]">
			<Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
			<input
				type="search"
				class="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary-600 focus:ring-primary-600"
				placeholder="Search name, email, matric, faculty..."
				bind:value={search}
				onchange={applyFilters}
			/>
		</div>
		<Button variant="outline" size="sm" onclick={exportCsv}>
			<Download class="size-4" />
			CSV
		</Button>
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
		<p class="py-16 text-center text-sm text-gray-500">No applications found.</p>
	{:else}
		<ul class="space-y-3">
			{#each items as item (item.id)}
				<li class="rounded-xl border border-primary-100 bg-white/90 p-4 shadow-sm">
					<div class="flex flex-wrap items-start justify-between gap-3">
						<div class="min-w-0">
							<div class="flex flex-wrap items-center gap-2">
								<h3 class="font-secondary text-base font-semibold text-gray-800">{item.fullName}</h3>
								<span
									class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide {item.status ===
									'PENDING'
										? 'bg-amber-100 text-amber-700'
										: item.status === 'APPROVED'
											? 'bg-emerald-100 text-emerald-700'
											: 'bg-rose-100 text-rose-700'}"
								>
									{applicationStatusLabel(item.status)}
								</span>
							</div>
							<p class="mt-1 text-sm text-gray-600">
								{item.email}
								{#if item.phone}· {item.phone}{/if}
							</p>
							<p class="text-sm text-gray-600">
								{item.matricNumber} · {item.department}, {item.faculty}
							</p>
							<p class="mt-1 text-xs text-primary-600">{masarLabel(item.masar)}</p>
							<p class="mt-1 text-xs text-gray-400">
								Submitted {formatDateTime(item.createdAt)}
								{#if item.reviewedBy}· Reviewed by {item.reviewedBy} ({formatDateTime(item.reviewedAt)}){/if}
							</p>
							{#if item.reviewNotes}
								<p class="mt-1 text-xs text-gray-500">Note: {item.reviewNotes}</p>
							{/if}
						</div>

						{#if item.status === 'PENDING'}
							<div class="flex shrink-0 gap-2">
								<Button size="sm" onclick={() => openAction(item.id, 'approve')}>
									<Check class="size-4" /> Approve
								</Button>
								<Button variant="outline" size="sm" onclick={() => openAction(item.id, 'reject')}>
									<X class="size-4" /> Reject
								</Button>
							</div>
						{/if}
					</div>

					{#if action && action.id === item.id}
						<div class="mt-4 rounded-lg border border-primary-100 bg-primary-50/40 p-4">
							{#if action.type === 'approve'}
								<label class="block text-sm font-medium text-gray-700" for="almh-start-{item.id}">
									Start date (optional — defaults to the programme start)
								</label>
								<input
									id="almh-start-{item.id}"
									type="date"
									class="mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600"
									bind:value={actionStart}
								/>
							{:else}
								<label class="block text-sm font-medium text-gray-700" for="almh-notes-{item.id}">
									Reason / notes (optional)
								</label>
								<textarea
									id="almh-notes-{item.id}"
									rows="2"
									class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600"
									bind:value={actionNotes}
									placeholder="Shared with the applicant in follow-up."
								></textarea>
							{/if}
							<div class="mt-3 flex gap-2">
								<Button size="sm" onclick={confirmAction} disabled={acting}>
									{#if acting}<Loader2 class="size-4 animate-spin" />{/if}
									Confirm {action.type === 'approve' ? 'approval' : 'rejection'}
								</Button>
								<Button variant="ghost" size="sm" onclick={() => { action = null; }}>Cancel</Button>
							</div>
						</div>
					{/if}
				</li>
			{/each}
		</ul>

		<div class="flex items-center justify-between">
			<p class="text-xs text-gray-500">
				Page {meta.page} of {meta.totalPages} · {meta.total} total
			</p>
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
