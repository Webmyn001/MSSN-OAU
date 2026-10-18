<script>
	import SEO from '$lib/components/SEO.svelte';
	import { Button } from '$lib/components/ui/button';
	import StatCard from '$lib/components/al-mamharah/StatCard.svelte';
	import Leaderboard from '$lib/components/al-mamharah/Leaderboard.svelte';
	import {
		Loader2,
		Flame,
		Trophy,
		CalendarCheck,
		CheckCircle2,
		Undo2,
		LogOut,
		AlertCircle,
		Target,
		BadgeCheck,
		BookOpen
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import {
		getParticipantToken,
		getParticipantDashboard,
		getParticipantLeaderboard,
		recordToday,
		undoToday,
		logoutParticipant,
		clearParticipantSession,
		AlMamharahError
	} from '$lib/api/al-mamharah.js';
	import {
		masarLabel,
		masarDaily,
		taskLabel,
		formatISODate,
		phaseLabel
	} from '$lib/data/al-mamharah.js';

	let loading = $state(true);
	let signedOut = $state(false);
	let report = $state(/** @type {any} */ (null));
	let leaderboard = $state(/** @type {any} */ (null));
	let error = $state(/** @type {string | null} */ (null));
	let busy = $state(/** @type {string | null} */ (null));
	let note = $state('');

	async function load() {
		const token = getParticipantToken();
		if (!token) {
			signedOut = true;
			loading = false;
			return;
		}
		loading = true;
		error = null;
		try {
			const [dashboard, board] = await Promise.all([
				getParticipantDashboard(token),
				getParticipantLeaderboard(50, token)
			]);
			report = dashboard.data;
			leaderboard = board.data;
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				clearParticipantSession();
				signedOut = true;
			} else {
				error = err instanceof Error ? err.message : 'Unable to load your dashboard.';
			}
		} finally {
			loading = false;
		}
	}

	async function complete(/** @type {string} */ taskType) {
		busy = taskType;
		try {
			const result = await recordToday({ taskType, note: note.trim() || undefined });
			toast.success(result.data?.message ?? "Today's muroja'ah recorded.");
			note = '';
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Could not record your entry.');
		} finally {
			busy = null;
		}
	}

	async function undo(/** @type {string} */ completionId) {
		busy = completionId;
		try {
			await undoToday(completionId);
			toast.success("Today's entry has been removed.");
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Could not undo this entry.');
		} finally {
			busy = null;
		}
	}

	async function logout() {
		try {
			await logoutParticipant();
		} catch {
			clearParticipantSession();
		}
		toast.success('You have been logged out.');
		await goto('/al-mamharah/');
	}

	onMount(() => {
		load();
	});
</script>

<SEO
	title="Al-Mamharah Dashboard"
	description="Record your daily muroja'ah, track your streak and see the Al-Mamharah leaderboard."
	path="/al-mamharah/dashboard/"
/>

