<script>
	import { Button } from '$lib/components/ui/button';
	import { Loader2, KeyRound, ArrowLeft, AlertCircle, MailCheck } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import {
		enterProgramme,
		verifyEnterCode,
		saveParticipantSession
	} from '$lib/api/al-mamharah.js';

	let step = $state(1);
	let fullName = $state('');
	let code = $state('');
	let isSubmitting = $state(false);
	let formError = $state(/** @type {string | null} */ (null));
	let notVerified = $state(
		/** @type {{ message: string, messageAr: string } | null} */ (null)
	);
	let devCode = $state(/** @type {string | null} */ (null));
	let infoMessage = $state(/** @type {string | null} */ (null));

	async function requestCode(/** @type {SubmitEvent} */ event) {
		event.preventDefault();
		formError = null;
		notVerified = null;
		if (fullName.trim().length < 2) {
			formError = 'Please enter your full name exactly as submitted.';
			return;
		}
		isSubmitting = true;
		try {
			const result = await enterProgramme(fullName.trim());
			const data = result.data ?? {};
			if (data.status === 'code_sent') {
				step = 2;
				infoMessage = data.message ?? 'A 6-digit code has been sent to your email.';
				devCode = data.devCode ?? null;
				toast.success('Verification code sent.');
			} else {
				notVerified = {
					message: data.message ?? 'Your participation has not yet been verified.',
					messageAr: data.messageAr ?? ''
				};
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Something went wrong. Please try again.';
			formError = message;
			toast.error(message);
		} finally {
			isSubmitting = false;
		}
	}

	async function submitCode(/** @type {SubmitEvent} */ event) {
		event.preventDefault();
		formError = null;
		if (!/^\d{6}$/.test(code.trim())) {
			formError = 'Enter the 6-digit code from your email.';
			return;
		}
		isSubmitting = true;
		try {
			const result = await verifyEnterCode(fullName.trim(), code.trim());
			const { token, participant } = result.data ?? {};
			saveParticipantSession(token, participant);
			toast.success("Welcome back! Opening your dashboard...");
			await goto('/al-mamharah/dashboard/');
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'That code is invalid or has expired.';
			formError = message;
			toast.error(message);
		} finally {
			isSubmitting = false;
		}
	}

	function back() {
		step = 1;
		code = '';
		devCode = null;
		infoMessage = null;
		formError = null;
	}

	const inputClass =
		'py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm focus:border-primary-600 focus:ring-primary-600 disabled:opacity-50 shadow-sm';
	const labelClass = 'block mb-2 text-sm text-gray-700 font-medium font-primary';
</script>

<div
	id="enter"
	class="flex flex-col rounded-xl border border-gray-200 bg-white/90 p-4 shadow-md backdrop-blur-sm sm:p-6 lg:p-8"
>
	<h2 class="mb-2 font-secondary text-xl font-semibold text-primary-700">Enter Programme</h2>
	<p class="mb-6 text-sm text-gray-600">
		Approved participants can access their dashboard here. Enter your full name, then the code we
		email you.
	</p>

	{#if step === 1}
		<form onsubmit={requestCode} class="grid gap-4">
			<div>
				<label class={labelClass} for="almh-enter-name">Full Name <span class="text-red-500">*</span></label>
				<input
					id="almh-enter-name"
					name="fullName"
					type="text"
					required
					autocomplete="name"
					class={inputClass}
					bind:value={fullName}
					placeholder="Exactly as on your application"
				/>
			</div>

			{#if notVerified}
				<div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
					<div class="flex items-start gap-2">
						<AlertCircle class="mt-0.5 size-4 shrink-0" />
						<div class="space-y-1">
							<p>{notVerified.message}</p>
							{#if notVerified.messageAr}
								<p class="text-right font-secondary" dir="rtl" lang="ar">{notVerified.messageAr}</p>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			{#if formError}
				<div class="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
					<AlertCircle class="mt-0.5 size-4 shrink-0" />
					<p>{formError}</p>
				</div>
			{/if}

			<Button type="submit" class="w-full" disabled={isSubmitting}>
				{#if isSubmitting}
					<Loader2 class="mr-2 size-4 animate-spin" />
					<span>Checking...</span>
				{:else}
					<KeyRound class="mr-2 size-4" />
					<span>Send me a code</span>
				{/if}
			</Button>
		</form>
	{:else}
		<form onsubmit={submitCode} class="grid gap-4">
			<div class="flex items-start gap-2 rounded-lg border border-primary-100 bg-primary-50/60 p-3 text-sm text-primary-800">
				<MailCheck class="mt-0.5 size-4 shrink-0" />
				<p>{infoMessage}</p>
			</div>

			{#if devCode}
				<div class="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
					Development mode — your code is <span class="font-mono font-semibold">{devCode}</span>.
					This hint is never shown in production.
				</div>
			{/if}

			<div>
				<label class={labelClass} for="almh-enter-code">6-digit code <span class="text-red-500">*</span></label>
				<input
					id="almh-enter-code"
					name="code"
					type="text"
					required
					inputmode="numeric"
					autocomplete="one-time-code"
					maxlength="6"
					pattern="[0-9]{6}"
					class="{inputClass} text-center font-mono text-lg tracking-[0.5em]"
					bind:value={code}
					placeholder="000000"
				/>
			</div>

			{#if formError}
				<div class="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
					<AlertCircle class="mt-0.5 size-4 shrink-0" />
					<p>{formError}</p>
				</div>
			{/if}

			<div class="flex flex-col gap-2 sm:flex-row">
				<Button type="submit" class="flex-1" disabled={isSubmitting}>
					{#if isSubmitting}
						<Loader2 class="mr-2 size-4 animate-spin" />
						<span>Verifying...</span>
					{:else}
						<span>Enter Dashboard</span>
					{/if}
				</Button>
				<Button type="button" variant="outline" onclick={back} class="sm:w-auto">
					<ArrowLeft class="mr-2 size-4" />
					Back
				</Button>
			</div>
		</form>
	{/if}
</div>
