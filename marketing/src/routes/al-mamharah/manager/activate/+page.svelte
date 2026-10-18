<script>
	import SEO from '$lib/components/SEO.svelte';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { CheckCircle2, AlertCircle, Loader2, ShieldCheck, KeyRound } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { validateActivation, activateManager } from '$lib/api/al-mamharah.js';

	let checking = $state(true);
	let valid = $state(false);
	let email = $state('');
	let token = $state('');
	let fullName = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let submitting = $state(false);
	let formError = $state(/** @type {string | null} */ (null));
	let done = $state(false);

	onMount(async () => {
		token = page.url.searchParams.get('token') ?? '';
		if (!token) {
			checking = false;
			return;
		}
		try {
			const result = await validateActivation(token);
			const data = result.data ?? {};
			valid = Boolean(data.valid);
			email = data.email ?? '';
			fullName = data.fullName ?? '';
		} catch {
			valid = false;
		} finally {
			checking = false;
		}
	});

	async function submit(/** @type {SubmitEvent} */ event) {
		event.preventDefault();
		formError = null;
		if (password.length < 8) {
			formError = 'Password must be at least 8 characters.';
			return;
		}
		if (password !== confirmPassword) {
			formError = 'Passwords do not match.';
			return;
		}
		submitting = true;
		try {
			await activateManager(token, password, fullName.trim() || undefined);
			done = true;
			toast.success('Your account is now active.');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Activation failed.';
			formError = message;
			toast.error(message);
		} finally {
			submitting = false;
		}
	}

	const inputClass =
		'block w-full rounded-lg border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-primary-600 focus:ring-primary-600';
</script>

<SEO
	title="Activate Manager Account"
	description="Activate your Al-Mamharah Programme Manager account by setting a password."
	path="/al-mamharah/manager/activate/"
/>

<section class="relative overflow-hidden py-12">
	<div class="absolute -top-24 -right-24 size-96 rounded-full bg-primary-500/10 blur-3xl"></div>
	<div class="relative z-10 mx-auto max-w-md px-4 sm:px-6">
		{#if checking}
			<div class="flex justify-center py-24">
				<Loader2 class="size-10 animate-spin text-primary-600" />
			</div>
		{:else if done}
			<div class="rounded-xl border border-primary-100 bg-white/90 p-8 text-center shadow-md">
				<div class="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
					<CheckCircle2 class="size-8 text-green-600" />
				</div>
				<h1 class="mt-4 font-secondary text-xl font-semibold text-primary-800">Account activated</h1>
				<p class="mt-2 text-sm text-gray-600">
					You can now sign in to the Programme Manager area with your email and password.
				</p>
				<div class="mt-6">
					<Button href="/al-mamharah/manager/" class="w-full">Go to Manager sign in</Button>
				</div>
			</div>
		{:else if !token || !valid}
			<div class="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
				<div class="mx-auto flex size-14 items-center justify-center rounded-full bg-red-100">
					<AlertCircle class="size-7 text-red-600" />
				</div>
				<h1 class="mt-4 font-secondary text-lg font-semibold text-red-800">Invalid or expired link</h1>
				<p class="mt-2 text-sm text-red-700">
					This activation link is invalid, has already been used, or has expired. Please ask the
					primary manager to send a new invitation.
				</p>
				<div class="mt-6">
					<Button href="/al-mamharah/manager/" variant="outline" class="w-full">Manager sign in</Button>
				</div>
			</div>
		{:else}
			<div class="rounded-xl border border-primary-100 bg-white/90 p-6 shadow-md sm:p-8">
				<div class="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
					<ShieldCheck class="size-7" />
				</div>
				<h1 class="mt-4 text-center font-secondary text-xl font-semibold text-primary-800">
					Set your password
				</h1>
				<p class="mt-2 text-center text-sm text-gray-600">
					Activating the manager account for <b>{email}</b>.
				</p>

				<form onsubmit={submit} class="mt-6 grid gap-4">
					<div>
						<label class="mb-2 block text-sm font-medium text-gray-700" for="act-name">Full name (optional)</label>
						<input id="act-name" type="text" class={inputClass} bind:value={fullName} placeholder="Your name" />
					</div>
					<div>
						<label class="mb-2 block text-sm font-medium text-gray-700" for="act-password">Password</label>
						<input
							id="act-password"
							type="password"
							required
							minlength="8"
							autocomplete="new-password"
							class={inputClass}
							bind:value={password}
							placeholder="At least 8 characters"
						/>
					</div>
					<div>
						<label class="mb-2 block text-sm font-medium text-gray-700" for="act-confirm">Confirm password</label>
						<input
							id="act-confirm"
							type="password"
							required
							minlength="8"
							autocomplete="new-password"
							class={inputClass}
							bind:value={confirmPassword}
							placeholder="Re-enter your password"
						/>
					</div>

					{#if formError}
						<div class="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
							<AlertCircle class="mt-0.5 size-4 shrink-0" /><p>{formError}</p>
						</div>
					{/if}

					<Button type="submit" class="w-full" disabled={submitting}>
						{#if submitting}
							<Loader2 class="size-4 animate-spin" /> Activating...
						{:else}
							<KeyRound class="size-4" /> Activate my account
						{/if}
					</Button>
				</form>
			</div>
		{/if}
	</div>
</section>
