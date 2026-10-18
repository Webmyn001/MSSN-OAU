<script>
	import { Button } from '$lib/components/ui/button';
	import { Loader2, LogIn, AlertCircle, ShieldCheck } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { managerLogin, saveManagerSession } from '$lib/api/al-mamharah.js';

	/** @type {{ onSuccess: (token: string, manager: any) => void }} */
	let { onSuccess } = $props();

	let email = $state('');
	let password = $state('');
	let isSubmitting = $state(false);
	let formError = $state(/** @type {string | null} */ (null));

	async function submit(/** @type {SubmitEvent} */ event) {
		event.preventDefault();
		formError = null;
		isSubmitting = true;
		try {
			const result = await managerLogin(email.trim(), password);
			const { token, manager } = result.data ?? {};
			saveManagerSession(token, manager);
			toast.success('Signed in.');
			onSuccess(token, manager);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Invalid email or password.';
			formError = message;
			toast.error(message);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="mx-auto max-w-md rounded-xl border border-primary-100 bg-white/90 p-6 shadow-md sm:p-8">
	<div class="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
		<ShieldCheck class="size-7" />
	</div>
	<h1 class="mt-4 text-center font-secondary text-xl font-semibold text-primary-800">
		Programme Manager
	</h1>
	<p class="mt-2 text-center text-sm text-gray-600">
		Sign in to review applications and monitor participants.
	</p>

	<form onsubmit={submit} class="mt-6 grid gap-4">
		<div>
			<label class="mb-2 block text-sm font-medium text-gray-700" for="almh-mgr-email">Email</label>
			<input
				id="almh-mgr-email"
				type="email"
				required
				autocomplete="username"
				class="block w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-primary-600 focus:ring-primary-600"
				bind:value={email}
				placeholder="manager@example.com"
			/>
		</div>
		<div>
			<label class="mb-2 block text-sm font-medium text-gray-700" for="almh-mgr-password">Password</label>
			<input
				id="almh-mgr-password"
				type="password"
				required
				autocomplete="current-password"
				class="block w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-primary-600 focus:ring-primary-600"
				bind:value={password}
				placeholder="••••••••"
			/>
		</div>

		{#if formError}
			<div class="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
				<AlertCircle class="mt-0.5 size-4 shrink-0" />
				<p>{formError}</p>
			</div>
		{/if}

		<Button type="submit" class="w-full" disabled={isSubmitting}>
			{#if isSubmitting}
				<Loader2 class="size-4 animate-spin" />
				Signing in...
			{:else}
				<LogIn class="size-4" />
				Sign in
			{/if}
		</Button>
	</form>

	<p class="mt-4 text-center text-xs text-gray-500">
		Invited as a manager? Use the activation link sent to your email.
	</p>
</div>
