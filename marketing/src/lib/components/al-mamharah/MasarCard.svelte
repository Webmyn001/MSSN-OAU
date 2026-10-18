<script>
	import { BookOpen } from '@lucide/svelte';

	/** @type {{ option: { value: string, label: string, labelAr: string, daily: string, description: string } }} */
	let { option } = $props();
</script>

<div
	class="group flex h-full flex-col rounded-xl border border-primary-100 bg-white/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-md"
>
	<div class="flex items-start justify-between gap-3">
		<div class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
			<BookOpen class="size-5" />
		</div>
		<span class="font-secondary text-lg text-primary-600" dir="rtl" lang="ar">{option.labelAr}</span>
	</div>
	<h3 class="mt-4 font-secondary text-base font-semibold text-primary-800">{option.label}</h3>
	<p class="mt-1 text-xs font-medium text-primary-600">{option.daily}</p>
	<p class="mt-3 flex-1 text-sm leading-relaxed text-gray-600">{option.description}</p>
</div>
