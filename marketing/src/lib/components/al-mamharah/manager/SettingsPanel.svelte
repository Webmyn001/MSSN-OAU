<script>
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import { Loader2, AlertCircle, Save, CheckCircle2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { getSettings, updateSettings, AlMamharahError } from '$lib/api/al-mamharah.js';
	import { TASK_LABELS } from '$lib/data/al-mamharah.js';

	/** @type {{ token: string, onExpired: () => void, onSaved?: (s: any) => void }} */
	let { token, onExpired, onSaved } = $props();

	const TASKS = /** @type {Array<'MUROJAAH' | 'TAJWEED_QIRAAT'>} */ (['MUROJAAH', 'TAJWEED_QIRAAT']);

	let loading = $state(true);
	let error = $state(/** @type {string | null} */ (null));
	let saving = $state(false);
	let saved = $state(false);
	let start = $state('');
	let end = $state('');
	let timezone = $state('');
	let tasks = $state(/** @type {string[]} */ ([]));
	let streakTasks = $state(/** @type {string[]} */ ([]));

	async function load() {
		loading = true;
		error = null;
		try {
			const result = await getSettings(token);
			const s = result.data;
			start = s.start;
			end = s.end;
			timezone = s.timezone;
			tasks = [...s.tasks];
			streakTasks = [...s.streakTasks];
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			error = err instanceof Error ? err.message : 'Unable to load settings.';
		} finally {
			loading = false;
		}
	}

	/**
	 * @param {string[]} list
	 * @param {string} value
	 * @param {boolean} checked
	 */
	function toggleTask(list, value, checked) {
		if (checked) {
			if (!list.includes(value)) list.push(value);
		} else {
			const idx = list.indexOf(value);
			if (idx >= 0) list.splice(idx, 1);
		}
	}

	async function save() {
		if (tasks.length === 0) {
			toast.error('Select at least one task.');
			return;
		}
		saving = true;
		saved = false;
		try {
			const result = await updateSettings(
				{ start, end, timezone: timezone.trim(), tasks, streakTasks },
				token
			);
			toast.success('Settings saved.');
			saved = true;
			onSaved?.(result.data);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Could not save settings.');
		} finally {
			saving = false;
		}
	}

	const inputClass =
		'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600';

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
{:else}
	<div class="max-w-2xl space-y-6 rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm">
		<div>
			<h3 class="font-secondary text-base font-semibold text-gray-800">Programme window</h3>
			<div class="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label class="mb-1 block text-xs font-medium text-gray-600" for="set-start">Start date</label>
					<input id="set-start" type="date" class={inputClass} bind:value={start} />
				</div>
				<div>
					<label class="mb-1 block text-xs font-medium text-gray-600" for="set-end">End date</label>
					<input id="set-end" type="date" class={inputClass} bind:value={end} />
				</div>
			</div>
			<div class="mt-4">
				<label class="mb-1 block text-xs font-medium text-gray-600" for="set-tz">Timezone (IANA)</label>
				<input id="set-tz" type="text" class={inputClass} bind:value={timezone} placeholder="Africa/Lagos" />
			</div>
		</div>

		<div>
			<h3 class="font-secondary text-base font-semibold text-gray-800">Daily tasks</h3>
			<p class="mt-1 text-xs text-gray-500">Tasks participants can record each day.</p>
			<div class="mt-3 space-y-2">
				{#each TASKS as task (task)}
					<label class="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
						<input
							type="checkbox"
							class="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
							checked={tasks.includes(task)}
							onchange={(e) => toggleTask(tasks, task, /** @type {HTMLInputElement} */ (e.currentTarget).checked)}
						/>
						{TASK_LABELS[task]}
					</label>
				{/each}
			</div>
		</div>

		<div>
			<h3 class="font-secondary text-base font-semibold text-gray-800">Streak tasks</h3>
			<p class="mt-1 text-xs text-gray-500">
				Tasks that must be completed for a day to count toward the streak.
			</p>
			<div class="mt-3 space-y-2">
				{#each TASKS.filter((t) => tasks.includes(t)) as task (task)}
					<label class="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
						<input
							type="checkbox"
							class="size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
							checked={streakTasks.includes(task)}
							onchange={(e) => toggleTask(streakTasks, task, /** @type {HTMLInputElement} */ (e.currentTarget).checked)}
						/>
						{TASK_LABELS[task]}
					</label>
				{/each}
			</div>
		</div>

		<div class="flex items-center gap-3">
			<Button onclick={save} disabled={saving}>
				{#if saving}<Loader2 class="size-4 animate-spin" />{:else}<Save class="size-4" />{/if}
				Save settings
			</Button>
			{#if saved}
				<span class="inline-flex items-center gap-1 text-sm text-emerald-600">
					<CheckCircle2 class="size-4" /> Saved
				</span>
			{/if}
		</div>
	</div>
{/if}