<section class="relative min-h-[60vh] overflow-hidden py-10 sm:py-12">
	<div class="absolute -top-24 -right-24 size-96 rounded-full bg-primary-500/10 blur-3xl"></div>
	<div class="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
		{#if loading}
			<div class="flex flex-col items-center justify-center py-24">
				<Loader2 class="size-10 animate-spin text-primary-600" />
				<p class="mt-4 text-sm text-gray-500">Loading your dashboard...</p>
			</div>
		{:else if signedOut}
			<div class="mx-auto max-w-md rounded-xl border border-primary-100 bg-white/90 p-8 text-center shadow-sm">
				<div class="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
					<BookOpen class="size-7" />
				</div>
				<h1 class="mt-4 font-secondary text-xl font-semibold text-primary-800">
					Sign in to Al-Mamharah
				</h1>
				<p class="mt-2 text-sm text-gray-600">
					You need to enter the programme to access your dashboard.
				</p>
				<div class="mt-6">
					<Button href="/al-mamharah/#join" class="w-full">Go to Enter Programme</Button>
				</div>
			</div>
		{:else if error}
			<div class="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
				<AlertCircle class="mx-auto size-8 text-red-500" />
				<p class="mt-3 text-sm text-red-700">{error}</p>
				<div class="mt-4">
					<Button variant="outline" onclick={load}>Try again</Button>
				</div>
			</div>
		{:else if report}
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p class="text-sm text-primary-600">As-salāmu ʿalaykum,</p>
					<h1 class="font-secondary text-2xl font-bold text-primary-800 sm:text-3xl">
						{report.participant.displayName}
					</h1>
					<p class="mt-1 text-sm text-gray-600">
						{masarLabel(report.participant.masar)} · {masarDaily(report.participant.masar)}
					</p>
				</div>
				<div class="flex items-center gap-2">
					<span class="rounded-full border border-primary-100 bg-primary-50/70 px-3 py-1 text-xs text-primary-700">
						{phaseLabel(
							report.today < report.programme.start
								? 'UPCOMING'
								: report.today > report.programme.end
									? 'ENDED'
									: 'ACTIVE'
						)}
					</span>
					<Button variant="outline" size="sm" onclick={logout}>
						<LogOut class="size-4" />
						Log out
					</Button>
				</div>
			</div>

			<p class="mt-2 text-xs text-gray-500">
				Programme window: {formatISODate(report.programme.start)} – {formatISODate(report.programme.end)}
				· Today: {formatISODate(report.today)}
			</p>

			<div class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
				<StatCard label="Current streak" value={report.stats.current} hint="consecutive days" tone="amber" />
				<StatCard label="Longest streak" value={report.stats.longest} hint="personal best" tone="emerald" />
				<StatCard label="Total days" value={report.stats.total} hint="days recorded" tone="primary" />
				<StatCard
					label="Completion"
					value="{Math.round((report.stats.completionRate ?? 0) * 100)}%"
					hint="{report.stats.missedDays} missed"
					tone="slate"
				/>
			</div>

			<div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
				<div class="lg:col-span-3">
					<div class="rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm">
						<div class="flex items-center justify-between">
							<h2 class="flex items-center gap-2 font-secondary text-lg font-semibold text-primary-800">
								<Target class="size-5" />
								Today's task
							</h2>
							<span class="text-xs text-gray-500">{formatISODate(report.today)}</span>
						</div>

						{#if !report.todayEligible}
							<div class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
								Today is not an eligible day for your programme window.
							</div>
						{:else}
							<div class="mt-4 space-y-3">
								{#each report.tasks as task (task.taskType)}
									<div class="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/60 p-3">
										<div class="flex items-center gap-2">
											{#if task.completedToday}
												<CheckCircle2 class="size-5 text-emerald-600" />
											{:else}
												<span class="size-5 rounded-full border-2 border-gray-300"></span>
											{/if}
											<span class="text-sm font-medium text-gray-800">{taskLabel(task.taskType)}</span>
											{#if task.requiredForStreak}
												<span class="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700">Streak</span>
											{/if}
										</div>
										{#if task.completedToday}
											<span class="text-xs font-medium text-emerald-600">Recorded</span>
										{:else}
											<Button size="sm" onclick={() => complete(task.taskType)} disabled={busy === task.taskType}>
												{#if busy === task.taskType}
													<Loader2 class="size-4 animate-spin" />
												{:else}
													<CalendarCheck class="size-4" />
												{/if}
												Record
											</Button>
										{/if}
									</div>
								{/each}

								{#if !report.stats.todayCompleted}
									<div>
										<label class="mb-1 block text-xs font-medium text-gray-500" for="almh-note">
											Optional note (e.g. what you revised)
										</label>
										<input
											id="almh-note"
											type="text"
											maxlength="500"
											class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600"
											bind:value={note}
											placeholder="Optional"
										/>
									</div>
								{/if}
							</div>
						{/if}
					</div>

					<div class="mt-6 rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm">
						<h2 class="font-secondary text-lg font-semibold text-primary-800">Recent activity</h2>
						{#if report.completions.length === 0}
							<p class="mt-3 text-sm text-gray-500">No entries yet — record today's muroja'ah to begin your streak.</p>
						{:else}
							<ul class="mt-3 divide-y divide-gray-100">
								{#each report.completions as completion (completion.id)}
									<li class="flex items-center justify-between gap-3 py-2.5">
										<div class="min-w-0">
											<div class="flex items-center gap-2">
												<span class="text-sm font-medium text-gray-800">{formatISODate(completion.date)}</span>
												<span class="text-xs text-gray-500">{taskLabel(completion.taskType)}</span>
												{#if completion.verified}
													<span class="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase text-emerald-600">
														<BadgeCheck class="size-3" />verified
													</span>
												{/if}
											</div>
											{#if completion.note}
												<p class="truncate text-xs text-gray-500">{completion.note}</p>
											{/if}
										</div>
										{#if completion.date === report.today}
											<Button
												variant="ghost"
												size="sm"
												onclick={() => undo(completion.id)}
												disabled={busy === completion.id}
											>
												{#if busy === completion.id}
													<Loader2 class="size-4 animate-spin" />
												{:else}
													<Undo2 class="size-4" />
												{/if}
												Undo
											</Button>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</div>

				<div class="lg:col-span-2">
					<div class="rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm">
						<h2 class="flex items-center gap-2 font-secondary text-lg font-semibold text-primary-800">
							<Trophy class="size-5 text-amber-500" />
							Leaderboard
						</h2>
						<p class="mb-2 mt-1 text-xs text-gray-500">
							{leaderboard?.totalParticipants ?? 0} active participants
						</p>
						<Leaderboard
							entries={leaderboard?.entries ?? []}
							selfId={report.participant.id}
							emptyText="No rankings yet."
						/>
						{#if leaderboard?.self && leaderboard.self.rank > (leaderboard.entries?.length ?? 0)}
							<div class="mt-4 border-t border-gray-100 pt-3">
								<p class="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
									<Flame class="size-3.5 text-orange-500" /> Your position
								</p>
								<Leaderboard entries={[leaderboard.self]} selfId={report.participant.id} />
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
</section>
