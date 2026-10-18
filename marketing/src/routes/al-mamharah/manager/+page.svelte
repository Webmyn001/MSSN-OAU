<script>
	import SEO from '$lib/components/SEO.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import ManagerLogin from '$lib/components/al-mamharah/manager/ManagerLogin.svelte';
	import OverviewPanel from '$lib/components/al-mamharah/manager/OverviewPanel.svelte';
	import ApplicationsPanel from '$lib/components/al-mamharah/manager/ApplicationsPanel.svelte';
	import ParticipantsPanel from '$lib/components/al-mamharah/manager/ParticipantsPanel.svelte';
	import DailyPanel from '$lib/components/al-mamharah/manager/DailyPanel.svelte';
	import LeaderboardPanel from '$lib/components/al-mamharah/manager/LeaderboardPanel.svelte';
	import ManagersPanel from '$lib/components/al-mamharah/manager/ManagersPanel.svelte';
	import SettingsPanel from '$lib/components/al-mamharah/manager/SettingsPanel.svelte';
	import AuditPanel from '$lib/components/al-mamharah/manager/AuditPanel.svelte';
	import { Loader2, LogOut } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import {
		getManagerToken,
		getManagerInfo,
		getManagerMe,
		saveManagerSession,
		clearManagerSession,
		AlMamharahError
	} from '$lib/api/al-mamharah.js';
	import { managerRoleLabel } from '$lib/data/al-mamharah.js';

	let token = $state(/** @type {string | null} */ (null));
	let manager = $state(/** @type {any} */ (null));
	let checking = $state(true);
	let tab = $state('overview');

	const tabs = [
		{ value: 'overview', label: 'Overview' },
		{ value: 'applications', label: 'Applications' },
		{ value: 'participants', label: 'Participants' },
		{ value: 'daily', label: 'Daily progress' },
		{ value: 'leaderboard', label: 'Leaderboard' },
		{ value: 'managers', label: 'Managers' },
		{ value: 'settings', label: 'Settings' },
		{ value: 'audit', label: 'Audit' }
	];

	function onExpired() {
		clearManagerSession();
		token = null;
		manager = null;
		toast.error('Your session has expired. Please sign in again.');
	}

	function onLoginSuccess(/** @type {string} */ newToken, /** @type {any} */ info) {
		token = newToken;
		manager = info;
	}

	function logout() {
		clearManagerSession();
		token = null;
		manager = null;
		toast.success('Signed out.');
	}

	onMount(async () => {
		const existing = getManagerToken();
		if (!existing) {
			checking = false;
			return;
		}
		try {
			const result = await getManagerMe(existing);
			token = existing;
			manager = result.data ?? getManagerInfo();
		} catch (err) {
			if (err instanceof AlMamharahError) {
				clearManagerSession();
			}
		} finally {
			checking = false;
		}
	});
</script>

<SEO
	title="Al-Mamharah — Programme Manager"
	description="Manage Al-Mamharah applications, participants, daily progress and settings."
	path="/al-mamharah/manager/"
/>

<section class="relative min-h-[60vh] overflow-hidden py-10 sm:py-12">
	<div class="absolute -top-24 -right-24 size-96 rounded-full bg-primary-500/10 blur-3xl"></div>
	<div class="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		{#if checking}
			<div class="flex justify-center py-24">
				<Loader2 class="size-10 animate-spin text-primary-600" />
			</div>
		{:else if !token || !manager}
			<ManagerLogin onSuccess={onLoginSuccess} />
		{:else}
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 class="font-secondary text-2xl font-bold text-primary-800 sm:text-3xl">
						Al-Mamharah Manager
					</h1>
					<p class="mt-1 text-sm text-gray-600">
						{manager.fullName || manager.email}
						<span class="text-gray-400">·</span>
						{managerRoleLabel(manager.role)}
					</p>
				</div>
				<Button variant="outline" size="sm" onclick={logout}>
					<LogOut class="size-4" /> Sign out
				</Button>
			</div>

			<div class="mt-6">
				<Tabs bind:value={tab}>
					<TabsList class="h-auto w-full flex-wrap justify-start gap-1 p-1">
						{#each tabs as t (t.value)}
							<TabsTrigger value={t.value}>{t.label}</TabsTrigger>
						{/each}
					</TabsList>

					<TabsContent value="overview" class="mt-6">
						<OverviewPanel {token} {onExpired} />
					</TabsContent>
					<TabsContent value="applications" class="mt-6">
						<ApplicationsPanel {token} {onExpired} />
					</TabsContent>
					<TabsContent value="participants" class="mt-6">
						<ParticipantsPanel {token} {onExpired} />
					</TabsContent>
					<TabsContent value="daily" class="mt-6">
						<DailyPanel {token} {onExpired} />
					</TabsContent>
					<TabsContent value="leaderboard" class="mt-6">
						<LeaderboardPanel {token} {onExpired} />
					</TabsContent>
					<TabsContent value="managers" class="mt-6">
						<ManagersPanel {token} {onExpired} />
					</TabsContent>
					<TabsContent value="settings" class="mt-6">
						<SettingsPanel {token} {onExpired} />
					</TabsContent>
					<TabsContent value="audit" class="mt-6">
						<AuditPanel {token} {onExpired} />
					</TabsContent>
				</Tabs>
			</div>
		{/if}
	</div>
</section>
