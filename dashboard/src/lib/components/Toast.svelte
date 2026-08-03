<script lang="ts">
	import { toasts, dismiss, type ToastType } from '$lib/stores/toast.svelte';
	import { CheckCircle2, AlertCircle, X } from '@lucide/svelte';

	const typeStyles: Record<ToastType, string> = {
		success: 'bg-green-50 border-green-300 text-green-900',
		error: 'bg-rose-50 border-rose-300 text-rose-900'
	};
</script>

{#if toasts.length > 0}
	<div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
		{#each toasts as t (t.id)}
			<div
				class={`pointer-events-auto p-4 rounded-xl border shadow-lg flex items-center justify-between text-xs font-semibold transition-all animate-[toastIn_0.2s_ease-out] ${typeStyles[t.type]}`}
			>
				<div class="flex items-center space-x-2.5">
					{#if t.type === 'success'}
						<CheckCircle2 class="w-5 h-5 text-green-600 shrink-0" />
					{:else}
						<AlertCircle class="w-5 h-5 text-rose-600 shrink-0" />
					{/if}
					<span>{t.message}</span>
				</div>
				<button onclick={() => dismiss(t.id)} class="text-gray-400 hover:text-gray-700 p-1 shrink-0">
					<X class="w-4 h-4" />
				</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	@keyframes toastIn {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
