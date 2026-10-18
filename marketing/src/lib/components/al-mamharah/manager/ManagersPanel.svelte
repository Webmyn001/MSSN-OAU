<script>
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import { Loader2, AlertCircle, UserPlus, Send, UserX, Copy, ShieldAlert } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import {
		listManagers,
		inviteManager,
		resendManagerInvite,
		revokeManager,
		AlMamharahError
	} from '$lib/api/al-mamharah.js';
	import {
		managerStatusLabel,
		managerRoleLabel,
		formatDateTime
	} from '$lib/data/al-mamharah.js';

	/** @type {{ token: string, onExpired: () => void }} */
	let { token, onExpired } = $props();

	let loading = $state(true);
	let error = $state(/** @type {string | null} */ (null));
	let managers = $state(/** @type {any[]} */ ([]));
	let inviteEmail = $state('');
	let inviteName = $state('');
	let inviting = $state(false);
	let acting = $state(/** @type {string | null} */ (null));
	let lastLink = $state(/** @type {string | null} */ (null));

	async function load() {
		loading = true;
		error = null;
		try {
			const result = await listManagers(token);
			managers = result.data ?? [];
		} catch (err) {
			if (err instanceof AlMamharahError && (err.status === 401 || err.status === 403)) {
				onExpired();
				return;
			}
			error = err instanceof Error ? err.message : 'Unable to load managers.';
		} finally {
			loading = false;
		}
	}

	async function invite(/** @type {SubmitEvent} */ event) {
		event.preventDefault();
		inviting = true;
		try {
			const result = await inviteManager(
				{ email: inviteEmail.trim(), fullName: inviteName.trim() || undefined },
				token
			);
			lastLink = result.data?.activationLink ?? null;
			toast.success('Invitation sent.');
			inviteEmail = '';
			inviteName = '';
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Could not send the invitation.');
		} finally {
			inviting = false;
		}
	}

	async function resend(/** @type {any} */ manager) {
		acting = manager.id;
		try {
			const result = await resendManagerInvite(manager.id, token);
			lastLink = result.data?.activationLink ?? null;
			toast.success('Invitation re-sent.');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Could not resend the invitation.');
		} finally {
			acting = null;
		}
	}

	async function revoke(/** @type {any} */ manager) {
		acting = manager.id;
		try {
			await revokeManager(manager.id, token);
			toast.success('Manager access revoked.');
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Could not revoke this manager.');
		} finally {
			acting = null;
		}
	}

	async function copyLink() {
		if (!lastLink) return;
		try {
			await navigator.clipboard.writeText(lastLink);
			toast.success('Activation link copied.');
		} catch {
			toast.error('Could not copy the link.');
		}
	}

	onMount(() => {
		load();
	});
</script>

<div class="space-y-6">
	<div class="rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm">
		<h3 class="flex items-center gap-2 font-secondary text-base font-semibold text-gray-800">
			<UserPlus class="size-4 text-primary-600" /> Invite a manager
		</h3>
		<p class="mt-1 text-xs text-gray-500">
			Only the primary manager can invite, resend or revoke manager access.
		</p>
		<form onsubmit={invite} class="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
			<input
				type="email"
				required
				class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600"
				placeholder="manager@example.com"
				bind:value={inviteEmail}
			/>
			<input
				type="text"
				class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-600 focus:ring-primary-600"
				placeholder="Full name (optional)"
				bind:value={inviteName}
			/>
			<Button type="submit" disabled={inviting}>
				{#if inviting}<Loader2 class="size-4 animate-spin" />{/if}
				Invite
			</Button>
		</form>

		{#if lastLink}
			<div class="mt-3 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3">
				<p class="text-xs font-medium text-amber-800">Development activation link</p>
				<div class="mt-1 flex items-center gap-2">
					<code class="min-w-0 flex-1 truncate rounded bg-white px-2 py-1 text-xs text-gray-700">{lastLink}</code>
					<Button variant="outline" size="sm" onclick={copyLink}>
						<Copy class="size-3.5" /> Copy
					</Button>
				</div>
				<p class="mt-1 text-[11px] text-amber-700">Never shown in production — it is emailed instead.</p>
			</div>
		{/if}
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<Loader2 class="size-8 animate-spin text-primary-600" />
		</div>
	{:else if error}
		<div class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
			<AlertCircle class="size-4" /><p>{error}</p>
		</div>
	{:else}
		<ul class="space-y-3">
			{#each managers as manager (manager.id)}
				<li class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-100 bg-white/90 p-4 shadow-sm">
					<div>
						<div class="flex flex-wrap items-center gap-2">
							<span class="font-medium text-gray-800">{manager.fullName || manager.email}</span>
							<span class="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700">
								{managerRoleLabel(manager.role)}
							</span>
							<span
								class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide {manager.status ===
								'ACTIVE'
									? 'bg-emerald-100 text-emerald-700'
									: manager.status === 'PENDING'
										? 'bg-amber-100 text-amber-700'
										: 'bg-rose-100 text-rose-700'}"
							>
								{managerStatusLabel(manager.status)}
							</span>
						</div>
						{#if manager.fullName}
							<p class="mt-1 text-sm text-gray-600">{manager.email}</p>
						{/if}
						<p class="mt-0.5 text-xs text-gray-400">Added {formatDateTime(manager.createdAt)}</p>
					</div>
					<div class="flex gap-2">
						{#if manager.status === 'PENDING'}
							<Button variant="outline" size="sm" onclick={() => resend(manager)} disabled={acting === manager.id}>
								{#if acting === manager.id}<Loader2 class="size-4 animate-spin" />{:else}<Send class="size-4" />{/if}
								Resend
							</Button>
						{/if}
						{#if manager.status !== 'REVOKED'}
							<Button variant="outline" size="sm" onclick={() => revoke(manager)} disabled={acting === manager.id}>
								<UserX class="size-4" /> Revoke
							</Button>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
		{#if managers.length > 0 && !managers.some((m) => m.role === 'PRIMARY')}
			<p class="flex items-center gap-1.5 text-xs text-amber-600">
				<ShieldAlert class="size-3.5" /> No primary manager found.
			</p>
		{/if}
	{/if}
</div>
