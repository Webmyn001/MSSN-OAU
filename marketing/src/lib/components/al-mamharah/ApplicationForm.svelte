<script>
	import { Button } from '$lib/components/ui/button';
	import { Loader2, CheckCircle2, AlertCircle } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { submitApplication } from '$lib/api/al-mamharah.js';
	import { MASAR_OPTIONS } from '$lib/data/al-mamharah.js';

	/** @type {{ onSubmitted?: (payload: any) => void }} */
	let { onSubmitted } = $props();

	let isSubmitting = $state(false);
	let submissionMessage = $state(/** @type {string | null} */ (null));
	let formError = $state(/** @type {string | null} */ (null));

	let formData = $state({
		fullName: '',
		email: '',
		phone: '',
		matricNumber: '',
		faculty: '',
		department: '',
		masar: '',
		confirmedMemorisation: false,
		confirmedTajweed: false,
		agreedGuidelines: false
	});

	async function handleSubmit(/** @type {SubmitEvent} */ event) {
		event.preventDefault();
		formError = null;

		if (!formData.masar) {
			formError = 'Please choose a masār (revision track).';
			return;
		}
		if (!formData.confirmedMemorisation || !formData.confirmedTajweed || !formData.agreedGuidelines) {
			formError = 'Please confirm all eligibility statements and agree to the guidelines.';
			return;
		}

		isSubmitting = true;
		try {
			const result = await submitApplication({
				fullName: formData.fullName.trim(),
				email: formData.email.trim(),
				phone: formData.phone.trim() || undefined,
				matricNumber: formData.matricNumber.trim(),
				faculty: formData.faculty.trim(),
				department: formData.department.trim(),
				masar: formData.masar,
				confirmedMemorisation: formData.confirmedMemorisation,
				confirmedTajweed: formData.confirmedTajweed,
				agreedGuidelines: formData.agreedGuidelines
			});
			submissionMessage = result.data?.message ?? 'Your application has been received.';
			toast.success('Application submitted successfully.');
			onSubmitted?.(result.data);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Something went wrong. Please try again.';
			formError = message;
			toast.error(message);
		} finally {
			isSubmitting = false;
		}
	}

	const inputClass =
		'py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm focus:border-primary-600 focus:ring-primary-600 disabled:opacity-50 shadow-sm';
	const labelClass = 'block mb-2 text-sm text-gray-700 font-medium font-primary';
</script>

<div
	id="apply"
	class="flex flex-col rounded-xl border border-gray-200 bg-white/90 p-4 shadow-md backdrop-blur-sm sm:p-6 lg:p-8"
>
	<h2 class="mb-2 font-secondary text-xl font-semibold text-primary-700">Apply to Al-Mamharah</h2>
	<p class="mb-6 text-sm text-gray-600">
		Submit your details and the Programme Manager will review your application.
	</p>

	{#if submissionMessage}
		<div class="py-8 text-center">
			<div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
				<CheckCircle2 class="size-8 text-green-600" />
			</div>
			<h3 class="mb-2 text-lg font-medium text-gray-900">Application received</h3>
			<p class="mx-auto mb-6 max-w-md text-sm text-gray-600">{submissionMessage}</p>
			<p class="text-xs text-gray-500">
				Once approved, you will be able to enter the programme using your full name and a code sent
				to your email.
			</p>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="grid gap-4 lg:gap-5">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
				<div>
					<label class={labelClass} for="almh-fullName">Full Name <span class="text-red-500">*</span></label>
					<input
						id="almh-fullName"
						name="fullName"
						type="text"
						required
						autocomplete="name"
						class={inputClass}
						bind:value={formData.fullName}
						placeholder="As it should appear on your certificate"
					/>
				</div>
				<div>
					<label class={labelClass} for="almh-matric">Matriculation Number <span class="text-red-500">*</span></label>
					<input
						id="almh-matric"
						name="matricNumber"
						type="text"
						required
						class={inputClass}
						bind:value={formData.matricNumber}
						placeholder="e.g. HCS/2021/001"
					/>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
				<div>
					<label class={labelClass} for="almh-email">Email Address <span class="text-red-500">*</span></label>
					<input
						id="almh-email"
						name="email"
						type="email"
						required
						autocomplete="email"
						class={inputClass}
						bind:value={formData.email}
						placeholder="you@example.com"
					/>
				</div>
				<div>
					<label class={labelClass} for="almh-phone">Phone Number <span class="text-gray-400">(optional)</span></label>
					<input
						id="almh-phone"
						name="phone"
						type="tel"
						autocomplete="tel"
						class={inputClass}
						bind:value={formData.phone}
						placeholder="e.g. 0803 000 0000"
					/>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
				<div>
					<label class={labelClass} for="almh-faculty">Faculty <span class="text-red-500">*</span></label>
					<input
						id="almh-faculty"
						name="faculty"
						type="text"
						required
						class={inputClass}
						bind:value={formData.faculty}
						placeholder="e.g. Faculty of Science"
					/>
				</div>
				<div>
					<label class={labelClass} for="almh-department">Department <span class="text-red-500">*</span></label>
					<input
						id="almh-department"
						name="department"
						type="text"
						required
						class={inputClass}
						bind:value={formData.department}
						placeholder="e.g. Computer Science"
					/>
				</div>
			</div>

			<div>
				<label class={labelClass} for="almh-masar">Masār (Revision Track) <span class="text-red-500">*</span></label>
				<select id="almh-masar" name="masar" required class={inputClass} bind:value={formData.masar}>
					<option value="" disabled>Select your daily target</option>
					{#each MASAR_OPTIONS as option (option.value)}
						<option value={option.value}>{option.label} — {option.daily}</option>
					{/each}
				</select>
			</div>

			<div class="space-y-3 rounded-lg border border-primary-100 bg-primary-50/50 p-4">
				<label class="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
					<input
						type="checkbox"
						class="mt-0.5 size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
						bind:checked={formData.confirmedMemorisation}
					/>
					<span>I confirm that I have completed the memorisation of the Qurʼān.</span>
				</label>
				<label class="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
					<input
						type="checkbox"
						class="mt-0.5 size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
						bind:checked={formData.confirmedTajweed}
					/>
					<span>I confirm that I have studied tajwīd and can recite with correct pronunciation.</span>
				</label>
				<label class="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
					<input
						type="checkbox"
						class="mt-0.5 size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
						bind:checked={formData.agreedGuidelines}
					/>
					<span>I have read and agree to the programme guidelines.</span>
				</label>
			</div>

			{#if formError}
				<div class="mt-1 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
					<AlertCircle class="mt-0.5 size-4 shrink-0" />
					<p>{formError}</p>
				</div>
			{/if}

			<div class="mt-2">
				<Button type="submit" class="w-full" disabled={isSubmitting}>
					{#if isSubmitting}
						<Loader2 class="mr-2 size-4 animate-spin" />
						<span>Submitting...</span>
					{:else}
						Submit Application
					{/if}
				</Button>
			</div>
		</form>
	{/if}
</div>
