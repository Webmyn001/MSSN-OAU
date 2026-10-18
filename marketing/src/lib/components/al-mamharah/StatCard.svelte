<script>
	/**
	 * Small metric tile used across the dashboard and manager overview.
	 * @type {{
	 *   label: string,
	 *   value: string | number,
	 *   hint?: string,
	 *   tone?: 'primary' | 'amber' | 'emerald' | 'slate' | 'rose'
	 * }}
	 */
	let { label, value, hint = '', tone = 'primary' } = $props();

	const tones = {
		primary: 'from-primary-500/10 to-primary-700/5 text-primary-700 border-primary-100',
		amber: 'from-amber-500/10 to-amber-600/5 text-amber-700 border-amber-100',
		emerald: 'from-emerald-500/10 to-emerald-600/5 text-emerald-700 border-emerald-100',
		slate: 'from-slate-500/10 to-slate-600/5 text-slate-700 border-slate-100',
		rose: 'from-rose-500/10 to-rose-600/5 text-rose-700 border-rose-100'
	};
</script>

<div class="rounded-xl border {tones[tone]} bg-gradient-to-br p-4 shadow-sm">
	<p class="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
	<p class="mt-1 font-secondary text-2xl font-bold">{value}</p>
	{#if hint}
		<p class="mt-0.5 text-xs opacity-70">{hint}</p>
	{/if}
</div>
