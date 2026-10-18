<script>
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import {
		Loader2,
		AlertCircle,
		Search,
		ChevronLeft,
		ChevronRight,
		UserX,
		UserCheck,
		ChevronDown,
		Download,
		Plus,
		BadgeCheck
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import {
		listParticipants,
		getParticipantDetail,
		setParticipantStatus,
		backfillCompletion,
		fetchCsv,
		AlMamharahError
	} from '$lib/api/al-mamharah.js';
	import {
		MASAR_OPTIONS,
		masarLabel,
		taskLabel,
		formatISODate,
		participantStatusLabel
	} from '$lib/data/al-mamharah.js';

	/** @type {{ token: string, onExpired: () => void }} */
	let { token, onExpired } = $props();

	let loading = $state(true);
	let error = $state(/** @type {string | null} */ (null));
	let items = $state(/** @type {any[]} */ ([]));
	let meta = $state(/** @type {any} */ ({ page: 1, total: 0, totalPages: 1 }));
	let page = $state(1);
	let status = $state('');
	let masar = $state('');
	let search = $state('');

	let openId = $state(/** @type {string | null} */ (null));
	let detail = $state(/** @type {any} */ (null));
	let detailLoading = $state(false);
	let acting = $state(/** @type {string | null} */ (null));

	let bfDate = $state('');
	let bfTask = $state('MUROJAAH');
	let bfNote = $state('');
	let bfBusy = $state(false);

	async function load() {
		loading = true;
		error = null;
		try {
			const result = await listParticipants({ page, limit: 20, status, masar, search }, token);
			items = result.data ?? [];
			meta = result.meta?.pagination ?? { page: 1, total: 0, totalPages: 1 };
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			error = err instanceof Error ? err.message : 'Unable to load participants.';
		} finally {
			loading = false;
		}
	}

	function applyFilters() {
		page = 1;
		load();
	}

	async function toggleDetail(/** @type {string} */ id) {
		if (openId === id) {
			openId = null;
			detail = null;
			return;
		}
		openId = id;
		detail = null;
		detailLoading = true;
		bfDate = '';
		bfTask = 'MUROJAAH';
		bfNote = '';
		try {
			const result = await getParticipantDetail(id, token);
			detail = result.data;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Unable to load details.');
			openId = null;
		} finally {
			detailLoading = false;
		}
	}

	async function toggleStatus(/** @type {any} */ participant) {
		const next = participant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
		acting = participant.id;
		try {
			await setParticipantStatus(participant.id, next, undefined, token);
			toast.success(next === 'SUSPENDED' ? 'Participant suspended.' : 'Participant re-activated.');
			await load();
			if (openId === participant.id) await refreshDetail(participant.id);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Action failed.');
		} finally {
			acting = null;
		}
	}

	async function submitBackfill(/** @type {string} */ participantId) {
		if (!bfDate) {
			toast.error('Choose a date to record.');
			return;
		}
		bfBusy = true;
		try {
			await backfillCompletion(
				{
					participantId,
					date: bfDate,
					taskType: bfTask,
					verified: true,
					note: bfNote.trim() || undefined
				},
				token
			);
			toast.success('Completion recorded.');
			bfDate = '';
			bfNote = '';
			await load();
			await refreshDetail(participantId);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Could not record completion.');
		} finally {
			bfBusy = false;
		}
	}

	async function refreshDetail(/** @type {string} */ id) {
		detailLoading = true;
		try {
			const result = await getParticipantDetail(id, token);
			detail = result.data;
		} catch {
			/* ignore */
		} finally {
			detailLoading = false;
		}
	}

	async function exportCsv() {
		try {
			const response = await fetchCsv('participants', token);
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'al-mamharah-participants.csv';
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
			<option value="ACTIVE">Active</option>
			<option value="SUSPENDED">Suspended</option>
		</select>
		<select class={selectClass} bind:value={masar} onchange={applyFilters}>
			<option value="">All masār</option>
			{#each MASAR_OPTIONS as option (option.value)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
		<div class="relative min-w-[200px] flex-1">
			<Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
			<input
				type="search"
				class="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary-600 focus:ring-primary-600"
				placeholder="Search name, email, matric..."
				bind:value={search}
				onchange={applyFilters}
			/>
		</div>
		<Button variant="outline" size="sm" onclick={exportCsv}>
			<Download class="size-4" /> CSV
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
		<p class="py-16 text-center text-sm text-gray-500">No participants found.</p>
	{:else}
		<ul class="space-y-3">
			{#each items as p (p.id)}
				<li class="rounded-xl border border-primary-100 bg-white/90 p-4 shadow-sm">
					<div class="flex flex-wrap items-start justify-between gap-3">
						<div class="min-w-0">
							<div class="flex flex-wrap items-center gap-2">
								<h3 class="font-secondary text-base font-semibold text-gray-800">{p.displayName}</h3>
								<span
									class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide {p.status ===
									'ACTIVE'
										? 'bg-emerald-100 text-emerald-700'
										: 'bg-rose-100 text-rose-700'}"
								>
									{participantStatusLabel(p.status)}
								</span>
								{#if p.stats.todayCompleted}
									<span class="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-orange-700">
										<BadgeCheck class="size-3" />today
									</span>
								{/if}
							</div>
							<p class="mt-1 text-sm text-gray-600">
								{p.application.matricNumber} · {p.application.department}, {p.application.faculty}
							</p>
							<p class="text-xs text-primary-600">
								{masarLabel(p.masar)} · started {formatISODate(p.startDate)}
							</p>
							<div class="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
								<span>Current: <b class="text-primary-700">{p.stats.current}</b></span>
								<span>Longest: <b class="text-gray-700">{p.stats.longest}</b></span>
								<span>Total: <b class="text-gray-700">{p.stats.total}</b></span>
								<span>Missed: <b class="text-gray-700">{p.stats.missedDays}</b></span>
							</div>
						</div>
						<div class="flex shrink-0 gap-2">
							<Button variant="outline" size="sm" onclick={() => toggleDetail(p.id)}>
								<ChevronDown class="size-4 transition-transform {openId === p.id ? 'rotate-180' : ''}" />
								Details
							</Button>
							<Button
								variant={p.status === 'ACTIVE' ? 'outline' : 'default'}
								size="sm"
								onclick={() => toggleStatus(p)}
								disabled={acting === p.id}
							>
								{#if acting === p.id}
									<Loader2 class="size-4 animate-spin" />
								{:else if p.status === 'ACTIVE'}
									<UserX class="size-4" />
								{:else}
									<UserCheck class="size-4" />
								{/if}
								{p.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
							</Button>
						</div>
					</div>

					{#if openId === p.id}
						<div class="mt-4 border-t border-gray-100 pt-4">
							{#if detailLoading}
								<div class="flex justify-center py-6">
									<Loader2 class="size-6 animate-spin text-primary-500" />
								</div>
							{:else if detail}
								<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
									<div>
										<h4 class="mb-2 text-sm font-semibold text-gray-700">Recent activity</h4>
										{#if detail.recentCompletions.length === 0}
											<p class="text-sm text-gray-500">No completions recorded.</p>
										{:else}
											<ul class="max-h-64 space-y-1.5 overflow-y-auto pr-1">
												{#each detail.recentCompletions as c (c.date + c.taskType)}
													<li class="flex items-center justify-between rounded-md bg-gray-50 px-3 py-1.5 text-xs">
														<span class="text-gray-700">{formatISODate(c.date)}</span>
														<span class="text-gray-500">{taskLabel(c.taskType)}</span>
														{#if c.verified}
															<span class="font-semibold uppercase text-emerald-600">verified</span>
														{/if}
													</li>
												{/each}
											</ul>
										{/if}
									</div>
									<div class="rounded-lg border border-primary-100 bg-primary-50/40 p-4">
										<h4 class="mb-3 text-sm font-semibold text-gray-700">Record a completion</h4>
										<div class="grid gap-3">
											<div>
												<label class="mb-1 block text-xs font-medium text-gray-600" for="bf-date-{p.id}">Date</label>
												<input
													id="bf-date-{p.id}"
													type="date"
													class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600"
													bind:value={bfDate}
												/>
											</div>
											<div>
												<label class="mb-1 block text-xs font-medium text-gray-600" for="bf-task-{p.id}">Task</label>
												<select
													id="bf-task-{p.id}"
													class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600"
													bind:value={bfTask}
												>
													<option value="MUROJAAH">Muroja'ah</option>
													<option value="TAJWEED_QIRAAT">Tajwīd & Qirāʼah</option>
												</select>
											</div>
											<div>
												<label class="mb-1 block text-xs font-medium text-gray-600" for="bf-note-{p.id}">Note</label>
												<input
													id="bf-note-{p.id}"
													type="text"
													maxlength="500"
													class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600"
													bind:value={bfNote}
													placeholder="Optional"
												/>
											</div>
											<Button size="sm" onclick={() => submitBackfill(p.id)} disabled={bfBusy}>
												{#if bfBusy}<Loader2 class="size-4 animate-spin" />{:else}<Plus class="size-4" />{/if}
												Record
											</Button>
										</div>
									</div>
								</div>
							{/if}
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
