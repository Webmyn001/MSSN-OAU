<script lang="ts">
	import { onMount } from 'svelte';
	import { authFetch, getStoredUser } from '$lib/stores/authStore';
	import { toast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { ShieldCheck, UserPlus, Trash2, Loader2, KeyRound, Users } from '@lucide/svelte';

	let admins = $state<string[]>([]);
	let loading = $state(true);
	let newEmail = $state('');
	let adding = $state(false);
	let removingEmail = $state<string | null>(null);

	let confirmState = $state<{
		open: boolean;
		title: string;
		message: string;
		action: () => Promise<void>;
	} | null>(null);

	const currentUser = $derived(getStoredUser());

	onMount(async () => {
		await loadAdmins();
	});

	async function loadAdmins() {
		loading = true;
		try {
			const res = await authFetch('/admin-auth/admins');
			const data = await res.json();
			if (data.success) {
				admins = data.data.admins;
			} else {
				toast('error', data.error || 'Could not load admins.');
			}
		} catch {
			toast('error', 'Cannot reach server.');
		} finally {
			loading = false;
		}
	}

	async function addAdmin() {
		const email = newEmail.trim();
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			toast('error', 'Enter a valid email address.');
			return;
		}
		adding = true;
		try {
			const res = await authFetch('/admin-auth/admins', {
				method: 'POST',
				body: JSON.stringify({ email })
			});
			const data = await res.json();
			if (data.success) {
				newEmail = '';
				await loadAdmins();
				toast('success', `Added ${data.data.email} as admin.`);
			} else {
				toast('error', data.error || 'Could not add admin.');
			}
		} catch {
			toast('error', 'Cannot reach server.');
		} finally {
			adding = false;
		}
	}

	function requestRemove(email: string) {
		confirmState = {
			open: true,
			title: 'Remove Admin?',
			message: `Remove "${email}" from dashboard admins? They will no longer be able to sign in.`,
			action: () => removeAdmin(email)
		};
	}

	async function removeAdmin(email: string) {
		removingEmail = email;
		try {
			const res = await authFetch(`/admin-auth/admins/${encodeURIComponent(email)}`, {
				method: 'DELETE'
			});
			const data = await res.json();
			if (data.success) {
				await loadAdmins();
				toast('success', `Removed ${email} from admins.`);
			} else {
				toast('error', data.error || 'Could not remove admin.');
			}
		} catch {
			toast('error', 'Cannot reach server.');
		} finally {
			removingEmail = null;
		}
	}

	function isBuiltIn(email: string) {
		return email === 'bellomuhyideen0001@gmail.com' || email === 'abdmuizzyekeen@gmail.com' || email === 'amaofareed11@gmail.com';
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
		<div>
			<h2 class="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
				<Users class="w-7 h-7 text-green-700" />
				Admin Management
			</h2>
			<p class="text-xs sm:text-sm text-gray-600 mt-1">Add or remove dashboard admins. All admins share the same password.</p>
		</div>
	</div>

	<div class="bg-white border border-green-100 rounded-2xl p-5 shadow-sm space-y-4">
		<div>
			<h3 class="text-sm font-bold text-green-950 flex items-center gap-2 mb-1">
				<UserPlus class="w-4 h-4 text-green-700" />
				Add a New Admin
			</h3>
			<p class="text-[11px] text-gray-500 mb-3">Enter an email address to grant dashboard access. They sign in with the shared admin password.</p>
		</div>
		<div class="flex flex-col sm:flex-row gap-3">
			<input
				type="email"
				placeholder="newadmin@example.com"
				bind:value={newEmail}
				onkeydown={(e) => { if (e.key === 'Enter') addAdmin(); }}
				class="flex-1 bg-green-50/50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-950 focus:outline-none focus:ring-2 focus:ring-green-600"
			/>
			<button
				onclick={addAdmin}
				disabled={adding}
				class="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all"
			>
				{#if adding}
					<Loader2 class="w-4 h-4 animate-spin" />
					<span>Adding...</span>
				{:else}
					<UserPlus class="w-4 h-4" />
					<span>Add Admin</span>
				{/if}
			</button>
		</div>
	</div>

	<div class="bg-white border border-green-100 rounded-2xl p-5 shadow-sm">
		<h3 class="text-sm font-bold text-green-950 flex items-center gap-2 mb-1">
			<ShieldCheck class="w-4 h-4 text-green-700" />
			Current Admins
		</h3>
		<p class="text-[11px] text-gray-500 mb-4">All share one password. Built-in admins cannot be removed.</p>

		{#if loading}
			<div class="flex items-center justify-center gap-2 py-10 text-gray-400">
				<Loader2 class="w-5 h-5 animate-spin" />
				<span class="text-xs">Loading admins...</span>
			</div>
		{:else if admins.length === 0}
			<div class="py-10 text-center text-gray-400 text-xs">No admins found.</div>
		{:else}
			<ul class="divide-y divide-gray-100">
				{#each admins as email}
					<li class="flex items-center justify-between gap-3 py-3">
						<div class="flex items-center gap-3 min-w-0">
							<div class="w-9 h-9 rounded-full bg-green-50 text-green-700 flex items-center justify-center shrink-0">
								<KeyRound class="w-4 h-4" />
							</div>
							<div class="min-w-0">
								<p class="text-sm font-semibold text-green-950 truncate">{email}</p>
								<p class="text-[11px] text-gray-400">
									{#if email === currentUser?.email}
										<span class="text-green-700 font-semibold">You</span>
									{/if}
									{#if isBuiltIn(email)}
										Built-in admin
									{:else}
										Added via dashboard
									{/if}
								</p>
							</div>
						</div>
						{#if !isBuiltIn(email)}
							<button
								onclick={() => requestRemove(email)}
								disabled={removingEmail === email}
								class="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
								title="Remove admin"
								aria-label={`Remove ${email}`}
							>
								{#if removingEmail === email}
									<Loader2 class="w-4 h-4 animate-spin" />
								{:else}
									<Trash2 class="w-4 h-4" />
								{/if}
							</button>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<ConfirmDialog
	open={confirmState?.open ?? false}
	title={confirmState?.title ?? 'Are you sure?'}
	message={confirmState?.message ?? ''}
	confirmLabel="Yes, Remove"
	cancelLabel="No, Cancel"
	onconfirm={() => {
		const action = confirmState?.action;
		confirmState = null;
		action?.();
	}}
	oncancel={() => {
		confirmState = null;
	}}
/>
